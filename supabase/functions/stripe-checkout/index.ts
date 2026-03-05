import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.97.0';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

type BillingAction =
  | 'get_pricing'
  | 'create_checkout_session'
  | 'create_billing_portal_session'
  | 'sync_checkout_session'
  | 'create_upgrade_request';

type AuthenticatedContext = {
  adminClient: SupabaseClient;
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown> | null;
  };
};

type StripePricePayload = {
  id: string;
  active: boolean;
  unit_amount: number | null;
  currency: string;
  recurring?: {
    interval: string;
    interval_count: number;
  } | null;
};

type FeeConfig = {
  percent: number;
  fixedCents: number;
};

type FeeBreakdown = {
  feeAmount: number;
  totalAmount: number;
};

type StripeSessionPayload = {
  id: string;
  url?: string;
  customer?: string | null;
  client_reference_id?: string | null;
  metadata?: Record<string, string>;
  subscription?: string | StripeSubscriptionPayload | null;
};

type StripeSubscriptionPayload = {
  id: string;
  status: string;
  customer: string;
  metadata?: Record<string, string>;
  cancel_at_period_end?: boolean;
  current_period_end?: number | null;
  canceled_at?: number | null;
  items?: {
    data?: Array<{
      price?: {
        id?: string;
      } | null;
    }>;
  } | null;
};

class HttpError extends Error {
  readonly status: number;
  readonly payload: Record<string, unknown>;

  constructor(status: number, message: string, payload: Record<string, unknown> = {}) {
    super(message);
    this.status = status;
    this.payload = {
      error: message,
      ...payload,
    };
  }
}

function readEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new HttpError(500, `Missing required environment variable: ${name}`);
  }
  return value;
}

function readOptionalEnv(name: string): string | null {
  const value = Deno.env.get(name);
  return value ? value.trim() : null;
}

function normalizeOrigin(origin: string | null | undefined): string | null {
  if (!origin) return null;

  try {
    const parsed = new URL(origin);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return null;
  }
}

function normalizeAbsoluteUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    return new URL(value).toString();
  } catch {
    return null;
  }
}

function toIsoFromUnixSeconds(value: number | null | undefined): string | null {
  if (!value || Number.isNaN(value)) return null;
  return new Date(value * 1000).toISOString();
}

function isActiveSubscriptionStatus(status: string): boolean {
  return status === 'active' || status === 'trialing' || status === 'past_due';
}

function readFeeConfig(): FeeConfig {
  const percent = Number.parseFloat(readOptionalEnv('STRIPE_FEE_PERCENT') ?? '0');
  const fixedCents = Number.parseInt(readOptionalEnv('STRIPE_FEE_FIXED_CENTS') ?? '0', 10);

  return {
    percent: Number.isFinite(percent) ? Math.max(0, percent) : 0,
    fixedCents: Number.isFinite(fixedCents) ? Math.max(0, fixedCents) : 0,
  };
}

function calculateFeeBreakdown(baseAmount: number, feeConfig: FeeConfig): FeeBreakdown {
  const feeAmount = Math.max(
    0,
    Math.round(baseAmount * (feeConfig.percent / 100)) + feeConfig.fixedCents,
  );

  return {
    feeAmount,
    totalAmount: baseAmount + feeAmount,
  };
}

