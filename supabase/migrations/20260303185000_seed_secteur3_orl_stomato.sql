-- Migration: Seed Secteur 3 – ORL adulte / Stomatologie / Maxillo-facial (7 procédures)
-- CHU Saint-Pierre PGs 2025-2026 | p. 119-143

BEGIN;

-- ============================================================
-- 1. Chirurgie de l'oreille adulte
-- ============================================================
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'chirurgie_oreille_adulte',
  'orl',
  '["orl"]'::jsonb,
  '{"fr":"Chirurgie de l''oreille adulte (tympanoplastie, stapédectomie, mastoïdectomie)","en":"Adult ear surgery (tympanoplasty, stapedectomy, mastoidectomy)","pt":"Cirurgia de ouvido adulto (timpanoplastia, estapedectomia, mastoidectomia)"}'::jsonb,
  '{"fr":["tympanoplastie","stapédectomie","mastoïdectomie","ossiculoplastie","chirurgie otologie"],"en":["tympanoplasty","stapedectomy","mastoidectomy","ossiculoplasty","ear surgery"],"pt":["timpanoplastia","estapedectomia","mastoidectomia","cirurgia otológica"]}'::jsonb,
  $s3oreille${
    "quick": {
      "fr": {
        "preop": [
          "Consultation ORL : type chirurgie (tympanoplastie / stapédectomie / mastoïdectomie radicale), côté, antécédents otologiques",
          "Test audiométrique de base – documenter surdité de transmission vs neurosensorielle",
          "Évaluer nerf facial (VII) : parésie préopératoire à documenter (médico-légal)",
          "N2O CONTRE-INDIQUÉ pour toute chirurgie de l'oreille moyenne (élévation pression → déplacement greffon/prothèse ossiculaire)",
          "Dexaméthasone 8 mg IV préopératoire (réduction œdème, prévention NVPO)",
          "Jeûne standard. VVP préopératoire si complexe ou vieux"
        ],
        "intraop": [
          "TIVA propofol TCI (Schnider) Ce 3–4 µg/mL + remifentanil TCI (Minto) Ce 2–3 ng/mL → champ opératoire parfaitement immobile",
          "Intubation sonde standard (ou MLG si courte tympanoplastie) — sonde armée si position latérale prolongée",
          "Position : décubitus dorsal, tête tournée 30° côté controlatéral + billot sous épaule; ÉVITER hyperextension",
          "Monitorage nerf facial (EMG électrodes + Nerve Integrity Monitor) si mastoïdectomie radicale ou stapédectomie complexe",
          "Hypotension contrôlée modérée : PAS cible 60–70 mmHg per-op pour réduire saignement en champ – remifentanil ↑ Ce ou labétalol 5 mg bolus",
          "Éviter mouvements brutaux lors des phases de microchirurgie (stapédectomie : vigilance maximale à la perforation fenêtre ovale)",
          "Entretien : remifentanil 0.1–0.3 µg/kg/min ou TCI Ce maintenu selon stimulation; propofol TCI Ce 3–4 µg/mL",
          "Antalgiques de relais : paracétamol 1g + kétorolac 30 mg IV 30 min avant fin (si pas CI)",
          "NVPO prophylaxie DOUBLE : ondansétron 4 mg + dexaméthasone 8 mg (déjà donné en préop)"
        ],
        "postop": [
          "SSPI : surveillance NVPO ++ (chirurgie ORL = facteur de risque majeur NVPO)",
          "Douleur modérée : paracétamol 1g/6h + ibuprofène 400 mg/8h si pas CI",
          "Vérifier mobilité nerf facial dès réveil (comparer à baseline préop)",
          "Surveillance acouphènes, vertiges (labyrinthite post-stapédectomie → rapporter chirurgien)",
          "Soins d'oreille : consignes mouillage/mouchage; pas de vol avion 2 semaines si tympanoplastie",
          "Sortie J1 si tympanoplastie courte; J2-3 si mastoïdectomie radicale"
        ],
        "red_flags": [
          "Paralysie faciale postopératoire NEW → urgence chirurgicale (décompression)",
          "Vertiges intenses + nausées réfractaires → labyrinthite ou fistule périlymphatique",
          "Otalgie sévère + fièvre > 38.5°C → mastoïdite / infection",
          "Saignement oreille > 50 mL → reprise chirurgicale"
        ],
        "drugs": ["propofol","remifentanil","dexamethasone","ondansetron","paracetamol","ketorolac"]
      }
    },
    "deep": {
      "fr": {
        "clinical": "La chirurgie ORL de l'oreille est une chirurgie de microchirurgie : l'immobilité du patient est critique. Le N2O élève la pression de l'oreille moyenne (passage transmembranaire rapide) → risque de déplacement du greffon tympanique ou de la prothèse ossiculaire. La TIVA propofol+remifentanil est le gold standard. Le monitorage EMG du nerf facial est indiqué systématiquement pour mastoïdectomie/stapédectomie. L'hypotension contrôlée modérée améliore la visibilité chirurgicale.\n\n**Stapédectomie** : chirurgie délicate sur fenêtre ovale; tout mouvement = risque de vertiges définitifs ou surdité totale. Remifentanil TCI permet une récupération ultra-rapide. Réveil très doux obligatoire.\n\n**Mastoïdectomie radicale** : durée longue (2–4h); voie rétro-auriculaire. Risque saignement sinus sigmoïde. NIM obligatoire.\n\n[Complément – Source: SFAR, Anesthésie en ORL, 2022]",
        "pitfalls": [
          "N2O même en faibles concentrations → déplacement greffon (contra-indiqué absolu)",
          "Oublier le NIM → responsabilité médicale en cas de paralysie faciale non détectée",
          "Réveil agité post-stapédectomie → risque déplacement prothèse ossiculaire",
          "NVPO non traitée → vomissements = ↑ pression intra-auriculaire → déplacement greffon"
        ],
        "references": ["SFAR – Recommandations anesthésie ORL 2022","Smith & Bhatt – Anesthesia for Otologic Surgery, Anesthesiology Clin 2010"]
      }
    }
  }$s3oreille$::jsonb,
  '["ponv","airway"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET
  specialty = EXCLUDED.specialty,
  specialties = EXCLUDED.specialties,
  titles = EXCLUDED.titles,
  synonyms = EXCLUDED.synonyms,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags,
  updated_at = now();

