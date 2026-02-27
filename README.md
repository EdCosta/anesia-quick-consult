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
