-- ══════════════════════════════════════════════════════════════════════════════
-- AnesIA — Clinical Content Foundations + Presentations/Dilutions/Formulary
-- Applies pending foundations (procedure_translations, tags, content_revisions)
-- + NEW: drug_presentations, standard_dilutions, hospital_drug_availability
-- Safe to apply once; uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS throughout.
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── 1. PROCEDURE TABLE EXTENSIONS ───────────────────────────────────────────

ALTER TABLE public.procedures
  ADD COLUMN IF NOT EXISTS specialties jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Back-fill from existing specialty column
UPDATE public.procedures
SET specialties = jsonb_build_array(specialty)
WHERE specialties = '[]'::jsonb AND specialty IS NOT NULL;

-- ─── 2. GUIDELINES / PROTOCOLES EXTENSIONS ───────────────────────────────────

ALTER TABLE public.guidelines
  ADD COLUMN IF NOT EXISTS specialties           jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS organization          text,
  ADD COLUMN IF NOT EXISTS recommendation_strength integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS version               text,
  ADD COLUMN IF NOT EXISTS source                text,
  ADD COLUMN IF NOT EXISTS published_at          timestamptz,
  ADD COLUMN IF NOT EXISTS review_at             timestamptz,
  ADD COLUMN IF NOT EXISTS evidence_grade        text CHECK (evidence_grade IN ('A', 'B', 'C'));

ALTER TABLE public.protocoles
  ADD COLUMN IF NOT EXISTS version               text,
  ADD COLUMN IF NOT EXISTS source                text,
  ADD COLUMN IF NOT EXISTS published_at          timestamptz,
  ADD COLUMN IF NOT EXISTS review_at             timestamptz,
  ADD COLUMN IF NOT EXISTS evidence_grade        text CHECK (evidence_grade IN ('A', 'B', 'C'));

CREATE INDEX IF NOT EXISTS idx_guidelines_strength   ON public.guidelines (recommendation_strength DESC);
CREATE INDEX IF NOT EXISTS idx_guidelines_source     ON public.guidelines (source);
CREATE INDEX IF NOT EXISTS idx_guidelines_review_at  ON public.guidelines (review_at);
CREATE INDEX IF NOT EXISTS idx_protocoles_source     ON public.protocoles (source);
CREATE INDEX IF NOT EXISTS idx_protocoles_review_at  ON public.protocoles (review_at);

-- ─── 3. PROCEDURE TRANSLATIONS ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.procedure_translations (
  id               uuid       PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id     text       NOT NULL REFERENCES public.procedures(id) ON DELETE CASCADE,
  lang             text       NOT NULL CHECK (lang IN ('en', 'pt')),
  section          text       NOT NULL DEFAULT 'quick' CHECK (section IN ('title', 'quick', 'deep')),
  translated_content jsonb    NOT NULL,
  generated_at     timestamptz NOT NULL DEFAULT now(),
  review_status    text       NOT NULL DEFAULT 'pending'
                              CHECK (review_status IN ('pending', 'approved', 'rejected')),
  reviewed_at      timestamptz,
  reviewed_by      uuid       REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (procedure_id, lang, section)
);

ALTER TABLE public.procedure_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read procedure_translations"
  ON public.procedure_translations FOR SELECT USING (true);
CREATE POLICY "Admin insert procedure_translations"
  ON public.procedure_translations FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update procedure_translations"
  ON public.procedure_translations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete procedure_translations"
  ON public.procedure_translations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_procedure_translations_lookup
  ON public.procedure_translations (procedure_id, lang, section, review_status);