-- ============================================================
-- 2. Chirurgie endonasale / ORL (FESS, septoplastie, turbinectomie)
-- ============================================================
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'chirurgie_endonasale_orl',
  'orl',
  '["orl"]'::jsonb,
  '{"fr":"Chirurgie endonasale ORL (FESS, septoplastie, turbinoplastie)","en":"Endoscopic sinus surgery / septoplasty / turbinate reduction","pt":"Cirurgia endoscópica sinusal / septoplastia / turbinoplastia"}'::jsonb,
  '{"fr":["FESS","chirurgie des sinus","sinusite chronique","septoplastie","turbinectomie","ethmoïdectomie","sphénoïdectomie"],"en":["FESS","sinus surgery","septoplasty","turbinectomy","ethmoidectomy"],"pt":["cirurgia sinusal","septoplastia","turbinectomia"]}'::jsonb,
  $s3endonas${
    "quick": {
      "fr": {
        "preop": [
          "Scanner sinus préopératoire : documenter variantes anatomiques (artère ethmoïdale antérieure déhiscente, toit de l'ethmoïde bas, lame papyracée fine)",
          "STOP anticoagulants/antiagrégants selon protocol (héparine bridge si nécessaire)",
          "Évaluer obstruction nasale : si totale → intubation orotrachéale + lunettes nasale contre-indiquée",
          "Dexaméthasone 8 mg IV préopératoire (réduction œdème péri-opératoire)",
          "Avertir chirurgien : corticoïdes préopératoires 7 jours si polypes massifs"
        ],
        "intraop": [
          "Intubation orotrachéale préférable (nez = champ opératoire) – sonde armée si décubitus dorsal tête 30°",
          "Tamponnade pharyngée (pack throat) obligatoire pour bloquer le sang dégluté (prévention nausées/vomissements postop)",
          "Hypotension contrôlée : PAS cible 60–70 mmHg → réduction saignement, meilleure visualisation endoscopique",
          "Remifentanil TCI (Minto) Ce 2–4 ng/mL : titration de l'hypotension + analgésie + réduction MAC",
          "Position : tête 30° (légère proclive) + légère rotation côté chirurgien",
          "Vasoconstricteurs locaux par chirurgien : xylocaïne adrénalinée 1/80.000 injectée sous-muqueuse → surveiller hypertension réactionnelle transitoire (→ réduire remifentanil si nécessaire)",
          "Propofol TCI Ce 3–4 µg/mL (TIVA de préférence si hypotension contrôlée recherchée)",
          "Antalgiques relais : paracétamol 1g + kétorolac 30 mg IV 30 min avant fin"
        ],
        "postop": [
          "RETIRER PACK PHARYNGÉ avant extubation — VÉRIFICATION SYSTÉMATIQUE",
          "Extubation éveillé, tête en position semi-assise, aspiration oro-pharyngée douce",
          "Surveiller saignement nasal antérieur + postérieur (sang dégluté = nausées)",
          "Analgésie : paracétamol 1g/6h + ibuprofène 400 mg/8h",
          "Soins : rinçages nasaux sérum physiologique × 4/j dès J1, pas de mouchage fort 5 jours",
          "Complications rares à surveiller : diplopie/proptose (lésion lame papyracée) → urgence ophtalmologique; rhinorrhée eau claire (brèche durale) → TDM urgence"
        ],
        "red_flags": [
          "Diplopie ou proptose → plaie lame papyracée + hématome orbitaire → canthotomie latérale urgence",
          "Brèche durale (rhinorrhée eau claire, glucosée) → scanner urgence + neurochirurgie",
          "Épistaxis sévère > 300 mL → artère ethmoïdale antérieure ou sphéno-palatine → reprise chirurgicale",
          "Pack pharyngé non retiré → obstruction respiratoire post-extubation"
        ],
        "drugs": ["propofol","remifentanil","dexamethasone","ondansetron","paracetamol","ketorolac","lidocaine"]
      }
    },
    "deep": {
      "fr": {
        "clinical": "La chirurgie endonasale est emblématique de l'anesthésie avec hypotension contrôlée : le champ opératoire est amélioré de façon spectaculaire. Le remifentanil TCI est l'agent de choix pour l'hypotension contrôlée modérée (PAS 60–70 mmHg). La TIVA réduit en plus les nausées postopératoires.\n\n**Précautions spécifiques Saint-Pierre :**\n- Pack pharyngé : sa présence ou absence doit être documentée sur le formulaire de bloc; le retrait est une responsabilité partagée IADE/anesthésiste\n- Les vasoconstricteurs locaux (adrénalone) peuvent induire une hypertension transitoire sévère → surveiller tracé PA invasif si cardiopathe\n- Scanner préopératoire est un prérequis légal avant FESS\n\n[Complément – Source: SFAR, Recommandations chirurgie endonasale 2021]",
        "pitfalls": [
          "Oublier de retirer le pack pharyngé avant extubation → détresse respiratoire immédiate",
          "Vasoconstricteurs locaux sans monitoring PA → pic hypertensif non détecté chez cardiopathe",
          "Brèche durale non diagnostiquée → méningite retardée",
          "Extubation trop précoce avant récupération complète → laryngospasme sur sang"
        ],
        "references": ["SFAR – Chirurgie endonasale et hypotension contrôlée 2021","Lund & Kennedy – European Position Paper on Rhinosinusitis 2020"]
      }
    }
  }$s3endonas$::jsonb,
  '["airway","ponv"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET
  specialty = EXCLUDED.specialty,
  specialties = EXCLUDED.specialties,
  titles = EXCLUDED.titles,
  synonyms = EXCLUDED.synonyms,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags,
  updated_at = now();

