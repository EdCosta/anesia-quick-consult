BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTEUR 2 — Digestif / Gynécologie / Urologie / Obstétrique
-- Source : Fascicule Protocoles PGs 2025-2026, CHU Saint-Pierre (Bruxelles)
-- International guideline complements labelled [Complément – Source: XXX, Année]
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── G. CHIRURGIE DIGESTIVE ──────────────────────────────────────────────

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'chirurgie_bariatrique',
  'chirurgie-generale',
  '["chirurgie-generale","gastroenterologie"]'::jsonb,
  '{"fr":"Chirurgie bariatrique (Sleeve gastrectomie / Bypass gastrique / SASI)","en":"Bariatric surgery (Sleeve gastrectomy / Gastric bypass / SASI)","pt":"Cirurgia bariátrica (Sleeve gastrectomia / Bypass gástrico / SASI)"}'::jsonb,
  '{"fr":["sleeve gastrectomie","bypass gastrique","GBP","SASI","chirurgie obésité","anneau gastrique","chirurgie bariatrique"],"en":["sleeve gastrectomy","gastric bypass","RYGB","bariatric surgery","obesity surgery"],"pt":["sleeve gastrectomia","bypass gástrico","cirurgia bariátrica","cirurgia obesidade"]}'::jsonb,
  $ba${
    "quick": {
      "fr": {
        "preop": [
          "Évaluation pluridisciplinaire préalable (Clinique du Poids Idéal) ; calcul poids idéal théorique (H: T(cm)-100-10% / F: T-105-10%) et poids corrigé ; dosage médicaments selon poids : réel (suxaméthonium, ATB), idéal (curares non dépol, morphiniques), corrigé (lidocaïne, kétamine, propofol).",
          "Évaluation anesthésique spécifique : recherche IOT difficile, VMD difficile (raser barbe) ; arrêt GLP-1 (Ozempic, Wegovy) 1 semaine avant l'intervention ; éviter BZD (risque désaturation post-op) ; garder IPP ; SAOS appareillé → CPAP à apporter.",
          "Monitoring peropératoire : brassard TA adapté au tour de bras (> 41 cm = cuisse), VVP 18G, Entropie/BIS, SNG in/out, monitoring curarisation (TOF) systématique.",
          "Installation RAMP position (tête et thorax surélevés 30°) ; vidéolaryngoscopie systématiquement recommandée (Airway Challenge en obésité) ; bas de compression intermittente.",
          "[Complément – IFSO/ERAS Bariatric Surgery Guidelines, 2021] Optimiser préopératoirement : arrêter tabac, perte de poids préop si foie volumineux (régime hypocalorique 2 semaines), HbA1c < 8%, bilan cardiovasculaire complet."
        ],
        "intraop": [
          "Préoxygénation : position proclive 30° + pression positive 10 cmH2O (CPAP) ou Optiflow Nasal (débit 60 L/min) → EtO2 > 90%.",
          "Induction (OFA épargne morphinique) : lidocaïne 1 mg/kg + kétamine 0,5 mg/kg + dexaméthasone 8 mg + propofol 3 mg/kg (poids corrigé) + esméron 0,6-1 mg/kg (poids réel) ± sufentanil 5-10 µg si RGO sévère (induction séquence rapide).",
          "Entretien : sévoflurane ou propofol AIVOC + dexdétomidine 0,2-0,5 µg/kg/h + lidocaïne IVL 1,5 mg/kg/h (poids idéal) + kétamine 0,2 mg/kg/h + magnésium 40 mg/kg IV en 20 min ; esméron en continu (curarisation profonde PTC=2).",
          "Ventilation protectrice : Vt 6-8 ml/kg POIDS IDÉAL, PEEP 6-8 cmH2O, FR adaptée EtCO2, recrutements alvéolaires toutes les 30 min ; paracétamol 1g + AINS 1 dose STOP + ondansétron 4 mg 30 min avant fin ; sonde Faucher positionnée sous contrôle visuel (chirurgien, test étanchéité).",
          "Antibioprophylaxie : céfazoline 3g (> 120 kg) ou 4g (BMI > 40 kg/m²) IV 30-60 min avant incision ; cristalloïdes 100 ml/h (perfusion minimale)."
        ],
        "postop": [
          "Position semi-assise dès la SSPI ; CPAP reprendre immédiatement (6 mois) si SAOS appareillé.",
          "Analgésie post-op OFA : lidocaïne 1 mg/kg/h IV × 24h + dexdétomidine 0,1 µg/kg/h × 6-12h + paracétamol 1g/6h IV puis PO + tramadol 100 mg + litican 50 mg /6h ; dipidolor/morphine IV titré SSPI si EVA > 4.",
          "Thromboprophylaxie : fraxiparine SC 4h post-op (10 jours ; 30 jours si ATCD TEV) + bas de compression 24h post-op ; pantomed 40 mg IV (30j GBP / 90j SASI/sleeve/redo).",
          "Critères surveillance nocturne SSPI : BMI > 45, SAOS sans CPAP, SAOS sévère avec épisodes désaturation < 90% sous CPAP, hautes doses opioïdes per/post-op.",
          "Réalimentation : liquides clairs J0 soir (sleeve/GBP), liquides J1 ; [Complément – ERAS Bariatric 2021] pas de sonde vésicale prolongée, mobilisation J0."
        ],
        "red_flags": [
          "Désaturation per- ou post-op (SAOS) : CPAP immédiate + repositionnement proclive + SpO2 continue.",
          "Fistule anastomotique post-sleeve/GBP (tachycardie + fièvre J2-J5) : TDM abdomino-pelvien urgent + reprise chirurgicale ou drainage radiologique.",
          "Hémorragie gastrique post-op (hématémèse ou méléna) : fibroscopie urgente.",
          "Embolie pulmonaire (dyspnée + désaturation + TA basse) : angioTDM thoracique urgent ; thromboprophylaxie renforcée si ATCD."
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction_OFA"},
          {"drug_id": "ketamine", "indication_tag": "analgesie_adjuvant"},
          {"drug_id": "lidocaine", "indication_tag": "IVL_perop_postop"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation_profonde"},
          {"drug_id": "sugammadex", "indication_tag": "reversal"},
          {"drug_id": "dexamethasone", "indication_tag": "PONV_anti_inflammatoire"},
          {"drug_id": "ondansetron", "indication_tag": "PONV"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie_poids_adapte"},
          {"drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie"},
          {"drug_id": "morphine", "indication_tag": "rescue_SSPI"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Le protocole OFA (opioid-free anesthesia) de St-Pierre combine lidocaïne IVL + kétamine + dexdétomidine + magnésium pour réduire au maximum les opioïdes peropératoires, ce qui améliore la récupération post-op et réduit le risque d'apnée du sommeil post-extubation.",
          "La curarisation profonde (PTC=2, train-of-four count 0-1) est recommandée pour faciliter la chirurgie laparoscopique bariatrique (pression insufflation plus basse, meilleure exposition) : sugammadex 4 mg/kg pour reversal.",
          "La ventilation protectrice avec Vt calculé sur le poids idéal (et non le poids réel) est cruciale : la compliance pulmonaire de l'obèse est calculée sur la taille, pas sur le poids, et l'hyperinflation pulmonaire aggrave les lésions induites par ventilation."
        ],
        "pitfalls": [
          "Calculer le Vt sur le poids réel (140 kg) plutôt que le poids idéal (70 kg) → barotraumatisme.",
          "Arrêter le GLP-1 trop tard (< 7j) : vidange gastrique retardée → risque d'inhalation lors de l'induction, même à jeun.",
          "Ne pas surveiller nocturne en SSPI les patients BMI > 45 ou SAOS sévère : désaturation nocturne progressive peut être fatale."
        ],
        "references": [
          {"source": "IFSO/ERAS Society — Bariatric Surgery Guidelines", "year": 2021, "note": "Protocoles préop, intraop, postop pour sleeve et bypass."},
          {"source": "SFAR — Anesthésie en chirurgie bariatrique", "year": 2022, "note": "OFA, ventilation protectrice, monitoring curarisation."},
          {"source": "ESA — Perioperative Glycemia Management Guidelines", "year": 2019, "note": "Contrôle glycémique peropératoire."}
        ]
      }
    }
  }$ba$::jsonb,
  '["ponv","difficult_airway"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'cholecystectomie_laparoscopique',
  'gastroenterologie',
  '["gastroenterologie","chirurgie-generale"]'::jsonb,
  '{"fr":"Cholécystectomie laparoscopique","en":"Laparoscopic cholecystectomy","pt":"Colecistectomia laparoscópica"}'::jsonb,
  '{"fr":["cholécystectomie","cholécystite","calculs vésiculaires","ablation vésicule biliaire","vésiculectomie"],"en":["laparoscopic cholecystectomy","cholecystitis","gallstone surgery","lap chol"],"pt":["colecistectomia laparoscópica","colecistite","cálculos biliares"]}'::jsonb,
  $ch${
    "quick": {
      "fr": {
        "preop": [
          "Cholécystite aiguë : biologie + enzymes hépatiques, amylase, lipase, bilirubine ; échographie abdominale confirmant les calculs ou l'inflammation.",
          "Bilan standard sinon ; pas d'antibioprophylaxie sauf cholécystite < 6 semaines d'évolution.",
          "Jeûne standard ; AINS préopératoires oraux si disponibles (ibuprofène ou kétorolac PO avant l'induction).",
          "[Complément – ERAS Biliary Surgery, 2020] Charge glucidique préopératoire possible si pas de diabète déséquilibré (200 ml × 2 la veille + 200 ml × 1 2h avant).",
          "Groupe/RAI non systématique sauf comorbidités ou anticoagulation préexistante."
        ],
        "intraop": [
          "Induction : sufentanil 0,2 µg/kg + propofol 2 mg/kg + rocuronium 0,6 mg/kg ; AG + IOT ou LMA selon habitude.",
          "Entretien : sévoflurane ou propofol AIVOC ; curarisation modérée (TOF ≥ 1) si LMA.",
          "Analgésie multimodale : paracétamol 1g IV + AINS (kétorolac 30 mg ou ibuprofène 800 mg IV) au début de l'intervention + infiltration des trocarts (ropivacaïne 0,375% 10 ml chacun).",
          "Vidange estomac par sonde nasogastrique en fin d'intervention (retrait avant réveil).",
          "Antibioprophylaxie si cholécystite aiguë : céfazoline 2g IV avant incision."
        ],
        "postop": [
          "One Day : sortie après minimum 6h de surveillance post-op si pas de complication.",
          "Reprise alimentation : liquides clairs 3h post-op → TBB à 4h → régime ordinaire J1.",
          "Analgésie domicile : paracétamol 1g/6h + ibuprofène 400 mg/8h × 5j.",
          "Critères de sortie : douleur < 4/10, nausées absentes, alimentation tolérée, patient autonome.",
          "[Complément – SAGES Cholecystectomy Guidelines, 2022] Pathologies associées (lithiase de la voie principale) doivent être traitées si possible dans le même temps opératoire (CPRE per-op ou cholangiographie intraopératoire)."
        ],
        "red_flags": [
          "Conversion en laparotomie (triangle de Calot non disséquable, saignement) : annoncer + adapter le monitoring.",
          "Lésion voie biliaire principale (ictère post-op ou bile dans le drain) : imagerie urgente + avis chirurgical spécialisé.",
          "Bile spill (perforation vésicule, calculs intra-abdominaux libres) : informer chirurgien + lavage soigneux.",
          "Emphysème sous-cutané cervical (insufflation CO2 extra-péritonéale) : vérifier pression insufflation + position trocart."
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "sufentanil", "indication_tag": "analgesie_perop"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation"},
          {"drug_id": "sugammadex", "indication_tag": "reversal"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie"},
          {"drug_id": "ketorolac", "indication_tag": "analgesie"},
          {"drug_id": "ondansetron", "indication_tag": "PONV"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie_cholecystite"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "La cholécystectomie laparoscopique est la procédure de référence pour la lithiase symptomatique : morbidité faible, ambulatoire dans la majorité des cas.",
          "L'infiltration des trocarts (ropivacaïne ou lévobupivacaïne) + AINS préopératoires permettent une épargne opioïde significative et favorisent la sortie le jour même.",
          "La cholécystite aiguë nécessite une antibiothérapie préopératoire (céfazoline) et souvent une ATB post-op de 5 jours maximum selon la sévérité (Tokyo Guidelines)."
        ],
        "pitfalls": [
          "Injecter le propofol sans vérifier la perméabilité de la VVP : extravasation → nécrose sous-cutanée.",
          "Sous-estimer la douleur scapulaire droite post-laparoscopie (irradiation diaphragmatique CO2) : AINS + paracétamol efficaces, rassurer le patient.",
          "Oublier de vider l'estomac (SNG) avant laparoscopie en décubitus de Trendelenburg : régurgitation possible."
        ],
        "references": [
          {"source": "SAGES — Guidelines for Laparoscopic Cholecystectomy", "year": 2022, "note": "Technique, One Day, gestion complications."},
          {"source": "ERAS Society — Biliary Surgery", "year": 2020, "note": "Enhanced recovery cholécystectomie."},
          {"source": "Tokyo Guidelines — Acute Cholecystitis Management", "year": 2018, "note": "Sévérité, ATB, timing chirurgical."}
        ]
      }
    }
  }$ch$::jsonb,
  '[]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'colectomie_laparoscopique_racc',
  'gastroenterologie',
  '["gastroenterologie","chirurgie-generale"]'::jsonb,
  '{"fr":"Colectomie laparoscopique — Réhabilitation Améliorée Après Chirurgie (RACC)","en":"Laparoscopic colectomy — Enhanced Recovery After Surgery (ERAS)","pt":"Colectomia laparoscópica — Reabilitação Melhorada Após Cirurgia (ERAS)"}'::jsonb,
  '{"fr":["colectomie","hémicolectomie","résection colorectale","résection rectale","proctectomie","laparotomie digestive","RACC","ERAS digestif"],"en":["colectomy","colorectal resection","ERAS colorectal","laparoscopic bowel surgery"],"pt":["colectomia","ressecção colorectal","ERAS cólon","cirurgia intestinal"]}'::jsonb,
  $co${
    "quick": {
      "fr": {
        "preop": [
          "Charge glucidique préopératoire : 4 × 200 ml la veille + 2 × 200 ml J0 2h avant (exclure : diabétiques déséquilibrés, gastroparésie, reflux sévère) ; préparation mécanique du côlon uniquement pour la chirurgie rectale (hospitalisation la veille).",
          "Biologie complète + groupe/RAI + ECG + correction anémie (injectafer IV si délai ≥ 2 semaines, Hb < 13 g/dL H ou < 12 g/dL F).",
          "[Complément – ERAS Colonic Surgery, 2023] Information préopératoire patient (ERAS : mobilisation précoce, réalimentation, tube drain) ; kinésithérapie pré-op possible.",
          "Monitoring peropératoire : ECG + NIBP + SpO2 + Entropie + thermomètre + sonde vésicale + 1-2 VVP + KTA selon état + réchauffeurs + monitoring curarisation.",
          "Antibioprophylaxie : céfazoline 2g IV 30-60 min avant incision."
        ],
        "intraop": [
          "Épargne morphinique : magnésium 40 mg/kg IV en 20 min + kétamine 0,3 mg/kg bolus + lidocaïne IVL (bolus 1-1,5 mg/kg puis infusion 1,5 mg/kg/h) + alpha-agonistes (dexdétomidine 0,2-0,5 µg/kg/h SN).",
          "Curarisation : esméron (profonde PTC=2 pour laparoscopie) ; reversal sugammadex TOF adapté.",
          "Remplissage guidé (GDT) : 3-4 ml/kg/h de cristalloïdes ; éviter hypervolémie (iléus).",
          "Infiltration trocarts : ropivacaïne 0,375% 10 ml/trocart (attention toxicité : calcul dose totale).",
          "Paracétamol 1g IV + AINS IV (kétorolac 30 mg) ; vert d'indocyanine 0,125 mg/kg SN (chirurgie robotique) pour perfusion anastomose ; péridurale thoracique en laparotomie."
        ],
        "postop": [
          "Analgésie ERAS : lidocaïne IV 1 mg/kg/h × 24h (SSPI + unité) + paracétamol 1g/6h + AINS 48h + morphiniques RESTRICTS (favorise l'iléus).",
          "Réalimentation orale : liquides clairs 4-6h post-op ; ERAS autorise alimentation solide légère dès J0 soir si tolérance.",
          "Mobilisation : patient assis bord du lit J0 soir, debout J1 matin.",
          "[Complément – ERAS Colonic Surgery, 2023] Pas de SNG systématique ; ablation sonde vésicale J1 ; critères de sortie : alimentation tolérée + transit + douleur < 4/10.",
          "Thromboprophylaxie : bas de compression + HBPM H+6-12 × 28 jours (chirurgie oncologique colorectale)."
        ],
        "red_flags": [
          "Fistule anastomotique (tachycardie + fièvre + douleur abdominale J3-J5) : TDM abdominal urgent + reprise chirurgicale ou drainage.",
          "Iléus prolongé (absence transit > J4 + nausées) : KT épidurale + réhydratation + pas d'antidouleurs opioïdes.",
          "Hémorragie anastomotique (rectorragie précoce) : scopie rectale + transfusion si nécessaire.",
          "Syndrome de l'hypoglycémie peropératoire (lidocaïne IVL toxicité) : arythmie + convulsions → lipides 20% IVL."
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "remifentanil", "indication_tag": "TIVA_perop"},
          {"drug_id": "lidocaine", "indication_tag": "IVL_perop_postop"},
          {"drug_id": "ketamine", "indication_tag": "adjuvant_analgesie"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation"},
          {"drug_id": "sugammadex", "indication_tag": "reversal"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie"},
          {"drug_id": "ketorolac", "indication_tag": "AINS"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie"},
          {"drug_id": "ondansetron", "indication_tag": "PONV"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "La lidocaïne IVL peropératoire (bolus 1,5 mg/kg + infusion 1,5 mg/kg/h) est un adjuvant majeur du protocole RACC : réduction de l'iléus post-opératoire, épargne morphinique 30-40%, retour du transit plus rapide.",
          "L'ERAS colorectal (ERAS Society 2023) recommande : charge glucidique pré-op, anesthésie régionale (péridurale ou bloc de paroi), minimisation des drains/SNG/SV, analgésie opioïd-sparing, mobilisation J0.",
          "Le vert d'indocyanine (ICG) peropératoire en chirurgie robotique permet de vérifier la vascularisation de l'anastomose avant fermeture : réduction significative des fistules anastomotiques."
        ],
        "pitfalls": [
          "Calculer la dose de ropivacaïne pour les trocarts sans tenir compte du poids et de la dose des blocs régionaux adjacents : toxicité AL cumulative.",
          "Ne pas surveiller la glycémie peropératoire malgré la charge glucidique préopératoire et le stress chirurgical : hyperglycémie > 10 mmol/L associée à plus de complications.",
          "Insuffler à haute pression (> 15 mmHg) en laparoscopie : associé à plus de douleurs post-op et de perturbations ventilatoires chez l'obèse."
        ],
        "references": [
          {"source": "ERAS Society — Colon Surgery Guidelines", "year": 2023, "note": "Recommandations complètes RACC chirurgie colorectale."},
          {"source": "SFAR — Antibioprophylaxie en Chirurgie Digestive", "year": 2022, "note": "Protocoles ATB chirurgie colorectale et colorectale."},
          {"source": "WHO — SSI Prevention Guidelines", "year": 2018, "note": "Prophylaxie infection site opératoire."}
        ]
      }
    }
  }$co$::jsonb,
  '["anticoag"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'surrenalectomie_pheo',
  'chirurgie-generale',
  '["chirurgie-generale"]'::jsonb,
  '{"fr":"Surrénalectomie pour phéochromocytome / paraganglionome","en":"Adrenalectomy for pheochromocytoma / paraganglioma","pt":"Suprarrenalectomia por feocromocitoma / paraganglioma"}'::jsonb,
  '{"fr":["phéochromocytome","paraganglionome","surrénalectomie","chirurgie surrénale","NEM","MEN","hypersécrétion catécholamines"],"en":["pheochromocytoma","paraganglioma","adrenalectomy","catecholamine excess","MEN syndrome"],"pt":["feocromocitoma","paraganglioma","suprarrenalectomia"]}'::jsonb,
  $ph${
    "quick": {
      "fr": {
        "preop": [
          "Préparation pré-op OBLIGATOIRE (2-4 semaines) : MAPA + Holter 24h + écho cardiaque + alphablocage oral (prazosine ou urapidil IV) OU inhibiteur calcique (nicardipine) ; bêtablocage UNIQUEMENT après alphablocage efficace.",
          "Diète à éviter : tyramine (chocolat, bière, fromages affinés, sauce soja, vins rouges).",
          "Bilan biologique + groupe/RAI ; prémédication BZD pour anxiolyse.",
          "NEM bilatérale : hydrocortisone 100 mg IV 2×/j avant et pendant chirurgie (insuffisance surrénale iatrogène).",
          "[Complément – ESES/ENETS Phéochromocytome Guidelines, 2020] Objectifs alphablocage préop : TA < 130/80 couché, FC < 80 bpm, HTO < 10-20 mmHg ; durée minimale 7-14 jours."
        ],
        "intraop": [
          "AG : sévoflurane + rémifentanil ou sufentanil. À ÉVITER : kétamine (stimulation sympathique), éphédrine (libération catécholamines), métoclopramide + dropéridol (si non alpha-bloqué), chlorpromazine, glucagon.",
          "Contrôle HTA hypertensive (pics peropératoires lors manipulation de la tumeur) : nicardipine bolus 0,5-1 mg IV ± perfusion 2-10 µg/kg/min ; labétalol 5-20 mg IV ; MgSO4 1-2 g IV si arythmie.",
          "Tachycardie réfractaire : esmolol bolus 100 mg ou perfusion 25-250 µg/kg/min ; lidocaïne ; amiodarone.",
          "Post-déclampage tumeur → hypotension réfractaire : phényléphrine 100-200 µg bolus ou noradrénaline IVSE.",
          "Monitoring invasif : KTA + débit cardiaque (PICCO ou Vigileo) + SV + Entropie + monitoring curarisation."
        ],
        "postop": [
          "Post-op en USI : instabilité hémodynamique (5% des patients restent hypertendus > 72h), hypoglycémies (catécholamines sécrétaient de l'insuline), insuffisance surrénale aiguë si surrénalectomie bilatérale.",
          "Insuffisance surrénale aiguë (bilatérale) : hydrocortisone 100 mg IV bolus puis 50-100 mg/6-8h + fludrocortisone (voie orale dès tolérance).",
          "Chirurgie sur insuffisance surrénalienne connue préexistante : hydrocortisone 100 mg IM/IV + doublement doses habituelles 24-48h + retour dose habituelle J3.",
          "[Complément – Endocrine Society Guidelines, 2022] Surveillance à long terme : dosages urinaires catécholamines/métanéphrines à 3 mois, 1 an puis annuel (NEM, syndromes génétiques).",
          "Contrôle glycémique horaire en post-op immédiat."
        ],
        "red_flags": [
          "Crise hypertensive peropératoire (PAS > 200 mmHg) : nicardipine bolus répétables + phentolamine si disponible ; phentolamine 2-5 mg IV si crise rebelle.",
          "Hypotension sévère post-déclampage (effondrement catécholamines) : noradrénaline IVSE + remplissage actif.",
          "Arythmie ventriculaire sévère lors manipulation : traiter cause (catécholamines) + amiodarone ou esmolol.",
          "Insuffisance surrénale aiguë non diagnostiquée (bilatérale ou corticosurrénale insuffisante) : hypotension réfractaire aux vasopresseurs → cortisone IV immédiate."
        ],
        "drugs": [
          {"drug_id": "sevoflurane", "indication_tag": "entretien"},
          {"drug_id": "remifentanil", "indication_tag": "analgesie_TIVA"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation"},
          {"drug_id": "phenylephrine", "indication_tag": "hypotension_post_declamp"},
          {"drug_id": "noradrenaline", "indication_tag": "vasopresseur_post_declamp"},
          {"drug_id": "lidocaine", "indication_tag": "antiarythmique"},
          {"drug_id": "midazolam", "indication_tag": "premedication"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Le phéochromocytome est la chirurgie endocrinienne la plus risquée sans préparation adéquate : crises hypertensives peropératoires peuvent être mortelles (hémorragie cérébrale, infarctus, insuffisance cardiaque).",
          "Le MgSO4 est particulièrement utile en contexte de phéochromocytome avec arythmies ou chez la femme enceinte (anti-arythmique et vasodilatateur central).",
          "Le phéochromocytome doit systématiquement être évoqué chez une patiente enceinte avec HTA sévère : association avec pré-éclampsie possible ; traitement chirurgical au 2ème trimestre si possible."
        ],
        "pitfalls": [
          "Donner de l'éphédrine lors d'une hypotension chez un patient non alpha-bloqué avec phéochromocytome : risque de libération massive de catécholamines par action indirecte.",
          "Utiliser du dropéridol ou métoclopramide sans alpha-blocage préalable (libération catécholamines par déplétion de dopamine).",
          "Ne pas préparer la noradrénaline AVANT le déclampage tumoral : l'effondrement tensionnel peut être brutal dans les secondes suivant le déclampage."
        ],
        "references": [
          {"source": "ESES/ENETS — Pheochromocytoma Management Guidelines", "year": 2020, "note": "Préparation préop, alphablocage, monitoring, soins post-op."},
          {"source": "Endocrine Society — Pheochromocytoma Guidelines", "year": 2022, "note": "Génétique, surveillance à long terme, syndomes NEM."},
          {"source": "SFAR — Chirurgie Endocrinienne", "year": 2021, "note": "Gestion anesthésique phéochromocytome."}
        ]
      }
    }
  }$ph$::jsonb,
  '["icu"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- ─── J. SALLE D'ACCOUCHEMENT — OBSTÉTRIQUE ────────────────────────────────

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'peridurale_analgesia_travail',
  'obstetrique',
  '["obstetrique"]'::jsonb,
  '{"fr":"Analgésie péridurale pour le travail obstétrical","en":"Epidural analgesia for labour","pt":"Analgesia epidural para o trabalho de parto"}'::jsonb,
  '{"fr":["péridurale travail","analgésie péridurale obstétricale","APD travail","péri pour travail","walking epidural"],"en":["labour epidural","epidural analgesia labour","obstetric epidural","walking epidural"],"pt":["epidural trabalho de parto","analgesia epidural obstétrica","peridural trabalho"]}'::jsonb,
  $pe${
    "quick": {
      "fr": {
        "preop": [
          "VVP 18G minimum + cristalloïdes de remplissage (500 ml avant induction de la péridurale).",
          "Monitoring : NIBP toutes les 3 min post-mise en place, FC, SpO2.",
          "Asepsie stricte : désinfection alcoolique × 3, bonnet + masque + gants stériles + champs stériles.",
          "Épreuve du lâcher pression NaCl 0,9% pour confirmation de l'espace péridural ; KT 2,5-4 cm dans l'espace (4 cm chez l'obèse).",
          "Dose-test systématique : xylocaïne 2% adrénalinée 1/200.000 pure, 3 cc (contrôle FC + vérification absence de bloc moteur bilatéral précoce)."
        ],
        "intraop": [
          "Mode PIB+PCEA 0,0625% (standard) : chirocaïne 0,0625% + sufentanil 0,2 µg/cc → bolus initial 10 cc titrés (5 cc/5 cc, délai 5 min) → PIB 10 cc/h + PCEA 8 cc/15 min (code pompe CADD Solis : 111).",
          "Mode PIB+PCEA 0,125% (douleur intense, multiparité) : chirocaïne 0,125% + sufentanil 0,2 µg/cc → titration 6-8 cc → PIB 6 cc/h + PCEA 4 cc/15 min.",
          "Walking Epidural : uniquement en journée, après concertation avec le senior et les obstétriciens (bupivacaïne ≤ 0,0625% + sufentanil pour préserver la motricité).",
          "Gestion analgésie incomplète : réinjection 5-10 cc de l'AL en usage + retrait 1-2 cm du KT SN ; évaluer niveau sensitif (test au froid).",
          "Documentation informatisée dans Exacto : heure, produit, doses, niveau, complications."
        ],
        "postop": [
          "Surveillance continue jusqu'à l'accouchement : NIBP + SpO2 + monitoring fœtal (CTG).",
          "Après accouchement : retrait KT péridural si plus de raison de le garder ; garder pour révision utérine possible.",
          "[Complément – ASA Obstetric Anesthesia Practice Guidelines, 2023] Réévaluer la douleur régulièrement ; adapter la concentration si mobilité réduite ou besoin d'extension pour extraction instrumentale.",
          "Risques post-ponction : brèche dure-mérienne (céphalée orthostatique J1-J5) → blood-patch efficace 90% ; délai minimum 24-36h avant réalisation.",
          "Surveillance bloc moteur au réveil : test Bromage avant déambulation (score 0 indispensable)."
        ],
        "red_flags": [
          "Injection intrathécale accidentelle (injection dose de test) : niveau sensitif T10 en < 3 min + bloc moteur bilatéral → décubitus dorsal + déplacement utérus gauche + éphédrine IV + réanimation.",
          "Hypotension maternelle (PAM < 65 mmHg ou TA < 90% de base) : éphédrine 5-10 mg IV + phényléphrine 100 µg IV + remplissage.",
          "Bradycardie fœtale secondaire à l'hypotension maternelle : décubitus latéral gauche + O2 + traitement maternel.",
          "Prurit sévère (sufentanil) : nalbuphine 2-5 mg IV ou naloxane 0,04 mg IV titré."
        ],
        "drugs": [
          {"drug_id": "bupivacaine", "indication_tag": "peridurale_levobupivacaine_travail"},
          {"drug_id": "sufentanil", "indication_tag": "adjuvant_peridurale"},
          {"drug_id": "lidocaine", "indication_tag": "dose_test"},
          {"drug_id": "ephedrine", "indication_tag": "hypotension"},
          {"drug_id": "phenylephrine", "indication_tag": "hypotension_alternative"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Le mode PIB+PCEA (programmed intermittent bolus + patient-controlled epidural analgesia) est supérieur à la PIVC (perfusion continue) pour l'analgésie péridurale obstétricale : meilleure distribution AL dans l'espace péridural, réduction des zones de non-analgésie.",
          "La dose-test adrénalisée permet de détecter une injection intrathécale (bloc moteur bilatéral en 2-3 min) ou intravasculaire (tachycardie + goût métallique + acouphènes).",
          "La lévobupivacaïne (chirocaïne) à 0,0625% est le standard de facto à St-Pierre : concentration minimale efficace, préservant la mobilité pour la walking epidural."
        ],
        "pitfalls": [
          "Ne pas faire de dose-test avant chaque utilisation du KT (réinjection pour césarienne, top-up) : déplacement intrathecal ou intravasculaire du KT possible à tout moment.",
          "Titrer le bolus initial trop rapidement (> 10 cc en une seule injection sans dose-test) : bloc trop haut et hypotension.",
          "Oublier de vérifier la mobilité avant déambulation (walking epidural) : risque de chute."
        ],
        "references": [
          {"source": "ASA — Practice Guidelines for Obstetric Anesthesia", "year": 2023, "note": "Mise à jour recommandations APD obstétricale."},
          {"source": "ESAIC — Obstetric Anaesthesia Recommendations", "year": 2021, "note": "Protocoles analgésie travail européens."},
          {"source": "NICE — Intrapartum Care Guidelines", "year": 2023, "note": "Recommandations analgésie obstétricale."}
        ]
      }
    }
  }$pe$::jsonb,
  '["ob","neuraxial"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'cesarienne_rachianesthesie',
  'obstetrique',
  '["obstetrique"]'::jsonb,
  '{"fr":"Césarienne — Rachianesthésie (standard)","en":"Caesarean section — Spinal anaesthesia","pt":"Cesariana — Raquianestesia"}'::jsonb,
  '{"fr":["césarienne","rachianesthésie césarienne","anesthésie spinale césarienne","marcaïne hyperbare","prilocaïne","section césarienne"],"en":["caesarean section","spinal anaesthesia C-section","cesarean spinal","intrathecal anaesthesia"],"pt":["cesariana raquianestesia","secção cesariana","raquidiana cesariana"]}'::jsonb,
  $cs${
    "quick": {
      "fr": {
        "preop": [
          "Niveau sensitif cible : Th4 (niveau des mamelons) vérifié au froid bilatéralement avant incision.",
          "VVP 18G minimum + monitoring NIBP toutes les 1-2 min post-rachis + SpO2 continue.",
          "Citrate de sodium 0,3 molaire 30 ml PO immédiatement en entrée salle d'opération (prévention aspiration acide).",
          "Prévention hypotension : remplissage co-loading 500-1000 ml cristalloïdes + phényléphrine préventive (débit 60-120 cc/h en dilution 25 µg/cc ou 15-30 cc/h en 100 µg/cc).",
          "Déviation utérine gauche (coussin sous fesse droite ou table inclinée) jusqu'à naissance de l'enfant."
        ],
        "intraop": [
          "Technique standard St-Pierre : marcaïne HB 10 mg (bupivacaïne hyperbare 0,5% 2 cc) + sufentanil 2,5 µg ± morphine 100 µg intrathécale (accord médical) ; injection lente 15-30 secondes.",
          "Technique alternative (accord senior) : prilocaïne HB 50 mg (2,5 cc) + sufentanil 2,5 µg ± morphine 100 µg (durée d'action plus courte, récupération motrice plus rapide).",
          "Antibioprophylaxie : céfazoline 2g IVL avant incision cutanée.",
          "Syntocinon (ocytocine) 3 UI IV bolus lent à la sortie de l'enfant ; contrôle tonicité utérine /3 min ; règle des 3 (3 UI, max 3 bolus, délai 3 min) ; en cas d'atonie → escalade utérotonique.",
          "Dexaméthasone 4 mg IV au début de la fermeture utérine (réduction NVPO post-op)."
        ],
        "postop": [
          "Analgésie post-césarienne systématique : paracétamol 1g IV + taradyl 20 mg IV (kétorolac) toutes les 6h × 48h ; tramadol 100 mg IV si douleur insuffisante (rescue).",
          "Au moins UNE option supplémentaire parmi : morphine intrathécale 50-100 µg (déjà injecté en intraop SN) / TAP blocs bilatéraux (chirocaïne 0,25% 20 cc/côté) / infiltration aponévrose (chirocaïne 0,5% 20 cc) / infiltration plaie chirurgicale.",
          "Soins de contact précoce mère-enfant (peau à peau) si possible dès la salle d'op.",
          "Mobilisation : lever J0 soir ou J1 matin (ERAS obstétrique) ; thromboprophylaxie (bas de contention + HBPM selon protocole).",
          "[Complément – ASA, 2023 / NICE, 2023] Surveillance SpO2 × 12-24h si morphine intrathécale utilisée (risque dépression respiratoire retardée)."
        ],
        "red_flags": [
          "Hypotension sévère (PAM < 65 mmHg) : phényléphrine 100-200 µg bolus IV + augmenter débit perf + éphédrine 5-10 mg IV si bradycardie associée.",
          "Niveau Th2 ou plus (nausées + dyspnée + trouble parole) : décubitus dorsal plat + O2 + soutien TA + appel aide.",
          "Atonie utérine réfractaire aux ocytociques : syntocinon 20-40 UI en 500 cc + carbétocine 100 µg IV ; escalade → sulprostone (Nalador) selon protocole HPP.",
          "Réaction anaphylactique (antibiotique) : adrénaline 0,5-1 mg IM/IV + remplissage + appel aide."
        ],
        "drugs": [
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthesie_hyperbare"},
          {"drug_id": "sufentanil", "indication_tag": "intrathecal_adjuvant"},
          {"drug_id": "morphine", "indication_tag": "intrathecal_analgesie_postop"},
          {"drug_id": "phenylephrine", "indication_tag": "prevention_hypotension"},
          {"drug_id": "ephedrine", "indication_tag": "hypotension_bradycardie"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie_postop"},
          {"drug_id": "ketorolac", "indication_tag": "AINS_postop"},
          {"drug_id": "dexamethasone", "indication_tag": "PONV"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "La rachianesthésie est la technique de choix pour la césarienne programmée ou urgente (sauf code rouge ou CI) : installation rapide (5-10 min), qualité excellente, sécurité maternelle et fœtale optimale.",
          "La phényléphrine est le vasopresseur de choix pour prévenir l'hypotension post-rachi en obstétrique (supérieure à l'éphédrine pour préserver le pH fœtal).",
          "La morphine intrathécale (100 µg) procure une analgésie post-césarienne de 18-24h : surveillance SpO2 obligatoire dans les 24h suivantes (dépression respiratoire retardée possible)."
        ],
        "pitfalls": [
          "Injecter trop rapidement la solution hyperbarique : niveau trop haut → bloc Th1-2 → apnée.",
          "Omettre la phényléphrine préventive dès l'injection intrathécale : l'hypotension est quasi-constante (70-80%) si non prévenue.",
          "Ne pas anticiper l'atonie utérine dans une parturiente avec facteurs de risque (multiparité, utérus cicatriciel, gros fœtus) : avoir ocytociques de 2ème rang prêts."
        ],
        "references": [
          {"source": "ASA — Obstetric Anaesthesia Practice Guidelines Update", "year": 2023, "note": "Rachianesthésie césarienne, prévention hypotension, morphine IT."},
          {"source": "ESAIC — Obstetric Anaesthesia Recommendations", "year": 2021, "note": "Protocoles européens anesthésie obstétricale."},
          {"source": "NICE — Intrapartum Care Guidelines", "year": 2023, "note": "Anesthésie pour césarienne, soins postop."}
        ]
      }
    }
  }$cs$::jsonb,
  '["ob","neuraxial"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'cesarienne_ag',
  'obstetrique',
  '["obstetrique"]'::jsonb,
  '{"fr":"Césarienne — Anesthésie Générale (AG)","en":"Caesarean section — General anaesthesia","pt":"Cesariana — Anestesia Geral (AG)"}'::jsonb,
  '{"fr":["césarienne AG","anesthésie générale césarienne","code rouge","césarienne urgence","ISR obstétrique"],"en":["caesarean GA","general anesthesia C-section","emergency caesarean","RSI obstetrics"],"pt":["cesariana AG","anestesia geral cesariana","urgência cesariana"]}'::jsonb,
  $ca${
    "quick": {
      "fr": {
        "preop": [
          "Indications : urgence vitale code rouge (décision < 30 min) ; niveau ALR insuffisant ; contre-indication à l'ALR ; état hémodynamique précaire maternel.",
          "Préoxygénation FiO2 = 1 pendant minimum 3 min (masque étanche) ou 8 respirations profondes max ; FetO2 > 90% avant induction.",
          "Citrate de sodium 0,3 M 30 ml PO si temps le permet (prévention aspiration acide).",
          "Déviation utérine gauche (table inclinée 15°) jusqu'à extraction de l'enfant.",
          "Équipe complète en salle : pédiatre/sage-femme pour le nouveau-né dès l'induction."
        ],
        "intraop": [
          "ISR : propofol 2 mg/kg IV + succinylcholine 1 mg/kg IV + pression cricoïde (Sellick) ; lame Macintosh n°3 (n°4 disponible) ; sonde n°7.",
          "Entretien : O2/air 50%/50% + sévoflurane 1,5% expiré (0,7 MAC) ; minimum d'opioïdes avant extraction fœtale.",
          "Avant incision cutanée : O2 pur FiO2 = 1 pendant 1 min (réserve en cas d'intubation difficile).",
          "Après clampage du cordon : syntocinon 3 UI bolus lent /3 min + céfazoline 2g IV + sufentanil 10-15 µg + rocuronium 0,6 mg/kg SN + kétamine 0,5-1 mg/kg SN + dexaméthasone 4 mg + paracétamol 1g ± AINS.",
          "Analgésie post-op : TAP blocs bilatéraux en fin d'intervention + infiltration plaie + PCIA morphine si nécessaire."
        ],
        "postop": [
          "Extubation : patiente éveillée, décision coordinée avec chirurgien (utérus refermé) ; ne pas extubé si niveau de conscience insuffisant.",
          "Transfert SSPI avec monitoring complet ; surveillance neurologique post-op.",
          "Analgésie : paracétamol 1g/6h + AINS + TAP blocs déjà réalisés.",
          "[Complément – ASA, 2023] Surveillance renforcée de la dépression respiratoire post-partum (morphine IV, obésité, SAOS).",
          "Peau à peau si possible dès la SSPI si mère et enfant stables."
        ],
        "red_flags": [
          "Intubation difficile/impossible : LMA de sauvetage → CICV → cricothyrotomie ; avoir algorithme voie aérienne difficile obstétrique affiché en salle.",
          "Inhalation : fibroscopie + Rx thorax + ATB si pneumonie d'inhalation.",
          "Conscience per-opératoire (sévoflurane pas commencé avant extraction) : mémorisation ; documenter + suivi psychologique post-op.",
          "Atonie utérine post-AG (utérotomiques émoussés par halogénés > 1 MAC) : syntocinon dose maximale + sulprostone si réfractaire."
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction_ISR"},
          {"drug_id": "rocuronium", "indication_tag": "ISR_si_CI_succinylcholine"},
          {"drug_id": "sevoflurane", "indication_tag": "entretien_0.7MAC"},
          {"drug_id": "sufentanil", "indication_tag": "apres_clampage"},
          {"drug_id": "ketamine", "indication_tag": "analgesie_adjuvant"},
          {"drug_id": "dexamethasone", "indication_tag": "PONV"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie_postop"},
          {"drug_id": "morphine", "indication_tag": "PCA_rescue"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "L'AG pour césarienne est réservée aux urgences vraies et aux contre-indications à l'ALR : la mortalité maternelle liée à l'AG est 16 fois supérieure à celle de l'ALR neuraxiale (liée principalement aux voies aériennes).",
          "Le sévoflurane à 0,7 MAC avant extraction fœtale donne une bonne qualité d'anesthésie avec effets minimal sur l'utérus et le fœtus ; augmenter à 1-1,5 MAC après clampage pour prévenir la conscience.",
          "La difficulté d'intubation est 8 fois plus fréquente en obstétrique qu'en chirurgie générale (œdème laryngé, grossesse, urgence) : always have Plan B (LMA) and Plan C (cricothyrotomie) ready."
        ],
        "pitfalls": [
          "Utiliser du sévoflurane > 1 MAC avant extraction : inhibition des contractions utérines (atonie iatrogène).",
          "Oublier de passer à l'O2 pur 1 min avant incision (pré-oxygénation supplémentaire pour tolérer une tentative d'intubation difficile).",
          "Ne pas informer en avance l'équipe d'une difficulté d'intubation prévisible (obésité, cou court, Mallampati 4, ATCD IOT difficile) : préparer le matériel en advance."
        ],
        "references": [
          {"source": "NAP4 — 4th National Audit Project — Airway in Obstetrics", "year": 2011, "note": "Analyse des complications voies aériennes en AG obstétricale."},
          {"source": "ASA — Obstetric Anaesthesia Practice Guidelines", "year": 2023, "note": "Indications AG, gestion VA difficile."},
          {"source": "DAS/OAA — Difficult Airway in Obstetrics", "year": 2015, "note": "Algorithme VA difficile obstétrique."}
        ]
      }
    }
  }$ca$::jsonb,
  '["ob","airway","difficult_airway"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'pre_eclampsie_hellp',
  'obstetrique',
  '["obstetrique","reanimation"]'::jsonb,
  '{"fr":"Pré-éclampsie sévère et syndrome HELLP — Prise en charge anesthésique","en":"Severe pre-eclampsia and HELLP syndrome — Anaesthetic management","pt":"Pré-eclampsia grave e síndrome HELLP — Gestão anestésica"}'::jsonb,
  '{"fr":["pré-éclampsie","PE sévère","éclampsie","HELLP","HTA gravidique","hypertension grossesse","sulfate de magnésium","MgSO4"],"en":["pre-eclampsia","severe PE","HELLP syndrome","eclampsia","magnesium sulphate","gestational hypertension"],"pt":["pré-eclâmpsia","eclâmpsia","HELLP","hipertensão gestacional","sulfato magnésio"]}'::jsonb,
  $pre${
    "quick": {
      "fr": {
        "preop": [
          "Définitions : HTA gravidique (≥ 140/90 mmHg après 20 SA) ; PE (HTA + protéinurie > 300 mg/24h) ; PE sévère (critères de gravité : PAS ≥ 160, céphalées, vision trouble, douleur épigastrique, créatinine > 90 µmol/L, ASAT/ALAT × 2N, PLT < 100k, retard de croissance sévère) ; HELLP (hémolyse + élévation enzymes hépatiques + thrombopénie).",
          "Traitement antihypertenseur urgent si PAD ≥ 110 mmHg : 1er choix labétalol bolus 5-20 mg IV /5 min (continu 20-160 mg/h si > 3 bolus) ; 2ème choix nicardipine bolus 0,5-1 mg IV (continu 1-6 mg/h) ; objectif TAD 9-11 cmHg (90-99 mmHg).",
          "Prévention/traitement éclampsie : MgSO4 — dose de charge 4-6 g IV en 15 min + entretien 1-3 g/h en IVSE ; antidote CaCl2 1g IVL en cas d'intoxication (arythmie, apnée, arrêt respiratoire).",
          "HELLP : culots plaquettaires si PLT ≤ 50.000 (seuil opératoire), FFP si TP ≤ 40% ; célestène 12 mg × 2/j si accouchement imminent (maturation pulmonaire fœtale).",
          "Monitoring maternel : NIBP/3 min, SpO2, ECG, ROT horaires, réflexes ostéotendineux horaires, débit urinaire (SV), magnésémie sérique H+4."
        ],
        "intraop": [
          "APD préférée (réduit le tonus adrénergique, facilite le contrôle tensionnel, évite l'intubation difficile) SAUF : hémorragie active ou risque coagulopathie (PLT < 70.000 = CI relative), détresse respiratoire maternelle, urgence vitale.",
          "Si AG nécessaire : ISR + précautions voie aérienne difficile (œdème laryngé +++ en PE sévère) ; lidocaïne 1,5 mg/kg IV avant laryngoscopie (prévention poussée hypertensive à l'intubation) ; esmolol 1-2 mg/kg SN.",
          "Surveillance ROT, FR, ECG, SpO2, magnésémie pendant l'AG/APD sous MgSO4.",
          "Syntocinon : réduire la dose en PE (risque d'hypotension) ; préférer 3 UI lentes.",
          "Eviter les alpha-agonistes purs (phényléphrine) si HTA déjà sévère ; préférer éphédrine titrée ou noradrénaline faible dose."
        ],
        "postop": [
          "Surveillance prolongée post-partum : 40% des PE surviennent ou s'aggravent en post-partum → monitoring ≥ 48-72h en unité spécialisée.",
          "MgSO4 maintenu 24-48h post-partum selon sévérité.",
          "Traitement antihypertenseur PO à initier avant la sortie (nicardipine LP ou labétalol PO) ; objectif TA < 140/90 avant sortie.",
          "[Complément – RCOG Green-Top PE Guidelines, 2023] Aspirine 75-150 mg/j dès 12 SA prévient la PE chez les femmes à haut risque (2+ facteurs modérés ou 1 facteur élevé).",
          "Contraception : discuter avant sortie (COC contre-indiquée dans les 3 mois post-PE sévère)."
        ],
        "red_flags": [
          "Crise éclamptique (convulsions) : MgSO4 4-6 g IV 5 min + décubitus latéral + O2 + protection membre + extraction fœtale urgente si > 32 SA.",
          "Rupture hépatique HELLP (douleur épigastrique brutale + choc) : chirurgie hémostatique d'urgence + transfusion massive.",
          "Intoxication MgSO4 (ROT absents + FR < 12/min + saturation chute) : ARRÊT MgSO4 + CaCl2 1g IV lent.",
          "OAP (dyspnée + désaturation + crépitants) : furosémide 20-40 mg IV + O2 + CPAP/NIPPV ; restriction hydrique stricte."
        ],
        "drugs": [
          {"drug_id": "bupivacaine", "indication_tag": "APD_peridurale"},
          {"drug_id": "sufentanil", "indication_tag": "APD_adjuvant"},
          {"drug_id": "lidocaine", "indication_tag": "prevention_poussee_HTA_intubation"},
          {"drug_id": "propofol", "indication_tag": "induction_AG"},
          {"drug_id": "rocuronium", "indication_tag": "ISR"},
          {"drug_id": "morphine", "indication_tag": "analgesie_postop"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie"},
          {"drug_id": "dexamethasone", "indication_tag": "HELLP_maturation"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Le MgSO4 est supérieur à tous les autres anticonvulsivants pour la prévention et le traitement de l'éclampsie (Magpie Trial) : efficacité, sécurité maternelle et fœtale.",
          "La PE sévère avec coagulopathie (PLT < 70.000, TP allongé) est une contre-indication relative à l'APD : discuter avec l'équipe obstétricale ; le seuil opératoire de 70.000 PLT est basé sur des données observationnelles.",
          "40% des PE surviennent ou s'aggravent dans les 48h post-partum : surveillance prolongée indispensable ; crises d'éclampsie post-partum possibles jusqu'à J5."
        ],
        "pitfalls": [
          "Abaisser la TA trop brutalement (> 25% en 1h) : risque d'ischémie cérébrale utéro-placentaire et fœtale.",
          "Oublier de surveiller la magnésémie (cible thérapeutique 2-3,5 mmol/L) : concentrations > 5 mmol/L → toxicité.",
          "Ne pas anticiper la voie aérienne difficile en PE sévère (œdème laryngé, glottique, lingual) : préparer matériel ID (vidéolaryngoscope, LMA, bougie) avant toute induction."
        ],
        "references": [
          {"source": "RCOG Green-Top — Hypertension in Pregnancy", "year": 2019, "note": "Updated 2023. Diagnostic, traitement, monitoring PE sévère."},
          {"source": "ACOG Practice Bulletin — Preeclampsia", "year": 2022, "note": "Définitions, management, MgSO4."},
          {"source": "Magpie Trial Collaborative Group — Lancet", "year": 2002, "note": "MgSO4 vs placebo en PE : prévention éclampsie."}
        ]
      }
    }
  }$pre$::jsonb,
  '["ob","icu","anticoag"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'hemorragie_post_partum',
  'obstetrique',
  '["obstetrique","reanimation"]'::jsonb,
  '{"fr":"Hémorragie du Post-Partum (HPP) — Prise en charge anesthésique","en":"Postpartum haemorrhage (PPH) — Anaesthetic management","pt":"Hemorragia pós-parto (HPP) — Gestão anestésica"}'::jsonb,
  '{"fr":["HPP","hémorragie post-partum","hémorragie du délivre","atonie utérine","PPH","HPP sévère","code rouge obstétrique"],"en":["PPH","postpartum hemorrhage","uterine atony","major obstetric hemorrhage","code red obstetrics"],"pt":["HPP","hemorragia pós-parto","atonia uterina","hemorragia obstétrica grave"]}'::jsonb,
  $hpp${
    "quick": {
      "fr": {
        "preop": [
          "Définition : pertes > 500 cc (voie basse ou césarienne) ; HPP sévère > 1000 cc ; menaçant le pronostic vital > 2500 cc.",
          "Causes 4T : Tone (atonie utérine, 58%) + Tissue (rétention placentaire, 29%) + Trauma (déchirures cervicales/vaginales, 8%) + Thrombin (coagulopathie, 5%).",
          "Délivrance artificielle immédiate si non expulsé + révision utérine sous AG ou APD existante.",
          "Mesures immédiates (code rouge si HPP massive) : VVP grande taille (2 voies) + remplissage rapide + appeler aide (obstétricien senior + anesthésiste + sage-femme) + communication équipe.",
          "Acide tranexamique 1g IV en 10 min DÈS le diagnostic de HPP (efficacité maximale dans les 3h post-partum) + céfazoline 2g IV."
        ],
        "intraop": [
          "Syntocinon selon tonicité utérine /3 min (règle des 3 : 3 UI bolus, max 3 bolus, délai 3 min).",
          "Fibrinogène (Ryastap) 1g IV si fibrinogène < 200 mg/dL (ROTEM si disponible : cible FIBTEM > 1,5 g/L).",
          "Atonie réfractaire : Prostin E2 (dimoprostone) IV (6 ampoules 750 µg dans G5% → 60 cc/h × 12h puis 30 cc/h × 24h).",
          "Transfusion : GRC/FFP/Plaquettes selon ROTEM en mode 4:2:1 (départ) → 1:1:1 si HPP massive ; CaCl2 1g IV dès le 3ème culot GRC.",
          "Escalade mécanique si atonie réfractaire : ballon de Bakri intracavitaire → embolisation artérielle (transfert angio) → ligature des artères utérines → hystérectomie d'hémostase."
        ],
        "postop": [
          "Objectifs transfusionnels : Hb > 7 g/dL + PLT > 50.000 + fibrinogène > 2 g/L.",
          "Correction hypothermie (réchauffeurs) et acidose métabolique peropératoire.",
          "Surveillance en unité de soins critiques post-HPP sévère (H+24h minimum).",
          "[Complément – WHO PPH Prevention, 2023] Ocytocine 10 UI IM systématique en préventif à la naissance (prévient l'atonie).",
          "Débriefing équipe et documentation précise des événements."
        ],
        "red_flags": [
          "CIV post-HPP (CIVD) : allongement TCA + effondrement fibrinogène + saignements diffus → transfusion guidée ROTEM + acide tranexamique.",
          "Embolie de liquide amniotique concomitante (défaillance multiviscérale brutale) : IOT urgente + vasopresseurs + traitement coagulopathie.",
          "Rupture utérine non diagnostiquée (douleur + choc + retard extraction fœtale) : laparotomie urgente.",
          "Insuffisance rénale oligurique post-HPP : éviter AINS + contrôler diurèse + dialyse si nécessaire."
        ],
        "drugs": [
          {"drug_id": "acide_tranexamique", "indication_tag": "traitement_precoce_HPP"},
          {"drug_id": "morphine", "indication_tag": "analgesie_AG_si_necessaire"},
          {"drug_id": "propofol", "indication_tag": "induction_AG_si_necessaire"},
          {"drug_id": "rocuronium", "indication_tag": "ISR_si_AG"},
          {"drug_id": "noradrenaline", "indication_tag": "choc_hemorragique"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie_postop"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "L'acide tranexamique administré dans les 3 heures suivant l'accouchement réduit la mortalité par HPP de 30% (étude WOMAN Trial 2017) : ne pas attendre la confirmation biologique pour l'administrer.",
          "Le ROTEM (ou TEG) guide la thérapeutique hémostatique ciblée : FIBTEM A5 < 7 mm → fibrinogène ; EXTEM CT allongé → FFP ; PLT count bas → plaquettes ; cette approche viscoélastique réduit les transfusions non nécessaires.",
          "Le ballon de Bakri est une mesure conservatrice efficace dans 80% des atonies réfractaires aux utérotoniques : insertion sous contrôle échographique si possible."
        ],
        "pitfalls": [
          "Retarder l'administration d'acide tranexamique (attendre le résultat biologique) : perd son efficacité après 3h.",
          "Donner uniquement du GRC sans FFP et PLT (désequilibre facteurs coagulation) : aggrave la CIVD.",
          "Ne pas corriger l'hypothermie (< 35°C) : inhibe les enzymes de coagulation et aggrave la coagulopathie de dilution."
        ],
        "references": [
          {"source": "WOMAN Trial — Lancet", "year": 2017, "note": "TXA réduction mortalité HPP en obstétrique."},
          {"source": "ESA Major Haemorrhage Guidelines", "year": 2023, "note": "Gestion hémorragie obstétricale et ROTEM."},
          {"source": "RCOG Green-Top — PPH Prevention and Management", "year": 2016, "note": "Updated 2023. Protocole complet HPP."}
        ]
      }
    }
  }$hpp$::jsonb,
  '["ob","icu","anticoag","trauma"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- ─── H. GYNÉCOLOGIE ──────────────────────────────────────────────────────

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'laparoscopie_gynecologique',
  'gynecologie',
  '["gynecologie"]'::jsonb,
  '{"fr":"Laparoscopie gynécologique (dont hystérectomie laparoscopique et robot-assistée)","en":"Gynaecological laparoscopy (including laparoscopic and robotic hysterectomy)","pt":"Laparoscopia ginecológica (incluindo histerectomia laparoscópica e robótica)"}'::jsonb,
  '{"fr":["laparoscopie gynéco","hystérectomie laparoscopique","hystérectomie robot","salpingectomie","kystectomie ovarienne","myomectomie laparoscopique","chirurgie gynéco cœlioscopique"],"en":["gynaecological laparoscopy","laparoscopic hysterectomy","robotic hysterectomy","salpingectomy","ovarian cystectomy"],"pt":["laparoscopia ginecológica","histerectomia laparoscópica","histerectomia robótica"]}'::jsonb,
  $gy${
    "quick": {
      "fr": {
        "preop": [
          "Attention positionnement peropératoire : épaulières + MI en jambières + bras le long du corps → vérifier TOUS les points de compression avant Trendelenburg.",
          "Score Apfel NVPO systématique (femmes jeunes non fumeuses = score 2-3/4 → prophylaxie bimodale obligatoire).",
          "ATB prophylaxie : céfazoline 2g IV avant incision.",
          "Patient Blood Management : bilan NFS + injectafer IV si anémie ferriprive (si délai ≥ 2 semaines) ; groupe/RAI < 72h pour hystérectomies (Hb normale vérifiée en préop).",
          "[Complément – ACOG TEV Prophylaxis, 2021] Évaluation risque TEV : chirurgie gynécologique oncologique = haut risque → HBPM × 28j."
        ],
        "intraop": [
          "AG + IOT (Trendelenburg + insufflation CO2 = impossibilité LMA en chirurgie oncologique ou longue).",
          "Curarisation profonde (PTC=2) pour chirurgie laparoscopique : facilite l'insufflation et la visualisation.",
          "Protéger les yeux (eye pads) en position de Trendelenburg prolongé.",
          "Entretien NVPO renforcé : TIVA propofol préféré si ATCD NVPO + dexaméthasone 8 mg induction + ondansétron 4 mg fin.",
          "Analgésie fin d'intervention : TAP blocs bilatéraux écho-guidés (ropivacaïne 0,375% 20 ml/côté) ± infiltration trocarts."
        ],
        "postop": [
          "Analgésie : paracétamol 1g/6h + AINS 48h + TAP blocs actifs ; morphine en rescue si EVA > 6.",
          "NVPO post-op : ondansétron 4 mg IV rescue si nausées.",
          "Mobilisation précoce J0 soir ou J1 matin selon chirurgie.",
          "[Complément – ERAS Gynecologic Oncology, 2019] Réalimentation orale précoce (J0 soir) ; éviter SNG systématique ; critères de sortie ERAS.",
          "Thromboprophylaxie : HBPM H+6-12 × 10-28j selon risque et type de chirurgie."
        ],
        "red_flags": [
          "Lésion vasculaire au trocart (surtout trocart ombilical en Palmer) : hémopéritoine → laparotomie de conversion urgente.",
          "Lésion uretère (hystérectomie) : hématurie + lombalgies post-op → TDM urgence + avis urologique.",
          "Emphysème sous-cutané cervical massif (insufflation extrasorte) : ÉTCO2 élevé + crépitations cervicales → arrêt insufflation.",
          "TIVA awareness (absence de BIS monitoring) : documenter + suivi psychologique."
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "TIVA_PONV"},
          {"drug_id": "remifentanil", "indication_tag": "TIVA"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation_profonde"},
          {"drug_id": "sugammadex", "indication_tag": "reversal"},
          {"drug_id": "dexamethasone", "indication_tag": "PONV"},
          {"drug_id": "ondansetron", "indication_tag": "PONV"},
          {"drug_id": "bupivacaine", "indication_tag": "TAP_blocs"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "La chirurgie robotique gynécologique impose un Trendelenburg raide (30-45°) de longue durée : œdème cérébral et laryngé possible, risque POVL (neuropathie optique ischémique) si PAM insuffisante.",
          "Le TAP block bilatéral (transverse abdominis plane) en fin d'intervention procure une analgésie excellente pour les incisions abdominales sous-ombilicales : réduction de la consommation morphinique de 40-60%.",
          "La thromboprophylaxie en chirurgie gynécologique oncologique doit être prolongée (28j selon ESC/ACOG) : le risque de TVP est 5-10 fois plus élevé qu'en chirurgie bénigne."
        ],
        "pitfalls": [
          "Oublier de vérifier les points de compression avant la mise en position de Trendelenburg : nerf fémoral (jambières), plexus brachial (épaulières mal positionnées), NFS perinéale.",
          "Insufflation en Trendelenburg prononcé chez une patiente BPCO ou obèse : haute pression insufflation + compression diaphragmatique → hypoventilation et hypercapnie.",
          "Ne pas prévenir NVPO de façon multimodale en gynécologie : score Apfel 3-4 chez la plupart des patientes."
        ],
        "references": [
          {"source": "ERAS Society — Gynecologic Oncology Surgery", "year": 2019, "note": "Recommandations ERAS chirurgie gynécologique oncologique."},
          {"source": "ACOG — Prevention of Venous Thromboembolism in Gynecology", "year": 2021, "note": "Protocoles prophylaxie TEV."},
          {"source": "ESRA — TAP Block Guidelines", "year": 2022, "note": "Techniques et indications TAP en gynécologie."}
        ]
      }
    }
  }$gy$::jsonb,
  '["ponv","anticoag","regional"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- ─── I. UROLOGIE ────────────────────────────────────────────────────────

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'prostatectomie_robot_assistee',
  'urologie',
  '["urologie"]'::jsonb,
  '{"fr":"Prostatectomie radicale robot-assistée (RARP)","en":"Robot-assisted radical prostatectomy (RARP)","pt":"Prostatectomia radical assistida por robô (RARP)"}'::jsonb,
  '{"fr":["prostatectomie robot","prostatectomie radicale","RARP","exérèse prostate","curage ganglionnaire pelvien","Da Vinci prostatectomie"],"en":["RARP","robot radical prostatectomy","Da Vinci prostatectomy","laparoscopic radical prostatectomy"],"pt":["prostatectomia radical robótica","RARP","prostatectomia laparoscópica"]}'::jsonb,
  $pr${
    "quick": {
      "fr": {
        "preop": [
          "Attention à l'installation : épaulières + jambières + bras le long du corps + eye pads (Trendelenburg raide prolongé) ; vérifier TOUS les points de compression avant Robot-Lock.",
          "Groupe/RAI < 72h (saignement modéré attendu) ; VVP bon calibre 18-16G.",
          "Curarisation PROFONDE obligatoire (PTC 4-5, TOF count 0-1) : espace de travail insuffisant si curarisation modérée sous robot.",
          "Pas de SNG systématique (ERAS) ; réalimentation précoce.",
          "[Complément – ERAS Radical Prostatectomy Guidelines, 2022] Charge glucidique préop, mobilisation J0, thromboprophylaxie selon curage ganglionnaire."
        ],
        "intraop": [
          "AG + IOT ; Trendelenburg 30-45° pendant toute l'intervention (1,5-4h) : surveiller pression oculaire + œdème aigu laryngé post-op.",
          "TIVA propofol préféré (PONV post-op fréquent en Trendelenburg prolongé) + dexaméthasone 8 mg + ondansétron 4 mg.",
          "Analgésie : paracétamol 1g IV + AINS (si créatinine normale) + bloc de paroi (paravertébral ou infiltration) SN.",
          "OFA possible (lidocaïne IVL + kétamine) pour épargne morphinique.",
          "Maintenir PaO2 normale + PAM > 70 mmHg en Trendelenburg prolongé (risque POVL si PAM insuffisante + Trendelenburg > 4h)."
        ],
        "postop": [
          "Sonde vésicale en place jusqu'à J7-J10 (contrôle anastomose vésico-urétrale) ; drainage pelvien selon chirurgien.",
          "Thromboprophylaxie : bas de contention + HBPM H+6-12 ; durée prolongée si curage ganglionnaire étendu (28j).",
          "Analgésie : paracétamol 1g/6h + AINS 48h si pas d'IR + rescue tramadol/morphine.",
          "[Complément – ERAS Urology, 2022] Mobilisation J0-J1, réalimentation immédiate, retrait drain J1 si faible débit.",
          "Continence urinaire post-op : rééducation périnéale débutée avant la chirurgie (J-15)."
        ],
        "red_flags": [
          "POVL (perte de vision post-op) : Trendelenburg > 4h + PAM insuffisante + anémie = triade de risque ; IRM orbitaire urgente.",
          "Extravasation anastomose vésico-urétrale (drainage urinaire + drains) : TDM urgence + révision chirurgicale ou drainage prolongé.",
          "Iléus post-op (absence de gaz > J2) : déambulation + arrêt opioïdes + métoclopramide.",
          "Lésion rectale (fistule urecto-vésicale tardive) : endoscopie + chirurgie de reconstruction."
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "TIVA_PONV"},
          {"drug_id": "remifentanil", "indication_tag": "TIVA"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation_profonde_PTC4"},
          {"drug_id": "sugammadex", "indication_tag": "reversal_profond"},
          {"drug_id": "dexamethasone", "indication_tag": "PONV"},
          {"drug_id": "ondansetron", "indication_tag": "PONV"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie"},
          {"drug_id": "ketorolac", "indication_tag": "AINS"},
          {"drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Le Trendelenburg prolongé (> 3-4h) expose à l'œdème laryngé post-extubation (inspecter le larynx avant extubation si Trendelenburg > 4h), à l'œdème cérébral, et exceptionnellement au POVL (neuropathie optique ischémique postopératoire).",
          "La curarisation profonde (PTC 4-5) est essentielle pour la prostatectomie robotique : un espace insuffisant sous insufflation laparoscopique en Trendelenburg empêche la dissection sûre ; sugammadex 4 mg/kg pour reversal.",
          "L'ERAS en prostatectomie radicale robotique permet une sortie à J1-J2 avec les critères : alimentation tolérée, analgésie orale efficace, patient autonome avec sonde vésicale."
        ],
        "pitfalls": [
          "Maintenir la PAM > 70 mmHg pendant tout le Trendelenburg (pas de PAM basse en Trendelenburg) : risque POVL.",
          "Utiliser une LMA en position de Trendelenburg profond : risque de fuite et de régurgitation lors de la mobilisation du robot.",
          "Ne pas anticiper la difficulté de l'extubation après Trendelenburg prolongé (œdème laryngé) : inspecter la glotte si doute avant extubation."
        ],
        "references": [
          {"source": "ERAS Society — Radical Prostatectomy Guidelines", "year": 2022, "note": "Optimisation périopératoire prostatectomie radicale."},
          {"source": "EAU — Prostate Cancer Guidelines", "year": 2023, "note": "Indications, technique, résultats oncologiques."},
          {"source": "Anesthesia & Analgesia — POVL in Robotic Surgery", "year": 2022, "note": "Facteurs de risque POVL en Trendelenburg prolongé."}
        ]
      }
    }
  }$pr$::jsonb,
  '["ponv","anticoag"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

COMMIT;
