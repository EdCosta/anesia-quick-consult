import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, Crown, Landmark, ReceiptText } from 'lucide-react';
import { toast } from 'sonner';
import { useLang } from '@/contexts/LanguageContext';
import { useEntitlements } from '@/hooks/useEntitlements';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resolveEdgeFunctionErrorMessage } from '@/lib/edgeFunctionError';
import type { User } from '@supabase/supabase-js';

type PricingResponse = {
  enabled: boolean;
  price: {
    id: string;
    active: boolean;
    unitAmount: number | null;
    currency: string;
    interval: string | null;
    intervalCount: number | null;
  } | null;
  feeConfig?: {
    percent: number;
    fixedCents: number;
  };
};

type StripeSessionResponse = {
  url?: string;
  disabled?: boolean;
  error?: string;
};

type UpgradeRequestRow = {
  id: string;
  method: 'stripe' | 'sepa_transfer' | 'invoice';
  status: 'pending' | 'approved' | 'paid' | 'rejected' | 'canceled';
  created_at: string;
  admin_comment?: string | null;
};

type BillingData = {
  fullName: string;
  companyName: string;
  vatNumber: string;
  billingEmail: string;
  country: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  purchaseOrder: string;
};

const PRO_FEATURES = [
  {
    fr: 'Toutes les procedures Quick + Deep',
    en: 'All Quick + Deep procedures',
    pt: 'Todos os procedimentos Quick + Deep',
  },
  {
    fr: 'Guidelines completes avec references',
    en: 'Full guidelines with references',
    pt: 'Guidelines completas com referencias',
  },
  {
    fr: 'Protocoles operatoires et blocs ALR',
    en: 'Operative protocols and ALR blocks',
    pt: 'Protocolos operatorios e blocos ALR',
  },
  {
    fr: 'Mode Pro et filtres avances',
    en: 'Pro mode and advanced filters',
    pt: 'Modo Pro e filtros avancados',
  },
  {
    fr: 'Mises a jour cliniques prioritaires',
    en: 'Priority clinical updates',
    pt: 'Atualizacoes clinicas prioritarias',
  },
  {
    fr: 'Support prioritaire',
    en: 'Priority support',
    pt: 'Suporte prioritario',
  },
];

type CheckoutMethod = 'stripe' | 'sepa_transfer' | 'invoice';

const EMPTY_BILLING_DATA: BillingData = {
  fullName: '',
  companyName: '',
  vatNumber: '',
  billingEmail: '',
  country: '',
  addressLine1: '',
  city: '',
  postalCode: '',
  purchaseOrder: '',
};