-- ============================================================
-- 3. Laryngectomie carcinologique
-- ============================================================
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'laryngectomie_carcinologique',
  'orl',
  '["orl"]'::jsonb,
  '{"fr":"Laryngectomie carcinologique (totale / partielle)","en":"Oncological laryngectomy (total / partial)","pt":"Laringectomia carcinológica (total / parcial)"}'::jsonb,
  '{"fr":["laryngectomie totale","laryngectomie partielle","cancer larynx","trachéostomie définitive","pharyngolaryngectomie"],"en":["total laryngectomy","partial laryngectomy","laryngeal cancer","tracheostomy","pharyngolaryngectomy"],"pt":["laringectomia total","laringectomia parcial","traqueostomia"]}'::jsonb,
  $s3laryngx${
    "quick": {
      "fr": {
        "preop": [
          "ÉVALUATION VOIES AÉRIENNES CRITIQUE : tumeur laryngée = voie aérienne potentiellement compromise",
          "Nasofibroscopie ORL préopératoire OBLIGATOIRE : documenter degré d'obstruction, mobilité cordes vocales, localisation tumeur",
          "Si obstruction > 50% ou stridor → planifier intubation vigile par fibroscopie ou trachéotomie locale préalable",
          "Antécédents radiothérapie cervicale → col raide, trachéotomie difficile, accès veineux jugulaire potentiellement oblitéré",
          "Bilan nutritionnel (dénutrition fréquente); corriger hypoalbuminémie si possible",
          "Bilan cardiaque et pulmonaire (tabagisme, BPCO fréquents)",
          "Consentement : patient informé possible trachéostomie définitive, voix prothèse trachéo-œsophagienne"
        ],
        "intraop": [
          "STRATÉGIE AIRWAY au centre de la planification :",
          "  – Obstruction modérée ou laryngoscopie normale prévisible : induction standard propofol + rocuronium après test ventilation masque confirmé",
          "  – Obstruction ≥ 50%, stridor au repos, RT cervicale → INTUBATION VIGILE par vidéolaryngoscope ou fibroscope (sédation légère : midazolam 1–2 mg IV + rémifentanil 0.05 µg/kg/min; nébulisation lidocaïne 4% 4 mL × 2 avant)",
          "  – Plan B immédiat préparé : fibroscope ± jet ventilation trans-trachéale ± chirurgien présent pour trachéotomie d'urgence",
          "Induction (si intubation standard envisagée) : propofol 1.5–2 mg/kg IV + fentanyl 2 µg/kg + rocuronium 0.6 mg/kg",
          "Entretien : sévoflurane 1–1.5% + remifentanil 0.1–0.25 µg/kg/min ou propofol TCI",
          "Chirurgie longue (4–8h) : réchauffer patient, bilan de coagulation si évidement ganglionnaire étendu",
          "Si laryngectomie totale : intubation initiale par voie oro-trachéale → relais trachéostomie intra-opératoire par chirurgien (tube armé 6.0 mm dans trachéostomie définitive)",
          "TXA 1g IV à l'incision + 1g à H+3 (chirurgie avec dissection cervicale étendue)",
          "Voie artérielle + VVC recommandées pour chirurgie >4h ou évidement radical",
          "Réchauffement systématique (couverture chauffante + solutés chauds)"
        ],
        "postop": [
          "Laryngectomie totale : patient trachéostomisé DÉFINITIVEMENT → aucune voie aérienne orale/nasale",
          "Soins trachéostomie : aspiration × 4–6h, humidification continue obligatoire",
          "Surveillance hémorragie cervicale : hématome cervical = urgence absolue (compression trachée) → ré-ouvrir plaie cervicale au lit si nécessaire",
          "Analgésie multimodale : paracétamol 1g/6h + kétorolac 30 mg × 2/j + morphine PCA selon protocole",
          "Nutrition entérale par sonde naso-gastrique dès H+6 (NPO bouche)",
          "Pneumo/infectio : antibiothérapie prophylactique étendue (céfazoline 2g + métronidazole 500 mg)"
        ],
        "red_flags": [
          "Hématome cervical expansif → compression trachée → urgence vitale : ouvrir plaie cervicale + réintubation/aspiration",
          "Fistule pharyngocutanée (J5–15) → salive dans plaie → reprise chirurgicale",
          "Obstruction prothèse trachéo-œsophagienne → détresse respiratoire",
          "Pneumonie d'aspiration (fistule, trouble déglutition) → scanner thoracique"
        ],
        "drugs": ["propofol","remifentanil","rocuronium","fentanyl","midazolam","lidocaine","acide_tranexamique","cefazoline","paracetamol","morphine","ketorolac"]
      }
    },
    "deep": {
      "fr": {
        "clinical": "La laryngectomie carcinologique pour cancer du larynx représente le défi anesthésique le plus élevé en ORL : voie aérienne compromise, patient dénutri, tabagique, éventuellement irradié. Le plan airway doit être discuté en concertation pluridisciplinaire AVANT l'intervention.\n\n**Décision d'intubation vigile :**\n- Obstruction ≥50% en nasofibroscopie\n- Stridor inspiratoire au repos\n- Antécédents radiothérapie cervicale (micrognathie acquise, sclérose muqueuse)\n- Antécédents trachéotomie\n- Score MACOCHA ≥3\n\n**Trachéostomie définitive :** Lors d'une laryngectomie totale, le chirurgien crée une trachéostomie permanente au niveau du manubrium. Le relais du tube oro-trachéal vers le tube dans la trachéostomie définitive se fait en intra-opératoire avec le chirurgien. Communications claires IADE ↔ chirurgien obligatoires lors de ce moment critique.\n\n[Complément – Source: SFAR/SFO – Prise en charge des cancers des voies aérodigestives supérieures 2023]",
        "pitfalls": [
          "Induction en séquence rapide sans fibroscope en cas d'obstruction partielle → ne peut pas intuber, ne peut pas ventiler",
          "Oublier de préparer le plan B (fibroscope + jet ventilation + chirurgien prévenu) avant l'induction",
          "Hématome cervical au réveil non reconnu → rapidement fatal si non drainé",
          "Analgésie insuffisante chez patient trachéostomisé → agitation → désadaptation respiratoire"
        ],
        "references": ["SFAR/SFO – Cancer VADS 2023","Apfelbaum JL et al. – Difficult Airway Algorithm, ASA 2022","Difficult Airway Society Guidelines 2015 (DAS)"]
      }
    }
  }$s3laryngx$::jsonb,
  '["airway","difficult_airway","anticoag"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET
  specialty = EXCLUDED.specialty,
  specialties = EXCLUDED.specialties,
  titles = EXCLUDED.titles,
  synonyms = EXCLUDED.synonyms,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags,
  updated_at = now();

