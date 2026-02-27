
-- Seed drugs table with standard anesthesia drugs
-- Based on SFAR, ESA, and international anesthesia guidelines
-- ON CONFLICT DO NOTHING — safe to re-run

INSERT INTO public.drugs (id, names, dosing, notes, contraindications) VALUES

-- ─── ANALGÉSIE ────────────────────────────────────────────────────────────────

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

-- ─── INDUCTION ────────────────────────────────────────────────────────────────

('propofol',
 '{"fr":"Propofol","pt":"Propofol","en":"Propofol"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"induction","route":"IV","mg_per_kg":2,"max_mg":300,"notes":["Injection lente 30-60s","Réduire chez sujet âgé/hypovolémique : 1-1.5 mg/kg","Douleur injection : lidocaïne 20-40 mg IV avant","ISR : ne pas réduire la dose","AG si échec/CI rachianesthésie"]}],"concentrations":[{"label":"1% (10 mg/mL)","mg_per_ml":10},{"label":"2% (20 mg/mL)","mg_per_ml":20}]}'::jsonb,
 '{"renal_hepatic_notes":["Pas d''ajustement nécessaire"]}'::jsonb,
 '["Allergie soja/œuf (controversé, très rare)","Choc hypovolémique non réanimé"]'::jsonb),

('sufentanil',
 '{"fr":"Sufentanil","pt":"Sufentanil","en":"Sufentanil"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"analgésie_perop","route":"IV","mg_per_kg":0.0003,"max_mg":0.05,"notes":["Bolus induction : 0.3 µg/kg (range 0.2-0.5 µg/kg)","Entretien : 0.15-0.7 µg/kg/h IVSE","5-10× plus puissant que le fentanyl — titration prudente"],"unit_override":"µg"},{"indication_tag":"analgésie_IT","route":"IT","mg_per_kg":null,"max_mg":null,"notes":["2.5-5 µg IT (adjuvant rachianesthésie)","Attention dépression respiratoire tardive (surveillance ≥ 12h)"],"unit_override":"µg"}],"concentrations":[{"label":"5 µg/mL","mg_per_ml":0.005},{"label":"50 µg/mL","mg_per_ml":0.05}]}'::jsonb,
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
 '{"dose_rules":[{"indication_tag":"induction","route":"IV","mg_per_kg":0.3,"max_mg":30,"notes":["Induction hémodynamiquement stable","Privilégier chez patient à risque cardiovasculaire ou hypovolémique","Myoclonies fréquentes (prétraitement midazolam 0.03 mg/kg)","Injection douloureuse — voie de gros calibre","ISR : alternative à propofol si instabilité hémodynamique"]}],"concentrations":[{"label":"2 mg/mL","mg_per_ml":2}]}'::jsonb,
 '{"renal_hepatic_notes":["Pas d''ajustement nécessaire habituellement"]}'::jsonb,
 '["Insuffisance surrénalienne connue (CI relative)","Usage prolongé CI (inhibition cortisol)"]'::jsonb),

-- ─── CURARES ──────────────────────────────────────────────────────────────────

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

-- ─── ENTRETIEN / HALOGÉNÉS ────────────────────────────────────────────────────

('sevoflurane',
 '{"fr":"Sévoflurane","pt":"Sevoflurano","en":"Sevoflurane"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"entretien","route":"INH","mg_per_kg":null,"max_mg":null,"notes":["MAC adulte ≈ 2.0%","MAC enfant ≈ 2.5%","Titrer selon BIS/entropie","Réduire MAC avec opioïdes (≈ 0.7-1.0 MAC)"],"unit_override":"MAC"}],"concentrations":[]}'::jsonb,
 '{"renal_hepatic_notes":["Néphrotoxicité théorique Compound A (bas débit) — controversé"]}'::jsonb,
 '["Hyperthermie maligne (ATCD personnel ou familial)","Myopathie sensible aux halogénés"]'::jsonb),

-- ─── ANESTHÉSIE LOCORÉGIONALE ────────────────────────────────────────────────

('bupivacaine',
 '{"fr":"Bupivacaïne","pt":"Bupivacaína","en":"Bupivacaine"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"rachianesthésie","route":"IT","mg_per_kg":null,"max_mg":null,"notes":["Bupivacaïne hyperbare 0.5% : 10-15 mg selon chirurgie","Dose fixe (non basée sur le poids)","Ajuster selon taille et niveau souhaité"],"unit_override":"mg (dose fixe)"},{"indication_tag":"BIS","route":"Péri-nerveux","mg_per_kg":2,"max_mg":150,"notes":["Dose max sans adrénaline : 2 mg/kg","Dose max avec adrénaline : 3 mg/kg","Durée bloc : 6-12h"]}],"concentrations":[{"label":"0.25% (2.5 mg/mL)","mg_per_ml":2.5},{"label":"0.5% (5 mg/mL)","mg_per_ml":5},{"label":"0.5% hyperbare","mg_per_ml":5}]}'::jsonb,
 '{"renal_hepatic_notes":["Réduire si IHC sévère"]}'::jsonb,
 '["Allergie aux amides","Infection site de ponction","Troubles coagulation (blocs centraux)"]'::jsonb),

