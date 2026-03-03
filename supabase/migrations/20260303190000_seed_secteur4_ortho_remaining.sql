-- Migration: Secteur 4 – Orthopédie restant (7 procédures)
-- CHU Saint-Pierre PGs 2025-2026
-- Arthroscopie genou, LCA, fractures tibia/cheville, fixateur externe

BEGIN;

-- 1. arthroscopie_genou_menisectomie
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'arthroscopie_genou_menisectomie',
  'orthopedie',
  '["orthopedie"]'::jsonb,
  '{"fr":"Arthroscopie du genou – Méniscectomie / Chondroplasties","en":"Knee arthroscopy – Meniscectomy / Chondroplasty","pt":"Artroscopia do joelho – Meniscectomia / Condroplastia"}'::jsonb,
  '{"fr":["arthroscopie genou","méniscectomie","chondroplastie genou","synovectomie arthroscopique"],"en":["knee arthroscopy","meniscectomy","chondroplasty","knee scope"],"pt":["artroscopia do joelho","meniscectomia","condroplastia"]}'::jsonb,
  $s4menisq${
    "quick": {
      "fr": {
        "preop": [
          "Procédure ambulatoire (hôpital de jour) — jeûne 6h solides / 2h liquides clairs",
          "Bilan standard si > 45 ans ou comorbidités (ECG, NFS, créatinine, coagulation)",
          "Antibioprophylaxie : céfazoline 2g IV 30 min avant incision (Protocole Saint-Pierre)",
          "Garrot pneumatique sur cuisse prévu : pression = PAS + 100 mmHg (max 300 mmHg), noter heure de gonflage",
          "Discuter bloc du canal des adducteurs pour analgésie post-opératoire si AG prévue",
          "Voie veineuse périphérique 18G membre supérieur, pas de remplissage systématique"
        ],
        "intraop": [
          "Option 1 – Rachianesthésie préférentielle : bupivacaïne hyperbare 7,5–10 mg, décubitus dorsal, bloc T10 suffisant pour garrot cuisse",
          "Option 2 – AG masque laryngé : propofol 2 mg/kg + fentanyl 1–2 µg/kg, maintien sévoflurane, sans intubation",
          "Bloc du canal des adducteurs (si AG) : bupivacaïne 0,2 % 20 mL sous échoguidage — analgésie face antérieure genou",
          "Garrot cuisse gonflé après induction, noter heure précise — durée max 90 min, relâchement progressif en fin d'acte",
          "Saignement minimal — acide tranexamique non systématique pour arthroscopie simple",
          "Analgésie multimodale peropératoire : paracétamol 1g IV + kétorolac 30 mg IV en fin d'intervention",
          "Infiltration intra-articulaire par chirurgien : bupivacaïne 0,25 % 10 mL ± kétorolac 30 mg",
          "Monitoring standard : SpO2, ECG, PNI, EtCO2 si AG"
        ],
        "postop": [
          "SSPI : évaluation EVA, bloc sensitif résiduel si rachianesthésie, nausées",
          "Analgésie de sortie : paracétamol 1g/6h + ibuprofène 400 mg/8h per os ± tramadol si EVA > 4",
          "Pas de thromboprophylaxie systématique pour arthroscopie simple ambulatoire (SFAR 2022 — faible risque)",
          "Critères sortie ambulatoire : Aldrete ≥ 9, analgésie satisfaisante, miction, accompagnant",
          "Consignes : glaçage genou 20 min/2h pendant 48h, surélévation du membre, pas de conduite J0",
          "Reprise appui immédiate dans la plupart des cas (selon geste chirurgical)",
          "Consultation chirurgicale de suivi à J+15"
        ],
        "red_flags": [
          "Syndrome des loges post-opératoire : douleur disproportionnée, tension des loges, paresthésies — urgence chirurgicale",
          "Hémarthrose importante : genou tendu et douloureux en SSPI — ponction évacuatrice ou reprise",
          "Durée garrot > 90 min : risque neurovasculaire — signaler au chirurgien",
          "Allergie latex documentée : matériel latex-free et protocole allergie requis",
          "Bloc moteur prolongé > 6h (rachianesthésie) : réévaluation neurologique avant sortie"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction_AG"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_intraop"},
          {"drug_id": "sevoflurane", "indication_tag": "maintenance"},
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthesie_ou_bloc_adducteurs"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ketorolac", "indication_tag": "infiltration_intra_articulaire"},
          {"drug_id": "ondansetron", "indication_tag": "ponv_prophylaxie"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Arthroscopie genou : voies antéro-médiale et antéro-latérale sous distension liquidienne, garrot cuisse indispensable pour visualisation",
          "Bloc du canal des adducteurs : abord échoguidé canal de Hunter, injection péri-nerveuse nerf saphène + branche fémorale — préserve force quadriceps (avantage sur bloc fémoral)",
          "Rachianesthésie bupivacaïne hyperbare : patient assis 3 min puis décubitus dorsal — niveau T10 requis pour garrot cuisse bien toléré",
          "Infiltration intra-articulaire de fin d'acte : réduit consommation morphinique post-opératoire de 30–40 %",
          "ERAS ambulatoire genou : analgésie préemptive, mobilisation immédiate, critères de sortie standardisés Aldrete"
        ],
        "pitfalls": [
          "Ne pas sous-estimer la douleur post-garrot (burning pain) si durée > 45 min — prévoir analgésie de transition avant dégonflage",
          "Chondroplastie motorisée : temps opératoire potentiellement plus long — réévaluer nécessité de répéter garrot",
          "Éviter AINS chez patients avec antécédents gastroduodénaux ou insuffisance rénale",
          "Bloc adducteurs seul : couverture insuffisante pour face postérieure du genou (ménisque postérieur) — infiltration chirurgicale complémentaire recommandée",
          "Ne pas confondre avec arthroplastie du genou — protocole anesthésique très différent (PTG)"
        ],
        "references": [
          "[Complément – Source: SFAR, Recommandations anesthésie locorégionale, 2022]",
          "[Complément – Source: ESA/ESRA, Peripheral nerve blocks guidelines, 2023]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 4 Orthopédie, 2025-2026]"
        ]
      }
    }
  }$s4menisq$::jsonb,
  '["regional","neuraxial"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 2. reconstruction_lca
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'reconstruction_lca',
  'orthopedie',
  '["orthopedie"]'::jsonb,
  '{"fr":"Reconstruction du ligament croisé antérieur (LCA)","en":"Anterior cruciate ligament (ACL) reconstruction","pt":"Reconstrução do ligamento cruzado anterior (LCA)"}'::jsonb,
  '{"fr":["plastie LCA","ligamentoplastie","Kenneth-Jones","DIDT","greffe tendineuse LCA"],"en":["ACL reconstruction","ACL repair","cruciate ligament surgery"],"pt":["reconstrução do LCA","ligamentoplastia"]}'::jsonb,
  $s4lca${
    "quick": {
      "fr": {
        "preop": [
          "Procédure semi-élective — vérifier absence d'anticoagulants en cours, jeûne 6h/2h",
          "Discuter technique de greffe avec chirurgien : DIDT (droit interne + demi-tendineux) vs Kenneth-Jones (rotulien) — impact sur analgésie post-opératoire",
          "Antibioprophylaxie : céfazoline 2g IV 30 min avant incision (Protocole Saint-Pierre)",
          "Garrot pneumatique cuisse prévu : PAS + 100 mmHg, noter heure, durée max 90 min",
          "Planifier bloc du canal des adducteurs pour analgésie face antérieure du genou",
          "Ambulatoire possible ou 1 nuit selon protocole ERAS local — kinésithérapie débutée J0"
        ],
        "intraop": [
          "Option 1 – Rachianesthésie : bupivacaïne hyperbare 10–12,5 mg (niveau T10 requis pour tolérer garrot cuisse)",
          "Option 2 – AG : propofol 2 mg/kg + fentanyl 1–2 µg/kg, intubation ou masque laryngé, maintien sévoflurane",
          "Bloc du canal des adducteurs : bupivacaïne 0,2 % 20 mL sous échoguidage — analgésie face antérieure genou, préserve force quadriceps",
          "Acide tranexamique : 1g IV à l'induction si saignement intra-articulaire significatif anticipé (DIDT, révision)",
          "Analgésie multimodale peropératoire : paracétamol 1g IV + dexaméthasone 8 mg IV (anti-inflammatoire et antiémétique)",
          "Garrot cuisse : relâchement progressif avant fermeture pour hémostase — noter heure totale",
          "Durée habituelle 60–90 min : intubation préférable si durée prévue > 75 min"
        ],
        "postop": [
          "SSPI : évaluation EVA, bloc moteur, drainage (si drain articulaire), tension du genou",
          "Thromboprophylaxie : énoxaparine 40 mg SC à H+6 post-opératoire (Protocole Saint-Pierre)",
          "Analgésie orale : paracétamol 1g/6h + ibuprofène 400 mg/8h ± tramadol si insuffisant",
          "Glaçage 20 min/2h pendant 48h, élévation du membre",
          "Mobilisation précoce J0 : extension passive, flexion jusqu'à 90° — kinésithérapeute en SSPI ou J+1",
          "Sortie ambulatoire si analgésie satisfaisante et accompagnant — sinon nuit en observation",
          "Consultation chirurgicale J+7 et J+21 pour suivi rééducation"
        ],
        "red_flags": [
          "Hémarthrose post-opératoire : genou très tendu et douloureux — ponction ou reprise chirurgicale",
          "Syndrome des loges (site de prélèvement DIDT) : rare mais grave — surveiller loges jambières antérieures",
          "Déficit moteur du quadriceps > 24h après bloc fémoral : réévaluation neurologique",
          "Thrombose veineuse profonde : douleur mollet, chaleur, oedème — écho-Doppler veineux",
          "Infection précoce < 48h : fièvre, douleur locale, sécrétions — urgence — reprise chirurgicale"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_intraop"},
          {"drug_id": "sevoflurane", "indication_tag": "maintenance"},
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthesie_ou_bloc_adducteurs"},
          {"drug_id": "acide_tranexamique", "indication_tag": "hemostase"},
          {"drug_id": "dexamethasone", "indication_tag": "ponv_et_antiinflammatoire"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "ondansetron", "indication_tag": "ponv_prophylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Reconstruction LCA : arthroscopie + mini-incision prélèvement greffe — DIDT (ischio-jambiers) la plus fréquente à Saint-Pierre, Kenneth-Jones (rotulien) pour révision ou sport de compétition",
          "Bloc du canal des adducteurs (BCA) : cible nerf saphène + branche du fémoral — analgésie antérieure sans bloc moteur quadriceps — mobilisation précoce J0 possible",
          "Acide tranexamique intra-articulaire 0,5g ou IV 1g : réduction saignement intra-articulaire 30–40 %, diminution drainage post-op",
          "Dexaméthasone 8 mg IV peropératoire : double bénéfice antiémétique (PONV fréquent chez femme jeune) + réduction douleur post-opératoire",
          "ERAS LCA : analgésie préemptive, pas de drain systématique, mobilisation J0, sortie J0 ou J+1, protocole kinésithérapie standardisé"
        ],
        "pitfalls": [
          "Ne pas faire de bloc poplité ou sciatique en cas de doute sur syndrome des loges tibial post-prélèvement DIDT",
          "Attention aux nausées post-AG chez femme jeune sportive — dexaméthasone + ondansétron systématique",
          "Rachianesthésie niveau T10 nécessaire pour tolérer garrot cuisse — niveau T12 insuffisant (douleur garrot intense)",
          "Thromboprophylaxie à H+6 : si rachianesthésie, attendre 8–12h minimum selon protocole ALR et heure d'administration",
          "Ne pas négliger douleur site prélèvement (genou antérieur pour KJ ou loge antérieure pour DIDT) — cibler analgésie selon technique"
        ],
        "references": [
          "[Complément – Source: SFAR, Recommandations chirurgie ambulatoire orthopédique, 2023]",
          "[Complément – Source: ESA/ESRA, Peripheral nerve blocks guidelines, 2023]",
          "[Complément – Source: AAOS, ACL Reconstruction Clinical Practice Guideline, 2022]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 4 Orthopédie, 2025-2026]"
        ]
      }
    }
  }$s4lca$::jsonb,
  '["regional","neuraxial","anticoag"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 3. fracture_plateau_tibial
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'fracture_plateau_tibial',
  'orthopedie',
  '["orthopedie"]'::jsonb,
  '{"fr":"Fracture du plateau tibial","en":"Tibial plateau fracture","pt":"Fratura do planalto tibial"}'::jsonb,
  '{"fr":["fracture plateau tibia","fracture Schatzker","ostéosynthèse plateau tibial","ORIF tibia proximal"],"en":["tibial plateau fracture","Schatzker fracture","tibial condyle fracture"],"pt":["fratura do planalto tibial","fratura Schatzker"]}'::jsonb,
  $s4plat${
    "quick": {
      "fr": {
        "preop": [
          "Contexte traumatique — évaluer mécanisme (chute, AVP), énergie du traumatisme, classification Schatzker I–VI",
          "Bilan vasculo-nerveux OBLIGATOIRE avant anesthésie : pouls pédieux + tibial postérieur, nerf fibulaire profond (dorsiflexion + sensibilité premier espace)",
          "Scanner 3D préopératoire obligatoire — planification chirurgicale (Schatzker III : greffe osseuse, V–VI : fixateur externe temporaire possible)",
          "Bilan biologique : NFS, coagulation, groupe, RAI — anticiper transfusion si Schatzker V–VI",
          "Antibioprophylaxie : céfazoline 2g IV avant incision + répétition H+8 et H+16 si durée > 3h (Protocole Saint-Pierre)",
          "Risque syndrome des loges élevé pour fractures haute énergie — seuil bas pour mesure de pression de loges"
        ],
        "intraop": [
          "Rachianesthésie préférable (bupivacaïne hyperbare 10–12,5 mg) si pas de contre-indication traumatologique",
          "AG si instabilité hémodynamique, lésions associées, impossibilité position assise : propofol + fentanyl, IOT, sévoflurane",
          "CONTRE-INDICATION FORMELLE au bloc poplité si risque syndrome des loges — masque la douleur sentinelle",
          "Acide tranexamique : 1g IV à l'induction + 2e dose 1g à H+3 si intervention prolongée",
          "Abord chirurgical : latéral ± médial selon Schatzker — plaque buttress ou fixateur hybride, fluoroscopie",
          "Garrot cuisse si nécessaire — noter heure, pression, durée (max 90 min)",
          "Monitoring standard + surveillance hémoglobine si saignement estimé important (Schatzker V–VI)"
        ],
        "postop": [
          "Surveillance vasculo-nerveuse horaire H0–H6 : douleur disproportionnée = alerte syndrome des loges",
          "Thromboprophylaxie : énoxaparine 40 mg SC à H+6 (délai 8–12h si rachianesthésie)",
          "Analgésie : paracétamol 1g/6h IV + kétorolac 30 mg/6h IV 48h + morphine titration si EVA > 6",
          "Antibioprophylaxie post-op : céfazoline IV à H+8 puis H+16 si durée intra-op > 3h",
          "Élévation stricte du membre, glaçage intermittent — coussin de Böhler",
          "Appui différé 6–8 semaines pour fractures complexes — décision chirurgicale stricte",
          "Kinésithérapie passive précoce J+1 si autorisation chirurgicale"
        ],
        "red_flags": [
          "Syndrome des loges AIGU : douleur lancinante lors de l'extension passive des orteils, tension des loges, paresthésies SPF — fasciotomie d'urgence",
          "Ischémie artérielle poplitée : absence pouls pédieux, pied froid/livide — chirurgie vasculaire urgente",
          "Paralysie du nerf fibulaire profond post-op : vérifier positionnement et garrot — EMG à 6 semaines si persistant",
          "Défaillance de montage (Schatzker V–VI) : douleur mécanique et déformation — contrôle radiographique urgent",
          "Infection profonde : fièvre, douleur persistante, hyperleucocytose — cultures, antibiothérapie, reprise chirurgicale"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_intraop"},
          {"drug_id": "sevoflurane", "indication_tag": "maintenance"},
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthesie"},
          {"drug_id": "acide_tranexamique", "indication_tag": "hemostase"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ketorolac", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "morphine", "indication_tag": "analgesia_sauvetage"},
          {"drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Classification Schatzker : I–III fractures latérales (basse énergie) — IV–VI bicondylienne ou métaphysaire (haute énergie, risque syndrome des loges, saignement important)",
          "Pression de loge pathologique : > 30 mmHg absolue ou gradient (PAD moins P loge) < 30 mmHg = indication fasciotomie des 4 loges jambières",
          "Bloc poplitéal CONTRE-INDIQUÉ si fracture haute énergie — masque la douleur sentinelle du syndrome des loges",
          "Acide tranexamique 1g + 1g à H+3 : réduction transfusion de 30 % dans les ostéosynthèses de fractures complexes",
          "Approche en 2 temps pour Schatzker V–VI si oedème majeur : fixateur externe temporaire J0, ORIF définitif J+7–10"
        ],
        "pitfalls": [
          "Ne jamais faire rachianesthésie si suspicion d'instabilité hémodynamique non explorée",
          "Délai thromboprophylaxie après rachianesthésie : 8h minimum — 12h si dose prophylactique, 24h si dose curative — risque hématome péridural",
          "Surveillance radioprotection équipe pendant fluoroscopie : tablier plombé, thyroïde, gonades",
          "Kétorolac : contre-indiqué si créatinine > 150 µmol/L, ulcère, ou patient âgé fragile",
          "Surévaluation stabilité post-opératoire : Schatzker V–VI — appui précoce interdit sauf décision chirurgicale explicite"
        ],
        "references": [
          "[Complément – Source: Schatzker J, Classification fractures plateau tibial, JBJS, 1979]",
          "[Complément – Source: SFAR, Gestion périopératoire du traumatisé orthopédique, 2022]",
          "[Complément – Source: ESA, European Guidelines on Perioperative Bleeding, 2023]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 4 Orthopédie, 2025-2026]"
        ]
      }
    }
  }$s4plat$::jsonb,
  '["trauma","regional","anticoag"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 4. fracture_tibia_diaphysaire_clou
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'fracture_tibia_diaphysaire_clou',
  'orthopedie',
  '["orthopedie"]'::jsonb,
  '{"fr":"Fracture diaphysaire du tibia – Enclouage centromédullaire","en":"Tibial shaft fracture – Intramedullary nailing","pt":"Fratura diafisária da tíbia – Encavilhamento intramedular"}'::jsonb,
  '{"fr":["clou tibial","enclouage tibial","ostéosynthèse tibia diaphyse","fracture ouverte tibia"],"en":["tibial nail","tibial shaft nail","intramedullary nailing tibia","tibial IMN"],"pt":["encavilhamento tibial","clavo tibial"]}'::jsonb,
  $s4clou${
    "quick": {
      "fr": {
        "preop": [
          "Contexte urgent ou semi-électif — évaluer mécanisme, énergie du traumatisme, fracture ouverte (Gustilo-Anderson I–IIIC)",
          "Bilan vasculo-nerveux avant anesthésie : pouls pédieux + tibial postérieur, nerf fibulaire profond (dorsiflexion gros orteil)",
          "NFS, coagulation, groupe-RAI systématiques — fractures ouvertes Gustilo IIIB/C : risque transfusionnel important",
          "Antibioprophylaxie : céfazoline 2g IV (fractures fermées / Gustilo I) ; Gustilo II–IIIC : couverture élargie selon infectiologie",
          "ATTENTION : risque syndrome des loges AVANT intervention sur fractures haute énergie — surveiller en préopératoire",
          "Patient sur table de traction (Maquet) : décubitus dorsal, genou fléchi 90°, broche calcanéenne si nécessaire"
        ],
        "intraop": [
          "Rachianesthésie (bupivacaïne hyperbare 10–12,5 mg) recommandée si fracture isolée et patient stable",
          "AG (propofol + fentanyl, IOT, sévoflurane) si fracture ouverte complexe, polytraumatisme ou instabilité hémodynamique",
          "CONTRE-INDICATION FORMELLE au bloc sciatique poplité si syndrome des loges suspecté ou fracture haute énergie",
          "Acide tranexamique : 1g IV à l'induction + 2e dose 1g à H+3 si intervention > 3h",
          "Enclouage centromédullaire avec alésage ± technique RIA (Reamer Irrigation Aspiration) pour fractures communutives",
          "Fluoroscopie peropératoire indispensable : position clou, longueur, verrouillage distal — vérification sur 2 plans",
          "Surveillance pression de loges peropératoire si fracture haute énergie — seuil bas pour fasciotomie"
        ],
        "postop": [
          "Surveillance loges jambières H0–H6 : douleur lors de la dorsiflexion passive, tension, paresthésies fibulaires",
          "Thromboprophylaxie : énoxaparine 40 mg SC à H+6 (délai 8–12h si rachianesthésie)",
          "Analgésie : paracétamol 1g/6h IV + kétorolac 30 mg/8h IV 48h + titration morphine IV si EVA > 6",
          "Appui protégé ou différé selon décision chirurgicale — fractures stables avec alésage : appui partiel possible J+1",
          "Contrôle radiographique J+1 : position du clou, verrouillage distal",
          "Antibioprophylaxie prolongée si fracture ouverte : Gustilo I-II 24h, IIIA 72h, IIIB/C selon protocole infectiologie"
        ],
        "red_flags": [
          "Syndrome des loges post-op : douleur disproportionnée, paresthésies, tension des loges — fasciotomie d'urgence, ne pas attendre",
          "Retard de consolidation ou pseudarthrose (> 3–6 mois) : douleur persistante, mobilité focale — TDM, scintigraphie",
          "Infection du foyer (fracture ouverte) : fièvre, sécrétions, hyperleucocytose — cultures, reprise chirurgicale",
          "Défaillance d'implant : déverrouillage spontané, douleur mécanique — contrôle radiographique urgent",
          "Lésion du nerf fibulaire profond peropératoire : pied tombant — EMG et prise en charge neurologique"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_intraop"},
          {"drug_id": "sevoflurane", "indication_tag": "maintenance"},
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthesie"},
          {"drug_id": "acide_tranexamique", "indication_tag": "hemostase"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ketorolac", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "morphine", "indication_tag": "analgesia_sauvetage"},
          {"drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Enclouage tibial : voie d'abord transpatellaire ou parapatellaire — introduction clou AO/OTA avec verrouillage statique puis dynamisation",
          "Technique RIA : indication fractures communutives avec perte de substance ou pseudarthrose — récupère greffon autologue intramédullaire, réduit embolie graisseuse",
          "Fractures ouvertes Gustilo : I–II enclouage primaire après débridement ; IIIA enclouage possible ; IIIB/C fixateur externe temporaire + reconstruction retardée",
          "Syndrome des loges : 4 loges jambières (antérieure, latérale, postérieure superficielle, profonde) — fasciotomie biincisionnelle si pression > 30 mmHg absolu",
          "Acide tranexamique 1g + 1g à H+3 : réduction pertes sanguines de 200–400 mL, pas d'augmentation thrombo-embolique (données CRASH-2)"
        ],
        "pitfalls": [
          "Bloc sciatique poplité ou fibulaire : CONTRE-INDIQUÉ en fracture tibiale haute énergie — risque fasciotomie tardive et invalidité permanente",
          "Positionnement table traction : vérifier absence point de compression (talon controlatéral, nerf fibulaire genou controlatéral)",
          "Fracture ouverte : ne jamais négliger le débridement — fixateur externe en urgence plutôt qu'enclouage sur plaie septique",
          "Alésage tibial : augmente pression intramédullaire — peut aggraver syndrome des loges antérieur préexistant",
          "Verrouillage distal sous fluoroscopie : erreur de plan fréquente — toujours vérifier sur 2 incidences orthogonales"
        ],
        "references": [
          "[Complément – Source: Gustilo RB, Classification fractures ouvertes, JBJS, 1976]",
          "[Complément – Source: CRASH-2 Collaborators, TXA in trauma, Lancet, 2010]",
          "[Complément – Source: SFAR, Anesthésie du traumatisé orthopédique, 2022]",
          "[Complément – Source: OTA, Tibial shaft fractures treatment guidelines, 2023]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 4 Orthopédie, 2025-2026]"
        ]
      }
    }
  }$s4clou$::jsonb,
  '["trauma","anticoag","regional"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 5. fracture_pilon_tibial
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'fracture_pilon_tibial',
  'orthopedie',
  '["orthopedie"]'::jsonb,
  '{"fr":"Fracture du pilon tibial – Ostéosynthèse en 2 temps","en":"Tibial pilon fracture – Staged ORIF","pt":"Fratura do pilão tibial – ORIF em 2 tempos"}'::jsonb,
  '{"fr":["pilon tibial","fracture tibiale distale","Rüedi-Allgöwer","ORIF tibia distal"],"en":["pilon fracture","tibial plafond fracture","distal tibia fracture","staged ORIF"],"pt":["fratura do pilão tibial","fratura tibial distal"]}'::jsonb,
  $s4pilon${
    "quick": {
      "fr": {
        "preop": [
          "Fracture haute énergie (chute de hauteur, AVP) — classification Rüedi-Allgöwer I–III ou AO/OTA 43",
          "Bilan vasculo-nerveux : pouls tibial postérieur et pédieux, sensibilité nerf sural et fibulaire profond",
          "Scanner 3D tibial distal obligatoire pour planification des 2 temps chirurgicaux",
          "TEMPS 1 (urgence, H0–H6) : fixateur externe trans-articulaire tibio-calcanéen si oedème majeur ou fracture ouverte",
          "TEMPS 2 (semi-électif, J+7 à J+14) : ORIF définitif quand peau viable (test froissé + plicability), oedème résolu, phlyctènes sèches",
          "Antibioprophylaxie TEMPS 2 : céfazoline 2g IV avant incision + répétition H+8 et H+16"
        ],
        "intraop": [
          "TEMPS 1 – Fixateur externe urgence : rachianesthésie (bupivacaïne hyperbare 10 mg) si stable, ou AG rapide propofol + fentanyl",
          "TEMPS 2 – ORIF définitif : rachianesthésie ou AG selon état général et durée prévue (2–4h)",
          "Précaution régionale lors de la période à risque syndrome des loges (TEMPS 1) : éviter blocs distaux",
          "Acide tranexamique : 1g IV à l'induction du TEMPS 2 — saignement important (500–800 mL) possible lors des abords antérieur + postérieur",
          "Fluoroscopie indispensable — réduction articulaire et vissage sous contrôle radiologique",
          "Anticiper transfusion si Hb préop < 10 g/dL lors du TEMPS 2 — groupe-RAI obligatoire"
        ],
        "postop": [
          "Surveillance vasculo-nerveuse post-TEMPS 1 et post-TEMPS 2 : neurovascular checks toutes les heures H0–H6",
          "Thromboprophylaxie : énoxaparine 40 mg SC à H+6 après ORIF (délai 8–12h si rachianesthésie)",
          "Analgésie : paracétamol 1g/6h + kétorolac 30 mg/8h IV 48h + titration morphine si EVA > 6 en SSPI",
          "Attelle plâtrée postérieure transitoire, élévation stricte membre 45° (coussin de Böhler)",
          "Appui différé : 8–12 semaines pour fractures articulaires complexes (Rüedi II–III)",
          "Surveillance cutanée incision antérieure — nécrose cutanée risque majeur : soins infirmiers quotidiens",
          "Consultation chirurgie hebdomadaire les 4 premières semaines — contrôle radiographique J+7"
        ],
        "red_flags": [
          "Nécrose cutanée sur incision antérieure : complication fréquente — VAC therapy, plastie cutanée si nécessaire",
          "Syndrome des loges lors du TEMPS 2 : possible si oedème résiduel mal évalué — seuil bas pour fasciotomie",
          "Phlyctènes ouvertes : signe que l'ORIF doit être repoussé — ne pas opérer sur peau décollée",
          "Pseudarthrose distale tibiale (fractures communutives) : consolidation > 6 mois, greffe osseuse souvent requise",
          "Infection profonde ORIF : risque élevé sur site antérieur fragile — urgence, reprise, antibiothérapie prolongée"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_intraop"},
          {"drug_id": "sevoflurane", "indication_tag": "maintenance"},
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthesie"},
          {"drug_id": "acide_tranexamique", "indication_tag": "hemostase_temps2"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ketorolac", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "morphine", "indication_tag": "analgesia_sauvetage"},
          {"drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Classification Rüedi-Allgöwer : Type I (fissure non déplacée) — Type II (déplacée sans communition) — Type III (communition sévère, impaction) — guide la technique",
          "Stratégie 2 temps quasi systématique pour Types II–III : réduction morbidité cutanée de 60 % par rapport à ORIF primaire",
          "Fenêtre opératoire (soft tissue window) : apparition plis cutanés spontanés (wrinkle test positif), phlyctènes sèches — généralement J+7 à J+14",
          "Abords ORIF TEMPS 2 : antérolatéral tibial + postéro-latéral fibulaire souvent combinés — risque ischémie pont cutané si < 7 cm entre les 2 incisions",
          "Acide tranexamique TEMPS 2 obligatoire : intervention longue sur tissu cicatriciel, saignement difficile à maîtriser"
        ],
        "pitfalls": [
          "Opérer trop tôt (oedème majeur, phlyctènes ouvertes) = catastrophe cutanée — repousser systématiquement même si pression chirurgicale",
          "Blocs régionaux distaux TEMPS 1 : contre-indiqués en phase aiguë haute énergie — syndrome des loges possible",
          "Si ostéoporose ou communition sévère (Rüedi III) : greffe osseuse autologue ou allograft à prévoir",
          "Thromboprophylaxie après rachianesthésie : 8h minimum — documenter heure ponction et heure première injection",
          "Nécrose incision antérieure prévisible si incision dans zone ecchymotique — choisir voie d'abord avec soin"
        ],
        "references": [
          "[Complément – Source: Rüedi TP, Allgöwer M, Classification pilon tibial, Injury, 1969]",
          "[Complément – Source: SFAR, Fractures complexes du membre inférieur, 2022]",
          "[Complément – Source: OTA, Distal tibial fractures Clinical Practice Guidelines, 2023]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 4 Orthopédie, 2025-2026]"
        ]
      }
    }
  }$s4pilon$::jsonb,
  '["trauma","anticoag"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 6. fracture_malleolaire
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'fracture_malleolaire',
  'orthopedie',
  '["orthopedie"]'::jsonb,
  '{"fr":"Fracture de cheville / Ostéosynthèse des malléoles","en":"Ankle fracture – Malleolar fixation","pt":"Fratura do tornozelo – Fixação maleolar"}'::jsonb,
  '{"fr":["fracture bimalléolaire","fracture tri-malléolaire","fracture cheville Weber","ostéosynthèse cheville"],"en":["ankle fracture","bimalleolar fracture","trimalleolar fracture","ankle fixation"],"pt":["fratura do tornozelo","fratura bimaleolar","fratura trimalveolar"]}'::jsonb,
  $s4mall${
    "quick": {
      "fr": {
        "preop": [
          "Évaluation classification Danis-Weber (A, B, C) — guide la décision chirurgicale et le type de fixation",
          "Bilan vasculo-nerveux : pouls pédieux et tibial postérieur, sensibilité dos du pied et plante",
          "Scanner cheville si fracture tri-malléolaire ou luxation-fracture — évaluer fragment postérieur (> 25 % = abord chirurgical)",
          "Antibioprophylaxie : céfazoline 2g IV 30 min avant incision (fractures fermées)",
          "Procédure semi-électif possible J+2 à J+5 si fracture stable — attendre résorption oedème",
          "Position : décubitus dorsal (malléole latérale + médiale) ou ventral si abord postérieur tri-malléolaire"
        ],
        "intraop": [
          "Option 1 – Rachianesthésie préférentielle : bupivacaïne hyperbare 10 mg — T10 suffisant pour garrot cheville",
          "Option 2 – Bloc sciatique poplité + nerf saphène (bloc complet cheville) : bupivacaïne 0,375 % 15–20 mL (sciatique) + 5 mL (saphène) sous échoguidage — analgésie 12–18h, préserve mobilité, favorise ambulatoire",
          "Acide tranexamique : 1g IV si oedème important, fracture ouverte ou multi-fragments — réduction saignement per-opératoire",
          "Analgésie multimodale peropératoire : paracétamol 1g IV + dexaméthasone 8 mg IV",
          "Garrot de cheville ou pneumatique cuisse disponible — noter heure, pression, durée (max 90 min)",
          "Fluoroscopie per-opératoire : vérification réduction articulaire, vissage syndesmotique si lésion sous stress test",
          "Durée habituelle 60–90 min bimalléolaire, 90–120 min tri-malléolaire"
        ],
        "postop": [
          "Surveillance vasculo-nerveuse en SSPI, vérification bloc sensitif résiduel",
          "Thromboprophylaxie : énoxaparine 40 mg SC à H+6 (délai 8–12h si rachianesthésie ou bloc poplité)",
          "Analgésie de sortie : paracétamol 1g/6h + ibuprofène 400 mg/8h ± tramadol de secours",
          "Immobilisation : attelle plâtrée postérieure ou botte selon décision chirurgicale",
          "Sortie ambulatoire pour fracture bimalléolaire : analgésie orale satisfaisante + accompagnant",
          "Nuit en observation pour tri-malléolaires ou procédures > 2h",
          "Appui différé 4–6 semaines selon qualité ostéosynthèse"
        ],
        "red_flags": [
          "Ischémie cutanée post-réduction de fracture-luxation : peau blanche — repositionnement urgent avant anesthésie",
          "Compression du nerf tibial postérieur par plaque médiale : paresthésies plante du pied — reprise chirurgicale",
          "Rupture syndesmotique méconnue : instabilité tibio-fibulaire, douleur à la dorsiflexion — TDM ou arthroscopie",
          "Syndrome de l'échancrure (vis syndesmotique trop serrée) : douleur en charge — retrait de vis à 6–8 semaines",
          "Hémarthrose cheville : gonflement progressif douloureux — ponction évacuatrice si nécessaire"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction_si_AG"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_intraop"},
          {"drug_id": "sevoflurane", "indication_tag": "maintenance_si_AG"},
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthesie_ou_bloc_poplite_saphene"},
          {"drug_id": "acide_tranexamique", "indication_tag": "hemostase"},
          {"drug_id": "dexamethasone", "indication_tag": "ponv_et_antiinflammatoire"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "ibuprofene", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "ondansetron", "indication_tag": "ponv_prophylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Bloc sciatique poplité + nerf saphène = couverture complète de la cheville (tibial postérieur + fibulaire commun + saphène interne pour bord médial)",
          "Pas de contre-indication du bloc poplité dans les fractures de cheville (pas de risque de syndrome des loges — contrairement aux fractures tibiales diaphysaires)",
          "Classification Weber B la plus fréquente : vissage fibulaire + plaque ± vissage médial — procédure 60–90 min",
          "Vissage syndesmotique (Weber C ou lésion syndesmose) : vis cortico-corticale 3,5 mm — retrait obligatoire à 6–8 semaines",
          "Fracture tri-malléolaire avec fragment postérieur > 25 % de la surface articulaire : abord postérieur nécessaire — décubitus ventral ou retournement intraopératoire"
        ],
        "pitfalls": [
          "Ne pas oublier le nerf saphène pour la couverture médiale de cheville — souvent omis, douleur interne persistante",
          "Vis syndesmotique trop serrée : dysfonction cheville à long terme — toujours vérifier au stress test sous fluoroscopie",
          "Hémorrhage du fragment postérieur : abord postérieur peut saigner significativement — bistouri électrique et garnissement",
          "Thromboprophylaxie : ne pas omettre — risque TVP cheville 10–20 % sans prophylaxie",
          "Rachianesthésie avec bupivacaïne hyperbare 10 mg : position assise indispensable 3 min — si impossibilité (douleur), préférer bloc poplité"
        ],
        "references": [
          "[Complément – Source: Danis R, Weber BG, Classification fractures du péroné, 1949]",
          "[Complément – Source: SFAR, Bloc du nerf sciatique poplité, recommandations techniques, 2022]",
          "[Complément – Source: ESA/ESRA, Ankle block guidelines, 2023]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 4 Orthopédie, 2025-2026]"
        ]
      }
    }
  }$s4mall$::jsonb,
  '["regional","neuraxial","anticoag"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

-- 7. fixateur_externe_tibia
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'fixateur_externe_tibia',
  'orthopedie',
  '["orthopedie"]'::jsonb,
  '{"fr":"Fixateur externe du tibia / Membre inférieur","en":"External fixator – Tibia / Lower limb","pt":"Fixador externo da tíbia / Membro inferior"}'::jsonb,
  '{"fr":["fixateur externe","ExFix","damage control orthopédique","stabilisation provisoire","ExFix tibial"],"en":["external fixator","ExFix","damage control orthopaedics","temporary stabilisation"],"pt":["fixador externo","controle de danos ortopédico"]}'::jsonb,
  $s4exfix${
    "quick": {
      "fr": {
        "preop": [
          "Contexte polytraumatisme fréquent — évaluation ABCDE avant prise en charge orthopédique, damage control resuscitation en priorité",
          "ISS > 15 ou instabilité hémodynamique (TAS < 90 mmHg) : DCO recommandé — fixateur externe d'abord, ORIF différé",
          "Bilan lésionnel : TDM corps entier (BodyScan/TOTEM), biologie complète, groupe-RAI, gaz du sang",
          "Évaluation vasculaire membre : pouls distaux, Doppler si asymétrie ou diminution",
          "Antibioprophylaxie : céfazoline 2g IV périopératoire, répétition H+8 et H+16 si prolongé",
          "Acide tranexamique si traumatisme < 3h et saignement actif ou risque hémorragique : 1g IV dans les 3h (CRASH-2)"
        ],
        "intraop": [
          "POLYTRAUMATISME INSTABLE : AG obligatoire — RSI : etomidate 0,3 mg/kg + rocuronium 1,2 mg/kg (estomaс plein traumatisé récent)",
          "TRAUMATISME ISOLÉ STABLE : rachianesthésie envisageable (bupivacaïne hyperbare 10 mg) — moins de dépression hémodynamique",
          "Maintien AG : sévoflurane — objectif PAM > 65 mmHg, remplissage vasculaire guidé, vasopresseurs si nécessaire (noradrénaline)",
          "Acide tranexamique 1g IV dans les 3h du traumatisme + 1g à H+8 si saignement persistant (protocole CRASH-2)",
          "Anesthésie locale sites de broches : lidocaïne 1–2 % infiltration sous-cutanée + périosté",
          "Monitoring : voie artérielle radiale si précaire, sonde urinaire, 2 VVP larges ou VVC",
          "Durée objectif < 60 min : stabilisation provisoire rapide — pas la reconstruction définitive"
        ],
        "postop": [
          "Surveillance rapprochée selon hémodynamique — USI si polytraumatisme",
          "Analgésie : paracétamol 1g/6h IV + morphine titration IV si EVA > 6 — kétorolac différé si instabilité",
          "Thromboprophylaxie : décision concertée traumatologie — énoxaparine souvent différée 24–48h après damage control",
          "Antibioprophylaxie fracture ouverte : Gustilo I–II 24h, IIIA 72h, IIIB/C selon infectiologie",
          "Soins de broches biquotidiens : nettoyage eau stérile + antiseptique, pansement occlusif — protocole infirmier affiché",
          "Planification ORIF définitif : J+7 à J+14 selon état patient, oedème et état cutané",
          "Sugammadex pour reversibilité rapide si rocuronium utilisé en RSI"
        ],
        "red_flags": [
          "Instabilité hémodynamique peropératoire : transfusion massive CGR + PFC + PLT ratio 1:1:1, vasopresseurs, damage control chirurgical prioritaire",
          "Embolie graisseuse (fractures fémorales/tibiales) : SpO2 chute soudaine + pétéchies + confusion — O2 haut débit, support ventilatoire",
          "Sepsis de broche : rougeur, sécrétions purulentes, fièvre — cultures, antibiothérapie, ablation broche si nécessaire",
          "Acide tranexamique après 3h post-traumatisme : données CRASH-2 montrent excès de mortalité — ne pas administrer hors fenêtre",
          "Lésion vasculaire tibiale non détectée : ischémie progressive — Doppler et chirurgie vasculaire urgente"
        ],
        "drugs": [
          {"drug_id": "etomidate", "indication_tag": "rsi_induction_polytrauma"},
          {"drug_id": "rocuronium", "indication_tag": "rsi_curarisation"},
          {"drug_id": "sugammadex", "indication_tag": "reversibilite_rocuronium"},
          {"drug_id": "propofol", "indication_tag": "induction_si_stable"},
          {"drug_id": "fentanyl", "indication_tag": "analgesia_intraop"},
          {"drug_id": "sevoflurane", "indication_tag": "maintenance"},
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthesie_si_isole"},
          {"drug_id": "lidocaine", "indication_tag": "anesthesie_locale_sites_broches"},
          {"drug_id": "acide_tranexamique", "indication_tag": "damage_control_hemostase"},
          {"drug_id": "morphine", "indication_tag": "analgesia_sauvetage"},
          {"drug_id": "paracetamol", "indication_tag": "analgesia_multimodale"},
          {"drug_id": "noradrenaline", "indication_tag": "vasopresseur_support_hemodynamique"},
          {"drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie_differee"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "DCO vs ETC (Early Total Care) : ISS > 15, hypothermie < 35°C, pH < 7.25, coagulopathie, instabilité → DCO ; ISS < 15 et stable → ETC possible",
          "Fixateur externe tibial transfixant : broches calcanéenne distale + tibiale proximale — stabilisation fractures diaphysaires et péri-articulaires",
          "Induction RSI polytraumatisme : etomidate 0,3 mg/kg (préserve hémodynamique, cortisol à surveiller) + rocuronium 1,2 mg/kg — intubation 60 s",
          "Damage control resuscitation simultané : CGR + PFC + Plaquettes ratio 1:1:1 (ATLS), objectif Hb > 7 g/dL, pH > 7.30, T° > 36°C",
          "Acide tranexamique dans les 3h : CRASH-2 — réduction mortalité hémorragique 15 % si administration précoce — ne pas donner après 3h",
          "Conversion ExFix vers ORIF : fenêtre 10–14 jours idéale — au-delà, risque colonisation broches et infection du foyer"
        ],
        "pitfalls": [
          "Ne jamais faire rachianesthésie en polytraumatisme non stabilisé — risque collapsus cardiovasculaire sur vasoplégie + hypovolémie",
          "Etomidate en urgence unique : usage > 1 induction dans les 24h → discuter hydrocortisone (suppression surrénalienne)",
          "Acide tranexamique après 3h post-traumatisme : données CRASH-2 montrent excès de mortalité — ne pas administrer hors fenêtre thérapeutique",
          "Trajectoires des broches : planifier loin du foyer chirurgical définitif — éviter contamination du site ORIF",
          "Soins intensifs : déléguer clairement les soins de broches aux infirmières — protocole écrit et affiché au lit"
        ],
        "references": [
          "[Complément – Source: CRASH-2 Collaborators, TXA in trauma, Lancet, 2010]",
          "[Complément – Source: ATLS, Advanced Trauma Life Support, 10e éd., 2018]",
          "[Complément – Source: Pape HC, DCO vs ETC in polytrauma, JBJS, 2019]",
          "[Complément – Source: SFAR, Prise en charge anesthésique du polytraumatisé, 2021]",
          "[Complément – Source: Protocole CHU Saint-Pierre – Secteur 4 Orthopédie, 2025-2026]"
        ]
      }
    }
  }$s4exfix$::jsonb,
  '["trauma","anticoag","icu"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, specialties=EXCLUDED.specialties, titles=EXCLUDED.titles, synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, tags=EXCLUDED.tags, updated_at=now();

COMMIT;
