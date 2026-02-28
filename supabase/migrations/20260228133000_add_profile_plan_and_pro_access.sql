ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';

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

UPDATE public.user_profiles
SET plan = CASE
  WHEN EXISTS (
    SELECT 1
    FROM public.user_entitlements ent
    WHERE ent.user_id = public.user_profiles.user_id
      AND ent.plan_id = 'pro'
      AND ent.active = true
      AND (ent.expires_at IS NULL OR ent.expires_at > now())
  ) THEN 'pro'
  ELSE 'free'
END
WHERE plan IS DISTINCT FROM CASE
  WHEN EXISTS (
    SELECT 1
    FROM public.user_entitlements ent
    WHERE ent.user_id = public.user_profiles.user_id
      AND ent.plan_id = 'pro'
      AND ent.active = true
      AND (ent.expires_at IS NULL OR ent.expires_at > now())
  ) THEN 'pro'
  ELSE 'free'
END;

CREATE OR REPLACE FUNCTION public.has_pro_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.user_profiles profile
      WHERE profile.user_id = auth.uid()
        AND profile.plan = 'pro'
    )
    OR EXISTS (
      SELECT 1
      FROM public.user_entitlements ent
      WHERE ent.user_id = auth.uid()
        AND ent.plan_id = 'pro'
        AND ent.active = true
        AND (ent.expires_at IS NULL OR ent.expires_at > now())
    );
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

DROP POLICY IF EXISTS "Users read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_select_self ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_insert_self ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_update_self ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_manage_admin ON public.user_profiles;

CREATE POLICY user_profiles_select_self
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY user_profiles_insert_self
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_profiles_update_self
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_profiles_manage_admin
  ON public.user_profiles
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DO $$
DECLARE
  has_status boolean;
BEGIN
  IF to_regclass('public.guidelines') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.guidelines ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS guidelines_select_public ON public.guidelines';
    EXECUTE 'DROP POLICY IF EXISTS guidelines_select_pro ON public.guidelines';

    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'guidelines'
        AND column_name = 'status'
    )
    INTO has_status;

    IF has_status THEN
      EXECUTE 'CREATE POLICY guidelines_select_pro ON public.guidelines FOR SELECT USING ((status = ''active'' AND public.has_pro_access()) OR public.is_admin())';
    ELSE
      EXECUTE 'CREATE POLICY guidelines_select_pro ON public.guidelines FOR SELECT USING (public.has_pro_access())';
    END IF;
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.protocoles') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.protocoles ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS protocoles_select_public ON public.protocoles';
    EXECUTE 'DROP POLICY IF EXISTS protocoles_select_pro ON public.protocoles';
    EXECUTE 'CREATE POLICY protocoles_select_pro ON public.protocoles FOR SELECT USING (public.has_pro_access())';
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.alr_blocks') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.alr_blocks ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS alr_blocks_select_public ON public.alr_blocks';
    EXECUTE 'DROP POLICY IF EXISTS alr_blocks_select_pro ON public.alr_blocks';
    EXECUTE 'CREATE POLICY alr_blocks_select_pro ON public.alr_blocks FOR SELECT USING (public.has_pro_access())';
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.procedure_translations') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.procedure_translations ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS procedure_translations_select_public ON public.procedure_translations';
    EXECUTE 'DROP POLICY IF EXISTS procedure_translations_select_pro ON public.procedure_translations';
    EXECUTE 'CREATE POLICY procedure_translations_select_pro ON public.procedure_translations FOR SELECT USING (public.has_pro_access())';
  END IF;
END
$$;