-- ─── ANTI-ÉMÉTIQUES ──────────────────────────────────────────────────────────

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

-- ─── VASOPRESSEURS / URGENCES ────────────────────────────────────────────────

('ephedrine',
 '{"fr":"Éphédrine","pt":"Efedrina","en":"Ephedrine"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"hypotension","route":"IV bolus","mg_per_kg":null,"max_mg":null,"notes":["Bolus 6-12 mg IV (titrer par 3-6 mg)","Effet mixte α+β : ↑ PA et FC","Max cumulé ≈ 30 mg (tachyphylaxie)"],"unit_override":"mg bolus"}],"concentrations":[{"label":"Dilué 3 mg/mL","mg_per_ml":3},{"label":"30 mg/mL","mg_per_ml":30}]}'::jsonb,
 '{"renal_hepatic_notes":["Pas d''ajustement nécessaire"]}'::jsonb,
 '["HTA sévère non contrôlée","Tachycardie sévère"]'::jsonb),

('phenylephrine',
 '{"fr":"Phényléphrine","pt":"Fenilefrina","en":"Phenylephrine"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"hypotension","route":"IV bolus","mg_per_kg":null,"max_mg":null,"notes":["Bolus 50-100 µg IV","Pur α1-agoniste : ↑ PA sans tachycardie","Risque bradycardie réflexe"],"unit_override":"µg"}],"concentrations":[{"label":"Dilué 50 µg/mL","mg_per_ml":0.05}]}'::jsonb,
 '{"renal_hepatic_notes":["Pas d''ajustement"]}'::jsonb,
 '["HTA sévère","Bradycardie préexistante sévère"]'::jsonb),

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

-- ─── ANTIBIOPROPHYLAXIE ───────────────────────────────────────────────────────

('cefazoline',
 '{"fr":"Céfazoline","pt":"Cefazolina","en":"Cefazolin"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"antibioprophylaxie","route":"IV","mg_per_kg":25,"max_mg":2000,"notes":["30 min avant incision","Réinjection 1g si chirurgie > 4h","Alternative allergie : clindamycine 600 mg ou vancomycine"]}],"concentrations":[]}'::jsonb,
 '{"renal_hepatic_notes":["Ajuster intervalle si IRC sévère"]}'::jsonb,
 '["Allergie céphalosporines confirmée","Allergie pénicilline sévère (anaphylaxie)"]'::jsonb),

-- ─── ANTIFIBRINOLYTIQUE ───────────────────────────────────────────────────────

('acide_tranexamique',
 '{"fr":"Acide tranexamique","pt":"Ácido tranexâmico","en":"Tranexamic acid"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"antifibrinolytique","route":"IV lente","mg_per_kg":15,"max_mg":1000,"notes":["Injection lente 10-20 min (risque hypotension si rapide)","Réduit pertes sanguines péri-opératoires","Répétition possible à 3h si chirurgie prolongée"]}],"concentrations":[{"label":"100 mg/mL","mg_per_ml":100}]}'::jsonb,
 '{"renal_hepatic_notes":["Réduire dose si IRC (élimination rénale)"]}'::jsonb,
 '["Thrombose artérielle/veineuse active","Hématurie macro d''origine haute (risque caillotage urétéral)"]'::jsonb),

-- ─── THROMBOPROPHYLAXIE ───────────────────────────────────────────────────────

('enoxaparine',
 '{"fr":"Énoxaparine","pt":"Enoxaparina","en":"Enoxaparin"}'::jsonb,
 '{"dose_rules":[{"indication_tag":"thromboprophylaxie","route":"SC","mg_per_kg":null,"max_mg":null,"notes":["Dose prophylactique : 40 mg/j SC (standard)","Haut risque : 40 mg × 2/j SC","1ère injection : 6-12h après chirurgie","Contre-indiquée si SPA < 12h (rachianesthésie)"],"unit_override":"mg/j"},{"indication_tag":"thromboprophylaxie_curatif","route":"SC","mg_per_kg":1,"max_mg":null,"notes":["Dose curative : 1 mg/kg × 2/j SC","Adapter selon anti-Xa si IRC"]}],"concentrations":[{"label":"40 mg/0.4 mL","mg_per_ml":100},{"label":"60 mg/0.6 mL","mg_per_ml":100}]}'::jsonb,
 '{"renal_hepatic_notes":["DFG < 30 mL/min : réduire à 20 mg/j prophylactique","Surveillance anti-Xa si IRC"]}'::jsonb,
 '["Hémorragie active","Thrombopénie induite par héparine (TIH)","Prothèse valvulaire mécanique (CI relative)"]'::jsonb)

ON CONFLICT (id) DO NOTHING;