-- ============================================================
-- 4. Thyroïdectomie / Parathyroïdectomie
-- ============================================================
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'thyroidectomie_parathyroidectomie',
  'orl',
  '["orl"]'::jsonb,
  '{"fr":"Thyroïdectomie / Parathyroïdectomie","en":"Thyroidectomy / Parathyroidectomy","pt":"Tireoidectomia / Paratireoidectomia"}'::jsonb,
  '{"fr":["thyroïdectomie totale","hémi-thyroïdectomie","parathyroïdectomie","goitre","cancer thyroïde","hyperparathyroïdie","NIM tube"],"en":["thyroidectomy","parathyroidectomy","goiter","thyroid cancer","NIM tube","RLN monitoring"],"pt":["tireoidectomia","paratireoidectomia","bócio","monitorização nervo recurrente"]}'::jsonb,
  $s3thyroid${
    "quick": {
      "fr": {
        "preop": [
          "ÉVALUATION VOIES AÉRIENNES : goitre volumineux / substernal → déviation/compression trachéale",
          "Scanner cervico-thoracique si goitre substernal (descente trachéale, rapport avec vaisseaux)",
          "Nasofibroscopie ORL préopératoire : mobilité cordes vocales (paralysie récurrentielle préexistante à documenter)",
          "Bilan thyroïdien : TSH, T4L → patient euthyroïdien avant chirurgie (si hyperthyroïdie → propylthiouracile + Lugol + propranolol préopératoires)",
          "Calcémie, PTH intacte de base (parathyroïdectomie) + ECG (hypercalcémie sévère = QT court, bloc AV)",
          "NIM tube (Nerve Integrity Monitor) : sonde d'intubation spéciale avec électrodes EMG sur cordes vocales – pré-positionné avant induction avec ORL",
          "Pas de curare si NIM obligatoire (ou sugammadex pour décurarisation complète avant stimulation NIM)"
        ],
        "intraop": [
          "NIM TUBE : intubation vidéolaryngoscopie recommandée pour positionnement précis électrodes sur cordes vocales; confirmer signal EMG basal avec chirurgien avant incision",
          "Induction : propofol 1.5–2 mg/kg IV + fentanyl 2 µg/kg IV; si curare utilisé (difficult airway) → succinylcholine 1.5 mg/kg (action courte) ou rocuronium 0.6 mg/kg + sugammadex 200 mg IV pour décurarisation complète avant neuromonitoring",
          "Entretien : propofol TCI Ce 3–4 µg/mL + remifentanil TCI Ce 2–3 ng/mL (TIVA préférée : pas d'halogénés → signal EMG NIM non parasité)",
          "Position : décubitus dorsal, billot sous épaules, extension cervicale 30° (col en hyperextension modérée)",
          "Instabilité hémodynamique possible si goitre compressif manipulé (levée de compression → hypotension transitoire)",
          "Surveillance ETCo2 et SpO2 continue; si signe de tempête thyroïdienne (tachycardie >120, HTA, hyperthermie) → esmolol 0.5 mg/kg + refroidissement",
          "Calcémie en per-opératoire (parathyroïdectomie) si disponible",
          "Paracétamol 1g IV 30 min avant fin + kétorolac 30 mg"
        ],
        "postop": [
          "SURVEILLANCE HÉMATOME CERVICAL : priorité absolue H0–H6 (risque compression trachée)",
          "Signes d'alerte hématome : tuméfaction cervicale progressive, stridor, dyspnée, dysphagie → RÉOUVRIR IMMÉDIATEMENT LA PLAIE AU LIT SI NÉCESSAIRE",
          "Nasofibroscopie ORL de contrôle J1 : mobilité cordes vocales (bi-latérale → trachéostomie urgente si paralysie bilatérale)",
          "Surveillance calcémie H4, H8, H24 (thyroïdectomie totale = risque hypocalcémie par hypoparathyroïdie transitoire ou définitive)",
          "Si hypocalcémie (Ca < 1.8 mmol/L ou symptomatique : paresthésies, Chvostek+) → gluconate de calcium IV 10 mL 10% en 10 min + carbonate de calcium per os",
          "Analgésie légère : paracétamol 1g/6h (chirurgie peu douloureuse)",
          "Sortie possible J1 si thyroïdectomie totale simple et calcémie stable; J2-3 si parathyroïdectomie exploratoire"
        ],
        "red_flags": [
          "Hématome cervical compressif → URGENCE : ouvrir plaie cervicale, appeler ORL, préparer réintubation / trachéotomie",
          "Paralysie récurrentielle bilatérale → aphonie + stridor → trachéostomie urgente",
          "Hypocalcémie sévère (Ca < 1.5 mmol/L) → tétanie, convulsions, QT long → gluconate Ca IV",
          "Tempête thyroïdienne (thyroïdectomie sur hyperthyroïdie non contrôlée) → esmolol, refroidissement, dantrolène si hyperthermie majeure"
        ],
        "drugs": ["propofol","remifentanil","fentanyl","rocuronium","sugammadex","paracetamol","ketorolac"]
      }
    },
    "deep": {
      "fr": {
        "clinical": "La thyroïdectomie comporte deux spécificités anesthésiques majeures :\n\n**1. NIM tube (Nerve Integrity Monitor) :**\nSonde d'intubation avec électrodes EMG positionnées sur les cordes vocales pour détecter en temps réel la stimulation du nerf récurrent laryngé par le chirurgien. Conditions requises : zéro curarisation résiduelle. Si rocuronium utilisé pour induction → sugammadex 200 mg IV (décurarisation complète en < 3 min) avant début du neuromonitoring. La TIVA propofol/remifentanil ne parasite pas le signal EMG.\n\n**2. Hématome cervical :**\nComplique 0.3–1% des thyroïdectomies; peut être fulminant (compression trachée en 20–30 min). Le protocole Saint-Pierre impose une surveillance intensifiée H0–H8, avec matériel de drain cervical et kit trachéotomie d'urgence au chevet.\n\n**Goitre substernal :** peut nécessiter sternotomie pour extraction. Planification préopératoire obligatoire avec chirurgien thoracique.\n\n[Complément – Source: SFAR – Anesthésie thyroïde/parathyroïde 2022; European Thyroid Association Guidelines 2023]",
        "pitfalls": [
          "Oublier le sugammadex avant neuromonitoring → signal NIM absent ou parasité → NIM inutilisable",
          "Hématome non reconnu pendant 1–2h → obstruction progressive non détectée jusqu'à urgence",
          "Hypocalcémie postopératoire non dosée à H4–H8 → crise convulsive nocturne",
          "Goitre substernal non scanné → anesthésie impossible à gérer si intubation difficile imprévue"
        ],
        "references": ["SFAR – Anesthésie thyroïde 2022","ETA Guidelines – Thyroid Surgery 2023","Dralle H et al. – RLN monitoring systematic review, Langenbeck 2012"]
      }
    }
  }$s3thyroid$::jsonb,
  '["airway","difficult_airway"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET
  specialty = EXCLUDED.specialty,
  specialties = EXCLUDED.specialties,
  titles = EXCLUDED.titles,
  synonyms = EXCLUDED.synonyms,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags,
  updated_at = now();

