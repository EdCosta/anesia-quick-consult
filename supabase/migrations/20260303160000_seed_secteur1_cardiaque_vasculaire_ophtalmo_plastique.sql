BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTEUR 1 — Chirurgie Cardiaque / Thoracique / Vasculaire / Ophtalmo / Plastique
-- Source : Fascicule Protocoles PGs 2025-2026, CHU Saint-Pierre (Bruxelles)
-- International guideline complements labelled [Complément – Source: XXX, Année]
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── A. CHIRURGIE CARDIAQUE ──────────────────────────────────────────────

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'pontage_coronarien_cabg',
  'chirurgie-cardiaque',
  '["chirurgie-cardiaque"]'::jsonb,
  '{"fr":"Pontage aorto-coronarien (CABG) avec ou sans CEC","en":"Coronary artery bypass grafting (CABG) with or without CPB","pt":"Revascularização miocárdica (CABG) com ou sem CEC"}'::jsonb,
  '{"fr":["CABG","pontage coronarien","PAC","MIDCAB","chirurgie coronarienne","by-pass coronarien"],"en":["CABG","coronary bypass","MIDCAB","off-pump CABG"],"pt":["CABG","revascularização miocárdica","ponte coronária"]}'::jsonb,
  $content${
    "quick": {
      "fr": {
        "preop": [
          "Évaluation pré-anesthésique cardiaque : EuroSCORE II, Score de Lee, METs ; anamnèse complète, ECG, ETT ± ETO, coronarographie, Echo-Doppler TSA, Rx thorax, EFR.",
          "Biologie complète : NFS, coagulation, fibrinogène, HbA1c, bilan martial, groupe sanguin ×2, RAI, ionogramme, créatinine, troponines.",
          "Adaptation des traitements : bêta-bloquants maintenus ; IEC arrêt J0 si HTA (maintenu si insuffisance cardiaque) ; DOAC arrêt 48-96h ; AVK arrêt 5-10j et relais héparine/HBPM selon protocole ; antidiabétiques selon molécule.",
          "Prémédication : benzodiazépine (adapter âge/comorbidités) + pantoprazole 40mg PO ; bas Kendall (sauf contre-indication).",
          "[Complément – Source: ESAIC Patient Blood Management Guidelines, 2023] Dépister et corriger une anémie ferriprive préopératoire (fer IV si délai ≥ 2 semaines) ; objectif Hb ≥ 13 g/dL avant chirurgie élective."
        ],
        "intraop": [
          "Monitoring complet : ECG 5 dérivations, KT radial, SpO2, Entropie/BIS, NIRS/Foresight bilatéral (SN), VVC 3 voies, PICCO ou Swan-Ganz ou Hemosphere selon profil, ETO systématique.",
          "Préparation salle : noradrénaline 16 µg/ml, dobutamine 1 mg/ml, lévosimendan 0,05 mg/ml ; rémifentanil 50 µg/ml, propofol 10 mg/ml, sévoflurane adjuvant, cisatracurium 2 mg/ml.",
          "Antibioprophylaxie : céfazoline 2g (3g si BMI 30-40 kg/m²) (4g si BMI >40 kg/m²) + 1g au démarrage de la CEC ; vancomycine 15 mg/kg ou clindamycine 900mg si allergie pénicilline ou MRSA+.",
          "Acide tranexamique : bolus 15 mg/kg + entretien 1,5 mg/kg/h pendant toute la durée de la CEC. Héparine 300 UI/kg (200 UI/kg si off-pump) ; ACT cible > 400 s ; protamine 1 mg/mg d'héparine totale, débit max 50 mg/min.",
          "Induction douce avec vidéolaryngoscopie recommandée ; dexaméthasone 8mg IV. Cell Saver systématique ; ROTEM en cas de saignement anormal. Ventilation protectrice sous CEC [Complément – Source: ESA Perioperative Bleeding Guidelines, 2023]."
        ],
        "postop": [
          "Analgésie multimodale post-CEC : paracétamol 1g + MgSO4 40-80 mg/kg IV + morphine 10mg + PCIA morphine (1 mg/ml, bolus 2 mg/10 min, max 20 mg/4h).",
          "ALR en fin d'intervention : bloc parasternal bilatéral + TAP sous-costal (sternotomie) ou bloc serratus avec KT (chirurgie mini-invasive axillaire).",
          "Extubation précoce visée (fast-track) ; transfert en USI sous monitoring continu.",
          "[Complément – Source: ERAS Cardiac Surgery Society, 2019] Mobilisation précoce J0/J1, réalimentation orale dès extubation, limiter les apports de cristalloïdes, prévention du syndrome post-péricardiotomie (AINS ou colchicine).",
          "Thromboprophylaxie : bas Kendall + HBPM selon protocole ; surveillance ECG pour arythmies post-CEC (FA postopératoire 20-40% des cas)."
        ],
        "red_flags": [
          "Bas débit cardiaque post-CEC (IC < 2,2 L/min/m²) : optimiser précharge, dobutamine, envisager IABP ou assistance ventriculaire selon gravité.",
          "Tamponnade post-opératoire (hypotension + turgescence jugulaire + égalisation pressions) : drainage chirurgical urgent.",
          "Syndrome vasoplégique post-CEC (hypotension + RVS effondrée) : noradrénaline ± vasopressine ; corticoïdes si réfractaire.",
          "Saignement médiastinal > 200 ml/h × 2h ou > 400 ml/h : ROTEM immédiat + reprise chirurgicale si non corrigé par transfusion."
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction_entretien"},
          {"drug_id": "remifentanil", "indication_tag": "analgesie_TIVA"},
          {"drug_id": "sevoflurane", "indication_tag": "entretien_adjuvant"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation"},
          {"drug_id": "sugammadex", "indication_tag": "reversal"},
          {"drug_id": "noradrenaline", "indication_tag": "vasopresseur"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "acide_tranexamique", "indication_tag": "antifibrinolytique"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie_postop"},
          {"drug_id": "morphine", "indication_tag": "PCIA_postop"},
          {"drug_id": "dexamethasone", "indication_tag": "anti_inflammatoire"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Le protocole St-Pierre prévoit une induction douce par rémifentanil + propofol + cisatracurium, avec vidéolaryngoscopie systématiquement recommandée pour minimiser le stimulus sympathique à l'intubation.",
          "L'acide tranexamique (Exacyl) est utilisé systématiquement en chirurgie cardiaque avec CEC : le bolus 15 mg/kg + continu 1,5 mg/kg/h réduit la transfusion de 30-40% (ESA Guidelines 2023).",
          "Le MIDCAB (voie transaxillaire, off-pump) requiert héparine 200 UI/kg au lieu de 300 UI/kg et n'utilise pas de circuit CEC ; la gestion hémodynamique différente avec risque de bas débit lors des positions du cœur."
        ],
        "pitfalls": [
          "Ne pas omettre le NIRS bilatéral en chirurgie carotido-coronarienne combinée ou en cas d'arrêt circulatoire planifié sous hypothermie.",
          "La protamine doit être injectée lentement (max 50 mg/min) : injection rapide → anaphylaxie, bronchospasme, hypotension sévère.",
          "La CEC induit une coagulopathie dilutionnelle et de consommation : le ROTEM guide la thérapeutique hémostatique ciblée (fibrinogène, plaquettes, CCP selon résultat)."
        ],
        "references": [
          {"source": "ESA/ESAIC — Perioperative Bleeding Management Guidelines", "year": 2023, "note": "Patient Blood Management, transfusion thresholds, TXA in cardiac surgery."},
          {"source": "ERAS Cardiac Surgery Society — Enhanced Recovery", "year": 2019, "note": "Fast-track extubation, multimodal analgesia, early mobilisation."},
          {"source": "ESC/EACTS — Guidelines on Myocardial Revascularization", "year": 2018, "note": "Updated 2022. CABG vs PCI indications, Heart Team decision."}
        ]
      }
    }
  }$content$::jsonb,
  '["cardiac","icu"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'remplacement_valvulaire_cardiaque',
  'chirurgie-cardiaque',
  '["chirurgie-cardiaque"]'::jsonb,
  '{"fr":"Remplacement valvulaire / plastie valvulaire avec CEC","en":"Cardiac valve replacement or repair with CPB","pt":"Substituição ou plastia valvular com CEC"}'::jsonb,
  '{"fr":["RVA","RVMi","plastie mitrale","plastie tricuspide","valvuloplastie","prothèse valvulaire"],"en":["AVR","MVR","valve repair","valve replacement","mitral valve repair"],"pt":["substituição aórtica","substituição mitral","plastia valvular"]}'::jsonb,
  $content2${
    "quick": {
      "fr": {
        "preop": [
          "Protocole pré-opératoire identique à la chirurgie coronarienne (EuroSCORE II, bilan complet, adaptation traitements anticoagulants).",
          "ETO préopératoire obligatoire pour caractériser la lésion valvulaire, mesurer les annuli, planifier la technique (plastie vs remplacement).",
          "Plasties mini-invasives (VMi/Vtric) voie axillaire : vérifier Echo-Doppler TSA, absence de pathologie aortique proximale, examen colonne thoracique.",
          "Bilan hémostase étendu avant arrêt des anticoagulants de fond (valves mécaniques préexistantes).",
          "[Complément – Source: ESC/EACTS Valvular Heart Disease Guidelines, 2021] Décision opératoire en Heart Team ; identifier risque thromboembolique après chirurgie selon type de prothèse (mécanique = AVK à vie ; bioprothèse = AVK 3 mois puis aspirine)."
        ],
        "intraop": [
          "Monitoring commun chirurgie cardiaque + ETO peropératoire systématique : vérifier résultat de la réparation, absence d'IAo résiduel, fonction VG et VD.",
          "Céfazoline selon poids + 1g au démarrage CEC ; acide tranexamique 15 mg/kg + 1,5 mg/kg/h ; héparine 300 UI/kg ACT > 400 s.",
          "Plastie mitrale mini-invasive (voie axillaire) : monitoring NIRS systématique, canulation fémorale, attention à l'aération cardiopulmonaire.",
          "Remplacements valvulaires aortiques biologiques : vérifier taille anneau mesuré à l'ETO ; mismatch patient-prothèse (IPM) à éviter (surface effective indexée ≥ 0,85 cm²/m²).",
          "Test d'étanchéité systématique après réparation ; contrôle ETO de la prothèse avant sevrage CEC."
        ],
        "postop": [
          "Analgésie post-sternotomie : paracétamol 1g + MgSO4 40-80 mg/kg + PCIA morphine (identique CABG) + blocs parastenal ou serratus.",
          "Reprise anticoagulation : valves mécaniques → héparine IV dès J0 soir (TCA 60-80 s) puis AVK relais J1 ; bioprothèses → aspirine 75-100 mg/j.",
          "Surveillance ECG/monitoring continu 48-72h ; pace-maker temporaire en attente si BAV.",
          "Transfert USI ; critères fast-track extubation identiques CABG.",
          "[Complément – Source: ESC/EACTS, 2021] Endocardite précoce : protocole asepsie strict, ATB durée selon type de prothèse, hémocultures si fièvre > 38,5°C dans les 30 jours."
        ],
        "red_flags": [
          "IAo residuel sévère post-plastie (ETO peropératoire) : reprendre CEC et corriger avant fermeture.",
          "BAV complet post-RVA (10-15% des rétrécissements calcifiés) : pace-maker définitif si absence de récupération à J7.",
          "Dysfonction prothétique précoce (gradient élevé, régurgitation paravalvulaire) : ETO urgente.",
          "Hémolyse mécanique (anémie + LDH élevées + haptoglobine effondrée) : suspecter fuite paravalvulaire."
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "remifentanil", "indication_tag": "TIVA"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation"},
          {"drug_id": "noradrenaline", "indication_tag": "vasopresseur"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "acide_tranexamique", "indication_tag": "antifibrinolytique"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie"},
          {"drug_id": "morphine", "indication_tag": "PCIA"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "L'ETO peropératoire est indispensable dans toute chirurgie valvulaire : elle guide la décision plastie vs remplacement, vérifie le résultat immédiat et détecte les complications (IAo résiduel, dyskinésie, thrombus).",
          "Le mismatch patient-prothèse (IPM : surface effective indexée < 0,85 cm²/m²) est associé à une mortalité plus élevée après RVA : choisir une prothèse de taille suffisante ou réaliser un élargissement annulaire.",
          "Les plasties mitrales mini-invasives par voie axillaire droite ou thoracoscopique imposent une canulation fémorale et une occlusion endoaortique, avec vigilance accrue pour les embolies gazeuses cérébrales (NIRS)."
        ],
        "pitfalls": [
          "Retarder la reprise CEC pour corriger un résultat plastie insuffisant augmente le risque myocardique et les saignements : décider tôt sur l'ETO peropératoire.",
          "Oublier le bilan d'allergie à la protamine chez les diabétiques insulinotraités (risque d'anaphylaxie à la protamine de poisson).",
          "La cardioplègie froide hyperkaliémique peut aggraver une dysfonction préexistante du VD si protection inadéquate."
        ],
        "references": [
          {"source": "ESC/EACTS — Guidelines on Valvular Heart Disease", "year": 2021, "note": "Indications, type de prothèse, anticoagulation postopératoire."},
          {"source": "ASE/SCA — Comprehensive Echocardiographic Assessment", "year": 2022, "note": "ETO peropératoire en chirurgie valvulaire."},
          {"source": "ESAIC — Patient Blood Management Guidelines", "year": 2023, "note": "TXA, seuils transfusionnels, ROTEM en chirurgie cardiaque."}
        ]
      }
    }
  }$content2$::jsonb,
  '["cardiac","icu"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'tavi_implantation_aortique',
  'cardiologie-interventionnelle',
  '["cardiologie-interventionnelle","chirurgie-cardiaque"]'::jsonb,
  '{"fr":"TAVI — Implantation valvulaire aortique par voie percutanée","en":"TAVI — Transcatheter aortic valve implantation","pt":"TAVI — Implante valvular aórtico percutâneo"}'::jsonb,
  '{"fr":["TAVI","TAVR","remplacement valvulaire aortique percutané","voie fémorale","voie carotidienne"],"en":["TAVI","TAVR","transcatheter aortic valve replacement"],"pt":["TAVI","TAVR","substituição valvular aórtica percutânea"]}'::jsonb,
  $content3${
    "quick": {
      "fr": {
        "preop": [
          "Évaluation Heart Team multidisciplinaire obligatoire (cardiologue interventionnel, cardiochirurgien, anesthésiste) ; STS score / EuroSCORE II ; CT-scan aorto-iliaque pour planification voie d'abord.",
          "Bilan : ECG (rythme de base, BBG préexistant), ETT/ETO (surface valvulaire, gradient, fraction éjection VG), coronarographie, biologie complète, groupe + RAI compatibilisation 2U GRC.",
          "À ÉVITER pendant la procédure : tachycardie, hypotension, arythmie.",
          "Monitoring minimal obligatoire : ECG 5 dérivations, KTA radial gauche, SpO2, EtCO2, Entropie, patchs défibrillation.",
          "[Complément – Source: ESC/EACTS TAVI Consensus, 2021] Voie fémorale préférée (sédation profonde possible) ; voie carotidienne → AG + IOT obligatoire."
        ],
        "intraop": [
          "Voie fémorale : sédation profonde (VS conservée + canule de Guedel) ; propofol ± rémifentanil titrés ; pas de curarisation ; surveillance neurologique continue.",
          "Voie carotidienne : AG + IOT indispensable ; curarisation + monitoring BIS + NIRS.",
          "Antibioprophylaxie : céfazoline 2g + ampicilline 2g si voie fémorale ; héparinisation 100 UI/kg (ACT cible > 250 s).",
          "Étapes critiques : stimulation pace-maker temporaire (VD ou OD) ; pacing ventriculaire rapide 180-200 bpm pour apnée et immobilité lors du déploiement valvulaire ; ETT post-procédure immédiate (vérification position valve, absence IAo).",
          "Traitement hypotension post-déploiement : phényléphrine 100-200 µg IV + remplissage ; noradrénaline si vasoplégie réfractaire."
        ],
        "postop": [
          "ETT systématique dans les 24h ; surveillance continue ECG 48-72h (BBG, BAV, bloc infranodal).",
          "Critères de pace-maker définitif : BAV complet persistant > 24h, BBG nouveau + PR long, BBG + bloc bifasciculaire.",
          "Hémostase point de ponction fémoral : compression manuelle ou dispositif Proglide/Angio-Seal selon technique.",
          "Antiagrégation : aspirine 75mg/j + clopidogrel 75mg/j × 3-6 mois selon protocole cardiologue.",
          "[Complément – Source: ESC/EACTS, 2021] Durée anticoagulation post-TAVI à discuter en Heart Team (FA préexistante = AOD ; RS = double antiagrégation)."
        ],
        "red_flags": [
          "BAV haut degré ou ACR lors du pacing rapide : PM temporaire en secours + réanimation immédiate.",
          "Tamponnade peropératoire (perforation VD ou aorte) : drainage péricardique percutané ou conversion chirurgicale urgente.",
          "Migration ou embolisation de la prothèse : conversion chirurgicale ; avoir chirurgien cardiaque disponible en salle.",
          "AVC périprocédural : neuroprotection et alerte neurovasculaire immédiate."
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "sedation_profonde"},
          {"drug_id": "remifentanil", "indication_tag": "analgesie_sedation"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation_AG"},
          {"drug_id": "phenylephrine", "indication_tag": "hypotension"},
          {"drug_id": "noradrenaline", "indication_tag": "vasoplegie"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "atropine", "indication_tag": "bradycardie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Le TAVI a supplanté la chirurgie conventionnelle chez les patients à haut et intermédiaire risque opératoire (PARTNER, SURTAVI, NOTION trials) ; son extension aux patients à bas risque est en cours d'évaluation.",
          "La sédation consciente/profonde (sans intubation) est devenue le standard pour la voie fémorale dans la plupart des centres experts : moins de complications respiratoires, extubation immédiate, durée de séjour réduite.",
          "Le BBG post-TAVI survient dans 15-30% des cas selon le type de prothèse (surtout autopositionnables) : sa gestion varie selon les centres (monitoring prolongé vs implantation prophylactique de PM)."
        ],
        "pitfalls": [
          "Débuter le pacing ventriculaire rapide sans confirmer la capture ECG : déploiement sub-optimal si tachycardie inefficace.",
          "Sous-estimer un IAo paravalvulaire modéré post-déploiement (ETT/ETO peropératoire) : prédicteur de mortalité à 2 ans.",
          "Négliger la surveillance neurologique post-procédure : l'AVC silencieux (MRI diffusion) survient dans 50-70% des TAVI ; l'AVC symptomatique dans 2-4%."
        ],
        "references": [
          {"source": "ESC/EACTS — Guidelines on Valvular Heart Disease (TAVI section)", "year": 2021, "note": "Sélection patients, technique, gestion antithrombotique."},
          {"source": "JAMA — Anesthesia Type and TAVR Outcomes", "year": 2023, "note": "Sedation vs general anesthesia for TAVR."},
          {"source": "VARC-3 — Valve Academic Research Consortium", "year": 2021, "note": "Endpoints standardisés pour les études TAVI."}
        ]
      }
    }
  }$content3$::jsonb,
  '["cardiac","icu"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'ablation_arythmie_rythmologie',
  'cardiologie-interventionnelle',
  '["cardiologie-interventionnelle"]'::jsonb,
  '{"fr":"Ablation d''arythmie — Électrophysiologie interventionnelle","en":"Cardiac arrhythmia ablation — Interventional electrophysiology","pt":"Ablação de arritmia — Eletrofisiologia intervencionista"}'::jsonb,
  '{"fr":["ablation flutter","ablation FA","ablation TSVP","ablation ESV","ablation AVNRT","ablation AVRT","ablation fibrillation auriculaire","rythmologie"],"en":["AF ablation","flutter ablation","SVT ablation","EP study","PVI"],"pt":["ablação flutter","ablação FA","ablação TSV"]}'::jsonb,
  $content4${
    "quick": {
      "fr": {
        "preop": [
          "Procédures droites (flutter CTI, TSV/AVNRT/AVRT, ESV RVOT) : sédation légère possible (rémifentanil AIVOC Cet 0,5-1 ng/ml) → AG (masque laryngé) si procédure longue ou gênante.",
          "Procédures gauches (ablation FA, AVRT OG, ESV LVOT) : AG + IOT obligatoire + ETO systématique (vérification absence de thrombus en OG/appendice auriculaire gauche avant ponction transseptale).",
          "[Complément – Source: HRS/ESC, 2023] Gestion péri-procédurale DOAC : ablation FA sous anticoagulation continue (AOD non interrompus de préférence) ou bridging selon protocole.",
          "Monitoring spécifique : ECG 12 dérivations, patchs de cardioversion externa défibrillation, monitoring température œsophagienne spécifique (ablation FA par radiofréquence).",
          "Bilan pré-op : biologie, TP/TCA, groupe sanguin, ionogramme, ETT/ETO, scanner cardiaque pour cartographie anatomique si FA."
        ],
        "intraop": [
          "Héparinisation systématique : 70 UI/kg IV dès ponction veineuse (procédures gauches), ACT cible ≥ 300 s ; contrôle ACT horaire.",
          "Abord transseptal (procédures gauches) : guidé sous ETO (ou scopie seule) ; vérification position aiguille avant ponction ; risque de tamponnade.",
          "Ablation FA par radiofréquence : sonde de température œsophagienne obligatoire (risque fistule atrio-œsophagienne si T° > 39°C = stop ablation ipsilatérale).",
          "Prévenir BAV dans l'ablation AVNRT (jonction AV adjacente au circuit) ; toujours cartographier avant d'appliquer les RF.",
          "Cardioversion électrique externe disponible en salle ; défibrillateur chargé et patchs en place."
        ],
        "postop": [
          "Surveillance en salle de réveil puis cardiologie interventionnelle : ECG, SpO2, TA ; point de ponction inguinal à surveiller.",
          "Anticoagulation post-ablation FA : AOD ou AVK à reprendre dès H4 post-procédure ; durée ≥ 2 mois puis décision selon score CHA₂DS₂-VASc.",
          "Critères de sortie J0 (procédures droites simples) ou J+1 (procédures gauches) : stabilité hémodynamique, absence de complication.",
          "[Complément – Source: ESC, 2020 AF Guidelines] Surveillance à distance (monitor Holter ou implantable) pour évaluer succès ablatif à 3 et 12 mois.",
          "Thromboprophylaxie TVP : bas de compression + HBPM si mobilisation réduite."
        ],
        "red_flags": [
          "Tamponnade péricardique (hypotension brutale + épanchement écho) : drainage péricardique percutané d'urgence.",
          "Lésion du nerf phrénique (ablation veine pulmonaire supérieure droite) : surveillance hiccups/dyspnée, mapping phrénique avant ablation.",
          "Fistule atrio-œsophagienne (apparition retardée J5-J30 : fièvre + douleur thoracique + AVC) : urgence chirurgicale absolue.",
          "AV block complet lors ablation AVNRT : cesser immédiatement les RF ; pose de PM temporaire si non réversible."
        ],
        "drugs": [
          {"drug_id": "remifentanil", "indication_tag": "sedation_AIVOC"},
          {"drug_id": "propofol", "indication_tag": "induction_AG"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation_AG"},
          {"drug_id": "midazolam", "indication_tag": "premedication_sedation"},
          {"drug_id": "atropine", "indication_tag": "bradycardie_BAV"},
          {"drug_id": "noradrenaline", "indication_tag": "hypotension"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "L'ablation de la FA est une procédure gauche nécessitant AG + IOT + ETO : l'exclusion d'un thrombus en OG est indispensable avant ponction transseptale (risque d'AVC embolique).",
          "La surveillance de la température œsophagienne (seuil stop à 39°C) est la principale mesure de prévention de la fistule atrio-œsophagienne, complication rare mais quasi-fatale.",
          "Pour l'ablation AVNRT, la jonction AV est à distance critique de la zone cible : la cartographie 3D (CARTO/EnSite) réduit le risque de BAV iatrogène."
        ],
        "pitfalls": [
          "Ne pas vérifier le statut anticoagulant et la présence de thrombus OG avant ponction transseptale = risque embolique majeur.",
          "Utiliser du N₂O en AG pour une ablation FA : contre-indiqué (distension cavités pouvant gêner la cartographie et risque de barotraumatisme en cas de tamponnade).",
          "Sous-estimer les douleurs post-ablation : les brûlures endocardiques peuvent nécessiter paracétamol + AINS les premières 48h."
        ],
        "references": [
          {"source": "HRS/ESC — Catheter Ablation of Atrial Fibrillation Guidelines", "year": 2023, "note": "Anticoagulation péri-procédurale, indications, complications."},
          {"source": "ESC — 2020 AF Guidelines", "year": 2020, "note": "Ablation FA : indications, suivi antiarythmique."},
          {"source": "Heart Rhythm Journal — EP Complication Registry", "year": 2022, "note": "Tamponnade, fistule AO, AVC : fréquence et gestion."}
        ]
      }
    }
  }$content4$::jsonb,
  '["cardiac"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'fermeture_fop',
  'cardiologie-interventionnelle',
  '["cardiologie-interventionnelle"]'::jsonb,
  '{"fr":"Fermeture percutanée de foramen ovale perméable (FOP)","en":"Percutaneous patent foramen ovale (PFO) closure","pt":"Encerramento percutâneo do foramen ovale patente (FOP)"}'::jsonb,
  '{"fr":["FOP","foramen ovale perméable","fermeture FOP","Amplatzer FOP","cryptogenic stroke"],"en":["PFO closure","patent foramen ovale","Amplatzer occluder"],"pt":["FOP","foramen ovale patente","encerramento FOP"]}'::jsonb,
  $content5${
    "quick": {
      "fr": {
        "preop": [
          "Indication principale : AVC ischémique cryptogénique avec FOP significatif (CLOSE, DEFENSE-PFO, REDUCE trials).",
          "ETO pré-op : caractériser la taille du FOP, l'anévrysme du septum interauriculaire, la direction du shunt.",
          "Traitement anticoagulant péri-procédural selon protocole cardiologue (aspirine + clopidogrel le plus souvent).",
          "Céfazoline 2g IV prophylaxie (3g si BMI > 30 kg/m²).",
          "AG + IOT obligatoire (guidage ETO continu pour positionnement de l'occludeur)."
        ],
        "intraop": [
          "AG + IOT + ETO peropératoire continue : guidage de la ponction transseptale et du déploiement de la prothèse.",
          "Héparinisation selon cardiologue (ACT cible > 200 s).",
          "Réveil profond recommandé (éviter toux ou manœuvre de Valsalva au point de ponction fémoral) : extubation une fois réflexes protecteurs bien présents.",
          "NVPO prévention : ondansétron + dexaméthasone (risque de toux au réveil).",
          "ETT contrôle immédiat en salle pour vérifier la position de l'occludeur."
        ],
        "postop": [
          "Anticoagulation post-procédurale : aspirine 75-100 mg/j + clopidogrel 75 mg/j × 1-6 mois selon protocole.",
          "Surveillance ECG (arythmies auriculaires possibles avec l'occludeur).",
          "Critères de sortie J0-J1 : stabilité hémodynamique, point de ponction fémoral sec, ETT avant sortie.",
          "[Complément – Source: ESC, 2021 AF Guidelines] Surveiller apparition de FA dans les 3 mois (port d'un patch ECG si indiqué).",
          "Thrombose d'occludeur rare mais possible : antiagrégants ≥ 6 mois."
        ],
        "red_flags": [
          "Embolisation de l'occludeur (migration vers VG ou aorte) : conversion chirurgicale urgente.",
          "Tamponnade lors ponction transseptale : drainage péricardique percutané.",
          "FA de novo post-procédure : cardioversion électrique si mal tolérée ; anticoagulation adaptée.",
          "AVC embolique en post-procédure précoce : antiagrégation insuffisante ou thrombus sur occludeur."
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "remifentanil", "indication_tag": "entretien"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation"},
          {"drug_id": "sugammadex", "indication_tag": "reversal"},
          {"drug_id": "ondansetron", "indication_tag": "PONV"},
          {"drug_id": "dexamethasone", "indication_tag": "PONV"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Trois grands essais randomisés (CLOSE, DEFENSE-PFO, REDUCE) ont établi la supériorité de la fermeture percutanée sur le traitement médical seul pour la prévention secondaire des AVC cryptogéniques.",
          "L'ETO peropératoire est indispensable : elle guide la ponction transseptale, confirme la position avant déploiement et exclut un shunt résiduel immédiat.",
          "Le réveil profond avec extubation douce est important : toute toux ou effort prononcé peut mobiliser l'occludeur avant son endothélialisation."
        ],
        "pitfalls": [
          "Ne pas contrôler l'ETT avant la sortie : une position sous-optimale ou un shunt résiduel significatif nécessite une réintervention précoce.",
          "Oublier d'instaurer la double antiagrégation : thrombose d'occludeur et embolie paradoxale sont des complications évitables.",
          "Confondre fermeture FOP et traitement d'une CIA : les tailles d'occludeurs et techniques diffèrent significativement."
        ],
        "references": [
          {"source": "CLOSE Trial — NEJM", "year": 2017, "note": "PFO closure vs anticoagulation vs antiplatelet for stroke prevention."},
          {"source": "ESC — 2021 Valvular/Structural Heart Disease Guidelines", "year": 2021, "note": "Indications FOP closure."},
          {"source": "ESAIC — Peri-procedural Anticoagulation in Interventional Cardiology", "year": 2022, "note": "Gestion antithrombotique péri-procédurale."}
        ]
      }
    }
  }$content5$::jsonb,
  '["cardiac"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- ─── C. OPHTALMOLOGIE ────────────────────────────────────────────────────

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'ophtalmologie_ala',
  'ophtalmologie',
  '["ophtalmologie"]'::jsonb,
  '{"fr":"Anesthésie locale assistée (ALA) en ophtalmologie","en":"Monitored anesthesia care (MAC) for ophthalmology","pt":"Anestesia local assistida (ALA) em oftalmologia"}'::jsonb,
  '{"fr":["ALA","anesthésie locale assistée","cataracte ALA","vitrectomie ALA","glaucome chirurgie","trabéculectomie","bloc péribulbaire","bloc rétrobulbaire"],"en":["MAC ophthalmology","local anesthesia cataract","peribulbar block","retrobulbar block","sub-tenon"],"pt":["ALA oftalmologia","anestesia local catarata","bloqueio peribulbar"]}'::jsonb,
  $content6${
    "quick": {
      "fr": {
        "preop": [
          "Indications : cataracte (chambre antérieure/postérieure), vitrectomie, chirurgie du glaucome (trabéculectomie), procedures laser maculaires.",
          "Questionnaire médecin traitant obligatoire (rapport médical pré-opératoire) ; évaluation anxiété, coopération patient.",
          "PAS d'arrêt anticoagulants/antiagrégants sauf exception expressément demandée par le chirurgien ; continuer les traitements ophtalmologiques locaux.",
          "Prémédication : alprazolam 0,25-0,5 mg PO (adapter si BPCO, âge avancé, insuffisance respiratoire) ; diabétiques : adaptation insuline/ADO selon protocole.",
          "[Complément – Source: ESRA Regional Anaesthesia in Ophthalmology, 2023] Technique de bloc : péribulbaire (anesthésie de contact + block volume 5-8 ml), rétrobulbaire (risque piqûre), sous-ténonien (atraumatique) selon habitude et type de chirurgie."
        ],
        "intraop": [
          "Anesthésie topique (collyre) ± sédation légère (midazolam 1-2 mg IV) pour les blocs.",
          "Bloc péribulbaire ou sous-ténonien : lidocaïne 2% ± bupivacaïne 0,5% + hyaluronidase 15 UI/ml ; volume 5-8 ml/quadrant.",
          "[Complément – ESRA 2023] Bloc sous-ténonien : moindre risque de perforation du globe, d'hématome rétrobulbaire et de transmission au nerf optique ; recommandé en première intention.",
          "Monitoring minimal peropératoire : TA non invasive, SpO2, ECG si antécédents cardiaques.",
          "Réflexe oculo-cardiaque (ROC) : bradycardie vagale lors de traction globe → atropine 0,5 mg IV si FC < 50 bpm."
        ],
        "postop": [
          "Surveillance minimum 1h post-intervention en SSPI si pas de complication.",
          "Critères de sortie ambulatoire : TA stable, douleur oculaire < 4/10, acuité visuelle tolérée, instructions de retour domicile comprises.",
          "Analgésie post-op : paracétamol 1g PO ± ibuprofène 400 mg si prescrit.",
          "Oculomotricité temporairement abolie (bloc péri/rétrobulbaire) : informer le patient.",
          "[Complément – Anesthesiology, 2020] Score Apfel : prévenir NVPO (fréquents en vitrectomie/strabisme) avec dexaméthasone ± ondansétron si risque élevé."
        ],
        "red_flags": [
          "Hématome rétrobulbaire (douleur intense + proptose) : compression externe immédiate + avis ophtalmologique urgence.",
          "Injection intrathécale accidentelle (rétrobulbaire) : perte de conscience + apnée + hypotension → réanimation immédiate.",
          "Syncope vasovagale lors de la pose du bloc : décubitus + atropine.",
          "Perforation globe lors du bloc (douleur + perte vision) : ophtalmologue urgence."
        ],
        "drugs": [
          {"drug_id": "midazolam", "indication_tag": "sedation_legere"},
          {"drug_id": "lidocaine", "indication_tag": "bloc_local"},
          {"drug_id": "bupivacaine", "indication_tag": "bloc_peribulbaire"},
          {"drug_id": "atropine", "indication_tag": "reflexe_oculo_cardiaque"},
          {"drug_id": "ondansetron", "indication_tag": "PONV"},
          {"drug_id": "dexamethasone", "indication_tag": "PONV"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "La technique sous-ténonienne (canal de Tenon) est considérée comme la plus sûre (ESRA 2023) : pas de risque de perforation accidentelle du globe, anesthésie de qualité comparable, mais parfois œdème conjonctival gênant la visualisation.",
          "La pression intraoculaire (PIO) est influencée par la position, la ventilation (PaCO2), la PVC et l'anesthésie : éviter en AG une PaCO2 < 35 mmHg (baisse PIO) et une hyperventilation prolongée.",
          "Le réflexe oculo-cardiaque est médié par le trijumeau-vague : maximum lors des tractions sur les muscles extraoculaires (strabisme) ou de pressions sur le globe ; atropine IV préventive discutée en pédiatrie."
        ],
        "pitfalls": [
          "Réaliser un bloc rétrobulbaire chez un patient myope fort (axe oculaire > 26 mm) : risque de perforation du globe augmenté ; préférer sous-ténonien.",
          "Oublier de vérifier la coopération du patient avant ALA : un patient très anxieux/claustrophobe non prémédiqué peut rendre la chirurgie impossible sans AG.",
          "Autoriser la sortie sans vérifier l'absence d'hématome rétrobulbaire dans les 30 min post-bloc."
        ],
        "references": [
          {"source": "ESRA — Regional Anaesthesia in Ophthalmology", "year": 2023, "note": "Blocs orbitaires : péribulbaire, rétrobulbaire, sous-ténonien ; recommandations pratiques."},
          {"source": "Anesthesiology — Apfel Score and PONV in Ophthalmology", "year": 2020, "note": "Prophylaxie NVPO adaptée selon score Apfel en chirurgie ophtalmologique."},
          {"source": "RCOphth/RCoA — Local Anaesthesia for Intraocular Surgery", "year": 2022, "note": "Guidelines UK pour l'anesthésie locale ophtalmologique."}
        ]
      }
    }
  }$content6$::jsonb,
  '[]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- ─── D. CHIRURGIE THORACIQUE ─────────────────────────────────────────────

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'thoracotomie',
  'chirurgie-thoracique',
  '["chirurgie-thoracique"]'::jsonb,
  '{"fr":"Thoracotomie — Chirurgie pulmonaire ouverte","en":"Thoracotomy — Open pulmonary surgery","pt":"Toracotomia — Cirurgia pulmonar aberta"}'::jsonb,
  '{"fr":["thoracotomie","lobectomie","pneumectomie","résection pulmonaire","bilobectomie","chirurgie thoracique ouverte"],"en":["thoracotomy","lobectomy","pneumonectomy","lung resection","open lung surgery"],"pt":["toracotomia","lobectomia","pneumonectomia","ressecção pulmonar"]}'::jsonb,
  $content7${
    "quick": {
      "fr": {
        "preop": [
          "Bilan fonctionnel respiratoire obligatoire : EFR (VEMS, CVF, DLCO), scanner thoracique, Rx thorax ; VO2 max si pneumectomie envisagée (seuil opérabilité > 10 ml/kg/min).",
          "Examen colonne thoracique (planification péridurale), test d'Allen (KTA côté opposé), critères de ventilation difficile (tube double lumière).",
          "Biologie complète + groupe/RAI + compatibilisation 2U GRC + ECG + avis cardio si nécessaire.",
          "Adaptation traitements : stop IEC ; alprazolam 0,5 mg si bonne fonction respiratoire (prudence BPCO/SpO2 < 92%).",
          "[Complément – ERS/ESTS Resectability Guidelines, 2009] Critères de non-résécabilité : VEMS < 40% prédit, DLCO < 40%, VO2max < 10 ml/kg/min → bilan fonctionnel complémentaire ou traitement alternatif."
        ],
        "intraop": [
          "Voies d'accès : VVP 16-18G côté OPPOSÉ à la chirurgie, KTA côté opposé (artère radiale ou fémorale), VVC sous-clavière côté OPÉRÉ (ou 2ème VVP), + entropie + sonde vésicale + thermométrie + monitoring curarisation + fibroscope disponible + bas à compression.",
          "Intubation double lumière (DLT) : tube gauche sauf si pneumectomie droite ; choix taille F/H selon taille du patient ; vérification fibroscopique systématique après mise en place.",
          "Péridurale thoracique : désinfection chirurgicale + dose-test xylocaïne + adrénaline 3 ml ; lévobupivacaïne 0,25% + sufentanil 0,5 µg/ml ; KT tunnelisé côté OPPOSÉ ; continu 4-5 ml/h.",
          "PCEA péridurale : bolus 5 ml, continu 5 ml/h, lock-out 45 min, max 45 ml/4h.",
          "AG : propofol + rémifentanil + rocuronium (curarisation profonde) ; céfazoline 2g IVL avant incision."
        ],
        "postop": [
          "Surveillance en USI (pneumectomie, comorbidités majeures) ou SSPI étendue (lobectomies).",
          "Analgésie : péridurale thoracique PCEA en continu (objectif EVA < 3) ; paracétamol 1g/6h IV + AINS si pas de CI.",
          "Gestion du drain thoracique : bulle à eau, surveillance bullage et saignement ; mobilisation drain H+6-12h selon chirurgien.",
          "[Complément – ERAS Thoracic Surgery, 2019] Extubation précoce en SSPI si critères : SpO2 > 94%, FR < 25/min, force musculaire TOF ≥ 0,9, douleur < 4/10, T° > 36°C.",
          "Spirométrie incitative dès J0 ; kinésithérapie respiratoire J1 ; mobilisation précoce."
        ],
        "red_flags": [
          "Désaturation pendant la ventilation unipulmonaire : optimiser FiO2 + CPAP poumon non ventilé + PEEP poumon ventilé + vérifier position DLT (fibroscope).",
          "Bullage persistant > 7j ou saignement > 200 ml/h post-op : revoir drain (coudé ?) ou reprise chirurgicale.",
          "Fibrillation auriculaire post-op (20-30% lobectomies, 50% pneumectomies) : amiodarone IV ou cardioversion selon tolérance.",
          "Fistule broncho-pleurale (fièvre + bullage massif + pneumothorax tardif) : urgence chirurgicale ou bronchoscopique."
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "remifentanil", "indication_tag": "TIVA_analgesie"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation"},
          {"drug_id": "sugammadex", "indication_tag": "reversal"},
          {"drug_id": "bupivacaine", "indication_tag": "peridurale_thoracique"},
          {"drug_id": "sufentanil", "indication_tag": "peridurale_thoracique"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "La ventilation unipulmonaire est nécessaire pour la chirurgie thoracique ouverte : objectif SpO2 > 93%, ventilation protectrice (Vt 5-6 ml/kg poids idéal, PEEP 5 cmH2O, FiO2 titrée).",
          "La péridurale thoracique est le gold standard analgésique après thoracotomie : réduction morphine 60-70%, amélioration de la fonction respiratoire post-op, réduction des complications pulmonaires.",
          "Le test d'Allen vérifie la perméabilité de l'arcade palmaire avant KT radial : si artère ulnaire absente ou insuffisante, KT fémoral ou huméral préféré."
        ],
        "pitfalls": [
          "Ne pas vérifier la position du DLT par fibroscopie après retournement : migration fréquente en décubitus latéral.",
          "Choisir un DLT trop petit : fuites persistantes, ventilation unipulmonaire difficile.",
          "Oublier la dose-test avant injection péridurale et ne pas surveiller le bloc moteur : risque d'injection intrathécale."
        ],
        "references": [
          {"source": "ERS/ESTS — Resectability Functional Evaluation", "year": 2009, "note": "Critères opérabilité fonctionnelle respiratoire en chirurgie thoracique."},
          {"source": "ERAS Thoracic Surgery — Guidelines", "year": 2019, "note": "Enhanced recovery after thoracic surgery."},
          {"source": "Anesthesia & Analgesia — One-Lung Ventilation VATS", "year": 2022, "note": "Gestion peropératoire ventilation unipulmonaire."}
        ]
      }
    }
  }$content7$::jsonb,
  '["icu"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'vats_thoracoscopie',
  'chirurgie-thoracique',
  '["chirurgie-thoracique"]'::jsonb,
  '{"fr":"Thoracoscopie vidéo-assistée (VATS)","en":"Video-assisted thoracoscopic surgery (VATS)","pt":"Cirurgia torácica video-assistida (VATS)"}'::jsonb,
  '{"fr":["VATS","thoracoscopie","lobectomie VATS","résection pulmonaire vidéo-assistée","RATS","thoracoscopie robot"],"en":["VATS","RATS","video thoracoscopy","minimally invasive thoracic surgery"],"pt":["VATS","toracoscopia video-assistida"]}'::jsonb,
  $content8${
    "quick": {
      "fr": {
        "preop": [
          "Bilan identique à la thoracotomie ouverte (EFR, DLCO, VO2max si pneumectomie, scanner, bilan biologique complet).",
          "VATS permet des résections moindres (lobectomie, segmentectomie, wedge) avec moindre morbidité qu'une thoracotomie.",
          "Pas de VVC systématique (sauf comorbidités majeures) ; KTA selon état du patient et type de résection.",
          "Péridurale thoracique ou alternative ALR selon discussion avec superviseur et chirurgien (bloc paravertébral, blocs intercostaux, SERRATUS ± KT, infiltration trocarts).",
          "[Complément – ERAS Thoracic Surgery, 2019] VATS est la voie d'abord préférée pour la lobectomie (moins de douleur, récupération plus rapide, durée d'hospitalisation réduite)."
        ],
        "intraop": [
          "Tube double lumière (DLT) ou bloqueur bronchique pour la ventilation unipulmonaire ; vérification fibroscopique systématique.",
          "Monitoring : VVP 16-18G côté opposé, KTA selon état, SpO2, Entropie, monitoring curarisation.",
          "AG : propofol + rémifentanil + rocuronium ; céfazoline 2g.",
          "Analgésie ALR selon discussion préop : bloc paravertébral écho-guidé (ropivacaïne 0,5% 15-20 ml) ou blocs intercostaux ou infiltration trocarts (prudence toxicité AL sur volume total).",
          "Ventilation protectrice unipulmonaire (Vt 5 ml/kg poids idéal, PEEP 5-8, FiO2 titrée SpO2 > 93%)."
        ],
        "postop": [
          "Extubation en salle d'opération si critères remplis (ERAS VATS).",
          "Analgésie multimodale : paracétamol 1g/6h + AINS 48h + ALR péridurale/paravertébrale + opioides rescue.",
          "Drain thoracique unique le plus souvent ; déclamprage et mobilisation sous surveillance.",
          "Mobilisation précoce J0 (si extubation peropératoire) ou J1.",
          "Spirométrie incitative systématique."
        ],
        "red_flags": [
          "Désaturation peropératoire lors ventilation unipulmonaire (idem thoracotomie) : vérifier position DLT + CPAP + augmenter FiO2.",
          "Conversion en thoracotomie ouverte (saignement, difficultés techniques) : anticiper et informer l'équipe.",
          "Emphysème sous-cutané cervical (CO2 insufflé ou bullage sous pression) : décomprimer trocart.",
          "Douleur intercostale chronique post-VATS (10-20%) : suivi algologique à prévoir."
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "remifentanil", "indication_tag": "TIVA"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation"},
          {"drug_id": "sugammadex", "indication_tag": "reversal"},
          {"drug_id": "bupivacaine", "indication_tag": "bloc_paravertebral"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "La VATS permet une lobectomie avec une mortalité à 30j < 1% dans les centres experts vs 2-3% en chirurgie ouverte ; les complications pulmonaires postopératoires sont 50% moins fréquentes.",
          "Le bloc paravertébral uni ou bilatéral est une alternative efficace à la péridurale thoracique pour la VATS : même contrôle douloureux, moins de complications hémodynamiques.",
          "La robotique (RATS) offre des avantages ergonomiques mais pas de supériorité clinique démontrée vs VATS conventionnelle pour les résections lobaires standard."
        ],
        "pitfalls": [
          "Utiliser un bloqueur bronchique sans vérification fibroscopique : migration fréquente avec soufflet du bloqueur mal positionné.",
          "Dépasser le volume maximal de ropivacaïne pour les blocs intercostaux multiples (toxicité AL) : calculer dose totale.",
          "Ne pas anticiper la conversion en thoracotomie : équipement DLT + thoracotomie toujours préparé."
        ],
        "references": [
          {"source": "ERAS Thoracic Surgery Society — Guidelines", "year": 2019, "note": "VATS recommandé pour lobectomie ; extubation précoce ; ALR multimodale."},
          {"source": "Anesthesia & Analgesia — One-Lung Ventilation Optimization", "year": 2022, "note": "Ventilation protectrice peropératoire en chirurgie thoracique."},
          {"source": "European Journal of Cardiothoracic Surgery — VATS vs Open", "year": 2023, "note": "Comparaison mortalité et complications."}
        ]
      }
    }
  }$content8$::jsonb,
  '[]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- ─── E. CHIRURGIE VASCULAIRE ─────────────────────────────────────────────

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'endarteriectomie_carotidienne',
  'chirurgie-vasculaire',
  '["chirurgie-vasculaire"]'::jsonb,
  '{"fr":"Endartériectomie carotidienne (EAC) — sous AG ou sous ALR","en":"Carotid endarterectomy (CEA) under GA or RA","pt":"Endarterectomia carotídea (EAC) sob AG ou ALR"}'::jsonb,
  '{"fr":["endartériectomie carotidienne","EAC","CEA","chirurgie carotide","sténose carotidienne","plaque carotidienne"],"en":["carotid endarterectomy","CEA","carotid stenosis surgery"],"pt":["endarterectomia carotídea","CEA","estenose carotídea"]}'::jsonb,
  $content9${
    "quick": {
      "fr": {
        "preop": [
          "Bilan : ECG + écho cardiaque si antécédents cardiaques + Echo-Doppler TSA (bilatéral) + angio-TDM / angio-IRM cervicale.",
          "Évaluation neurologique de base (NIH Stroke Scale, statut cognitif) ; bilan biologique complet + groupe/RAI.",
          "Adaptation anticoagulants/antiagrégants selon protocole (aspirine généralement maintenue).",
          "[Complément – ESC/ESA Guidelines Non-Cardiac Surgery, 2022] Optimiser la TA préopératoire (cible < 160/90) ; bêta-bloquants maintenus.",
          "Informer le patient sur le risque d'AVC péri-opératoire (1-3%) et les différences AG/ALR."
        ],
        "intraop": [
          "EAC sous AG : monitoring NIRS bilatérale + Entropie + KTA (avant ou après induction) ; noter PAM de base et maintenir PAM ≥ valeur de base pendant tout le clampage ; propofol + rémifentanil + rocuronium ; héparine 100 UI/kg ; shunt systématique pendant clampage.",
          "EAC sous ALR : bloc cervical profond + intermédiaire + superficiel écho-guidé + infiltration du tragus ; sédation légère possible (propofol + rémifentanil) avant clampage → ARRÊTER pendant clampage pour évaluation neurologique (patient réveillé = moniteur neurologique idéal).",
          "Vasopresseurs (phényléphrine ou noradrénaline) titrés pour maintenir PAM cible ; héparine 100 UI/kg.",
          "Chirurgie mini-invasive possible sous hypnose associée à l'ALR.",
          "Protamine post-clampage optionnelle (selon chirurgien)."
        ],
        "postop": [
          "Fraxiparine SC 4h après intervention (accord chirurgien) ; aspirine J+1.",
          "Surveillance neurologique rapprochée en USI ou salle de surveillance : déficit moteur/sensitif toutes les heures × 6h.",
          "Contrôle TA post-op (HTA réactionnelle fréquente) : antihypertenseurs IV si PAS > 180 mmHg.",
          "[Complément – ESC/ESA, 2022] Surveillance ECG 24h (FA post-op 5-10%) ; statines reprises dès J0.",
          "Hématome cervical compressif (rareté mais urgence) : drainage chirurgical immédiat si stridor ou dysphagie."
        ],
        "red_flags": [
          "Baisse NIRS > 20% relative ou < 50% absolue pendant clampage : décision mise en place de shunt (sous AG) ou évaluation neurologique clinique (sous ALR).",
          "Déficit neurologique post-op : DWI-IRM urgente + avis neurochirurgical si thrombose carotide (reprise chirurgicale possible dans les 6h).",
          "Hématome cervical expansif : désintubation si déjà extubé impossible → laryngoscopie directe urgence ou trachéotomie.",
          "Syndrome de perfusion cérébrale post-opératoire (HTA + migraine + convulsions) : contrôle strict TA + anti-épileptiques."
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction_AG"},
          {"drug_id": "remifentanil", "indication_tag": "TIVA_ALR"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation_AG"},
          {"drug_id": "lidocaine", "indication_tag": "bloc_cervical"},
          {"drug_id": "bupivacaine", "indication_tag": "bloc_cervical_prolonge"},
          {"drug_id": "phenylephrine", "indication_tag": "maintien_PAM"},
          {"drug_id": "noradrenaline", "indication_tag": "vasopresseur"},
          {"drug_id": "atropine", "indication_tag": "bradycardie_clampage"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Le maintien strict de la PAM ≥ valeur de base pendant le clampage carotidien est la mesure neuroprotectrice la plus importante en EAC sous AG.",
          "L'ALR avec bloc cervical permet une évaluation neurologique peropératoire directe (patient parle, bouge la main controlatérale) = gold standard de monitorage neurologique en EAC.",
          "Le NIRS bilatéral sous AG est un substitut imparfait mais pratique du monitoring neurologique clinique : une baisse relative > 20% ou absolue < 50% justifie la mise en place d'un shunt."
        ],
        "pitfalls": [
          "Utiliser un vasopresseur alpha-pur (phényléphrine) sans surveillance de la FC : tachycardie réflexe peut masquer une bradycardie par barorécepteur carotidien.",
          "Réaliser une ALR cervicale sans matériel de réanimation des VA immédiatement disponible (bloc trop profond peut toucher le nerf phrénique ou les structures cervicales profondes).",
          "Ne pas surveiller l'hématome dans les 2h post-op : progression silencieuse jusqu'à l'obstruction trachéale."
        ],
        "references": [
          {"source": "ESC/ESA — Guidelines on Cardiovascular Assessment in Non-Cardiac Surgery", "year": 2022, "note": "Évaluation cardiovasculaire préop chirurgie vasculaire."},
          {"source": "ECST / ACST — Carotid Endarterectomy Trials", "year": 2022, "note": "Indications EAC selon degré sténose symptomatique/asymptomatique."},
          {"source": "ESRA — Cervical Plexus Block Guidelines", "year": 2022, "note": "Technique ALR pour EAC."}
        ]
      }
    }
  }$content9$::jsonb,
  '["neuraxial"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'chirurgie_aaa_aortique',
  'chirurgie-vasculaire',
  '["chirurgie-vasculaire"]'::jsonb,
  '{"fr":"Chirurgie de l''anévrysme de l''aorte abdominale (AAA) — voie ouverte ou endovasculaire","en":"Abdominal aortic aneurysm (AAA) repair — open or endovascular","pt":"Cirurgia do aneurisma da aorta abdominal (AAA) — aberta ou endovascular"}'::jsonb,
  '{"fr":["AAA","anévrysme aorte abdominale","EVAR","EVREST","chirurgie aortique ouverte","aorte sous-rénale","aorte sus-rénale"],"en":["AAA repair","EVAR","open aortic surgery","aortic aneurysm"],"pt":["AAA","EVAR","cirurgia aorta abdominal","aneurisma aórtico"]}'::jsonb,
  $content10${
    "quick": {
      "fr": {
        "preop": [
          "Évaluation complète : type anévrysme (sus/sous-rénal), diamètre, anatomie vasculaire (CT-angio) ; ECG + écho cardiaque + épreuve d'effort SN + Doppler carotides + biologie + RAI (compatibilisation 2U GRC).",
          "Stop IEC si pas d'insuffisance cardiaque ; PAS de bas Kendall (AOMI) ; BZD prémédication.",
          "[Complément – ESC/ESA Perioperative Guidelines, 2022] Optimisation cardiovasculaire : réévaluer coronaropathie, statines, bêta-bloquants selon risque ; décision Heart Team pour voie chirurgicale (open vs EVAR).",
          "Voie ouverte (open) : planifier VVP 16G, VVC, KTA, PICCO/Swan-Ganz si décompensation cardiaque, SNG, sonde vésicale + T° rectale, Entropie.",
          "Voie endovasculaire (EVAR/EVREST/TEVAR) : préparer la conversion chirurgicale ouverte à tout moment."
        ],
        "intraop": [
          "AAA ouvert : curarisation maintenue pendant toute la procédure ; normocapnie pendant clampage ; préparer déclampage : remplissage + amines (noradrénaline) ; héparine 100 UI/kg avant clampage.",
          "EVAR/EVREST : immobilité absolue requise (curare en continu) ; apnées à la demande du chirurgien pendant déploiement endoprothèse ; scopie +++ (tablier plombé équipe) ; possibilité détubation avant retour USI.",
          "EVREST (voie rétropéritonéoscopique) : même préparation qu'abord classique ; décubitus dorsal bras gauche vers haut → VVP + artère à droite.",
          "Antibioprophylaxie : céfazoline 2g IV avant incision ; acide tranexamique selon pertes sanguines.",
          "[Complément – Goal-Directed Therapy, Ann Thorac Surg 2022] GDT hémodynamique peropératoire en chirurgie aortique : optimisation débit cardiaque (Vigileo/PICCO) pour réduire les complications organiques."
        ],
        "postop": [
          "Transfert en USI systématique (voie ouverte et TEVAR) ; surveillance prolongée EVAR/EVREST possible.",
          "Complications tardives EVAR : endoleak (contrôle imagerie à 1 mois, 1 an) ; nécessité suivi radiologique prolongé.",
          "Antibioprophylaxie : durée 24h pour les prothèses vasculaires.",
          "Thromboprophylaxie : HBPM dès H+12 si hémostase satisfaisante.",
          "[Complément – ERAS Vascular Surgery, 2019] Réalimentation précoce, mobilisation J1, gestion fluides restrictive en post-op."
        ],
        "red_flags": [
          "Syndrome de reperfusion post-déclampage (hypotension brutale + acidose) : remplissage préventif + amines avant déclampage ; déclampage progressif.",
          "Ischémie médullaire (paraplégie) post-TEVAR (4-10%) : drainage LCR si planifié + maintien PAM > 90 mmHg.",
          "Rupture anévrysme peropératoire (catastrophique) : clampage aortique d'urgence + transfusion massive.",
          "Syndrome des loges post-revascularisation membre inférieur : surveillance neurologique + aponévrotomie si nécessaire."
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "remifentanil", "indication_tag": "TIVA"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation"},
          {"drug_id": "noradrenaline", "indication_tag": "vasopresseur_clampage"},
          {"drug_id": "acide_tranexamique", "indication_tag": "antifibrinolytique"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "morphine", "indication_tag": "analgesie_postop"},
          {"drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "L'EVAR (voie endovasculaire fémorale bilatérale) a remplacé l'abord ouvert pour la plupart des AAA infrarénaux anatomiquement favorables : mortalité périopératoire < 1% vs 3-5% pour la chirurgie ouverte.",
          "La chirurgie ouverte reste indiquée pour les anévrysmes sus-rénaux, juxta-rénaux, anatomies endovasculaires défavorables, et les patients jeunes à long espérance de vie (pas de suivi radiologique à vie nécessaire).",
          "Le syndrome de reperfusion post-déclampage est prévenu par un remplissage de 500-1000 ml AVANT le déclampage et une induction progressive du flux."
        ],
        "pitfalls": [
          "Ne pas préparer la conversion chirurgicale lors d'un EVAR : endoleak de type I ou rupture peropératoire imposent une conversion ouverte en urgence.",
          "Clampage aortique sus-rénal : ischémie rénale, médullaire et viscérale ; limiter le temps de clampage < 30 min.",
          "Oublier les bas de compression (AOMI) : KEndall contre-indiqués en chirurgie vasculaire périphérique des membres inférieurs."
        ],
        "references": [
          {"source": "ESC/ESA — Guidelines Cardiovascular Assessment Non-Cardiac Surgery", "year": 2022, "note": "Chirurgie vasculaire : évaluation cardiovasculaire préopératoire."},
          {"source": "ESVS — Guidelines on Management of AAA", "year": 2019, "note": "Indications open vs EVAR, TEVAR, suivi post-op."},
          {"source": "Ann Thorac Surg — Goal-Directed Haemodynamic Therapy in Aortic Surgery", "year": 2022, "note": "GDT et réduction complications organiques."}
        ]
      }
    }
  }$content10$::jsonb,
  '["icu","anticoag"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'pontage_arteriel_peripherique',
  'chirurgie-vasculaire',
  '["chirurgie-vasculaire"]'::jsonb,
  '{"fr":"Pontage artériel périphérique et revascularisation des membres inférieurs","en":"Peripheral arterial bypass and lower limb revascularization","pt":"Bypass arterial periférico e revascularização dos membros inferiores"}'::jsonb,
  '{"fr":["pontage fémoro-poplité","pontage fémoro-tibial","bypass fémoro-poplité","saphénectomie","dilatation AOMI","angioplastie périphérique","revascularisation MI"],"en":["femoro-popliteal bypass","peripheral vascular surgery","saphena stripping","PAD angioplasty"],"pt":["bypass fémoro-poplíteo","safenectomia","revascularização MI"]}'::jsonb,
  $content11${
    "quick": {
      "fr": {
        "preop": [
          "Évaluation cardiovasculaire : ECG + écho cœur + épreuve d'effort SN ; bilan biologique + groupe/RAI SN.",
          "PAS de bas Kendall (AOMI = contre-indication bas de compression membre inférieur ischémique).",
          "Adaptation médicaments : statines maintenues, antiagrégants maintenus selon chirurgien, IEC arrêt J0.",
          "Dilatation vasculaire/angioplastie AOMI : procédure peu douloureuse, scopie +++ ; AG (propofol ou sévoflurane + rémifentanil ou sufentanil), souvent masque laryngé.",
          "Saphénectomie (One Day) : AG (ML) versus rachianesthésie ; décubitus ventral possible selon voie d'abord."
        ],
        "intraop": [
          "Pontage fémoro-poplité : VVP + trousse de fluides double + réchauffeur ; KTA selon état patient ; sonde vésicale + T° ; AG de préférence.",
          "Anticoagulation : héparine 50-100 UI/kg selon type d'intervention (50 UI/kg pour angioplastie, 100 UI/kg pour pontage).",
          "Antibioprophylaxie : céfazoline 2g IV avant incision.",
          "Saphénectomie : rachianesthésie ou AG ML ; déchirure possible → hémostase soigneuse ; durée variable.",
          "[Complément – ESC PAD Guidelines, 2017] Choisir la voie d'abord (open vs endovasculaire) en fonction du niveau de lésion TASC II, anatomie, espérance fonctionnelle du patient."
        ],
        "postop": [
          "Surveillance USI ou SSPI 1 nuit (pontage) : monitoring vasculaire distal (Doppler des pontages).",
          "Thromboprophylaxie : fraxiparine SC 4h post-op (accord chirurgien) + Asaflow J+1.",
          "Analgésie : paracétamol 1g + AINS si pas CI vasculaire + opioides rescue.",
          "[Complément – ERAS Vascular Surgery] Mobilisation précoce J1 ; réalimentation immédiate post-op.",
          "Surveillance des loges : pontage après ischémie aiguë → risque syndrome des loges (aponévrotomie prophylactique possible)."
        ],
        "red_flags": [
          "Occlusion de pontage aiguë (disparition du Doppler distal) : reprise chirurgicale ou thrombolyse selon délai.",
          "Syndrome des loges (douleur ++ au mollet, tension musculaire, paresthésies) : aponévrotomie urgente.",
          "Hématome de plai extensif : exploration chirurgicale.",
          "Ischémie myocardique péri-opératoire (terrain ++) : ECG + troponines H0-H6-H24."
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "remifentanil", "indication_tag": "analgesie_perop"},
          {"drug_id": "sufentanil", "indication_tag": "analgesie_perop"},
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthesie"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "L'AOMI (artériopathie oblitérante des membres inférieurs) est un marqueur de risque cardiovasculaire global élevé : optimisation préopératoire cardiovasculaire obligatoire.",
          "La saphénectomie endoscopique a remplacé la stripping conventionnelle dans de nombreux centres : moins douloureuse, moins de complications de plaie.",
          "Le choix anesthésique (AG vs rachianesthésie) n'influence pas significativement les résultats du pontage vasculaire ; le confort et les comorbidités guident la décision."
        ],
        "pitfalls": [
          "Oublier l'anticoagulation per-opératoire (héparine) lors des clamplages artériels : thrombose de pontage peropératoire.",
          "Utiliser des bas de compression sur un membre AOMI : contre-indiqué même pour la prophylaxie TVP controlatérale.",
          "Négliger le syndrome des loges post-revascularisation après ischémie prolongée : fasciotomie préventive à discuter si ischémie > 6h."
        ],
        "references": [
          {"source": "ESC — Guidelines on Peripheral Arterial Diseases", "year": 2017, "note": "TASC classification, stratégie de revascularisation."},
          {"source": "ESVS — Clinical Practice Guidelines on Vascular Access", "year": 2019, "note": "Pontages et revascularisation vasculaire périphérique."},
          {"source": "ERAS Society — Vascular Surgery", "year": 2019, "note": "Récupération améliorée en chirurgie vasculaire."}
        ]
      }
    }
  }$content11$::jsonb,
  '["anticoag"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- ─── F. CHIRURGIE PLASTIQUE & SÉNOLOGIE ─────────────────────────────────

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'reconstruction_mammaire_senologie',
  'chirurgie-plastique',
  '["chirurgie-plastique"]'::jsonb,
  '{"fr":"Reconstruction mammaire et chirurgie du sein (DIEP, grand dorsal, sénologie)","en":"Breast reconstruction and breast surgery (DIEP, LD flap, mastectomy)","pt":"Reconstrução mamária e cirurgia da mama (DIEP, retalho grande dorsal, senologia)"}'::jsonb,
  '{"fr":["reconstruction mammaire","DIEP","grand dorsal","lambeau","sénologie","mastectomie","plastie mammaire","chirurgie sein"],"en":["breast reconstruction","DIEP flap","latissimus dorsi flap","mastectomy","breast surgery"],"pt":["reconstrução mamária","retalho DIEP","mastectomia","cirurgia da mama"]}'::jsonb,
  $content12${
    "quick": {
      "fr": {
        "preop": [
          "Bilan pré-op : biologie complète + écho cardiaque si chimiothérapie néo-adjuvante cardiotoxique (doxorubicine, trastuzumab) + bilan biologique.",
          "Patient Blood Management : injectafer IV si anémie ferriprive (Hb < 12 g/dL femme).",
          "Prémédication NVPO systématique (femmes jeunes, chirurgie longue = score Apfel 2-4).",
          "Planning ALR : PECS I/II (bloc pectoraux) et/ou bloc du plan du serratus (chest wall) ; paravertébral thoracique pour reconstruction (DIEP/grand dorsal).",
          "Attention AINS en post-op si antécédents de chirurgie bariatrique (bypass gastrique) : absorption altérée, risque ulcère anastomotique."
        ],
        "intraop": [
          "VVP bon calibre (16-18G) ; ATB prophylaxie : céfazoline 2g IV avant incision.",
          "Bas de compression intermittente + HBPM ; éviter toux au réveil (risque hématome sous lambeau).",
          "Reconstruction par lambeau (DIEP, grand dorsal) : chirurgie longue (4-8h) → réchauffement actif (Bair Hugger) + perfusion tiède + matelas chauffant.",
          "ALR : blocs PECS I/II (M. grand pectoral + petit pectoral, supra-scapulaire) et serratus anterior plane block écho-guidés → réduction 60-70% morphine post-op.",
          "[Complément – ESRA PECS/Serratus Block Recommendations, 2022] Bloc serratus anterior : aiguille entre grand dorsal et serratus ; ropivacaïne 0,375% 20-30 ml ; couverture T2-T9 latérale."
        ],
        "postop": [
          "NVPO prévention renforcée (Apfel 4/4 si femme non fumeuse, ATCD NVPO) : ondansétron 4mg + dexaméthasone 8mg en début, répéter 4mg ondansétron H+8.",
          "Éviter le Valsalva/toux (risque hématome sous lambeau) : extubation douce ; prévention constipation.",
          "Thromboprophylaxie : bas de compression intermittents 24h post-op + HBPM dès H+6-12.",
          "[Complément – ERAS Breast Surgery Guidelines, 2022] Mobilisation J0, analgésie opioïd-sparing (paracétamol + AINS + blocs), réalimentation immédiate.",
          "[Complément – IASP, 2023] Risque de douleur chronique post-mastectomie (DCPM) 30-50% : prévention par ALR efficace, kétamine peropératoire, gabapentinoïdes pré-op discutés."
        ],
        "red_flags": [
          "Ischémie de lambeau (lambeau DIEP froid, non vascularisé > 2h) : reprise chirurgicale d'urgence pour révascularisation.",
          "Hématome expansif sous lambeau (tachycardie + drain plein) : reprise salle d'op urgente.",
          "Pneumothorax lors du bloc serratus/paravertébral (dyspnée + désaturation) : Rx thorax urgent ; drainage si > 20%.",
          "Cardiotoxicité différée (trastuzumab ± anthracyclines) : FEVG < 50% → cardiologue avant chirurgie."
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "remifentanil", "indication_tag": "TIVA"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation"},
          {"drug_id": "sugammadex", "indication_tag": "reversal"},
          {"drug_id": "bupivacaine", "indication_tag": "PECS_serratus"},
          {"drug_id": "ondansetron", "indication_tag": "PONV"},
          {"drug_id": "dexamethasone", "indication_tag": "PONV_anti_inflammatoire"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Le bloc PECS II (espace interpectoral + sous-pectoral) est particulièrement efficace pour la sénologie : il couvre les branches pectorales, intercostales T2-T6 et le nerf thoracique long ; durée d'action 12-18h avec ropivacaïne.",
          "Le lambeau DIEP (perforante épigastrique inférieure profonde) est une chirurgie microvasculaire longue (4-8h) : la normothermie stricte et la perfusion adéquate des zones périphériques sont essentielles pour la viabilité du lambeau.",
          "La cardiotoxicité des anthracyclines et du trastuzumab (herceptin) impose un contrôle échocardiographique préopératoire si FEVG < 55% ou si traitement récent (< 6 semaines)."
        ],
        "pitfalls": [
          "Négliger la prévention NVPO dans la reconstruction mammaire : le score Apfel 4 (femme, non fumeuse, morphine postop, ATCD NVPO) justifie une prophylaxie maximale.",
          "Donner des AINS post-op à une patiente avec bypass gastrique en antécédent : risque d'ulcère anastomotique grave.",
          "Injections trop profondes lors du bloc PECS II : risque de pneumothorax ; écho-guidage obligatoire."
        ],
        "references": [
          {"source": "ESRA — PECS and Serratus Plane Block Guidelines", "year": 2022, "note": "Techniques, volumes, produits, indications."},
          {"source": "ERAS Breast Surgery — Recommendations", "year": 2022, "note": "Analgésie multimodale, fast-track, PONV."},
          {"source": "IASP — Chronic Post-Mastectomy Pain", "year": 2023, "note": "Facteurs de risque, prévention, prise en charge."}
        ]
      }
    }
  }$content12$::jsonb,
  '["regional","ponv"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'chirurgie_plastique_paroi_abdominale',
  'chirurgie-plastique',
  '["chirurgie-plastique"]'::jsonb,
  '{"fr":"Abdominoplastie et liposuccions abdominales","en":"Abdominoplasty and abdominal liposuction","pt":"Abdominoplastia e liposucção abdominal"}'::jsonb,
  '{"fr":["abdominoplastie","dermolipectomie abdominale","liposuccion","liposuccion abdominale","plastie abdominale"],"en":["abdominoplasty","tummy tuck","liposuction","lipoplasty"],"pt":["abdominoplastia","liposucção","dermolipectomia"]}'::jsonb,
  $content13${
    "quick": {
      "fr": {
        "preop": [
          "Bilan standard ; évaluation IMC, comorbidités, tabagisme (arrêt 4 semaines avant plastie).",
          "Prémédication NVPO systématique (femmes, chirurgie élective).",
          "Planning ALR : TAP (transversus abdominis plane) blocks sous-costaux bilatéraux + injection unique pour liposuccion.",
          "Thromboprophylaxie : évaluation risque TEV (immobilisation post-op, IMC, ATCD).",
          "Pas de sonde vésicale en post-op pour les liposuccions simples."
        ],
        "intraop": [
          "AG standard (propofol + rémifentanil + rocuronium) ; LMA si applicable ; ATB prophylaxie (céfazoline 2g).",
          "Abdominoplastie : KT TAP sous-costal bilatéral à la fin de l'intervention + injection unique sur la plaie chirurgicale ; ropivacaïne 0,375% 20 ml/côté.",
          "Liposuccion abdominale : TAP bloc injection unique avant première incision ; NE PAS laisser de sonde vésicale en post-op.",
          "Remplacement volumique : solutés tiédi ; surveillance hémodynamique (liposuccion avec tumescence peut diluer le volume plasmatique).",
          "[Complément – ASPS Guidelines Liposuction, 2020] Volume maximal recommandé : 5L d'aspirat pur en ambulatoire ; au-delà = surveillance hospitalière 24h."
        ],
        "postop": [
          "Analgésie : paracétamol 1g/6h + AINS 48h + TAP block prolongé (KT pour abdominoplastie).",
          "NVPO prévention : ondansétron + dexaméthasone.",
          "Mobilisation précoce J0 (liposuccion) ou J1 (abdominoplastie).",
          "Thromboprophylaxie : HBPM dès H+6-12 + bas de compression 10 jours.",
          "Pas de sonde urinaire post-op pour les liposuccions : patient autonome dès la salle de réveil."
        ],
        "red_flags": [
          "Syndrome de détresse respiratoire aigu (SDRA) post-liposuccion massive : embolie graisseuse rare mais possible.",
          "Hématome de paroi (abdominoplastie) : tachycardie + douleur + rénitence → drainage chirurgical.",
          "Nécrose cutanée partielle (abdominoplastie, tabagisme ++) : suivi rapproché J5-J7.",
          "Embolie pulmonaire : thromboprophylaxie insuffisante + immobilisation → prévoir anticoagulation prolongée si facteurs de risque."
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "remifentanil", "indication_tag": "TIVA"},
          {"drug_id": "rocuronium", "indication_tag": "curarisation"},
          {"drug_id": "bupivacaine", "indication_tag": "TAP_block"},
          {"drug_id": "ondansetron", "indication_tag": "PONV"},
          {"drug_id": "dexamethasone", "indication_tag": "PONV"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Le TAP block sous-costal (oblique subcostal TAP) couvre T7-T10 : très efficace pour l'abdominoplastie ; la mise en place d'un KT TAP permet une analgésie continue 24-48h.",
          "Les liposuccions massives (> 5L d'aspirat) induisent des modifications hémodynamiques significatives (perte de volume plasmatique, dysrégulation thermique) et requièrent une surveillance hospitalière.",
          "L'abstinence tabagique 4 semaines préopératoires réduit de 50% les complications de cicatrisation (nécroses cutanées, désunion) après abdominoplastie."
        ],
        "pitfalls": [
          "Laisser la sonde vésicale en post-op de liposuccion : facteur de rétention urinaire et d'infection urinaire non nécessaire.",
          "Ne pas calculer la dose totale d'anesthésique local lors des TAP blocks bilatéraux : risque de toxicité systémique (limite ropivacaïne 3 mg/kg).",
          "Réaliser une abdominoplastie sur tabagisme actif sans arrêt préalable : risque de nécrose cutanée de 15-20%."
        ],
        "references": [
          {"source": "ESRA — TAP Block Recommendations", "year": 2022, "note": "Techniques, volumes, indications chirurgie abdominale."},
          {"source": "ASPS — Clinical Practice Guideline: Liposuction", "year": 2020, "note": "Limites volumes, surveillance, prévention complications."},
          {"source": "ERAS Plastic Surgery — Recovery Protocols", "year": 2022, "note": "Analgésie multimodale, mobilisation, nutrition."}
        ]
      }
    }
  }$content13$::jsonb,
  '["regional","ponv"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

COMMIT;
