import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.97.0';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
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
  if (!value) throw new HttpError(500, `Missing required environment variable: ${name}`);
  return value;
}

function toIsoFromUnixSeconds(value: number | null | undefined): string | null {
  if (!value || Number.isNaN(value)) return null;
  return new Date(value * 1000).toISOString();
}

function isActiveSubscriptionStatus(status: string): boolean {
  return status === 'active' || status === 'trialing' || status === 'past_due';
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

function parseStripeSignature(signatureHeader: string | null): {
  timestamp: string;
  signatures: string[];
} {
  if (!signatureHeader) {
    throw new HttpError(400, 'Missing Stripe-Signature header');
  }

  const chunks = signatureHeader.split(',').map((part) => part.trim());
  const timestamp = chunks.find((part) => part.startsWith('t='))?.slice(2) ?? '';
  const signatures = chunks
    .filter((part) => part.startsWith('v1='))
    .map((part) => part.slice(3))
    .filter(Boolean);

  if (!timestamp || signatures.length === 0) {
    throw new HttpError(400, 'Invalid Stripe-Signature header');
  }

  return { timestamp, signatures };
}

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) return new Uint8Array(0);
  const output = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    const byte = Number.parseInt(hex.slice(i, i + 2), 16);
    if (Number.isNaN(byte)) return new Uint8Array(0);
    output[i / 2] = byte;
  }
  return output;
}

