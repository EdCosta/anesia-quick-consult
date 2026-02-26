-- =============================================================
-- AnesIA — Schema completo para novo projeto Supabase
-- Colar este ficheiro no SQL Editor do Supabase e clicar "Run"
-- =============================================================


-- ── 1. ROLES & FUNÇÕES BASE ───────────────────────────────────

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;


-- ── 2. PROCEDURES ─────────────────────────────────────────────

CREATE TABLE public.procedures (
  id text PRIMARY KEY,
  specialty text NOT NULL,
  titles jsonb NOT NULL,
  synonyms jsonb DEFAULT '{}',
  content jsonb NOT NULL,
  tags jsonb DEFAULT '[]',
  is_pro boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read procedures" ON public.procedures FOR SELECT USING (true);
CREATE POLICY "Admin write procedures" ON public.procedures FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update procedures" ON public.procedures FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete procedures" ON public.procedures FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_procedures_specialty ON public.procedures(specialty);
CREATE TRIGGER update_procedures_updated_at BEFORE UPDATE ON public.procedures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── 3. DRUGS ──────────────────────────────────────────────────

CREATE TABLE public.drugs (
  id text PRIMARY KEY,
  names jsonb NOT NULL,
  class text,
  dosing jsonb NOT NULL DEFAULT '{}',
  notes jsonb DEFAULT '{}',
  contraindications jsonb DEFAULT '[]',
  tags jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read drugs" ON public.drugs FOR SELECT USING (true);
CREATE POLICY "Admin write drugs" ON public.drugs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update drugs" ON public.drugs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete drugs" ON public.drugs FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_drugs_updated_at BEFORE UPDATE ON public.drugs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── 4. GUIDELINES ─────────────────────────────────────────────

CREATE TABLE public.guidelines (
  id text PRIMARY KEY,
  category text NOT NULL,
  titles jsonb NOT NULL,
  items jsonb NOT NULL,
  refs jsonb DEFAULT '[]',
  tags jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.guidelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read guidelines" ON public.guidelines FOR SELECT USING (true);
CREATE POLICY "Admin write guidelines" ON public.guidelines FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update guidelines" ON public.guidelines FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete guidelines" ON public.guidelines FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_guidelines_category ON public.guidelines(category);
CREATE TRIGGER update_guidelines_updated_at BEFORE UPDATE ON public.guidelines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── 5. PROTOCOLES ─────────────────────────────────────────────

CREATE TABLE public.protocoles (
  id text PRIMARY KEY,
  category text NOT NULL,
  titles jsonb NOT NULL,
  steps jsonb NOT NULL,
  refs jsonb DEFAULT '[]',
  tags jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.protocoles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read protocoles" ON public.protocoles FOR SELECT USING (true);
CREATE POLICY "Admin write protocoles" ON public.protocoles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update protocoles" ON public.protocoles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete protocoles" ON public.protocoles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_protocoles_category ON public.protocoles(category);
CREATE TRIGGER update_protocoles_updated_at BEFORE UPDATE ON public.protocoles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── 6. ALR BLOCKS ─────────────────────────────────────────────

CREATE TABLE public.alr_blocks (
  id text PRIMARY KEY,
  region text NOT NULL,
  titles jsonb NOT NULL,
  indications jsonb DEFAULT '{}',
  contraindications jsonb DEFAULT '{}',
  technique jsonb DEFAULT '{}',
  drugs jsonb DEFAULT '{}',
  tags jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.alr_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read alr_blocks" ON public.alr_blocks FOR SELECT USING (true);
CREATE POLICY "Admin write alr_blocks" ON public.alr_blocks FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update alr_blocks" ON public.alr_blocks FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete alr_blocks" ON public.alr_blocks FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_alr_blocks_region ON public.alr_blocks(region);
CREATE TRIGGER update_alr_blocks_updated_at BEFORE UPDATE ON public.alr_blocks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── 7. SPECIALTIES ────────────────────────────────────────────

CREATE TABLE public.specialties (
  id text PRIMARY KEY,
  name jsonb NOT NULL DEFAULT '{}',
  synonyms jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  sort_base integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read specialties" ON public.specialties FOR SELECT USING (true);
CREATE POLICY "Admin write specialties" ON public.specialties FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin update specialties" ON public.specialties FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin delete specialties" ON public.specialties FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_specialties_updated_at BEFORE UPDATE ON public.specialties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.specialties (id, name, sort_base) VALUES
  ('chirurgie-generale', '{"fr":"Chirurgie générale","en":"General Surgery","pt":"Cirurgia Geral"}', 1),
  ('orthopedie', '{"fr":"Orthopédie","en":"Orthopedics","pt":"Ortopedia"}', 2),
  ('urologie', '{"fr":"Urologie","en":"Urology","pt":"Urologia"}', 3),
  ('gynecologie', '{"fr":"Gynécologie","en":"Gynecology","pt":"Ginecologia"}', 4),
  ('orl', '{"fr":"ORL","en":"ENT","pt":"ORL"}', 5),
  ('neurochirurgie', '{"fr":"Neurochirurgie","en":"Neurosurgery","pt":"Neurocirurgia"}', 6),
  ('obstetrique', '{"fr":"Obstétrique","en":"Obstetrics","pt":"Obstetrícia"}', 7);


-- ── 8. IMPORT LOGS & HOSPITAL PROFILES ───────────────────────

CREATE TABLE public.import_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  total integer NOT NULL DEFAULT 0,
  success integer NOT NULL DEFAULT 0,
  failed integer NOT NULL DEFAULT 0,
  errors jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage import_logs" ON public.import_logs FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert import_logs" ON public.import_logs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.hospital_profiles (
  id text PRIMARY KEY,
  name text NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hospital_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read hospital_profiles" ON public.hospital_profiles FOR SELECT USING (true);
CREATE POLICY "Admin write hospital_profiles" ON public.hospital_profiles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update hospital_profiles" ON public.hospital_profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete hospital_profiles" ON public.hospital_profiles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_hospital_profiles_updated_at BEFORE UPDATE ON public.hospital_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── 9. PLANS & USER ENTITLEMENTS ─────────────────────────────

CREATE TABLE public.plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  features jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read plans" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Admin write plans" ON public.plans FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update plans" ON public.plans FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete plans" ON public.plans FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.plans (id, name, features) VALUES
  ('free', 'Free', '{"max_procedures": 10, "scores": false, "advanced_dose": false}'::jsonb),
  ('pro', 'Pro', '{"max_procedures": -1, "scores": true, "advanced_dose": true}'::jsonb);

CREATE TABLE public.user_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES public.plans(id) DEFAULT 'free',
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;
-- RLS com verificação de expiração no servidor (seguro)
CREATE POLICY "Users read own entitlement" ON public.user_entitlements
  FOR SELECT USING (
    auth.uid() = user_id
    AND active = true
    AND (expires_at IS NULL OR expires_at > now())
  );
CREATE POLICY "Admin manage entitlements" ON public.user_entitlements FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_entitlements_updated_at BEFORE UPDATE ON public.user_entitlements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── 10. USER PROFILES ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ── 11. SEED DRUGS (20 fármacos de anestesia) ────────────────

INSERT INTO public.drugs (id, names, dosing, notes, contraindications) VALUES

('paracetamol',
 '{"fr":"Paracétamol","pt":"Paracetamol","en":"Acetaminophen"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"analgésie","route":"IV","mg_per_kg":15,"max_mg":1000,"notes":["Intervalle minimum 6h entre doses","Max 60 mg/kg/j ou 4g/j"]}],"concentrations":[{"label":"IV 10 mg/mL","mg_per_ml":10}]}'::jsonb,
 '{"renal_hepatic_notes":["IHC : max 2g/j","IRC sévère : espacer les prises (intervalle 8h)"]}'::jsonb,
 '["Insuffisance hépatique sévère","Allergie connue"]'::jsonb),

('ibuprofene',
 '{"fr":"Ibuprofène","pt":"Ibuprofeno","en":"Ibuprofen"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"analgésie","route":"PO / IV","mg_per_kg":10,"max_mg":400,"notes":["Intervalle 6-8h","CI si insuffisance rénale, ulcère GD, grossesse T3"]}],"concentrations":[]}'::jsonb,
 '{"renal_hepatic_notes":["Éviter si DFG < 30 mL/min","CI si IHC sévère"]}'::jsonb,
 '["Insuffisance rénale sévère","Ulcère gastroduodénal actif","Grossesse 3e trimestre","Allergie AINS/aspirine"]'::jsonb),

('ketorolac',
 '{"fr":"Kétorolac","pt":"Cetorolac","en":"Ketorolac"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"analgésie","route":"IV","mg_per_kg":0.5,"max_mg":30,"notes":["Durée max 48h IV","Sujet âgé > 65 ans : max 15 mg/dose"]}],"concentrations":[{"label":"30 mg/mL","mg_per_ml":30}]}'::jsonb,
 '{"renal_hepatic_notes":["CI si DFG < 30 mL/min","Réduire dose > 65 ans : max 15 mg"]}'::jsonb,
 '["Insuffisance rénale","Risque hémorragique élevé","Ulcère GD actif"]'::jsonb),

('morphine',
 '{"fr":"Morphine","pt":"Morfina","en":"Morphine"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"analgésie_postop","route":"IV titration","mg_per_kg":0.1,"max_mg":10,"notes":["Titration : bolus 2-3 mg /5 min","Objectif EVA < 3/10","Surveillance respiratoire obligatoire"]},{"indication_tag":"analgésie_secours","route":"IV titration","mg_per_kg":0.05,"max_mg":5,"notes":["Dose réduite enfant/sujet âgé","Titration prudente par bolus 1 mg"]}],"concentrations":[{"label":"1 mg/mL (dilué)","mg_per_ml":1},{"label":"10 mg/mL","mg_per_ml":10}]}'::jsonb,
 '{"renal_hepatic_notes":["IRC : accumulation M6G → réduire dose et espacer","IHC : réduire dose"]}'::jsonb,
 '["Insuffisance respiratoire sévère","SAOS non appareillé (prudence)","Obstruction intestinale"]'::jsonb),

('ketamine',
 '{"fr":"Kétamine","pt":"Cetamina","en":"Ketamine"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"co-analgésie","route":"IV","mg_per_kg":0.25,"max_mg":25,"notes":["Dose sub-anesthésique (anti-hyperalgésique)","Perfusion relais : 0.1-0.2 mg/kg/h","Intérêt : terrain douleur chronique, opioïdes long cours"]}],"concentrations":[{"label":"10 mg/mL","mg_per_ml":10},{"label":"50 mg/mL","mg_per_ml":50}]}'::jsonb,
 '{"renal_hepatic_notes":["Pas d''ajustement habituel"]}'::jsonb,
 '["HTA non contrôlée","HTIC","Éclampsie","Psychose (CI relative)"]'::jsonb),

('lidocaine',
 '{"fr":"Lidocaïne","pt":"Lidocaína","en":"Lidocaine"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"analgésie_IV","route":"IV","mg_per_kg":1.5,"max_mg":200,"notes":["Bolus à l''induction","Effet anti-hyperalgésique et épargne morphinique","Perfusion possible : 1-2 mg/kg/h"]},{"indication_tag":"BIS_adjuvant","route":"Péri-nerveux","mg_per_kg":5,"max_mg":300,"notes":["Dose max avec adrénaline : 7 mg/kg","Mélange avec bupivacaïne : onset rapide"]}],"concentrations":[{"label":"1% (10 mg/mL)","mg_per_ml":10},{"label":"2% (20 mg/mL)","mg_per_ml":20}]}'::jsonb,
 '{"renal_hepatic_notes":["Réduire si IHC sévère (métabolisme hépatique)"]}'::jsonb,
 '["BAV non appareillé","Allergie aux amides","Porphyrie"]'::jsonb),

('propofol',
 '{"fr":"Propofol","pt":"Propofol","en":"Propofol"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"induction","route":"IV","mg_per_kg":2,"max_mg":300,"notes":["Injection lente 30-60s","Réduire chez sujet âgé/hypovolémique : 1-1.5 mg/kg","Douleur injection : lidocaïne 20-40 mg IV avant"]},{"indication_tag":"induction_ISR","route":"IV","mg_per_kg":2,"max_mg":300,"notes":["Induction séquence rapide","Ne pas réduire la dose en ISR"]},{"indication_tag":"induction_AG","route":"IV","mg_per_kg":2,"max_mg":300,"notes":["AG si échec/CI rachianesthésie"]}],"concentrations":[{"label":"1% (10 mg/mL)","mg_per_ml":10},{"label":"2% (20 mg/mL)","mg_per_ml":20}]}'::jsonb,
 '{"renal_hepatic_notes":["Pas d''ajustement nécessaire"]}'::jsonb,
 '["Allergie soja/œuf (controversé, très rare)","Choc hypovolémique non réanimé"]'::jsonb),

('sufentanil',
 '{"fr":"Sufentanil","pt":"Sufentanil","en":"Sufentanil"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"analgésie_perop","route":"IV","mg_per_kg":null,"max_mg":null,"notes":["Bolus : 0.2-0.5 µg/kg à l''induction","Entretien : 0.15-0.7 µg/kg/h","5-10× plus puissant que le fentanyl"],"unit_override":"µg"},{"indication_tag":"analgésie_IT","route":"IT","mg_per_kg":null,"max_mg":null,"notes":["2.5-5 µg IT (adjuvant rachianesthésie)","Attention dépression respiratoire tardive (surveillance ≥ 12h)"],"unit_override":"µg"}],"concentrations":[{"label":"5 µg/mL","mg_per_ml":0.005},{"label":"50 µg/mL","mg_per_ml":0.05}]}'::jsonb,
 '{"renal_hepatic_notes":["Réduire si IHC","IRC : accumulation possible"]}'::jsonb,
 '["Dépression respiratoire sévère","Insuffisance respiratoire aiguë"]'::jsonb),

('fentanyl',
 '{"fr":"Fentanyl","pt":"Fentanil","en":"Fentanyl"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"analgésie_perop","route":"IV","mg_per_kg":null,"max_mg":null,"notes":["Bolus : 1-3 µg/kg à l''induction","Entretien : 0.5-2 µg/kg/h","Délai d''action : 2-3 min"],"unit_override":"µg"},{"indication_tag":"analgésie_IT","route":"IT","mg_per_kg":null,"max_mg":null,"notes":["10-25 µg IT (adjuvant rachianesthésie)","Surveillance dépression respiratoire 12-24h"],"unit_override":"µg"}],"concentrations":[{"label":"50 µg/mL","mg_per_ml":0.05}]}'::jsonb,
 '{"renal_hepatic_notes":["IRC : accumulation possible — réduire dose","IHC : réduire dose"]}'::jsonb,
 '["Dépression respiratoire sévère","Insuffisance respiratoire aiguë"]'::jsonb),

('remifentanil',
 '{"fr":"Rémifentanil","pt":"Remifentanil","en":"Remifentanil"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"TIVA","route":"IVSE","mg_per_kg":null,"max_mg":null,"notes":["Induction : 0.5-1 µg/kg/min (réduire si hémodynamique instable)","Entretien : 0.1-0.5 µg/kg/min","Arrêter 5 min avant fin de chirurgie — prévoir relais antalgique"],"unit_override":"µg/kg/min"}],"concentrations":[{"label":"50 µg/mL (dilué)","mg_per_ml":0.05}]}'::jsonb,
 '{"renal_hepatic_notes":["Pas d''ajustement — métabolisme plasmatique (estérases)"]}'::jsonb,
 '["Dépression respiratoire sévère","Pas d''utilisation en bolus pur (rigidité thoracique)"]'::jsonb),

('midazolam',
 '{"fr":"Midazolam","pt":"Midazolam","en":"Midazolam"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"prémédication","route":"IV","mg_per_kg":0.02,"max_mg":5,"notes":["Effet anxiolytique et amnésiant","Réduire chez sujet âgé : 0.01-0.015 mg/kg","Titrer selon effet"]},{"indication_tag":"induction","route":"IV","mg_per_kg":0.15,"max_mg":7.5,"notes":["Induction seule possible mais lente (2-3 min)","Synergie avec propofol : réduire les doses des deux"]}],"concentrations":[{"label":"1 mg/mL","mg_per_ml":1},{"label":"5 mg/mL","mg_per_ml":5}]}'::jsonb,
 '{"renal_hepatic_notes":["IHC sévère : demi-vie prolongée — réduire dose","IRC : accumulation métabolites actifs"]}'::jsonb,
 '["Myasthénie","Insuffisance respiratoire sévère","Glaucome à angle fermé","Allergie benzodiazépines"]'::jsonb),

('etomidate',
 '{"fr":"Étomidate","pt":"Etomidato","en":"Etomidate"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"induction","route":"IV","mg_per_kg":0.3,"max_mg":30,"notes":["Induction hémodynamiquement stable","Privilégier chez patient à risque cardiovasculaire ou hypovolémique","Myoclonies fréquentes (prétraitement midazolam 0.03 mg/kg)","Injection douloureuse — voie de gros calibre"]},{"indication_tag":"induction_ISR","route":"IV","mg_per_kg":0.3,"max_mg":30,"notes":["Alternative à propofol en ISR pour patient instable"]}],"concentrations":[{"label":"2 mg/mL","mg_per_ml":2}]}'::jsonb,
 '{"renal_hepatic_notes":["Pas d''ajustement nécessaire habituellement"]}'::jsonb,
 '["Insuffisance surrénalienne connue (CI relative)","Usage prolongé CI (inhibition cortisol)"]'::jsonb),

('rocuronium',
 '{"fr":"Rocuronium","pt":"Rocurônio","en":"Rocuronium"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"intubation","route":"IV","mg_per_kg":0.6,"max_mg":null,"notes":["Délai d''action 60-90s","Durée 30-40 min"]},{"indication_tag":"ISR","route":"IV","mg_per_kg":1.2,"max_mg":null,"notes":["Dose ISR : 1.2 mg/kg","Délai 45-60s","Réversible par sugammadex 16 mg/kg si échec intubation"]}],"concentrations":[{"label":"10 mg/mL","mg_per_ml":10}]}'::jsonb,
 '{"renal_hepatic_notes":["IHC sévère : durée d''action prolongée"]}'::jsonb,
 '["Allergie connue aux curares (rare)"]'::jsonb),

('sugammadex',
 '{"fr":"Sugammadex","pt":"Sugamadex","en":"Sugammadex"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"reversal","route":"IV","mg_per_kg":2,"max_mg":null,"notes":["Réversion bloc modéré (TOF ≥ 2)","Vérifier TOF avant administration"]},{"indication_tag":"reversal_profond","route":"IV","mg_per_kg":4,"max_mg":null,"notes":["Réversion bloc profond (PTC ≥ 1)"]},{"indication_tag":"reversal_urgence","route":"IV","mg_per_kg":16,"max_mg":null,"notes":["Réversion immédiate (can''t intubate can''t ventilate)","Dose unique, injection rapide"]}],"concentrations":[{"label":"100 mg/mL","mg_per_ml":100}]}'::jsonb,
 '{"renal_hepatic_notes":["CI si DFG < 30 mL/min (élimination rénale)","Non dialysable efficacement"]}'::jsonb,
 '["Allergie connue (très rare, anaphylaxie décrite)"]'::jsonb),

('sevoflurane',
 '{"fr":"Sévoflurane","pt":"Sevoflurano","en":"Sevoflurane"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"entretien","route":"INH","mg_per_kg":null,"max_mg":null,"notes":["MAC adulte ≈ 2.0%","MAC enfant ≈ 2.5%","Titrer selon BIS/entropie","Réduire MAC avec opioïdes (≈ 0.7-1.0 MAC)"],"unit_override":"MAC"}],"concentrations":[]}'::jsonb,
 '{"renal_hepatic_notes":["Néphrotoxicité théorique Compound A (bas débit) — controversé"]}'::jsonb,
 '["Hyperthermie maligne (ATCD personnel ou familial)","Myopathie sensible aux halogénés"]'::jsonb),

('bupivacaine',
 '{"fr":"Bupivacaïne","pt":"Bupivacaína","en":"Bupivacaine"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"rachianesthésie","route":"IT","mg_per_kg":null,"max_mg":null,"notes":["Bupivacaïne hyperbare 0.5% : 10-15 mg selon chirurgie","Dose fixe (non basée sur le poids)","Ajuster selon taille et niveau souhaité"],"unit_override":"mg (dose fixe)"},{"indication_tag":"BIS","route":"Péri-nerveux","mg_per_kg":2,"max_mg":150,"notes":["Dose max sans adrénaline : 2 mg/kg","Dose max avec adrénaline : 3 mg/kg","Durée bloc : 6-12h"]}],"concentrations":[{"label":"0.25% (2.5 mg/mL)","mg_per_ml":2.5},{"label":"0.5% (5 mg/mL)","mg_per_ml":5},{"label":"0.5% hyperbare","mg_per_ml":5}]}'::jsonb,
 '{"renal_hepatic_notes":["Réduire si IHC sévère"]}'::jsonb,
 '["Allergie aux amides","Infection site de ponction","Troubles coagulation (blocs centraux)"]'::jsonb),

('ondansetron',
 '{"fr":"Ondansétron","pt":"Ondansetron","en":"Ondansetron"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"PONV","route":"IV","mg_per_kg":0.1,"max_mg":4,"notes":["Administrer en fin d''intervention","Peut prolonger QTc — ECG si facteurs de risque"]}],"concentrations":[{"label":"2 mg/mL","mg_per_ml":2}]}'::jsonb,
 '{"renal_hepatic_notes":["Pas d''ajustement rénal","IHC sévère : max 8 mg/j"]}'::jsonb,
 '["QT long congénital","Utilisation concomitante d''apomorphine"]'::jsonb),

('dexamethasone',
 '{"fr":"Dexaméthasone","pt":"Dexametasona","en":"Dexamethasone"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"PONV_anti-oedème","route":"IV","mg_per_kg":0.15,"max_mg":8,"notes":["Administrer à l''induction","Double effet : anti-émétique + anti-inflammatoire","Attention diabétiques : hyperglycémie transitoire"]}],"concentrations":[{"label":"4 mg/mL","mg_per_ml":4}]}'::jsonb,
 '{"renal_hepatic_notes":["Pas d''ajustement habituel"]}'::jsonb,
 '["Infection systémique non contrôlée","Diabète non équilibré (CI relative)"]'::jsonb),

('ephedrine',
 '{"fr":"Éphédrine","pt":"Efedrina","en":"Ephedrine"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"hypotension","route":"IV bolus","mg_per_kg":null,"max_mg":null,"notes":["Bolus 6-12 mg IV (titrer par 3-6 mg)","Effet mixte α+β : ↑ PA et FC","Max cumulé ≈ 30 mg (tachyphylaxie)"],"unit_override":"mg bolus"}],"concentrations":[{"label":"Dilué 3 mg/mL","mg_per_ml":3},{"label":"30 mg/mL","mg_per_ml":30}]}'::jsonb,
 '{"renal_hepatic_notes":["Pas d''ajustement nécessaire"]}'::jsonb,
 '["HTA sévère non contrôlée","Tachycardie sévère"]'::jsonb),

('noradrenaline',
 '{"fr":"Noradrénaline","pt":"Noradrenalina","en":"Norepinephrine"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"vasopresseur","route":"IVSE","mg_per_kg":null,"max_mg":null,"notes":["Perfusion continue : 0.05-0.5 µg/kg/min","Voie veineuse centrale de préférence","Titrer selon PAM cible (≥ 65 mmHg)"],"unit_override":"µg/kg/min"}],"concentrations":[{"label":"Préparation IVSE variable","mg_per_ml":null}]}'::jsonb,
 '{"renal_hepatic_notes":["Pas d''ajustement"]}'::jsonb,
 '["Pas de CI absolue en situation vitale"]'::jsonb),

('atropine',
 '{"fr":"Atropine","pt":"Atropina","en":"Atropine"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"bradycardie","route":"IV","mg_per_kg":0.01,"max_mg":0.5,"notes":["Dose minimale enfant : 0.1 mg (risque bradycardie paradoxale)","Répéter /3-5 min si nécessaire","Max total adulte : 3 mg"]}],"concentrations":[{"label":"0.25 mg/mL","mg_per_ml":0.25},{"label":"1 mg/mL","mg_per_ml":1}]}'::jsonb,
 '{"renal_hepatic_notes":["Pas d''ajustement"]}'::jsonb,
 '["Glaucome à angle fermé","Obstacle urétro-prostatique sévère"]'::jsonb),

('cefazoline',
 '{"fr":"Céfazoline","pt":"Cefazolina","en":"Cefazolin"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"antibioprophylaxie","route":"IV","mg_per_kg":25,"max_mg":2000,"notes":["30 min avant incision","Réinjection 1g si chirurgie > 4h","Alternative allergie : clindamycine 600 mg ou vancomycine"]}],"concentrations":[]}'::jsonb,
 '{"renal_hepatic_notes":["Ajuster intervalle si IRC sévère"]}'::jsonb,
 '["Allergie céphalosporines confirmée","Allergie pénicilline sévère (anaphylaxie)"]'::jsonb),

('acide_tranexamique',
 '{"fr":"Acide tranexamique","pt":"Ácido tranexâmico","en":"Tranexamic acid"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"antifibrinolytique","route":"IV lente","mg_per_kg":15,"max_mg":1000,"notes":["Injection lente 10-20 min (risque hypotension si rapide)","Réduit pertes sanguines péri-opératoires","Répétition possible à 3h si chirurgie prolongée"]}],"concentrations":[{"label":"100 mg/mL","mg_per_ml":100}]}'::jsonb,
 '{"renal_hepatic_notes":["Réduire dose si IRC (élimination rénale)"]}'::jsonb,
 '["Thrombose artérielle/veineuse active","Hématurie macro d''origine haute (risque caillotage urétéral)"]'::jsonb),

('enoxaparine',
 '{"fr":"Énoxaparine","pt":"Enoxaparina","en":"Enoxaparin"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"thromboprophylaxie","route":"SC","mg_per_kg":null,"max_mg":null,"notes":["Dose prophylactique : 40 mg/j SC (standard)","Haut risque : 40 mg × 2/j SC","1ère injection : 6-12h après chirurgie","Contre-indiquée si SPA < 12h (rachianesthésie)"],"unit_override":"mg/j"},{"indication_tag":"thromboprophylaxie_curatif","route":"SC","mg_per_kg":1,"max_mg":null,"notes":["Dose curative : 1 mg/kg × 2/j SC","Adapter selon anti-Xa si IRC"]}],"concentrations":[{"label":"40 mg/0.4 mL","mg_per_ml":100},{"label":"60 mg/0.6 mL","mg_per_ml":100}]}'::jsonb,
 '{"renal_hepatic_notes":["DFG < 30 mL/min : réduire à 20 mg/j prophylactique","Surveillance anti-Xa si IRC"]}'::jsonb,
 '["Hémorragie active","Thrombopénie induite par héparine (TIH)","Prothèse valvulaire mécanique (CI relative)"]'::jsonb)

ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- FIM — Schema AnesIA completo
-- =============================================================