function formatPrice(
  lang: 'fr' | 'en' | 'pt',
  unitAmount: number | null,
  currency: string | null,
  interval: string | null,
): string {
  if (unitAmount === null || !currency) {
    return lang === 'fr'
      ? 'Tarif indisponible'
      : lang === 'pt'
        ? 'Preco indisponivel'
        : 'Price unavailable';
  }

  const amount = new Intl.NumberFormat(lang, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(unitAmount / 100);

  if (!interval) return amount;

  const suffix =
    interval === 'month'
      ? lang === 'fr'
        ? '/mois'
        : lang === 'pt'
          ? '/mes'
          : '/month'
      : interval === 'year'
        ? lang === 'fr'
          ? '/an'
          : lang === 'pt'
            ? '/ano'
            : '/year'
        : '';

  return `${amount}${suffix}`;
}

function methodLabel(method: UpgradeRequestRow['method'], lang: 'fr' | 'en' | 'pt'): string {
  if (method === 'stripe') {
    return lang === 'fr' ? 'Carte/Wallet (Stripe)' : lang === 'pt' ? 'Cartao/Wallet (Stripe)' : 'Card/Wallet (Stripe)';
  }
  if (method === 'sepa_transfer') {
    return lang === 'fr' ? 'Virement SEPA' : lang === 'pt' ? 'Transferencia SEPA' : 'SEPA transfer';
  }
  return lang === 'fr' ? 'Facture' : lang === 'pt' ? 'Fatura' : 'Invoice';
}

function statusLabel(status: UpgradeRequestRow['status'], lang: 'fr' | 'en' | 'pt'): string {
  if (status === 'pending') return lang === 'fr' ? 'En attente' : lang === 'pt' ? 'Pendente' : 'Pending';
  if (status === 'approved') return lang === 'fr' ? 'Approuve' : lang === 'pt' ? 'Aprovado' : 'Approved';
  if (status === 'paid') return lang === 'fr' ? 'Paye' : lang === 'pt' ? 'Pago' : 'Paid';
  if (status === 'canceled') return lang === 'fr' ? 'Annule' : lang === 'pt' ? 'Cancelado' : 'Canceled';
  return lang === 'fr' ? 'Refuse' : lang === 'pt' ? 'Recusado' : 'Rejected';
}

function normalizeBillingData(billingData: BillingData): BillingData {
  return {
    fullName: billingData.fullName.trim(),
    companyName: billingData.companyName.trim(),
    vatNumber: billingData.vatNumber.trim(),
    billingEmail: billingData.billingEmail.trim(),
    country: billingData.country.trim(),
    addressLine1: billingData.addressLine1.trim(),
    city: billingData.city.trim(),
    postalCode: billingData.postalCode.trim(),
    purchaseOrder: billingData.purchaseOrder.trim(),
  };
}

function buildBillingSummary(billingData: BillingData, freeNote: string): string {
  const parts = [
    `Billing name: ${billingData.fullName || '-'}`,
    `Company: ${billingData.companyName || '-'}`,
    `VAT: ${billingData.vatNumber || '-'}`,
    `Billing email: ${billingData.billingEmail || '-'}`,
    `Country: ${billingData.country || '-'}`,
    `Address: ${billingData.addressLine1 || '-'}, ${billingData.postalCode || '-'} ${billingData.city || '-'}`,
    `PO: ${billingData.purchaseOrder || '-'}`,
  ];
  if (freeNote.trim()) {
    parts.push(`Note: ${freeNote.trim()}`);
  }
  return parts.join('\n');
}

export default function ProCheckout() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isPro, loading } = useEntitlements();
  const [user, setUser] = useState<User | null>(null);
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<CheckoutMethod>('stripe');
  const [coverFees, setCoverFees] = useState(true);
  const [requestNote, setRequestNote] = useState('');
  const [billingData, setBillingData] = useState<BillingData>(EMPTY_BILLING_DATA);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requests, setRequests] = useState<UpgradeRequestRow[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const sepaIban = import.meta.env.VITE_PRO_SEPA_IBAN || 'BE00 0000 0000 0000';
  const sepaBic = import.meta.env.VITE_PRO_SEPA_BIC || 'ABCDBEBB';
  const sepaName = import.meta.env.VITE_PRO_SEPA_BENEFICIARY || 'AnesIA';

  function validateBillingData(data: BillingData): string | null {
    if (!data.fullName || !data.billingEmail || !data.country || !data.addressLine1) {
      return lang === 'fr'
        ? 'Remplissez les champs de facturation obligatoires.'
        : lang === 'pt'
          ? 'Preencha os campos obrigatorios de faturacao.'
          : 'Fill in required billing fields.';
    }
    return null;
  }

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPricing() {
      setPricingLoading(true);
      const { data, error } = await supabase.functions.invoke<PricingResponse>('stripe-checkout', {
        body: {
          action: 'get_pricing',
        },
      });

      if (cancelled) return;
      if (error) {
        setPricing({ enabled: false, price: null });
      } else {
        setPricing(data ?? { enabled: false, price: null });
      }
      setPricingLoading(false);
    }

    void loadPricing();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setRequests([]);
      return;
    }

    let cancelled = false;

    async function loadRequests() {
      setLoadingRequests(true);
      const { data, error } = await supabase
        .from('pro_upgrade_requests' as any)
        .select('id,method,status,created_at,admin_comment')
        .order('created_at', { ascending: false })
        .limit(10);

      if (cancelled) return;
      if (error) {
        setLoadingRequests(false);
        return;
      }
      setRequests((Array.isArray(data) ? data : []) as UpgradeRequestRow[]);
      setLoadingRequests(false);
    }

    void loadRequests();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const feePreviewCents = useMemo(() => {
    const base = pricing?.price?.unitAmount ?? 0;
    const feePercent = pricing?.feeConfig?.percent ?? 0;
    const feeFixed = pricing?.feeConfig?.fixedCents ?? 0;
    if (base <= 0 || (feePercent <= 0 && feeFixed <= 0)) return 0;
    return Math.round(base * (feePercent / 100)) + feeFixed;
  }, [pricing]);

  const priceLabel = useMemo(() => {
    const baseLabel = formatPrice(
      lang,
      pricing?.price?.unitAmount ?? null,
      pricing?.price?.currency ?? null,
      pricing?.price?.interval ?? null,
    );
    if (!coverFees || feePreviewCents <= 0) return baseLabel;

    const total = (pricing?.price?.unitAmount ?? 0) + feePreviewCents;
    const totalLabel = formatPrice(
      lang,
      total,
      pricing?.price?.currency ?? null,
      pricing?.price?.interval ?? null,
    );

    return `${baseLabel} -> ${totalLabel}`;
  }, [coverFees, feePreviewCents, lang, pricing]);

  async function createCheckoutSession() {
    if (!user) {
      navigate('/auth?mode=signin');
      return;
    }

    const normalizedBillingData = normalizeBillingData(billingData);
    const billingValidationError = validateBillingData(normalizedBillingData);
    if (billingValidationError) {
      toast.error(billingValidationError);
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke<StripeSessionResponse>('stripe-checkout', {
        body: {
          action: 'create_checkout_session',
          origin: window.location.origin,
          coverFees,
          notes: requestNote.trim(),
          billingData: normalizedBillingData,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error(data?.error || 'Could not start checkout');
      window.location.assign(data.url);
    } catch (error) {
      const message = await resolveEdgeFunctionErrorMessage(error, 'Checkout failed');
      toast.error(message);
      setCheckoutLoading(false);
    }
  }

  async function createManualRequest(method: 'sepa_transfer' | 'invoice') {
    if (!user) {
      navigate('/auth?mode=signin');
      return;
    }

    const normalizedBillingData = normalizeBillingData(billingData);
    const billingValidationError = validateBillingData(normalizedBillingData);
    if (billingValidationError) {
      toast.error(billingValidationError);
      return;
    }

    setSubmittingRequest(true);
    try {
      const { data, error } = await supabase.functions.invoke<{ ok?: boolean; error?: string }>(
        'stripe-checkout',
        {
          body: {
            action: 'create_upgrade_request',
            method,
            notes: buildBillingSummary(normalizedBillingData, requestNote),
            billingData: normalizedBillingData,
          },
        },
      );

      if (error || !data?.ok) {
        throw error ?? new Error(data?.error || 'Could not create request');
      }

      toast.success(
        lang === 'fr'
          ? 'Demande envoyee'
          : lang === 'pt'
            ? 'Pedido enviado'
            : 'Request sent',
      );
      setRequestNote('');

      const { data: updatedRows } = await supabase
        .from('pro_upgrade_requests' as any)
        .select('id,method,status,created_at,admin_comment')
        .order('created_at', { ascending: false })
        .limit(10);
      setRequests((Array.isArray(updatedRows) ? updatedRows : []) as UpgradeRequestRow[]);
    } catch (error) {
      const message = await resolveEdgeFunctionErrorMessage(error, 'Request failed');
      toast.error(message);
    } finally {
      setSubmittingRequest(false);
    }
  }

  async function openBillingPortal() {
    if (!user) {
      navigate('/auth?mode=signin');
      return;
    }

    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke<StripeSessionResponse>('stripe-checkout', {
        body: {
          action: 'create_billing_portal_session',
          origin: window.location.origin,
          returnUrl: `${window.location.origin}/account`,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error(data?.error || 'Could not open subscription management');
      window.location.assign(data.url);
    } catch (error) {
      const message = await resolveEdgeFunctionErrorMessage(error, 'Portal failed');
      toast.error(message);
      setPortalLoading(false);
    }
  }

  const canceled = searchParams.get('canceled') === '1';

  return (
    <div className="container max-w-3xl space-y-5 py-6">
      <Link to="/account" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
        <ArrowLeft className="h-4 w-4" />
        {t('back')}
      </Link>

      <div className="rounded-2xl border border-accent/20 bg-card p-6 clinical-shadow">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="gap-1">
            <Crown className="h-3.5 w-3.5" />
            {t('plan_pro')}
          </Badge>
          {pricingLoading ? (
            <span className="text-sm text-muted-foreground">{t('loading')}</span>
          ) : (
            <span className="text-sm font-semibold text-foreground">{priceLabel}</span>
          )}
        </div>
        <h1 className="mt-3 text-2xl font-bold text-foreground">
          {lang === 'fr' ? 'Activer le mode Pro' : lang === 'pt' ? 'Ativar modo Pro' : 'Activate Pro mode'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {lang === 'fr'
            ? 'Choisissez votre methode: Stripe, virement SEPA ou facture.'
            : lang === 'pt'
              ? 'Escolha o metodo: Stripe, transferencia SEPA ou fatura.'
              : 'Choose your method: Stripe, SEPA transfer, or invoice.'}
        </p>
      </div>

      {canceled && (
        <Card className="border-amber-300 bg-amber-50/60">
          <CardContent className="p-4 text-sm text-amber-700">
            {lang === 'fr'
              ? 'Paiement annule. Vous pouvez relancer le checkout.'
              : lang === 'pt'
                ? 'Pagamento cancelado. Pode voltar a iniciar o checkout.'
                : 'Payment canceled. You can restart checkout.'}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            {lang === 'fr' ? 'Inclus dans Pro' : lang === 'pt' ? 'Incluido no Pro' : 'Included in Pro'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {PRO_FEATURES.map((feature) => (
            <div key={feature.fr} className="flex items-center gap-2 text-sm text-foreground">
              <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
              {feature[lang]}
            </div>
          ))}
        </CardContent>
      </Card>

      {!loading && isPro ? (
        <Button className="w-full gap-2" size="lg" onClick={() => void openBillingPortal()} disabled={portalLoading}>
          <CreditCard className="h-4 w-4" />
          {portalLoading
            ? lang === 'fr'
              ? 'Ouverture...'
              : lang === 'pt'
                ? 'A abrir...'
                : 'Opening...'
            : lang === 'fr'
              ? 'Gerer mon abonnement'
              : lang === 'pt'
                ? 'Gerir subscricao'
                : 'Manage subscription'}
        </Button>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className={selectedMethod === 'stripe' ? 'border-primary' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Stripe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label className="text-xs flex items-center gap-2">
                <input
                  type="radio"
                  checked={selectedMethod === 'stripe'}
                  onChange={() => setSelectedMethod('stripe')}
                />
                {lang === 'fr' ? 'Paiement immediat' : lang === 'pt' ? 'Pagamento imediato' : 'Instant payment'}
              </Label>
              <Label className="text-xs flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={coverFees}
                  onChange={(event) => setCoverFees(event.target.checked)}
                />
                {lang === 'fr'
                  ? 'Je paie les frais de traitement'
                  : lang === 'pt'
                    ? 'Eu pago os custos de processamento'
                    : 'I cover processing fees'}
              </Label>
              <Button
                className="w-full"
                size="sm"
                onClick={() => void createCheckoutSession()}
                disabled={checkoutLoading || pricingLoading || !pricing?.enabled}
              >
                {checkoutLoading
                  ? lang === 'fr'
                    ? 'Redirection...'
                    : lang === 'pt'
                      ? 'A redirecionar...'
                      : 'Redirecting...'
                  : lang === 'fr'
                    ? 'Payer avec Stripe'
                    : lang === 'pt'
                      ? 'Pagar com Stripe'
                      : 'Pay with Stripe'}
              </Button>
            </CardContent>
          </Card>

          <Card className={selectedMethod === 'sepa_transfer' ? 'border-primary' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Landmark className="h-4 w-4" />
                SEPA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <Label className="text-xs flex items-center gap-2 text-foreground">
                <input
                  type="radio"
                  checked={selectedMethod === 'sepa_transfer'}
                  onChange={() => setSelectedMethod('sepa_transfer')}
                />
                {lang === 'fr' ? 'Virement bancaire' : lang === 'pt' ? 'Transferencia bancaria' : 'Bank transfer'}
              </Label>
              <p>{sepaName}</p>
              <p>IBAN: {sepaIban}</p>
              <p>BIC: {sepaBic}</p>
              <Button
                className="w-full"
                size="sm"
                variant="outline"
                onClick={() => void createManualRequest('sepa_transfer')}
                disabled={submittingRequest}
              >
                {lang === 'fr' ? 'Demander activation' : lang === 'pt' ? 'Pedir ativacao' : 'Request activation'}
              </Button>
            </CardContent>
          </Card>

          <Card className={selectedMethod === 'invoice' ? 'border-primary' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ReceiptText className="h-4 w-4" />
                {lang === 'fr' ? 'Facture' : lang === 'pt' ? 'Fatura' : 'Invoice'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label className="text-xs flex items-center gap-2">
                <input
                  type="radio"
                  checked={selectedMethod === 'invoice'}
                  onChange={() => setSelectedMethod('invoice')}
                />
                {lang === 'fr' ? 'Facturation manuelle' : lang === 'pt' ? 'Faturacao manual' : 'Manual invoicing'}
              </Label>
              <Button
                className="w-full"
                size="sm"
                variant="outline"
                onClick={() => void createManualRequest('invoice')}
                disabled={submittingRequest}
              >
                {lang === 'fr' ? 'Demander facture' : lang === 'pt' ? 'Pedir fatura' : 'Request invoice'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {!isPro && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {lang === 'fr'
                ? 'Donnees de facturation'
                : lang === 'pt'
                  ? 'Dados de faturacao'
                  : 'Billing details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="billing-full-name">
                  {lang === 'fr' ? 'Nom complet *' : lang === 'pt' ? 'Nome completo *' : 'Full name *'}
                </Label>
                <Input
                  id="billing-full-name"
                  value={billingData.fullName}
                  onChange={(event) =>
                    setBillingData((prev) => ({ ...prev, fullName: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="billing-email">
                  {lang === 'fr' ? 'Email facturation *' : lang === 'pt' ? 'Email faturacao *' : 'Billing email *'}
                </Label>
                <Input
                  id="billing-email"
                  type="email"
                  value={billingData.billingEmail}
                  onChange={(event) =>
                    setBillingData((prev) => ({ ...prev, billingEmail: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="billing-company">
                  {lang === 'fr' ? 'Societe' : lang === 'pt' ? 'Empresa' : 'Company'}
                </Label>
                <Input
                  id="billing-company"
                  value={billingData.companyName}
                  onChange={(event) =>
                    setBillingData((prev) => ({ ...prev, companyName: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="billing-vat">
                  {lang === 'fr' ? 'TVA / VAT' : lang === 'pt' ? 'IVA / VAT' : 'VAT'}
                </Label>
                <Input
                  id="billing-vat"
                  value={billingData.vatNumber}
                  onChange={(event) =>
                    setBillingData((prev) => ({ ...prev, vatNumber: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="billing-country">
                  {lang === 'fr' ? 'Pays *' : lang === 'pt' ? 'Pais *' : 'Country *'}
                </Label>
                <Input
                  id="billing-country"
                  value={billingData.country}
                  onChange={(event) =>
                    setBillingData((prev) => ({ ...prev, country: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="billing-address">
                  {lang === 'fr' ? 'Adresse *' : lang === 'pt' ? 'Morada *' : 'Address *'}
                </Label>
                <Input
                  id="billing-address"
                  value={billingData.addressLine1}
                  onChange={(event) =>
                    setBillingData((prev) => ({ ...prev, addressLine1: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="billing-postal">
                  {lang === 'fr' ? 'Code postal' : lang === 'pt' ? 'Codigo postal' : 'Postal code'}
                </Label>
                <Input
                  id="billing-postal"
                  value={billingData.postalCode}
                  onChange={(event) =>
                    setBillingData((prev) => ({ ...prev, postalCode: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="billing-city">
                  {lang === 'fr' ? 'Ville' : lang === 'pt' ? 'Cidade' : 'City'}
                </Label>
                <Input
                  id="billing-city"
                  value={billingData.city}
                  onChange={(event) =>
                    setBillingData((prev) => ({ ...prev, city: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="billing-po">
                  {lang === 'fr'
                    ? 'Reference facture / PO'
                    : lang === 'pt'
                      ? 'Referencia de fatura / PO'
                      : 'Invoice reference / PO'}
                </Label>
                <Input
                  id="billing-po"
                  value={billingData.purchaseOrder}
                  onChange={(event) =>
                    setBillingData((prev) => ({ ...prev, purchaseOrder: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="billing-note">
                {lang === 'fr' ? 'Note optionnelle' : lang === 'pt' ? 'Nota opcional' : 'Optional note'}
              </Label>
              <Input
                id="billing-note"
                value={requestNote}
                onChange={(event) => setRequestNote(event.target.value)}
                placeholder={
                  lang === 'fr'
                    ? 'Ex: contact comptable, contraintes internes...'
                    : lang === 'pt'
                      ? 'Ex: contacto da contabilidade, requisitos internos...'
                      : 'Ex: accounting contact, internal constraints...'
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {lang === 'fr' ? 'Mes demandes' : lang === 'pt' ? 'Os meus pedidos' : 'My requests'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {loadingRequests ? (
            <p className="text-muted-foreground">{t('loading')}</p>
          ) : requests.length === 0 ? (
            <p className="text-muted-foreground">
              {lang === 'fr' ? 'Aucune demande recente.' : lang === 'pt' ? 'Sem pedidos recentes.' : 'No recent requests.'}
            </p>
          ) : (
            requests.map((row) => (
              <div key={row.id} className="rounded border border-border p-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-foreground">{methodLabel(row.method, lang)}</span>
                  <Badge variant="outline">{statusLabel(row.status, lang)}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(row.created_at).toLocaleString()}
                </p>
                {row.admin_comment && <p className="mt-1 text-xs text-muted-foreground">{row.admin_comment}</p>}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {!pricingLoading && !pricing?.enabled && (
        <p className="text-xs text-muted-foreground">
          {lang === 'fr'
            ? 'Stripe non configure. Vous pouvez utiliser SEPA ou facture.'
            : lang === 'pt'
              ? 'Stripe nao configurado. Pode usar SEPA ou fatura.'
              : 'Stripe is not configured. You can use SEPA or invoice.'}
        </p>
      )}
    </div>
  );
}