function timingSafeEqual(aHex: string, bHex: string): boolean {
  const a = hexToBytes(aHex);
  const b = hexToBytes(bHex);
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

async function verifyStripeWebhookSignature(
  body: string,
  signatureHeader: string | null,
  webhookSecret: string,
): Promise<void> {
  const { timestamp, signatures } = parseStripeSignature(signatureHeader);
  const signedPayload = `${timestamp}.${body}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const digestHex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const isValid = signatures.some((signature) => timingSafeEqual(signature, digestHex));
  if (!isValid) {
    throw new HttpError(401, 'Invalid Stripe webhook signature');
  }
}

async function resolveUserIdForCustomer(
  adminClient: SupabaseClient,
  stripeCustomerId: string,
): Promise<string | null> {
  const { data, error } = await adminClient
    .from('billing_customers')
    .select('user_id')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, `Failed to resolve billing customer: ${error.message}`);
  }

  return ((data as { user_id?: string } | null)?.user_id ?? null) || null;
}

async function persistStripeSubscription(
  adminClient: SupabaseClient,
  userId: string,
  subscription: StripeSubscriptionPayload,
): Promise<void> {
  const { error } = await adminClient.from('billing_subscriptions').upsert(
    {
      stripe_subscription_id: subscription.id,
      user_id: userId,
      stripe_customer_id: subscription.customer,
      status: subscription.status,
      price_id: subscription.items?.data?.[0]?.price?.id ?? null,
      cancel_at_period_end: !!subscription.cancel_at_period_end,
      current_period_end: toIsoFromUnixSeconds(subscription.current_period_end),
      canceled_at: toIsoFromUnixSeconds(subscription.canceled_at),
      raw_event: subscription as unknown as Record<string, unknown>,
    },
    { onConflict: 'stripe_subscription_id' },
  );

  if (error) {
    throw new HttpError(500, `Failed to store subscription: ${error.message}`);
  }
}

async function setUserPlan(
  adminClient: SupabaseClient,
  userId: string,
  status: string,
  expiresAt: string | null,
): Promise<void> {
  const isPro = isActiveSubscriptionStatus(status);
  const planId = isPro ? 'pro' : 'free';

  const { error: entitlementError } = await adminClient.from('user_entitlements').upsert(
    {
      user_id: userId,
      plan_id: planId,
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
      plan: planId,
    },
    { onConflict: 'user_id' },
  );

  if (profileError) {
    throw new HttpError(500, `Failed to update profile plan: ${profileError.message}`);
  }
}

async function processSubscriptionEvent(params: {
  adminClient: SupabaseClient;
  subscription: StripeSubscriptionPayload;
  userIdHint?: string | null;
}): Promise<void> {
  const { adminClient, subscription, userIdHint } = params;

  let userId = userIdHint || subscription.metadata?.supabase_user_id || null;
  if (!userId) {
    userId = await resolveUserIdForCustomer(adminClient, subscription.customer);
  }
  if (!userId) {
    console.warn(
      `stripe-webhook: unable to resolve user for subscription ${subscription.id} and customer ${subscription.customer}`,
    );
    return;
  }

  const { error: customerError } = await adminClient.from('billing_customers').upsert(
    {
      user_id: userId,
      stripe_customer_id: subscription.customer,
    },
    { onConflict: 'user_id' },
  );

  if (customerError) {
    throw new HttpError(500, `Failed to upsert billing customer: ${customerError.message}`);
  }

  await persistStripeSubscription(adminClient, userId, subscription);
  await setUserPlan(
    adminClient,
    userId,
    subscription.status,
    toIsoFromUnixSeconds(subscription.current_period_end),
  );

  const nextStatus = isActiveSubscriptionStatus(subscription.status) ? 'paid' : 'rejected';
  const { error: requestUpdateError } = await adminClient
    .from('pro_upgrade_requests')
    .update({
      status: nextStatus,
      stripe_subscription_id: subscription.id,
      external_payment_reference: subscription.id,
      admin_comment: `Updated by Stripe webhook (${subscription.status}).`,
    })
    .eq('user_id', userId)
    .eq('method', 'stripe')
    .in('status', ['pending', 'approved', 'paid']);

  if (requestUpdateError) {
    throw new HttpError(500, `Failed to update upgrade request: ${requestUpdateError.message}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const stripeSecretKey = readEnv('STRIPE_SECRET_KEY');
    const stripeWebhookSecret = readEnv('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = readEnv('SUPABASE_URL');
    const serviceRoleKey = readEnv('SUPABASE_SERVICE_ROLE_KEY');

    const rawBody = await req.text();
    await verifyStripeWebhookSignature(
      rawBody,
      req.headers.get('Stripe-Signature'),
      stripeWebhookSecret,
    );

    const event = JSON.parse(rawBody) as StripeEvent;
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId =
        typeof session.client_reference_id === 'string'
          ? session.client_reference_id
          : typeof session.metadata === 'object' &&
              session.metadata !== null &&
              typeof (session.metadata as Record<string, unknown>).supabase_user_id === 'string'
            ? ((session.metadata as Record<string, unknown>).supabase_user_id as string)
            : null;

      const customerId =
        typeof session.customer === 'string'
          ? session.customer
          : typeof session.customer === 'object' &&
              session.customer !== null &&
              typeof (session.customer as Record<string, unknown>).id === 'string'
            ? ((session.customer as Record<string, unknown>).id as string)
            : null;

      if (userId && customerId) {
        const { error } = await adminClient.from('billing_customers').upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
          },
          { onConflict: 'user_id' },
        );

        if (error) {
          throw new HttpError(500, `Failed to upsert billing customer: ${error.message}`);
        }
      }

      if (typeof session.subscription === 'string') {
        const subscription = await stripeApiRequest<StripeSubscriptionPayload>(
          stripeSecretKey,
          `/subscriptions/${encodeURIComponent(session.subscription)}`,
        );
        await processSubscriptionEvent({
          adminClient,
          subscription,
          userIdHint: userId,
        });
      } else if (session.subscription && typeof session.subscription === 'object') {
        await processSubscriptionEvent({
          adminClient,
          subscription: session.subscription as StripeSubscriptionPayload,
          userIdHint: userId,
        });
      }
    }

    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      await processSubscriptionEvent({
        adminClient,
        subscription: event.data.object as StripeSubscriptionPayload,
      });
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const subscriptionId =
        typeof invoice.subscription === 'string' ? invoice.subscription : null;
      if (subscriptionId) {
        const subscription = await stripeApiRequest<StripeSubscriptionPayload>(
          stripeSecretKey,
          `/subscriptions/${encodeURIComponent(subscriptionId)}`,
        );
        await processSubscriptionEvent({
          adminClient,
          subscription,
        });
      }
    }

    return jsonResponse({ received: true });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse(error.payload, error.status);
    }

    console.error('stripe-webhook error:', error);
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
});
