BEGIN;

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role = 'admin'),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT timezone('utc', now());

UPDATE public.user_roles
SET created_at = COALESCE(created_at, timezone('utc', now()))
WHERE created_at IS NULL;

ALTER TABLE public.user_roles
  ALTER COLUMN created_at SET DEFAULT timezone('utc', now()),
  ALTER COLUMN created_at SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_admin_user
  ON public.user_roles (user_id)
  WHERE role::text = 'admin';

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

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin(auth.uid());
$$;

CREATE TABLE IF NOT EXISTS public.import_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  entity text NOT NULL DEFAULT 'procedures',
  source text,
  inserted_count integer NOT NULL DEFAULT 0,
  updated_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.import_logs
  ADD COLUMN IF NOT EXISTS entity text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS import_type text,
  ADD COLUMN IF NOT EXISTS source_filename text,
  ADD COLUMN IF NOT EXISTS inserted_count integer,
  ADD COLUMN IF NOT EXISTS updated_count integer,
  ADD COLUMN IF NOT EXISTS error_count integer,
  ADD COLUMN IF NOT EXISTS success integer,
  ADD COLUMN IF NOT EXISTS failed integer;

UPDATE public.import_logs
SET
  entity = COALESCE(entity, import_type, 'procedures'),
  source = COALESCE(source, source_filename),
  inserted_count = COALESCE(inserted_count, success, 0),
  updated_count = COALESCE(updated_count, 0),
  error_count = COALESCE(error_count, failed, 0),
  errors = COALESCE(errors, '[]'::jsonb)
WHERE
  entity IS NULL
  OR inserted_count IS NULL
  OR updated_count IS NULL
  OR error_count IS NULL
  OR errors IS NULL;

ALTER TABLE public.import_logs
  ALTER COLUMN entity SET DEFAULT 'procedures',
  ALTER COLUMN entity SET NOT NULL,
  ALTER COLUMN inserted_count SET DEFAULT 0,
  ALTER COLUMN inserted_count SET NOT NULL,
  ALTER COLUMN updated_count SET DEFAULT 0,
  ALTER COLUMN updated_count SET NOT NULL,
  ALTER COLUMN error_count SET DEFAULT 0,
  ALTER COLUMN error_count SET NOT NULL,
  ALTER COLUMN errors SET DEFAULT '[]'::jsonb,
  ALTER COLUMN errors SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT timezone('utc', now());

CREATE INDEX IF NOT EXISTS idx_import_logs_entity_created_at
  ON public.import_logs (entity, created_at DESC);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guidelines ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.guidelines
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

UPDATE public.guidelines
SET status = COALESCE(status, 'active')
WHERE status IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE connamespace = 'public'::regnamespace
      AND conname = 'guidelines_status_check'
  ) THEN
    ALTER TABLE public.guidelines
      ADD CONSTRAINT guidelines_status_check
      CHECK (status IN ('draft', 'active', 'archived'));
  END IF;
END;
$$;

ALTER TABLE public.guidelines
  ALTER COLUMN status SET DEFAULT 'active',
  ALTER COLUMN status SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_guidelines_status
  ON public.guidelines (status);

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS user_roles_select_self ON public.user_roles;
DROP POLICY IF EXISTS user_roles_select_admin ON public.user_roles;
DROP POLICY IF EXISTS user_roles_manage_admin ON public.user_roles;

CREATE POLICY user_roles_select_self
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY user_roles_select_admin
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY user_roles_manage_admin
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public read procedures" ON public.procedures;
DROP POLICY IF EXISTS "Admin write procedures" ON public.procedures;
DROP POLICY IF EXISTS "Admin update procedures" ON public.procedures;
DROP POLICY IF EXISTS "Admin delete procedures" ON public.procedures;
DROP POLICY IF EXISTS procedures_select_public_v2 ON public.procedures;
DROP POLICY IF EXISTS procedures_insert_admin_v2 ON public.procedures;
DROP POLICY IF EXISTS procedures_update_admin_v2 ON public.procedures;
DROP POLICY IF EXISTS procedures_delete_admin_v2 ON public.procedures;
DROP POLICY IF EXISTS procedures_select_public ON public.procedures;
DROP POLICY IF EXISTS procedures_insert_admin ON public.procedures;
DROP POLICY IF EXISTS procedures_update_admin ON public.procedures;
DROP POLICY IF EXISTS procedures_delete_admin ON public.procedures;

CREATE POLICY procedures_select_public
  ON public.procedures
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY procedures_insert_admin
  ON public.procedures
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY procedures_update_admin
  ON public.procedures
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY procedures_delete_admin
  ON public.procedures
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Public read guidelines" ON public.guidelines;
DROP POLICY IF EXISTS "Admin write guidelines" ON public.guidelines;
DROP POLICY IF EXISTS "Admin update guidelines" ON public.guidelines;
DROP POLICY IF EXISTS "Admin delete guidelines" ON public.guidelines;
DROP POLICY IF EXISTS guidelines_select_public ON public.guidelines;
DROP POLICY IF EXISTS guidelines_insert_admin ON public.guidelines;
DROP POLICY IF EXISTS guidelines_update_admin ON public.guidelines;
DROP POLICY IF EXISTS guidelines_delete_admin ON public.guidelines;

CREATE POLICY guidelines_select_public
  ON public.guidelines
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY guidelines_insert_admin
  ON public.guidelines
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY guidelines_update_admin
  ON public.guidelines
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY guidelines_delete_admin
  ON public.guidelines
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage import_logs" ON public.import_logs;
DROP POLICY IF EXISTS "Admins can insert import_logs" ON public.import_logs;
DROP POLICY IF EXISTS import_logs_select_admin ON public.import_logs;
DROP POLICY IF EXISTS import_logs_insert_admin ON public.import_logs;
DROP POLICY IF EXISTS import_logs_update_admin ON public.import_logs;
DROP POLICY IF EXISTS import_logs_delete_admin ON public.import_logs;

CREATE POLICY import_logs_select_admin
  ON public.import_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY import_logs_insert_admin
  ON public.import_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY import_logs_update_admin
  ON public.import_logs
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY import_logs_delete_admin
  ON public.import_logs
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

COMMIT;
