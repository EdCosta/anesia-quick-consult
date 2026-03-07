# Launch Readiness

## Production checklist

### Required env

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_ENABLE_ANALYTICS=true`
- `VITE_SITE_URL`
- `VITE_LEGAL_ENTITY_NAME`
- `VITE_LEGAL_POSTAL_ADDRESS`
- `VITE_SUPPORT_EMAIL`
- `VITE_BILLING_EMAIL`
- `VITE_LEGAL_JURISDICTION_CITY`
- `VITE_HOSPITAL_SALES_EMAIL`

### Billing env

- `VITE_PRO_SEPA_IBAN`
- `VITE_PRO_SEPA_BIC`
- `VITE_PRO_SEPA_BENEFICIARY`

### Before public launch

1. Validate Stripe checkout with a real live-mode account.
2. Validate billing portal flow with an existing paid user.
3. Fill legal entity data through production env values used by `src/config/legal.ts`.
4. Confirm analytics events are reaching `analytics_events`.
5. Confirm sitemap URLs use the real production domain.
6. Confirm admin `Launch readiness` panel is fully green.

### Recommended smoke tests

1. `npm run build`
2. `npm run test -- --run`
3. `npm run test:e2e`

### Operational notes

- Search overrides live in `src/lib/searchOverrides.config.ts`
- Search intent base config lives in `src/lib/searchIntents.config.ts`
- Legal content reads from `src/config/legal.ts`
- Runtime JS errors and unhandled rejections are tracked through analytics when enabled
- Use `docs/deploy-runbook.md` for deploy and first-day monitoring
