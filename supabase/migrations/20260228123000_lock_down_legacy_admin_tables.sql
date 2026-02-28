CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role::text = 'admin'
  );
$$;

DO $$
BEGIN
  IF to_regclass('public.procedures') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS procedures_select_public ON public.procedures';
    EXECUTE 'DROP POLICY IF EXISTS procedures_insert_admin ON public.procedures';
    EXECUTE 'DROP POLICY IF EXISTS procedures_update_admin ON public.procedures';
    EXECUTE 'DROP POLICY IF EXISTS procedures_delete_admin ON public.procedures';
    EXECUTE 'CREATE POLICY procedures_select_public ON public.procedures FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY procedures_insert_admin ON public.procedures FOR INSERT WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY procedures_update_admin ON public.procedures FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY procedures_delete_admin ON public.procedures FOR DELETE USING (public.is_admin())';
  END IF;
END
$$;

DO $$
DECLARE
  has_status boolean;
BEGIN
  IF to_regclass('public.guidelines') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.guidelines ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS guidelines_select_public ON public.guidelines';
    EXECUTE 'DROP POLICY IF EXISTS guidelines_insert_admin ON public.guidelines';
    EXECUTE 'DROP POLICY IF EXISTS guidelines_update_admin ON public.guidelines';
    EXECUTE 'DROP POLICY IF EXISTS guidelines_delete_admin ON public.guidelines';

    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'guidelines'
        AND column_name = 'status'
    )
    INTO has_status;

    IF has_status THEN
      EXECUTE 'CREATE POLICY guidelines_select_public ON public.guidelines FOR SELECT USING (status = ''active'' OR public.is_admin())';
    ELSE
      EXECUTE 'CREATE POLICY guidelines_select_public ON public.guidelines FOR SELECT USING (true)';
    END IF;

    EXECUTE 'CREATE POLICY guidelines_insert_admin ON public.guidelines FOR INSERT WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY guidelines_update_admin ON public.guidelines FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY guidelines_delete_admin ON public.guidelines FOR DELETE USING (public.is_admin())';
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.drugs') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS drugs_select_public ON public.drugs';
    EXECUTE 'DROP POLICY IF EXISTS drugs_insert_admin ON public.drugs';
    EXECUTE 'DROP POLICY IF EXISTS drugs_update_admin ON public.drugs';
    EXECUTE 'DROP POLICY IF EXISTS drugs_delete_admin ON public.drugs';
    EXECUTE 'CREATE POLICY drugs_select_public ON public.drugs FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY drugs_insert_admin ON public.drugs FOR INSERT WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY drugs_update_admin ON public.drugs FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY drugs_delete_admin ON public.drugs FOR DELETE USING (public.is_admin())';
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.protocoles') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.protocoles ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS protocoles_select_public ON public.protocoles';
    EXECUTE 'DROP POLICY IF EXISTS protocoles_insert_admin ON public.protocoles';
    EXECUTE 'DROP POLICY IF EXISTS protocoles_update_admin ON public.protocoles';
    EXECUTE 'DROP POLICY IF EXISTS protocoles_delete_admin ON public.protocoles';
    EXECUTE 'CREATE POLICY protocoles_select_public ON public.protocoles FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY protocoles_insert_admin ON public.protocoles FOR INSERT WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY protocoles_update_admin ON public.protocoles FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY protocoles_delete_admin ON public.protocoles FOR DELETE USING (public.is_admin())';
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.alr_blocks') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.alr_blocks ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS alr_blocks_select_public ON public.alr_blocks';
    EXECUTE 'DROP POLICY IF EXISTS alr_blocks_insert_admin ON public.alr_blocks';
    EXECUTE 'DROP POLICY IF EXISTS alr_blocks_update_admin ON public.alr_blocks';
    EXECUTE 'DROP POLICY IF EXISTS alr_blocks_delete_admin ON public.alr_blocks';
    EXECUTE 'CREATE POLICY alr_blocks_select_public ON public.alr_blocks FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY alr_blocks_insert_admin ON public.alr_blocks FOR INSERT WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY alr_blocks_update_admin ON public.alr_blocks FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY alr_blocks_delete_admin ON public.alr_blocks FOR DELETE USING (public.is_admin())';
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.hospital_profiles') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.hospital_profiles ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS hospital_profiles_select_public ON public.hospital_profiles';
    EXECUTE 'DROP POLICY IF EXISTS hospital_profiles_insert_admin ON public.hospital_profiles';
    EXECUTE 'DROP POLICY IF EXISTS hospital_profiles_update_admin ON public.hospital_profiles';
    EXECUTE 'DROP POLICY IF EXISTS hospital_profiles_delete_admin ON public.hospital_profiles';
    EXECUTE 'CREATE POLICY hospital_profiles_select_public ON public.hospital_profiles FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY hospital_profiles_insert_admin ON public.hospital_profiles FOR INSERT WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY hospital_profiles_update_admin ON public.hospital_profiles FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY hospital_profiles_delete_admin ON public.hospital_profiles FOR DELETE USING (public.is_admin())';
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.drug_presentations') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.drug_presentations ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS drug_presentations_select_public ON public.drug_presentations';
    EXECUTE 'DROP POLICY IF EXISTS drug_presentations_insert_admin ON public.drug_presentations';
    EXECUTE 'DROP POLICY IF EXISTS drug_presentations_update_admin ON public.drug_presentations';
    EXECUTE 'DROP POLICY IF EXISTS drug_presentations_delete_admin ON public.drug_presentations';
    EXECUTE 'CREATE POLICY drug_presentations_select_public ON public.drug_presentations FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY drug_presentations_insert_admin ON public.drug_presentations FOR INSERT WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY drug_presentations_update_admin ON public.drug_presentations FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY drug_presentations_delete_admin ON public.drug_presentations FOR DELETE USING (public.is_admin())';
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.standard_dilutions') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.standard_dilutions ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS standard_dilutions_select_public ON public.standard_dilutions';
    EXECUTE 'DROP POLICY IF EXISTS standard_dilutions_insert_admin ON public.standard_dilutions';
    EXECUTE 'DROP POLICY IF EXISTS standard_dilutions_update_admin ON public.standard_dilutions';
    EXECUTE 'DROP POLICY IF EXISTS standard_dilutions_delete_admin ON public.standard_dilutions';
    EXECUTE 'CREATE POLICY standard_dilutions_select_public ON public.standard_dilutions FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY standard_dilutions_insert_admin ON public.standard_dilutions FOR INSERT WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY standard_dilutions_update_admin ON public.standard_dilutions FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY standard_dilutions_delete_admin ON public.standard_dilutions FOR DELETE USING (public.is_admin())';
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.hospital_drug_availability') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.hospital_drug_availability ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS hospital_drug_availability_select_public ON public.hospital_drug_availability';
    EXECUTE 'DROP POLICY IF EXISTS hospital_drug_availability_insert_admin ON public.hospital_drug_availability';
    EXECUTE 'DROP POLICY IF EXISTS hospital_drug_availability_update_admin ON public.hospital_drug_availability';
    EXECUTE 'DROP POLICY IF EXISTS hospital_drug_availability_delete_admin ON public.hospital_drug_availability';
    EXECUTE 'CREATE POLICY hospital_drug_availability_select_public ON public.hospital_drug_availability FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY hospital_drug_availability_insert_admin ON public.hospital_drug_availability FOR INSERT WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY hospital_drug_availability_update_admin ON public.hospital_drug_availability FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY hospital_drug_availability_delete_admin ON public.hospital_drug_availability FOR DELETE USING (public.is_admin())';
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.procedure_translations') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.procedure_translations ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS procedure_translations_select_public ON public.procedure_translations';
    EXECUTE 'DROP POLICY IF EXISTS procedure_translations_insert_admin ON public.procedure_translations';
    EXECUTE 'DROP POLICY IF EXISTS procedure_translations_update_admin ON public.procedure_translations';
    EXECUTE 'DROP POLICY IF EXISTS procedure_translations_delete_admin ON public.procedure_translations';
    EXECUTE 'CREATE POLICY procedure_translations_select_public ON public.procedure_translations FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY procedure_translations_insert_admin ON public.procedure_translations FOR INSERT WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY procedure_translations_update_admin ON public.procedure_translations FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY procedure_translations_delete_admin ON public.procedure_translations FOR DELETE USING (public.is_admin())';
  END IF;
END
$$;
