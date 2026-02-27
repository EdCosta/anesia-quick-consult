# AnesIA

AnesIA is a Vite + React + TypeScript application backed by Supabase for structured anesthesia procedures, guideline metadata, and recommendation content.

## Local app setup

```sh
npm install
npm run dev
```

## Database workflow

All schema changes must live in `supabase/migrations`. Do not make production schema changes manually in the Supabase dashboard.

Typical local Supabase commands:

```sh
supabase start
supabase db push
supabase db reset
```

`supabase db reset` rebuilds the local database entirely from the migrations folder, so keep migrations idempotent and committed.

## Procedure seed pipeline

The canonical procedure CSV snapshot lives at `data/procedures/procedures.csv`. It is currently derived from the existing `public/data/procedures-import.csv` export and is the baseline file for future updates.

Seed the `procedures` table with UPSERT semantics:

```sh
npm run db:seed:procedures
```

Optional custom file:

```sh
npm run db:seed:procedures -- data/procedures/procedures.csv
```

The seed script:

- parses semicolon-delimited CSV
- upserts by `id`
- updates `specialty`, `titles`, `synonyms`, `content`, `tags`, and `updated_at`
- requires `SUPABASE_SERVICE_ROLE_KEY`
- reads `SUPABASE_URL` or falls back to `VITE_SUPABASE_URL`

## Current schema additions

Recent migrations introduce:

- versioned guideline storage with `guideline_sources`, `guideline_versions`, and `recommendations`
- `guideline_chunks` for future RAG chunk storage
- `import_logs` for auditable admin imports
- a partial unique index enforcing a single active guideline version per source

## Admin access

Admin write access is controlled in `public.user_roles`. Only users with `role = 'admin'` can write through RLS-protected admin workflows.

Promote a user to admin with SQL:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT '<YOUR_AUTH_USER_UUID>'::uuid, 'admin'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.user_roles
  WHERE user_id = '<YOUR_AUTH_USER_UUID>'::uuid
    AND role::text = 'admin'
);
```

If you need to remove legacy non-admin rows for the same user first:

```sql
DELETE FROM public.user_roles
WHERE user_id = '<YOUR_AUTH_USER_UUID>'::uuid
  AND role::text <> 'admin';
```

Security notes:

- keep `SUPABASE_SERVICE_ROLE_KEY` only in server environments such as Edge Functions
- never expose `service_role` in Vite client env vars
- the browser should use only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
- AnesIA stores medical knowledge content only and must not store patient data

## Edge Functions

Run functions locally:

```sh
supabase functions serve
```

Deploy the secure admin import function:

```sh
supabase functions deploy admin-import-procedures
supabase functions deploy admin-import-guidelines
```

## Import procedures via UI

1. Sign in with a Supabase user that has an `admin` row in `public.user_roles`.
2. Open `/admin`.
3. Go to `/admin/import/procedures`.
4. Upload a semicolon-delimited CSV.
5. Review the preview and any validation errors before running the import.
6. Run the secure import. The browser sends the CSV to the Edge Function, and the write happens server-side.
7. Review `/admin/logs` for inserted counts, updated counts, and stored row-level errors.

The browser never needs the `service_role` key. All privileged writes happen in Supabase Edge Functions after an explicit admin check.
