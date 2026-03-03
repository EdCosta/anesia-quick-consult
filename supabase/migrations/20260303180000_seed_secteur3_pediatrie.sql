-- Migration: Secteur 3 – Pédiatrie (14 procédures)
-- CHU Saint-Pierre PGs 2025-2026
-- Adénoïdes, amygdales, oreille, circoncision, hypospade, orchidopexie,
-- hernie inguinale, appendicite, pylore, oeil perforant, strabisme, NEC, CAP, sédation imagerie

BEGIN;

-- 1. adenoidectomie_att_paed
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'adenoidectomie_att_paed',
  'chirurgie-pediatrique',
  '["chirurgie-pediatrique","orl"]'::jsonb,
  '{"fr":"Adénoïdectomie ± Aérateurs transtympaniques (ATT) – Enfant","en":"Adenoidectomy ± Tympanostomy tubes (Grommets) – Paediatric","pt":"Adenoidectomia ± Tubos de ventilação (ATT) – Pediátrica"}'::jsonb,
  '{"fr":["adénoïdes","végétations","ATT","drains transtympaniques","aérateurs"],"en":["adenoids","grommets","tympanostomy tubes","adenoid hypertrophy"],"pt":["adenoides","tubos transtimpânicos","aéreadores"]}'::jsonb,
  $s3aden${
    "quick": {
      "fr": {
        "preop": [
          "Procédure ambulatoire (hôpital de jour) — jeûne 6h solides / 4h lait maternel / 2h liquides clairs (ASA fasting guidelines)",
          "Évaluation OSAS pédiatrique si ronflements sévères — saturation nocturne, consultation ORL +/- polysomnographie",
          "Voie veineuse périphérique (24G si possible en induction, 22G après) ou induction inhalatoire sans IV",
          "Pas d'antibioprophylaxie systématique pour adénoïdectomie simple",
          "Présence parentale à l'induction possible selon protocole de l'unité — réduit anxiété enfant"
        ],
        "intraop": [
          "Induction inhalatoire préférentielle en pédiatrie : sévoflurane 8 % dans O2/N2O 50 % — pose IV après endormissement",
          "Masque laryngé pour maintien — voie aérienne partagée avec chirurgien (tête en hyperextension)",
          "PONV prophylaxie OBLIGATOIRE (risque élevé en ORL pédiatrique) : ondansétron 0,1 mg/kg IV + dexaméthasone 0,15 mg/kg IV",
          "Analgésie : paracétamol 15 mg/kg IV (ou rectal si pas de VVP) avant la fin de l'intervention",
          "Ibuprofène 10 mg/kg per os ou IV selon disponibilité — si > 3 mois et pas de contre-indication",
          "Durée brève (15–30 min) — réveil rapide, éviter opioids",
          "Pose ATT par chirurgien : micro-incision tympanique + tube en T — procédure très courte (5 min)"
        ],
        "postop": [
          "SSPI pédiatrique : surveillance 30–60 min, SpO2 continue, évaluation saignement post-adénoïdectomie",
          "Analgésie de sortie : paracétamol 15 mg/kg/6h + ibuprofène 10 mg/kg/8h per os",
          "Alimentation orale : liquides dès réveil complet — glace ou sorbet si accepté (réduction oedème muqueux)",
          "Critères de sortie ambulatoire : enfant éveillé, SPO2 > 94 % air ambiant, analgésie satisfaisante, accompagnant adulte",
          "Observation nocturne si OSAS sévère documenté (SpO2 nocturne < 80 %) — risque d'aggravation post-op",
          "Consignes parents : saignement post-adénoïdectomie J7–J10 rare mais possible → urgences"
        ],
        "red_flags": [
          "Saignement post-adénoïdectomie (< J12) : sang dégluté possible (nausées/vomissements méléna) → consultation urgente — reprise au bloc si actif",
          "OSAS sévère post-opératoire aggravé : SpO2 nocturne < 88 % en post-op immédiat → surveillance rapprochée, O2 nasal, CPAP si nécessaire",
          "Laryngospasme à l'induction ou au réveil : manœuvre de Larson (pression point de Larson), propofol 0,5 mg/kg IV, succinylcholine si résistant",
          "Agitation post-anesthésique sévère (emergence delirium) : dexmédétomidine 0,5 µg/kg ou kétamine 0,5 mg/kg"
        ],
        "drugs": [
          {"drug_id": "sevoflurane", "indication_tag": "induction_inhalatoire"},
          {"drug_id": "propofol", "indication_tag": "induction_IV_alternative"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesia_antiinflammatoire"},
          {"drug_id": "ondansetron", "indication_tag": "ponv_prophylaxie"},
          {"drug_id": "dexamethasone", "indication_tag": "ponv_et_oedeme_muqueux"},
          {"drug_id": "ketamine", "indication_tag": "emergence_delirium_ou_agitation"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Inhalation sévoflurane 8 % (avec N2O) : induction rapide et agréable — N2O contre-indiqué si OMA en cours ou pour pose ATT seule (augmente pression oreille moyenne)",
          "OSAS pédiatrique modéré-sévère : observation nocturne post-op recommandée — risque d'obstruction residuelle, agitation, désaturation post-adénoïdectomie",
          "Emergence delirium (agitation post-anesthésique) : fréquente après sévoflurane chez enfant < 6 ans — prévention par kétamine 0,5 mg/kg en fin d'intervention",
          "Dexaméthasone : double bénéfice PONV + réduction oedème muqueux postopératoire — réduction de la douleur à 24h"
        ],
        "pitfalls": [
          "N2O contre-indiqué si pose ATT : augmentation pression oreille moyenne, déplacement possible des tubes en T",
          "Ne pas utiliser codéine chez enfant < 12 ans (métabolisme CYP2D6 imprévisible — risques de dépression respiratoire sévère)",
          "OSAS non diagnostiqué : enfant ronfleur + amygdales volumineuses = évaluer SpO2 nocturne avant adénoïdectomie",
          "Saignement post-op méconnu : enfant peut déglutir le sang — vomissements noirâtres = signe d'hémorragie"
        ],
        "references": [
          "[Complément – Source: ADARPEF, Recommandations anesthésie pédiatrique ORL, 2023]",
          "[Complément – Source: SFAR, Emergence delirium en pédiatrie, 2022]",
          "[Complément – Source: AAO-HNS, Tonsillectomy in children clinical practice guideline, 2019]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 3 Pédiatrie, 2025-2026]"
        ]
      }
    }
  }$s3aden$::jsonb,
  '["paeds","ponv"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 2. amygdalectomie_paed
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'amygdalectomie_paed',
  'chirurgie-pediatrique',
  '["chirurgie-pediatrique","orl"]'::jsonb,
  '{"fr":"Amygdalectomie – Enfant / Adulte jeune","en":"Tonsillectomy – Paediatric / Young adult","pt":"Amigdalectomia – Pediátrica / Adulto jovem"}'::jsonb,
  '{"fr":["ablation amygdales","tonsillectomie","amygdalotomie","angines récidivantes"],"en":["tonsillectomy","tonsil removal","tonsil surgery"],"pt":["amigdalectomia","remoção das amígdalas","tonsilectomia"]}'::jsonb,
  $s3amyg${
    "quick": {
      "fr": {
        "preop": [
          "Évaluer OSAS (ronflements, apnées observées) — SpO2 nocturne, polysomno si score OSAS > 5",
          "Jeûne 6h solides / 4h lait maternel / 2h liquides clairs",
          "Bilan coagulation systématique dans certains centres — examen clinique hémostase (antécédents familiaux, épistaxis)",
          "Pas d'antibioprophylaxie systématique pour amygdalectomie",
          "Information famille : hémorragie post-amygdalectomie 1–3 % (J1–J12) — consignes de retour aux urgences"
        ],
        "intraop": [
          "Intubation oro-trachéale : tube RAE (Ring-Adair-Elwyn) buccal orienté vers le bas — voie aérienne partagée avec chirurgien (Rose position : hyperextension cervicale)",
          "PONV prophylaxie DOUBLE obligatoire : ondansétron 0,1 mg/kg IV + dexaméthasone 0,15 mg/kg IV — risque PONV 60–80 % sans prophylaxie",
          "Dexaméthasone : réduit PONV + oedème amygdalien + douleur postopératoire (réduction de 2 points EVA à 24h)",
          "Analgésie : paracétamol 15 mg/kg IV + ibuprofène 10 mg/kg IV (éviter chez < 3 mois) + infiltration péri-amygdalienne par chirurgien (bupivacaïne 0,25 %)",
          "Éviter opioids en péri-opératoire (enfant OSAS) — si nécessaire : fentanyl 0,5–1 µg/kg titration",
          "Durée 30–45 min : maintien au sévoflurane ou propofol TIVA",
          "Extubation profonde optionnelle : réduit toux mais nécessite voie aérienne libre confirmée"
        ],
        "postop": [
          "Surveillance 2–4h minimum : SpO2 continue, saignement post-amygdalectomie, nausées",
          "Observation nocturne obligatoire : enfant < 3 ans, OSAS sévère, poids < 15 kg, comorbidités",
          "Analgésie orale de sortie : paracétamol 15 mg/kg/6h + ibuprofène 10 mg/kg/8h — pas de codéine chez < 12 ans",
          "Alimentation : liquides froids/tièdes dès réveil — glace, yaourt — éviter nourriture dure pendant 14 jours",
          "Hémorragie secondaire J7–J10 (fréquente) : expectoration sanglante ou vomissements noirâtres → urgences"
        ],
        "red_flags": [
          "Hémorragie post-amygdalectomie : ESTOMAC PLEIN (sang dégluté) — RSI indispensable avant toute réintervention : propofol + succinylcholine/rocuronium, suction prête",
          "OSAS sévère post-op : SpO2 < 88 % répétée → O2 nasal, CPAP pédiatrique, surveillance USI pédiatrique",
          "Laryngospasme au réveil : manœuvre de Larson + propofol 0,5–1 mg/kg + succinylcholine si résistant",
          "Emergence delirium sévère : kétamine 0,5 mg/kg ou dexmédétomidine 0,5 µg/kg IV lent"
        ],
        "drugs": [
          {"drug_id": "sevoflurane", "indication_tag": "induction_inhalatoire_ou_maintenance"},
          {"drug_id": "propofol", "indication_tag": "induction_IV_ou_TIVA"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_intraop_titration"},
          {"drug_id": "bupivacaine", "indication_tag": "infiltration_periamygdalienne"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesia_antiinflammatoire"},
          {"drug_id": "ondansetron", "indication_tag": "ponv_prophylaxie"},
          {"drug_id": "dexamethasone", "indication_tag": "ponv_oedeme_et_analgesia"},
          {"drug_id": "ketamine", "indication_tag": "emergence_delirium"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Hémorragie post-amygdalectomie : estomac plein certain (sang dégluté silencieusement) — RSI absolument obligatoire, ne jamais faire induction inhalatoire",
          "Dexaméthasone 0,15 mg/kg : niveau de preuve A1 pour réduction PONV et douleur post-amygdalectomie",
          "OSAS sévère (AHI > 10) : risque hyperréactivité aux opioids post-op — éviter morphine, préférer multimodale sans opioïde",
          "Tube RAE (Ring-Adair-Elwyn) : profil bas, moulé, orienté vers le bas — facilite accès chirurgical; confirmer capnogramme"
        ],
        "pitfalls": [
          "Codéine < 12 ans : CONTRE-INDIQUÉE — métaboliseurs ultra-rapides CYP2D6 : décès rapportés par dépression respiratoire",
          "Infiltration péri-amygdalienne bupivacaïne : communiquer dose totale au chirurgien — risque toxicité si dose > 2 mg/kg",
          "OSAS non connu préopératoire : ronflements + amygdales III+ = évaluer systématiquement avant déprogrammation",
          "Extubation profonde post-amygdalectomie : discutée — risque d'obstruction sur oedème résiduel si trop précoce"
        ],
        "references": [
          "[Complément – Source: ADARPEF, Tonsillectomy anaesthesia guidelines, 2023]",
          "[Complément – Source: Cochrane, Dexamethasone to prevent post-operative complications after tonsillectomy, 2019]",
          "[Complément – Source: AAO-HNS, Tonsillectomy in children, 2019]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 3 Pédiatrie, 2025-2026]"
        ]
      }
    }
  }$s3amyg$::jsonb,
  '["paeds","ponv","airway"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 3. chirurgie_oreille_paed
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'chirurgie_oreille_paed',
  'chirurgie-pediatrique',
  '["chirurgie-pediatrique","orl"]'::jsonb,
  '{"fr":"Chirurgie de l''oreille pédiatrique (Tympanoplastie, Mastoïdectomie)","en":"Paediatric ear surgery (Tympanoplasty, Mastoidectomy)","pt":"Cirurgia do ouvido pediátrica (Timpanoplastia, Mastoidectomia)"}'::jsonb,
  '{"fr":["tympanoplastie enfant","mastoïdectomie pédiatrique","myringoplastie","ossiculoplastie"],"en":["paediatric tympanoplasty","mastoidectomy child","myringoplasty","ossiculoplasty"],"pt":["timpanoplastia pediátrica","mastoidectomia criança","miringoplastia"]}'::jsonb,
  $s3orpaed${
    "quick": {
      "fr": {
        "preop": [
          "Évaluer audition préopératoire (audiogramme) — indiqué si otite chronique ou cholestéatome",
          "ÉVITER N2O : augmente la pression dans l'oreille moyenne, risque de déplacement de greffe — protocole Saint-Pierre : N2O contre-indiqué",
          "Jeûne standard 6h/4h/2h — procédure programmée",
          "Pas d'antibioprophylaxie systématique sauf perforation chronique ou risque infectieux (mastoïdite)"
        ],
        "intraop": [
          "TIVA propofol + remifentanil préférable : N2O évité, champ chirurgical moins saignant, PONV réduit vs halogénés",
          "Masque laryngé : maintien voie aérienne sans intubation si durée < 90 min — vérifier position tête tournée (chirurgie microscopique latérale)",
          "Intubation oro-trachéale si durée > 90 min, OSAS, ou neuromonitoring facial nécessaire",
          "PONV prophylaxie : ondansétron 0,1 mg/kg + dexaméthasone 0,15 mg/kg",
          "Tête tournée contralétale sur appui-tête rond — padding oreille saine",
          "Monitoring du nerf facial si mastoïdectomie : pas de curarisation après intubation (ou curarisation antagonisée avant début dissection)",
          "Durée 60–180 min selon procédure : tympanoplastie < 90 min, mastoïdectomie 90–180 min"
        ],
        "postop": [
          "SSPI 1–2h : surveillance nausées (facteur confondant avec vertige — fréquent post-otologie)",
          "Analgésie : paracétamol 15 mg/kg/6h + ibuprofène 10 mg/kg/8h",
          "Vertige post-opératoire : fréquent après mastoïdectomie — métoclopramide ou ondansétron",
          "Ambulatoire pour tympanoplastie simple — observation 1 nuit si mastoïdectomie ou durée > 3h",
          "Consignes : protection oreille opérée de l'eau pendant 6 semaines"
        ],
        "red_flags": [
          "Paralysie faciale postopératoire : vérifier monitoring per-opératoire, évaluation clinique immédiate — scanner si suspicion hématome compressif",
          "Vertige sévère avec nystagmus : atteinte labyrinthique peropératoire possible — observation, avis ORL",
          "PONV réfractaire post-otologie : serotonine antagoniste + corticoïde — penser vertige associé",
          "Otorrhée purulente post-op précoce (< J5) : infection sur greffe — antibiothérapie + évaluation ORL"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "tiva_induction_maintenance"},
          {"drug_id": "remifentanil", "indication_tag": "tiva_analgesia_intraop"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesia_antiinflammatoire"},
          {"drug_id": "ondansetron", "indication_tag": "ponv_prophylaxie"},
          {"drug_id": "dexamethasone", "indication_tag": "ponv_et_antiinflammatoire"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "N2O et oreille moyenne : N2O diffuse rapidement dans l'espace aérien de l'oreille moyenne (trompe d'Eustache), augmente la pression de 10–25 cmH2O — peut déplacer greffe tympanique ou prothèse ossiculaire",
          "TIVA propofol + remifentanil : réduit PONV (pas de sévoflurane), meilleure visualisation chirurgicale (moins de saignement), contrôle PAM précis",
          "Monitoring nerf facial (NIM) lors de mastoïdectomie : détecte stimulation électrique peropératoire — PAS de curarisation maintenue après intubation"
        ],
        "pitfalls": [
          "N2O absolument contre-indiqué si greffe tympanique — même brève administration en fin d'acte peut déplacer le greffon",
          "Curarisation résiduelle avec monitoring facial : annule le signal NIM — utiliser sugammadex avant début de la dissection faciale",
          "Tête tournée 90° : vérifier voie aérienne (LMA peut se déplacer) — recalibrer EtCO2 et SpO2 après positionnement"
        ],
        "references": [
          "[Complément – Source: ADARPEF, Anesthésie chirurgie ORL pédiatrique, 2023]",
          "[Complément – Source: SFAR, N2O et oreille moyenne, recommandations, 2022]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 3 Pédiatrie, 2025-2026]"
        ]
      }
    }
  }$s3orpaed$::jsonb,
  '["paeds","ponv"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 4. circoncision_paed
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'circoncision_paed',
  'chirurgie-pediatrique',
  '["chirurgie-pediatrique"]'::jsonb,
  '{"fr":"Circoncision / Préputioplastie – Enfant","en":"Circumcision / Preputioplasty – Paediatric","pt":"Circuncisão / Prepucioplastia – Pediátrica"}'::jsonb,
  '{"fr":["phimosis chirurgical","circoncision","préputioplastie","plasties préputiales"],"en":["circumcision","phimosis surgery","preputioplasty","foreskin surgery"],"pt":["circuncisão","cirurgia do fimose","prepucioplastia"]}'::jsonb,
  $s3circ${
    "quick": {
      "fr": {
        "preop": [
          "Procédure ambulatoire (hôpital de jour) — jeûne 6h solides / 4h lait maternel / 2h liquides clairs",
          "Pas d'antibioprophylaxie systématique",
          "Voie veineuse périphérique après induction inhalatoire — 22G ou 24G",
          "Informer les parents : douleur postopératoire modérée, gonflement local normal, miction normale attendue"
        ],
        "intraop": [
          "Induction inhalatoire : sévoflurane 8 % dans O2 — pose IV après endormissement",
          "Masque laryngé — ventilation spontanée — durée 20–30 min",
          "Bloc du nerf dorsal de la verge (BNV) : bupivacaïne 0,25 % 0,1–0,2 mL/kg (max 5 mL) de chaque côté à la base de la verge — analgésie postopératoire 8–12h",
          "Alternative : caudal épidurale bupivacaïne 0,25 % 0,5 mL/kg si BNV non réalisable",
          "Paracétamol 15 mg/kg IV + ibuprofène 10 mg/kg IV (si > 3 mois)",
          "PONV prophylaxie légère : ondansétron 0,1 mg/kg (risque modéré en ambulatoire)"
        ],
        "postop": [
          "SSPI 30–60 min : évaluation analgésie, miction (vérifier que l'enfant urine avant sortie ou en consultation J+1)",
          "Analgésie de sortie : paracétamol 15 mg/kg/6h + ibuprofène 10 mg/kg/8h per os pendant 5 jours",
          "Ambulatoire le jour même — sortie dès critères Aldrete remplis et miction documentée",
          "Consignes : bain de siège tiède 2x/j dès J+1, protection avec pansement 48h, fièvre ou saignement → consultation"
        ],
        "red_flags": [
          "Hémostase locale insuffisante : saignement actif post-op → consultation urgente, parfois reprise sous AG",
          "Rétention urinaire post-op (rare) : oedème du méat ou anxiété — cathéter si > 6h sans miction",
          "Infection superficielle : rougeur, pus, fièvre J3–J5 — antibiothérapie locale ± systémique",
          "Agitation post-anesthésique (emergence delirium) : kétamine 0,5 mg/kg IV ou propofol 0,5 mg/kg"
        ],
        "drugs": [
          {"drug_id": "sevoflurane", "indication_tag": "induction_inhalatoire"},
          {"drug_id": "bupivacaine", "indication_tag": "bloc_nerf_dorsal_verge_ou_caudal"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesia_antiinflammatoire"},
          {"drug_id": "ondansetron", "indication_tag": "ponv_prophylaxie"},
          {"drug_id": "ketamine", "indication_tag": "emergence_delirium"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Bloc du nerf dorsal de la verge (BNV) : 2 injections à la base, 10-12h et 2h de cadran — bupivacaïne 0,25 % (pas d'adrénaline sur pénis — risque vasospasme)",
          "Caudal épidurale alternative : bupivacaïne 0,25 % 0,5 mL/kg — bloc périnéal et scrotal + verge — durée 6–8h",
          "Règle absolue BNV : PAS d'adrénaline sur la verge (vasoconstriction locale = nécrose distale potentielle)"
        ],
        "pitfalls": [
          "Bupivacaïne + adrénaline : FORMELLEMENT CONTRE-INDIQUÉE sur verge — risque nécrose ischémique",
          "BNV raté : pas de réinjection sans vérification — injection en territoire interne (urètre) possible",
          "Emergence delirium : fréquent après sévoflurane chez enfant < 6 ans — kétamine préemptive 0,5 mg/kg en fin d'acte réduit incidence"
        ],
        "references": [
          "[Complément – Source: ADARPEF, Blocs nerveux périphériques en pédiatrie, 2022]",
          "[Complément – Source: Dalens B, Pédiatrie anesthésique — blocs régionaux, 2020]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 3 Pédiatrie, 2025-2026]"
        ]
      }
    }
  }$s3circ$::jsonb,
  '["paeds","regional"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 5. hypospade_paed
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'hypospade_paed',
  'chirurgie-pediatrique',
  '["chirurgie-pediatrique"]'::jsonb,
  '{"fr":"Chirurgie de l''hypospadias – Enfant","en":"Hypospadias repair – Paediatric","pt":"Cirurgia de hipospadia – Pediátrica"}'::jsonb,
  '{"fr":["urétroplastie","hypospadias","tubularisation","TUBIP","Snodgrass"],"en":["hypospadias repair","urethroplasty","Snodgrass","TUBIP"],"pt":["hipospadia","uretroplastia","Snodgrass"]}'::jsonb,
  $s3hypo${
    "quick": {
      "fr": {
        "preop": [
          "Procédure programmée — âge idéal 12–18 mois (selon recommandations internationales)",
          "Jeûne 6h/4h/2h — hospitalisation J0 ambulatoire ou 1 nuit selon degré hypospadias",
          "Évaluer degré : glandulaire < pénien < pénoscrotal — durée et complexité de la réparation",
          "Pas d'antibioprophylaxie systématique sauf hypospadias complexe (pénoscrotal, révision)"
        ],
        "intraop": [
          "Induction inhalatoire : sévoflurane 8 % dans O2 — pose IV après endormissement",
          "Intubation ou masque laryngé selon durée prévue : < 60 min masque laryngé, > 60 min intubation",
          "Caudal épidurale : bupivacaïne 0,25 % 0,5–0,7 mL/kg — analgésie périnéale et péno-scrotale excellente pour 6–8h",
          "Position grenouille (frog-leg) : genoux fléchis, cuisses ouvertes — garrot possible sur racine verge",
          "Tourniquet sur verge si requis : élastique fin souple — noter heure, ne pas dépasser 45 min",
          "Paracétamol 15 mg/kg IV + dexaméthasone 0,15 mg/kg (réduction oedème local)",
          "PONV prophylaxie : ondansétron 0,1 mg/kg",
          "Durée 45–120 min selon degré"
        ],
        "postop": [
          "Cathéter urinaire posé par chirurgien — surveiller drainage urinaire en SSPI",
          "Hospitalisation 1 nuit pour la plupart (sonde urinaire, soins infirmiers)",
          "Analgésie : paracétamol 15 mg/kg/6h + ibuprofène 10 mg/kg/8h per os pendant 5–7 jours",
          "Soins de sonde : rinçage biquotidien, pansement protecteur, pas de bain 2 semaines",
          "Retrait sonde : J5–J10 selon protocole chirurgical (décision chirurgicale)",
          "Consultation chirurgicale J+14 et J+3 mois pour évaluation résultat fonctionnel"
        ],
        "red_flags": [
          "Obstruction sonde urinaire : pas d'urine dans le sac > 2h, enfant agité → rinçage ou repositionnement",
          "Hémostase insuffisante perop : garrot trop lâche ou oublié → nécrose distale ou saignement",
          "Fistule urétrale post-op (J14–J30) : urine s'écoulant par orifice anormal — consultation chirurgicale, reprise à 6 mois",
          "Infection locale : pus, rougeur, fièvre > J3 — antibiothérapie (amoxicilline/clavulanate)"
        ],
        "drugs": [
          {"drug_id": "sevoflurane", "indication_tag": "induction_inhalatoire"},
          {"drug_id": "bupivacaine", "indication_tag": "caudal_epidurale"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesia_antiinflammatoire"},
          {"drug_id": "dexamethasone", "indication_tag": "oedeme_local_et_ponv"},
          {"drug_id": "ondansetron", "indication_tag": "ponv_prophylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Caudal épidurale en pédiatrie : bupivacaïne 0,25 % 0,5 mL/kg — bloc pénoscrotal complet, durée 6–8h, facilite chirurgie sans curarisation profonde",
          "Hypospadias glandulaire : correction simple, 45 min, ambulatoire possible",
          "Hypospadias pénoscrotal (sévère) : 2 temps parfois nécessaires, 90–120 min, nuit en observation systématique"
        ],
        "pitfalls": [
          "Caudal trop haute si volume > 1 mL/kg : bloc lombaire-thoracique avec hypotension — volume maximum 0,7 mL/kg",
          "Sonde urinaire obstruée : premier signe = agitation de l'enfant (globe vésical douloureux)",
          "Bupivacaïne caudal sans adrénaline uniquement : adrénaline non recommandée dans les blocs caudaux chez l'enfant (risque ischémie médullaire)"
        ],
        "references": [
          "[Complément – Source: ADARPEF, Blocs caudaux en pédiatrie, 2022]",
          "[Complément – Source: EAU Pediatric Urology, Hypospadias guidelines, 2023]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 3 Pédiatrie, 2025-2026]"
        ]
      }
    }
  }$s3hypo$::jsonb,
  '["paeds","regional"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 6. orchidopexie_paed
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'orchidopexie_paed',
  'chirurgie-pediatrique',
  '["chirurgie-pediatrique"]'::jsonb,
  '{"fr":"Orchidopexie – Cryptorchidie – Enfant","en":"Orchidopexy – Undescended testis – Paediatric","pt":"Orquidopexia – Criptorquidia – Pediátrica"}'::jsonb,
  '{"fr":["testicule non descendu","cryptorchidie","orchidopexie","ectopie testiculaire"],"en":["orchidopexy","undescended testis","cryptorchidism","testicular ectopia"],"pt":["orquidopexia","criptorquidismo","testículo não descido"]}'::jsonb,
  $s3orchi${
    "quick": {
      "fr": {
        "preop": [
          "Procédure programmée — âge idéal 6–18 mois (préservation spermatogénèse)",
          "Jeûne 6h/4h/2h — ambulatoire hôpital de jour",
          "Évaluation préopératoire : testicule palpable vs impalpable (abdominal) — influence durée et voie d'abord",
          "Pas d'antibioprophylaxie systématique"
        ],
        "intraop": [
          "Induction inhalatoire sévoflurane 8 % — pose IV après endormissement",
          "Masque laryngé — ventilation spontanée si < 60 min",
          "Bloc iliohypogastrique + ilioinguinal (BII) : bupivacaïne 0,25 % 0,5 mL/kg sous échoguidage — analgésie site inguinal 6–8h",
          "Alternative : caudal épidurale bupivacaïne 0,25 % 0,5 mL/kg si testicule non palpable ou abordinal",
          "Paracétamol 15 mg/kg IV + ibuprofène 10 mg/kg IV (si > 3 mois)",
          "PONV prophylaxie : ondansétron 0,1 mg/kg si risque (histoire de PONV ou vomissements post-AG)"
        ],
        "postop": [
          "SSPI 30–60 min : évaluation analgésie, saignement, état général",
          "Analgésie de sortie : paracétamol 15 mg/kg/6h + ibuprofène 10 mg/kg/8h per os pendant 3–5 jours",
          "Ambulatoire le jour même si procédure simple — accompagnant obligatoire",
          "Consignes : repos 48h, pas de bain J0–J1, activité légère dès J+2"
        ],
        "red_flags": [
          "Torsion testiculaire post-op (très rare) : douleur scrotale aiguë, urgence — échodoppler veineux, reprise chirurgicale",
          "Hémostase insuffisante : hématome scrotal expansif — compression locale, consultation urgente, reprise si expansif",
          "Testicule atrophié à 3–6 mois post-op : complications vasculaires de la descente — suivi chirurgical, écho"
        ],
        "drugs": [
          {"drug_id": "sevoflurane", "indication_tag": "induction_inhalatoire"},
          {"drug_id": "bupivacaine", "indication_tag": "bloc_ilioinguinal_ou_caudal"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesia_antiinflammatoire"},
          {"drug_id": "ondansetron", "indication_tag": "ponv_prophylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "BII (Bloc Iliohypogastrique + Ilioinguinal) : injection bupivacaïne 0,25 % au niveau de l'épine iliaque antérosupérieure — couverture inguinale et scrotale supérieure",
          "Caudal pour orchidopexie haute (abdominal) : bloc S2–L1 après 0,7 mL/kg — couverture funicule spermatique lors descente"
        ],
        "pitfalls": [
          "BII raté (fréquent si non échoguidé) : relier l'injection au déficit sensitif — ne pas répéter sans guidage",
          "Testicule abdominal non palpable : possibilité laparoscopie diagnostique — prévoir intubation si risque conversion"
        ],
        "references": [
          "[Complément – Source: ADARPEF, BII sous échoguidage en pédiatrie, 2022]",
          "[Complément – Source: EAU Pediatric Urology, Undescended testes guidelines, 2023]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 3 Pédiatrie, 2025-2026]"
        ]
      }
    }
  }$s3orchi$::jsonb,
  '["paeds","regional"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 7. hernie_inguinale_paed
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'hernie_inguinale_paed',
  'chirurgie-pediatrique',
  '["chirurgie-pediatrique"]'::jsonb,
  '{"fr":"Hernie inguinale – Enfant / Nourrisson","en":"Inguinal hernia – Paediatric / Infant","pt":"Hérnia inguinal – Pediátrica / Lactente"}'::jsonb,
  '{"fr":["hernie de l''aine enfant","hernie congénitale","cure herniaire pédiatrique","processus vaginal perméable"],"en":["paediatric inguinal hernia","infant inguinal hernia","congenital hernia repair"],"pt":["hérnia inguinal pediátrica","hérnia congênita","hérnia do lactente"]}'::jsonb,
  $s3hernpaed${
    "quick": {
      "fr": {
        "preop": [
          "Ambulatoire si âge corrigé > 52 semaines — si prématuré (< 52 sem âge corrigé) : observation 12–24h post-op (risque apnée)",
          "Jeûne 6h/4h/2h — urgence si hernie irréductible (étranglement)",
          "Hernie étranglée (urgence) : RSI si vomissements ou douleur intense — estomac potentiellement plein",
          "Pas d'antibioprophylaxie systématique pour hernie simple"
        ],
        "intraop": [
          "Induction inhalatoire sévoflurane (nourrisson) ou IV propofol (grand enfant)",
          "Masque laryngé si < 45 min, intubation si prématuré, obèse, ou urgence (étranglement)",
          "Bloc iliohypogastrique + ilioinguinal (BII) : bupivacaïne 0,25 % 0,5 mL/kg sous échoguidage (> 3 mois)",
          "Caudal épidurale si nourrisson < 3 mois ou BII impossible : bupivacaïne 0,25 % 0,5 mL/kg",
          "Paracétamol 15 mg/kg IV (rectal acceptable si < 3 mois : 20 mg/kg)",
          "PONV prophylaxie si > 2 ans : ondansétron 0,1 mg/kg"
        ],
        "postop": [
          "Prématuré ex-42–52 SA : monitoring apnée 12–24h obligatoire (SpO2 + FC + apnée monitor)",
          "Analgésie : paracétamol 15 mg/kg/6h per os ou rectal + ibuprofène 10 mg/kg/8h si > 3 mois",
          "Ambulatoire si terme > 52 semaines âge corrigé",
          "Consignes : activité normale dès J+2, bain interdit J0–J1"
        ],
        "red_flags": [
          "Apnée du prématuré post-op : monitoring SpO2 obligatoire — café IV (hors liste anesthésiste) ou théophylline en néonatologie",
          "Hernie irréductible : intestin ischémié possible — résection intestinale peut être nécessaire, transfusion si longue ischémie",
          "Récidive précoce (< 3 mois) : fréquente chez prématuré ou si hernie bilatérale — réopération"
        ],
        "drugs": [
          {"drug_id": "sevoflurane", "indication_tag": "induction_inhalatoire_nourrisson"},
          {"drug_id": "propofol", "indication_tag": "induction_IV_grand_enfant"},
          {"drug_id": "bupivacaine", "indication_tag": "BII_ou_caudal"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesia_si_plus_3_mois"},
          {"drug_id": "ondansetron", "indication_tag": "ponv_si_plus_2_ans"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Prématuré et anesthésie : risque apnée post-anesthésique jusqu'à 60 semaines âge post-conceptionnel — observation systématique",
          "Hernie inguinale nourrisson : processus vaginal perméable (ne se ferme pas) — voie inguinale haute ligature; laparoscopie possible si > 1 an"
        ],
        "pitfalls": [
          "Nourrisson < 3 mois + AINS : contre-indiqués — utiliser paracétamol seul",
          "Prématuré < 52 sem âge corrigé : ambulatoire CONTRE-INDIQUÉ même si hernie simple — apnée précoce possible",
          "Hernie étranglée : ne jamais endormir sans contrôle voie aérienne — vomissements fréquents"
        ],
        "references": [
          "[Complément – Source: ADARPEF, Anesthésie nourrisson et prématuré, 2023]",
          "[Complément – Source: EAU Pediatric Urology, Inguinal hernia guidelines, 2023]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 3 Pédiatrie, 2025-2026]"
        ]
      }
    }
  }$s3hernpaed$::jsonb,
  '["paeds","regional"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 8. appendicectomie_paed
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'appendicectomie_paed',
  'chirurgie-pediatrique',
  '["chirurgie-pediatrique"]'::jsonb,
  '{"fr":"Appendicectomie – Enfant","en":"Appendectomy – Paediatric","pt":"Apendicectomia – Pediátrica"}'::jsonb,
  '{"fr":["appendicite aiguë enfant","appendicectomie laparoscopique pédiatrique","appendicite perforée"],"en":["paediatric appendectomy","childhood appendicitis","laparoscopic appendectomy child"],"pt":["apendicectomia pediátrica","apendicite infantil"]}'::jsonb,
  $s3apppaed${
    "quick": {
      "fr": {
        "preop": [
          "Urgence chirurgicale — évaluation estomac plein : durée douleur, vomissements, dernière prise orale",
          "Bilan biologique : NFS, CRP, PCT si perforation suspectée — score pédiatrique (PAS, Pediatric Appendicitis Score)",
          "Réhydratation IV si déshydratation, analgésie IV (paracétamol 15 mg/kg IV) en attendant le bloc",
          "RSI SYSTÉMATIQUE : enfant avec appendicite = estomac non vide — pas d'induction inhalatoire",
          "Antibioprophylaxie : céfazoline 50 mg/kg IV (max 2g) + métronidazole 15 mg/kg IV (max 500 mg) si perforation"
        ],
        "intraop": [
          "RSI : fentanyl 2 µg/kg + propofol 3 mg/kg (ou kétamine 1–2 mg/kg si instable) + rocuronium 1,2 mg/kg",
          "Intubation oro-trachéale confirmée par capnogramme",
          "Laparoscopie pédiatrique : Trendelenburg 15°, insufflation CO2 8–12 mmHg (adapté poids), curarisation maintenue",
          "Antibioprophylaxie élargie si perforation : couverture anaérobies (métronidazole) + céfazoline",
          "Analgésie multimodale : paracétamol 15 mg/kg IV + kétorolac 0,5 mg/kg IV (max 30 mg, si > 1 an)",
          "Infiltration sites de trocarts par chirurgien : bupivacaïne 0,25 % 3–5 mL par site",
          "Sugammadex 2 mg/kg pour décurarisation",
          "Durée 30–60 min si non compliqué, 60–90 min si perforé/péritonite"
        ],
        "postop": [
          "SSPI 30–60 min : surveillance EVA, fièvre (persistance post-op = abcès résiduel)",
          "Analgésie : paracétamol 15 mg/kg/6h + ibuprofène 10 mg/kg/8h — morphine 0,05 mg/kg/4h si douleur sévère",
          "Thromboprophylaxie : non systématique pour appendicite simple — énoxaparine si obèse ou facteurs de risque",
          "Reprise alimentation : dès la tolérance (ERAS) — J0 si non perforé, J1–J2 si péritonite",
          "Sortie : J0–J1 si non perforé, J3–J5 si péritonite (avec antibiothérapie IV prolongée)",
          "Consignes : fièvre persistante > J3 ou douleur rebelle → consultation urgente (abcès)"
        ],
        "red_flags": [
          "Péritonite diffuse pédiatrique : réanimation septique (remplissage, antibiotiques IV larges spectre), conversion laparotomie possible",
          "Abcès appendiculaire post-op (J3–J10) : fièvre persistante, hyperleucocytose, douleur — écho/TDM, drainage radiologique",
          "Sepsie sévère à streptocoque A ou E. Coli BLSE : antibiothérapie adaptée aux prélèvements peropératoires",
          "Inhalation péri-induction (RSI raté) : aspiration trachéale, lavage bronchique, réanimation"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "rsi_induction"},
          {"drug_id": "ketamine", "indication_tag": "rsi_induction_si_instable"},
          {"drug_id": "rocuronium", "indication_tag": "rsi_curarisation"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_intraop"},
          {"drug_id": "sugammadex", "indication_tag": "decurarisation"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ketorolac", "indication_tag": "analgesia_AINS_IV"},
          {"drug_id": "bupivacaine", "indication_tag": "infiltration_trocarts"},
          {"drug_id": "morphine", "indication_tag": "analgesia_sauvetage"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "RSI pédiatrique : fentanyl 2 µg/kg + propofol 3 mg/kg + rocuronium 1,2 mg/kg — délai 60 s — intubation avec aide si possible",
          "Pression cricoïde (Sellick) : efficacité débattue mais encore pratiquée — appliquer légèrement si aide disponible",
          "Appendicite perforée pédiatrique : plus fréquente (30–40 %) que chez l'adulte (enfant exprime moins bien la douleur ou diagnostic tardif)"
        ],
        "pitfalls": [
          "Induction inhalatoire CONTRE-INDIQUÉE si vomissements récents ou douleur intense (estomac non vide) — RSI systématique",
          "Kétorolac pédiatrique : < 1 an contre-indiqué, 1–16 ans 0,5 mg/kg IV max 30 mg — anti-douleur efficace en ambulatoire",
          "Morphine post-op pédiatrique : 0,05 mg/kg max en titration — surveillance SpO2 continue pendant 1h"
        ],
        "references": [
          "[Complément – Source: ADARPEF, Anesthésie pédiatrique urgence digestive, 2023]",
          "[Complément – Source: APSA, Pediatric Appendicitis management guidelines, 2022]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 3 Pédiatrie, 2025-2026]"
        ]
      }
    }
  }$s3apppaed$::jsonb,
  '["paeds","airway"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 9. stenose_pylore_nourrisson
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'stenose_pylore_nourrisson',
  'chirurgie-pediatrique',
  '["chirurgie-pediatrique"]'::jsonb,
  '{"fr":"Sténose du pylore du nourrisson – Pyloromyotomie de Ramstedt","en":"Hypertrophic pyloric stenosis – Ramstedt pyloromyotomy","pt":"Estenose hipertrófica do piloro – Piloromiotomia de Ramstedt"}'::jsonb,
  '{"fr":["hypertrophie du pylore","pyloromyotomie","sténose hypertrophique du pylore","Ramstedt"],"en":["pyloric stenosis","Ramstedt pyloromyotomy","hypertrophic pyloric stenosis","infantile pyloric stenosis"],"pt":["estenose pilórica","piloromiotomia de Ramstedt","estenose hipertrófica do piloro"]}'::jsonb,
  $s3pylore${
    "quick": {
      "fr": {
        "preop": [
          "URGENCE MÉDICALE avant urgence chirurgicale — RESUSCITER D'ABORD : corriger alcalose métabolique hypochlorémique et hypokaliémie",
          "Critères biologiques avant chirurgie : Na > 130 mmol/L, K > 3,0 mmol/L, Cl > 90 mmol/L, pH < 7,50 — NE PAS OPÉRER avant correction",
          "Perfusion NaCl 0,9 % + KCl (si K < 3,5) — durée correction 12–48h selon sévérité",
          "Sonde naso-gastrique en aspiration douce continue — décompression gastrique, réduction risque inhalation",
          "Nourrisson 2–8 semaines (pic), vomissements projectiles en jet, hypertrophie pylorique à l'écho",
          "Bilan : ionogramme, pH, gaz du sang, NFS — correction minutieuse avant AG"
        ],
        "intraop": [
          "ESTOMAC PLEIN ABSOLU : RSI ou intubation éveillée (awake intubation)",
          "Technique Saint-Pierre : vidange gastrique active par SNG juste avant induction — aspiration de tout contenu résiduel",
          "RSI modifié : kétamine 2 mg/kg (hémodynamique stable) + rocuronium 1,2 mg/kg — intubation en tête légèrement surélevée",
          "Tête en légère proclive et aide à la pression laryngée si disponible",
          "Pyloromyotomie de Ramstedt : incision muscluaire sans ouverture de la muqueuse (vérification par insufflation air via SNG en fin d'acte)",
          "Durée 20–30 min (laparoscopique) — analgésie : paracétamol 15 mg/kg IV, pas d'opioïdes",
          "PONV prophylaxie : ondansétron 0,1 mg/kg + dexaméthasone 0,15 mg/kg",
          "Extubation ÉVEILLÉ : enfant doit crier et avaler avant extubation"
        ],
        "postop": [
          "SSPI pédiatrique : surveillance SpO2 continue (apnée post-AG nourrisson possible)",
          "Réintroduction orale dès H+4 : lait maternel ou biberon progressif selon protocole néonatal",
          "Vomissements post-op fréquents J0–J1 : oedème résiduel du pylore — alimentation progressive, antiémétiques si nécessaire",
          "Analgésie : paracétamol 15 mg/kg/6h per os ou suppositoire",
          "Hospitalisation 1–2 nuits minimum — sortie quand alimentation orale correcte",
          "Surveillance poids : regain pondéral attendu dès J2–J3"
        ],
        "red_flags": [
          "Inhalation péri-induction (fréquente si RSI raté ou sonde insuffisante) : suction trachéale, ventilation, réanimation",
          "Perforation muqueuse per-opératoire : urgence — réparation primaire, antibioprophylaxie, délai alimentation",
          "Apnée post-anesthésique : surveillance apnée 12h minimum en néonatologie",
          "Alcalose post-op persistante : réhydratation insuffisante, reprise ionogramme",
          "Hypoglycémie néonatale : nourrisson à jeun + perfusion inadaptée → glycémie toutes les 2h"
        ],
        "drugs": [
          {"drug_id": "ketamine", "indication_tag": "rsi_induction_nourrisson"},
          {"drug_id": "rocuronium", "indication_tag": "rsi_curarisation"},
          {"drug_id": "sugammadex", "indication_tag": "decurarisation"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ondansetron", "indication_tag": "ponv_prophylaxie"},
          {"drug_id": "dexamethasone", "indication_tag": "ponv_et_antiinflammatoire"},
          {"drug_id": "atropine", "indication_tag": "bradycardie_reflexe_vagale_nourrisson"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Alcalose hypochlorémique : perte de HCl gastrique par vomissements → compensation rénale → HCO3 élevé, K bas, Cl bas — correction OBLIGATOIRE avant chirurgie",
          "Awake intubation du nourrisson : technique de référence si correction incomplète (pH > 7.55) — nourrisson moins bien tolérant à la dépression respiratoire sous AG",
          "RSI modifié kétamine + rocuronium : kétamine préserve mieux tonus pharyngé et réflexes protecteurs que propofol chez le nourrisson",
          "Vérification pyloromyotomie : insufflation air par SNG en fin d'acte — absence de bulle = muqueuse intacte",
          "Glycémie peropératoire : nourrisson jeûnant + chirurgie = hypoglycémie fréquente — perfusion glucosée 5 % 100 mL/kg/j"
        ],
        "pitfalls": [
          "Ne jamais opérer avant correction biologique — alcalose + anesthésie = risque arrêt cardiaque",
          "Extubation : ne pas extuber endormi — nourrisson doit être éveillé, pleurant, déglutissant",
          "Vomissements post-op fréquents : ne pas recalibrer/renouveler SNG trop agressive — oedème pylore normal J0–J1",
          "Hypoglycémie : surveiller glycémie capillaire toutes les 2h en SSPI — perfusion glucosée 5 % en continu"
        ],
        "references": [
          "[Complément – Source: ADARPEF, Anesthésie néonatale et nourrisson, 2023]",
          "[Complément – Source: APSA, Pyloric Stenosis Perioperative Management, 2022]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 3 Néonatologie/Pédiatrie, 2025-2026]"
        ]
      }
    }
  }$s3pylore$::jsonb,
  '["paeds","airway","difficult_airway"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 10. plaie_oeil_perforante_paed
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'plaie_oeil_perforante_paed',
  'chirurgie-pediatrique',
  '["chirurgie-pediatrique"]'::jsonb,
  '{"fr":"Plaie oculaire perforante – Enfant (Estomac plein)","en":"Open globe injury – Paediatric (Full stomach)","pt":"Ferida ocular perfurante – Pediátrica (Estômago cheio)"}'::jsonb,
  '{"fr":["oeil perforant","traumatisme oculaire ouvert","globe ouvert","plaie pénétrante oeil","traumatisme oculaire enfant"],"en":["open globe","penetrating eye injury","eye trauma child","ruptured globe"],"pt":["olho perfurado","traumatismo ocular aberto","globo ocular aberto"]}'::jsonb,
  $s3oeilouv${
    "quick": {
      "fr": {
        "preop": [
          "URGENCE CHIRURGICALE — estomac plein (traumatisme récent, douleur = vidange gastrique retardée)",
          "ÉVITER TOUTE ÉLÉVATION DE PRESSION INTRAOCULAIRE (PIO) : pas de pleurs, pas de Valsalva, pas de toux, protéger l'oeil (cupule rigide)",
          "Analgésie IV : paracétamol 15 mg/kg IV (non sédatif, ne masque pas la PIO), éviter kétamine seule (élève PIO légèrement)",
          "Discuter intubation éveillée vs RSI modifié — évaluation expertise de l'anesthésiste",
          "Prémédication si agité : midazolam 0,05 mg/kg IV lent OU dexmédétomidine — améliore coopération sans élever PIO"
        ],
        "intraop": [
          "RSI MODIFIÉ obligatoire (estomac plein) — éviter succinylcholine : augmente PIO de 6–8 mmHg par fasciculations",
          "Protocole Saint-Pierre globe ouvert : fentanyl 2 µg/kg lentement (60 s) + propofol 3–4 mg/kg + rocuronium 1,2 mg/kg — délai intubation 90 s",
          "Propofol : diminue PIO — préférable à la kétamine seule pour induction globe ouvert",
          "Pas de toux à l'induction : profondeur d'anesthésie suffisante avant laryngoscopie, lignocaïne 1,5 mg/kg IV 2 min avant",
          "TIVA propofol + remifentanil : maintien PIO basse, champ clair, éveil rapide",
          "ÉVITER N2O : risque d'introduction d'air dans l'oeil si bulle de gaz intraoculaire utilisée par chirurgien",
          "Extubation DOUCE : éviter toux — extubation profonde optionnelle si voie aérienne libre confirmée, lidocaïne IV 1 mg/kg 2 min avant"
        ],
        "postop": [
          "PONV prophylaxie rigoureuse : ondansétron 0,1 mg/kg + dexaméthasone 0,15 mg/kg — vomissements augmentent PIO",
          "Analgésie : paracétamol 15 mg/kg/6h + ibuprofène 10 mg/kg/8h per os si > 3 mois",
          "Protection oculaire : cupule ou pansement oculaire rigide — ne jamais appuyer sur l'oeil",
          "Hospitalisation 1–2 nuits : surveillance confort, état neurologique si traumatisme crânien associé"
        ],
        "red_flags": [
          "Toux ou Valsalva à l'induction : risque expulsion contenu vitréen — ne jamais procéder si enfant non coopérant sans prémédication",
          "Succinylcholine utilisée : contraction des muscles extra-oculaires = élévation PIO transitoire — éviter absolument",
          "N2O et bulle de gaz intraoculaire (SF6 ou C3F8) utilisée par chirurgien : expansion gazeuse → hypertonie intraoculaire sévère",
          "Traumatisme crânien associé : exclure HTIC avant anesthésie — TDM cérébral si LOC ou GCS < 15"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "rsi_induction_diminue_PIO"},
          {"drug_id": "rocuronium", "indication_tag": "rsi_curarisation_pas_de_fasciculations"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_intraop_lentement"},
          {"drug_id": "lidocaine", "indication_tag": "prevention_toux_intubation"},
          {"drug_id": "remifentanil", "indication_tag": "tiva_maintenance_avec_propofol"},
          {"drug_id": "sugammadex", "indication_tag": "decurarisation_rapide_si_CICV"},
          {"drug_id": "ondansetron", "indication_tag": "ponv_prophylaxie_rigoureuse"},
          {"drug_id": "dexamethasone", "indication_tag": "ponv_et_antiinflammatoire"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "midazolam", "indication_tag": "premedication_si_agite"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "PIO normale : 10–20 mmHg — succinylcholine l'élève de 6–8 mmHg par fasciculations + contraction muscles extra-oculaires",
          "Rocuronium 1,2 mg/kg : délai d'action 60–90 s, comparable à succinylcholine — gold standard RSI globe ouvert",
          "Propofol : diminue PIO de 15–30 % par rapport à la valeur de base — choix idéal pour induction globe ouvert",
          "TIVA propofol + remifentanil : maintien PIO basse, champ chirurgical net, extubation rapide et douce",
          "Lidocaïne IV 2 min avant laryngoscopie : atténue réflexe laryngé et élévation PIO lors de l'intubation"
        ],
        "pitfalls": [
          "Kétamine seule : légère élévation PIO — à éviter si globe ouvert, acceptable si hypotension associée (dissociation)",
          "Aspiration nasogastrique pré-induction : CONTRE-INDIQUÉE dans ce contexte (provoque vomissements, élève PIO)",
          "N2O absolu contraindication si chirurgien planifie bulle de gaz : toujours demander avant début de l'acte",
          "Extubation agitée : le plus grand risque — profondeur anesthésie, lidocaïne IV, extubation dans positions stables"
        ],
        "references": [
          "[Complément – Source: SFAR, Anesthésie ophtalmologie urgente, 2022]",
          "[Complément – Source: American Academy of Ophthalmology, Open globe management, 2021]",
          "[Complément – Source: ADARPEF, Globe ouvert pédiatrique, 2023]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 3 Pédiatrie, 2025-2026]"
        ]
      }
    }
  }$s3oeilouv$::jsonb,
  '["paeds","airway","difficult_airway","ponv"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 11. strabisme_paed
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'strabisme_paed',
  'chirurgie-pediatrique',
  '["chirurgie-pediatrique"]'::jsonb,
  '{"fr":"Chirurgie du strabisme – Enfant","en":"Strabismus surgery – Paediatric","pt":"Cirurgia do estrabismo – Pediátrica"}'::jsonb,
  '{"fr":["strabisme","correction oculomotrice","myopexie","recession-plicature muscles oculomoteurs"],"en":["strabismus surgery","squint surgery","eye muscle surgery","extraocular muscle surgery"],"pt":["cirurgia do estrabismo","cirurgia dos músculos oculares","miopia corretiva"]}'::jsonb,
  $s3strab${
    "quick": {
      "fr": {
        "preop": [
          "PONV risque le plus élevé en chirurgie pédiatrique (60–80 % sans prophylaxie) — prémédication adaptée",
          "Jeûne 6h/4h/2h — procédure ambulatoire standard",
          "Évaluer syndrome potentiel de la jonction neuromusculaire (malignant hyperthermia susceptibility) si histoire familiale",
          "Pas d'antibioprophylaxie systématique"
        ],
        "intraop": [
          "PONV prophylaxie DOUBLE obligatoire : ondansétron 0,1 mg/kg + dexaméthasone 0,15 mg/kg",
          "TIVA propofol préférée à sévoflurane : réduction PONV de 50 % supplémentaire vs inhalatoire",
          "Masque laryngé — ventilation spontanée — durée 30–60 min",
          "Réflexe oculo-cardiaque (OCR) : bradycardie sur traction du muscle droit médial — DIRE AU CHIRURGIEN D'ARRÊTER LA TRACTION, attendre normalisation FC",
          "Traitement OCR sévère (asystolie ou bradycardie < 60 % de la FC de base) : atropine 0,02 mg/kg IV",
          "Pas de N2O dans certains centres (PONV) — O2/air pur",
          "Analgésie : paracétamol 15 mg/kg IV — éviter AINS en péri-opératoire (saignement oculaire)"
        ],
        "postop": [
          "SSPI : évaluation PONV prioritaire — antiémétique de secours si vomissements : ondansétron complémentaire 0,1 mg/kg",
          "Analgésie légère : paracétamol 15 mg/kg/6h — douleur oculaire modérée attendue",
          "Ambulatoire le jour même — critères : PONV contrôlé, analgésie efficace, enfant bien éveillé",
          "Consignes : collyre antibiotique selon prescription chirurgicale, protection oeil opéré"
        ],
        "red_flags": [
          "OCR (réflexe oculo-cardiaque) : bradycardie soudaine à la traction musculaire — ne pas hésiter à demander arrêt traction en premier",
          "PONV réfractaire : escalade thérapeutique — dropéridol 0,025 mg/kg IV si double prophylaxie insuffisante (hors protocole standard)",
          "Malignant hyperthermia (MH) : si susceptibilité connue — TIVA propofol + NDNMB (pas de sévoflurane ni succinylcholine)",
          "Diplopie post-op immédiate : normale si muscle récemment opéré — information parents, résolution spontanée"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "tiva_reduction_ponv"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_intraop"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ondansetron", "indication_tag": "ponv_prophylaxie_double"},
          {"drug_id": "dexamethasone", "indication_tag": "ponv_prophylaxie_double"},
          {"drug_id": "atropine", "indication_tag": "traitement_OCR_bradycardie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "OCR (réflexe oculo-cardiaque) : arc réflexe trigémino-cardiaque — nerf ophtalmique (V1) → noyau moteur dorsal du vague → bradycardie",
          "Incidence OCR 50–90 % lors de chirurgie strabisme sans atropine prophylactique — atropine prophylactique non systématique (effets secondaires)",
          "TIVA propofol : réduction PONV de 25 % vs halogénés isolés — en complément de la double prophylaxie antiémétique",
          "Susceptibilité MH : si histoire familiale, proscrire sévoflurane/desflurane et succinylcholine — TIVA propofol + curarisation non dépolarisante seule"
        ],
        "pitfalls": [
          "Ne jamais administrer atropine IV avant traction musculaire : tachycardie + OCR = réponse paradoxale incontrôlable",
          "Sévoflurane et strabisme : utiliser si TIVA impossible — doublez la prophylaxie antiémétique",
          "OCR récidivant après traitement : réévaluation profondeur anesthésie (OCR moins fréquent à profondeur adéquate)"
        ],
        "references": [
          "[Complément – Source: ADARPEF, PONV pédiatrique et strabisme, 2022]",
          "[Complément – Source: SFAR, Réflexe oculo-cardiaque, conduite à tenir, 2022]",
          "[Complément – Source: Apfel CC, PONV risk scoring and prevention, 2004]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 3 Pédiatrie, 2025-2026]"
        ]
      }
    }
  }$s3strab$::jsonb,
  '["paeds","ponv"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 12. nec_enterocolite_necrosante
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'nec_enterocolite_necrosante',
  'reanimation',
  '["reanimation","chirurgie-pediatrique"]'::jsonb,
  '{"fr":"Entérocolite nécrosante du nouveau-né – Chirurgie urgente (NEC)","en":"Neonatal necrotising enterocolitis – Emergency surgery (NEC)","pt":"Enterocolite necrosante neonatal – Cirurgia de urgência (NEC)"}'::jsonb,
  '{"fr":["NEC","entérocolite néonatale","péritonite néonatale","perforation intestinale nouveau-né"],"en":["NEC","necrotising enterocolitis","neonatal peritonitis","intestinal perforation neonate"],"pt":["NEC","enterocolite necrosante neonatal","peritonite neonatal"]}'::jsonb,
  $s3nec${
    "quick": {
      "fr": {
        "preop": [
          "Prématuré souvent (< 32 SA) — souvent déjà intubé-ventilé-catéché en néonatologie",
          "Classification Bell III (chirurgicale) : perforation, pneumopéritoine, ascite, défaillance multiviscérale",
          "Bilan : NFS, coagulation, gaz du sang, ionogramme, groupe-RAI — anémie et CIVD fréquentes",
          "Stabilisation préop : correction acidose (bicarbonate si pH < 7.2), vasopresseurs (dopamine, dobutamine — hors formulaire anesthésiste), sang si Hb < 10 g/dL",
          "Antibioprophylaxie : céfazoline 50 mg/kg + métronidazole 15 mg/kg — péritonite néonatale",
          "Transport sécurisé en incubateur chauffant si nécessaire"
        ],
        "intraop": [
          "Anesthésie TIVA adaptée au prématuré : morphine 0,05–0,1 mg/kg + midazolam 0,05–0,1 mg/kg IV si non déjà intubé",
          "Si non intubé : induction kétamine 1–2 mg/kg IV + rocuronium 1 mg/kg + intuber délicatement (laryngoscope Miller 0–1)",
          "Maintien : morphine 0,02 mg/kg/h + midazolam 0,02 mg/kg/h en continu — NO halogénés (dépression cardiovasculaire sévère prématuré)",
          "Vasopresseurs disponibles : dopamine ou dobutamine déjà en cours selon réanimateur référent",
          "Prévention hypothermie CRITIQUE : couverture chauffante, bouillotte, liquides réchauffés, T° salle > 26°C",
          "Glycémie : surveillance /h — hypoglycémie néonatale fréquente — perfusion glucosée 5 % 100 mL/kg/j",
          "Saignement possible (intestin nécrosé) : pRBC groupés O- disponibles, ratio 1:1:1 si MTP"
        ],
        "postop": [
          "Retour en néonatologie (NICU) sous ventilation mécanique",
          "Surveillance : glycémie, ionogramme, gaz du sang, Hb, coagulation toutes les 4h",
          "Nutrition parentérale totale (NPT) débutée si non : amino-acides + lipides + glucides",
          "Stomie de décharge si réalisée : surveillance débit, équilibre hydro-électrolytique",
          "Sevrage vasopresseurs progressif si hémodynamique stable > 6h",
          "Réintervention possible : iléostomie de fermeture à 6–8 semaines si évolution favorable"
        ],
        "red_flags": [
          "Instabilité hémodynamique peropératoire : remplissage SSI 10 mL/kg + pRBC si Hb < 10 + vasopresseurs — appel néonatologiste",
          "Hypothermie peropératoire (T° < 36°C) : mortalité multipliée — réchauffement actif prioritaire",
          "CIVD : transfusion massive pRBC + PFC + plaquettes ratio 1:1:1 — fibrinogène si < 1 g/L",
          "Arrêt cardiaque peropératoire néonatal : RCP 120/min, adrénaline 0,01 mg/kg IV, évaluation volémie"
        ],
        "drugs": [
          {"drug_id": "ketamine", "indication_tag": "induction_si_non_intube"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation_si_induction"},
          {"drug_id": "morphine", "indication_tag": "sedation_analgesia_perop_neonat"},
          {"drug_id": "midazolam", "indication_tag": "sedation_perop_neonat"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_postop_neonat"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "NEC stade III Bell (chirurgicale) : pneumopéritoine = perforation = urgence — drainage péritonéal percutané alternative aux très prématurés instables (< 750 g)",
          "Prématuré et halogénés : dépression cardiovasculaire profonde — TIVA morphine + midazolam préférable",
          "Hypothermie : principale cause de mortalité peropératoire en néonatologie — salle à 26°C + toutes mesures de réchauffement",
          "CIVD néonatale : consommation rapide facteurs — fibrinogène effondré, PT/TCA allongés — traitement agressif précoce"
        ],
        "pitfalls": [
          "Ne jamais utiliser halogénés comme agent principal chez prématuré hémodynamiquement précaire",
          "Dose analgésique morphine : 0,05 mg/kg/h chez prématuré (CYP2D6 immature) — demi-vie prolongée, accumulation",
          "Transport en incubateur : maintenir monitoring, perfusions, ventilation pendant transfert — ne jamais transférer sans accompagnant qualifié"
        ],
        "references": [
          "[Complément – Source: ADARPEF, Anesthésie néonatale chirurgie urgente, 2023]",
          "[Complément – Source: Bell MJ, NEC staging criteria, Ann Surg, 1978]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Néonatologie/Réanimation, 2025-2026]"
        ]
      }
    }
  }$s3nec$::jsonb,
  '["paeds","icu","airway"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 13. canal_arteriel_permeable
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'canal_arteriel_permeable',
  'reanimation',
  '["reanimation","chirurgie-pediatrique"]'::jsonb,
  '{"fr":"Ligature du canal artériel persistant (CAP) – Nouveau-né / Prématuré","en":"Patent ductus arteriosus (PDA) ligation – Neonate / Premature","pt":"Ligadura do canal arterial persistente (CAP) – Neonato / Prematuro"}'::jsonb,
  '{"fr":["CAP","canal artériel","ligature PDA","ductus arteriosus persistant"],"en":["PDA ligation","patent ductus arteriosus","ductus ligation","PDA closure"],"pt":["ligadura do canal arterial","CAP","ductus arteriosus persistente"]}'::jsonb,
  $s3pda${
    "quick": {
      "fr": {
        "preop": [
          "Très prématuré (24–34 SA) — souvent déjà intubé-ventilé en NICU — ligature si traitement médical (ibuprofène/indométacine IV) a échoué",
          "Échographie cardiaque préopératoire obligatoire : confirmer CAP, exclure malformation associée, évaluer shunt, PAP",
          "Voie artérielle ombilicale ou radiale existante — monitoring invasif indispensable",
          "Sonde urinaire en place — surveillance diurèse",
          "Bilan biologique récent (< 2h) : NFS, gaz du sang, ionogramme, glycémie"
        ],
        "intraop": [
          "Procédure au lit (NICU) ou au bloc opératoire selon logistique — transport en incubateur si bloc",
          "TIVA : fentanyl 5–10 µg/kg + midazolam 0,05 mg/kg (ou morphine 0,1 mg/kg) — pas de modification ventilateur si déjà en place",
          "Curarisation : vecuronium 0,1 mg/kg IV (ou rocuronium 0,6 mg/kg) — éviter succinylcholine prématuré",
          "Position décubitus latéral droit, thoracotomie gauche postéro-latérale mini — voie aérienne stable maintenue",
          "Clip vasculaire ou ligature — confirmation clippage : disparition du souffle + écho peropératoire si disponible",
          "Prévention hypothermie CRITIQUE : T° salle > 26°C, couverture chauffante, liquides réchauffés, couvrir tête",
          "Glycémie peropératoire : toutes les 30 min — perfusion glucosée 5–10 % continue"
        ],
        "postop": [
          "Retour immédiat en NICU sous ventilation mécanique — pas d'extubation peropératoire en routine",
          "Contrôle écho cardiaque H+4 : vérifier fermeture complète, PAP, fonction VG",
          "Analgésie post-op : morphine 0,01–0,02 mg/kg/h IV en continu ± paracétamol 15 mg/kg/6h IV",
          "Surveillance PaO2, SpO2, hémodynamique — sevrage progressif vasopresseurs si stabilisé",
          "Nutrition parentérale maintenue — reprise entérale selon tolérance digestive"
        ],
        "red_flags": [
          "Clippage accidentel de l'aorte descendante ou artère pulmonaire gauche : disparition des pouls fémoraux, SpO2 chute — urgence chirurgicale",
          "Hémorragie sur lésion intercostale ou vasculaire : saignement abdomino-thoracique — pRBC O- disponibles, chirurgie hémostatique",
          "Instabilité hémodynamique peropératoire (fréquente) : remplissage SSI 10 mL/kg, pRBC si Hb < 10, dopamine/dobutamine",
          "Chylothorax post-op (lésion canal thoracique) : épanchement liquidien blanc/laiteux — régime sans graisses, parfois chirurgie"
        ],
        "drugs": [
          {"drug_id": "fentanyl", "indication_tag": "sedation_analgesia_perop_neonat"},
          {"drug_id": "midazolam", "indication_tag": "sedation_perop_neonat"},
          {"drug_id": "morphine", "indication_tag": "analgesia_postop_continue"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_complementaire"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "CAP prématuré : shunt gauche-droite important → surcharge pulmonaire → hypoxémie → défaillance cardiaque — fermeture par ibuprofène/indométacine (66 % succès), sinon chirurgie",
          "Ligature au lit (NICU) : évite transport risqué — nécessite éclairage, matériel chirurgical, anesthésiste, cardiologue pédiatrique présents",
          "Fentanyl TIVA 5–10 µg/kg : dose de charge, puis 2–5 µg/kg/h — préserve mieux hémodynamique que propofol chez le prématuré",
          "Hypothermie peropératoire neonat : mortalité corrélée — salle 26–28°C + matelas chauffant + couvrir la tête (35 % des pertes de chaleur)"
        ],
        "pitfalls": [
          "Ne jamais clipper avant confirmation échographique ou signal (disparition souffle) — risque de clipper aorte descendante",
          "Succinylcholine chez le prématuré : hypertraquémie potentielle, bradycardie — utiliser vecuronium ou rocuronium",
          "Fentanyl demi-vie prolongée chez prématuré (CYP immature) — accumulation si doses répétées — surveiller sédation post-op"
        ],
        "references": [
          "[Complément – Source: ADARPEF, Anesthésie prématuré et CAP, 2023]",
          "[Complément – Source: ESC/AEPC, Patent ductus arteriosus management, 2021]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Néonatologie NICU, 2025-2026]"
        ]
      }
    }
  }$s3pda$::jsonb,
  '["paeds","icu","cardiac"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 14. sedation_imagerie_paed
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'sedation_imagerie_paed',
  'chirurgie-pediatrique',
  '["chirurgie-pediatrique"]'::jsonb,
  '{"fr":"Sédation pour imagerie – Enfant (IRM / Scanner)","en":"Sedation for imaging – Paediatric (MRI / CT)","pt":"Sedação para imagiologia – Pediátrica (RM / TC)"}'::jsonb,
  '{"fr":["anesthésie IRM enfant","sédation scanner pédiatrique","NORA pédiatrique","anesthésie hors bloc opératoire"],"en":["paediatric MRI sedation","paediatric CT sedation","procedural sedation imaging","NORA paediatric"],"pt":["sedação RM pediátrica","sedação TAC pediátrica","anestesia imagiologia pediátrica"]}'::jsonb,
  $s3imgpaed${
    "quick": {
      "fr": {
        "preop": [
          "NORA (Non-OR Anaesthesia) — environnement distant : IRM ou scanner — matériel et médicaments d'urgence vérifiés",
          "IRM : AUCUN matériel ferromagnétique autorisé — moniteurs et perfuseurs IRM-compatibles OBLIGATOIRES",
          "Évaluation : âge, poids, ATCD (OSAS, allergie, difficultés d'intubation antérieures), jeûne",
          "Jeûne standard 6h/4h/2h — vérification documentée avant entrée en salle IRM",
          "Produit de contraste IV prévu : vérifier fonction rénale (créatinine) si IRM gadolinium ou scanner iodé"
        ],
        "intraop": [
          "IRM propofol TIVA : induction 2–3 mg/kg IV + entretien 6–10 mg/kg/h — titrée sur mouvements",
          "Masque laryngé IRM-compatible si ventilation assistée nécessaire (> 30 min, OSAS, jeune nourrisson)",
          "Monitoring IRM-compatible : SpO2, FC, PNI — capnographie nasale EtCO2 si disponible (ventilation spontanée)",
          "Scanner (TC) urgence : kétamine 1–2 mg/kg IM acceptable si pas de VVP — maintien réflexes + analgésie",
          "Alternative douce (coopérant partiel) : dexmédétomidine 2–3 µg/kg intranasal 30 min avant + propofol si insuffisant",
          "Tube prolongateur IV 3–5 m : anesthésiste hors champ magnétique IRM — communication visuelle + interphone",
          "Durée : IRM 30–90 min, scanner 5–15 min"
        ],
        "postop": [
          "Réveil rapide avec propofol : enfant éveillé en 10–15 min après arrêt",
          "SSPI ou salle de réveil annexe : surveillance 30 min minimum — SpO2, état de conscience, vomissements",
          "Analgésie si douleur (procédure éventuelle associée) : paracétamol 15 mg/kg",
          "Ambulatoire le jour même — sortie accompagnée obligatoire",
          "Consignes : activité normale dès lendemain, pas de conduite accompagnant J0"
        ],
        "red_flags": [
          "Obstruction voie aérienne en IRM : accès limité dans le tunnel — avoir masque laryngé IRM-compatible à portée, plan sortie rapide de l'aimant",
          "Stimulation magnétique corps étranger métallique (implant dentaire, pace-maker) : contre-indication IRM — vérifier questionnaire métal avant",
          "Arrêt cardiaque en IRM : SORTIR LE PATIENT DE L'AIMANT AVANT RCP — défibrillateur et matériel RCP hors zone magnétique",
          "PONV post-kétamine : ondansétron 0,1 mg/kg IV préventif si kétamine utilisée",
          "Hypoglycémie (nourrisson) : glycémie si jeûne > 4h chez < 6 mois"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "tiva_sedation_imagerie"},
          {"drug_id": "ketamine", "indication_tag": "sedation_scanner_urgence_ou_IM"},
          {"drug_id": "midazolam", "indication_tag": "premedication_anxiolyse"},
          {"drug_id": "ondansetron", "indication_tag": "ponv_prophylaxie_si_ketamine"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_post_procedure"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Zone magnétique IRM : 5 Gauss line = zone de danger ferromagnétique — baliser l'espace, vérifier chaque équipement avant entrée",
          "TIVA propofol en NORA : pompe seringue programmée + prolongateur 5 m — anesthésiste positionné dans la salle de contrôle adjacente",
          "Kétamine IM (scanner urgence sans VVP) : 4–6 mg/kg IM — délai 5–10 min, durée 20 min — maintien réflexes protecteurs, possible hypersalivation (atropine 0,02 mg/kg IM si nécessaire)",
          "Dexmédétomidine intranasale : alternative douce — 2–3 µg/kg IN 30 min avant — sédation légère à modérée, maintien coopération partielle — ne suffit pas pour IRM longue"
        ],
        "pitfalls": [
          "Matériel non IRM-compatible : risque projectile (laryngoscope standard, stéthoscope) — JAMAIS introduire métal standard dans zone IRM",
          "Monitoring SpO2 en IRM : mouvement = artéfact + chauffage capteur possible — utiliser câble prolongateur IRM-compatible",
          "Propofol et douleur injection : anesthésique local (lidocaïne 0,5 mg/kg IV) 30 sec avant propofol dans petite veine — réduit la douleur d'injection"
        ],
        "references": [
          "[Complément – Source: ADARPEF, NORA pédiatrique — sédation pour imagerie, 2022]",
          "[Complément – Source: ESA, Non-operating room anaesthesia guidelines, 2021]",
          "[Complément – Source: ACR, American College of Radiology, MRI safety guidelines, 2023]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 3 Pédiatrie, 2025-2026]"
        ]
      }
    }
  }$s3imgpaed$::jsonb,
  '["paeds","airway"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

COMMIT;