-- ============================================================
-- 5. Extractions dentaires / stomatologie sous AG
-- ============================================================
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'extractions_dentaires_stomato',
  'chirurgie-maxillo-faciale',
  '["chirurgie-maxillo-faciale","orl"]'::jsonb,
  '{"fr":"Extractions dentaires et stomatologie sous anesthésie générale","en":"Dental extractions and oral surgery under general anaesthesia","pt":"Extrações dentárias e estomatologia sob anestesia geral"}'::jsonb,
  '{"fr":["extractions dentaires multiple","chirurgie dentaire AG","sagesses AG","dents de sagesse","alveolectomie","stomatologie bloc","patient non-coopérant"],"en":["dental extraction GA","wisdom teeth GA","dental surgery GA","non-cooperative patient dentistry"],"pt":["extrações dentárias AG","cirurgia dentária AG"]}'::jsonb,
  $s3dental${
    "quick": {
      "fr": {
        "preop": [
          "Indications AG : patient non-coopérant (handicap mental, enfant agité, anxiété sévère réfractaire), chirurgie extensive multi-dents, trismus, infection péri-amygdalienne",
          "Évaluation ouverture de bouche (trismus → intubation difficile) : documenter IOB en mm",
          "Antécédents pathologie dentaire / ORL (angine de Ludwig antérieure, abcès)",
          "Patient adulte type : STOP anticoagulants 3–5j si extractions simples (relais héparinique si risque thrombotique élevé)",
          "Bilan coagulation si anticoagulés ou thrombopénie",
          "Consultation stomatologue/maxillo-facial : plan chirurgical, nombre de dents, complexité (incluses, impactées)"
        ],
        "intraop": [
          "VOIE AÉRIENNE PARTAGÉE : coordination chirurgien ↔ anesthésiste est vitale",
          "Intubation NASO-TRACHÉALE préférable (sonde RAE nasale 7.0 cuffed) : libère le champ buccal complet pour le chirurgien",
          "Alternative si nez inaccessible : intubation oro-trachéale sonde RAE buccale + décalée côté opposé aux extractions",
          "PACK PHARYNGÉ OBLIGATOIRE (gaze humide dans oro-pharynx) pour bloquer sang et débris dentaires → NOTER SUR FORMULAIRE BLOC + COMPTER",
          "Induction : propofol 2 mg/kg + fentanyl 2 µg/kg + rocuronium 0.6 mg/kg (ou succinylcholine 1.5 mg/kg si IOB < 2 cm)",
          "Entretien : sévoflurane 1.2–1.5% ou propofol TCI Ce 3–4 µg/mL",
          "Position : décubitus dorsal, tête 20° en hyperextension modérée, billot sous nuque",
          "Analgésie locale par chirurgien : ALR bloc dentaire (xylocaïne 2% adrénalinée) → complément antalgique majeur",
          "Antalgiques systémiques : paracétamol 1g IV + ibuprofène 400 mg IV (ou kétorolac 30 mg) 30 min avant fin",
          "Dexaméthasone 8 mg IV réduction œdème facial postopératoire"
        ],
        "postop": [
          "VÉRIFICATION RETRAIT PACK PHARYNGÉ AVANT EXTUBATION — OBLIGATOIRE (check-list + comptage)",
          "Extubation éveillé, tête légèrement déclive, aspiration oropharyngée avant extubation",
          "Alerte saignement post-extractionnel : pression compresses 20 min, hamostatique (acide tranexamique bain bouche 4.8% 10 mL)",
          "Analgésie : paracétamol 1g/6h + ibuprofène 400 mg/8h × 5 jours; codéine si douleur sévère",
          "Antibiotiques si infections associées : amoxicilline 2g/j × 5–7 jours (ou clindamycine si allergie péni)",
          "Sortie possible J0 (ambulatoire) si stabilité hémostase confirmée (30 min observation post-SSPI)"
        ],
        "red_flags": [
          "Pack pharyngé non retiré → détresse respiratoire immédiate post-extubation",
          "Saignement post-extractionnel massif → appel chirurgien, compression, acide tranexamique",
          "Trismus persistant non résolutif → abcès résiduel / cellulite → TDM urgence",
          "Emphysème sous-cutané cervico-facial post-extraction (air sous pression rotatoire) → scanner"
        ],
        "drugs": ["propofol","fentanyl","rocuronium","sevoflurane","paracetamol","ibuprofene","dexamethasone","acide_tranexamique","lidocaine"]
      }
    },
    "deep": {
      "fr": {
        "clinical": "La chirurgie dentaire sous AG partage la voie aérienne entre l'anesthésiste et le chirurgien. Deux risques critiques :\n\n**1. Pack pharyngé non retiré :**\nErreur évitable, potentiellement mortelle. Le protocole Saint-Pierre impose : notifier sur formulaire opératoire, pack compté à la fin comme les compresses chirurgicales. Dernier check avant extubation.\n\n**2. Intubation naso-trachéale :**\nPréférable pour libérer le champ opératoire. Contre-indications : coagulopathie sévère, polypose nasale, déviation septale totale. Si nez non accessible → sonde RAE orale.\n\n**Bloc dentaire local :** L'infiltration de xylocaïne adrénalinée par le chirurgien est l'analgésie principale; ne pas sous-estimer son impact sur les besoins en agents IV.\n\n[Complément – Source: SFAR – Anesthésie en chirurgie maxillo-faciale 2020]",
        "pitfalls": [
          "Pack pharyngé non documenté et non retiré → obstruction voie aérienne",
          "Sonde nasale dans un patient traité par anticoagulants → épistaxis sévère intra-opératoire",
          "Bloc dentaire local adrénaline → tachycardie/hypertension transitoire (surveiller, pas d'action si courte)",
          "Alveolite sèche post-extraction → douleur intense J3–5 → non détectée si patient non revu"
        ],
        "references": ["SFAR – Anesthésie maxillo-faciale 2020","UK NCEPOD – Risks of Dental GA Report 2018"]
      }
    }
  }$s3dental$::jsonb,
  '["airway","ponv"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET
  specialty = EXCLUDED.specialty,
  specialties = EXCLUDED.specialties,
  titles = EXCLUDED.titles,
  synonyms = EXCLUDED.synonyms,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags,
  updated_at = now();

