BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _roles_table_exists boolean;
  _is_admin boolean := false;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'user_roles'
  )
  INTO _roles_table_exists;

  IF NOT _roles_table_exists OR _user_id IS NULL THEN
    RETURN false;
  END IF;

  EXECUTE
    'SELECT EXISTS (
       SELECT 1
       FROM public.user_roles
       WHERE user_id = $1
         AND role::text = ''admin''
     )'
  INTO _is_admin
  USING _user_id;

  RETURN COALESCE(_is_admin, false);
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'guideline_version_status'
  ) THEN
    CREATE TYPE public.guideline_version_status AS ENUM (
      'draft',
      'active',
      'archived',
      'superseded'
    );
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.procedures (
  id text PRIMARY KEY,
  specialty text NOT NULL,
  titles jsonb NOT NULL DEFAULT '{}'::jsonb,
  synonyms jsonb NOT NULL DEFAULT '{}'::jsonb,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.procedures
  ADD COLUMN IF NOT EXISTS specialty text,
  ADD COLUMN IF NOT EXISTS titles jsonb,
  ADD COLUMN IF NOT EXISTS synonyms jsonb,
  ADD COLUMN IF NOT EXISTS content jsonb,
  ADD COLUMN IF NOT EXISTS tags jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT timezone('utc', now()),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT timezone('utc', now());

UPDATE public.procedures
SET
  titles = COALESCE(titles, '{}'::jsonb),
  synonyms = COALESCE(synonyms, '{}'::jsonb),
  content = COALESCE(content, '{}'::jsonb),
  tags = COALESCE(tags, '[]'::jsonb),
  created_at = COALESCE(created_at, timezone('utc', now())),
  updated_at = COALESCE(updated_at, timezone('utc', now()))
WHERE
  titles IS NULL
  OR synonyms IS NULL
  OR content IS NULL
  OR tags IS NULL
  OR created_at IS NULL
  OR updated_at IS NULL;

ALTER TABLE public.procedures
  ALTER COLUMN titles SET DEFAULT '{}'::jsonb,
  ALTER COLUMN synonyms SET DEFAULT '{}'::jsonb,
  ALTER COLUMN content SET DEFAULT '{}'::jsonb,
  ALTER COLUMN tags SET DEFAULT '[]'::jsonb,
  ALTER COLUMN created_at SET DEFAULT timezone('utc', now()),
  ALTER COLUMN updated_at SET DEFAULT timezone('utc', now());

CREATE TABLE IF NOT EXISTS public.guideline_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  organization text NOT NULL,
  region text,
  url text,
  license text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.guideline_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES public.guideline_sources(id) ON DELETE CASCADE,
  version_label text NOT NULL,
  published_date date,
  status public.guideline_version_status NOT NULL DEFAULT 'draft',
  changelog text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id text NOT NULL REFERENCES public.procedures(id) ON DELETE CASCADE,
  version_id uuid NOT NULL REFERENCES public.guideline_versions(id) ON DELETE CASCADE,
  title text NOT NULL,
  recommendation_text text NOT NULL,
  strength text,
  evidence_level text,
  context_tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  contraindications text,
  "references" jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.guideline_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES public.guideline_versions(id) ON DELETE CASCADE,
  section text,
  chunk_index integer NOT NULL,
  chunk_text text NOT NULL,
  embedding extensions.vector(1536),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (version_id, chunk_index)
);

ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guideline_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guideline_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guideline_chunks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_procedures_specialty
  ON public.procedures (specialty);
CREATE INDEX IF NOT EXISTS idx_procedures_tags_gin
  ON public.procedures USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_procedures_titles_gin
  ON public.procedures USING gin (titles);
CREATE INDEX IF NOT EXISTS idx_procedures_synonyms_gin
  ON public.procedures USING gin (synonyms);

CREATE INDEX IF NOT EXISTS idx_guideline_versions_source_id
  ON public.guideline_versions (source_id);
CREATE INDEX IF NOT EXISTS idx_guideline_versions_status
  ON public.guideline_versions (status);