DROP TRIGGER IF EXISTS update_procedure_translations_updated_at ON public.procedure_translations;
CREATE TRIGGER update_procedure_translations_updated_at
  BEFORE UPDATE ON public.procedure_translations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 4. TAGS — normalized clinical vocabulary ─────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tags (
  id          text PRIMARY KEY,
  label       text NOT NULL,
  category    text,            -- 'specialty' | 'population' | 'safety' | 'complication'
  description text,
  synonyms    jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read tags"      ON public.tags FOR SELECT USING (true);
CREATE POLICY "Admin write tags"      ON public.tags FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update tags"     ON public.tags FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete tags"     ON public.tags FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_tags_updated_at ON public.tags;
CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Junction: procedure ↔ tag
CREATE TABLE IF NOT EXISTS public.procedure_tags (
  procedure_id text NOT NULL REFERENCES public.procedures(id) ON DELETE CASCADE,
  tag_id       text NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (procedure_id, tag_id)
);
ALTER TABLE public.procedure_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read procedure_tags"
  ON public.procedure_tags FOR SELECT USING (true);
CREATE POLICY "Admin write procedure_tags"
  ON public.procedure_tags FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete procedure_tags"
  ON public.procedure_tags FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX IF NOT EXISTS idx_procedure_tags_tag ON public.procedure_tags (tag_id);

-- Junction: guideline ↔ tag
CREATE TABLE IF NOT EXISTS public.guideline_tags (
  guideline_id text NOT NULL REFERENCES public.guidelines(id) ON DELETE CASCADE,
  tag_id       text NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (guideline_id, tag_id)
);
ALTER TABLE public.guideline_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read guideline_tags"
  ON public.guideline_tags FOR SELECT USING (true);
CREATE POLICY "Admin write guideline_tags"
  ON public.guideline_tags FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete guideline_tags"
  ON public.guideline_tags FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX IF NOT EXISTS idx_guideline_tags_tag ON public.guideline_tags (tag_id);

-- Junction: drug ↔ tag
CREATE TABLE IF NOT EXISTS public.drug_tags (
  drug_id    text NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,
  tag_id     text NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (drug_id, tag_id)
);
ALTER TABLE public.drug_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read drug_tags"
  ON public.drug_tags FOR SELECT USING (true);
CREATE POLICY "Admin write drug_tags"
  ON public.drug_tags FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete drug_tags"
  ON public.drug_tags FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX IF NOT EXISTS idx_drug_tags_tag ON public.drug_tags (tag_id);

-- ─── 5. CONTENT REVISIONS — audit trail ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.content_revisions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL
              CHECK (entity_type IN ('procedure','drug','guideline','protocole',
                                     'alr_block','hospital_profile','tag')),
  entity_id   text NOT NULL,
  diff        jsonb NOT NULL DEFAULT '{}'::jsonb,   -- {field: [old, new]}
  patch       text,                                  -- optional text diff / git patch
  author_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read content_revisions"
  ON public.content_revisions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin write content_revisions"
  ON public.content_revisions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete content_revisions"
  ON public.content_revisions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_content_revisions_entity
  ON public.content_revisions (entity_type, entity_id, created_at DESC);

-- ─── 6. HOSPITAL PROFILES EXTENSIONS ─────────────────────────────────────────

ALTER TABLE public.hospital_profiles
  ADD COLUMN IF NOT EXISTS country      text,
  ADD COLUMN IF NOT EXISTS default_lang text NOT NULL DEFAULT 'fr'
                            CHECK (default_lang IN ('fr', 'en', 'pt'));

-- drugs.compatibility_notes (keeps JSONB compatibility matrix — intentionally JSONB)
ALTER TABLE public.drugs
  ADD COLUMN IF NOT EXISTS compatibility_notes jsonb NOT NULL DEFAULT '[]'::jsonb;

-- ─── 7. DRUG PRESENTATIONS ────────────────────────────────────────────────────
-- First-class commercial presentations; mg_per_ml is auto-computed.
-- µg-dosed drugs: store mg (e.g. 500 µg fentanyl → total_mg = 0.5)

CREATE TABLE IF NOT EXISTS public.drug_presentations (
  id           uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_id      text  NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,
  label        text  NOT NULL,                    -- "Morphine 100mg/10mL"
  total_mg     numeric,                           -- NULL for gas/inhaled forms
  total_ml     numeric,                           -- NULL for solid/powder forms
  mg_per_ml    numeric GENERATED ALWAYS AS (
    CASE WHEN total_ml IS NOT NULL AND total_ml > 0 AND total_mg IS NOT NULL
      THEN total_mg / total_ml ELSE NULL END
  ) STORED,
  solvent      text,                              -- "eau PPI","propylène glycol",NULL
  form         text NOT NULL
               CHECK (form IN ('ampoule','flacon','seringue_preremplie',
                               'comprimes','patch','inhale',
                               'poudre_lyophilisee','autre')),
  is_reference bool NOT NULL DEFAULT false,       -- canonical presentation for UI default
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (drug_id, label)
);

ALTER TABLE public.drug_presentations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read drug_presentations"
  ON public.drug_presentations FOR SELECT USING (true);
CREATE POLICY "Admin write drug_presentations"
  ON public.drug_presentations FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update drug_presentations"
  ON public.drug_presentations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete drug_presentations"
  ON public.drug_presentations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_drug_presentations_drug ON public.drug_presentations (drug_id);

DROP TRIGGER IF EXISTS update_drug_presentations_updated_at ON public.drug_presentations;
CREATE TRIGGER update_drug_presentations_updated_at
  BEFORE UPDATE ON public.drug_presentations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 8. STANDARD DILUTIONS ────────────────────────────────────────────────────
-- Validated IVSE/bolus prep recipes (syringe 10/20/50 mL or bag).
-- mg_per_ml stored in mg (µg drugs: 50 µg/mL → 0.05 mg/mL).

CREATE TABLE IF NOT EXISTS public.standard_dilutions (
  id                             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_id                        text NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,
  presentation_id                uuid REFERENCES public.drug_presentations(id) ON DELETE SET NULL,
  label                          text NOT NULL,
  -- container: exactly one of syringe_ml or bag_ml must be non-null
  syringe_ml                     int  CHECK (syringe_ml IN (10, 20, 50)),
  bag_ml                         int,
  target_concentration_label     text NOT NULL,     -- "0.16 mg/mL (160 µg/mL)"
  target_concentration_mg_per_ml numeric NOT NULL,
  diluent                        text NOT NULL DEFAULT 'NaCl 0.9%',
  drug_volume_ml                 numeric,            -- mL of stock to draw
  diluent_volume_ml              numeric,            -- mL of diluent to add
  notes                          text,
  created_at                     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (drug_id, label)
);

ALTER TABLE public.standard_dilutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read standard_dilutions"
  ON public.standard_dilutions FOR SELECT USING (true);
CREATE POLICY "Admin write standard_dilutions"
  ON public.standard_dilutions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update standard_dilutions"
  ON public.standard_dilutions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete standard_dilutions"
  ON public.standard_dilutions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_standard_dilutions_drug ON public.standard_dilutions (drug_id);

-- ─── 9. HOSPITAL DRUG AVAILABILITY ───────────────────────────────────────────
-- Per-hospital formulary: mark drugs unavailable, note alternatives,
-- pin preferred presentation and dilution for calculators.

CREATE TABLE IF NOT EXISTS public.hospital_drug_availability (
  hospital_id              text NOT NULL REFERENCES public.hospital_profiles(id) ON DELETE CASCADE,
  drug_id                  text NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,
  is_available             bool NOT NULL DEFAULT true,
  preferred_presentation_id uuid REFERENCES public.drug_presentations(id) ON DELETE SET NULL,
  preferred_dilution_id    uuid REFERENCES public.standard_dilutions(id) ON DELETE SET NULL,
  alternative_drug_id      text REFERENCES public.drugs(id) ON DELETE SET NULL,
  local_note               text,                   -- "Rupture de stock — utiliser sufentanil"
  updated_at               timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (hospital_id, drug_id)
);

ALTER TABLE public.hospital_drug_availability ENABLE ROW LEVEL SECURITY;

-- Hospital members read their own formulary; only admin writes
CREATE POLICY "Hospital members read availability"
  ON public.hospital_drug_availability FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Admin write availability"
  ON public.hospital_drug_availability FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update availability"
  ON public.hospital_drug_availability FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete availability"
  ON public.hospital_drug_availability FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_hospital_drug_avail_drug
  ON public.hospital_drug_availability (drug_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- SEED DATA
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── S1. CANONICAL TAGS ───────────────────────────────────────────────────────

INSERT INTO public.tags (id, label, category, description, synonyms) VALUES
  ('airway',      'Airway',           'specialty',    'Gestion des voies aériennes : ISR, abord chirurgical, voie difficile',
                  '["voies aériennes","difficult airway","RSI","vias aéreas"]'),
  ('neuraxial',   'Neuraxial',        'specialty',    'Rachianesthésie, péridurale, CSE — technique et timing anticoag',
                  '["rachianesthésie","péridurale","spinal","epidural","raqui"]'),
  ('anticoag',    'Anticoagulation',  'safety',       'Gestion périopératoire des anticoagulants et ponts',
                  '["anticoagulation","héparine","AOD","NACO","bridging"]'),
  ('ponv',        'PONV',             'complication', 'Nausées/vomissements postopératoires — prévention et traitement',
                  '["NVPO","nausées postop","nausea","vomiting"]'),
  ('paeds',       'Pédiatrie',        'population',   'Ajustements posologiques et précautions chez l''enfant',
                  '["pédiatrie","pediatrics","enfant","peds","paediatrics"]'),
  ('ob',          'Obstétrique',      'population',   'Anesthésie obstétricale — parturiente, césarienne, péridurale de travail',
                  '["obstétrique","obstétrical","obstetrics","maternité","parturiente"]'),
  ('regional',    'Locorégional',     'specialty',    'Blocs nerveux périphériques et ALR',
                  '["ALR","bloc","nerve block","regional","locorégional"]'),
  ('cardiac',     'Cardiologie',      'specialty',    'Anesthésie cardiaque et patients à haut risque CV',
                  '["cardiaque","cardiac","cardiovasculaire","haut risque CV"]'),
  ('icu',         'Réanimation',      'specialty',    'Sédation, analgésie et protocoles de réanimation',
                  '["réanimation","ICU","sédation","soins intensifs"]'),
  ('trauma',      'Trauma',           'urgency',      'Damage control, choc hémorragique et anesthésie en urgence',
                  '["trauma","urgence","damage control","choc"]'),
  ('difficult_airway', 'Voie difficile', 'safety',    'Algorithme de prise en charge de la voie difficile',
                  '["voie difficile","difficult airway","CICV","can''t intubate"]'),
  ('allergy',     'Allergie/Anaphylaxie', 'safety',   'Réaction anaphylactique et gestion des allergies perop',
                  '["allergie","anaphylaxie","anaphylaxis"]')
ON CONFLICT (id) DO NOTHING;

-- ─── S2. DRUG TAGS (link seeded drugs to canonical tags) ─────────────────────

INSERT INTO public.drug_tags (drug_id, tag_id) VALUES
  -- analgésie
  ('paracetamol',      'ponv'),
  ('morphine',         'ponv'),
  ('morphine',         'icu'),
  ('ketamine',         'airway'),
  ('ketamine',         'icu'),
  ('ketamine',         'trauma'),
  ('lidocaine',        'neuraxial'),
  ('lidocaine',        'regional'),
  -- induction / airway
  ('propofol',         'airway'),
  ('etomidate',        'airway'),
  ('etomidate',        'trauma'),
  ('rocuronium',       'airway'),
  ('rocuronium',       'difficult_airway'),
  ('sugammadex',       'airway'),
  ('sugammadex',       'difficult_airway'),
  -- neuraxial
  ('bupivacaine',      'neuraxial'),
  ('bupivacaine',      'regional'),
  ('bupivacaine',      'ob'),
  ('sufentanil',       'neuraxial'),
  ('sufentanil',       'ob'),
  ('fentanyl',         'neuraxial'),
  ('fentanyl',         'ob'),
  -- PONV
  ('ondansetron',      'ponv'),
  ('dexamethasone',    'ponv'),
  -- anticoag
  ('enoxaparine',      'anticoag'),
  ('enoxaparine',      'neuraxial'),
  -- vasopresseurs
  ('ephedrine',        'ob'),
  ('ephedrine',        'neuraxial'),
  ('phenylephrine',    'ob'),
  ('phenylephrine',    'neuraxial'),
  ('noradrenaline',    'icu'),
  ('noradrenaline',    'trauma'),
  -- pédiatrie
  ('atropine',         'paeds'),
  ('ketamine',         'paeds'),
  -- antibioprophylaxie
  ('cefazoline',       'airway'),
  -- antifibrinolytique
  ('acide_tranexamique', 'trauma'),
  ('acide_tranexamique', 'ob')
ON CONFLICT DO NOTHING;

-- ─── S3. DRUG PRESENTATIONS ───────────────────────────────────────────────────
-- total_mg in mg; µg drugs stored as mg (500 µg → 0.5 mg)
-- is_reference = true → default shown in UI/calculators

INSERT INTO public.drug_presentations
  (drug_id, label, total_mg, total_ml, solvent, form, is_reference) VALUES

-- ── Morphine ──────────────────────────────────────────────────────────────────
('morphine',    'Morphine 100mg/10mL (10mg/mL)',          100,    10,   NULL, 'ampoule', true),
('morphine',    'Morphine 20mg/2mL (10mg/mL)',             20,     2,   NULL, 'ampoule', false),

-- ── Fentanyl ─────────────────────────────────────────────────────────────────
-- 500 µg / 10 mL = 50 µg/mL = 0.05 mg/mL
('fentanyl',    'Fentanyl 500µg/10mL (50µg/mL)',          0.5,   10,   NULL, 'ampoule', true),
('fentanyl',    'Fentanyl 100µg/2mL (50µg/mL)',           0.1,    2,   NULL, 'ampoule', false),

-- ── Sufentanil ───────────────────────────────────────────────────────────────
-- 250 µg / 50 mL = 5 µg/mL = 0.005 mg/mL
('sufentanil',  'Sufentanil 250µg/50mL (5µg/mL)',         0.25,  50,   NULL, 'ampoule', true),
-- 50 µg / 1 mL = 50 µg/mL = 0.05 mg/mL
('sufentanil',  'Sufentanil 50µg/1mL (50µg/mL)',          0.05,   1,   NULL, 'ampoule', false),

-- ── Rémifentanil (poudre lyophilisée) ────────────────────────────────────────
('remifentanil','Rémifentanil 1mg poudre lyoph.',           1,   NULL,  'eau PPI', 'poudre_lyophilisee', false),
('remifentanil','Rémifentanil 2mg poudre lyoph.',           2,   NULL,  'eau PPI', 'poudre_lyophilisee', false),
('remifentanil','Rémifentanil 5mg poudre lyoph.',           5,   NULL,  'eau PPI', 'poudre_lyophilisee', true),

-- ── Kétamine ─────────────────────────────────────────────────────────────────
('ketamine',    'Kétamine 200mg/20mL (10mg/mL)',          200,   20,   NULL, 'flacon', true),
('ketamine',    'Kétamine 500mg/10mL (50mg/mL)',          500,   10,   NULL, 'flacon', false),

-- ── Propofol ─────────────────────────────────────────────────────────────────
('propofol',    'Propofol 1% 200mg/20mL',                 200,   20,   NULL, 'ampoule', false),
('propofol',    'Propofol 1% 500mg/50mL',                 500,   50,   NULL, 'flacon',  true),
('propofol',    'Propofol 2% 1000mg/50mL',               1000,   50,   NULL, 'flacon',  false),

-- ── Midazolam ────────────────────────────────────────────────────────────────
('midazolam',   'Midazolam 5mg/5mL (1mg/mL)',               5,    5,   NULL, 'ampoule', false),
('midazolam',   'Midazolam 50mg/10mL (5mg/mL)',            50,   10,   NULL, 'ampoule', true),

-- ── Étomidate ────────────────────────────────────────────────────────────────
('etomidate',   'Étomidate 20mg/10mL (2mg/mL)',            20,   10,   'propylène glycol', 'ampoule', true),

-- ── Rocuronium ───────────────────────────────────────────────────────────────
('rocuronium',  'Rocuronium 50mg/5mL (10mg/mL)',            50,   5,   NULL, 'ampoule', false),
('rocuronium',  'Rocuronium 100mg/10mL (10mg/mL)',         100,  10,   NULL, 'ampoule', true),

-- ── Sugammadex ───────────────────────────────────────────────────────────────
('sugammadex',  'Sugammadex 200mg/2mL (100mg/mL)',         200,   2,   NULL, 'ampoule', false),
('sugammadex',  'Sugammadex 500mg/5mL (100mg/mL)',         500,   5,   NULL, 'ampoule', true),

-- ── Lidocaïne ────────────────────────────────────────────────────────────────
('lidocaine',   'Lidocaïne 1% 200mg/20mL',                200,  20,   NULL, 'ampoule', false),
('lidocaine',   'Lidocaïne 2% 400mg/20mL',                400,  20,   NULL, 'ampoule', true),

-- ── Bupivacaïne ──────────────────────────────────────────────────────────────
('bupivacaine', 'Bupivacaïne 0,25% 25mg/10mL',             25,  10,   NULL, 'ampoule', false),
('bupivacaine', 'Bupivacaïne 0,5% 50mg/10mL',              50,  10,   NULL, 'ampoule', false),
('bupivacaine', 'Bupivacaïne hyperbare 0,5% 15mg/3mL',     15,   3,   NULL, 'seringue_preremplie', true),

-- ── Noradrénaline ────────────────────────────────────────────────────────────
('noradrenaline','Noradrénaline 8mg/8mL (1mg/mL)',           8,   8,   NULL, 'ampoule', true),
('noradrenaline','Noradrénaline 4mg/4mL (1mg/mL)',           4,   4,   NULL, 'ampoule', false),

-- ── Éphédrine ────────────────────────────────────────────────────────────────
('ephedrine',   'Éphédrine 30mg/1mL',                      30,   1,   NULL, 'ampoule', true),

-- ── Phényléphrine ────────────────────────────────────────────────────────────
('phenylephrine','Phényléphrine 10mg/1mL',                  10,   1,   NULL, 'ampoule', true),

-- ── Atropine ─────────────────────────────────────────────────────────────────
('atropine',    'Atropine 0,5mg/1mL',                     0.5,   1,   NULL, 'ampoule', false),
('atropine',    'Atropine 1mg/1mL',                       1.0,   1,   NULL, 'ampoule', true),

-- ── Ondansétron ──────────────────────────────────────────────────────────────
('ondansetron', 'Ondansétron 4mg/2mL (2mg/mL)',              4,   2,   NULL, 'ampoule', true),
('ondansetron', 'Ondansétron 8mg/4mL (2mg/mL)',              8,   4,   NULL, 'ampoule', false),

-- ── Dexaméthasone ────────────────────────────────────────────────────────────
('dexamethasone','Dexaméthasone 4mg/1mL',                    4,   1,   NULL, 'ampoule', false),
('dexamethasone','Dexaméthasone 8mg/2mL',                    8,   2,   NULL, 'ampoule', true),

-- ── Paracétamol IV ───────────────────────────────────────────────────────────
('paracetamol', 'Paracétamol IV 1g/100mL (10mg/mL)',      1000, 100,  NULL, 'flacon', true),

-- ── Céfazoline ───────────────────────────────────────────────────────────────
('cefazoline',  'Céfazoline 1g poudre lyoph.',            1000,  NULL, 'NaCl 0.9%', 'poudre_lyophilisee', false),
('cefazoline',  'Céfazoline 2g poudre lyoph.',            2000,  NULL, 'NaCl 0.9%', 'poudre_lyophilisee', true),

-- ── Acide tranexamique ───────────────────────────────────────────────────────
('acide_tranexamique','Acide tranexamique 500mg/5mL (100mg/mL)',  500,   5,  NULL, 'ampoule', false),
('acide_tranexamique','Acide tranexamique 1g/10mL (100mg/mL)',   1000,  10,  NULL, 'ampoule', true),

-- ── Énoxaparine ──────────────────────────────────────────────────────────────
('enoxaparine', 'Énoxaparine 40mg/0,4mL (100mg/mL)',       40,  0.4,  NULL, 'seringue_preremplie', true),
('enoxaparine', 'Énoxaparine 60mg/0,6mL (100mg/mL)',       60,  0.6,  NULL, 'seringue_preremplie', false),

-- ── Ibuprofène ───────────────────────────────────────────────────────────────
('ibuprofene',  'Ibuprofène 400mg comprimé',              400,   NULL, NULL, 'comprimes', true),
('ibuprofene',  'Ibuprofène IV 400mg/100mL',              400,  100,  NULL, 'flacon', false),

-- ── Kétorolac ────────────────────────────────────────────────────────────────
('ketorolac',   'Kétorolac 30mg/1mL',                     30,    1,   NULL, 'ampoule', true)

ON CONFLICT (drug_id, label) DO NOTHING;

-- ─── S4. STANDARD DILUTIONS ───────────────────────────────────────────────────
-- All concentrations in mg/mL (µg drugs follow same convention).
-- Notes give practical bedside instructions.

INSERT INTO public.standard_dilutions
  (drug_id, label, syringe_ml, bag_ml,
   target_concentration_label, target_concentration_mg_per_ml,
   diluent, drug_volume_ml, diluent_volume_ml, notes) VALUES

-- ── Noradrénaline IVSE ────────────────────────────────────────────────────────
-- 8 mg ampoule 8mL → + 42 mL NaCl = 50 mL à 0,16 mg/mL (160 µg/mL)
('noradrenaline',
 'Noradrénaline IVSE 50mL — 0,16 mg/mL',
 50, NULL,
 '0,16 mg/mL (160 µg/mL)',  0.16,
 'NaCl 0.9%', 8, 42,
 'Injecter 8 mL ampoule 1 mg/mL + 42 mL NaCl → 50 mL. '
 'Débit habituel 1–15 mL/h. VVC de préférence.'),

-- Alternative légère pour patient moins critique
('noradrenaline',
 'Noradrénaline IVSE 50mL — 0,08 mg/mL',
 50, NULL,
 '0,08 mg/mL (80 µg/mL)',   0.08,
 'NaCl 0.9%', 4, 46,
 '4 mL ampoule 1 mg/mL + 46 mL NaCl → 50 mL. '
 'Dilution allégée pour faibles posologies ou VVP.'),

-- ── Rémifentanil IVSE ─────────────────────────────────────────────────────────
-- Flacon 5 mg lyoph → reconstituer 5 mg/5 mL (1 mg/mL) → prendre 5 mL + 45 mL G5% = 100 µg/mL
('remifentanil',
 'Rémifentanil IVSE 50mL — 100 µg/mL (flacon 5mg)',
 50, NULL,
 '0,1 mg/mL (100 µg/mL)',   0.1,
 'Glucose 5%', 5, 45,
 'Reconstituer 5 mg en 5 mL eau PPI → prendre 5 mL + 45 mL G5%. '
 'TIVA : entretien 0,1–0,5 µg/kg/min. Arrêter 3–5 min avant fin.'),

-- Flacon 1 mg → 1 mL + 49 mL G5% = 20 µg/mL (pediatrie / faibles posologies)
('remifentanil',
 'Rémifentanil IVSE 50mL — 20 µg/mL (flacon 1mg)',
 50, NULL,
 '0,02 mg/mL (20 µg/mL)',   0.02,
 'Glucose 5%', 1, 49,
 'Reconstituer 1 mg en 1 mL eau PPI → prendre 1 mL + 49 mL G5%. '
 'Dilution allégée : pédiatrie ou adulte fragile.'),

-- ── Propofol TIVA ─────────────────────────────────────────────────────────────
-- Remplir directement la seringue depuis le flacon 1 % — pas de dilution
('propofol',
 'Propofol TIVA 50mL — 1% (10 mg/mL)',
 50, NULL,
 '10 mg/mL (1 %)',           10,
 'Aucun (prêt à l''emploi)', 50, 0,
 'Aspirer 50 mL de propofol 1% directement — aucune dilution. '
 'Objectif BIS 40–60. Changer seringue toutes 12 h max.'),

('propofol',
 'Propofol TIVA 50mL — 2% (20 mg/mL)',
 50, NULL,
 '20 mg/mL (2 %)',           20,
 'Aucun (prêt à l''emploi)', 50, 0,
 'Aspirer 50 mL de propofol 2% directement — aucune dilution. '
 'Volumes réduits de moitié vs 1 %. Idéal restriction hydrique.'),

-- ── Morphine IVSE/PCA ─────────────────────────────────────────────────────────
-- 5 mL (10 mg/mL) + 45 mL NaCl = 50 mL à 1 mg/mL
('morphine',
 'Morphine IVSE 50mL — 1 mg/mL',
 50, NULL,
 '1 mg/mL',                  1.0,
 'NaCl 0.9%', 5, 45,
 '5 mL ampoule 10 mg/mL + 45 mL NaCl → 50 mL. '
 'Titration adulte : bolus 2–3 mg /5 min. PCA : bolus 1–2 mg, intervalle 10 min.'),

-- ── Kétamine IVSE sub-anesthésique ────────────────────────────────────────────
-- 10 mL (10 mg/mL) + 40 mL NaCl = 50 mL à 2 mg/mL
('ketamine',
 'Kétamine IVSE 50mL — 2 mg/mL (co-analgésie)',
 50, NULL,
 '2 mg/mL',                  2.0,
 'NaCl 0.9%', 10, 40,
 '10 mL flacon 10 mg/mL + 40 mL NaCl → 50 mL. '
 'Dose sub-anesthésique : 0,1–0,2 mg/kg/h. '
 'Épargne morphinique. Associer benzodiazépine si hallucinations.'),

-- ── Midazolam sédation IVSE ───────────────────────────────────────────────────
-- 10 mL (5 mg/mL) + 40 mL NaCl = 50 mL à 1 mg/mL
('midazolam',
 'Midazolam sédation IVSE 50mL — 1 mg/mL',
 50, NULL,
 '1 mg/mL',                  1.0,
 'NaCl 0.9%', 10, 40,
 '10 mL ampoule 5 mg/mL + 40 mL NaCl → 50 mL. '
 'Sédation légère : 0,02–0,1 mg/kg/h. Réveiller quotidiennement.'),

-- ── Lidocaïne IVSE systémique (anti-hyperalgésique) ──────────────────────────
-- 20 mL (20 mg/mL = 2%) + 30 mL NaCl = 50 mL à 8 mg/mL
('lidocaine',
 'Lidocaïne IVSE 50mL — 8 mg/mL (analgésie)',
 50, NULL,
 '8 mg/mL',                  8.0,
 'NaCl 0.9%', 20, 30,
 '20 mL ampoule 2% + 30 mL NaCl → 50 mL. '
 'Bolus induction : 1,5 mg/kg sur 5 min. Entretien : 1–2 mg/kg/h. '
 'Surveillance ECG. CI : BAV, allergie amides.'),

-- ── Atropine bolus dilué ──────────────────────────────────────────────────────
-- 1 mL (1 mg/mL) + 9 mL NaCl = 10 mL à 0,1 mg/mL (100 µg/mL)
('atropine',
 'Atropine bolus 10mL — 0,1 mg/mL',
 10, NULL,
 '0,1 mg/mL (100 µg/mL)',    0.1,
 'NaCl 0.9%', 1, 9,
 '1 mL ampoule 1 mg/mL + 9 mL NaCl → 10 mL. '
 'Adulte : bolus 0,5–1 mL (50–100 µg); répéter /3 min. '
 'Enfant min : 0,1 mg (risque bradycardie paradoxale si < 0,1 mg).'),

-- ── Éphédrine bolus ──────────────────────────────────────────────────────────
-- 1 mL (30 mg/mL) + 9 mL NaCl = 10 mL à 3 mg/mL
('ephedrine',
 'Éphédrine bolus 10mL — 3 mg/mL',
 10, NULL,
 '3 mg/mL',                  3.0,
 'NaCl 0.9%', 1, 9,
 '1 mL ampoule 30 mg/mL + 9 mL NaCl → 10 mL. '
 'Bolus 1–2 mL (3–6 mg) IV; titrer. Max cumulé ≈ 30 mg (tachyphylaxie).'),

-- ── Phényléphrine bolus ───────────────────────────────────────────────────────
-- 2 étapes : 1 mL (10 mg/mL) + 9 mL NaCl = 10 mL à 1 mg/mL (intermédiaire)
-- puis prendre 1 mL de ce mélange + 9 mL NaCl = 10 mL à 0,1 mg/mL (100 µg/mL)
('phenylephrine',
 'Phényléphrine bolus 10mL — 0,1 mg/mL (100 µg/mL)',
 10, NULL,
 '0,1 mg/mL (100 µg/mL)',    0.1,
 'NaCl 0.9%', NULL, NULL,
 'Dilution en 2 étapes : '
 '① 1 mL ampoule 10 mg/mL + 9 mL NaCl → solution intermédiaire 1 mg/mL. '
 '② Prendre 1 mL de cette solution + 9 mL NaCl → 10 mL à 0,1 mg/mL. '
 'Bolus 0,5–1 mL (50–100 µg). Risque bradycardie réflexe.')

ON CONFLICT (drug_id, label) DO NOTHING;
