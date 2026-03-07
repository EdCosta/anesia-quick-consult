import { getLegalReadiness } from '@/config/legal';

type ReadinessItem = {
  id: string;
  label: string;
  status: 'ready' | 'warning';
  detail: string;
};

function hasValue(value: string | undefined) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function getRuntimeReadiness(): ReadinessItem[] {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const analyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
  const siteUrl = import.meta.env.VITE_SITE_URL || import.meta.env.SITE_URL;
  const sepaIban = import.meta.env.VITE_PRO_SEPA_IBAN;
  const sepaBic = import.meta.env.VITE_PRO_SEPA_BIC;
  const sepaBeneficiary = import.meta.env.VITE_PRO_SEPA_BENEFICIARY;

  const legalReady = getLegalReadiness().every((entry) => entry.ready);

  return [
    {
      id: 'supabase-url',
      label: 'Supabase URL',
      status: hasValue(supabaseUrl) ? 'ready' : 'warning',
      detail: hasValue(supabaseUrl) ? 'Configured' : 'Missing VITE_SUPABASE_URL',
    },
    {
      id: 'supabase-key',
      label: 'Supabase publishable key',
      status: hasValue(supabaseKey) ? 'ready' : 'warning',
      detail: hasValue(supabaseKey)
        ? 'Configured'
        : 'Missing VITE_SUPABASE_PUBLISHABLE_KEY',
    },
    {
      id: 'analytics',
      label: 'Analytics collection',
      status: analyticsEnabled ? 'ready' : 'warning',
      detail: analyticsEnabled ? 'Enabled' : 'Set VITE_ENABLE_ANALYTICS=true',
    },
    {
      id: 'site-url',
      label: 'Canonical site URL',
      status: hasValue(siteUrl) ? 'ready' : 'warning',
      detail: hasValue(siteUrl) ? String(siteUrl) : 'Missing VITE_SITE_URL or SITE_URL',
    },
    {
      id: 'manual-billing',
      label: 'Manual billing fallback',
      status:
        hasValue(sepaIban) && hasValue(sepaBic) && hasValue(sepaBeneficiary)
          ? 'ready'
          : 'warning',
      detail:
        hasValue(sepaIban) && hasValue(sepaBic) && hasValue(sepaBeneficiary)
          ? 'SEPA fallback configured'
          : 'Missing one or more SEPA billing env vars',
    },
    {
      id: 'legal-details',
      label: 'Legal identity details',
      status: legalReady ? 'ready' : 'warning',
      detail: legalReady
        ? 'Legal entity/contact details configured'
        : 'Complete legal placeholders in production env vars',
    },
  ];
}