async function stripeApiRequest<T>(
  secretKey: string,
  endpoint: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${secretKey}`);
  if (init.method && init.method !== 'GET') {
    headers.set('Content-Type', 'application/x-www-form-urlencoded');
  }

  const response = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    ...init,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof payload?.error?.message === 'string'
        ? payload.error.message
        : 'Stripe request failed';
    throw new HttpError(response.status, message, { code: 'STRIPE_REQUEST_FAILED' });
  }

  return payload as T;
}

async function requireAuthContext(req: Request): Promise<AuthenticatedContext> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new HttpError(401, 'Missing Authorization header', { code: 'AUTH_REQUIRED' });
  }

  const supabaseUrl = readEnv('SUPABASE_URL');
  const supabaseAnonKey = readEnv('SUPABASE_ANON_KEY');
  const serviceRoleKey = readEnv('SUPABASE_SERVICE_ROLE_KEY');

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();

  if (authError || !user) {
    throw new HttpError(401, 'Unauthorized', { code: 'AUTH_REQUIRED' });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return {
    adminClient,
    user: {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata ?? null,
    },
  };
}

async function getUserDisplayName(
  adminClient: SupabaseClient,
  userId: string,
  fallbackMetadata: Record<string, unknown> | null | undefined,
): Promise<string | null> {
  const { data } = await adminClient
    .from('user_profiles')
    .select('name')
    .eq('user_id', userId)
    .maybeSingle();

  const profileName = (data as { name?: string | null } | null)?.name;
  if (profileName && profileName.trim().length > 0) return profileName.trim();

  const metadataName =
    typeof fallbackMetadata?.full_name === 'string'
      ? fallbackMetadata.full_name
      : typeof fallbackMetadata?.name === 'string'
        ? fallbackMetadata.name
        : typeof fallbackMetadata?.username === 'string'
          ? fallbackMetadata.username
          : null;

  return metadataName?.trim() || null;
}

async function getOrCreateStripeCustomer(
  adminClient: SupabaseClient,
  stripeSecretKey: string,
  user: AuthenticatedContext['user'],
): Promise<string> {
  const { data: existingCustomer, error: lookupError } = await adminClient
    .from('billing_customers')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (lookupError) {
    throw new HttpError(500, `Failed to read billing customer: ${lookupError.message}`);
  }

  const stripeCustomerId = (existingCustomer as { stripe_customer_id?: string } | null)
    ?.stripe_customer_id;
  if (stripeCustomerId) return stripeCustomerId;

  const displayName = await getUserDisplayName(adminClient, user.id, user.user_metadata);
  const body = new URLSearchParams();
  if (user.email) body.set('email', user.email);
  if (displayName) body.set('name', displayName);
  body.set('metadata[supabase_user_id]', user.id);

  const customer = await stripeApiRequest<{ id: string }>(stripeSecretKey, '/customers', {
    method: 'POST',
    body: body.toString(),
  });

  const { error: upsertError } = await adminClient.from('billing_customers').upsert(
    {
      user_id: user.id,
      stripe_customer_id: customer.id,
      email: user.email ?? null,
    },
    { onConflict: 'user_id' },
  );

  if (upsertError) {
    throw new HttpError(500, `Failed to store Stripe customer: ${upsertError.message}`);
  }

  return customer.id;
}

async function setUserProPlan(
  adminClient: SupabaseClient,
  userId: string,
  status: string,
  expiresAt: string | null,
): Promise<'free' | 'pro'> {
  const isPro = isActiveSubscriptionStatus(status);
  const nextPlan: 'free' | 'pro' = isPro ? 'pro' : 'free';

  const { error: entitlementError } = await adminClient.from('user_entitlements').upsert(
    {
      user_id: userId,
      plan_id: nextPlan,
      active: isPro,
      expires_at: isPro ? expiresAt : null,
    },
    { onConflict: 'user_id' },
  );

  if (entitlementError) {
    throw new HttpError(500, `Failed to update entitlement: ${entitlementError.message}`);
  }

  const { error: profileError } = await adminClient.from('user_profiles').upsert(
    {
      user_id: userId,
      plan: nextPlan,
    },
    { onConflict: 'user_id' },
  );

  if (profileError) {
    throw new HttpError(500, `Failed to update profile plan: ${profileError.message}`);
  }

  return nextPlan;
}

async function persistStripeSubscription(
  adminClient: SupabaseClient,
  userId: string,
  subscription: StripeSubscriptionPayload,
): Promise<void> {
  const priceId = subscription.items?.data?.[0]?.price?.id ?? null;
  const currentPeriodEnd = toIsoFromUnixSeconds(subscription.current_period_end);
  const canceledAt = toIsoFromUnixSeconds(subscription.canceled_at);

  const { error } = await adminClient.from('billing_subscriptions').upsert(
    {
      stripe_subscription_id: subscription.id,
      user_id: userId,
      stripe_customer_id: subscription.customer,
      status: subscription.status,
      price_id: priceId,
      cancel_at_period_end: !!subscription.cancel_at_period_end,
      current_period_end: currentPeriodEnd,
      canceled_at: canceledAt,
      raw_event: subscription as unknown as Record<string, unknown>,
    },
    { onConflict: 'stripe_subscription_id' },
  );

  if (error) {
    throw new HttpError(500, `Failed to store subscription: ${error.message}`);
  }
}

async function registerUpgradeRequest(
  adminClient: SupabaseClient,
  payload: {
    userId: string;
    method: 'stripe' | 'sepa_transfer' | 'invoice';
    contactEmail: string | null;
    notes?: string | null;
    amountCents?: number | null;
    currency?: string | null;
    stripeCheckoutSessionId?: string | null;
    stripeSubscriptionId?: string | null;
    externalPaymentReference?: string | null;
    status?: 'pending' | 'approved' | 'paid' | 'rejected' | 'canceled';
  },
): Promise<void> {
  const { error } = await adminClient.from('pro_upgrade_requests').insert({
    user_id: payload.userId,
    method: payload.method,
    status: payload.status ?? 'pending',
    requested_plan: 'pro',
    contact_email: payload.contactEmail,
    notes: payload.notes ?? null,
    amount_cents: payload.amountCents ?? null,
    currency: payload.currency ?? 'eur',
    stripe_checkout_session_id: payload.stripeCheckoutSessionId ?? null,
    stripe_subscription_id: payload.stripeSubscriptionId ?? null,
    external_payment_reference: payload.externalPaymentReference ?? null,
  });

  if (error) {
    throw new HttpError(500, `Failed to register upgrade request: ${error.message}`);
  }
}

function resolveAppOrigin(req: Request, requestedOrigin: string | null | undefined): string {
  const fromBody = normalizeOrigin(requestedOrigin);
  if (fromBody) return fromBody;

  const fromHeader = normalizeOrigin(req.headers.get('origin'));
  if (fromHeader) return fromHeader;

  const fromEnv = normalizeOrigin(readOptionalEnv('APP_BASE_URL'));
  if (fromEnv) return fromEnv;

  return 'http://localhost:5173';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const payload = (await req.json().catch(() => ({}))) as {
      action?: BillingAction;
      origin?: string;
      returnUrl?: string;
      sessionId?: string;
      coverFees?: boolean;
      method?: 'stripe' | 'sepa_transfer' | 'invoice';
      notes?: string;
    };

    const action = payload.action ?? 'get_pricing';
    const stripeSecretKey = readOptionalEnv('STRIPE_SECRET_KEY');
    const stripePriceId = readOptionalEnv('STRIPE_PRICE_ID');

    if (action === 'get_pricing') {
      if (!stripeSecretKey || !stripePriceId) {
        return jsonResponse({ enabled: false, price: null });
      }

      const price = await stripeApiRequest<StripePricePayload>(
        stripeSecretKey,
        `/prices/${encodeURIComponent(stripePriceId)}`,
      );

      return jsonResponse({
        enabled: true,
        price: {
          id: price.id,
          active: price.active,
          unitAmount: price.unit_amount,
          currency: price.currency,
          interval: price.recurring?.interval ?? null,
          intervalCount: price.recurring?.interval_count ?? null,
        },
        feeConfig: readFeeConfig(),
      });
    }

    if (
      action !== 'create_upgrade_request' &&
      (!stripeSecretKey || !stripePriceId)
    ) {
      return jsonResponse(
        {
          error:
            'Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID in Supabase Edge Function secrets.',
          disabled: true,
        },
        503,
      );
    }

    const auth = await requireAuthContext(req);
    const appOrigin = resolveAppOrigin(req, payload.origin);

    if (action === 'create_checkout_session') {
      const basePrice = await stripeApiRequest<StripePricePayload>(
        stripeSecretKey,
        `/prices/${encodeURIComponent(stripePriceId)}`,
      );

      if (!basePrice.unit_amount || !basePrice.currency) {
        throw new HttpError(500, 'Stripe price is missing unit amount or currency');
      }

      const shouldCoverFees = payload.coverFees === true;
      const feeConfig = readFeeConfig();
      const { feeAmount, totalAmount } = calculateFeeBreakdown(basePrice.unit_amount, feeConfig);
      const stripeCustomerId = await getOrCreateStripeCustomer(
        auth.adminClient,
        stripeSecretKey,
        auth.user,
      );
      const body = new URLSearchParams();
      body.set('mode', 'subscription');
      body.set('customer', stripeCustomerId);
      body.set('line_items[0][price]', stripePriceId);
      body.set('line_items[0][quantity]', '1');
      if (shouldCoverFees && feeAmount > 0 && basePrice.recurring?.interval) {
        body.set('line_items[1][price_data][currency]', basePrice.currency);
        body.set('line_items[1][price_data][unit_amount]', String(feeAmount));
        body.set(
          'line_items[1][price_data][recurring][interval]',
          basePrice.recurring.interval,
        );
        if (basePrice.recurring.interval_count > 1) {
          body.set(
            'line_items[1][price_data][recurring][interval_count]',
            String(basePrice.recurring.interval_count),
          );
        }
        body.set(
          'line_items[1][price_data][product_data][name]',
          'Payment processing fee',
        );
        body.set('line_items[1][quantity]', '1');
      }
      body.set('allow_promotion_codes', 'true');
      body.set('client_reference_id', auth.user.id);
      body.set('metadata[supabase_user_id]', auth.user.id);
      body.set('metadata[cover_fees]', shouldCoverFees ? 'true' : 'false');
      body.set('subscription_data[metadata][supabase_user_id]', auth.user.id);
      body.set('subscription_data[metadata][cover_fees]', shouldCoverFees ? 'true' : 'false');
      body.set('success_url', `${appOrigin}/pro/success?session_id={CHECKOUT_SESSION_ID}`);
      body.set('cancel_url', `${appOrigin}/pro/checkout?canceled=1`);

      const session = await stripeApiRequest<StripeSessionPayload>(stripeSecretKey, '/checkout/sessions', {
        method: 'POST',
        body: body.toString(),
      });

      if (!session.url) {
        throw new HttpError(500, 'Stripe did not return a checkout URL');
      }

      await registerUpgradeRequest(auth.adminClient, {
        userId: auth.user.id,
        method: 'stripe',
        contactEmail: auth.user.email ?? null,
        amountCents: shouldCoverFees ? totalAmount : basePrice.unit_amount,
        currency: basePrice.currency,
        stripeCheckoutSessionId: session.id,
        notes: shouldCoverFees
          ? `Customer accepted processing fee (${feeConfig.percent}% + ${feeConfig.fixedCents} cents).`
          : null,
      });

      return jsonResponse({ url: session.url });
    }

    if (action === 'create_upgrade_request') {
      const method = payload.method;
      if (method !== 'sepa_transfer' && method !== 'invoice') {
        throw new HttpError(400, 'method must be sepa_transfer or invoice');
      }

      const notes = typeof payload.notes === 'string' ? payload.notes.trim().slice(0, 1500) : null;
      let amountCents: number | null = null;
      let currency = 'eur';
      if (stripeSecretKey && stripePriceId) {
        const basePrice = await stripeApiRequest<StripePricePayload>(
          stripeSecretKey,
          `/prices/${encodeURIComponent(stripePriceId)}`,
        );
        amountCents = basePrice.unit_amount ?? null;
        currency = basePrice.currency ?? 'eur';
      }

      await registerUpgradeRequest(auth.adminClient, {
        userId: auth.user.id,
        method,
        contactEmail: auth.user.email ?? null,
        notes,
        amountCents,
        currency,
      });

      return jsonResponse({ ok: true });
    }

    if (action === 'create_billing_portal_session') {
      const stripeCustomerId = await getOrCreateStripeCustomer(
        auth.adminClient,
        stripeSecretKey,
        auth.user,
      );
      const returnUrl =
        normalizeAbsoluteUrl(payload.returnUrl) ??
        normalizeAbsoluteUrl(readOptionalEnv('STRIPE_BILLING_PORTAL_RETURN_URL')) ??
        `${appOrigin}/account`;

      const body = new URLSearchParams();
      body.set('customer', stripeCustomerId);
      body.set('return_url', returnUrl);

      const portalSession = await stripeApiRequest<{ url?: string }>(
        stripeSecretKey,
        '/billing_portal/sessions',
        {
          method: 'POST',
          body: body.toString(),
        },
      );

      if (!portalSession.url) {
        throw new HttpError(500, 'Stripe did not return a billing portal URL');
      }

      return jsonResponse({ url: portalSession.url });
    }

    if (action === 'sync_checkout_session') {
      if (!payload.sessionId || payload.sessionId.trim().length === 0) {
        throw new HttpError(400, 'sessionId is required');
      }

      const session = await stripeApiRequest<StripeSessionPayload>(
        stripeSecretKey,
        `/checkout/sessions/${encodeURIComponent(payload.sessionId)}?expand[]=subscription`,
      );

      const ownerId =
        session.client_reference_id ||
        session.metadata?.supabase_user_id ||
        (typeof session.subscription === 'object' ? session.subscription?.metadata?.supabase_user_id : null);

      if (!ownerId || ownerId !== auth.user.id) {
        throw new HttpError(403, 'This checkout session does not belong to the current user');
      }

      let subscription: StripeSubscriptionPayload | null = null;
      if (typeof session.subscription === 'string') {
        subscription = await stripeApiRequest<StripeSubscriptionPayload>(
          stripeSecretKey,
          `/subscriptions/${encodeURIComponent(session.subscription)}`,
        );
      } else if (session.subscription && typeof session.subscription === 'object') {
        subscription = session.subscription;
      }

      if (!subscription) {
        throw new HttpError(400, 'No subscription was found for this checkout session');
      }

      const customerId =
        typeof session.customer === 'string' ? session.customer : subscription.customer;

      const { error: customerError } = await auth.adminClient.from('billing_customers').upsert(
        {
          user_id: auth.user.id,
          stripe_customer_id: customerId,
          email: auth.user.email ?? null,
        },
        { onConflict: 'user_id' },
      );

      if (customerError) {
        throw new HttpError(500, `Failed to store customer mapping: ${customerError.message}`);
      }

      await persistStripeSubscription(auth.adminClient, auth.user.id, subscription);
      const expiresAt = toIsoFromUnixSeconds(subscription.current_period_end);
      const plan = await setUserProPlan(
        auth.adminClient,
        auth.user.id,
        subscription.status,
        expiresAt,
      );

      const { error: requestUpdateError } = await auth.adminClient
        .from('pro_upgrade_requests')
        .update({
          status: 'paid',
          stripe_subscription_id: subscription.id,
          external_payment_reference: payload.sessionId,
          admin_comment: 'Automatically marked as paid from Stripe checkout sync.',
        })
        .eq('user_id', auth.user.id)
        .eq('method', 'stripe')
        .eq('stripe_checkout_session_id', payload.sessionId)
        .in('status', ['pending', 'approved']);

      if (requestUpdateError) {
        throw new HttpError(500, `Failed to update upgrade request: ${requestUpdateError.message}`);
      }

      return jsonResponse({
        ok: true,
        plan,
        subscriptionStatus: subscription.status,
        expiresAt,
      });
    }

    return jsonResponse({ error: 'Unknown action' }, 400);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse(error.payload, error.status);
    }

    console.error('stripe-checkout error:', error);
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
});
