-- Add requested anesthesia/perioperative drugs and align local fallback set

INSERT INTO public.drugs (id, names, dosing, notes, contraindications)
VALUES
(
  'amoxicillin_clavulanate',
  '{"fr":"Amoxicilline-acide clavulanique","pt":"Amoxicilina-clavulanato","en":"Amoxicillin-clavulanate"}'::jsonb,
  '{"dose_rules":[{"indication_tag":"antibioprophylaxie","route":"IV","mg_per_kg":25,"max_mg":2000,"notes":["Co-amoxiclav IV : 1 g/200 mg à 2 g/200 mg à l''induction (dose exprimée en amoxicilline)","Redoser selon protocole local si chirurgie prolongée ou contamination importante","À réserver aux indications adaptées ; ce n''est pas l''antibioprophylaxie standard de routine pour la chirurgie propre"]}],"concentrations":[]}'::jsonb,
  '{"renal_hepatic_notes":["Adapter l''intervalle ou la dose en IRC","Prudence si insuffisance hépatique ou traitement prolongé"]}'::jsonb,
  '["Allergie aux bêta-lactamines","Antécédent d''ictère cholestatique ou d''atteinte hépatique sous amoxicilline-clavulanate"]'::jsonb
),
(
  's_ketamine',
  '{"fr":"S-kétamine","pt":"S-cetamina","en":"S-ketamine"}'::jsonb,
  '{"dose_rules":[{"indication_tag":"co-analgésie","route":"IV","mg_per_kg":0.125,"max_mg":25,"notes":["Bolus faible dose : 0.1-0.25 mg/kg IV","Perfusion relais : 0.05-0.25 mg/kg/h selon contexte","Enantiomère S plus puissant que la kétamine racémique : débuter à dose réduite"]},{"indication_tag":"induction","route":"IV","mg_per_kg":0.5,"max_mg":50,"notes":["0.5-1 mg/kg IV titré si besoin d''épargne hémodynamique","Réduire en association avec propofol, benzodiazépine ou opioïde"]}],"concentrations":[{"label":"5 mg/mL","mg_per_ml":5},{"label":"25 mg/mL","mg_per_ml":25}]}'::jsonb,
  '{"renal_hepatic_notes":["Réduire et titrer prudemment si IHC sévère"]}'::jsonb,
  '["HTA sévère non contrôlée","HTIC","Psychose active (CI relative)"]'::jsonb
),
(
  'diclofenac',
  '{"fr":"Diclofénac","pt":"Diclofenaco","en":"Diclofenac"}'::jsonb,
  '{"dose_rules":[{"indication_tag":"analgésie","route":"IV / IM / PO","mg_per_kg":1,"max_mg":75,"notes":["Dose adulte usuelle : 75 mg IV dilué sur au moins 30 min, IM ou PO selon contexte","Dose quotidienne max : 150 mg","Éviter si IR, ulcère actif, haut risque hémorragique ou grossesse T3"]}],"concentrations":[{"label":"25 mg/mL","mg_per_ml":25}]}'::jsonb,
  '{"renal_hepatic_notes":["Éviter si DFG < 30 mL/min","Prudence si insuffisance hépatique"]}'::jsonb,
  '["Insuffisance rénale sévère","Ulcère gastroduodénal actif","Allergie AINS/aspirine","Grossesse 3e trimestre"]'::jsonb
),
(
  'midazolam',
  '{"fr":"Midazolam","pt":"Midazolam","en":"Midazolam"}'::jsonb,
  '{"dose_rules":[{"indication_tag":"prémédication","route":"IV","mg_per_kg":0.025,"max_mg":2,"notes":["Prémédication IV : 0.02-0.04 mg/kg, titrée selon effet","Réduire de 25-50 % chez le sujet âgé ou fragile","Surveiller la dépression respiratoire, surtout si opioïde associé"]}],"concentrations":[{"label":"1 mg/mL","mg_per_ml":1},{"label":"5 mg/mL","mg_per_ml":5}]}'::jsonb,
  '{"renal_hepatic_notes":["IHC sévère : demi-vie prolongée, réduire la dose","IRC : accumulation possible des métabolites actifs"]}'::jsonb,
  '["Insuffisance respiratoire sévère","Allergie aux benzodiazépines","Myasthénie (prudence)"]'::jsonb
),
(
  'etomidate',
  '{"fr":"Étomidate","pt":"Etomidato","en":"Etomidate"}'::jsonb,
  '{"dose_rules":[{"indication_tag":"induction","route":"IV","mg_per_kg":0.3,"max_mg":20,"notes":["Induction IV : 0.2-0.3 mg/kg, particulièrement utile si instabilité hémodynamique","Myoclonies fréquentes : envisager un prétraitement (opioïde ou benzodiazépine)","Éviter l''administration répétée ou prolongée (suppression surrénalienne)"]}],"concentrations":[{"label":"2 mg/mL","mg_per_ml":2}]}'::jsonb,
  '{"renal_hepatic_notes":["Pas d''ajustement habituel en dose unique"]}'::jsonb,
  '["Insuffisance surrénalienne connue (CI relative)","Éviter en perfusion prolongée"]'::jsonb
),
(
  'nicardipine',
  '{"fr":"Nicardipine","pt":"Nicardipina","en":"Nicardipine"}'::jsonb,
  '{"dose_rules":[{"indication_tag":"hypertension","route":"IVSE","mg_per_kg":null,"max_mg":null,"notes":["Débuter à 5 mg/h IVSE, puis augmenter par paliers de 2.5 mg/h toutes 5-15 min","Dose max habituelle : 15 mg/h","Une fois la PA contrôlée, réduire à environ 3 mg/h et relayer per os si nécessaire"],"unit_override":"mg/h"}],"concentrations":[{"label":"Prémélange 0.1 mg/mL","mg_per_ml":0.1},{"label":"Concentré 2.5 mg/mL","mg_per_ml":2.5}]}'::jsonb,
  '{"renal_hepatic_notes":["Titrer progressivement en IHC ; pas d''ajustement rénal standard"]}'::jsonb,
  '["Hypotension sévère","Sténose aortique critique (prudence)","Défaillance cardiaque aiguë décompensée (prudence)"]'::jsonb
),
(
  'esmolol',
  '{"fr":"Esmolol","pt":"Esmolol","en":"Esmolol"}'::jsonb,
  '{"dose_rules":[{"indication_tag":"tachycardie","route":"IV bolus / IVSE","mg_per_kg":0.5,"max_mg":35,"notes":["Bolus de charge : 500 µg/kg IV sur 1 min","Puis perfusion 50-200 µg/kg/min titrée sur FC/PA","Intérêt peropératoire : tachycardie ou réponse sympathique à l''intubation"],"unit_override":"mg (charge)"}],"concentrations":[{"label":"10 mg/mL","mg_per_ml":10}]}'::jsonb,
  '{"renal_hepatic_notes":["Pas d''ajustement habituel (métabolisme par estérases)"]}'::jsonb,
  '["Bradycardie sévère","BAV 2e/3e degré","Décompensation cardiaque aiguë","Bronchospasme sévère"]'::jsonb
),
(
  'metoprolol',
  '{"fr":"Métoprolol","pt":"Metoprolol","en":"Metoprolol"}'::jsonb,
  '{"dose_rules":[{"indication_tag":"tachycardie","route":"IV bolus","mg_per_kg":null,"max_mg":null,"notes":["2.5-5 mg IV lent sur 2 min, répétable toutes 5 min","Dose totale usuelle max : 15 mg","Poursuivre un bêtabloquant chronique ; éviter l''initiation le jour de la chirurgie sans indication forte"],"unit_override":"mg bolus"}],"concentrations":[{"label":"1 mg/mL","mg_per_ml":1}]}'::jsonb,
  '{"renal_hepatic_notes":["Réduire et titrer avec prudence en insuffisance hépatique"]}'::jsonb,
  '["Bradycardie sévère","BAV 2e/3e degré","Choc cardiogénique","Bronchospasme sévère"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  names = EXCLUDED.names,
  dosing = EXCLUDED.dosing,
  notes = EXCLUDED.notes,
  contraindications = EXCLUDED.contraindications,
  updated_at = now();
