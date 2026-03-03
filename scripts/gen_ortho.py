import json, os

def esc(s):
    return s.replace(chr(39), chr(39)*2)

def gen_insert(p):
    content = {"quick": {"fr": p["quick"]["fr"]}, "deep": {"fr": p["deep"]["fr"]}}
    return (
        "INSERT INTO public.procedures (id, specialty, titles, synonyms, content, is_pro)\n"
        "VALUES ('{id}', '{spec}', '{titles}'::jsonb, '{syn}'::jsonb, '{cont}'::jsonb, false)\n"
        "ON CONFLICT (id) DO UPDATE SET specialty=EXCLUDED.specialty, titles=EXCLUDED.titles, "
        "synonyms=EXCLUDED.synonyms, content=EXCLUDED.content, updated_at=now();"
    ).format(
        id=esc(p["id"]),
        spec=esc(p["specialty"]),
        titles=esc(json.dumps(p["titles"], ensure_ascii=False)),
        syn=esc(json.dumps(p["synonyms"], ensure_ascii=False)),
        cont=esc(json.dumps(content, ensure_ascii=False)),
    )

procedures = [
  # ── Batch 1 ──────────────────────────────────────────────────────────────────
  {
    "id": "arthroplastie_epaule",
    "specialty": "Orthopédie",
    "titles": {
      "fr": "Arthroplastie de l'épaule (TSA / PTI inversée)",
      "en": "Shoulder arthroplasty (TSA / reverse TSA)",
      "pt": "Artroplastia do ombro (PTU total / reversa)"
    },
    "synonyms": {
      "fr": ["prothèse épaule", "TSA", "RSA", "prothèse totale inversée épaule", "arthroplastie gléno-humérale"],
      "en": ["shoulder replacement", "TSA", "reverse shoulder arthroplasty", "RSA"],
      "pt": ["prótese ombro", "artroplastia ombro"]
    },
    "quick": {
      "fr": {
        "preop": [
          "Evaluation neurologique membre supérieur de base (déficits moteur/sensitif, plexus brachial)",
          "Bilan cardiovasculaire si position beach chair (risque hypotension cérébrale +++)",
          "Bloc interscalène préopératoire : analgésie optimale, réduction morphine postop (ASRA recommandé)",
          "Contre-indication relative bloc interscalène : pneumopathie controlatérale, parésie phrénique connue",
          "Groupage + RAI — saignement modéré (200-500 mL attendu)"
        ],
        "intraop": [
          "Position beach chair (30-45°) : protéger tête/nuque, surveiller PA radiale AVANT installation",
          "PA invasive systématique (artère radiale) : maintenir PAM > 70 mmHg au niveau du conduit auditif",
          "AG ou bloc interscalène + sédation selon préférence et comorbidités",
          "Si AG : TIVA (propofol + remifentanil) ou halogéné — éviter protoxyde d'azote",
          "Attention brachial plexus stretch : vérifier position tête/épaule après installation",
          "Antibioprophylaxie : cefazoline 2g IV (vancomycine si allergie)",
          "Garrot pneumatique non utilisé (site trop proximal)"
        ],
        "postop": [
          "Analgésie multimodale : bloc interscalène continu (ropivacaine 0.2%) 48h + paracetamol + AINS",
          "Sans bloc : paracetamol + AINS + morphine titrée IV",
          "Immobilisation coude au corps 4-6 semaines (écharpe)",
          "Surveillance neurologique postopératoire : déficit sensitif/moteur plexus brachial",
          "Kinésithérapie précoce guidée selon protocole chirurgien"
        ],
        "red_flags": [
          "Hypotension peropératoire en beach chair (PAM < 60 au niveau cérébral) : risque AVC/ischémie cervicale — noradrenaline prete",
          "Paralysie phrénique (bloc interscalène 100%) : désaturation si pneumopathie controlatérale — SpO2 continue",
          "Lésion plexus brachial peropératoire (traction épaule) : scanner + EMG urgents",
          "Embolie cimenteuse (si ciment utilisé) : hypotension brutale + hypoxie — remplissage + vasopresseurs"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "rocuronium", "indication_tag": "intubation"},
          {"drug_id": "sugammadex", "indication_tag": "reversal"},
          {"drug_id": "remifentanil", "indication_tag": "analgesie_TIVA"},
          {"drug_id": "noradrenaline", "indication_tag": "PAM_beach_chair"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie"},
          {"drug_id": "ketorolac", "indication_tag": "analgesie"},
          {"drug_id": "ondansetron", "indication_tag": "PONV"},
          {"drug_id": "dexamethasone", "indication_tag": "PONV"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "En beach chair, la PAM doit être maintenue > 70 mmHg au niveau du conduit auditif externe — corriger pour la différence hydrostatique (environ -15 mmHg par rapport au bras).",
          "Le bloc interscalène entraîne une paralysie phrénique ipsilatérale dans 100% des cas — évaluer la réserve respiratoire avant.",
          "La PTI inversée (reverse TSA) est indiquée chez le sujet âgé avec coiffe des rotateurs détruite — saignement plus important qu'une TSA standard.",
          "ERAS épaule : mobilisation précoce J1, bloc continu 48h, pas de morphine systématique."
        ],
        "pitfalls": [
          "Ne pas surveiller la PA au poignet sans corriger la différence hydrostatique en beach chair — risque de sous-estimer la pression cérébrale.",
          "Bloc interscalène bilatéral : formellement contre-indiqué (double paralysie phrénique).",
          "Position beach chair > 2h : risque rare mais grave d'ischémie cérébrale — surveillance NIRS si disponible."
        ],
        "references": [
          {"source": "ASRA — Regional Anesthesia for Shoulder Surgery", "year": 2022, "note": "Interscalene block recommendations"},
          {"source": "SFAR — Arthroplasties", "year": 2020, "note": "Protocole anesthésie arthroplastie épaule"},
          {"source": "ASES/SECEC — Shoulder Arthroplasty Guidelines", "year": 2021, "note": "Outcomes et technique"}
        ]
      }
    }
  },
  {
    "id": "fracture_femur_diaphysaire",
    "specialty": "Orthopédie",
    "titles": {
      "fr": "Fracture diaphysaire du fémur (enclouage centromédullaire)",
      "en": "Femoral shaft fracture (intramedullary nailing)",
      "pt": "Fratura diafisária do fémur (encavilhamento intramedular)"
    },
    "synonyms": {
      "fr": ["fracture fémur", "clou centromédullaire fémur", "ECM fémur", "fracture milieu de cuisse"],
      "en": ["femur fracture", "femoral nailing", "IM nail femur"],
      "pt": ["fratura fémur", "encavilhamento femoral"]
    },
    "quick": {
      "fr": {
        "preop": [
          "Bilan traumatologique complet : exclure lésions associées (bassin, genou, rachis, thorax)",
          "Evaluation hémodynamique : fracture fémur = 1-2L de saignement interne possibles",
          "NFS, groupage + RAI, hémostase, ionogramme, lactates si choc",
          "Bloc fémoral ou FICB (fascia iliaca compartment block) en urgence pour antalgique préop",
          "Traction provisoire si fracture instable (réduction douleur + spasme)"
        ],
        "intraop": [
          "Table de traction orthopédique (table de Tasserit) : vérifier pression périnée et pied controlatéral",
          "Position décubitus dorsal ou latéral selon technique chirurgicale",
          "AG + IOT (rachianesthésie possible si patient stable et fracture isolée)",
          "Cathetère artériel si instabilité hémodynamique ou polytraumatisme",
          "Risque embolie graisseuse lors de l'alésage : hypoxie + tachycardie + pétéchies",
          "Transfusion si Hb < 8 g/dL (ou < 10 si cardiopathie) — cell salvage si disponible",
          "Antibioprophylaxie : cefazoline 2g IV avant incision"
        ],
        "postop": [
          "Analgésie : paracetamol + AINS + morphine titrée — bloc fémoral continu si disponible",
          "Mobilisation précoce J1 (sauf complications) — ERAS fracture",
          "Thromboprophylaxie HBPM dès J0 soir si hémostase satisfaisante",
          "Surveillance compartiment : douleurs à l'étirement passif + tension cuisse = urgence",
          "Surveiller NFS à H6-H12 (estimation saignement perop)"
        ],
        "red_flags": [
          "Syndrome de loge (compartiment) : douleurs intenses + engourdissement + tension musculaire — fasciotomie urgente",
          "Embolie graisseuse (6-72h post-fracture) : triade hypoxie + troubles neurologiques + pétéchies — O2 + soins de support",
          "Choc hémorragique (saignement fémoral ++ si fracture ouverte) : remplissage + transfusion + hémostase chirurgicale",
          "Compression nerf sciatique ou fémoral à la table de traction — vérifier position périodiquement"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "rocuronium", "indication_tag": "intubation"},
          {"drug_id": "sugammadex", "indication_tag": "reversal"},
          {"drug_id": "sufentanil", "indication_tag": "analgesie_perop"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie"},
          {"drug_id": "ketorolac", "indication_tag": "analgesie"},
          {"drug_id": "morphine", "indication_tag": "analgesie_postop"},
          {"drug_id": "noradrenaline", "indication_tag": "hypotension"},
          {"drug_id": "acide_tranexamique", "indication_tag": "antifibrinolytique"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "La fracture diaphysaire du fémur est une urgence chirurgicale (idéalement < 24h) — chaque heure de retard augmente le risque d'embolie graisseuse et de choc.",
          "Le FICB (fascia iliaca compartment block) est une technique simple et efficace pour l'antalgie préopératoire — réduction des besoins en morphine aux urgences.",
          "L'embolie graisseuse survient surtout lors de l'alésage médullaire (release de graisse et de microthrombi) — hypoxie + choc dans les cas sévères.",
          "La table de traction expose au risque de compression du périnée (nerf pudendal) et du pied controlatéral."
        ],
        "pitfalls": [
          "Ne pas sous-estimer le saignement interne (cuisse peut contenir 1-2L sans signe externe évident).",
          "L'alésage médullaire peut provoquer une embolie graisseuse brutale — surveiller SpO2 et ETCO2 lors de cette étape.",
          "Syndrome des loges de la cuisse : rare mais possible — surveiller systématiquement en postop."
        ],
        "references": [
          {"source": "AO Foundation — Femoral Shaft Fractures", "year": 2023, "note": "Technique enclouage centromédullaire"},
          {"source": "SFAR — Traumatologie et anesthésie", "year": 2021, "note": "Prise en charge anesthésique fractures membres inférieurs"},
          {"source": "NICE — Major Trauma", "year": 2022, "note": "Damage control and fracture management"}
        ]
      }
    }
  },
  {
    "id": "arthrodese_lombaire",
    "specialty": "Orthopédie",
    "titles": {
      "fr": "Arthrodèse lombaire (PLIF / TLIF / ALIF)",
      "en": "Lumbar spinal fusion (PLIF / TLIF / ALIF)",
      "pt": "Artrodese lombar (PLIF / TLIF / ALIF)"
    },
    "synonyms": {
      "fr": ["fusion lombaire", "arthrodèse rachis lombaire", "PLIF", "TLIF", "ALIF", "spondylodèse lombaire"],
      "en": ["lumbar fusion", "spinal fusion", "PLIF", "TLIF"],
      "pt": ["artrodese lombar", "fusão lombar", "espondilodese"]
    },
    "quick": {
      "fr": {
        "preop": [
          "Evaluation neurologique de base : déficits radiculaires, niveau sensitivo-moteur (documentation)",
          "Bilan cardiovasculaire si terrain vasculaire (ALIF — dissection aortique possible)",
          "NFS, groupage + RAI, hémostase — saignement attendu 500-1500 mL selon niveaux",
          "Discuter cell salvage si arthrodèse multi-étagée (≥ 3 niveaux)",
          "Corticostéroïdes préopératoires si oedème radiculaire préexistant"
        ],
        "intraop": [
          "AG + IOT — position ventrale (DV) sur billots ou cadre de Wilson",
          "Protections pression scrupuleuses : yeux (risque cécité), genoux, organes génitaux, abdomen",
          "Catétère artériel systématique (monitoring continu PA + GDS perop)",
          "Monitoring neurophysiologique : PES et PEM pour détecter ischémie médullaire en temps réel",
          "Cell salvage si > 2 niveaux ou ré-intervention",
          "Acide tranexamique : 1g IV avant incision + 1g perfusion (réduction saignement 30-40%)",
          "Antibioprophylaxie : cefazoline 2g IV (répéter toutes les 4h si chirurgie longue)"
        ],
        "postop": [
          "Analgésie multimodale : paracetamol + AINS (si pas de CI) + lidocaïne IV ou kétamine IV (anti-hyperalgésie)",
          "Morphine IV titrée ou PCA morphine si douleurs intenses",
          "Levée précoce J1 avec kinésithérapeute (protocole ERAS rachis)",
          "Thromboprophylaxie : bas de contention + HBPM dès J0 soir",
          "Surveillance neurologique : examen moteur/sensitif membres inférieurs toutes les heures × 6h"
        ],
        "red_flags": [
          "Ischémie médullaire (changement PEM perop) : retirer instrumentations, élever PAM > 85 mmHg — urgence",
          "Hématome épidural postopératoire (déficit neurologique croissant) : IRM urgente + reprise chirurgicale < 6h",
          "Cécité postopératoire (POVL) : position DV + hypotension prolongée + anémie — risque neuropathie optique ischémique",
          "Saignement perop massif (multi-étagé) : activation protocole transfusion massive"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "rocuronium", "indication_tag": "intubation"},
          {"drug_id": "sugammadex", "indication_tag": "reversal"},
          {"drug_id": "sufentanil", "indication_tag": "analgesie_perop"},
          {"drug_id": "remifentanil", "indication_tag": "TIVA_option"},
          {"drug_id": "ketamine", "indication_tag": "anti-hyperalgesie"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie"},
          {"drug_id": "acide_tranexamique", "indication_tag": "antifibrinolytique"},
          {"drug_id": "noradrenaline", "indication_tag": "PAM_cible"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "La cécité postopératoire (POVL — posterior ischemic optic neuropathy) est une complication rare mais dévastatrice de la chirurgie rachidienne en DV : facteurs de risque = DV prolongé > 6h, hypotension, anémie sévère, obésité.",
          "Le monitoring neurophysiologique (PES + PEM) est standard pour les arthrodèses lombaires avec instrumentation — permet de détecter l'ischémie médullaire en temps réel.",
          "L'acide tranexamique réduit le saignement peropératoire de 30-40% dans la chirurgie du rachis.",
          "La PAM doit être maintenue > 80-85 mmHg en peropératoire pour assurer la perfusion médullaire."
        ],
        "pitfalls": [
          "Position DV prolongée : vérifier les yeux toutes les 30 min (pression = POVL), protéger le visage sur repose-tête en mousse.",
          "ALIF : risque de lésion vasculaire (aorte, veine cave, iliaques) lors de la dissection antérieure — chirurgien vasculaire en stand-by recommandé.",
          "L'hypercapnie légère (PaCO2 40-45 mmHg) est préférable à l'hypocapnie — meilleure perfusion médullaire."
        ],
        "references": [
          {"source": "North American Spine Society (NASS) — Lumbar Fusion", "year": 2022, "note": "Evidence-based guidelines"},
          {"source": "SFAR — Rachis", "year": 2021, "note": "Recommandations anesthésie chirurgie rachidienne"},
          {"source": "SRS — Scoliosis Research Society", "year": 2020, "note": "Neuromonitoring standards"}
        ]
      }
    }
  },
  # ── Batch 2 ──────────────────────────────────────────────────────────────────
  {
    "id": "chirurgie_pied_cheville",
    "specialty": "Orthopédie",
    "titles": {
      "fr": "Chirurgie du pied et de la cheville (hallux valgus / ostéotomie)",
      "en": "Foot and ankle surgery (hallux valgus / osteotomy)",
      "pt": "Cirurgia do pé e tornozelo (hallux valgus / osteotomia)"
    },
    "synonyms": {
      "fr": ["hallux valgus", "ostéotomie métatarse", "arthrodèse cheville", "chirurgie avant-pied", "Scarf", "Chevron"],
      "en": ["hallux valgus", "bunion surgery", "metatarsal osteotomy", "ankle arthrodesis"],
      "pt": ["hallux valgus", "cirurgia do pé", "osteotomia metatarso"]
    },
    "quick": {
      "fr": {
        "preop": [
          "Evaluation vasculaire périphérique (pouls pédieux + tibial postérieur) — diabète fréquemment associé",
          "Bilan glycémique si diabète : objectif HbA1c < 8% pour chirurgie électivie",
          "Bloc poplité (nerf sciatique) + bloc saphène = analgésie complète du pied et de la cheville",
          "Bloc de cheville (ankle block) 5 nerfs pour chirurgie avant-pied isolée",
          "Chirurgie souvent ambulatoire — informer patient sur retour à domicile avec bloc en place"
        ],
        "intraop": [
          "ALR préférentielle : bloc poplité (sciatique) + saphène sous garrot (1h30 toléré sous ALR)",
          "Garrot pneumatique à la cheville (250-350 mmHg) ou cuisse (300-400 mmHg)",
          "Si AG : propofol + masque laryngé (LMA) acceptable (chirurgie non-algique sous bloc)",
          "Position décubitus dorsal, pied déclive sur sac — préserver accès rachis si rachianesthésie",
          "Rachianesthésie (bupivacaine hyperbare 7.5-10 mg) alternative si bloc difficile ou patient préfère",
          "Antibioprophylaxie : cefazoline 2g IV avant garrot"
        ],
        "postop": [
          "Analgésie prolongée (bloc poplité continu 24-48h si disponible) : excellente tolérance ambulatoire",
          "Relais oral : paracetamol + AINS + codéine si besoin",
          "Décharge ou appui talon selon technique — informer patient avant sortie",
          "Chaussure de décharge post-chirurgicale obligatoire",
          "HBPM 7-10 jours (garrot + immobilisation partielle)"
        ],
        "red_flags": [
          "Ischémie cutanée (garrot prolongé > 2h ou garrot cheville > pression recommandée) — retrait garrot immédiat",
          "Infection plaie (diabétique ++) : revoir J5-J7 — urgence si fièvre + érythème + pus",
          "Syndrome douloureux régional complexe (SDRC type I) : douleurs disproportionnées + allodynie J7-J30 — kinési + traitement précoce",
          "Thrombose veineuse profonde distale (garrot + immobilisation) — HBPM systématique"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction_ou_sedation"},
          {"drug_id": "bupivacaine", "indication_tag": "bloc_poplite"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie"},
          {"drug_id": "ketorolac", "indication_tag": "analgesie"},
          {"drug_id": "ondansetron", "indication_tag": "PONV"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"},
          {"drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Le bloc poplité (nerf sciatique poplité) + bloc du nerf saphène couvre la totalité du pied et de la cheville — gold standard pour cette chirurgie.",
          "La chirurgie du pied est idéale pour l'ambulatoire si ALR : patient rentre avec bloc actif, antalgiques oraux pour relais.",
          "Le garrot à la cheville est mieux toléré que le garrot de cuisse (moins douloureux) mais doit respecter des pressions inférieures.",
          "Le diabète augmente le risque infectieux et retarde la cicatrisation — surveillance rapprochée J5-J7."
        ],
        "pitfalls": [
          "Garrot à la cheville contre-indiqué si artériopathie périphérique sévère (IPS < 0.5).",
          "Le bloc de cheville (5 nerfs) ne suffit pas pour une chirurgie de la cheville ou du médio-pied — bloc poplité nécessaire.",
          "Informer le patient que le pied sera insensible et chaud 12-18h après le bloc — risque de brûlure involontaire (bouillotte, bain chaud)."
        ],
        "references": [
          {"source": "ASRA — Lower Extremity Peripheral Nerve Blocks", "year": 2021, "note": "Popliteal and ankle block techniques"},
          {"source": "SFAR — Anesthésie ambulatoire", "year": 2021, "note": "Protocoles chirurgie ambulatoire du pied"},
          {"source": "AOFAS — Foot and Ankle Surgery Guidelines", "year": 2022, "note": "Recommendations perioperative care"}
        ]
      }
    }
  },
  {
    "id": "amputation_membre",
    "specialty": "Orthopédie",
    "titles": {
      "fr": "Amputation de membre (vasculaire / traumatique)",
      "en": "Limb amputation (vascular / traumatic)",
      "pt": "Amputação de membro (vascular / traumática)"
    },
    "synonyms": {
      "fr": ["amputation jambe", "amputation cuisse", "amputation transtibiale", "amputation transfémorale", "désarticulation genou"],
      "en": ["BKA", "AKA", "below-knee amputation", "above-knee amputation", "limb amputation"],
      "pt": ["amputação membro", "amputação transtibial", "amputação transfemoral"]
    },
    "quick": {
      "fr": {
        "preop": [
          "Bilan vasculaire complet : TCPO2, écho-doppler artériel, bilan biologique (albumine, NFS)",
          "Optimisation comorbidités : diabète (glycémie < 10 mmol/L perop), insuffisance rénale, cardiopathie",
          "Discuter cathéter périnerveux préopératoire (fémoral ou sciatique) pour prévention douleur fantôme",
          "Information patient : douleurs fantômes (70-80% des amputés), rééducation appareillage",
          "Consentement niveau d'amputation : décision finale peropératoire selon vitalité tissulaire"
        ],
        "intraop": [
          "AG ou rachianesthésie (niveau T10) ou ALR (bloc fémoral + sciatique) selon niveau d'amputation",
          "Rachianesthésie préférée pour amputation transtibiale : excellente qualité, prévention douleur fantôme",
          "Si AG : propofol + sufentanil, éviter halogéné si cardiopathie sévère",
          "Garrot pneumatique (sauf si amputation ischémique = garrot CI)",
          "Antibioprophylaxie : cefazoline 2g IV (+ métronidazole si gangrène gazeuse ou contamination fécale)",
          "Prélèvement bactériologique per-opératoire si plaie infectée"
        ],
        "postop": [
          "Cathéter périnerveux continu (fémoral ou sciatique) 5-7 jours : prévention douleur fantôme (niveau de preuve modéré)",
          "Gabapentine ou prégabaline dès J0 : réduction incidence douleur fantôme (NICE recommandé)",
          "Miroir thérapeutique dès J2-J3 : réduction douleur fantôme",
          "Surveillance moignon : saignement, ischémie distale, infection",
          "HBPM prophylaxie pendant 30 jours (immobilisation + terrain vasculaire)"
        ],
        "red_flags": [
          "Douleurs fantômes intenses précoces (J0-J3) : ajuster analgésie — gabapentine + amitriptyline",
          "Ischémie moignon postopératoire : révision niveau d'amputation",
          "Sepsis sur moignon infecté (gangrène progressante) : reprise chirurgicale urgente",
          "Embolie pulmonaire (terrain vasculaire + immobilisation) : mobilisation précoce + HBPM"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "rocuronium", "indication_tag": "intubation"},
          {"drug_id": "sugammadex", "indication_tag": "reversal"},
          {"drug_id": "sufentanil", "indication_tag": "analgesie_perop"},
          {"drug_id": "bupivacaine", "indication_tag": "catheter_perinerveux"},
          {"drug_id": "ketamine", "indication_tag": "prevention_douleur_fantome"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie"},
          {"drug_id": "morphine", "indication_tag": "analgesie_postop"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Les douleurs fantômes affectent 70-80% des amputés — leur prévention commence en peropératoire (rachianesthésie, cathéter périnerveux, kétamine).",
          "La rachianesthésie pour amputation transtibiale est supérieure à l'AG pour la prévention des douleurs fantômes (niveau de preuve II).",
          "L'état nutritionnel (albumine < 30 g/L) est un facteur de risque de retard de cicatrisation — corriger si possible avant chirurgie élective.",
          "Le niveau d'amputation est parfois décidé peropératoire (vitalité tissulaire, saignement osseux) — informer le patient."
        ],
        "pitfalls": [
          "Garrot contre-indiqué en cas d'amputation pour ischémie — le saignement est le seul indicateur de vitalité tissulaire.",
          "Ne pas administrer de vasoconstricteurs locaux (adrénaline) dans les zones ischémiques.",
          "La gabapentine doit être démarrée AVANT la chirurgie pour réduction maximale de la douleur fantôme."
        ],
        "references": [
          {"source": "Cochrane Review — Phantom limb pain prevention", "year": 2021, "note": "Regional anesthesia and phantom pain"},
          {"source": "SFAR — Amputations vasculaires", "year": 2020, "note": "Protocole anesthésie amputation"},
          {"source": "NICE — Peripheral arterial disease", "year": 2022, "note": "Perioperative management"}
        ]
      }
    }
  },
  {
    "id": "fracture_humerus_proximal",
    "specialty": "Orthopédie",
    "titles": {
      "fr": "Fracture de l'humérus proximal (ORIF / prothèse)",
      "en": "Proximal humerus fracture (ORIF / arthroplasty)",
      "pt": "Fratura do úmero proximal (ORIF / artroplastia)"
    },
    "synonyms": {
      "fr": ["fracture humérus proximal", "fracture col humérus", "fracture épaule", "ORIF humérus", "prothèse humérale"],
      "en": ["proximal humerus fracture", "humeral fracture", "shoulder fracture", "ORIF humerus"],
      "pt": ["fratura úmero proximal", "fratura do ombro"]
    },
    "quick": {
      "fr": {
        "preop": [
          "Patient souvent âgé + ostéoporose : évaluer fragilité (score CFS), état cognitif, comorbidités",
          "Imagerie : radiographies F+P+Y-view + scanner 3D si fracture comminutive pour planification chirurgicale",
          "Décision ORIF vs prothèse humérale (hémiartroplastie ou PTI) selon fragments et âge",
          "Bloc interscalène préopératoire pour antalgie dès les urgences",
          "Position décubitus dorsal ou beach chair selon chirurgien — évaluer PA radiale avant installation"
        ],
        "intraop": [
          "Position beach chair (30-45°) ou decubitus dorsal avec billot sous l'épaule",
          "PA invasive (artère radiale) systématique si beach chair : maintenir PAM > 70 mmHg cérébral",
          "AG + IOT + bloc interscalène ou ALR seul + sédation légère",
          "TIVA (propofol + remifentanil) recommandée en beach chair pour reveil rapide",
          "Fluoroscopie peropératoire : protéger équipe (thyroïde, tablier plombé)",
          "Antibioprophylaxie : cefazoline 2g IV avant incision",
          "Durée opératoire variable (1-3h selon technique) : prévoir réchauffement actif"
        ],
        "postop": [
          "Immobilisation coude au corps 4-6 semaines — écharpe + attelle",
          "Analgésie : bloc interscalène continu 48h (ropivacaine 0.2% 5-8 mL/h) + paracetamol + AINS",
          "Sans bloc continu : paracetamol + AINS + morphine PO titrée",
          "Thromboprophylaxie : HBPM 14-28 jours selon mobilité",
          "Kinésithérapie immédiate (J1-J2) en pendulaire doux si fracture stable"
        ],
        "red_flags": [
          "Hypotension peropératoire en beach chair (PAM < 60 cérébral) : noradrenaline prete, repositionner si persiste",
          "Lésion vasculaire axillaire (rare, fractures avec luxation) : angioscanner urgent",
          "Paralysie nerveuse postopératoire (nerf axillaire ++) : EMG J21 si pas de récupération",
          "Nécrose tête humérale (ORIF fragments déplacés) : révision prothétique à 1-2 ans"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "rocuronium", "indication_tag": "intubation"},
          {"drug_id": "sugammadex", "indication_tag": "reversal"},
          {"drug_id": "remifentanil", "indication_tag": "analgesie_TIVA"},
          {"drug_id": "noradrenaline", "indication_tag": "PAM_beach_chair"},
          {"drug_id": "bupivacaine", "indication_tag": "bloc_interscalene"},
          {"drug_id": "paracetamol", "indication_tag": "analgesie"},
          {"drug_id": "ketorolac", "indication_tag": "analgesie"},
          {"drug_id": "ondansetron", "indication_tag": "PONV"},
          {"drug_id": "dexamethasone", "indication_tag": "PONV"},
          {"drug_id": "cefazoline", "indication_tag": "antibioprophylaxie"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "La fracture de l'humérus proximal est la 3e fracture la plus fréquente chez le sujet âgé (après poignet et hanche).",
          "Le bloc interscalène est le gold standard pour l'analgésie peropératoire et postopératoire — réduction morphine de 60-70%.",
          "La décision ORIF vs prothèse est critique : fractures à 4 fragments (classification Neer) → prothèse (meilleurs résultats fonctionnels).",
          "En beach chair, la PAM mesurée au poignet doit être augmentée de ~15 mmHg pour estimer la pression cérébrale réelle."
        ],
        "pitfalls": [
          "Bloc interscalène : toujours vérifier l'absence de pneumopathie controlatérale avant réalisation (paralysie phrénique).",
          "L'ostéoporose sévère peut rendre l'ostéosynthèse impossible — discuter prothèse emblée si T-score < -3.",
          "Fracture-luxation : risque de lésion vasculaire axillaire — palper le pouls avant et après réduction."
        ],
        "references": [
          {"source": "SOFCOT — Fractures humérus proximal", "year": 2022, "note": "Classification et traitement"},
          {"source": "ASRA — Interscalene block", "year": 2021, "note": "Regional anesthesia shoulder"},
          {"source": "Cochrane — ORIF vs arthroplasty proximal humerus", "year": 2021, "note": "Comparative outcomes elderly"}
        ]
      }
    }
  },
]

batches = [procedures[0:3], procedures[3:6]]
os.makedirs("supabase/migrations", exist_ok=True)
for i, batch in enumerate(batches):
    sql = "BEGIN;\n" + "\n".join(gen_insert(p) for p in batch) + "\nCOMMIT;"
    fname = f"supabase/migrations/tmp_ortho_b{i+1}.sql"
    with open(fname, "w", encoding="utf-8") as f:
        f.write(sql)
    print(f"Written {fname} ({len(sql)} chars, {len(batch)} procedures)")
