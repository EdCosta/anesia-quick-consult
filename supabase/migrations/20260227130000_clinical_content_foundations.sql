ALTER TABLE public.hospital_profiles
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS default_lang text NOT NULL DEFAULT 'fr' CHECK (default_lang IN ('fr', 'en', 'pt')),
  ADD COLUMN IF NOT EXISTS formulary jsonb NOT NULL DEFAULT '{"drug_ids":[],"presentations":[]}'::jsonb,
  ADD COLUMN IF NOT EXISTS protocol_overrides jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.hospital_profiles
SET
  country = COALESCE(country, settings->>'country'),
  default_lang = COALESCE(NULLIF(settings->>'default_lang', ''), default_lang, 'fr'),
  formulary = CASE
    WHEN formulary = '{"drug_ids":[],"presentations":[]}'::jsonb AND jsonb_typeof(settings->'formulary') = 'object'
      THEN settings->'formulary'
    ELSE formulary
  END,
  protocol_overrides = CASE
    WHEN protocol_overrides = '{}'::jsonb AND jsonb_typeof(settings->'protocol_overrides') = 'object'
      THEN settings->'protocol_overrides'
    ELSE protocol_overrides
  END;

ALTER TABLE public.drugs
  ADD COLUMN IF NOT EXISTS presentations jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS standard_dilutions jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS compatibility_notes jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.guidelines
  ADD COLUMN IF NOT EXISTS version text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_at timestamptz,
  ADD COLUMN IF NOT EXISTS evidence_grade text CHECK (evidence_grade IN ('A', 'B', 'C'));

ALTER TABLE public.protocoles
  ADD COLUMN IF NOT EXISTS version text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_at timestamptz,
  ADD COLUMN IF NOT EXISTS evidence_grade text CHECK (evidence_grade IN ('A', 'B', 'C'));

CREATE TABLE IF NOT EXISTS public.tags (
  id text PRIMARY KEY,
  label text NOT NULL,
  category text,
  description text,
  synonyms jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read tags"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Admin write tags"
  ON public.tags FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin update tags"
  ON public.tags FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin delete tags"
  ON public.tags FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_tags_updated_at ON public.tags;
CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.procedure_tags (
  procedure_id text NOT NULL REFERENCES public.procedures(id) ON DELETE CASCADE,
  tag_id text NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (procedure_id, tag_id)
);

ALTER TABLE public.procedure_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read procedure_tags"
  ON public.procedure_tags FOR SELECT
  USING (true);

CREATE POLICY "Admin write procedure_tags"
  ON public.procedure_tags FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin delete procedure_tags"
  ON public.procedure_tags FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.guideline_tags (
  guideline_id text NOT NULL REFERENCES public.guidelines(id) ON DELETE CASCADE,
  tag_id text NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (guideline_id, tag_id)
);

ALTER TABLE public.guideline_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read guideline_tags"
  ON public.guideline_tags FOR SELECT
  USING (true);

CREATE POLICY "Admin write guideline_tags"
  ON public.guideline_tags FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin delete guideline_tags"
  ON public.guideline_tags FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.drug_tags (
  drug_id text NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,
  tag_id text NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (drug_id, tag_id)
);

ALTER TABLE public.drug_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read drug_tags"
  ON public.drug_tags FOR SELECT
  USING (true);

CREATE POLICY "Admin write drug_tags"
  ON public.drug_tags FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin delete drug_tags"
  ON public.drug_tags FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.content_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('procedure', 'drug', 'guideline', 'protocole', 'alr_block', 'hospital_profile', 'tag')),
  entity_id text NOT NULL,
  diff jsonb NOT NULL DEFAULT '{}'::jsonb,
  patch text,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read content_revisions"
  ON public.content_revisions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin write content_revisions"
  ON public.content_revisions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin delete content_revisions"
  ON public.content_revisions FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_guidelines_source ON public.guidelines(source);
CREATE INDEX IF NOT EXISTS idx_guidelines_review_at ON public.guidelines(review_at);
CREATE INDEX IF NOT EXISTS idx_protocoles_source ON public.protocoles(source);
CREATE INDEX IF NOT EXISTS idx_protocoles_review_at ON public.protocoles(review_at);
CREATE INDEX IF NOT EXISTS idx_procedure_tags_tag ON public.procedure_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_guideline_tags_tag ON public.guideline_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_drug_tags_tag ON public.drug_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_content_revisions_entity ON public.content_revisions(entity_type, entity_id, created_at DESC);
