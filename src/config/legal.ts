type LegalConfig = {
  entityName: string;
  postalAddress: string;
  supportEmail: string;
  billingEmail: string;
  jurisdictionCity: string;
  hostingSummary: string;
  hospitalSalesEmail: string;
};

const PLACEHOLDER_PREFIX = 'TODO_';

function readValue(envValue: string | undefined, fallback: string) {
  return envValue && envValue.trim().length > 0 ? envValue.trim() : fallback;
}

export const LEGAL_CONFIG: LegalConfig = {
  entityName: readValue(import.meta.env.VITE_LEGAL_ENTITY_NAME, 'TODO_LEGAL_ENTITY_NAME'),
  postalAddress: readValue(import.meta.env.VITE_LEGAL_POSTAL_ADDRESS, 'TODO_LEGAL_POSTAL_ADDRESS'),
  supportEmail: readValue(import.meta.env.VITE_SUPPORT_EMAIL, 'TODO_SUPPORT_EMAIL'),
  billingEmail: readValue(import.meta.env.VITE_BILLING_EMAIL, 'TODO_BILLING_EMAIL'),
  jurisdictionCity: readValue(
    import.meta.env.VITE_LEGAL_JURISDICTION_CITY,
    'TODO_LEGAL_JURISDICTION_CITY',
  ),
  hostingSummary: readValue(
    import.meta.env.VITE_HOSTING_SUMMARY,
    'Supabase (EU) and web hosting infrastructure',
  ),
  hospitalSalesEmail: readValue(
    import.meta.env.VITE_HOSPITAL_SALES_EMAIL,
    'TODO_HOSPITAL_SALES_EMAIL',
  ),
};

export function isPlaceholderValue(value: string) {
  return value.startsWith(PLACEHOLDER_PREFIX);
}

export function getLegalReadiness() {
  const entries = [
    { key: 'entityName', label: 'Legal entity', value: LEGAL_CONFIG.entityName },
    { key: 'postalAddress', label: 'Postal address', value: LEGAL_CONFIG.postalAddress },
    { key: 'supportEmail', label: 'Support email', value: LEGAL_CONFIG.supportEmail },
    { key: 'billingEmail', label: 'Billing email', value: LEGAL_CONFIG.billingEmail },
    { key: 'jurisdictionCity', label: 'Jurisdiction city', value: LEGAL_CONFIG.jurisdictionCity },
    { key: 'hospitalSalesEmail', label: 'Hospital sales email', value: LEGAL_CONFIG.hospitalSalesEmail },
  ];

  return entries.map((entry) => ({
    ...entry,
    ready: !isPlaceholderValue(entry.value),
  }));
}
