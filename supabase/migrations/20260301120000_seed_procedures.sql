-- ══════════════════════════════════════════════════════════════════════════════
-- AnesIA — Seed Core Anesthesia Procedures (Batch 1)
-- Based on SFAR, ESA, DAS, and international anesthesia guidelines
-- ON CONFLICT (id) DO NOTHING — safe to re-run
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── Add missing critical drug: Adrénaline / Épinéphrine ─────────────────────
INSERT INTO public.drugs (id, names, dosing, notes, contraindications)
VALUES (
  'adrenaline',
  '{"fr":"Adrénaline","en":"Epinephrine","pt":"Adrenalina"}'::jsonb,
  $drug${"dose_rules":[
    {"indication_tag":"anaphylaxie","route":"IV bolus","mg_per_kg":0.01,"max_mg":0.5,"unit_override":"mg","notes":["Adulte: 0.1–0.5 mg IV bolus titré","IM si pas d'abord IV: 0.5 mg face externe cuisse","Répéter q3–5 min si besoin","IVSE après stabilisation: 0.05–0.5 µg/kg/min"]},
    {"indication_tag":"arret_cardiaque","route":"IV","mg_per_kg":null,"max_mg":1.0,"unit_override":"mg","notes":["ACR adulte: 1 mg IV q3–5 min","Diluer: 1 mg dans 10 mL NaCl 0.9% → 0.1 mg/mL","Voie IO si abord IV impossible"]}
  ],"concentrations":[
    {"label":"1 mg/mL","mg_per_ml":1.0},
    {"label":"0.1 mg/mL (diluée)","mg_per_ml":0.1}
  ]}$drug$::jsonb,
  '{"renal_hepatic_notes":["Pas d''ajustement nécessaire en contexte d''urgence"]}'::jsonb,
  '["HTA sévère non contrôlée (CI relative en contexte électif)","Tachyarythmie sévère (CI relative hors urgence vitale)"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- PROCEDURE 1 — Induction en Séquence Rapide (ISR / RSI)
-- Specialty: chirurgie-generale (multi: orl, obstetrique, gynecologie)
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'induction_sequence_rapide',
  'chirurgie-generale',
  '["chirurgie-generale","orl","obstetrique","gynecologie"]'::jsonb,
  '{"fr":"Induction en Séquence Rapide (ISR)","en":"Rapid Sequence Induction (RSI)","pt":"Indução em Sequência Rápida (ISR)"}'::jsonb,
  '{"fr":["ISR","RSI","estomac plein","urgence chirurgicale","intubation urgence"],"en":["RSI","rapid sequence intubation","full stomach","emergency airway"],"pt":["ISR","estômago cheio","entubação rápida"]}'::jsonb,
  $content${
    "quick": {
      "fr": {
        "preop": [
          "Identifier le risque d'aspiration : jeûne insuffisant (< 6h liquides, < 8h solides), urgence chirurgicale, obésité morbide, grossesse, iléus, hernie hiatale",
          "Préoxygénation 3 min FiO2 100% masque étanche (EtO2 cible > 90%) ou 8 respirations profondes si urgence extrême — position tête surélevée 20–30°",
          "Vérifier CI succinylcholine : hyperkaliémie (> 5.5 mEq/L), brûlures > 48h, immobilisation prolongée > 5j, myopathie connue",
          "Si rocuronium ISR : sugammadex 200 mg (16 mg/kg pour 70 kg) dilué et prêt — IMPÉRATIF",
          "Préparer : aspiration Yankaur, vidéolaryngoscope, kit CICV disponibles, sonde ETT + mandrin"
        ],
        "intraop": [
          "Induction sans ventilation manuelle (pas de PPV entre induction et intubation)",
          "Hypnotique : étomidate 0.3 mg/kg IV (1ère intention) OU propofol 2 mg/kg si hémodynamique stable ± fentanyl 1–2 µg/kg co-induction",
          "Curare ISR : succinylcholine 1.5 mg/kg IV (délai 45–60s) OU rocuronium 1.2 mg/kg (60–90s) si CI succinylcholine",
          "Pression cricoïde : non recommandée systématiquement (ESA 2022) — si utilisée, relâcher si laryngoscopie difficile",
          "Tentative unique optimisée : vidéolaryngoscope en 1ère intention si VAD prévisible (DAS 2023)",
          "Confirmer ETT : capnographie (courbe EtCO2 obligatoire) + auscultation bilatérale + condensation",
          "Échec intubation : appel aide immédiat → LMA de sauvetage → CICV (cricothyrotomie)"
        ],
        "postop": [
          "Extubation : patient éveillé, ouvre les yeux, coopérant, force musculaire restaurée (TOF ratio ≥ 0.9)",
          "Surveillance SSPI : SpO2, FR, auscultation (inhalation silencieuse possible)",
          "Si inhalation confirmée : fibroscopie bronchique + Rx thorax + ATB si pneumopathie"
        ],
        "red_flags": [
          "SpO2 < 90% malgré induction : ventiler au masque (risque hypoxie > risque inhalation)",
          "CICV (cannot intubate, cannot oxygenate) : cricothyrotomie immédiate, sans délai",
          "Hyperkaliémie documentée : CI absolue succinylcholine → rocuronium 1.2 mg/kg",
          "Bradycardie sévère post-succinylcholine : atropine 0.5–1 mg IV",
          "Rigidité masséters + hyperthermie : hyperthermie maligne → dantrolène 2.5 mg/kg IV urgence"
        ],
        "drugs": [
          {"drug_id": "etomidate", "indication_tag": "induction_isr"},
          {"drug_id": "propofol", "indication_tag": "induction_isr"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation_isr"},
          {"drug_id": "sugammadex", "indication_tag": "reversal_isr"},
          {"drug_id": "fentanyl", "indication_tag": "co_induction"},
          {"drug_id": "atropine", "indication_tag": "bradycardie_suxamethonium"},
          {"drug_id": "midazolam", "indication_tag": "premedication"}
        ]
      },
      "en": {
        "preop": [
          "Identify aspiration risk: insufficient fasting (< 6h liquids, < 8h solids), surgical emergency, morbid obesity, pregnancy, ileus, hiatal hernia",
          "Pre-oxygenation: FiO2 100% tight-fitting mask 3 min (EtO2 > 90%) or 8 deep breaths if extreme emergency — head-up 20–30°",
          "Check succinylcholine contraindications: hyperkalemia (> 5.5 mEq/L), burns > 48h, prolonged immobilization > 5 days, known myopathy",
          "If rocuronium RSI: sugammadex 200 mg (16 mg/kg for 70 kg) drawn up and ready — MANDATORY",
          "Prepare: Yankaur suction, video laryngoscope, CICO kit, ETT + stylet"
        ],
        "intraop": [
          "Induction without manual ventilation (no PPV between induction and intubation)",
          "Induction agent: etomidate 0.3 mg/kg IV (first choice) OR propofol 2 mg/kg if hemodynamically stable ± fentanyl 1–2 µg/kg",
          "RSI NMB: succinylcholine 1.5 mg/kg IV (onset 45–60s) OR rocuronium 1.2 mg/kg (60–90s) if succinylcholine contraindicated",
          "Cricoid pressure: not routinely recommended (ESA 2022) — release if laryngoscopy is impaired",
          "Single optimized attempt: video laryngoscope first line if anticipated difficult airway (DAS 2023)",
          "Confirm ETT: capnography (EtCO2 waveform mandatory) + bilateral auscultation + condensation",
          "Failed intubation: immediate call for help → rescue LMA → CICO protocol (cricothyrotomy)"
        ],
        "postop": [
          "Extubation: awake, opens eyes on command, full muscle strength (TOF ratio ≥ 0.9)",
          "PACU monitoring: SpO2, RR, auscultation (silent aspiration possible)",
          "If aspiration confirmed: bronchoscopy + chest X-ray + antibiotics if pneumonia"
        ],
        "red_flags": [
          "SpO2 < 90% post-induction: ventilate (hypoxia risk outweighs aspiration risk)",
          "CICO (cannot intubate, cannot oxygenate): immediate cricothyrotomy, no delay",
          "Documented hyperkalemia: succinylcholine absolutely contraindicated → rocuronium 1.2 mg/kg",
          "Severe bradycardia post-succinylcholine: atropine 0.5–1 mg IV",
          "Masseter rigidity + hyperthermia: malignant hyperthermia → dantrolene 2.5 mg/kg IV urgent"
        ],
        "drugs": [
          {"drug_id": "etomidate", "indication_tag": "induction_isr"},
          {"drug_id": "propofol", "indication_tag": "induction_isr"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation_isr"},
          {"drug_id": "sugammadex", "indication_tag": "reversal_isr"},
          {"drug_id": "fentanyl", "indication_tag": "co_induction"},
          {"drug_id": "atropine", "indication_tag": "bradycardie_suxamethonium"},
          {"drug_id": "midazolam", "indication_tag": "premedication"}
        ]
      },
      "pt": {
        "preop": [
          "Identificar risco de aspiração: jejum insuficiente (< 6h líquidos, < 8h sólidos), urgência cirúrgica, obesidade mórbida, gravidez, íleo, hérnia hiatal",
          "Pré-oxigenação: FiO2 100% máscara hermética 3 min (EtO2 > 90%) ou 8 respirações profundas em emergência extrema — proclive 20–30°",
          "Verificar contraindicações succinilcolina: hipercaliemia (> 5.5 mEq/L), queimaduras > 48h, imobilização prolongada > 5 dias, miopatia conhecida",
          "Se rocurônio ISR: sugamadex 200 mg (16 mg/kg para 70 kg) preparado e pronto — OBRIGATÓRIO",
          "Preparar: aspiração Yankaur, videolaringoscópio, kit CICO, tubo endotraqueal + estilete"
        ],
        "intraop": [
          "Indução sem ventilação manual (sem PPV entre indução e entubação)",
          "Agente hipnótico: etomidato 0.3 mg/kg IV (1ª escolha) OU propofol 2 mg/kg se hemodinâmica estável ± fentanil 1–2 µg/kg",
          "Bloqueio neuromuscular ISR: succinilcolina 1.5 mg/kg IV (início 45–60s) OU rocurônio 1.2 mg/kg (60–90s) se CI succinilcolina",
          "Pressão cricoide: não recomendada sistematicamente (ESA 2022) — liberar se laringoscopia dificultada",
          "Tentativa única otimizada: videolaringoscópio em 1ª linha se VAD previsível (DAS 2023)",
          "Confirmar tubo: capnografia (curva EtCO2 obrigatória) + auscultação bilateral + condensação",
          "Falha de entubação: pedir ajuda imediata → máscara laríngea de salvamento → protocolo CICO"
        ],
        "postop": [
          "Extubação: acordado, abre olhos ao pedido, força muscular recuperada (TOF ratio ≥ 0.9)",
          "Monitorização UCPA: SpO2, FR, auscultação (aspiração silenciosa possível)",
          "Se aspiração confirmada: fibroscopia brônquica + Rx tórax + antibióticos se pneumonia"
        ],
        "red_flags": [
          "SpO2 < 90% após indução: ventilar (risco hipóxia > risco aspiração)",
          "CICO (não entuba, não oxigena): cricotirotomia imediata, sem demora",
          "Hipercaliemia documentada: CI absoluta succinilcolina → rocurônio 1.2 mg/kg",
          "Bradicardia grave pós-succinilcolina: atropina 0.5–1 mg IV",
          "Rigidez dos masseteres + hipertermia: hipertermia maligna → dantroleno 2.5 mg/kg IV urgência"
        ],
        "drugs": [
          {"drug_id": "etomidate", "indication_tag": "induction_isr"},
          {"drug_id": "propofol", "indication_tag": "induction_isr"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation_isr"},
          {"drug_id": "sugammadex", "indication_tag": "reversal_isr"},
          {"drug_id": "fentanyl", "indication_tag": "co_induction"},
          {"drug_id": "atropine", "indication_tag": "bradycardie_suxamethonium"},
          {"drug_id": "midazolam", "indication_tag": "premedication"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Indications: estomac plein avéré ou suspecté (urgence, jeûne insuffisant, obésité IMC > 40, grossesse > 16 SA, iléus, RGO sévère, hernie hiatale, trauma récent)",
          "Succinylcholine 1.5 mg/kg : curare dépolarisant, délai 45–60s, durée 8–12 min. Référence ISR mais nombreuses CI (hyperkaliémie, myopathies, brûlés > 48h)",
          "Rocuronium 1.2 mg/kg : non-dépolarisant à haute dose, délai 60–90s comparable. Antagonisé par sugammadex 16 mg/kg en 2–3 min. Alternative ISR de référence si CI succinylcholine",
          "Sugammadex 16 mg/kg (dose ISR) : seul antidote rocuronium permettant récupération ultrarapide — disponibilité OBLIGATOIRE si rocuronium ISR utilisé",
          "Étomidate : stabilité hémodynamique supérieure au propofol (suppression surrénalienne transitoire sur dose unique : acceptable). Agent d'induction de référence ISR",
          "Préoxygénation optimale : EtO2 > 90% avant induction. OHD nasal 15 L/min pendant laryngoscopie (oxygénation apnéique) si désaturation perop",
          "Vidéolaryngoscope en 1ère intention : améliore vue laryngée, réduit taux échec intubation — recommandé DAS 2023 pour toute ISR"
        ],
        "pitfalls": [
          "Ne jamais ventiler au masque entre induction et intubation sauf désaturation < 90% (risque hypoxie > risque inhalation à ce stade)",
          "Oublier de préparer sugammadex si rocuronium ISR : risque CICV sans antagonisme rapide",
          "Sous-estimer délai rocuronium : attendre impérativement 60–90s avant laryngoscopie",
          "Pression cricoïde mal positionnée : risque déformation laryngée, laryngoscopie plus difficile — relâcher si gêne à la visualisation",
          "ISR chez la femme enceinte : désaturation plus rapide (CRF réduite, VO2 augmenté) — préoxygéner en position demi-assise ou DLG ; utiliser étomidate (ou kétamine si hypotension) ; rocuronium + sugammadex préférés",
          "ISR chez l'obèse : préoxygénation en position beach-chair 45° ; calculer doses sur IBW (propofol, fentanyl) sauf succinylcholine (TBW)",
          "Hyperthermie maligne : rigidité masséters + hyperthermie + hypercapnie → arrêt halogénés + dantrolène 2.5 mg/kg IV bolus (répéter jusqu'à 10 mg/kg)"
        ],
        "references": [
          {"source": "DAS Guidelines — Unanticipated Difficult Airway in Adults", "year": 2023},
          {"source": "ESA/EBA Guidelines on Airway Management", "year": 2022},
          {"source": "SFAR — Recommandations sur l'ISR (Consensus formalisé)", "year": 2022},
          {"source": "Cochrane Review — Rocuronium versus succinylcholine for RSI", "year": 2021},
          {"source": "NAP4 — Major Complications of Airway Management in the UK", "year": 2011}
        ]
      },
      "en": {
        "clinical": [
          "Indications: confirmed or suspected full stomach (emergency, insufficient fasting, obesity BMI > 40, pregnancy > 16 weeks, ileus, severe GERD, hiatal hernia, recent trauma)",
          "Succinylcholine 1.5 mg/kg: depolarizing NMB, onset 45–60s, duration 8–12 min. RSI reference agent with multiple contraindications",
          "Rocuronium 1.2 mg/kg: non-depolarizing NMB at high dose, onset 60–90s comparable to succinylcholine. Reversed by sugammadex 16 mg/kg in 2–3 min",
          "Sugammadex 16 mg/kg (RSI dose): only antidote allowing ultra-rapid rocuronium reversal — availability MANDATORY if rocuronium RSI used",
          "Etomidate: superior hemodynamic stability vs propofol (transient adrenal suppression from single dose: acceptable). Reference induction agent for RSI",
          "Optimal pre-oxygenation: EtO2 > 90% before induction. High-flow nasal O2 15 L/min during laryngoscopy (apneic oxygenation) if desaturation",
          "Video laryngoscope first line: improves laryngeal view, reduces intubation failure — recommended DAS 2023 for all RSI"
        ],
        "pitfalls": [
          "Never mask ventilate between induction and intubation unless SpO2 < 90%",
          "Failing to prepare sugammadex with rocuronium RSI: CICO risk without rapid reversal",
          "Underestimating rocuronium onset: must wait 60–90s before laryngoscopy",
          "Poorly applied cricoid pressure: risk of laryngeal deformation — release if impeding visualization",
          "RSI in pregnancy: faster desaturation (reduced FRC, increased VO2) — preoxygenate semi-recumbent or left lateral; prefer etomidate (or ketamine if hypotensive); rocuronium + sugammadex preferred",
          "RSI in obesity: preoxygenate beach-chair 45°; dose on IBW (propofol, fentanyl) except succinylcholine (TBW)",
          "Malignant hyperthermia: masseter rigidity + hyperthermia + hypercapnia → stop volatiles + dantrolene 2.5 mg/kg IV bolus"
        ],
        "references": [
          {"source": "DAS Guidelines — Unanticipated Difficult Airway in Adults", "year": 2023},
          {"source": "ESA/EBA Guidelines on Airway Management", "year": 2022},
          {"source": "SFAR — RSI Consensus Recommendations", "year": 2022},
          {"source": "Cochrane Review — Rocuronium vs Succinylcholine for RSI", "year": 2021}
        ]
      },
      "pt": {
        "clinical": [
          "Indicações: estômago cheio confirmado ou suspeito (urgência, jejum insuficiente, obesidade IMC > 40, gravidez > 16 semanas, íleo, DRGE severo, hérnia hiatal, trauma recente)",
          "Succinilcolina 1.5 mg/kg: BNM despolarizante, início 45–60s, duração 8–12 min. Agente de referência ISR com múltiplas contraindicações",
          "Rocurônio 1.2 mg/kg: BNM não-despolarizante em alta dose, início 60–90s comparável à succinilcolina. Antagonizado por sugamadex 16 mg/kg em 2–3 min",
          "Sugamadex 16 mg/kg (dose ISR): único antídoto com reversão ultra-rápida do rocurônio — OBRIGATÓRIO se rocurônio ISR usado",
          "Etomidato: estabilidade hemodinâmica superior ao propofol. Agente de indução de referência para ISR",
          "Pré-oxigenação ótima: EtO2 > 90% antes da indução. O2 alto débito nasal 15 L/min durante laringoscopia (oxigenação apneica) se dessaturação"
        ],
        "pitfalls": [
          "Nunca ventilar com máscara entre indução e entubação exceto SpO2 < 90%",
          "Esquecer de preparar sugamadex com rocurônio ISR: risco CICO sem reversão rápida",
          "Subestimar início do rocurônio: aguardar obrigatoriamente 60–90s antes da laringoscopia",
          "Pressão cricoide mal aplicada: risco de deformação laríngea — liberar se dificultar visualização",
          "ISR na grávida: dessaturação mais rápida — pré-oxigenar em posição semi-sentada ou DLE; rocurônio + sugamadex preferidos",
          "ISR no obeso: pré-oxigenar em posição cadeira de praia 45°; doses calculadas no PCI exceto succinilcolina (peso real)"
        ],
        "references": [
          {"source": "DAS Guidelines — Unanticipated Difficult Airway in Adults", "year": 2023},
          {"source": "ESA/EBA Guidelines on Airway Management", "year": 2022},
          {"source": "SFAR — Recomendações ISR", "year": 2022}
        ]
      }
    }
  }$content$::jsonb,
  '["airway","trauma"]'::jsonb,
  false
)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- PROCEDURE 2 — Prévention des Nausées-Vomissements Post-Opératoires (NVPO)
-- Specialty: chirurgie-generale
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'prevention_nvpo',
  'chirurgie-generale',
  '["chirurgie-generale","gynecologie","obstetrique","orl","orthopedie"]'::jsonb,
  '{"fr":"Prévention des Nausées-Vomissements Post-Opératoires (NVPO)","en":"Postoperative Nausea and Vomiting Prevention (PONV)","pt":"Prevenção de Náuseas e Vómitos Pós-Operatórios (NVPO)"}'::jsonb,
  '{"fr":["NVPO","nausées postop","vomissements postop","score Apfel","antiémétiques"],"en":["PONV","postoperative nausea","vomiting prevention","Apfel score"],"pt":["NVPO","náuseas pós-op","score Apfel","antieméticos"]}'::jsonb,
  $content${
    "quick": {
      "fr": {
        "preop": [
          "Score d'Apfel (0–4 pts) : [Sexe féminin] + [Non-fumeur] + [ATCD NVPO ou mal des transports] + [Morphiniques postop prévus] — 1 pt chaque",
          "Score 0–1 : risque faible (< 20%) → prophylaxie non systématique",
          "Score 2 : risque modéré (40%) → 1–2 antiémétiques recommandés",
          "Score ≥ 3 : risque élevé (60–80%) → 2–3 antiémétiques + réduction morphiniques (ALR, kétamine, AINS)",
          "Facteurs chirurgicaux à risque élevé : cholécystectomie cœlioscopique, chirurgie gynécologique, ORL, strabisme, mastectomie"
        ],
        "intraop": [
          "Dexaméthasone 4–8 mg IV à l'induction (durée d'action 24h, réduction NVPO prouvée — SFAR Grade A)",
          "Ondansétron 4 mg IV en fin d'intervention (pic d'efficacité au réveil, durée 6h)",
          "TIVA au propofol : préférer aux halogénés si score Apfel ≥ 3 (réduction NVPO intrinsèque)",
          "Éviter le N2O (si possible) et réduire les halogénés",
          "Analgésie multimodale : paracétamol + AINS + ALR → épargne morphinique → ↓ NVPO",
          "Kétamine 0.25 mg/kg (sub-anesthésique) : co-analgésie + effet antiémétique documenté",
          "Droperidol 0.625–1.25 mg IV si ondansétron insuffisant (efficacité prouvée, surveillance QTc)"
        ],
        "postop": [
          "Poursuivre hydratation IV adéquate (hypovolémie → ↑ NVPO)",
          "Antiémétique de secours en SSPI : métoclopramide 10 mg IV si classe différente de la prophylaxie",
          "Position demi-assise, éviter les mouvements brusques",
          "Si PCA morphine : ajouter ondansétron systématiquement",
          "Sortie ambulatoire : s'assurer de l'absence de NVPO active (critère de sortie)"
        ],
        "red_flags": [
          "NVPO réfractaires : exclure hypoglycémie, hypotension, douleur sous-traitée, iléus, obstruction intestinale",
          "Vomissements violents postop précoces : risque déhiscence + aspiration — position latérale + aspiration + réévaluation chirurgicale",
          "Prolongation QTc > 500 ms : éviter association ondansétron + droperidol — ECG si terrain à risque",
          "Dexaméthasone et hyperglycémie : surveiller glycémie chez le diabétique (effet hyperglycémiant 12–24h)"
        ],
        "drugs": [
          {"drug_id": "dexamethasone", "indication_tag": "prophylaxie_nvpo"},
          {"drug_id": "ondansetron", "indication_tag": "prophylaxie_nvpo"},
          {"drug_id": "propofol", "indication_tag": "tiva_anti_nvpo"},
          {"drug_id": "ketamine", "indication_tag": "co_analgesie_anti_nvpo"},
          {"drug_id": "morphine", "indication_tag": "analgesie_postop"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie_multimodale"}
        ]
      },
      "en": {
        "preop": [
          "Apfel score (0–4 pts): [Female sex] + [Non-smoker] + [History of PONV or motion sickness] + [Postoperative opioids planned] — 1 pt each",
          "Score 0–1: low risk (< 20%) → prophylaxis not mandatory",
          "Score 2: moderate risk (40%) → 1–2 antiemetics recommended",
          "Score ≥ 3: high risk (60–80%) → 2–3 antiemetics + opioid reduction strategy (regional anesthesia, ketamine, NSAIDs)",
          "High-risk surgical factors: laparoscopic cholecystectomy, gynecological surgery, ENT, strabismus, mastectomy"
        ],
        "intraop": [
          "Dexamethasone 4–8 mg IV at induction (24h duration, proven PONV reduction — Grade A)",
          "Ondansetron 4 mg IV at end of surgery (peak efficacy at awakening, 6h duration)",
          "Propofol TIVA: prefer over volatile agents if Apfel score ≥ 3 (intrinsic anti-emetic effect)",
          "Avoid nitrous oxide (if possible) and minimize volatile anesthetic use",
          "Multimodal analgesia: paracetamol + NSAIDs + regional anesthesia → opioid sparing → ↓ PONV",
          "Ketamine 0.25 mg/kg (sub-anesthetic): co-analgesia + documented antiemetic effect",
          "Droperidol 0.625–1.25 mg IV if ondansetron insufficient (proven efficacy, monitor QTc)"
        ],
        "postop": [
          "Maintain adequate IV hydration (hypovolemia increases PONV)",
          "Rescue antiemetic in PACU: metoclopramide 10 mg IV if different class from prophylaxis",
          "Semi-recumbent position, avoid sudden movements",
          "If morphine PCA: add ondansetron routinely",
          "Day-case discharge: ensure absence of active PONV (discharge criterion)"
        ],
        "red_flags": [
          "Refractory PONV: exclude hypoglycemia, hypotension, undertreated pain, ileus, bowel obstruction",
          "Severe early postoperative vomiting: risk of aspiration + dehiscence — lateral position + suction + surgical reassessment",
          "QTc prolongation > 500 ms: avoid ondansetron + droperidol combination — ECG if at-risk patient",
          "Dexamethasone and hyperglycemia: monitor blood glucose in diabetics (hyperglycemic effect 12–24h)"
        ],
        "drugs": [
          {"drug_id": "dexamethasone", "indication_tag": "prophylaxie_nvpo"},
          {"drug_id": "ondansetron", "indication_tag": "prophylaxie_nvpo"},
          {"drug_id": "propofol", "indication_tag": "tiva_anti_nvpo"},
          {"drug_id": "ketamine", "indication_tag": "co_analgesie_anti_nvpo"},
          {"drug_id": "morphine", "indication_tag": "analgesie_postop"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie_multimodale"}
        ]
      },
      "pt": {
        "preop": [
          "Score de Apfel (0–4 pts): [Sexo feminino] + [Não fumador] + [ATCD NVPO ou cinetose] + [Opioides pós-op previstos] — 1 pt cada",
          "Score 0–1: risco baixo (< 20%) → profilaxia não obrigatória",
          "Score 2: risco moderado (40%) → 1–2 antieméticos recomendados",
          "Score ≥ 3: risco elevado (60–80%) → 2–3 antieméticos + redução de opioides (ALR, cetamina, AINEs)",
          "Fatores cirúrgicos de alto risco: colecistectomia laparoscópica, cirurgia ginecológica, ORL, estrabismo, mastectomia"
        ],
        "intraop": [
          "Dexametasona 4–8 mg IV na indução (duração 24h, redução NVPO comprovada — Grau A)",
          "Ondansetrom 4 mg IV no fim da cirurgia (pico de eficácia no acordar, duração 6h)",
          "TIVA com propofol: preferir aos agentes voláteis se score Apfel ≥ 3 (efeito antiemético intrínseco)",
          "Evitar óxido nitroso (se possível) e minimizar anestésicos voláteis",
          "Analgesia multimodal: paracetamol + AINEs + ALR → poupança de opioides → ↓ NVPO",
          "Cetamina 0.25 mg/kg (subanestésico): co-analgesia + efeito antiemético documentado"
        ],
        "postop": [
          "Manter hidratação IV adequada (hipovolemia aumenta NVPO)",
          "Antiemético de resgate na UCPA: metoclopramida 10 mg IV se classe diferente da profilaxia",
          "Posição semi-sentada, evitar movimentos bruscos",
          "Se PCA de morfina: adicionar ondansetrom sistematicamente",
          "Alta em ambulatório: garantir ausência de NVPO ativa (critério de alta)"
        ],
        "red_flags": [
          "NVPO refratários: excluir hipoglicemia, hipotensão, dor subtratada, íleo, obstrução intestinal",
          "Vómitos violentos pós-op precoces: risco de aspiração + deiscência — posição lateral + aspiração + reavaliação cirúrgica",
          "Prolongamento QTc > 500 ms: evitar associação ondansetrom + droperidol",
          "Dexametasona e hiperglicemia: monitorizar glicemia em diabéticos (efeito hiperglicemiante 12–24h)"
        ],
        "drugs": [
          {"drug_id": "dexamethasone", "indication_tag": "prophylaxie_nvpo"},
          {"drug_id": "ondansetron", "indication_tag": "prophylaxie_nvpo"},
          {"drug_id": "propofol", "indication_tag": "tiva_anti_nvpo"},
          {"drug_id": "ketamine", "indication_tag": "co_analgesie_anti_nvpo"},
          {"drug_id": "morphine", "indication_tag": "analgesie_postop"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie_multimodale"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Score d'Apfel : outil de stratification validé. Chaque point = 20% de risque additionnel. Score 4 → risque > 78%. Outil le plus utilisé et recommandé (SFAR 2020, ESA 2020)",
          "Dexaméthasone : mécanisme antiémétique central (inhibition prostaglandines). Effet maximal si donnée à l'induction. Dose 4 mg pour risque modéré, 8 mg pour risque élevé",
          "Ondansétron : antagoniste 5-HT3, meilleure efficacité sur vomissements. Donner en fin d'intervention (t½ 4h). Pas supérieur aux autres 5-HT3 (granisétron, palonosétron)",
          "TIVA propofol : réduction NVPO de 30% vs halogénés. Mécanisme : effet anti-émétique direct du propofol au réveil. Indiqué si score Apfel ≥ 3",
          "Triple prophylaxie (score ≥ 3) : dexaméthasone + 5-HT3 + TIVA au propofol ± kétamine. Objectif de réduction : 80% des NVPO",
          "Analgésie multimodale : chaque mg de morphine économisé réduit le risque NVPO. Infiltration, blocs nerveux, kétamine, AINS — systématiser si score élevé"
        ],
        "pitfalls": [
          "Ne pas oublier d'adapter la prophylaxie à la chirurgie (cholécystectomie, gynéco) même si score Apfel bas",
          "Ondansétron donné trop tôt (induction) : efficacité moindre au réveil (demi-vie courte)",
          "Dexaméthasone contre-indiquée ou limitée : diabète mal équilibré, immunodépression sévère, infection active — discuter bénéfice/risque",
          "Score Apfel ne tient pas compte des facteurs anesthésiques (halogéné, N2O, morphine) → intégrer dans la décision globale",
          "NVPO tardifs (> 24h) : revoir l'analgésie (morphine PCA), traitement de relais antiémétique oral"
        ],
        "references": [
          {"source": "SFAR — Recommandations NVPO (Actualisation 2020)", "year": 2020},
          {"source": "ESA/ESAIC — Guidelines on PONV Management", "year": 2020},
          {"source": "Apfel CC et al., NEJM — A simplified risk score for predicting PONV", "year": 1999},
          {"source": "Cochrane — Dexamethasone for PONV prevention", "year": 2021}
        ]
      },
      "en": {
        "clinical": [
          "Apfel score: validated risk stratification tool. Each point = ~20% additional risk. Score 4 → risk > 78%. Most widely used and recommended (SFAR 2020, ESA 2020)",
          "Dexamethasone: central antiemetic mechanism (prostaglandin inhibition). Maximum effect when given at induction. Dose 4 mg for moderate risk, 8 mg for high risk",
          "Ondansetron: 5-HT3 antagonist, best efficacy for vomiting. Give at end of surgery (t½ 4h). Not superior to other 5-HT3 agents (granisetron, palonosetron)",
          "Propofol TIVA: 30% reduction in PONV vs volatile agents. Mechanism: direct antiemetic effect of propofol at emergence. Indicated if Apfel score ≥ 3",
          "Triple prophylaxis (score ≥ 3): dexamethasone + 5-HT3 + propofol TIVA ± ketamine. Target: 80% PONV reduction",
          "Multimodal analgesia: each mg of morphine saved reduces PONV risk. Infiltration, nerve blocks, ketamine, NSAIDs — systematize if high-risk score"
        ],
        "pitfalls": [
          "Do not forget to adapt prophylaxis to surgery type (cholecystectomy, gynecological) even if Apfel score is low",
          "Ondansetron given too early (induction): reduced efficacy at emergence (short half-life)",
          "Dexamethasone contraindicated or limited: poorly controlled diabetes, severe immunosuppression, active infection — weigh benefit vs risk",
          "Apfel score does not account for anesthetic factors (volatile agents, N2O, morphine) → integrate in overall decision",
          "Late PONV (> 24h): reassess analgesia (PCA morphine), switch to oral antiemetic"
        ],
        "references": [
          {"source": "SFAR — PONV Recommendations 2020", "year": 2020},
          {"source": "ESA/ESAIC — Guidelines on PONV Management", "year": 2020},
          {"source": "Apfel CC et al., NEJM — Simplified risk score for PONV", "year": 1999},
          {"source": "Cochrane — Dexamethasone for PONV prevention", "year": 2021}
        ]
      },
      "pt": {
        "clinical": [
          "Score de Apfel: ferramenta de estratificação de risco validada. Cada ponto = ~20% de risco adicional. Score 4 → risco > 78%",
          "Dexametasona: mecanismo antiemético central (inibição prostaglandinas). Efeito máximo se dada na indução. Dose 4 mg risco moderado, 8 mg risco elevado",
          "Ondansetrom: antagonista 5-HT3, melhor eficácia nos vómitos. Dar no fim da cirurgia (t½ 4h)",
          "TIVA propofol: redução de 30% de NVPO vs voláteis. Indicado se score Apfel ≥ 3",
          "Profilaxia tripla (score ≥ 3): dexametasona + 5-HT3 + TIVA propofol ± cetamina. Objetivo: redução de 80% dos NVPO",
          "Analgesia multimodal: cada mg de morfina poupado reduz o risco de NVPO"
        ],
        "pitfalls": [
          "Não esquecer de adaptar a profilaxia ao tipo de cirurgia mesmo com score Apfel baixo",
          "Ondansetrom dado demasiado cedo (indução): eficácia reduzida no acordar",
          "Dexametasona contraindicada ou limitada: diabetes mal controlada, imunodepressão severa, infeção ativa",
          "NVPO tardios (> 24h): reavaliar analgesia, transitar para antiemético oral"
        ],
        "references": [
          {"source": "SFAR — Recommandations NVPO 2020", "year": 2020},
          {"source": "ESA/ESAIC — Guidelines on PONV Management", "year": 2020},
          {"source": "Apfel CC et al., NEJM", "year": 1999}
        ]
      }
    }
  }$content$::jsonb,
  '["ponv"]'::jsonb,
  false
)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- PROCEDURE 3 — Analgésie Multimodale Péri-Opératoire
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'analgesie_multimodale',
  'chirurgie-generale',
  '["chirurgie-generale","orthopedie","gynecologie","neurochirurgie","urologie"]'::jsonb,
  '{"fr":"Analgésie Multimodale Péri-Opératoire","en":"Perioperative Multimodal Analgesia","pt":"Analgesia Multimodal Peri-Operatória"}'::jsonb,
  '{"fr":["analgésie multimodale","épargne morphinique","douleur postop","PCA"],"en":["multimodal analgesia","opioid sparing","postoperative pain","PCA"],"pt":["analgesia multimodal","poupança opioides","dor pós-op"]}'::jsonb,
  $p3${
    "quick": {
      "fr": {
        "preop": [
          "Évaluation douleur préop : EVA/NRS repos et mouvement, antécédents douleur chronique, traitements en cours, consommation chronique opioïdes",
          "Prescription préventive : paracétamol 1g IV/PO, AINS si pas de CI, bloc nerveux si disponible",
          "Patient sous opioïdes chroniques : majoration des besoins postop prévisible — concertation algologie si nécessaire",
          "Terrain hyperalgésique : gabapentine 600 mg PO en prémédication"
        ],
        "intraop": [
          "Base : paracétamol 1g IV à l'induction + kétorolac 30 mg IV ou ibuprofène si pas de CI rénale/cardiaque/gastrique",
          "Kétamine sub-anesthésique 0.25 mg/kg bolus IV (terrain hyperalgésique, opioïdes chroniques, chirurgie lourde) ± perfusion 0.1–0.2 mg/kg/h",
          "Dexaméthasone 8 mg IV : épargne morphinique documentée + effet antiémétique (SFAR 2020)",
          "Lidocaïne IV 1.5 mg/kg bolus + 1–2 mg/kg/h IVSE : anti-hyperalgésique, accélère reprise transit (chirurgie abdominale)",
          "ALR : bloc nerveux périphérique ou périmédullaire si applicable → épargne morphinique maximale",
          "Morphine IV : titration si EVA > 5 (bolus 2–3 mg q5 min, cible EVA ≤ 3)"
        ],
        "postop": [
          "Prescrire d'emblée : paracétamol 1g q6h + AINS q8h (si pas de CI) — ne jamais attendre la douleur",
          "PCA morphine : 1 mg bolus q7 min, pas de débit continu de base, période réfractaire obligatoire",
          "Cible : EVA ≤ 3 au repos, ≤ 5 à la mobilisation",
          "Déprescrire morphine dès EVA ≤ 3 sous palier I–II",
          "Réévaluation systématique : H2, H6, H12, H24"
        ],
        "red_flags": [
          "Dépression respiratoire (FR < 8/min ou SpO2 < 92%) sous morphine : arrêt PCA + naloxone 0.04 mg IV q2 min",
          "Hyperalgésie (EVA > 7 malgré morphine) : kétamine IVSE, avis algologie",
          "Sédation excessive sous PCA (Ramsay ≥ 3) : réduire doses, exclure accumulation",
          "AINS et oligurie/anurie : arrêt immédiat, exclure insuffisance rénale"
        ],
        "drugs": [
          {"drug_id": "paracetamol", "indication_tag": "analgesie_palier1"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesie_ains"},
          {"drug_id": "ketorolac", "indication_tag": "analgesie_ains_iv"},
          {"drug_id": "morphine", "indication_tag": "analgesie_palier3"},
          {"drug_id": "ketamine", "indication_tag": "co_analgesie_sub_anesth"},
          {"drug_id": "dexamethasone", "indication_tag": "epargne_morphinique"},
          {"drug_id": "lidocaine", "indication_tag": "lidocaine_iv_perop"},
          {"drug_id": "fentanyl", "indication_tag": "analgesie_intraop"}
        ]
      },
      "en": {
        "preop": [
          "Preoperative pain assessment: VAS/NRS at rest and movement, chronic pain history, current medications, chronic opioid use",
          "Preventive prescription: paracetamol 1g IV/PO, NSAIDs if no contraindication, nerve block if available",
          "Chronic opioid users: increased postoperative needs expected",
          "Hyperalgesic patient: gabapentin 600 mg PO as premedication"
        ],
        "intraop": [
          "Base: paracetamol 1g IV at induction + ketorolac 30 mg IV or ibuprofen if no renal/cardiac/gastric CI",
          "Sub-anesthetic ketamine 0.25 mg/kg IV bolus (hyperalgesic, chronic opioids, major surgery) ± infusion 0.1–0.2 mg/kg/h",
          "Dexamethasone 8 mg IV: documented opioid-sparing effect + antiemetic (SFAR 2020)",
          "IV lidocaine 1.5 mg/kg bolus + 1–2 mg/kg/h infusion: anti-hyperalgesic, accelerates GI recovery (abdominal surgery)",
          "Regional anesthesia: peripheral nerve block or neuraxial if applicable → maximum opioid sparing",
          "IV morphine: titration if VAS > 5 (2–3 mg bolus q5 min, target VAS ≤ 3)"
        ],
        "postop": [
          "Prescribe upfront: paracetamol 1g q6h + NSAIDs q8h (if no CI) — never wait for pain",
          "Morphine PCA: 1 mg bolus q7 min, no background infusion, mandatory lockout",
          "Target: VAS ≤ 3 at rest, ≤ 5 with movement",
          "De-escalate morphine when VAS ≤ 3 on step I–II",
          "Systematic reassessment: H2, H6, H12, H24"
        ],
        "red_flags": [
          "Respiratory depression (RR < 8/min or SpO2 < 92%) on morphine: stop PCA + naloxone 0.04 mg IV q2 min",
          "Hyperalgesia (VAS > 7 despite morphine): ketamine infusion, pain service consult",
          "Excessive sedation on PCA (Ramsay ≥ 3): reduce doses, exclude accumulation",
          "NSAIDs with oliguria/anuria: stop immediately, exclude renal failure"
        ],
        "drugs": [
          {"drug_id": "paracetamol", "indication_tag": "analgesie_palier1"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesie_ains"},
          {"drug_id": "ketorolac", "indication_tag": "analgesie_ains_iv"},
          {"drug_id": "morphine", "indication_tag": "analgesie_palier3"},
          {"drug_id": "ketamine", "indication_tag": "co_analgesie_sub_anesth"},
          {"drug_id": "dexamethasone", "indication_tag": "epargne_morphinique"},
          {"drug_id": "lidocaine", "indication_tag": "lidocaine_iv_perop"},
          {"drug_id": "fentanyl", "indication_tag": "analgesie_intraop"}
        ]
      },
      "pt": {
        "preop": [
          "Avaliação da dor pré-op: EVA/NRS em repouso e movimento, dor crónica, medicação atual, uso crónico de opioides",
          "Prescrição preventiva: paracetamol 1g IV/PO, AINEs se sem CI, bloqueio nervoso se disponível",
          "Doente com opioides crónicos: maiores necessidades pós-op esperadas",
          "Doente hiperalgésico: gabapentina 600 mg PO como pré-medicação"
        ],
        "intraop": [
          "Base: paracetamol 1g IV na indução + cetorolac 30 mg IV ou ibuprofeno se sem CI",
          "Cetamina subanestésica 0.25 mg/kg IV bolus ± perfusão 0.1–0.2 mg/kg/h",
          "Dexametasona 8 mg IV: efeito poupador de opioides + antiemético",
          "Lidocaína IV 1.5 mg/kg bolus + 1–2 mg/kg/h IVSE (cirurgia abdominal)",
          "ALR: bloqueio nervoso periférico ou neuroaxial se aplicável",
          "Morfina IV: titulação se EVA > 5"
        ],
        "postop": [
          "Prescrever de imediato: paracetamol 1g q6h + AINEs q8h (se sem CI)",
          "PCA morfina: 1 mg bolus q7 min, sem débito contínuo de base",
          "Alvo: EVA ≤ 3 em repouso, ≤ 5 na mobilização",
          "Desescalar morfina quando EVA ≤ 3 com escada I–II",
          "Reavaliação: H2, H6, H12, H24"
        ],
        "red_flags": [
          "Depressão respiratória (FR < 8/min ou SpO2 < 92%) com morfina: parar PCA + naloxona 0.04 mg IV q2 min",
          "Hiperalgesia (EVA > 7 apesar morfina): cetamina IVSE, consulta dor",
          "Sedação excessiva com PCA (Ramsay ≥ 3): reduzir doses",
          "AINEs com oligúria/anúria: parar imediatamente"
        ],
        "drugs": [
          {"drug_id": "paracetamol", "indication_tag": "analgesie_palier1"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesie_ains"},
          {"drug_id": "ketorolac", "indication_tag": "analgesie_ains_iv"},
          {"drug_id": "morphine", "indication_tag": "analgesie_palier3"},
          {"drug_id": "ketamine", "indication_tag": "co_analgesie_sub_anesth"},
          {"drug_id": "dexamethasone", "indication_tag": "epargne_morphinique"},
          {"drug_id": "lidocaine", "indication_tag": "lidocaine_iv_perop"},
          {"drug_id": "fentanyl", "indication_tag": "analgesie_intraop"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Principe : combiner des agents de mécanismes différents → épargne morphinique → réduction effets indésirables opioïdes",
          "Paracétamol IV : efficacité Grade A. Inhibe COX-3 central + voie sérotoninergique descendante. Début d'action 15 min IV",
          "AINS (ibuprofène, kétorolac) : inhibition COX-1/COX-2. Réduction morphine 30–50%. CI : IRC DFG < 30, IC, ulcère actif, grossesse T3",
          "Kétamine sub-anesthésique : antagoniste NMDA. Prévient hyperalgésie et tolérance aux opioïdes. Particulièrement indiquée en cas de consommation chronique d'opioïdes (réduction 30–50% morphine postop)",
          "Lidocaïne IV : anti-hyperalgésique + effet anti-iléus. Efficacité démontrée en chirurgie colorectale",
          "ALR maximale : aucun antalgique systémique ne rivalise avec un bloc bien conduit"
        ],
        "pitfalls": [
          "Omettre paracétamol ou AINS en postop : consommation morphinique inutile",
          "PCA sans éducation patient : sur- ou sous-utilisation",
          "AINS et hémostase chirurgicale récente : discuter avec le chirurgien",
          "Ne pas poursuivre le traitement antalgique chronique préexistant en péri-opératoire"
        ],
        "references": [
          {"source": "SFAR — Recommandations Analgésie Postopératoire 2020", "year": 2020},
          {"source": "ESA — Acute Postoperative Pain Management Guidelines", "year": 2021},
          {"source": "Cochrane — Ketamine as adjunct to opioids for acute pain", "year": 2020},
          {"source": "Cochrane — IV lidocaine for perioperative pain in adults", "year": 2019}
        ]
      },
      "en": {
        "clinical": [
          "Principle: combine agents with different mechanisms → opioid sparing → reduce opioid side effects",
          "IV paracetamol: Grade A efficacy. Inhibits central COX-3 + descending serotonergic pathway. Onset 15 min IV",
          "NSAIDs: COX-1/COX-2 inhibition. 30–50% morphine reduction. CI: CKD GFR < 30, heart failure, active ulcer, T3 pregnancy",
          "Sub-anesthetic ketamine: NMDA antagonist. Prevents hyperalgesia and opioid tolerance",
          "IV lidocaine: anti-hyperalgesic + anti-ileus. Efficacy in colorectal surgery"
        ],
        "pitfalls": [
          "Omitting paracetamol or NSAIDs postoperatively",
          "PCA without patient education",
          "NSAIDs and surgical hemostasis: discuss with surgeon",
          "Not continuing pre-existing chronic pain treatment perioperatively"
        ],
        "references": [
          {"source": "SFAR — Postoperative Analgesia Recommendations 2020", "year": 2020},
          {"source": "ESA — Acute Postoperative Pain Management Guidelines", "year": 2021},
          {"source": "Cochrane — Ketamine as adjunct to opioids for acute pain", "year": 2020},
          {"source": "Cochrane — IV lidocaine for perioperative pain", "year": 2019}
        ]
      },
      "pt": {
        "clinical": [
          "Princípio: combinar agentes com mecanismos diferentes → poupança de opioides → redução efeitos adversos",
          "Paracetamol IV: eficácia Grau A. Início 15 min IV",
          "AINEs: inibição COX-1/COX-2. Redução morfina 30–50%",
          "Cetamina subanestésica: antagonista NMDA. Especialmente eficaz em utilizadores crónicos de opioides",
          "Lidocaína IV: anti-hiperalgésico + anti-íleo. Eficácia em cirurgia colorrectal"
        ],
        "pitfalls": [
          "Omitir paracetamol ou AINEs no pós-op",
          "PCA sem educação do doente",
          "AINEs e hemostase cirúrgica: discutir com cirurgião",
          "Não continuar tratamento crónico da dor no peri-operatório"
        ],
        "references": [
          {"source": "SFAR — Recomendações Analgesia Pós-Operatória 2020", "year": 2020},
          {"source": "ESA — Acute Postoperative Pain Management Guidelines", "year": 2021},
          {"source": "Cochrane — Ketamine as adjunct to opioids for acute pain", "year": 2020}
        ]
      }
    }
  }$p3$::jsonb,
  '[]'::jsonb,
  false
)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- PROCEDURE 4 — Choc Anaphylactique Peropératoire
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'choc_anaphylactique_perop',
  'chirurgie-generale',
  '["chirurgie-generale","orthopedie","gynecologie","neurochirurgie","urologie","orl","obstetrique"]'::jsonb,
  '{"fr":"Choc Anaphylactique Peropératoire","en":"Intraoperative Anaphylaxis","pt":"Choque Anafilático Intraoperatório"}'::jsonb,
  '{"fr":["anaphylaxie","choc allergique","allergie perop","Ring Messmer","tryptase"],"en":["anaphylaxis","intraoperative allergy","anaphylactic shock"],"pt":["anafilaxia","choque alérgico","alergia intraop"]}'::jsonb,
  $p4${
    "quick": {
      "fr": {
        "preop": [
          "Interroger allergies : latex, chlorhexidine, AINS, bétalactamines, produits de contraste iodés, curares",
          "Bilan allergologique préop si antécédent de réaction peropératoire (IgE spécifiques, prick tests, IDR)",
          "Environnement latex-free obligatoire si allergie latex documentée",
          "Adrénaline 1 mg/mL : préparer dilution prête à l'emploi (1 mg dans 10 mL NaCl → 0.1 mg/mL)",
          "Monitoring complet : SpO2, ECG, PNI, EtCO2 — indispensable pour détection précoce"
        ],
        "intraop": [
          "Grade I (cutané seul) : arrêter l'allergène suspecté, antihistaminiques, surveillance",
          "Grade II (modéré) : adrénaline 10–50 µg IV + NaCl 0.9% 20 mL/kg",
          "Grade III (choc) : ADRÉNALINE 0.1–0.5 mg IV bolus (1ère ligne ABSOLUE) + remplissage agressif NaCl 0.9% 20–30 mL/kg",
          "Grade IV (arrêt cardiaque) : RCP standard + adrénaline 1 mg IV q3–5 min",
          "Décubitus dorsal strict + membres inférieurs surélevés (sauf bronchospasme)",
          "Méthylprednisolone 1–2 mg/kg IV : efficacité différée, prévention récidive biphasique",
          "Appel aide immédiat, prévenir réanimation"
        ],
        "postop": [
          "Surveillance minimum 24h en réanimation si grade III–IV",
          "Tryptase sérique en urgence (pic 60–90 min) + à H24 (basal) : confirme diagnostic",
          "Bilan allergologique complet à 4–6 semaines",
          "Déclaration pharmacovigilance obligatoire",
          "Carte d'allergie + adressage allergo-anesthésie"
        ],
        "red_flags": [
          "Choc réfractaire à l'adrénaline : noradrénaline IVSE 0.1–0.5 µg/kg/min + réanimateur",
          "Bronchospasme sévère réfractaire : salbutamol nébulisé 5 mg ± adrénaline inhalée",
          "Récidive biphasique à H4–H12 : surveillance prolongée même si résolution initiale",
          "Arrêt cardiaque réfractaire : ECMO veno-artérielle si centre disponible"
        ],
        "drugs": [
          {"drug_id": "adrenaline", "indication_tag": "anaphylaxie_1ere_ligne"},
          {"drug_id": "noradrenaline", "indication_tag": "choc_refractaire"},
          {"drug_id": "dexamethasone", "indication_tag": "corticoide_anaphylaxie"},
          {"drug_id": "ephedrine", "indication_tag": "hypotension_moderee"},
          {"drug_id": "atropine", "indication_tag": "bradycardie_anaphylaxie"}
        ]
      },
      "en": {
        "preop": [
          "Document allergies: latex, chlorhexidine, NSAIDs, beta-lactams, iodinated contrast, neuromuscular blocking agents",
          "Preoperative allergy workup if history of intraoperative reaction",
          "Latex-free environment mandatory if documented latex allergy",
          "Epinephrine 1 mg/mL: prepare ready-to-use dilution (1 mg in 10 mL NaCl → 0.1 mg/mL)",
          "Complete monitoring: SpO2, ECG, NIBP, EtCO2"
        ],
        "intraop": [
          "Grade I (cutaneous): stop suspect allergen, antihistamines, monitor",
          "Grade II (moderate): epinephrine 10–50 µg IV + NaCl 0.9% 20 mL/kg",
          "Grade III (shock): EPINEPHRINE 0.1–0.5 mg IV bolus (ABSOLUTE first line) + aggressive NaCl 0.9% 20–30 mL/kg",
          "Grade IV (cardiac arrest): CPR + epinephrine 1 mg IV q3–5 min",
          "Strict supine + legs elevated (except bronchospasm)",
          "Methylprednisolone 1–2 mg/kg IV: delayed efficacy, prevents biphasic reaction",
          "Immediate call for help, notify ICU"
        ],
        "postop": [
          "Minimum 24h ICU monitoring if grade III–IV",
          "Urgent serum tryptase (peak 60–90 min) + H24 baseline",
          "Complete allergy workup at 4–6 weeks",
          "Mandatory pharmacovigilance reporting",
          "Allergy card + referral to anesthesia-allergology"
        ],
        "red_flags": [
          "Epinephrine-refractory shock: norepinephrine infusion 0.1–0.5 µg/kg/min",
          "Severe refractory bronchospasm: salbutamol 5 mg nebulized ± inhaled epinephrine",
          "Biphasic reaction H4–H12: prolonged monitoring",
          "Refractory cardiac arrest: VA-ECMO if available"
        ],
        "drugs": [
          {"drug_id": "adrenaline", "indication_tag": "anaphylaxie_1ere_ligne"},
          {"drug_id": "noradrenaline", "indication_tag": "choc_refractaire"},
          {"drug_id": "dexamethasone", "indication_tag": "corticoide_anaphylaxie"},
          {"drug_id": "ephedrine", "indication_tag": "hypotension_moderee"},
          {"drug_id": "atropine", "indication_tag": "bradycardie_anaphylaxie"}
        ]
      },
      "pt": {
        "preop": [
          "Documentar alergias: látex, clorexidina, AINEs, betalactâmicos, contrastes iodados, curares",
          "Estudo alergológico pré-op se história de reação intraoperatória",
          "Ambiente sem látex obrigatório se alergia ao látex documentada",
          "Adrenalina 1 mg/mL: preparar diluição pronta a usar",
          "Monitorização completa: SpO2, ECG, PNI, EtCO2"
        ],
        "intraop": [
          "Grau I (cutâneo): parar alergénio suspeito, anti-histamínicos",
          "Grau II (moderado): adrenalina 10–50 µg IV + NaCl 0.9% 20 mL/kg",
          "Grau III (choque): ADRENALINA 0.1–0.5 mg IV bolus (1ª linha ABSOLUTA) + reposição volémica agressiva",
          "Grau IV (paragem cardíaca): RCP + adrenalina 1 mg IV q3–5 min",
          "Decúbito dorsal + membros inferiores elevados",
          "Metilprednisolona 1–2 mg/kg IV: previne reação bifásica",
          "Pedir ajuda imediata, avisar UCI"
        ],
        "postop": [
          "Vigilância mínima 24h UCI se grau III–IV",
          "Triptase sérica urgente (pico 60–90 min) + H24 basal",
          "Estudo alergológico completo 4–6 semanas",
          "Declaração obrigatória de farmacovigilância",
          "Cartão de alergia + referência alergoanestesia"
        ],
        "red_flags": [
          "Choque refratário à adrenalina: noradrenalina IVSE 0.1–0.5 µg/kg/min",
          "Broncoespasmo grave refratário: salbutamol 5 mg nebulizado",
          "Reação bifásica H4–H12: vigilância prolongada",
          "Paragem cardíaca refratária: ECMO veno-arterial"
        ],
        "drugs": [
          {"drug_id": "adrenaline", "indication_tag": "anaphylaxie_1ere_ligne"},
          {"drug_id": "noradrenaline", "indication_tag": "choc_refractaire"},
          {"drug_id": "dexamethasone", "indication_tag": "corticoide_anaphylaxie"},
          {"drug_id": "ephedrine", "indication_tag": "hypotension_moderee"},
          {"drug_id": "atropine", "indication_tag": "bradycardie_anaphylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Classification Ring & Messmer : Grade I (cutané) → II (modéré) → III (choc grave) → IV (arrêt cardiaque)",
          "Mécanisme : dégranulation mastocytaire/basophilique → histamine + tryptase + leukotriènes → vasoplégie + bronchospasme + œdème",
          "Allergènes perop les plus fréquents : curares (50–60%), antibiotiques (20%), chlorhexidine (10%), latex, produits de contraste",
          "Adrénaline : catécholamine de référence. α1 (vasoconstriction), β1 (inotrope+), β2 (bronchodilatation + inhibition dégranulation). Aucun substitut en 1ère ligne",
          "Tryptase : biomarqueur de dégranulation. Dosage urgence (< 2h) + H24 basal. Positif si ≥ 3× basal ou > 25 ng/mL",
          "Réaction biphasique (3–20%) : récidive 1–72h → surveillance obligatoire 24h si grade ≥ III"
        ],
        "pitfalls": [
          "Retarder l'adrénaline : chaque minute aggrave le pronostic — ne pas utiliser antihistaminiques seuls pour grade ≥ II",
          "Confondre avec choc vagal : signes cutanés absents dans 10–20% des anaphylaxies perop",
          "Allergie latex méconnue : demander prick tests si atopie ou chirurgie urologique/gynécologique répétée",
          "Oublier tryptase : impossible à confirmer a posteriori",
          "Récidive biphasique méconnue : insuffisance surveillance SSPI"
        ],
        "references": [
          {"source": "SFAR — Recommandations Formalisées Allergie Peropératoire", "year": 2023},
          {"source": "ESA/ESAIC — Guidelines on Perioperative Anaphylaxis", "year": 2021},
          {"source": "Ring J et al. — Guideline for acute therapy and management of anaphylaxis", "year": 2021}
        ]
      },
      "en": {
        "clinical": [
          "Ring & Messmer classification: Grade I (cutaneous) → II (moderate) → III (severe shock) → IV (cardiac arrest)",
          "Mechanism: mast cell/basophil degranulation → histamine + tryptase + leukotrienes → vasodilation + bronchospasm + edema",
          "Most common perioperative allergens: NMBAs (50–60%), antibiotics (20%), chlorhexidine (10%), latex, contrast",
          "Epinephrine: reference catecholamine. α1, β1, β2 effects. No substitute as first line",
          "Tryptase: urgent (< 2h) + H24 baseline. Positive if ≥ 3× baseline or > 25 ng/mL",
          "Biphasic reaction (3–20%): recurrence 1–72h → mandatory 24h monitoring if grade ≥ III"
        ],
        "pitfalls": [
          "Delaying epinephrine: each minute worsens prognosis",
          "Confusing with vasovagal syncope: cutaneous signs absent in 10–20%",
          "Unrecognized latex allergy",
          "Missing tryptase workup",
          "Missed biphasic reaction: insufficient PACU monitoring"
        ],
        "references": [
          {"source": "SFAR — Expert Consensus Guidelines: Perioperative Allergy", "year": 2023},
          {"source": "ESA/ESAIC — Guidelines on Perioperative Anaphylaxis", "year": 2021},
          {"source": "Ring J et al. — Guideline for anaphylaxis management", "year": 2021}
        ]
      },
      "pt": {
        "clinical": [
          "Classificação Ring & Messmer: Grau I (cutâneo) → II (moderado) → III (choque grave) → IV (paragem cardíaca)",
          "Mecanismo: desgranulação mastocitária/basofílica → histamina + triptase + leucotrienos",
          "Alergénios intraop mais frequentes: curares (50–60%), antibióticos (20%), clorexidina (10%), látex",
          "Adrenalina: catecolamina de referência. Nenhum substituto em 1ª linha",
          "Triptase: dosagem urgente + H24. Positivo se ≥ 3× basal ou > 25 ng/mL",
          "Reação bifásica (3–20%): vigilância 24h se grau ≥ III"
        ],
        "pitfalls": [
          "Atrasar a adrenalina",
          "Confundir com síncope vasovagal",
          "Alergia ao látex não reconhecida",
          "Esquecer a triptase",
          "Reação bifásica não reconhecida"
        ],
        "references": [
          {"source": "SFAR — Recommandations Allergie Peropératoire", "year": 2023},
          {"source": "ESA/ESAIC — Guidelines on Perioperative Anaphylaxis", "year": 2021}
        ]
      }
    }
  }$p4$::jsonb,
  '["allergy"]'::jsonb,
  false
)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- PROCEDURE 5 — Rachianesthésie (Anesthésie Spinale)
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'rachianesthesie',
  'orthopedie',
  '["orthopedie","gynecologie","urologie","obstetrique"]'::jsonb,
  '{"fr":"Rachianesthésie (Anesthésie Spinale)","en":"Spinal Anesthesia","pt":"Raquianestesia (Anestesia Espinhal)"}'::jsonb,
  '{"fr":["rachi","spinale","sous-arachnoïdien","SAB"],"en":["spinal","spinal block","subarachnoid block","SAB"],"pt":["raqui","espinhal","subaracnóideo"]}'::jsonb,
  $p5${
    "quick": {
      "fr": {
        "preop": [
          "Indications : chirurgie sous-ombilicale (membres inférieurs, bassin, abdomen sous-ombilical), urologie, obstétrique",
          "CI absolues : refus patient, coagulopathie majeure (TP < 40%, plaquettes < 80 000, INR > 1.5), anticoagulation thérapeutique non interrompue, infection au site de ponction, HTIC",
          "CI relatives : cardiopathie bas débit (RA serré, CMHO), hypovolémie non corrigée, scoliose sévère, sepsis sans antibiotiques",
          "Délais anticoagulants : HBPM prophylactique 12h, HBPM curative 24h, fondaparinux 36h, rivaroxaban/apixaban 24–48h, warfarine INR < 1.4"
        ],
        "intraop": [
          "Matériel : aiguille Whitacre ou Sprotte 25–27G (pencil point → ↓ CPPD) + seringue 2 mL luer-lock",
          "Position : assis ou DLG, flexion maximale du rachis lombaire",
          "Repères : ligne de Tuffier → L4, espace L3-L4 ou L4-L5. Abord médian ou paramédian",
          "Identification espace sous-arachnoïdien : reflux LCS clair (si sanguinolent : repositionner)",
          "Injection lente (30–60s) + aspiration intermédiaire pour confirmer position",
          "Bupivacaïne hyperbare 0.5% : 10 mg (bassin/membres) à 15 mg (abdomen/césarienne) ± sufentanil 5 µg intrathécal",
          "Morphine intrathécale 100–200 µg si analgésie prolongée (surveillance dépression respiratoire 12–24h OBLIGATOIRE)"
        ],
        "postop": [
          "Critères régression : Bromage 0, sensibilité périnéale, miction spontanée avant sortie SSPI",
          "CPPD : repos, hyperhydratation, caféine 300 mg PO — blood patch épidural si persistance > 24–48h",
          "Hématome périmédullaire : douleur dorsale intense + déficit moteur → IRM urgente + neurochirurgie"
        ],
        "red_flags": [
          "Hypotension (PAS < 80% de base ou < 90 mmHg) : éphédrine 6–12 mg IV ou phényléphrine 50–100 µg IV + remplissage",
          "Rachi totale accidentelle : apnée + paraplégie + hypotension → intubation urgente + vasopresseurs",
          "Bradycardie réflexe (Bezold-Jarisch) : atropine 0.5–1 mg IV ± adrénaline si BAV",
          "Syndrome queue-de-cheval : paresthésies persistantes post-régression → IRM urgente"
        ],
        "drugs": [
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthesie"},
          {"drug_id": "sufentanil", "indication_tag": "adjuvant_spinal"},
          {"drug_id": "morphine", "indication_tag": "morphine_intrathecale"},
          {"drug_id": "ephedrine", "indication_tag": "hypotension_rachianesthesie"},
          {"drug_id": "phenylephrine", "indication_tag": "hypotension_rachianesthesie"},
          {"drug_id": "atropine", "indication_tag": "bradycardie_rachianesthesie"}
        ]
      },
      "en": {
        "preop": [
          "Indications: infra-umbilical surgery (lower limbs, pelvis, infra-umbilical abdomen), urology, obstetrics",
          "Absolute CI: refusal, major coagulopathy (PT < 40%, platelets < 80,000, INR > 1.5), therapeutic anticoagulation not stopped, site infection, raised ICP",
          "Relative CI: low-output cardiac disease (severe AS, obstructive HCM), uncorrected hypovolemia, severe scoliosis, sepsis without antibiotics",
          "Anticoagulant intervals: prophylactic LMWH 12h, therapeutic LMWH 24h, fondaparinux 36h, rivaroxaban/apixaban 24–48h, warfarin INR < 1.4"
        ],
        "intraop": [
          "Equipment: 25–27G Whitacre or Sprotte needle (pencil-point → ↓ PDPH) + 2 mL luer-lock syringe",
          "Position: sitting or LLD, maximum lumbar flexion",
          "Landmarks: Tuffier line → L4, L3-L4 or L4-L5 space. Midline or paramedian approach",
          "Identify subarachnoid space: clear CSF backflow (if bloody: reposition)",
          "Slow injection (30–60s) + intermediate aspiration to confirm position",
          "Hyperbaric bupivacaine 0.5%: 10 mg (pelvis/limbs) to 15 mg (abdomen/cesarean) ± intrathecal sufentanil 5 µg",
          "Intrathecal morphine 100–200 µg (MANDATORY 12–24h respiratory depression monitoring)"
        ],
        "postop": [
          "Regression criteria: Bromage 0, perineal sensation, spontaneous voiding before PACU discharge",
          "PDPH: rest, hyperhydration, caffeine 300 mg PO — blood patch if > 24–48h",
          "Perispinal hematoma: severe back pain + motor deficit → urgent MRI + neurosurgery"
        ],
        "red_flags": [
          "Hypotension (SBP < 80% baseline or < 90 mmHg): ephedrine 6–12 mg IV or phenylephrine 50–100 µg IV + fluid",
          "Accidental total spinal: apnea + paraplegia + hypotension → urgent intubation + vasopressors",
          "Reflex bradycardia (Bezold-Jarisch): atropine 0.5–1 mg IV ± epinephrine if AV block",
          "Cauda equina syndrome: persistent paresthesias post-regression → urgent MRI"
        ],
        "drugs": [
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthesie"},
          {"drug_id": "sufentanil", "indication_tag": "adjuvant_spinal"},
          {"drug_id": "morphine", "indication_tag": "morphine_intrathecale"},
          {"drug_id": "ephedrine", "indication_tag": "hypotension_rachianesthesie"},
          {"drug_id": "phenylephrine", "indication_tag": "hypotension_rachianesthesie"},
          {"drug_id": "atropine", "indication_tag": "bradycardie_rachianesthesie"}
        ]
      },
      "pt": {
        "preop": [
          "Indicações: cirurgia infra-umbilical, urologia, obstetrícia",
          "CI absolutas: recusa, coagulopatia major (INR > 1.5, plaquetas < 80 000), anticoagulação terapêutica não suspensa, infeção local, HTIC",
          "CI relativas: cardiopatia baixo débito, hipovolemia não corrigida, escoliose grave, sépsis sem antibióticos",
          "Intervalos anticoagulantes: HBPM profilática 12h, terapêutica 24h, fondaparinux 36h, NOAC 24–48h, varfarina INR < 1.4"
        ],
        "intraop": [
          "Material: agulha Whitacre ou Sprotte 25–27G (ponta de lápis → ↓ CPPD) + seringa 2 mL luer-lock",
          "Posição: sentado ou DLE, flexão máxima lombar",
          "Referências: linha de Tuffier → L4, espaço L3-L4 ou L4-L5. Abordagem mediana ou paramediana",
          "Identificar espaço subaracnóideu: refluxo LCR límpido",
          "Injeção lenta (30–60s) + aspiração intermédia para confirmar posição",
          "Bupivacaína hiperbárica 0.5%: 10 mg (bacia/membros) a 15 mg (abdómen/cesariana) ± sufentanil 5 µg intratecal",
          "Morfina intratecal 100–200 µg (vigilância 12–24h OBRIGATÓRIA)"
        ],
        "postop": [
          "Critérios regressão: Bromage 0, sensibilidade perineal, micção espontânea",
          "CPPD: repouso, hiperhidratação, cafeína — blood patch se > 24–48h",
          "Hematoma periraquidiano: dor dorsal + défice motor → RM urgente"
        ],
        "red_flags": [
          "Hipotensão (PAS < 80% basal ou < 90 mmHg): efedrina 6–12 mg IV ou fenilefrina 50–100 µg IV",
          "Raqui total acidental: apneia + paraplegia → entubação urgente + vasopressores",
          "Bradicardia reflexa (Bezold-Jarisch): atropina 0.5–1 mg IV",
          "Síndrome cauda equina: parestesias persistentes → RM urgente"
        ],
        "drugs": [
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthesie"},
          {"drug_id": "sufentanil", "indication_tag": "adjuvant_spinal"},
          {"drug_id": "morphine", "indication_tag": "morphine_intrathecale"},
          {"drug_id": "ephedrine", "indication_tag": "hypotension_rachianesthesie"},
          {"drug_id": "phenylephrine", "indication_tag": "hypotension_rachianesthesie"},
          {"drug_id": "atropine", "indication_tag": "bradycardie_rachianesthesie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Physiopathologie du bloc : injection intrathécale → blocage Aδ (douleur aiguë), C (douleur chronique, température), B (sympathique), puis Aβ (tact), puis Aα (moteur)",
          "Niveau sensitif cible : T10 (ombilic) pour chirurgie abdominale inférieure ; T4–T6 pour césarienne ; L2–L3 pour chirurgie genou/pied",
          "Bupivacaïne hyperbare : densité > 1.020, distribution influencée par position et courbures rachidiennes. Standard de référence mondial",
          "Adjuvants intrathécaux : sufentanil 5 µg (↑ qualité + durée, prudence: prurit, dépression respiratoire) ; morphine 100–200 µg (analgésie 12–24h, surveillance obligatoire)",
          "CPPD : incidence 1–3% aiguilles pencil-point 25–27G. Facteurs de risque : âge jeune, sexe féminin, aiguille large",
          "Hypotension post-rachi : incidence 20–40% (70–80% en obstétrique). Prévention : co-charge cristalloïde + éphédrine ou phényléphrine préventives"
        ],
        "pitfalls": [
          "Injection trop rapide : migration céphalique → rachi haute (> T4 → détresse respiratoire)",
          "Trendelenburg après injection : favorise migration céphalique de la solution hyperbare",
          "Ponction traumatique avec sang : ne pas injecter — risque hématome si coagulopathie",
          "Morphine intrathécale sans surveillance : dépression respiratoire différée (4–12h) potentiellement létale",
          "Sous-estimer hypotension en obstétrique : fœtotoxique. Phényléphrine préférable à l'éphédrine (moins d'acidose fœtale)"
        ],
        "references": [
          {"source": "SFAR — Recommandations Rachianesthésie (Consensus Formalisé)", "year": 2017},
          {"source": "ESA/ESAIC — Regional Anaesthesia and Anticoagulation Guidelines", "year": 2021},
          {"source": "OAA/AAGBI — Regional Anaesthesia for Caesarean Section", "year": 2020},
          {"source": "Cochrane — Spinal vs general anaesthesia for caesarean section", "year": 2018}
        ]
      },
      "en": {
        "clinical": [
          "Block pathophysiology: intrathecal injection → blocks Aδ, C, B, then Aβ, then Aα",
          "Target sensory level: T10 (umbilicus) lower abdominal surgery; T4–T6 cesarean; L2–L3 knee/foot",
          "Hyperbaric bupivacaine: density > 1.020. World reference standard",
          "Intrathecal adjuvants: sufentanil 5 µg; morphine 100–200 µg (mandatory 12–24h monitoring)",
          "PDPH: 1–3% with 25–27G pencil-point needles",
          "Post-spinal hypotension: 20–40% (70–80% obstetrics). Prevention: co-loading + preventive ephedrine or phenylephrine"
        ],
        "pitfalls": [
          "Too rapid injection: cephalad migration → high spinal",
          "Trendelenburg after injection: promotes cephalad migration",
          "Traumatic puncture with blood: do not inject",
          "Intrathecal morphine without monitoring: delayed (4–12h) respiratory depression",
          "Underestimating hypotension in obstetrics: phenylephrine preferred over ephedrine"
        ],
        "references": [
          {"source": "SFAR — Spinal Anaesthesia Consensus Guidelines", "year": 2017},
          {"source": "ESA/ESAIC — Regional Anaesthesia and Anticoagulation Guidelines", "year": 2021},
          {"source": "OAA/AAGBI — Regional Anaesthesia for Caesarean Section", "year": 2020}
        ]
      },
      "pt": {
        "clinical": [
          "Fisiopatologia: bloqueio Aδ, C, B, depois Aβ, depois Aα",
          "Nível sensitivo alvo: T10 cirurgia abdominal inferior; T4–T6 cesariana; L2–L3 joelho/pé",
          "Bupivacaína hiperbárica: padrão mundial de referência",
          "Adjuvantes intratecais: sufentanil 5 µg; morfina 100–200 µg (vigilância 12–24h obrigatória)",
          "CPPD: 1–3% com agulhas ponta de lápis 25–27G",
          "Hipotensão pós-raqui: 20–40% (70–80% obstetrícia). Prevenção: co-carga + efedrina ou fenilefrina preventivas"
        ],
        "pitfalls": [
          "Injeção rápida: migração cefálica → raqui alta",
          "Trendelenburg após injeção: favorece migração cefálica",
          "Punção traumática com sangue: não injetar",
          "Morfina intratecal sem vigilância: depressão respiratória tardia (4–12h)",
          "Hipotensão em obstetrícia subestimada: fenilefrina preferível"
        ],
        "references": [
          {"source": "SFAR — Recommandations Rachianesthésie", "year": 2017},
          {"source": "ESA/ESAIC — Regional Anaesthesia and Anticoagulation Guidelines", "year": 2021},
          {"source": "OAA/AAGBI — Regional Anaesthesia for Caesarean Section", "year": 2020}
        ]
      }
    }
  }$p5$::jsonb,
  '["neuraxial","regional"]'::jsonb,
  false
)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- PROCEDURE 6 — Péridurale Obstétricale (Analgésie du Travail)
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'peridurale_obstetricale',
  'obstetrique',
  '["obstetrique"]'::jsonb,
  '{"fr":"Péridurale Obstétricale (Analgésie du Travail)","en":"Obstetric Epidural (Labour Analgesia)","pt":"Epidural Obstétrica (Analgesia do Trabalho de Parto)"}'::jsonb,
  '{"fr":["péridurale travail","APD","analgésie péridurale obstétricale","péri obstétricale"],"en":["epidural","labour analgesia","epidural labour","PCEA"],"pt":["epidural parto","analgesia do parto","APD","peridural obstétrica"]}'::jsonb,
  $p6${
    "quick": {
      "fr": {
        "preop": [
          "Indications : demande de la parturiente, travail actif (dilatation ≥ 3–4 cm recommandée mais non obligatoire), accouchement instrumental prévisible",
          "CI absolues : refus, plaquettes < 80 000/µL, coagulopathie (INR > 1.5), anticoagulation curative < 12–24h, infection site de ponction, HTIC",
          "CI relatives : fièvre maternelle inexpliquée, sepsis non traité, cardiopathie congénitale complexe",
          "Bilan : NFS + coagulation si héparine ou thrombopénie suspectée — pas obligatoire si parturiente saine",
          "Information : risques CPPD (1%), hypotension, fièvre épidurale, bloc moteur, toxicité AL"
        ],
        "intraop": [
          "Position : assis (préférée) ou DLG, flexion maximale rachis lombaire",
          "Repères : espace L3-L4 (ou L2-L3), abord médian ou paramédian",
          "Technique : perte de résistance (LOR) NaCl 0.9% ou air — aiguille Tuohy 16–18G",
          "Cathéter 3–5 cm en péridural — aspiration (pas sang ni LCS) → dose-test : lidocaïne 2% 3 mL + adrénaline 1:200 000",
          "Dose initiale : ropivacaïne 0.1% + sufentanil 0.5 µg/mL → 10–15 mL en bolus fractionné",
          "Entretien PCEA : ropivacaïne 0.1% + sufentanil 0.5 µg/mL, basal 5–8 mL/h, bolus 5 mL, réfractaire 20 min",
          "Monitoring : PNI q5 min × 20 min après chaque bolus, SpO2, mobilité membres inférieurs"
        ],
        "postop": [
          "Vérifier régression bloc moteur avant mobilisation",
          "Conversion CS urgente : ropivacaïne 0.5% 15–20 mL par cathéter (niveau T4 en 10–15 min)",
          "CPPD post-wet tap : blood patch épidural à J1–J2 si symptomatique"
        ],
        "red_flags": [
          "Hypotension (PAS < 90 mmHg) : DLG strict + NaCl 0.9% 500 mL + éphédrine 6–12 mg IV",
          "Injection IV accidentelle : convulsions ± arrêt → intralipides 20% 1.5 mL/kg IV + RCP",
          "Rachi totale accidentelle : apnée + hypotension sévère → intubation urgente + vasopresseurs",
          "Bloc moteur bilatéral complet : rachi totale ou hématome → IRM urgente"
        ],
        "drugs": [
          {"drug_id": "bupivacaine", "indication_tag": "peridurale_travail"},
          {"drug_id": "sufentanil", "indication_tag": "adjuvant_peridural"},
          {"drug_id": "lidocaine", "indication_tag": "dose_test_peridurale"},
          {"drug_id": "ephedrine", "indication_tag": "hypotension_peridurale"},
          {"drug_id": "phenylephrine", "indication_tag": "hypotension_peridurale"}
        ]
      },
      "en": {
        "preop": [
          "Indications: parturient request, active labour (≥ 3–4 cm recommended), anticipated instrumental delivery",
          "Absolute CI: refusal, platelets < 80,000, coagulopathy (INR > 1.5), therapeutic anticoagulation < 12–24h, site infection, raised ICP",
          "Relative CI: unexplained maternal fever, untreated sepsis, complex congenital heart disease",
          "Workup: CBC + coagulation if heparin or thrombocytopenia suspected",
          "Inform about: PDPH (1%), hypotension, epidural fever, motor block, LA toxicity"
        ],
        "intraop": [
          "Position: sitting (preferred) or LLD, maximum lumbar flexion",
          "Landmarks: L3-L4 space, midline or paramedian approach",
          "Technique: LOR to NaCl 0.9% or air — 16–18G Tuohy needle",
          "Catheter 3–5 cm — aspiration (no blood/CSF) → test dose: 2% lidocaine 3 mL + epinephrine 1:200,000",
          "Initial dose: ropivacaine 0.1% + sufentanil 0.5 µg/mL → 10–15 mL fractioned bolus",
          "PCEA maintenance: ropivacaine 0.1% + sufentanil 0.5 µg/mL, basal 5–8 mL/h, bolus 5 mL, lockout 20 min",
          "Monitoring: NIBP q5 min × 20 min after each bolus, SpO2, lower limb movement"
        ],
        "postop": [
          "Verify motor block regression before mobilization",
          "Emergency CS conversion: ropivacaine 0.5% 15–20 mL via catheter (T4 level in 10–15 min)",
          "PDPH after wet tap: epidural blood patch D1–D2 if symptomatic"
        ],
        "red_flags": [
          "Hypotension (SBP < 90 mmHg): strict LLD + NaCl 0.9% 500 mL + ephedrine 6–12 mg IV",
          "Accidental IV injection: seizures ± arrest → intralipid 20% 1.5 mL/kg + CPR",
          "Accidental total spinal: apnea + severe hypotension → urgent intubation + vasopressors",
          "Complete bilateral motor block: total spinal or hematoma → urgent MRI"
        ],
        "drugs": [
          {"drug_id": "bupivacaine", "indication_tag": "peridurale_travail"},
          {"drug_id": "sufentanil", "indication_tag": "adjuvant_peridural"},
          {"drug_id": "lidocaine", "indication_tag": "dose_test_peridurale"},
          {"drug_id": "ephedrine", "indication_tag": "hypotension_peridurale"},
          {"drug_id": "phenylephrine", "indication_tag": "hypotension_peridurale"}
        ]
      },
      "pt": {
        "preop": [
          "Indicações: pedido da parturiente, trabalho ativo (≥ 3–4 cm), parto instrumental previsível",
          "CI absolutas: recusa, plaquetas < 80 000, coagulopatia (INR > 1.5), anticoagulação terapêutica < 12–24h, infeção local, HTIC",
          "CI relativas: febre materna inexplicada, sépsis não tratada, cardiopatia congénita complexa",
          "Informar: CPPD (1%), hipotensão, febre, bloqueio motor, toxicidade AL"
        ],
        "intraop": [
          "Posição: sentada (preferida) ou DLE, flexão máxima lombar",
          "Referências: espaço L3-L4, abordagem mediana ou paramediana",
          "Técnica: perda de resistência — agulha Tuohy 16–18G",
          "Cateter 3–5 cm → aspiração (sem sangue/LCR) → dose-teste: lidocaína 2% 3 mL",
          "Dose inicial: ropivacaína 0.1% + sufentanil 0.5 µg/mL → 10–15 mL fracionado",
          "Manutenção PCEA: ropivacaína 0.1% + sufentanil 0.5 µg/mL, basal 5–8 mL/h, bolus 5 mL, refratário 20 min",
          "Monitorização: PNI q5 min × 20 min após cada bolus, SpO2, mobilidade MI"
        ],
        "postop": [
          "Verificar regressão bloqueio motor antes de mobilizar",
          "Conversão cesariana urgente: ropivacaína 0.5% 15–20 mL via cateter (nível T4 em 10–15 min)",
          "CPPD pós-wet tap: blood patch D1–D2 se sintomático"
        ],
        "red_flags": [
          "Hipotensão (PAS < 90 mmHg): DLE + NaCl 0.9% 500 mL + efedrina 6–12 mg IV",
          "Injeção IV acidental: convulsões ± paragem → intralipidos 20% 1.5 mL/kg + RCP",
          "Raqui total acidental: apneia + hipotensão → entubação urgente + vasopressores",
          "Bloqueio motor completo bilateral: → RM urgente"
        ],
        "drugs": [
          {"drug_id": "bupivacaine", "indication_tag": "peridurale_travail"},
          {"drug_id": "sufentanil", "indication_tag": "adjuvant_peridural"},
          {"drug_id": "lidocaine", "indication_tag": "dose_test_peridurale"},
          {"drug_id": "ephedrine", "indication_tag": "hypotension_peridurale"},
          {"drug_id": "phenylephrine", "indication_tag": "hypotension_peridurale"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Technique analgésique la plus efficace pour le travail (NNT = 1 vs 6–12 pour opioïdes systémiques). Réduction EVA de 7–8 à 0–2/10",
          "Ropivacaïne 0.1% ultra-diluée : bloc sensitif quasi-pur, mobilité préservée (walking epidural). Avantage vs bupivacaïne 0.25% (moins de bloc moteur)",
          "PCEA : moins d'AL total, meilleure satisfaction, moins d'interventions vs perfusion continue. Standard recommandé",
          "Fièvre liée à la péridurale : phénomène inflammatoire placentaire, non infectieux. Incidence 15–30% après > 4h. Difficile à distinguer d'une chorioamniotite",
          "Conversion péridurale → rachi pour CS urgente : montée de bloc rapide (10–15 min) avec ropivacaïne 0.5%"
        ],
        "pitfalls": [
          "Dose-test omise : risque injection IV (convulsions, ACR) ou intrathécale (rachi totale) non détectés",
          "LOR à l'air : risque embolie gazeuse et CPPD plus fréquente — NaCl 0.9% préféré dans certains centres",
          "Cathéter avancé > 5 cm : migration vasculaire ou bloc unilatéral",
          "Bloc moteur sous-estimé : risque chute à la déambulation",
          "CPPD post-wet tap avec Tuohy : incidence 50–70% — blood patch précoce recommandé"
        ],
        "references": [
          {"source": "SFAR/CNGOF — Recommandations Analgésie Obstétricale 2017", "year": 2017},
          {"source": "OAA/AAGBI — Guidelines Regional Anaesthesia in Obstetrics", "year": 2020},
          {"source": "Cochrane — Epidural vs non-epidural analgesia for labour pain", "year": 2018},
          {"source": "NICE — Intrapartum Care Guidelines", "year": 2023}
        ]
      },
      "en": {
        "clinical": [
          "Most effective analgesic technique for labour (NNT = 1 vs 6–12 for systemic opioids). VAS reduction from 7–8 to 0–2/10",
          "Ropivacaine 0.1% ultra-dilute: virtually pure sensory block, preserved mobility. Advantage over bupivacaine 0.25%",
          "PCEA: less total LA, better satisfaction, fewer nursing interventions. Recommended standard",
          "Epidural-related fever: inflammatory placental phenomenon, not infectious. 15–30% incidence after > 4h",
          "Epidural to spinal CS conversion: rapid block extension (10–15 min) with ropivacaine 0.5%"
        ],
        "pitfalls": [
          "Omitted test dose: undetected IV (seizures, arrest) or intrathecal injection (total spinal)",
          "LOR with air: air embolism risk and more frequent PDPH — NaCl 0.9% preferred in some centres",
          "Catheter advanced > 5 cm: vascular migration or unilateral block",
          "Underestimated motor block: fall risk during ambulation",
          "PDPH after wet tap with Tuohy: 50–70% incidence — early blood patch recommended"
        ],
        "references": [
          {"source": "SFAR/CNGOF — Obstetric Analgesia Recommendations 2017", "year": 2017},
          {"source": "OAA/AAGBI — Regional Anaesthesia in Obstetrics Guidelines", "year": 2020},
          {"source": "Cochrane — Epidural vs non-epidural analgesia for labour pain", "year": 2018},
          {"source": "NICE — Intrapartum Care Guidelines", "year": 2023}
        ]
      },
      "pt": {
        "clinical": [
          "Técnica analgésica mais eficaz para o trabalho de parto (NNT = 1 vs 6–12 opioides sistémicos)",
          "Ropivacaína 0.1% ultra-diluída: bloqueio sensitivo quase puro, mobilidade preservada",
          "PCEA: menos AL total, melhor satisfação. Padrão recomendado",
          "Febre associada à epidural: fenómeno inflamatório, não infecioso. 15–30% incidência após > 4h",
          "Conversão epidural → raqui CS urgente: extensão rápida (10–15 min)"
        ],
        "pitfalls": [
          "Dose-teste omitida: risco injeção IV ou intratecal não detetada",
          "LOR com ar: risco embolismo e CPPD mais frequente",
          "Cateter avançado > 5 cm: migração vascular ou bloqueio unilateral",
          "Bloqueio motor subestimado: risco de queda",
          "CPPD pós-wet tap com Tuohy: 50–70% incidência"
        ],
        "references": [
          {"source": "SFAR/CNGOF — Recomendações Analgesia Obstétrica 2017", "year": 2017},
          {"source": "OAA/AAGBI — Guidelines Regional Anaesthesia in Obstetrics", "year": 2020},
          {"source": "Cochrane — Epidural vs non-epidural analgesia for labour", "year": 2018}
        ]
      }
    }
  }$p6$::jsonb,
  '["neuraxial","ob"]'::jsonb,
  false
)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- PROCEDURE 7 — Anesthésie pour Césarienne
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'anesthesie_cesarienne',
  'obstetrique',
  '["obstetrique"]'::jsonb,
  '{"fr":"Anesthésie pour Césarienne","en":"Anaesthesia for Caesarean Section","pt":"Anestesia para Cesariana"}'::jsonb,
  '{"fr":["césarienne","CS","AG césarienne","rachianesthésie césarienne","LUCAS","urgence obstétricale"],"en":["caesarean","CS","spinal for CS","GA caesarean","emergency CS"],"pt":["cesariana","CS","raqui cesariana","AG cesariana"]}'::jsonb,
  $p7${
    "quick": {
      "fr": {
        "preop": [
          "Classification urgence (LUCAS modifiée) : Grade 1 (< 30 min, menace vitale mère/fœtus) → AG si rachi impossible ; Grade 2 (< 75 min) → rachianesthésie préférée ; Grades 3–4 (programmée)",
          "Rachianesthésie : technique de référence CS programmée et urgente grade 2–3 — évite les risques ISR + sécurité fœtale",
          "AG grade 1 ou échec/refus ALR : ISR obligatoire (estomac plein) — étomidate + succinylcholine ou rocuronium",
          "Préparer : bupivacaïne hyperbare 0.5% 10–12.5 mg + morphine intrathécale 100 µg ± sufentanil 2.5–5 µg",
          "Prophylaxie hypotension : phényléphrine IVSE 25–50 µg/min (standard OAA 2020)"
        ],
        "intraop": [
          "Rachianesthésie : DLG + préoxygénation + monitoring complet — niveau cible T4 (ligne mamelons)",
          "Inclinaison utérine gauche 15° (coin sous fesse droite) : prévient compression cave",
          "Hypotension post-rachi (PAS < 90 ou < 80% base) : phényléphrine 50–100 µg IV ou éphédrine 6–12 mg IV",
          "AG grade 1 : ISR étomidate 0.3 mg/kg + succinylcholine 1.5 mg/kg — vidéolaryngoscope en 1ère intention",
          "AG halogéné : sevoflurane < 1 MAC avant extraction (> 1 MAC = hypotonie utérine)",
          "Après extraction fœtale : morphine 0.1 mg/kg IV + ocytocine 5 UI IV LENT puis IVSE 10 UI/h",
          "Analgésie postop CS : morphine intrathécale 100 µg + paracétamol 1g IV q6h + kétorolac 15–30 mg IV × 2/j × 48h"
        ],
        "postop": [
          "Surveillance SSPI : SpO2, PNI, contractions utérines",
          "Morphine intrathécale : surveillance dépression respiratoire 12–24h (risque différé)",
          "Analgésie J1 : paracétamol 1g PO q6h + ibuprofène 400 mg PO q8h + kétorolac si résiduel",
          "Contact mère-enfant dès que sécurité maternelle assurée"
        ],
        "red_flags": [
          "Hypotension sévère + bradycardie fœtale : phényléphrine 100 µg IV + DLG strict + appeler obstétricien",
          "Syndrome de Mendelson (AG) : bronchospasme + désaturation → fibroscopie + ATB",
          "Hypotonie utérine post-partum : ocytocine 20–40 UI IVSE + sulprostone si persistance",
          "Bloc insuffisant pour CS : compléter par AL péridural (si cathéter) ou conversion AG"
        ],
        "drugs": [
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthesie_cesarienne"},
          {"drug_id": "morphine", "indication_tag": "morphine_intrathecale_cs"},
          {"drug_id": "sufentanil", "indication_tag": "adjuvant_spinal_cs"},
          {"drug_id": "phenylephrine", "indication_tag": "hypotension_ob"},
          {"drug_id": "ephedrine", "indication_tag": "hypotension_ob"},
          {"drug_id": "etomidate", "indication_tag": "induction_ag_cs"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation_ag_cs"},
          {"drug_id": "propofol", "indication_tag": "induction_ag_cs"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie_postop_cs"}
        ]
      },
      "en": {
        "preop": [
          "Urgency classification (modified LUCAS): Grade 1 (< 30 min, maternal/fetal life threat) → GA if spinal not possible; Grade 2 (< 75 min) → spinal preferred; Grades 3–4 (elective)",
          "Spinal: reference technique for elective and urgent CS grade 2–3",
          "GA grade 1 or regional failure/refusal: mandatory RSI (full stomach) — etomidate + succinylcholine or rocuronium",
          "Prepare: hyperbaric bupivacaine 0.5% 10–12.5 mg + intrathecal morphine 100 µg ± sufentanil 2.5–5 µg",
          "Hypotension prevention: phenylephrine infusion 25–50 µg/min (OAA 2020 standard)"
        ],
        "intraop": [
          "Spinal: LLD + pre-oxygenation + complete monitoring — target level T4",
          "Left uterine tilt 15°: prevents aortocaval compression",
          "Post-spinal hypotension (SBP < 90 or < 80% baseline): phenylephrine 50–100 µg IV or ephedrine 6–12 mg IV",
          "GA grade 1: RSI etomidate 0.3 mg/kg + succinylcholine 1.5 mg/kg — video laryngoscope first line",
          "GA volatile: sevoflurane < 1 MAC before delivery (> 1 MAC = uterine atony)",
          "After fetal delivery: morphine 0.1 mg/kg IV + oxytocin 5 IU slow IV then infusion 10 IU/h",
          "Postop CS analgesia: intrathecal morphine 100 µg + paracetamol 1g IV q6h + ketorolac 15–30 mg IV × 2/day × 48h"
        ],
        "postop": [
          "PACU monitoring: SpO2, NIBP, uterine contractions",
          "Intrathecal morphine: 12–24h respiratory depression monitoring (delayed risk)",
          "Day 1 analgesia: paracetamol 1g PO q6h + ibuprofen 400 mg q8h + ketorolac if residual",
          "Mother-infant bonding when maternal safety assured"
        ],
        "red_flags": [
          "Severe hypotension + fetal bradycardia: phenylephrine 100 µg IV + strict LLD + call obstetrician",
          "Mendelson syndrome (GA): bronchospasm + desaturation → bronchoscopy + antibiotics",
          "Postpartum uterine atony: oxytocin 20–40 IU infusion + sulprostone if persisting",
          "Insufficient block for CS: supplement epidural LA (if catheter) or convert to GA"
        ],
        "drugs": [
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthesie_cesarienne"},
          {"drug_id": "morphine", "indication_tag": "morphine_intrathecale_cs"},
          {"drug_id": "sufentanil", "indication_tag": "adjuvant_spinal_cs"},
          {"drug_id": "phenylephrine", "indication_tag": "hypotension_ob"},
          {"drug_id": "ephedrine", "indication_tag": "hypotension_ob"},
          {"drug_id": "etomidate", "indication_tag": "induction_ag_cs"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation_ag_cs"},
          {"drug_id": "propofol", "indication_tag": "induction_ag_cs"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie_postop_cs"}
        ]
      },
      "pt": {
        "preop": [
          "Classificação urgência (LUCAS modificado): Grau 1 (< 30 min, ameaça vital) → AG se raqui impossível; Grau 2 (< 75 min) → raqui preferida; Graus 3–4 (eletiva)",
          "Raqui: técnica de referência para CS eletiva e urgente grau 2–3",
          "AG grau 1 ou falha/recusa ALR: ISR obrigatória (estômago cheio)",
          "Preparar: bupivacaína hiperbárica 0.5% 10–12.5 mg + morfina intratecal 100 µg ± sufentanil 2.5–5 µg",
          "Prevenção hipotensão: fenilefrina IVSE 25–50 µg/min (padrão OAA 2020)"
        ],
        "intraop": [
          "Raqui: DLE + pré-oxigenação + monitorização completa — nível alvo T4",
          "Inclinação uterina esquerda 15°: previne compressão cava",
          "Hipotensão pós-raqui: fenilefrina 50–100 µg IV ou efedrina 6–12 mg IV",
          "AG grau 1: ISR etomidato 0.3 mg/kg + succinilcolina 1.5 mg/kg",
          "AG volátil: sevoflurano < 1 MAC antes da extração",
          "Após extração fetal: morfina 0.1 mg/kg IV + ocitocina 5 UI IV lento → IVSE 10 UI/h",
          "Analgesia pós-op CS: morfina intratecal 100 µg + paracetamol 1g IV q6h + cetorolac"
        ],
        "postop": [
          "Vigilância UCPA: SpO2, PNI, contrações uterinas",
          "Morfina intratecal: vigilância 12–24h depressão respiratória",
          "Analgesia D1: paracetamol 1g PO q6h + ibuprofeno 400 mg q8h",
          "Contacto mãe-bebé quando segurança materna assegurada"
        ],
        "red_flags": [
          "Hipotensão grave + bradicardia fetal: fenilefrina 100 µg IV + DLE + chamar obstetra",
          "Síndrome de Mendelson (AG): broncoespasmo + dessaturação → fibroscopia + antibióticos",
          "Atonia uterina pós-parto: ocitocina 20–40 UI IVSE + sulprostona se persistente",
          "Bloqueio insuficiente para CS: complementar AL peridural ou converter para AG"
        ],
        "drugs": [
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthesie_cesarienne"},
          {"drug_id": "morphine", "indication_tag": "morphine_intrathecale_cs"},
          {"drug_id": "sufentanil", "indication_tag": "adjuvant_spinal_cs"},
          {"drug_id": "phenylephrine", "indication_tag": "hypotension_ob"},
          {"drug_id": "ephedrine", "indication_tag": "hypotension_ob"},
          {"drug_id": "etomidate", "indication_tag": "induction_ag_cs"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation_ag_cs"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie_postop_cs"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Classification LUCAS modifiée : Grade 1 = menace vitale immédiate (30 min) ; Grade 2 = atteinte materno-fœtale non immédiatement vitale (75 min) ; Grades 3–4 = programmée",
          "Rachianesthésie CS : T4 en 10–15 min. Bupivacaïne hyperbare 0.5% 10–12.5 mg. Morphine intrathécale 100 µg = analgésie postop 18–24h (réduction morphine systémique 60–70%)",
          "Phényléphrine IVSE préventive : supérieure à l'éphédrine en obstétrique (meilleur pH fœtal, moins d'acidose). Standard OAA 2020",
          "AG CS : ISR obligatoire. Étomidate si stable vs kétamine 1–1.5 mg/kg si choc hémorragique. Sevoflurane < 1 MAC avant naissance",
          "Ocytocine : bolus rapide → vasodilatation → hypotension. Utiliser 5 UI IV lent puis IVSE 10 UI/h"
        ],
        "pitfalls": [
          "Niveau T4 non testé avant incision : bloc incomplet → douleur perop",
          "Inclinaison utérine oubliée : compression cave → hypotension fœtotoxique",
          "AG CS et Mendelson : toujours traiter comme estomac plein",
          "Morphine intrathécale sans surveillance 12–24h : dépression respiratoire différée",
          "Bolus ocytocine rapide > 5 UI : hypotension + modifications ST (CI en cardiopathie)"
        ],
        "references": [
          {"source": "OAA/AAGBI — Regional Anaesthesia for Caesarean Section", "year": 2020},
          {"source": "SFAR/CNGOF — Recommandations Anesthésie Obstétricale 2017", "year": 2017},
          {"source": "LUCAS Classification for CS Urgency", "year": 2000},
          {"source": "Cochrane — Spinal vs general anaesthesia for caesarean section", "year": 2018}
        ]
      },
      "en": {
        "clinical": [
          "Modified LUCAS: Grade 1 = immediate threat (30 min); Grade 2 = non-immediately life-threatening (75 min); Grades 3–4 = elective",
          "Spinal for CS: T4 in 10–15 min. Hyperbaric bupivacaine 0.5% 10–12.5 mg. Intrathecal morphine 100 µg = 18–24h analgesia (60–70% systemic morphine reduction)",
          "Preventive phenylephrine infusion: superior to ephedrine in obstetrics (better fetal pH). OAA 2020 standard",
          "GA for CS: mandatory RSI. Etomidate if stable vs ketamine 1–1.5 mg/kg if hemorrhagic shock. Sevoflurane < 1 MAC before delivery",
          "Oxytocin: rapid bolus → vasodilation → hypotension. Use 5 IU slow IV then infusion 10 IU/h"
        ],
        "pitfalls": [
          "T4 level not tested before incision: incomplete block → intraoperative pain",
          "Forgotten uterine tilt: caval compression → fetotoxic hypotension",
          "GA for CS: always treat as full stomach",
          "Intrathecal morphine without 12–24h monitoring: delayed respiratory depression",
          "Rapid oxytocin bolus > 5 IU: hypotension + ST changes (contraindicated in cardiac disease)"
        ],
        "references": [
          {"source": "OAA/AAGBI — Regional Anaesthesia for Caesarean Section", "year": 2020},
          {"source": "SFAR/CNGOF — Obstetric Anaesthesia Recommendations 2017", "year": 2017},
          {"source": "Cochrane — Spinal vs general anaesthesia for caesarean section", "year": 2018}
        ]
      },
      "pt": {
        "clinical": [
          "LUCAS modificado: Grau 1 = ameaça vital imediata (30 min); Grau 2 = sem ameaça vital imediata (75 min); Graus 3–4 = eletiva",
          "Raqui para CS: T4 em 10–15 min. Morfina intratecal 100 µg = analgesia 18–24h",
          "Fenilefrina IVSE preventiva: superior à efedrina em obstetrícia. Padrão OAA 2020",
          "AG para CS: ISR obrigatória. Etomidato vs cetamina se choque hemorrágico. Sevoflurano < 1 MAC",
          "Ocitocina: bolus rápido → hipotensão. Usar 5 UI IV lento → IVSE 10 UI/h"
        ],
        "pitfalls": [
          "Nível T4 não testado antes da incisão: bloqueio incompleto → dor intraoperatória",
          "Inclinação uterina esquecida: compressão cava → hipotensão fetotóxica",
          "AG para CS: sempre tratar como estômago cheio",
          "Morfina intratecal sem vigilância 12–24h: depressão respiratória tardia",
          "Bolus ocitocina rápido > 5 UI: hipotensão + alterações ST"
        ],
        "references": [
          {"source": "OAA/AAGBI — Regional Anaesthesia for Caesarean Section", "year": 2020},
          {"source": "SFAR/CNGOF — Recomendações Anestesia Obstétrica 2017", "year": 2017},
          {"source": "Cochrane — Spinal vs general anaesthesia for caesarean section", "year": 2018}
        ]
      }
    }
  }$p7$::jsonb,
  '["neuraxial","ob"]'::jsonb,
  false
)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- PROCEDURE 8 — Anesthésie pour Arthroplastie Totale Hanche/Genou (PTH/PTG)
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'arthroplastie_pth_ptg',
  'orthopedie',
  '["orthopedie"]'::jsonb,
  '{"fr":"Anesthésie pour Arthroplastie Totale Hanche/Genou (PTH/PTG)","en":"Anaesthesia for Total Hip/Knee Arthroplasty (THA/TKA)","pt":"Anestesia para Artroplastia Total Anca/Joelho (PTH/PTJ)"}'::jsonb,
  '{"fr":["PTH","PTG","prothèse totale hanche","prothèse totale genou","arthroplastie","RAAC orthopédie"],"en":["THA","TKA","total hip replacement","total knee replacement","ERAS ortho"],"pt":["PTH","PTJ","prótese total anca","prótese total joelho","artroplastia"]}'::jsonb,
  $p8${
    "quick": {
      "fr": {
        "preop": [
          "Population : sujet âgé (> 65 ans), comorbidités fréquentes (HTA, diabète, cardiopathie, anticoagulants)",
          "Bilan préop : NFS, TP/TCA/INR, créatinine, ECG ± ETT si cardiopathie connue ou dyspnée non explorée",
          "Gestion anticoagulants : AVK (INR cible < 1.5), NOAC (rivaroxaban/apixaban 48–72h, dabigatran 72–96h selon DFG), HBPM si pont",
          "Antibioprophylaxie : céfazoline 2g IV (3g si > 120 kg) à l'induction (30 min avant incision). Allergie péni : clindamycine 600 mg IV",
          "Anémie préop : traiter si Hb < 10 g/dL (fer IV, EPO). Cible Hb ≥ 11 g/dL",
          "Acide tranexamique : 1g IV 10 min avant incision + 1g IV à H3 (↓ transfusion 30–50%, Grade A SFAR)"
        ],
        "intraop": [
          "Rachianesthésie : technique de référence PTH/PTG (↓ transfusion, TVP, mortalité 30j vs AG)",
          "Rachi PTH : bupivacaïne hyperbare 0.5% 12–15 mg (niveau T10) ± morphine intrathécale 100–150 µg",
          "Rachi PTG : bupivacaïne hyperbare 0.5% 10–12 mg (niveau T12–L1) ± morphine intrathécale 100 µg",
          "AG si CI à rachi : propofol + rémifentanil TIVA ou halogéné — gestion hémodynamique rigoureuse chez sujet âgé",
          "ATX perop : 1g IV si pas donné en préop",
          "Infiltration locale (LIA) : ropivacaïne 0.3% 150 mL multisite par chirurgien ± kétorolac + adrénaline",
          "Garrot PTG : pression = PAS + 100 mmHg, durée < 90 min — dégonfler progressivement"
        ],
        "postop": [
          "RAAC/ERAS : lever J0-J1, kiné dès SSPI, sortie J2-J3",
          "Analgésie ERAS : paracétamol 1g q6h + ibuprofène 400 mg q8h (si DFG ≥ 30) + PCA morphine si résiduel",
          "Prévention TVP : HBPM à partir de H12 (énoxaparine 4000 UI SC) ou rivaroxaban 10 mg J0 soir, durée 5 semaines PTH / 2 semaines PTG",
          "Surveillance : douleur, mobilité, signes TVP, Hb à H6-H12 si saignement"
        ],
        "red_flags": [
          "Embolie graisseuse (PTH/fracture fémorale) : désaturation + confusion + pétéchies → O2 haut débit, réanimation",
          "Embolie pulmonaire perop : hypotension + désaturation + tachycardie → POCUS cardio, anticoagulation, thrombolyse si instable",
          "BCIS (bone cement implantation syndrome) : chute PAS > 25% à l'insertion ciment → vasopresseurs, remplissage, adrénaline si ACR",
          "Hématome plaie expansif : revascularisation + nerf en danger → reprise chirurgicale urgente"
        ],
        "drugs": [
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthesie_arthroplastie"},
          {"drug_id": "morphine", "indication_tag": "morphine_intrathecale_orthoped"},
          {"drug_id": "acide_tranexamique", "indication_tag": "prevention_hemorragie_arthroplastie"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie_orthoped"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie_postop_orthoped"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesie_ains_postop"},
          {"drug_id": "enoxaparine", "indication_tag": "prevention_tvp"},
          {"drug_id": "propofol", "indication_tag": "induction_ag"},
          {"drug_id": "remifentanil", "indication_tag": "opioid_tiva"}
        ]
      },
      "en": {
        "preop": [
          "Population: elderly (> 65 years), frequent comorbidities (hypertension, diabetes, cardiac disease, anticoagulants)",
          "Preop workup: CBC, PT/aPTT/INR, creatinine, ECG ± TTE if known cardiac disease",
          "Anticoagulant management: VKA (target INR < 1.5), DOAC (rivaroxaban/apixaban 48–72h, dabigatran 72–96h by GFR), LMWH bridge if needed",
          "Antibiotic prophylaxis: cefazolin 2g IV (3g if > 120 kg) at induction. Penicillin allergy: clindamycin 600 mg IV",
          "Preoperative anemia: treat if Hb < 10 g/dL. Target Hb ≥ 11 g/dL",
          "Tranexamic acid: 1g IV 10 min before incision + 1g IV at H3 (30–50% transfusion reduction, Grade A)"
        ],
        "intraop": [
          "Spinal: reference technique THA/TKA (↓ transfusion, DVT, 30-day mortality vs GA)",
          "Spinal THA: hyperbaric bupivacaine 0.5% 12–15 mg (T10 level) ± intrathecal morphine 100–150 µg",
          "Spinal TKA: hyperbaric bupivacaine 0.5% 10–12 mg (T12–L1 level) ± intrathecal morphine 100 µg",
          "GA if spinal CI: propofol + remifentanil TIVA or volatile — rigorous hemodynamic management in elderly",
          "TXA intraop: 1g IV if not given preoperatively",
          "LIA: ropivacaine 0.3% 150 mL multisite by surgeon ± ketorolac + epinephrine",
          "TKA tourniquet: SBP + 100 mmHg, < 90 min — deflate progressively"
        ],
        "postop": [
          "ERAS: mobilization D0-D1, physiotherapy from PACU, discharge D2-D3",
          "ERAS analgesia: paracetamol 1g q6h + ibuprofen 400 mg q8h (if GFR ≥ 30) + PCA if residual pain",
          "DVT prevention: LMWH from H12 (enoxaparin 4000 IU SC) or rivaroxaban 10 mg D0 evening, 5 weeks THA / 2 weeks TKA",
          "Monitoring: pain, mobility, DVT signs, Hb at H6-H12 if significant bleeding"
        ],
        "red_flags": [
          "Fat embolism (THA/femoral fracture): desaturation + confusion + petechiae → high-flow O2, ICU",
          "Intraoperative PE: hypotension + desaturation + tachycardia → cardiac POCUS, anticoagulation, thrombolysis if unstable",
          "BCIS (bone cement implantation syndrome): SBP drop > 25% at cement insertion → vasopressors, fluids, epinephrine if arrest",
          "Expanding wound hematoma: vascular/nerve compromise → urgent surgical revision"
        ],
        "drugs": [
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthesie_arthroplastie"},
          {"drug_id": "morphine", "indication_tag": "morphine_intrathecale_orthoped"},
          {"drug_id": "acide_tranexamique", "indication_tag": "prevention_hemorragie_arthroplastie"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie_orthoped"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie_postop_orthoped"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesie_ains_postop"},
          {"drug_id": "enoxaparine", "indication_tag": "prevention_tvp"},
          {"drug_id": "propofol", "indication_tag": "induction_ag"},
          {"drug_id": "remifentanil", "indication_tag": "opioid_tiva"}
        ]
      },
      "pt": {
        "preop": [
          "População: idoso (> 65 anos), comorbilidades (HTA, diabetes, cardiopatia, anticoagulantes)",
          "Exames pré-op: hemograma, TP/TCA/INR, creatinina, ECG ± ETT se cardiopatia",
          "Gestão anticoagulantes: AVK (INR < 1.5), NOAC (rivaroxabano/apixabano 48–72h), HBPM ponte se necessário",
          "Profilaxia antibiótica: cefazolina 2g IV (3g se > 120 kg). Alergia penicilina: clindamicina 600 mg IV",
          "Anemia pré-op: tratar se Hb < 10 g/dL. Alvo Hb ≥ 11 g/dL",
          "Ácido tranexâmico: 1g IV 10 min antes + 1g IV às H3 (redução transfusão 30–50%, Grau A)"
        ],
        "intraop": [
          "Raqui: técnica de referência PTH/PTJ (↓ transfusão, TVP, mortalidade 30d vs AG)",
          "Raqui PTH: bupivacaína hiperbárica 0.5% 12–15 mg (nível T10) ± morfina intratecal 100–150 µg",
          "Raqui PTJ: bupivacaína hiperbárica 0.5% 10–12 mg (nível T12–L1) ± morfina intratecal 100 µg",
          "AG se CI à raqui: propofol + remifentanil TIVA ou volátil",
          "ATX intraop: 1g IV se não dado no pré-op",
          "LIA: ropivacaína 0.3% 150 mL multisite pelo cirurgião",
          "Garrote PTJ: PAS + 100 mmHg, < 90 min"
        ],
        "postop": [
          "ERAS/RAAC: mobilização D0-D1, fisioterapia desde UCPA, alta D2-D3",
          "Analgesia ERAS: paracetamol 1g q6h + ibuprofeno 400 mg q8h (se DFG ≥ 30) + PCA se residual",
          "Prevenção TVP: HBPM a partir H12 (enoxaparina 4000 UI SC) ou rivaroxabano 10 mg D0 noite, 5 semanas PTH / 2 semanas PTJ",
          "Vigilância: dor, mobilidade, sinais TVP, Hb às H6-H12"
        ],
        "red_flags": [
          "Embolia gordurosa: dessaturação + confusão + petéquias → O2 alto débito, UCI",
          "EP intraop: hipotensão + dessaturação → POCUS, anticoagulação, trombólise se instável",
          "BCIS: queda PAS > 25% na inserção cimento → vasopressores, adrenalina se PCR",
          "Hematoma expansivo: compressão vascular/nervosa → revisão cirúrgica urgente"
        ],
        "drugs": [
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthesie_arthroplastie"},
          {"drug_id": "morphine", "indication_tag": "morphine_intrathecale_orthoped"},
          {"drug_id": "acide_tranexamique", "indication_tag": "prevention_hemorragie_arthroplastie"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie_orthoped"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie_postop_orthoped"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesie_ains_postop"},
          {"drug_id": "enoxaparine", "indication_tag": "prevention_tvp"},
          {"drug_id": "propofol", "indication_tag": "induction_ag"},
          {"drug_id": "remifentanil", "indication_tag": "opioid_tiva"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Rachianesthésie vs AG pour PTH/PTG : méta-analyses → réduction transfusions (-40%), TVP (-30%), mortalité 30j (-20%), pneumopathies, durée séjour. SFAR Grade A recommande rachianesthésie en 1ère intention",
          "Acide tranexamique : inhibiteur fibrinolyse (liaison plasminogène). ↓ pertes sanguines 30–50%, transfusion 30–40%. Aucun risque thrombo-embolique supplémentaire aux doses recommandées",
          "LIA (infiltration locale) : technique multisite chirurgicale avec ropivacaïne ± AINS ± adrénaline → analgésie 8–16h, idéal en complément de la rachianesthésie sans morphine intrathécale",
          "BCIS : embolie graisseuse/aérienne massive lors de la pressurisation ciment → hypotension + hypoxie + trouble de conscience. Facteurs risque : canal non aspiré, hypovolémie",
          "ERAS orthopédie : protocole multimodal → ↓ durée séjour 2–3j, moins de complications"
        ],
        "pitfalls": [
          "Oublier ATX : saignement augmenté inutilement — sûr et efficace même en risque CV modéré",
          "Rachi avec morphine intrathécale sans protocole surveillance : dépression respiratoire nocturne",
          "Garrot > 90 min : rhabdomyolyse, lésion nerveuse, risque thrombotique",
          "Anémie préop non corrigée : transfusion perop inévitable",
          "NOAC non arrêté assez tôt : risque hématome périmédullaire (vérifier intervalle selon DFG)"
        ],
        "references": [
          {"source": "SFAR — Recommandations RAAC Orthopédie (PTH/PTG)", "year": 2020},
          {"source": "Cochrane — Neuraxial vs general anaesthesia for THA/TKA", "year": 2019},
          {"source": "Cochrane — Tranexamic acid for THA/TKA", "year": 2021},
          {"source": "ESA/ESAIC — Regional Anaesthesia and Anticoagulation Guidelines", "year": 2021}
        ]
      },
      "en": {
        "clinical": [
          "Spinal vs GA for THA/TKA: meta-analyses → 40% transfusion reduction, 30% DVT reduction, 20% 30-day mortality reduction. SFAR Grade A recommends spinal as first choice",
          "Tranexamic acid: fibrinolysis inhibitor. 30–50% blood loss reduction, 30–40% transfusion reduction. No increased thromboembolic risk at recommended doses",
          "LIA: multisite surgical technique with ropivacaine ± NSAID ± epinephrine → 8–16h analgesia",
          "BCIS: massive fat/air embolism at cement pressurization → hypotension + hypoxia + altered consciousness",
          "ERAS orthopaedics: multimodal protocol → 2–3 day LOS reduction"
        ],
        "pitfalls": [
          "Omitting TXA: unnecessary bleeding — safe and effective even with moderate CV risk",
          "Spinal with intrathecal morphine without monitoring protocol: nocturnal respiratory depression",
          "Tourniquet > 90 min: rhabdomyolysis, nerve injury, thrombotic risk",
          "Uncorrected preoperative anemia: inevitable intraoperative transfusion",
          "DOAC not stopped early enough: perispinal hematoma risk"
        ],
        "references": [
          {"source": "SFAR — ERAS Guidelines for Orthopaedics (THA/TKA)", "year": 2020},
          {"source": "Cochrane — Neuraxial vs general anaesthesia for THA/TKA", "year": 2019},
          {"source": "Cochrane — Tranexamic acid for THA/TKA", "year": 2021},
          {"source": "ESA/ESAIC — Regional Anaesthesia and Anticoagulation Guidelines", "year": 2021}
        ]
      },
      "pt": {
        "clinical": [
          "Raqui vs AG para PTH/PTJ: meta-análises → redução 40% transfusões, 30% TVP, 20% mortalidade 30d. Grau A SFAR: raqui em 1ª linha",
          "Ácido tranexâmico: inibidor fibrinólise. Redução 30–50% perdas sanguíneas. Sem risco tromboembólico adicional às doses recomendadas",
          "LIA: técnica multisite com ropivacaína ± AINE ± adrenalina → analgesia 8–16h",
          "BCIS: embolia gordurosa/gasosa maciça na pressurização do cimento → hipotensão + hipóxia",
          "ERAS ortopedia: protocolo multimodal → redução 2–3 dias na demora média"
        ],
        "pitfalls": [
          "Esquecer ATX: hemorragia aumentada desnecessariamente",
          "Raqui com morfina intratecal sem protocolo de vigilância: depressão respiratória noturna",
          "Garrote > 90 min: rabdomiólise, lesão nervosa",
          "Anemia pré-op não corrigida: transfusão inevitável",
          "NOAC não suspenso com antecedência suficiente: risco hematoma periraquidiano"
        ],
        "references": [
          {"source": "SFAR — Recomendações RAAC Ortopedia (PTH/PTJ)", "year": 2020},
          {"source": "Cochrane — Neuraxial vs general anaesthesia for THA/TKA", "year": 2019},
          {"source": "Cochrane — Tranexamic acid for THA/TKA", "year": 2021},
          {"source": "ESA/ESAIC — Regional Anaesthesia and Anticoagulation Guidelines", "year": 2021}
        ]
      }
    }
  }$p8$::jsonb,
  '["neuraxial","anticoag"]'::jsonb,
  false
)
ON CONFLICT (id) DO NOTHING;