CREATE INDEX IF NOT EXISTS idx_recommendations_procedure_id
  ON public.recommendations (procedure_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_version_id
  ON public.recommendations (version_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_context_tags_gin
  ON public.recommendations USING gin (context_tags);
CREATE INDEX IF NOT EXISTS idx_recommendations_references_gin
  ON public.recommendations USING gin ("references");

CREATE INDEX IF NOT EXISTS idx_guideline_chunks_version_id
  ON public.guideline_chunks (version_id);

DROP TRIGGER IF EXISTS update_procedures_updated_at ON public.procedures;
CREATE TRIGGER update_procedures_updated_at
  BEFORE UPDATE ON public.procedures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_guideline_versions_updated_at ON public.guideline_versions;
CREATE TRIGGER update_guideline_versions_updated_at
  BEFORE UPDATE ON public.guideline_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_recommendations_updated_at ON public.recommendations;
CREATE TRIGGER update_recommendations_updated_at
  BEFORE UPDATE ON public.recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_guideline_chunks_updated_at ON public.guideline_chunks;
CREATE TRIGGER update_guideline_chunks_updated_at
  BEFORE UPDATE ON public.guideline_chunks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'procedures'
      AND policyname = 'procedures_select_public_v2'
  ) THEN
    CREATE POLICY procedures_select_public_v2
      ON public.procedures
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'procedures'
      AND policyname = 'procedures_insert_admin_v2'
  ) THEN
    CREATE POLICY procedures_insert_admin_v2
      ON public.procedures
      FOR INSERT
      TO authenticated
      WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'procedures'
      AND policyname = 'procedures_update_admin_v2'
  ) THEN
    CREATE POLICY procedures_update_admin_v2
      ON public.procedures
      FOR UPDATE
      TO authenticated
      USING (public.is_admin(auth.uid()))
      WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'procedures'
      AND policyname = 'procedures_delete_admin_v2'
  ) THEN
    CREATE POLICY procedures_delete_admin_v2
      ON public.procedures
      FOR DELETE
      TO authenticated
      USING (public.is_admin(auth.uid()));
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guideline_sources'
      AND policyname = 'guideline_sources_select_public'
  ) THEN
    CREATE POLICY guideline_sources_select_public
      ON public.guideline_sources
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guideline_sources'
      AND policyname = 'guideline_sources_insert_admin'
  ) THEN
    CREATE POLICY guideline_sources_insert_admin
      ON public.guideline_sources
      FOR INSERT
      TO authenticated
      WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guideline_sources'
      AND policyname = 'guideline_sources_update_admin'
  ) THEN
    CREATE POLICY guideline_sources_update_admin
      ON public.guideline_sources
      FOR UPDATE
      TO authenticated
      USING (public.is_admin(auth.uid()))
      WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guideline_sources'
      AND policyname = 'guideline_sources_delete_admin'
  ) THEN
    CREATE POLICY guideline_sources_delete_admin
      ON public.guideline_sources
      FOR DELETE
      TO authenticated
      USING (public.is_admin(auth.uid()));
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guideline_versions'
      AND policyname = 'guideline_versions_select_active'
  ) THEN
    CREATE POLICY guideline_versions_select_active
      ON public.guideline_versions
      FOR SELECT
      TO anon, authenticated
      USING (status = 'active');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guideline_versions'
      AND policyname = 'guideline_versions_select_admin'
  ) THEN
    CREATE POLICY guideline_versions_select_admin
      ON public.guideline_versions
      FOR SELECT
      TO authenticated
      USING (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guideline_versions'
      AND policyname = 'guideline_versions_insert_admin'
  ) THEN
    CREATE POLICY guideline_versions_insert_admin
      ON public.guideline_versions
      FOR INSERT
      TO authenticated
      WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guideline_versions'
      AND policyname = 'guideline_versions_update_admin'
  ) THEN
    CREATE POLICY guideline_versions_update_admin
      ON public.guideline_versions
      FOR UPDATE
      TO authenticated
      USING (public.is_admin(auth.uid()))
      WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guideline_versions'
      AND policyname = 'guideline_versions_delete_admin'
  ) THEN
    CREATE POLICY guideline_versions_delete_admin
      ON public.guideline_versions
      FOR DELETE
      TO authenticated
      USING (public.is_admin(auth.uid()));
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'recommendations'
      AND policyname = 'recommendations_select_active'
  ) THEN
    CREATE POLICY recommendations_select_active
      ON public.recommendations
      FOR SELECT
      TO anon, authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.guideline_versions gv
          WHERE gv.id = recommendations.version_id
            AND gv.status = 'active'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'recommendations'
      AND policyname = 'recommendations_select_admin'
  ) THEN
    CREATE POLICY recommendations_select_admin
      ON public.recommendations
      FOR SELECT
      TO authenticated
      USING (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'recommendations'
      AND policyname = 'recommendations_insert_admin'
  ) THEN
    CREATE POLICY recommendations_insert_admin
      ON public.recommendations
      FOR INSERT
      TO authenticated
      WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'recommendations'
      AND policyname = 'recommendations_update_admin'
  ) THEN
    CREATE POLICY recommendations_update_admin
      ON public.recommendations
      FOR UPDATE
      TO authenticated
      USING (public.is_admin(auth.uid()))
      WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'recommendations'
      AND policyname = 'recommendations_delete_admin'
  ) THEN
    CREATE POLICY recommendations_delete_admin
      ON public.recommendations
      FOR DELETE
      TO authenticated
      USING (public.is_admin(auth.uid()));
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guideline_chunks'
      AND policyname = 'guideline_chunks_select_active'
  ) THEN
    CREATE POLICY guideline_chunks_select_active
      ON public.guideline_chunks
      FOR SELECT
      TO anon, authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.guideline_versions gv
          WHERE gv.id = guideline_chunks.version_id
            AND gv.status = 'active'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guideline_chunks'
      AND policyname = 'guideline_chunks_select_admin'
  ) THEN
    CREATE POLICY guideline_chunks_select_admin
      ON public.guideline_chunks
      FOR SELECT
      TO authenticated
      USING (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guideline_chunks'
      AND policyname = 'guideline_chunks_insert_admin'
  ) THEN
    CREATE POLICY guideline_chunks_insert_admin
      ON public.guideline_chunks
      FOR INSERT
      TO authenticated
      WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guideline_chunks'
      AND policyname = 'guideline_chunks_update_admin'
  ) THEN
    CREATE POLICY guideline_chunks_update_admin
      ON public.guideline_chunks
      FOR UPDATE
      TO authenticated
      USING (public.is_admin(auth.uid()))
      WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guideline_chunks'
      AND policyname = 'guideline_chunks_delete_admin'
  ) THEN
    CREATE POLICY guideline_chunks_delete_admin
      ON public.guideline_chunks
      FOR DELETE
      TO authenticated
      USING (public.is_admin(auth.uid()));
  END IF;
END;
$$;

COMMIT;