-- ============================================================
-- 6. Chirurgie orthognathique (LeFort I, BSSO, génioplastie)
-- ============================================================
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'chirurgie_orthognathique',
  'chirurgie-maxillo-faciale',
  '["chirurgie-maxillo-faciale"]'::jsonb,
  '{"fr":"Chirurgie orthognathique (LeFort I, ostéotomie bilatérale des branches montantes, génioplastie)","en":"Orthognathic surgery (LeFort I, bilateral sagittal split osteotomy, genioplasty)","pt":"Cirurgia ortognática (LeFort I, osteotomia sagital bilateral, genioplastia)"}'::jsonb,
  '{"fr":["LeFort I","LeFort 1","BSSO","ostéotomie sagittale","génioplastie","chirurgie mâchoire","correction occlusion","bi-maxillaire"],"en":["LeFort I","BSSO","genioplasty","jaw surgery","bimaxillary osteotomy"],"pt":["LeFort I","osteotomia bimaxilar","cirurgia ortognática"]}'::jsonb,
  $s3orthognath${
    "quick": {
      "fr": {
        "preop": [
          "INTUBATION NASO-TRACHÉALE OBLIGATOIRE (IOT naso) : chirurgie des maxillaires + blocage inter-maxillaire per-opératoire",
          "Évaluation nasale : déviation septale sévère = contre-indication relative; discuter avec chirurgien",
          "Bilan coagulation complet (chirurgie hémorragique sur os vascularisé, sinus maxillaires)",
          "Groupe ABO + RAI (transfusion possible pour LeFort I étendu)",
          "Anesthésiste prévenu du blocage maxillo-mandibulaire (BMM) per-opératoire → accès bouche impossible pendant phases de vérification occlusion",
          "CISEAUX OU COUPE-FIL À PORTÉE DE MAIN en permanence pendant intervention (BMM = voie aérienne bloquée en urgence)",
          "TXA 1g IV à l'incision prévu (chirurgie osseuse hémorragique)"
        ],
        "intraop": [
          "Intubation naso-trachéale : utiliser sonde RAE nasale souple 7.0 cuffée; nébulisation xylocaïne 4% + vasoconstricteur nasal avant si temps le permet",
          "Induction : propofol 2 mg/kg + fentanyl 2 µg/kg + rocuronium 0.6 mg/kg IV",
          "Entretien : propofol TCI Ce 3–4 µg/mL + remifentanil TCI Ce 2–4 ng/mL (hypotension contrôlée PAS 60–70 mmHg pour réduire saignement osseux)",
          "Méchage naso-pharyngé + pack pharyngé (sang + déchets osseux)",
          "Position : décubitus dorsal, tête 30° proclive (réduction congestion veineuse faciale + saignement champ)",
          "Analgésie per-opératoire : TXA 1g IV incision + 1g à H+3, dexaméthasone 8 mg IV (anti-œdème facial obligatoire)",
          "BMM (blocage maxillo-mandibulaire) : vérification inter-opératoire occlusion. Pendant cette phase : accès bouche IMPOSSIBLE → surveiller capnographie + SpO2 + étanchéité sonde nasale",
          "Aspiration continue oro-pharyngée par infirmière de bloc",
          "Fin de chirurgie : levée BMM par chirurgien avant extubation"
        ],
        "postop": [
          "RETRAIT PACK PHARYNGÉ + COMPTER avant extubation",
          "Extubation éveillé, position semi-assise, aspiration oro-pharyngée",
          "Si BMM résiduel pour contention occlusale → patient conscient mais accès bouche limité : NE PAS ENDORMIR PATIENT AVEC BMM ACTIF",
          "Ciseaux/coupe-fil au chevet obligatoires si contention BMM maintenue postopératoire (nausée → risque inhalation)",
          "Analgésie : paracétamol 1g/6h IV puis relais oral + ibuprofène 400 mg/8h (si pas CI hémostase)",
          "Œdème facial majeur J1–4 : glace intermittente, position 30° tête haute",
          "Alimentation liquide 4–6 semaines (ostéosynthèse en cours)",
          "Sortie J2–3 si stable"
        ],
        "red_flags": [
          "Nausées avec BMM actif → COUPER LE BMM IMMÉDIATEMENT (risque inhalation) → appeler chirurgien pour repositionner contention",
          "Hémorragie per-opératoire massive (artère ptérygoïdienne, carotide externe) → transfusion, embolisation radiologie interventionnelle",
          "Paresthésies labio-mentonnières persistantes > J30 → lésion nerf alvéolaire inférieur (nerf V3)",
          "Dysfonction ATM postopératoire → rééducation + consultation maxillo-facial"
        ],
        "drugs": ["propofol","remifentanil","fentanyl","rocuronium","acide_tranexamique","dexamethasone","paracetamol","ibuprofene","lidocaine"]
      }
    },
    "deep": {
      "fr": {
        "clinical": "La chirurgie orthognathique (LeFort I, BSSO ± génioplastie) est une chirurgie élective longue (3–6h), hémorragique (os vascularisé des maxillaires + sinus), réalisée chez l'adulte jeune pour correction des dysmorphoses dento-squelettiques.\n\n**Spécificités majeures :**\n- Intubation naso-trachéale obligatoire (mandibule + maxillaire mobilisés)\n- Blocage maxillo-mandibulaire (BMM) per-opératoire : aucun accès à la bouche; toute obstruction sur sonde nasale ou arrêt respi → urgence\n- Saignement osseux important : TXA systématique, hypotension contrôlée\n- Œdème facial majeur postopératoire → surveiller perméabilité naso-trachéale en SSPI\n\n**Protocole Saint-Pierre :** TXA 1g incision + 1g H+3 systématique; ciseaux/coupe-fil au chevet si BMM maintenu postopératoire.\n\n[Complément – Source: SFAR – Chirurgie orthognathique 2021; Obwegeser, Nomenclature des ostéotomies maxillo-mandibulaires]",
        "pitfalls": [
          "BMM actif au réveil sans ciseaux de secours → nausée/vomissement → inhalation",
          "Sonde naso-trachéale déplacée lors des manipulations maxillaires → extubation accidentelle intra-opératoire",
          "Saignement sinus maxillaires non contrôlé lors LeFort I → embolisation artérielle urgente",
          "Œdème glottique massif post-LeFort avec décubitus → nécessite SSPI prolongée"
        ],
        "references": ["SFAR – Orthognathic Surgery Anaesthesia 2021","Greenberg AM – Craniofacial Surgery Atlas, Springer 2012"]
      }
    }
  }$s3orthognath$::jsonb,
  '["airway","anticoag"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET
  specialty = EXCLUDED.specialty,
  specialties = EXCLUDED.specialties,
  titles = EXCLUDED.titles,
  synonyms = EXCLUDED.synonyms,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags,
  updated_at = now();

