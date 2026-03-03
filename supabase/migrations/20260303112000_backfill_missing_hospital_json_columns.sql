BEGIN;

ALTER TABLE public.hospital_profiles
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS default_lang text NOT NULL DEFAULT 'fr'
    CHECK (default_lang IN ('fr', 'en', 'pt')),
  ADD COLUMN IF NOT EXISTS formulary jsonb NOT NULL DEFAULT '{"drug_ids":[],"presentations":[]}'::jsonb,
  ADD COLUMN IF NOT EXISTS protocol_overrides jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.hospital_profiles
SET
  country = COALESCE(country, settings->>'country'),
  default_lang = COALESCE(NULLIF(settings->>'default_lang', ''), default_lang, 'fr'),
  formulary = CASE
    WHEN formulary = '{"drug_ids":[],"presentations":[]}'::jsonb
      AND jsonb_typeof(settings->'formulary') = 'object'
    THEN settings->'formulary'
    ELSE formulary
  END,
  protocol_overrides = CASE
    WHEN protocol_overrides = '{}'::jsonb
      AND jsonb_typeof(settings->'protocol_overrides') = 'object'
    THEN settings->'protocol_overrides'
    ELSE protocol_overrides
  END;

ALTER TABLE public.drugs
  ADD COLUMN IF NOT EXISTS presentations jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS standard_dilutions jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS compatibility_notes jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMIT;
