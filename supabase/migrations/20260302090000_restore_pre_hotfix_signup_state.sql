BEGIN;

-- Restore the pre-hotfix signup/profile behavior from before the emergency
-- no-op and non-blocking trigger changes.

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text,
  created_at timestamptz DEFAULT timezone('utc', now()),
  plan text NOT NULL DEFAULT 'free'
);

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT timezone('utc', now()),
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_profiles_plan_check'
      AND conrelid = 'public.user_profiles'::regclass
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_plan_check
      CHECK (plan IN ('free', 'pro'));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'user_profiles_select_self'
  ) THEN
    CREATE POLICY user_profiles_select_self
      ON public.user_profiles
      FOR SELECT
      USING (auth.uid() = user_id OR public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'user_profiles_insert_self'
  ) THEN
    CREATE POLICY user_profiles_insert_self
      ON public.user_profiles
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'user_profiles_update_self'
  ) THEN
    CREATE POLICY user_profiles_update_self
      ON public.user_profiles
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'user_profiles_manage_admin'
  ) THEN
    CREATE POLICY user_profiles_manage_admin
      ON public.user_profiles
      FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.guard_user_profile_plan()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.plan := COALESCE(NEW.plan, 'free');
    IF NEW.plan <> 'free' THEN
      RAISE EXCEPTION 'Only admins can assign plan values other than free';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    RAISE EXCEPTION 'Only admins can change plan';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_user_profile_plan_insert_update ON public.user_profiles;

CREATE TRIGGER guard_user_profile_plan_insert_update
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_user_profile_plan();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_name text;
BEGIN
  profile_name := NULLIF(
    btrim(
      COALESCE(
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.raw_user_meta_data ->> 'name',
        NEW.raw_user_meta_data ->> 'username',
        ''
      )
    ),
    ''
  );

  INSERT INTO public.user_profiles (user_id, email, name, plan)
  VALUES (NEW.id, NEW.email, profile_name, 'free')
  ON CONFLICT (user_id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.user_profiles.name),
    plan = COALESCE(public.user_profiles.plan, 'free');

  RETURN NEW;
END;
$$;

DO $$
DECLARE
  trigger_row record;
BEGIN
  FOR trigger_row IN
    SELECT trigger_def.tgname
    FROM pg_trigger trigger_def
    JOIN pg_proc proc_def ON proc_def.oid = trigger_def.tgfoid
    JOIN pg_namespace proc_ns ON proc_ns.oid = proc_def.pronamespace
    WHERE trigger_def.tgrelid = 'auth.users'::regclass
      AND NOT trigger_def.tgisinternal
      AND proc_ns.nspname = 'public'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users', trigger_row.tgname);
  END LOOP;
END
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMIT;