-- ============================================================
-- 7. Abcès dentaire / Ludwig / Voies aériennes compromises
-- ============================================================
INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'abces_dentaire_voies_aeriennes',
  'chirurgie-maxillo-faciale',
  '["chirurgie-maxillo-faciale","orl","reanimation"]'::jsonb,
  '{"fr":"Abcès dentaire avec compromission des voies aériennes / Angine de Ludwig","en":"Dental abscess with airway compromise / Ludwig''s angina","pt":"Abscesso dentário com compromisso das vias aéreas / Angina de Ludwig"}'::jsonb,
  '{"fr":["angine de Ludwig","cellulite plancher buccal","abcès péri-amygdalien","phlegmon","fasciite cervicale nécrosante","trismus serré","voies aériennes menacées"],"en":["Ludwig angina","floor of mouth abscess","peritonsillar abscess","cellulitis","deep neck infection","trismus","threatened airway"],"pt":["angina de Ludwig","abscesso do assoalho bucal","fasciite cervical necrosante","trismo"]}'::jsonb,
  $s3ludwig${
    "quick": {
      "fr": {
        "preop": [
          "ÉVALUATION AIRWAY URGENTE : le degré de compromission des voies aériennes détermine la stratégie",
          "Critères de gravité : trismus < 2 cm IOB, œdème plancher buccal visible en bouche (langue surélevée), stridor, agitation, SpO2 < 95% aa, voix de « patate chaude »",
          "TDM cervico-thoracique : cartographie de l'abcès, extension aux espaces profonds (para-pharyngé, rétro-pharyngé, médiastin), rapport avec larynx",
          "JAMAIS induction AG chez patient avec Ludwig ou cellulite plancher buccal sévère SANS plan airway défini",
          "Appeler anesthésiste senior + ORL/maxillo-facial IMMÉDIATEMENT (pas d'intervention solitaire)",
          "Oxygénothérapie haute concentration en attente, position demi-assise",
          "Antibiotiques IV débutés : amoxicilline/clavulanate 2g IV + métronidazole 500 mg IV"
        ],
        "intraop": [
          "STRATÉGIE AIRWAY EN CONCERTATION ORL + ANESTHÉSISTE (choisir AVANT d'amener le patient au bloc) :",
          "",
          "OPTION 1 – INTUBATION VIGILE FIBROSCOPIQUE (GOLD STANDARD Ludwig/cellulite sévère) :",
          "  – Patient coopérant, SpO2 > 90%, pas de stridor immédiat",
          "  – Sédation minimale : midazolam 1–2 mg IV + rémifentanil 0.05 µg/kg/min IVSE (MAINTIEN VENTILATION SPONTANÉE)",
          "  – Anesthésie topique voies aériennes : nébulisation lidocaïne 4% 4 mL × 2; spray lidocaïne 10% oropharynx",
          "  – Fibroscopie nasale sous VS → visualisation glotte → introduction sonde 7.0 souple",
          "  – Confirmation capnographique AVANT tout hypnotique",
          "",
          "OPTION 2 – TRACHÉOTOMIE LOCALE PRÉALABLE (cellulite très sévère, trismus < 1 cm, stridor, SpO2 < 90%) :",
          "  – Trachéotomie sous AL par ORL pendant patient vigile (décision collégiale senior)",
          "  – Puis anesthésie générale par sonde de trachéotomie",
          "",
          "JAMAIS induction séquence rapide standard (propofol + succinylcholine) si Ludwig car : 1) ouverture de bouche impossible → intubation impossible, 2) apnée → ventilation masque souvent impossible",
          "",
          "Entretien : propofol TCI Ce 3–4 µg/mL + remifentanil TCI Ce 2–4 ng/mL après sécurisation airway",
          "Incision–drainage sous AG : chirurgien ouvre et draine collection purulente",
          "Antibiotiques per-opératoires continus; prélèvements microbiologiques systématiques",
          "Position : tête légèrement surélevée (30°) pour maintenir perméabilité des espaces profonds"
        ],
        "postop": [
          "Patient intubé / trachéostomisé → soins intensifs / SSPI avancée minimum 24h",
          "Extubation différée si œdème important (24–72h après incision-drainage et décroissance anti-infectieuse)",
          "Test de fuite (cuff deflation test) avant toute tentative d'extubation",
          "Antibiothérapie IV prolongée : amoxicilline/clavulanate × 7–14 j selon évolution",
          "Scanner de contrôle J2–3 : vérification vidange de l'abcès, absence d'extension médiastinale",
          "Surveillance signes médiastinite : fièvre persistante, douleur thoracique, CRP > 300, scanner thoracique"
        ],
        "red_flags": [
          "Induction AG standard (RSI) sur Ludwig → ne peut pas intuber + ne peut pas ventiler → ARRÊT CARDIAQUE",
          "Médiastinite descendante (extension para-pharyngée → médiastin) → mortalité > 40% → chirurgie thoracique urgente",
          "Sepsis sévère / choc septique → réanimation hémodynamique + bilan hémocultures + noradrénaline",
          "Fasciite nécrosante cervicale → débridement chirurgical étendu urgent + réanimation"
        ],
        "drugs": ["midazolam","remifentanil","propofol","rocuronium","lidocaine","noradrenaline"]
      }
    },
    "deep": {
      "fr": {
        "clinical": "L'angine de Ludwig est une urgence vitale ORL/maxillo-faciale. La cellulite diffuse du plancher buccal progresse vers le cou et peut compromettre les voies aériennes en quelques heures. C'est le cas anesthésique le plus redouté en maxillo-facial.\n\n**Physiopathologie airway :**\nL'inflammation comprime la langue vers le haut, réduit l'espace sous-glottique, provoque un œdème supraglottique. Le trismus ferme la bouche. Résultat : laryngoscopie impossible + ventilation au masque souvent impossible.\n\n**Règle d'or :** Ne jamais endormir un Ludwig sans avoir un plan B défini (fibroscope prêt, ORL présent en salle pour trachéotomie immédiate).\n\n**Intubation vigile fibroscopique (nasale) :**\nProcédure de choix. Le patient maintient sa ventilation spontanée tout au long. La sédation doit être titrée avec extrême précaution (midazolam 0.5–1 mg IV titré + rémifentanil à très faible dose). La perte de conscience = perte de la tonicité pharyngée = obstruction complète.\n\n**Extension médiastinale (médiastinite descendante nécrosante) :**\nComplication de 5–10% des Ludwig. Mortalité 40–50%. TDM cervico-thoracique systématique. Nécessite médiastinoscopie/thoracoscopie en urgence.\n\n[Complément – Source: DAS Guidelines – Unanticipated Difficult Intubation 2015; SFAR – Voies aériennes difficiles imprévues 2017]",
        "pitfalls": [
          "Endormir le patient sans plan airway défini → catastrophe respiratoire",
          "Tentative laryngoscopie directe sur trismus serré → traumatisme, saignement, œdème aggravé → situation impossible",
          "Dose trop élevée de midazolam ou propofol avant sécurisation airway → perte VS → obstruction",
          "Extension médiastinale non suspectée → absence de TDM thoracique → médiastinite non traitée"
        ],
        "references": ["DAS Guidelines – Awake Tracheal Intubation 2020","SFAR – Prise en charge des voies aériennes difficiles 2017","Marty-Ané CH et al – Descending necrotizing mediastinitis, Ann Thorac Surg 1994"]
      }
    }
  }$s3ludwig$::jsonb,
  '["airway","difficult_airway","icu"]'::jsonb,
  false
) ON CONFLICT (id) DO UPDATE SET
  specialty = EXCLUDED.specialty,
  specialties = EXCLUDED.specialties,
  titles = EXCLUDED.titles,
  synonyms = EXCLUDED.synonyms,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags,
  updated_at = now();

COMMIT;
