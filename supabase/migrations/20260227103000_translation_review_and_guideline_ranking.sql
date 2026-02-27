ALTER TABLE public.procedures
  ADD COLUMN IF NOT EXISTS specialties jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.procedures
SET specialties = jsonb_build_array(specialty)
WHERE specialties = '[]'::jsonb;

ALTER TABLE public.guidelines
  ADD COLUMN IF NOT EXISTS specialties jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS organization text,
  ADD COLUMN IF NOT EXISTS recommendation_strength integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.procedure_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id text NOT NULL REFERENCES public.procedures(id) ON DELETE CASCADE,
  lang text NOT NULL CHECK (lang IN ('en', 'pt')),
  section text NOT NULL DEFAULT 'quick' CHECK (section IN ('title', 'quick', 'deep')),
  translated_content jsonb NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  review_status text NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (procedure_id, lang, section)
);

ALTER TABLE public.procedure_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read procedure_translations"
  ON public.procedure_translations
  FOR SELECT
  USING (true);

CREATE POLICY "Admin insert procedure_translations"
  ON public.procedure_translations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin update procedure_translations"
  ON public.procedure_translations
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin delete procedure_translations"
  ON public.procedure_translations
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_guidelines_strength
  ON public.guidelines (recommendation_strength DESC);

CREATE INDEX IF NOT EXISTS idx_procedure_translations_lookup
  ON public.procedure_translations (procedure_id, lang, section, review_status);

DROP TRIGGER IF EXISTS update_procedure_translations_updated_at ON public.procedure_translations;
CREATE TRIGGER update_procedure_translations_updated_at
  BEFORE UPDATE ON public.procedure_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
