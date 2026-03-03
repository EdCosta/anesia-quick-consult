-- Migration: Secteur 2 – Supplément digestif / gynéco / uro / obstétrique (12 procédures)
-- CHU Saint-Pierre PGs 2025-2026
-- Complète le fichier 20260303170000 avec les procédures manquantes

BEGIN;

-- 1. appendicectomie_adulte
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'appendicectomie_adulte',
  'gastroenterologie',
  '["gastroenterologie"]'::jsonb,
  '{"fr":"Appendicectomie de l''adulte","en":"Adult appendectomy","pt":"Apendicectomia do adulto"}'::jsonb,
  '{"fr":["appendicite aiguë","appendicectomie laparoscopique","appendicite"],"en":["appendectomy","laparoscopic appendectomy","appendicitis"],"pt":["apendicectomia","apendicite aguda"]}'::jsonb,
  $s2app${
    "quick": {
      "fr": {
        "preop": [
          "Jeûne 6h solides / 2h liquides clairs — si péritonite : considérer estomac plein",
          "Voie veineuse périphérique, bilan standard (NFS, CRP, BHCG femme en âge de procréer)",
          "Antibioprophylaxie : céfazoline 2g IV 30 min avant incision ± métronidazole si suspicion perforation",
          "Évaluation score Alvarado / Appendicitis Inflammatory Response (AIR) — imagerie (écho ± TDM) si doute diagnostique",
          "RSI si péritonite diffuse, vomissements récents, suspicion estomac plein : fentanyl 2 µg/kg + propofol 2 mg/kg + rocuronium 1 mg/kg"
        ],
        "intraop": [
          "Induction standard si jeûne confirmé et absence de signe de péritonite : propofol 2 mg/kg + fentanyl 1–2 µg/kg, masque laryngé ou IOT",
          "RSI si estomac plein ou péritonite : propofol 2 mg/kg + rocuronium 1,2 mg/kg + pression cricoïde optionnelle",
          "Laparoscopie : Trendelenburg 15° + rotation latérale gauche, curarisation profonde recommandée pour exposition",
          "Insufflation CO2 12–15 mmHg, ventilation mode pression-contrôlée adaptée",
          "Analgésie multimodale peropératoire : paracétamol 1g IV + kétorolac 30 mg IV en fin d'intervention",
          "Infiltration sites de trocarts par chirurgien : bupivacaïne 0,25 % 5 mL par site",
          "Sugammadex 2 mg/kg pour décurarisation si rocuronium utilisé"
        ],
        "postop": [
          "Surveillance 30–60 min en SSPI — analgésie EVA < 3 avant sortie",
          "Analgésie : paracétamol 1g/6h + ibuprofène 400 mg/8h per os ± tramadol si EVA > 4",
          "Anticoagulation si durée > 30 min ou facteurs de risque : énoxaparine 40 mg SC à H+6",
          "Sortie possible J0 si appendicite simple laparoscopique et critères ERAS remplis",
          "Reprise alimentation rapide (ERAS) : boissons dès SSPI, repas léger à domicile le soir",
          "Consignes retour J0 : fièvre > 38,5°C, douleur majorée, vomissements → urgences"
        ],
        "red_flags": [
          "Péritonite diffuse peropératoire : conversion laparotomie, réanimation septique, antibiothérapie adaptée",
          "Sepsis sévère postopératoire : hémocultures, antibiothérapie large spectre, transfert réanimation si défaillance",
          "Abcès appendiculaire non drainé : fièvre persistante J3–5, douleur localisée — TDM et drainage radiologique",
          "Saignement mésentérique post-op : tachycardie, hémopéritoine — reprise chirurgicale",
          "Occlusion sur bride précoce : douleurs, arrêt des matières et gaz post-op"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation_rsi"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_intraop"},
          {"drug_id": "sugammadex", "indication_tag": "decurarisation"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ketorolac", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "bupivacaine", "indication_tag": "infiltration_trocarts"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesia_postop"},
          {"drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "RSI indiqué si : durée douleur > 8h (vidange gastrique ralentie), vomissements, péritonite — même si jeûne respecté",
          "Curarisation profonde pour laparoscopie digestive : facilite exposition, réduit pression d'insufflation, améliore confort chirurgical",
          "Infiltration trocarts systématique : réduction consommation morphinique post-opératoire de 30–40 %",
          "ERAS appendicectomie : réhydratation IV limitée, reprise alimentaire précoce, analgésie multimodale, sortie J0 si non compliqué"
        ],
        "pitfalls": [
          "Ne pas omettre la vérification BHCG chez la femme en âge de procréer — grossesse ectopique peut mimer appendicite",
          "Appendicite rétrocæcale : exposition difficile — curarisation profonde indispensable, prévoir conversion",
          "Métronidazole si perforation ou péritonite — couverture anaérobies insuffisante avec céfazoline seule",
          "Kétorolac contre-indiqué si créatinine > 150 µmol/L ou antécédent ulcère — évaluation individuelle"
        ],
        "references": [
          "[Complément – Source: SFAR/SNFGE, Recommandations ERAS chirurgie digestive, 2023]",
          "[Complément – Source: WSES, World Society of Emergency Surgery guidelines appendicitis, 2020]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 2, 2025-2026]"
        ]
      }
    }
  }$s2app$::jsonb,
  '["regional"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 2. hernie_paroi_abdominale
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'hernie_paroi_abdominale',
  'gastroenterologie',
  '["gastroenterologie"]'::jsonb,
  '{"fr":"Hernie de la paroi abdominale","en":"Abdominal wall hernia repair","pt":"Hérnia da parede abdominal"}'::jsonb,
  '{"fr":["hernie inguinale","hernie ombilicale","éventration","hernie de l''aine","TAPP","TEP","Lichtenstein"],"en":["inguinal hernia","umbilical hernia","incisional hernia","laparoscopic hernia","Lichtenstein"],"pt":["hérnia inguinal","hérnia umbilical","eventração"]}'::jsonb,
  $s2hernie${
    "quick": {
      "fr": {
        "preop": [
          "Évaluer type de hernie : inguinale (TEP/TAPP laparoscopique ou Lichtenstein ouvert), ombilicale, éventration",
          "Ambulatoire possible pour hernie simple (ASA I–II) — hernies compliquées ou étranglées : urgence, RSI",
          "Antibioprophylaxie : céfazoline 2g IV si pose de prothèse (hernie inguinale ou éventration)",
          "Bilan standard si > 45 ans ou comorbidités significatives",
          "Discuter technique avec chirurgien : laparoscopique TAPP/TEP = curarisation profonde obligatoire"
        ],
        "intraop": [
          "Hernie laparoscopique (TEP/TAPP) : AG intubation ou masque laryngé, curarisation profonde (TOF 0) pour pneumopéritoine 12 mmHg",
          "Lichtenstein (abord ouvert) : rachianesthésie basse ou AG masque laryngé courte durée, ± infiltration locale par chirurgien",
          "Hernie ombilicale ou éventration simple : AG masque laryngé ou rachianesthésie selon taille et durée",
          "Infiltration locale par chirurgien (bupivacaïne 0,25 % ± adrénaline) : réduction douleur postopératoire",
          "Analgésie multimodale : paracétamol 1g IV + kétorolac 30 mg IV en fin d'intervention",
          "Durée variable : 30–45 min (hernie simple) à 120 min+ (éventration complexe)"
        ],
        "postop": [
          "Ambulatoire le jour même pour hernie simple : critères Aldrete remplis, analgésie satisfaisante, miction",
          "Analgésie : paracétamol 1g/6h + ibuprofène 400 mg/8h per os — tramadol si EVA > 4",
          "Reprise d'activité légère J2–J3 pour hernie simple, J10–J14 pour éventration",
          "Éviter efforts de soulèvement > 5 kg pendant 4 semaines",
          "Thromboprophylaxie : énoxaparine uniquement si éventration large ou facteurs de risque (ISA > 30, chirurgie > 60 min)"
        ],
        "red_flags": [
          "Hernie étranglée (urgence) : intestin ischémique — RSI obligatoire (estomac plein), résection intestinale possible",
          "Hématome de bourse ou inguinal post-op : compression locale, antalgie, surveillance — reprise si expansif",
          "Douleur inguinale intense post-op > 48h : hématome, lésion nerveuse (NGF, NO, GNG) — évaluation spécialisée",
          "Infection de prothèse : fièvre, écoulement, sepsis — ablation prothèse dans les cas graves"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation_profonde_laparoscopique"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_intraop"},
          {"drug_id": "sugammadex", "indication_tag": "decurarisation"},
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthesie_ou_infiltration_locale"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie_si_prothese"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ketorolac", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesia_postop"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "TEP (totalement extra-péritonéale) : espace prépéritonéal créé à la CO2, curarisation profonde indispensable (pression 8–10 mmHg insuffisante si relâchement insuffisant)",
          "Lichtenstein : anesthésie locale + sédation possible pour patients sélectionnés — lidocaïne + bupivacaïne infiltration",
          "Hernie inguinale laparoscopique : bloc transverse abdominale (TAP) ou iliohypogastrique pas nécessaire si infiltration chirurgicale en fin d'acte",
          "Éventration : évaluation préop ASA + obésité + BPCO — morbi-mortalité plus élevée que hernie simple"
        ],
        "pitfalls": [
          "Curarisation profonde indispensable pour TEP — profondeur TOF insuffisante = champ opératoire effondré",
          "Emphysème sous-cutané possible lors de TEP : surveiller ETCO2 et SpO2 — bénin mais perturbant",
          "Antécédent de chirurgie inguinale ou pelvienne : adhérences — conversion possible, prévenir patient",
          "Ne pas utiliser sugammadex > 16 mg/kg sans vérification fonctionnalité rénale"
        ],
        "references": [
          "[Complément – Source: EHS, European Hernia Society guidelines, 2018]",
          "[Complément – Source: SFAR, Anesthésie ambulatoire — procédures digestives, 2022]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 2, 2025-2026]"
        ]
      }
    }
  }$s2hernie$::jsonb,
  '["regional"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 3. fundoplicature_nissen
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'fundoplicature_nissen',
  'gastroenterologie',
  '["gastroenterologie"]'::jsonb,
  '{"fr":"Fundoplicature de Nissen / Chirurgie anti-reflux","en":"Nissen fundoplication / Anti-reflux surgery","pt":"Fundoplicatura de Nissen / Cirurgia anti-refluxo"}'::jsonb,
  '{"fr":["fundoplicature","chirurgie anti-reflux","Nissen","Toupet","RGO chirurgical","herniorraphie hiatale"],"en":["Nissen fundoplication","anti-reflux surgery","GERD surgery","hiatal hernia repair"],"pt":["fundoplicatura de Nissen","cirurgia anti-refluxo","hérnia de hiato"]}'::jsonb,
  $s2nissen${
    "quick": {
      "fr": {
        "preop": [
          "RGO documenté (pH-métrie, endoscopie) — évaluer hernie hiatale associée sur imagerie",
          "Risque de régurgitation et estomac plein en dépit du jeûne : IPP continuez jusqu'au matin, métoclopramide 10 mg per os si disponible",
          "RSI systématique recommandé : induction propofol 2 mg/kg + rocuronium 1,2 mg/kg (kétamine 1 mg/kg alternative si hémodynamique précaire)",
          "Intubation oro-trachéale obligatoire — masque laryngé inadapté (risque régurgitation + position anti-Trendelenburg)",
          "Jeûne 6h solides / 2h liquides clairs — respecter strictement malgré médication habituellement prise"
        ],
        "intraop": [
          "RSI : propofol 2 mg/kg + rocuronium 1,2 mg/kg, intubation confirmée par capnographie",
          "Position anti-Trendelenburg 30° (tête haute) et jambes en position française (chirurgie sus-mésocolique)",
          "Curarisation profonde (TOF 0) pour exposition hiatus diaphragmatique — relâchement indispensable",
          "Ventilation en pression contrôlée adaptée au pneumopéritoine (CO2 12–15 mmHg) et à la position",
          "Décompression gastrique par sonde gastrique oro-trachéale après intubation — facilite exposition et réduit volume gastrique",
          "Analgésie peropératoire : paracétamol 1g IV + kétorolac 30 mg + fentanyl titration",
          "PONV prophylaxie : ondansétron 4 mg + dexaméthasone 8 mg IV en per-opératoire",
          "Sugammadex 2 mg/kg pour décurarisation avant extubation"
        ],
        "postop": [
          "Extubation vigilante : ne pas laisser patient tousser ou se contracter (ne pas régurgiter post-Nissen)",
          "PONV prophylaxie efficace critique — nausées post-op très inconfortables après fundoplicature",
          "Régime : liquides clairs J0, liquides épais J1, semi-solide J3–J7 — dysphagie transitoire fréquente et attendue",
          "Analgésie : paracétamol 1g/6h + ibuprofène + tramadol si EVA > 4",
          "Hospitalisation 1–2 nuits — sortie si tolérance orale correcte et analgésie satisfaisante",
          "Dysphagie persistante au-delà de 4–6 semaines : consultation chirurgicale urgente (dilatation ou révision)"
        ],
        "red_flags": [
          "Perforation oesophagienne ou gastrique peropératoire : emphysème médiastinal, douleur thoracique — urgence chirurgicale",
          "Vagotomie accidentelle : atonie gastrique post-opératoire, plénitude précoce persistante",
          "Dysphagie sévère immédiate (< J7) : fundoplicature trop serrée — gastroscopie et dilatation précoce",
          "PONV réfractaire : vomissements répétés après fundoplicature = risque de déchirure du montage — antiémétiques IV urgents",
          "Rupture ou migration du montage : douleur thoracique brutale, dysphagie soudaine — TDM thoraco-abdominal urgent"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "rsi_induction"},
          {"drug_id": "rocuronium", "indication_tag": "rsi_curarisation"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_intraop"},
          {"drug_id": "sugammadex", "indication_tag": "decurarisation"},
          {"drug_id": "ondansetron", "indication_tag": "ponv_prophylaxie"},
          {"drug_id": "dexamethasone", "indication_tag": "ponv_et_antiinflammatoire"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ketorolac", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesia_postop"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "RSI obligatoire : RGO sévère = vidange gastrique ralentie, acide gastrique abondant — risque aspiration pulmonaire même à jeun",
          "Anti-Trendelenburg strict : réduit pression sur hiatus, facilite exposition, diminue régurgitation perop",
          "Curarisation profonde : hiatus diaphragmatique difficile d'accès sans relâchement musculaire complet",
          "Fundoplicature de Nissen totale (360°) vs Toupet partielle (270°) : Nissen = moins de récidive mais plus de dysphagie",
          "Dysphagie transitoire post-Nissen normale : oedème local J0–J14 — rassurer patient, régime progressif"
        ],
        "pitfalls": [
          "Masque laryngé absolument contre-indiqué : RGO sévère + anti-Trendelenburg = risque aspiration majeur",
          "PONV post-fundoplicature : catastrophique — vomissements peuvent déchirer le montage; double prophylaxie systématique",
          "Sonde gastrique : aide le chirurgien à calibrer la fundoplicature — ne jamais retirer avant fermeture chirurgicale",
          "Extubation : toujours awake, Tête haute 45° — ne pas laisser tousser en profondeur"
        ],
        "references": [
          "[Complément – Source: SAGES, Guidelines for surgical treatment of GERD, 2021]",
          "[Complément – Source: SFAR, Anesthésie chirurgie digestive laparoscopique, 2023]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 2, 2025-2026]"
        ]
      }
    }
  }$s2nissen$::jsonb,
  '["airway","ponv"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 4. gastrectomie
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'gastrectomie',
  'gastroenterologie',
  '["gastroenterologie"]'::jsonb,
  '{"fr":"Gastrectomie oncologique (totale / partielle)","en":"Oncological gastrectomy (total / partial)","pt":"Gastrectomia oncológica (total / parcial)"}'::jsonb,
  '{"fr":["gastrectomie totale","gastrectomie partielle","cancer de l''estomac","gastrectomie pour néoplasme gastrique","D2 lymphadénectomie"],"en":["total gastrectomy","partial gastrectomy","gastric cancer surgery","D2 gastrectomy"],"pt":["gastrectomia total","gastrectomia parcial","cancro gástrico"]}'::jsonb,
  $s2gastro${
    "quick": {
      "fr": {
        "preop": [
          "Bilan nutritionnel préopératoire : albumine, poids, IMC — dénutrition fréquente dans cancer gastrique",
          "Préhabilitation si possible (8–4 semaines) : nutrition orale/entérale enrichie, exercice physique adapté, arrêt tabac",
          "Correction anémie préopératoire : fer IV ou transfusion si Hb < 8 g/dL",
          "Antibioprophylaxie : céfazoline 2g IV 30 min avant incision + répétition H+8 si durée > 3h",
          "Boissons glucidiques la veille et 2h avant intervention (ERAS) — sauf si gastroparésie documentée",
          "Groupe-RAI, consentement anesthésie-chirurgie, voie centrale discutée selon ASA"
        ],
        "intraop": [
          "AG + epidural thoracique T7–T8 combinés (ERAS) : bupivacaïne 0,1 % + sufentanil peropératoire, puis analgésie épidurale postopératoire",
          "Induction : propofol 2 mg/kg + fentanyl 1–2 µg/kg ou sufentanil 0,2 µg/kg, intubation oro-trachéale",
          "Goal-directed fluid therapy (GDFT) : limiter apport liquidien IV, monitorage débit cardiaque (débit index, variation pulsée pression)",
          "Contrôle glycémique peropératoire (ERAS) : cible 7,8–11,0 mmol/L, insuline titrée si dépassement",
          "Curarisation profonde — relâchement musculaire indispensable pour anastomose oeso-jéjunale ou gastro-jéjunale",
          "Maintien normothermie : couverture chauffante, liquides réchauffés, T° > 36°C",
          "Durée 3–5h : surveillance rapprochée des paramètres hémodynamiques"
        ],
        "postop": [
          "Extubation salle réveil si ERAS — analgésie épidurale débutée en SSPI",
          "Analgésie épidurale thoracique J0–J3 : bupivacaïne 0,1 % + sufentanil 0,5 µg/mL, débit 4–8 mL/h",
          "Reprise alimentation entérale précoce : sonde jejunale (si posée) ou voie orale liquides clairs J0",
          "Mobilisation : lever J0 avec aide soignante, kinésithérapie respiratoire précoce",
          "Thromboprophylaxie : énoxaparine 40 mg SC à H+6 post-opératoire",
          "Surveillance : glycémie, drain, débit anastomotique, température — sortie ERAS J5–J7 si pas de complication"
        ],
        "red_flags": [
          "Fistule anastomotique (J5–J7) : fièvre, douleur abdominale, tachycardie, modification drain — TDM abdominal urgent, reprise chirurgicale possible",
          "Hémorragie postopératoire intraluminale : hématémèse, méléna — fibroscopie ou reprise chirurgicale",
          "Retard de vidange gastrique : distension abdominale, vomissements — prolongement sonde gastrique, prométhazine",
          "Sepsis postopératoire (pneumonie, infection de paroi) : hémocultures, antibiothérapie, transfert réanimation si défaillance",
          "Anémie profonde post-gastrectomie : surveillance Hb J1–J3, transfusion si Hb < 7 g/dL ou symptômes"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_intraop"},
          {"drug_id": "sufentanil", "indication_tag": "epidural_analgesia"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation"},
          {"drug_id": "sugammadex", "indication_tag": "decurarisation"},
          {"drug_id": "bupivacaine", "indication_tag": "epidural_thoracique"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie"},
          {"drug_id": "dexamethasone", "indication_tag": "ponv_et_antiinflammatoire"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Epidural thoracique T7–T8 (ERAS) : analgésie peropératoire + postopératoire — réduit consommation morphinique, améliore récupération pulmonaire et digestive",
          "GDFT (Goal-Directed Fluid Therapy) : index de variation de volume d'éjection (SVV) ou pléthysmographie — cible SVV < 13 % ou PLR positif",
          "Préhabilitation oncologique : améliore réserves physiologiques avant chirurgie majeure — nutrition, exercice, psychologie (programme PACIENTE ou OPERA)",
          "Lymphadénectomie D2 standard en Europe : risque pancréatite et fistule pancréatique si pancréatectomie partielle associée — surveillance amylase drain"
        ],
        "pitfalls": [
          "Gastrectomie totale : section oesophagienne — sonde nasogastrique positionnée par chirurgien (ne pas mettre en aveugle)",
          "Epidural thoracique haut : risque hypotension et bloc moteur intercostal — titration progressive, vasopresseurs disponibles",
          "Paracétamol : dose réduite si insuffisance hépatique sur métastases hépatiques — 500 mg/6h ou éviter",
          "Glycémie peropératoire : hyperglycémie de stress fréquente — insulinothérapie titration IV, cible 7,8–11 mmol/L"
        ],
        "references": [
          "[Complément – Source: ERAS Society, Enhanced Recovery After Gastric Surgery Guidelines, 2023]",
          "[Complément – Source: SFAR, Anesthésie pour chirurgie oncologique digestive, 2022]",
          "[Complément – Source: ESMO, Gastric cancer clinical guidelines, 2022]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 2, 2025-2026]"
        ]
      }
    }
  }$s2gastro$::jsonb,
  '["anticoag","regional"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 5. resection_hepatique
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'resection_hepatique',
  'gastroenterologie',
  '["gastroenterologie"]'::jsonb,
  '{"fr":"Résection hépatique / Hépatectomie","en":"Hepatic resection / Liver surgery","pt":"Ressecção hepática / Cirurgia hepática"}'::jsonb,
  '{"fr":["hépatectomie","lobectomie hépatique","résection du foie","hépatectomie droite/gauche","résection métastases hépatiques"],"en":["hepatectomy","liver resection","hepatic surgery","liver lobectomy"],"pt":["hepatectomia","ressecção hepática","lobectomia hepática"]}'::jsonb,
  $s2hep${
    "quick": {
      "fr": {
        "preop": [
          "Bilan hépatique complet : Child-Pugh, MELD si cirrhose, volumétrie hépatique (futur volume résiduel > 30 %)",
          "Correction anémie préopératoire, arrêt anticoagulants/anti-agrégants selon délai chirurgical",
          "Groupe-RAI, cell saver planifié, correction coagulopathie si TP < 60 % ou plaquettes < 80 G/L",
          "Antibioprophylaxie : céfazoline 2g IV 30 min avant incision",
          "Consentement pour transfusion, cell saver, epidural thoracique ou cathéter paravertébral"
        ],
        "intraop": [
          "AG + epidural thoracique T7–T8 ou cathéter paravertébral pour analgésie postopératoire",
          "Accès vasculaire : 2 VVP 16G + VVC + voie artérielle radiale (monitoring continu PA, prélèvements)",
          "Technique de basse pression cave (PVC < 5 cmH2O) pendant transection parenchymateuse : restriction liquidienne IV ± furosémide 20 mg — réduit saignement lors de section du parenchyme",
          "Cell saver activé dès incision — autotransfusion peropératoire si pertes > 500 mL",
          "Manœuvre de Pringle (clampage pédicule hépatique) : informer l'anesthésiste avant serrage — ischémie hépatique maximale 60–90 min en foie sain",
          "Paracétamol : limiter si insuffisance hépatique préexistante (Child B/C) — 500 mg/6h maximum",
          "Pas d'AINS peropératoires (risque hépatotoxicité + insuffisance rénale post-résection)"
        ],
        "postop": [
          "Surveillance USI J0–J1 : INR J1–J3, bilirubine J1–J3–J5, ammoniémie si Child B/C",
          "Critère 50–50 J5 : bilirubine > 50 µmol/L et Quick < 50 % = signe insuffisance hépatique post-résection",
          "Analgésie : cathéter epidural ou paravertébral J0–J3, transition paracétamol + opioids faibles per os",
          "Reprise alimentation entérale précoce J0–J1 (ERAS)",
          "Thromboprophylaxie : énoxaparine selon décision chirurgicale (hémostase vs risque TVP)",
          "Surveillance drains biliaires : bilirubine drain J3 > 3x bilirubine sérique = fistule biliaire"
        ],
        "red_flags": [
          "Saignement massif peropératoire : PLT < 50, coagulopathie — TXA 1g, PFC, concentrés plaquettaires, chirurgie hémostatique",
          "Insuffisance hépatique post-résection (critère 50–50) : mesures conservatrices, transfert hépatologie, transplantation en urgence dans cas extrêmes",
          "Embolie gazeuse par voie cave : hypotension brutale, tachycardie, saturation chute — décubitus latéral gauche, aspiration VVC, O2 100 %",
          "Fistule biliaire post-opératoire : bile en quantité dans le drain, bilirubine drain élevée — ERCP ou reprise chirurgicale"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction_tiva"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_intraop"},
          {"drug_id": "sufentanil", "indication_tag": "epidural_analgesia"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation"},
          {"drug_id": "sugammadex", "indication_tag": "decurarisation"},
          {"drug_id": "bupivacaine", "indication_tag": "epidural_ou_paravertebral"},
          {"drug_id": "acide_tranexamique", "indication_tag": "hemostase_si_saignement_massif"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_dose_reduite_si_IH"},
          {"drug_id": "morphine", "indication_tag": "analgesia_sauvetage"},
          {"drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Technique basse PVC : diminuer apport liquidien + furosémide pour PVC < 5 cmH2O — réduit saignement lors section veineuses sus-hépatiques de 30–50 %",
          "Manœuvre de Pringle intermittente : clampage pédicule hépatique 15 min ON / 5 min OFF — préserve mieux le foie que clampage continu",
          "Cell saver post-hépatectomie oncologique : débat oncologique (risque diffusion cellules tumorales) — usage accepté pour métastases hépatiques colorectales selon centre",
          "Critère 50–50 à J5 (Balzan 2005) : bilirubine > 50 µmol/L ET Quick < 50 % — mortalité associée 59 %, indication de soins intensifs"
        ],
        "pitfalls": [
          "Ne pas redonner de liquides IV en réflexe sur hypotension modérée pendant transection — PVC basse est intentionnelle",
          "Embolie gazeuse veineuse : risque lors de blessure cave — avertir chirurgien, décubitus gauche, aspiration VVC",
          "Pringle prolongé > 90 min foie sain ou > 60 min foie cirrhotique : risque nécrose hépatique — relâchement impératif",
          "Insuffisance rénale post-hépatectomie : fréquente si PVC trop basse prolongée — rééquilibrage liquidien en postopératoire progressif"
        ],
        "references": [
          "[Complément – Source: IHPBA, International Guidelines Liver Surgery, 2022]",
          "[Complément – Source: Balzan SM, 50-50 criteria post-hepatectomy liver failure, Ann Surg, 2005]",
          "[Complément – Source: ERAS Society, Enhanced Recovery Hepatic Surgery, 2023]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 2, 2025-2026]"
        ]
      }
    }
  }$s2hep$::jsonb,
  '["anticoag","icu"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 6. proctologie_hemorroidectomie
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'proctologie_hemorroidectomie',
  'gastroenterologie',
  '["gastroenterologie"]'::jsonb,
  '{"fr":"Proctologie – Hémorroïdectomie / Milligan-Morgan","en":"Proctology – Haemorrhoidectomy / Milligan-Morgan","pt":"Proctologia – Hemorroidectomia / Milligan-Morgan"}'::jsonb,
  '{"fr":["hémorroïdectomie","chirurgie hémorroïdaire","Milligan-Morgan","THD","ligature hémorroïdes","fistulotomie anale"],"en":["hemorrhoidectomy","haemorrhoid surgery","anorectal surgery","anal fistula"],"pt":["hemorroidectomia","cirurgia hemorróidal","fistulotomia anal"]}'::jsonb,
  $s2procto${
    "quick": {
      "fr": {
        "preop": [
          "Procédure ambulatoire sauf contre-indication — préparation colorectale non systématique (lavement optionnel selon chirurgien)",
          "Antibioprophylaxie non systématique pour hémorroïdectomie simple — céfazoline si fistule complexe ou risque infectieux",
          "Évaluer position chirurgicale souhaitée : génu-pectoral (Jackknife) ou lithotomie — impact sur rachianesthésie",
          "Jeûne standard 6h/2h — ambulatoire J0 si rachianesthésie",
          "Informer patient douleur postopératoire importante : analgésie multimodale préventive dès la prémédication"
        ],
        "intraop": [
          "Rachianesthésie en selle préférentielle : bupivacaïne hyperbare 0,5 % 7,5 mg en position assise 15–20 min — bloc S2–S4 suffisant",
          "AG masque laryngé si rachianesthésie refusée ou contre-indiquée : propofol + fentanyl, durée 20–40 min",
          "Kétamine faible dose 0,3–0,5 mg/kg IV : analgésie préventive, réduit allodynie et douleur postopératoire à 24h",
          "Position : génu-pectoral (Jackknife) — surveiller risque embolie gazeuse et pression abdominale",
          "Infiltration locale par chirurgien : bupivacaïne 0,25 % + adrénaline dilué (1:200 000) — hémostase et analgésie",
          "Paracétamol 1g IV + kétorolac 30 mg IV en peropératoire"
        ],
        "postop": [
          "Douleur postopératoire importante : anticipée — paracétamol 1g/6h + ibuprofène 400 mg/8h + tramadol systématique (pas à la demande)",
          "Laxatifs osmotiques : lactulose 10–20 mL x2/j dès J0 — prévenir rétention et constipation (douleur à la défécation)",
          "Bains de siège tièdes 15–20 min 3x/j : réduction oedème et douleur",
          "Rétention urinaire : fréquente après rachianesthésie en selle (S3) — vérifier miction avant sortie, sondage si rétention > 6h",
          "Ambulatoire le jour même si rachianesthésie sans rétention urinaire et analgésie orale efficace",
          "Hémorragie secondaire J7–J10 : fréquente (5–10 %) — consignes patients, reprise consultation si saignement > 1h"
        ],
        "red_flags": [
          "Hémorragie secondaire J7–J10 : saignement abondant per-anal — compression locale, consultation urgente, coagulation au bloc",
          "Rétention urinaire post-rachianesthésie en selle : sondage urinaire si absence de miction > 6h post-bloc",
          "Sepsis périanal (rare) : fistule, abcès post-hémorroïdectomie — drainage chirurgical urgent",
          "Sténose anale post-chirurgicale (moyen terme) : constipation sévère, douleur défécation — dilatations progressives"
        ],
        "drugs": [
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthesie_en_selle_ou_infiltration"},
          {"drug_id": "propofol", "indication_tag": "induction_si_AG"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_intraop"},
          {"drug_id": "ketamine", "indication_tag": "analgesia_preventive_faible_dose"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ketorolac", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesia_postop"},
          {"drug_id": "morphine", "indication_tag": "analgesia_sauvetage_si_EVA_rebelle"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Rachianesthésie en selle (saddle block) : position assise 15–20 min avec bupivacaïne hyperbare — diffusion caudale (S2–S4) sans bloc lombaire haut",
          "Kétamine faible dose (0,3 mg/kg) : effet analgésique préventif sur allodynie périnéale — réduit EVA à 24h sans effets dissociatifs",
          "Génu-pectoral (Jackknife) : tête et genoux en bas, bassin surélevé — vérifier padding genoux et tête, éviter compression cervicale",
          "Rétention urinaire post-bloc en selle : fréquente (S3 = parasympathique vésical) — patient doit uriner avant sortie"
        ],
        "pitfalls": [
          "Position Jackknife sous rachianesthésie : changement de position après installation du bloc — vérifier niveau avant de coucher patient",
          "Antibioprophylaxie systématique non recommandée pour hémorroïdectomie simple — utilisation abusive d'antibiotiques",
          "Kétorolac : efficace mais contre-indiqué si antécédent gastroduodénal ou IRC — évaluation individuelle",
          "Traitement antidouleur postop : jamais à la demande — douleur rectale intense prévisible — planifier schéma fixe"
        ],
        "references": [
          "[Complément – Source: ASCRS, American Society Colon and Rectal Surgeons, guidelines hemorrhoids, 2020]",
          "[Complément – Source: SFAR, Anesthésie locorégionale périnéale, 2022]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 2, 2025-2026]"
        ]
      }
    }
  }$s2procto$::jsonb,
  '["neuraxial","regional"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 7. hysteroscopie_operative
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'hysteroscopie_operative',
  'gynecologie',
  '["gynecologie"]'::jsonb,
  '{"fr":"Hystéroscopie opératoire","en":"Operative hysteroscopy","pt":"Histeroscopia operatória"}'::jsonb,
  '{"fr":["hystéroscopie","résection intra-utérine","myomectomie hystéroscopique","polypectomie utérine","synéchiolyse","résection cloison utérine"],"en":["operative hysteroscopy","hysteroscopic myomectomy","uterine resection","polypectomy"],"pt":["histeroscopia operatória","miomectomia histeroscópica","polipectomia uterina"]}'::jsonb,
  $s2hystero${
    "quick": {
      "fr": {
        "preop": [
          "Évaluer type de procédure : myomectomie, polypectomie, synéchiolyse, résection cloison — durée et milieu de distension",
          "Milieu distension : glycocolle 1,5 % (résecteur monopolaire) ou NaCl 0,9 % (résecteur bipolaire) — impact sur surveillance entrées/sorties",
          "Procédure ambulatoire pour la plupart — voie IV 18G, monitoring standard",
          "Antibioprophylaxie non systématique sauf facteurs de risque infectieux",
          "Informer patient : durée 20–60 min, ambulatoire, reprise activité J+1–J+2"
        ],
        "intraop": [
          "AG masque laryngé : propofol 2 mg/kg + fentanyl 1 µg/kg, ventilation spontanée ou contrôlée selon durée",
          "Rachianesthésie basse alternative : bupivacaïne hyperbare 7,5 mg si préférence ou contre-indication AG",
          "Position lithotomie — vérifier protection talons et rotule (pression prolongée)",
          "Surveillance STRICTE du bilan entrées/sorties milieu de distension toutes les 15–20 min",
          "Tolérance glycocolle (monopolaire) : absorption ≤ 1 000 mL — INTERROMPRE si > 1 L absorbé",
          "Tolérance NaCl (bipolaire) : absorption ≤ 2 500 mL — moindre risque TURP syndrome",
          "Paracétamol 1g IV + kétorolac 30 mg IV en per-opératoire"
        ],
        "postop": [
          "Surveillance 1–2h en SSPI : sodium plasmatique si > 750 mL milieu absorbé (glycocolle)",
          "Douleurs abdominales type crampes normales : paracétamol ± ibuprofène per os",
          "Ambulatoire le jour même si procédure courte et analgésie orale efficace",
          "Saignement post-opératoire : spotting normal jusqu'à J+14 — saignement abondant = consultation",
          "Reprise activité légère J+1, pas de rapports sexuels ni tampons pendant 3 semaines"
        ],
        "red_flags": [
          "TURP syndrome (glycocolle > 1 L absorbé) : hyponatrémie (Na < 125 mmol/L), confusion, céphalées, vision floue — arrêt immédiat, furosémide 40 mg, sérum salé hypertonique si Na < 120",
          "Perforation utérine : douleur abdominale soudaine, perte de résistance lors de l'hystéroscope — arrêt, évaluation laparoscopique si lésion viscérale suspectée",
          "Embolie gazeuse : si milieu CO2 ou entrée d'air — hypotension brutale, désaturation, bruit de moulin au coeur — procédure arrêtée, Trendelenburg gauche, aspiration VVC",
          "Hémorragie intra-utérine réfractaire : oxytocine IV, ballon de tamponnade, embolisation artérielle utérine"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction_AG"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_intraop"},
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthesie_alternative"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ketorolac", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesia_postop"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "TURP syndrome lors de l'hystéroscopie : dilution hyponatrémique si absorption glycocolle > 1 L — mécanisme identique au syndrome de résection prostatique (TURP)",
          "Résecteur bipolaire (NaCl) : risque TURP syndrome quasi nul avec sérum physiologique isotonique — préférence croissante dans les hôpitaux",
          "Monitoring entrées/sorties : calcul continu (Volume milieu entrant - Volume récupéré = absorption) — délégué à infirmière de bloc",
          "Durée hystéroscopie opératoire : myomectomie de stade II peut durer 60–90 min — tolérance absorption milieu critique"
        ],
        "pitfalls": [
          "Ne pas négliger le monitoring du milieu de distension — complication silencieuse (patient sous AG)",
          "Perforation utérine : plus fréquente chez femmes ménopausées (col rétracté) ou en cas de cavité déformée",
          "Syndrome TURP sévère (Na < 120) : correction lente (pas plus de 10 mmol/L/24h) pour éviter myélinolyse centrale du pont",
          "Oxytocine : non disponible dans la liste des drugs standards — utilisation par gynécologue (hors liste anesthésiste)"
        ],
        "references": [
          "[Complément – Source: AAGL, Hysteroscopy guidelines, 2021]",
          "[Complément – Source: SFAR, Anesthésie en gynécologie, 2022]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 2, 2025-2026]"
        ]
      }
    }
  }$s2hystero$::jsonb,
  '["ob"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 8. ivg_sedation
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'ivg_sedation',
  'gynecologie',
  '["gynecologie"]'::jsonb,
  '{"fr":"IVG sous sédation / anesthésie générale","en":"Surgical abortion under sedation / general anaesthesia","pt":"IVG sob sedação / anestesia geral"}'::jsonb,
  '{"fr":["interruption volontaire de grossesse","IVG chirurgicale","aspiration utérine","curetage"],"en":["surgical abortion","voluntary termination of pregnancy","uterine aspiration","vacuum aspiration"],"pt":["interrupção voluntária da gravidez","aborto cirúrgico","aspiração uterina"]}'::jsonb,
  $s2ivg${
    "quick": {
      "fr": {
        "preop": [
          "Confirmation grossesse + terme (SA) — IVG chirurgicale : jusqu'à 14 SA en Belgique",
          "Consentement éclairé — bilan standard minimum : groupe sanguin, RAI (si terme > 10 SA)",
          "Préparation cervicale par gynécologue : misoprostol 400 µg sublingual 1–3h avant l'acte (ramollissement col)",
          "Voie veineuse périphérique 18G, monitoring SpO2, FC, PNI — présence de soignant continue",
          "Jeûne 6h solides / 2h liquides clairs — procédure ambulatoire"
        ],
        "intraop": [
          "Sédation profonde / AG légère AIVOC : propofol Schnider effect-site cible 3–4 µg/mL + remifentanil Minto Ce 2–3 ng/mL",
          "Ventilation spontanée sous O2 nasal 2–4 L/min — EtCO2 par capnographie nasale si disponible",
          "Position gynécologique, strirups — protéger contre compression neurovasculaire des membres inférieurs",
          "Bloc paracervical par gynécologue : lidocaïne 1 % 10 mL (5 mL de chaque côté) — réduction douleur per-aspiration",
          "Durée très courte (5–10 min) : titration fine propofol — objectif sédation profonde mais reveil rapide",
          "Monitorage : SpO2, EtCO2 nasal, FC, PNI toutes les 5 min"
        ],
        "postop": [
          "Récupération 30–60 min en SSPI — évaluation analgésie, saignement, vertige, nausées",
          "Analgésie de sortie : paracétamol 1g/6h + ibuprofène 400 mg/8h per os (crampes normales)",
          "Ambulatoire — sortie accompagnée obligatoire",
          "Prescription contraception si souhaitée — consultation gynécologique de suivi J+2–J+4",
          "Consignes : saignement modéré pendant 1–2 semaines normal — retour si saignement abondant ou fièvre"
        ],
        "red_flags": [
          "Laryngospasme (sédation insuffisante + stimulation) : manœuvre de Larson, propofol 0,5 mg/kg ou succinylcholine si résistant",
          "Hémorragie utérine (rétention ovulaire) : utérus mou et saignement abondant — massage utérin + utérotoniques, curetage complémentaire",
          "Réaction vasovagale lors de la dilatation cervicale : bradycardie + hypotension — Trendelenburg, atropine 0,5 mg IV",
          "Perforation utérine : douleur pelvienne soudaine — arrêt, laparoscopie diagnostique",
          "Grossesse non évacuée (rétention) : douleur persistante, saignement — contrôle écho J+7, aspiration complémentaire"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "sedation_aivoc"},
          {"drug_id": "remifentanil", "indication_tag": "analgesia_aivoc"},
          {"drug_id": "lidocaine", "indication_tag": "bloc_paracervical"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_alternative"},
          {"drug_id": "midazolam", "indication_tag": "premedication_option"},
          {"drug_id": "atropine", "indication_tag": "bradycardie_vasovagale"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_postop"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesia_postop"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "AIVOC (Anesthésie Intraveineuse À Objectif de Concentration) : modèle Schnider pour propofol, Minto pour remifentanil — titration fine, reveil rapide",
          "Remifentanil AIVOC pour IVG : action ultra-courte (t1/2 contextuelle 3 min), analgésie intense perop, apnée possible à doses élevées — SpO2 continue",
          "Bloc paracervical efficace : réduction EVA de 30–50 % pendant aspiration — lidocaïne 1 % 10 mL total",
          "Procédure < 10 min : privilégier reveil ultra-rapide — propofol AIVOC supérieur au propofol bolus pour cinétique de reveil"
        ],
        "pitfalls": [
          "Sédation insuffisante : patient se réveille pendant aspiration (très douloureux) — titration perop si signes de réveil",
          "Sédation excessive : apnée sur remifentanil — O2 nasal et capnographie nasale obligatoires, antagoniste non disponible",
          "Réaction vasovagale : fréquente lors de la dilatation cervicale — atropine disponible à portée de main",
          "Ne pas utiliser ketamine : hallucinations et cauchemars, non adapté pour une procédure gynécologique consciente"
        ],
        "references": [
          "[Complément – Source: SFAR, Anesthésie sédation pour IVG, consensus, 2022]",
          "[Complément – Source: CNGOF, Recommandations IVG, 2020]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 2, 2025-2026]"
        ]
      }
    }
  }$s2ivg$::jsonb,
  '["ob"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 9. nephrectomie_laparoscopique
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'nephrectomie_laparoscopique',
  'urologie',
  '["urologie"]'::jsonb,
  '{"fr":"Néphrectomie laparoscopique","en":"Laparoscopic nephrectomy","pt":"Nefrectomia laparoscópica"}'::jsonb,
  '{"fr":["ablation du rein","néphro-urétérectomie laparoscopique","nephrectomie robot","donneur rein vivant"],"en":["laparoscopic nephrectomy","robotic nephrectomy","kidney removal","hand-assisted nephrectomy"],"pt":["nefrectomia laparoscópica","nefrectomia robótica","remoção do rim"]}'::jsonb,
  $s2nephro${
    "quick": {
      "fr": {
        "preop": [
          "Évaluation rénale bilatérale : créatinine, DFG — importance si rein unique ou insuffisance rénale chronique",
          "Imagerie vasculaire préopératoire : artères rénales surnuméraires sur angio-TDM — complication potentielle",
          "Groupe-RAI, bilan biologique complet, correction HTA (IECA/ARA2 arrêtés 24h avant si rein unique)",
          "Antibioprophylaxie : céfazoline 2g IV 30 min avant incision",
          "Jeûne standard 6h/2h — hospitalisation J0 ou J-1 selon complexité"
        ],
        "intraop": [
          "AG intubation — curarisation profonde pour pneumopéritoine et rétraction des organes",
          "Décubitus latéral avec billot lombaire (flanc gauche ou droit selon côté) — rembourrage aisselle et bras",
          "Pneumopéritoine CO2 12–15 mmHg — ETCO2 surveillé (variation perop normale sous CO2)",
          "Monitoring diurèse (sonde urinaire) — hémodynamique : VVP 16G + 2e VVP ou VVC si chirurgie complexe",
          "Éviter hypotension prolongée : perfusion rénale controlatérale — cible PAM > 65 mmHg",
          "Durée variable 90–180 min — curarisation maintenue profonde, sugammadex à la fin",
          "Pas d'AINS en intraopératoire si IRC préexistante ou rein unique"
        ],
        "postop": [
          "Extubation salle réveil — surveillance diurèse et créatinine J1–J2",
          "Analgésie : paracétamol 1g/6h + kétorolac 30 mg/8h si DFG > 60 mL/min/1,73 m² — morphine PCA si kétorolac contre-indiqué",
          "Thromboprophylaxie : énoxaparine 40 mg SC à H+6",
          "Hématurie initiale normale (néphro-urétérectomie) : surveillance drain",
          "Mobilisation précoce J0–J1, alimentation légère J0",
          "Surveillance créatinine J2 (rein unique) : élévation transitoire attendue — si > 200 µmol/L avec oligurie : bilan hydratation"
        ],
        "red_flags": [
          "Saignement veineux cave ou artère rénale : chute PNI brutale, conversion laparotomie urgente — VVP larges, CG disponibles",
          "Pneumothorax sur brèche pleurale : emphysème sous-cutané rapide, SpO2 chute — exsufflation, adaptation ventilation, chirurgien averti",
          "Iléus postopératoire prolongé : absence transit > J3 — sonde gastrique, TDM si occlusion suspectée",
          "Insuffisance rénale aiguë post-rein unique : oligurie, créatinine doublée — hydratation, dopamine rénale discutée, néphrologue"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_intraop"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation"},
          {"drug_id": "sugammadex", "indication_tag": "decurarisation"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ketorolac", "indication_tag": "analgesia_si_DFG_ok"},
          {"drug_id": "morphine", "indication_tag": "analgesia_pca_si_contre_indication_AINS"},
          {"drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Décubitus latéral : position « brisée » avec billot gonflable sous le flanc pour ouvrir l'espace intercostal — vérifier aisselle (coussin protecteur)",
          "Brèche pleurale peropératoire : possible lors de dissection du pôle supérieur rénal — emphysème sous-cutané rapide, ETCO2 monte, SpO2 chute",
          "Pneumopéritoine et ETCO2 : hausse de 5–10 mmHg normale sous CO2 — augmenter VE pour compensation",
          "Donneur rein vivant : procédure plus exigeante (hémostase parfaite, durée d'ischémie minimale) — équipe expérimentée, coordination greffe"
        ],
        "pitfalls": [
          "AINS contre-indiqués si DFG < 60 mL/min/1,73 m², rein unique, ou patient avec IRC — morphine PCA préférable",
          "Conversion laparotomie si saignement : accès rapide limité en décubitus latéral — avoir plan B clair avec chirurgien",
          "Hypotension sous CO2 et décubitus latéral : tolérée si transitoire — vasopresseurs (phényléphrine ou éphedrine) si PAM < 60 persistant",
          "Emphysème sous-cutané étendu : ETCO2 peut monter > 60 mmHg — augmenter VE ou réduire pression insufflation"
        ],
        "references": [
          "[Complément – Source: EAU, European Association of Urology Guidelines Kidney Cancer, 2023]",
          "[Complément – Source: SFAR, Anesthésie urologie laparoscopique, 2022]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 2, 2025-2026]"
        ]
      }
    }
  }$s2nephro$::jsonb,
  '["anticoag"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 10. cystectomie_radicale
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'cystectomie_radicale',
  'urologie',
  '["urologie"]'::jsonb,
  '{"fr":"Cystectomie radicale avec dérivation urinaire","en":"Radical cystectomy with urinary diversion","pt":"Cistectomia radical com derivação urinária"}'::jsonb,
  '{"fr":["cystectomie totale","Bricker","néovessie orthotopique","dérivation urinaire","cancer de la vessie invasif"],"en":["radical cystectomy","ileal conduit","orthotopic neobladder","bladder cancer surgery","Bricker diversion"],"pt":["cistectomia radical","conduto ileal","neovessie","derivação urinária"]}'::jsonb,
  $s2cysto${
    "quick": {
      "fr": {
        "preop": [
          "ERAS préhabilitation 4–8 semaines : nutrition (albumine > 30 g/L), exercice physique adapté, arrêt tabac, psychologie",
          "Correction anémie préopératoire : fer IV (si carence martiale) ou transfusion si Hb < 8 g/dL",
          "Arrêt anticoagulants/anti-agrégants selon délai et risque thrombotique — relais héparine si nécessaire",
          "Groupe-RAI, bilan biologique complet (coagulation, bilan rénal), préparation intestinale (discussion — ERAS : non systématique)",
          "Antibioprophylaxie : céfazoline 2g IV 30 min avant incision + répétition H+8 et H+16 (procédure > 4h)"
        ],
        "intraop": [
          "AG + epidural thoracique T10–T11 combinés (ERAS) : bupivacaïne 0,1 % peropératoire, analgésie épidurale continue postopératoire",
          "Accès vasculaire : 2 VVP 16G + VVC + voie artérielle radiale — monitoring hémodynamique invasif obligatoire",
          "Position Trendelenburg 20–30° prolongé (4–8h) : risque oedème laryngé, cornéen, cérébral — couverture yeux, brassard tête",
          "Goal-directed fluid therapy (GDFT) : limiter apports IV, monitorer SVV ou PPV — réduire surcharge liquidienne",
          "Acide tranexamique : 1g IV à l'induction + 1g à H+3 (chirurgie pelvienne hémorragique)",
          "Hypothermie prévention : couverture chauffante (Bair Hugger), liquides réchauffés — T° > 36°C tout au long",
          "Curarisation profonde maintenue — cœlioscopie/robot : pression insufflation 12 mmHg",
          "Durée 4–8h selon technique (ouverte/robot) et type de dérivation (Bricker vs néovessie)"
        ],
        "postop": [
          "Extubation salle réveil si ERAS — passage USI si instabilité ou durée > 7h",
          "Analgésie épidurale thoracique J0–J3 : bupivacaïne 0,1 % + sufentanil 0,5 µg/mL, débit 4–8 mL/h",
          "Thromboprophylaxie : énoxaparine 40 mg SC à H+6 (délai 8–12h si epidural)",
          "Bilan entrées/sorties strict : drains urétéraux, sonde urinaire — surveillance électrolytes",
          "Reprise alimentation entérale précoce J0–J1 (ERAS) — iléus fréquent si manipulation intestinale",
          "Mobilisation : lever J0 avec aide, kinésithérapie respiratoire, prévention TVP",
          "Sortie ERAS J7–J10 si non compliqué"
        ],
        "red_flags": [
          "Saignement pelvien massif (plexus veineux pelvien) : appel aide chirurgicale, transfusion MTP, TXA complémentaire",
          "Thrombo-embolie pulmonaire (TEP) : longue procédure + Trendelenburg = risque élevé — traitement anticoagulant curatif",
          "Occlusion/iléus postopératoire prolongé (> J5) : TDM, correction ionique, sonde gastrique",
          "Fistule urinaire post-opératoire : drain avec urines, bilirubine drain élevée — sonde urétérale, reprise possible",
          "Infection profonde pelvienne : fièvre > J5, douleur pelvienne, hyperleucocytose — TDM et drainage si collection"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction_tiva"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_intraop"},
          {"drug_id": "sufentanil", "indication_tag": "epidural_analgesia"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation"},
          {"drug_id": "sugammadex", "indication_tag": "decurarisation"},
          {"drug_id": "bupivacaine", "indication_tag": "epidural_thoracique"},
          {"drug_id": "acide_tranexamique", "indication_tag": "hemostase_perop"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "morphine", "indication_tag": "analgesia_sauvetage"},
          {"drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie"},
          {"drug_id": "noradrenaline", "indication_tag": "vasopresseur_si_hypotension_Trendelenburg"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "ERAS cystectomie radicale : préhabilitation + nutrition + analgésie épidurale + GDFT + mobilisation précoce — réduit complications de 30 % et durée séjour de 2 jours",
          "Position Trendelenburg prolongée : oedème cornéen (protéger yeux), HTIC modérée (surveiller sonde ventilatoire et capnie), oedème laryngé (extubation prudente)",
          "TXA peropératoire : données solides dans chirurgie pelvienne oncologique — réduction transfusion de 25 %",
          "Dérivation urinaire : Bricker (conduit iléal + stomie) plus simple et moins de complications ; néovessie orthotopique (nécessite compliance vésicale et patiente motivée) — durée opératoire 1h supplémentaire"
        ],
        "pitfalls": [
          "Epidural thoracique haut T10–T11 et Trendelenburg : risque hypotension importante — vasopresseurs disponibles, noradrénaline titration IV si PAM < 60",
          "GDFT et Trendelenburg : méfiance des indices de variations dynamiques (SVV/PPV faussés en Trendelenburg > 20°) — interpréter avec prudence",
          "Durée > 6h : température corporelle — couverture chauffante insuffisante seule, envisager réchauffeur liquidien actif",
          "TXA et thrombo-embolie : balance risque hémorragique vs thromboembolique à individualiser dans les 48h post-opératoires"
        ],
        "references": [
          "[Complément – Source: ERAS Society, Enhanced Recovery After Radical Cystectomy, 2021]",
          "[Complément – Source: EAU, Bladder cancer guidelines, 2023]",
          "[Complément – Source: SFAR, Anesthésie chirurgie urologique, 2022]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 2, 2025-2026]"
        ]
      }
    }
  }$s2cysto$::jsonb,
  '["anticoag","icu","regional"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 11. remifentanil_analgesia_travail
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'remifentanil_analgesia_travail',
  'obstetrique',
  '["obstetrique"]'::jsonb,
  '{"fr":"Analgésie au rémifentanil APCIV pour le travail","en":"Remifentanil patient-controlled IV analgesia (PCIA) for labour","pt":"Analgesia com remifentanil APCIV para o trabalho de parto"}'::jsonb,
  '{"fr":["APCIV rémifentanil","analgésie obstétricale opioïde IV","alternative à la péridurale","analgésie labour non neuraxiale"],"en":["remifentanil PCIA labour","IV opioid labour analgesia","epidural alternative"],"pt":["APCIV remifentanil parto","analgesia opioide IV trabalho de parto"]}'::jsonb,
  $s2remi${
    "quick": {
      "fr": {
        "preop": [
          "Indication : contre-indication à la péridurale (refus éclairé, plaquettes < 80 G/L, anticoagulation, sepsis, hypertension intracrânienne, impossibilité technique)",
          "Consentement éclairé spécifique : risques (désaturation, sédation excessive, dépression néonatale) et bénéfices vs péridurale",
          "Voie veineuse périphérique dédiée APCIV — monitoring continu SpO2 + FC + PNI (toutes les 5 min)",
          "Présence infirmière continue et dédiée OBLIGATOIRE (protocole Saint-Pierre — pas de délégation pendant l'administration)",
          "O2 nasal 2 L/min en continu dès le début de l'APCIV",
          "Évaluation : SAOS sévère non appareillé = contre-indication relative — discussion individuelle"
        ],
        "intraop": [
          "Protocole Saint-Pierre : rémifentanil 20 µg/mL en pousse-seringue, bolus patient 0,1 µg/kg (5–20 µg), période réfractaire 2 min, pas de débit continu",
          "Activation du bolus par la parturiente elle-même 20–30 sec AVANT la contraction anticipée (délai d'action 30–60 s)",
          "Surveillance continue SpO2 : alarme si < 94 % — diminuer dose ou arrêter APCIV",
          "Score de Ramsay toutes les 30 min : Ramsay > 3 = trop sédaté — diminuer ou arrêter",
          "Switch péridurale possible si travail se prolonge, douleur insuffisamment contrôlée, ou décision césarienne",
          "En cas d'urgence (bradycardie foetale, souffrance aiguë) : ARRÊTER APCIV immédiatement, O2 haut débit, appel anesthésiste"
        ],
        "postop": [
          "APCIV arrêté à la naissance — demi-vie ultra-courte (3–5 min) : élimination rapide chez la mère",
          "Surveillance néonatale Apgar : dépression néonatale possible si bolus proche de l'accouchement",
          "Transfert salle de naissance — surveillance post-partum standard",
          "Analgésie post-partum : paracétamol ± ibuprofène per os selon épisiotomie/déchirure"
        ],
        "red_flags": [
          "Désaturation SpO2 < 90 % : arrêt APCIV immédiat, O2 haut débit masque 10 L/min, appel anesthésiste — pas d'escalade dose",
          "Sédation excessive (Ramsay ≥ 4) : arrêt APCIV, stimulation verbale, O2 — ne jamais laisser parturiente seule",
          "Dépression néonatale (si bolus < 10 min avant naissance) : équipe pédiatrique prévenue, naloxone néonatale disponible (service pédiatrie)",
          "Apnée maternelle : stimulation immédiate, ventilation au masque, appel aide, intubation si nécessaire",
          "Bradycardie foetale inexpliquée sous rémifentanil : décubitus latéral gauche, O2 maternel, arrêt APCIV, monitoring foetal"
        ],
        "drugs": [
          {"drug_id": "remifentanil", "indication_tag": "apciv_analgesia_travail"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_alternative_si_penurie"},
          {"drug_id": "ondansetron", "indication_tag": "ponv_nausees_sous_opioid"},
          {"drug_id": "atropine", "indication_tag": "bradycardie_reflex"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_postpartum"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesia_postpartum"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Rémifentanil APCIV : bolus à la demande — parturiente contrôle elle-même son analgésie; t1/2 contextuelle 3 min après arrêt = élimination rapide",
          "Pas de débit de fond : évite accumulation et sédation continue — protocole Saint-Pierre : 20 µg/mL, bolus 0,1 µg/kg, verrouillage 2 min",
          "Efficacité vs péridurale : rémifentanil APCIV = analgésie inférieure à la péridurale mais nettement supérieure au placebo — 50–60 % des parturientes satisfaites",
          "Surveillance infirmière continue : différence fondamentale vs péridurale — nécessite présence dédiée permanente (ratio 1:1)"
        ],
        "pitfalls": [
          "Ne jamais laisser la parturiente seule sous APCIV rémifentanil : apnée silencieuse possible (desaturation sans bruits)",
          "SAOS sévère non appareillé : contre-indication relative — risque apnée centrale obstructive majorée",
          "Efficacité variable interindividuelle : certaines parturientes obtiennent une analgésie insuffisante — switch péridurale à proposer tôt",
          "Confusion avec d'autres bolus IV : pompe dédiée étiquetée APCIV REMIFENTANIL — pas d'autres médicaments sur cette voie"
        ],
        "references": [
          "[Complément – Source: Cochrane, Opioids for pain relief in labour, 2018]",
          "[Complément – Source: SFAR/CNGOF, Analgésie obstétricale non neuraxiale, 2022]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 2 Obstétrique, 2025-2026]"
        ]
      }
    }
  }$s2remi$::jsonb,
  '["ob","regional"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 12. embolie_liquide_amniotique
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'embolie_liquide_amniotique',
  'obstetrique',
  '["obstetrique","reanimation"]'::jsonb,
  '{"fr":"Embolie de liquide amniotique – Prise en charge urgente","en":"Amniotic fluid embolism – Emergency management","pt":"Embolia por líquido amniótico – Abordagem de emergência"}'::jsonb,
  '{"fr":["ELA","embolie amniotique","anaphylaxie obstétricale","effondrement obstétrical"],"en":["amniotic fluid embolism","AFE","obstetric anaphylaxis","maternal collapse"],"pt":["embolia por líquido amniótico","ELA","anafilaxia obstétrica","colapso materno"]}'::jsonb,
  $s2ela${
    "quick": {
      "fr": {
        "preop": [
          "URGENCE INOPINÉE — contexte : pendant ou juste après accouchement vaginal ou césarienne",
          "Facteurs favorisants : polyhydramnios, grossesse multiple, travail induit, manœuvres utérines, césarienne",
          "Présentation clinique : tétrade — hypotension/collapsus + détresse respiratoire + CIVD + coma/convulsions",
          "Diagnostic d'exclusion : éliminer embolie pulmonaire, anaphylaxie, hémorragie massive, sepsis, éclampsie",
          "Mortalité 20–40 % — morbidité sévère : SDRA, défaillance multiviscérale, séquelles neurologiques"
        ],
        "intraop": [
          "ALGORITHME SAINT-PIERRE ELA — APPEL AIDE IMMÉDIAT : anesthésiste senior + obstétricien + sage-femme + pédiatre + réanimateur",
          "Étape 1 : O2 haut débit FiO2 1,0 masque haute concentration, voie IV 16G x2 si pas déjà en place",
          "Étape 2 : si détresse respiratoire ou inconscience — RSI immédiate : propofol 1 mg/kg + rocuronium 1,2 mg/kg, intubation oro-trachéale",
          "Étape 3 : vasopresseurs — noradrénaline 0,1–1 µg/kg/min IV (choc distributif) ± phényléphrine si normocarde, éphedrine si bradycardie associée",
          "Étape 4 : CIVD hémorragique — protocole MTP : CGR + PFC + Plaquettes ratio 1:1:1, acide tranexamique 1g IV immédiat + 1g à H+3",
          "Étape 5 : arrêt cardiaque réfractaire → ECMO veno-artérielle si centre disponible — appel équipe greffe/ECMO",
          "Accouchement ou extraction foetale urgente si in utero (prolonge l'anoxie maternelle) — césarienne en urgence si fœtus viable"
        ],
        "postop": [
          "Transfert réanimation — ventilation mécanique, monitorage invasif continu",
          "Surveillance CIVD : fibrinogène (< 2 g/L = CIVD sévère), TP, TCA, plaquettes, D-dimères — répéter toutes les 2h",
          "Bilan neurologique : EEG si coma persistant, scanner cérébral si focus neurologique",
          "Support rénal : si IRA — diurèse forcée prudente ou hémodialyse",
          "Suivi psychologique mère et équipe — événement traumatisant pour le personnel"
        ],
        "red_flags": [
          "CIVD d'emblée (50 % des ELA) : fibrinogène chute rapide — anticiper avant résultats biologiques si contexte clinique",
          "Arrêt cardiaque perop ou en salle de naissance : RCP immédiate, extraction fœtale si > 22 SA (améliore RCP maternelle), ECMO si réfractaire",
          "Saignement utérin réfractaire associé : ligature artères utérines, embolisation, hystérectomie d'hémostase",
          "Défaillance multiviscérale : SDRA (ventilation protectrice), IRA (dialyse), insuffisance hépatique — transfert réanimation tertiaire",
          "Coagulopathie hémorragique réfractaire aux produits sanguins : facteur VIIa recombinant 90 µg/kg (usage compassionnel)"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "rsi_induction_urgence"},
          {"drug_id": "rocuronium", "indication_tag": "rsi_curarisation"},
          {"drug_id": "sugammadex", "indication_tag": "reversibilite_rocuronium_si_CICV"},
          {"drug_id": "noradrenaline", "indication_tag": "vasopresseur_premier_choix_choc"},
          {"drug_id": "phenylephrine", "indication_tag": "vasopresseur_si_normocarde"},
          {"drug_id": "ephedrine", "indication_tag": "vasopresseur_si_bradycardie"},
          {"drug_id": "atropine", "indication_tag": "bradycardie_reflex"},
          {"drug_id": "acide_tranexamique", "indication_tag": "civd_hemorragique"},
          {"drug_id": "morphine", "indication_tag": "sedation_analgesia_rea"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "ELA : physiopathologie imparfaitement comprise — réponse anaphylactoïde au passage de matériel amniotique (cellules squameuses, mucine, vernix) dans la circulation maternelle",
          "CIVD précoce dans 50 % des cas : consommation facteurs coagulation + activation fibrinolyse — fibrinogène < 2 g/L = seuil alarme",
          "Arrêt cardiaque maternel : si > 22 SA, extraction fœtale dans les 5 min améliore réanimation maternelle (décompression aorto-cave)",
          "ECMO veno-artérielle : indiquée si arrêt cardiaque réfractaire > 10–15 min de RCP — transfert ECMO team si disponible (CHU Bruxelles)",
          "Registre ELA : déclaration obligatoire (vigilance obstétricale nationale) — contribue à l'amélioration des pratiques"
        ],
        "pitfalls": [
          "Diagnostic tardif : penser ELA devant tout collapsus inexpliqué pendant/après accouchement — traitement empirique ne doit pas attendre confirmation",
          "CIVD : ne pas attendre les résultats biologiques si hémorragie visible + contexte ELA — MTP immédiat",
          "Vasopresseurs en bolus : risque d'aggravation de la défaillance cardiaque droite (cor pulmonale aigu) — préférer noradrénaline en titration continue",
          "Corticoïdes : anciennement utilisés (dexaméthasone), pas de preuve de bénéfice dans l'ELA — ne pas substituer aux mesures de réanimation"
        ],
        "references": [
          "[Complément – Source: SFAR/CNGOF, Recommandations embolie amniotique, 2023]",
          "[Complément – Source: Society for Maternal-Fetal Medicine (SMFM), Amniotic fluid embolism, 2016]",
          "[Complément – Source: CRASH-2 Collaborators, TXA in haemorrhage, Lancet, 2010]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 2 Obstétrique, 2025-2026]"
        ]
      }
    }
  }$s2ela$::jsonb,
  '["ob","icu","anticoag"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

COMMIT;
