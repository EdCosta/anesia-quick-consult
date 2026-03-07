# Deploy Runbook

## 1. Pre-deploy checks

1. Copy `.env.production.example` into your deployment secret manager and fill every `TODO_*` value.
2. Confirm the public site URL matches the final production domain.
3. Confirm Stripe live credentials and return URLs are configured.
4. Confirm Supabase production keys are set for both frontend and server workflows.

## 2. Technical validation

Run locally before every production deploy:

1. `npm run build`
2. `npm run test -- --run`
3. `npm run test:e2e`

## 3. Supabase rollout

1. Apply pending migrations.
2. Deploy edge functions, especially `ai_answer`.
3. Confirm `analytics_events`, `ai_threads`, and `ai_messages` are writable in production.

## 4. Post-deploy smoke test

1. Open `/` and confirm home search and guided shortcuts render.
2. Open one internal procedure and one public procedure page.
3. Open the AI widget, type a message, and confirm a response returns.
4. Open `/pricing`, `/account`, and `/pro-checkout` with a signed-in test user.
5. Confirm the admin `Launch readiness` panel is green except for any intentionally deferred item.

## 5. Monitoring in first 24 hours

Watch the following in admin analytics:

1. `runtime_error`
2. `runtime_unhandled_rejection`
3. `Search gaps`
4. `Zero-result searches`
5. `preview -> click -> checkout -> success`
6. `public to app`

If runtime errors spike, pause acquisition and inspect the affected path before expanding traffic.

## 6. Launch blockers

Do not treat the deployment as production-ready if any of the following remain unresolved:

1. Legal placeholders still visible in `Privacy` or `Terms`
2. Missing canonical site URL
3. Missing Stripe live configuration
4. Analytics disabled
5. AI edge function not deployed
