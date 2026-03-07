# Launch Readiness

## Production checklist

### Required env

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_ENABLE_ANALYTICS=true`
- `VITE_SITE_URL`

### Billing env

- `VITE_PRO_SEPA_IBAN`
- `VITE_PRO_SEPA_BIC`
- `VITE_PRO_SEPA_BENEFICIARY`

### Before public launch

1. Validate Stripe checkout with a real live-mode account.
2. Validate billing portal flow with an existing paid user.
3. Fill legal entity data in `Privacy.tsx` and `Terms.tsx`.
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
- Runtime JS errors and unhandled rejections are tracked through analytics when enabled
