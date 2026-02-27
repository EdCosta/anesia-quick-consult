BEGIN;

CREATE TABLE IF NOT EXISTS public.import_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_type text NOT NULL DEFAULT 'procedures',
  source_filename text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  total integer NOT NULL DEFAULT 0,
  success integer NOT NULL DEFAULT 0,
  failed integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.import_logs
  ADD COLUMN IF NOT EXISTS import_type text,
  ADD COLUMN IF NOT EXISTS source_filename text,
  ADD COLUMN IF NOT EXISTS status text,
  ADD COLUMN IF NOT EXISTS metadata jsonb;

UPDATE public.import_logs
SET
  import_type = COALESCE(import_type, 'procedures'),
  status = COALESCE(status, 'completed'),
  metadata = COALESCE(metadata, '{}'::jsonb),
  errors = COALESCE(errors, '[]'::jsonb)
WHERE
  import_type IS NULL
  OR status IS NULL
  OR metadata IS NULL
  OR errors IS NULL;

ALTER TABLE public.import_logs
  ALTER COLUMN import_type SET DEFAULT 'procedures',
  ALTER COLUMN import_type SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'completed',
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN metadata SET DEFAULT '{}'::jsonb,
  ALTER COLUMN metadata SET NOT NULL,
  ALTER COLUMN errors SET DEFAULT '[]'::jsonb,
  ALTER COLUMN errors SET NOT NULL;

ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_guideline_versions_one_active_per_source
  ON public.guideline_versions (source_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_guideline_versions_source_status
  ON public.guideline_versions (source_id, status);

CREATE INDEX IF NOT EXISTS idx_guideline_sources_name
  ON public.guideline_sources (name);

CREATE INDEX IF NOT EXISTS idx_recommendations_context_tags_gin
  ON public.recommendations USING gin (context_tags);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'import_logs'
      AND policyname = 'import_logs_select_admin'
  ) THEN
    CREATE POLICY import_logs_select_admin
      ON public.import_logs
      FOR SELECT
      TO authenticated
      USING (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'import_logs'
      AND policyname = 'import_logs_insert_admin'
  ) THEN
    CREATE POLICY import_logs_insert_admin
      ON public.import_logs
      FOR INSERT
      TO authenticated
      WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'import_logs'
      AND policyname = 'import_logs_update_admin'
  ) THEN
    CREATE POLICY import_logs_update_admin
      ON public.import_logs
      FOR UPDATE
      TO authenticated
      USING (public.is_admin(auth.uid()))
      WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'import_logs'
      AND policyname = 'import_logs_delete_admin'
  ) THEN
    CREATE POLICY import_logs_delete_admin
      ON public.import_logs
      FOR DELETE
      TO authenticated
      USING (public.is_admin(auth.uid()));
  END IF;
END;
$$;

COMMIT;
