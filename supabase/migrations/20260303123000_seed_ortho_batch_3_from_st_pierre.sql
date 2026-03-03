BEGIN;

-- Additional orthopedics batch derived from St Pierre pages 149-152.
-- Intentionally skipped as already present in the repo:
--   arthroplastie_epaule
--   fracture_femur_diaphysaire
--   fracture_humerus_proximal
--   chirurgie_pied_cheville

INSERT INTO public.procedures (id, specialty, titles, synonyms, content, is_pro)
VALUES (
  'fracture_col_femoral_deplacee_arthroplastie',
  'orthopedie',
  $${
    "fr": "Fracture intracapsulaire déplacée du col fémoral (PTH / hémiarthroplastie)",
    "en": "Displaced intracapsular femoral neck fracture (THA / hemiarthroplasty)",
    "pt": "Fratura intracapsular deslocada do colo do fémur (PTA / hemiartroplastia)"
  }$$::jsonb,
  $${
    "fr": [
      "PTH pour fracture",
      "BHP pour fracture",
      "hémiarthroplastie de hanche sur fracture",
      "fracture déplacée du col fémoral"
    ],
    "en": [
      "hemiarthroplasty for hip fracture",
      "THA for femoral neck fracture",
      "displaced femoral neck fracture"
    ],
    "pt": [
      "hemiartroplastia por fratura da anca",
      "PTA por fratura do colo do fémur",
      "fratura deslocada do colo femoral"
    ]
  }$$::jsonb,
  $${
    "quick": {
      "fr": {
        "preop": [
          "Bilan orthogériatrique précoce : delirium, anticoagulation, anémie, déshydratation et réserve fonctionnelle.",
          "Objectif de chirurgie dès que possible en sécurité, idéalement dans une fenêtre de 24 à 48 heures après admission.",
          "Antalgie initiale : paracétamol systématique, opioïdes de secours, et bloc fascia iliaca ou PENG si disponible.",
          "Groupage plus RAI, NFS, créatinine et préparation transfusionnelle si terrain fragile ou fracture saignante.",
          "Décision PTH versus hémiarthroplastie selon autonomie pré-fracture, cognition, comorbidités et espérance fonctionnelle."
        ],
        "intraop": [
          "Pour une fracture intracapsulaire déplacée, l arthroplastie est généralement préférée à l ostéosynthèse.",
          "Anesthésie générale ou rachianesthésie acceptables ; le choix dépend surtout de la physiologie, de l anticoagulation et de la logistique.",
          "Tige cimentée habituelle ; anticiper le risque de bone cement implantation syndrome avant la phase de cimentage.",
          "Antibioprophylaxie par céfazoline avant incision et acide tranexamique si absence de contre-indication thrombotique.",
          "Installer et opérer avec l objectif d autoriser un appui complet immédiat ou très précoce en postopératoire."
        ],
        "postop": [
          "Mobilisation avec kinésithérapie dès J1, puis au moins une séance quotidienne si pas de contre-indication.",
          "Analgésie multimodale avec épargne morphinique et surveillance active du delirium, surtout chez le sujet âgé.",
          "Thromboprophylaxie pharmacologique et mécanique selon risque hémorragique et statut neuraxial.",
          "Appui complet selon tolérance dans la majorité des cas si stabilité mécanique jugée satisfaisante par le chirurgien.",
          "Surveiller hémoglobine, état volémique, constipation, rétention urinaire et reprise fonctionnelle."
        ],
        "red_flags": [
          "Hypotension ou hypoxie au cimentage : suspecter un bone cement implantation syndrome et traiter immédiatement.",
          "Delirium hyperactif ou hypoactif postopératoire : réévaluer douleur, rétention, infection, hypoxie et médicaments.",
          "Anémie postopératoire occulte ou saignement persistant : contrôler Hb et cause de pertes cachées.",
          "Luxation, fracture périprothétique ou incapacité à mobiliser : imagerie rapide et réévaluation chirurgicale."
        ],
        "drugs": [
          { "drug_id": "propofol", "indication_tag": "induction" },
          { "drug_id": "rocuronium", "indication_tag": "intubation" },
          { "drug_id": "sugammadex", "indication_tag": "reversal" },
          { "drug_id": "bupivacaine", "indication_tag": "BIS" },
          { "drug_id": "sufentanil", "indication_tag": "analgésie_perop" },
          { "drug_id": "paracetamol", "indication_tag": "analgésie" },
          { "drug_id": "morphine", "indication_tag": "analgésie_postop" },
          { "drug_id": "cefazoline", "indication_tag": "antibioprophylaxie" },
          { "drug_id": "acide_tranexamique", "indication_tag": "antifibrinolytique" },
          { "drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie" },
          { "drug_id": "noradrenaline", "indication_tag": "vasopresseur" }
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Les recommandations NICE soutiennent une chirurgie le jour même ou le lendemain de l admission, avec correction rapide des causes réversibles de retard.",
          "Pour une fracture intracapsulaire déplacée, NICE recommande une arthroplastie de remplacement, avec PTH à considérer chez les patients autonomes et médicalement aptes.",
          "Le guideline AAOS 2021 renforce une cible de chirurgie dans les 24 à 48 heures et soutient fortement l usage des tiges fémorales cimentées pour les fractures du col."
        ],
        "pitfalls": [
          "Confondre une bonne autonomie pré-fracture avec une indication automatique de PTH : la cognition, le terrain et les objectifs fonctionnels restent déterminants.",
          "Retarder la chirurgie pour des anomalies mineures non corrigeables rapidement aggrave la morbidité chez le patient fragile.",
          "Sous-estimer le risque hémodynamique du cimentage expose à une défaillance brutale évitable si l équipe anticipe."
        ],
        "references": [
          {
            "source": "NICE CG124 — Hip fracture: management",
            "year": 2023,
            "note": "Arthroplasty for displaced intracapsular fracture, cemented implants, early mobilisation."
          },
          {
            "source": "AAOS — Management of Hip Fractures in Older Adults",
            "year": 2021,
            "note": "Surgery within 24-48h, interdisciplinary care, cemented stems for femoral neck fracture."
          }
        ]
      }
    }
  }$$::jsonb,
  false
)
ON CONFLICT (id) DO UPDATE
SET
  specialty = EXCLUDED.specialty,
  titles = EXCLUDED.titles,
  synonyms = EXCLUDED.synonyms,
  content = EXCLUDED.content,
  updated_at = now();

INSERT INTO public.procedures (id, specialty, titles, synonyms, content, is_pro)
VALUES (
  'fracture_pertrochanterienne_clou_cephalomedullaire',
  'orthopedie',
  $${
    "fr": "Fracture pertrochantérienne / sous-trochantérienne (clou gamma / clou céphalomédullaire)",
    "en": "Pertrochanteric or subtrochanteric fracture (gamma nail / cephalomedullary nail)",
    "pt": "Fratura pertrocantérica ou subtrocantérica (Gamma nail / cavilha cefalomedular)"
  }$$::jsonb,
  $${
    "fr": [
      "clou gamma",
      "fracture pertrochantérienne",
      "fracture trochantérienne",
      "fracture sous-trochantérienne"
    ],
    "en": [
      "gamma nail",
      "intertrochanteric fracture nail",
      "cephalomedullary nailing"
    ],
    "pt": [
      "clavo gamma",
      "fratura pertrocantérica",
      "encavilhamento cefalomedular"
    ]
  }$$::jsonb,
  $${
    "quick": {
      "fr": {
        "preop": [
          "Différencier fracture trochantérienne stable, fracture instable en varus ou trait reverse oblique, car le choix de l implant en dépend.",
          "Optimiser volémie, anticoagulation, anémie et douleur ; bloc fascia iliaca utile dès l admission.",
          "Vérifier les lésions associées, la qualité cutanée et le risque de syndrome de fragilité.",
          "Objectif de passage au bloc dans les 24 à 48 heures si l état clinique le permet.",
          "Prévoir groupage, bilan sanguin et réserve transfusionnelle si fracture instable ou terrain à risque."
        ],
        "intraop": [
          "Installation sur table de traction avec fluoroscopie ; obtenir une réduction satisfaisante avant verrouillage du clou.",
          "Les fractures instables, reverse oblique ou avec extension sous-trochantérienne sont de bonnes candidates au clou céphalomédullaire.",
          "Les fractures trochantériennes stables pures peuvent relever d un implant extramédullaire selon le pattern et l habitude locale.",
          "Anesthésie générale ou rachianesthésie acceptables ; surveiller pertes cachées et hypothermie.",
          "Céfazoline avant incision, acide tranexamique si approprié, et éviter une réduction en varus pour limiter le cut-out."
        ],
        "postop": [
          "Appui selon tolérance si stabilité de la fixation confirmée ; réévaluer si réduction limite.",
          "Mobilisation et verticalisation précoces avec prise en charge gériatrique et rééducation quotidienne.",
          "Thromboprophylaxie 6 à 12 heures après chirurgie selon risque neuraxial et hémostase.",
          "Surveiller hémoglobine, douleur, raccourcissement du membre et qualité de la cicatrice.",
          "Revoir rapidement si douleur croissante, impossibilité d appui ou suspicion de déplacement secondaire."
        ],
        "red_flags": [
          "Hypoxie peropératoire ou brutale au verrouillage et à l alésage : évoquer embolie graisseuse ou décompensation respiratoire.",
          "Varus résiduel, mauvaise position cervico-céphalique ou migration de vis : risque élevé de cut-out et d échec mécanique.",
          "Chute secondaire de Hb ou hématome de cuisse important : rechercher saignement occulte postopératoire.",
          "Rotation externe majeure ou inégalité de longueur manifeste : suspecter malrotation ou réduction insuffisante."
        ],
        "drugs": [
          { "drug_id": "propofol", "indication_tag": "induction" },
          { "drug_id": "rocuronium", "indication_tag": "intubation" },
          { "drug_id": "sugammadex", "indication_tag": "reversal" },
          { "drug_id": "bupivacaine", "indication_tag": "BIS" },
          { "drug_id": "sufentanil", "indication_tag": "analgésie_perop" },
          { "drug_id": "paracetamol", "indication_tag": "analgésie" },
          { "drug_id": "morphine", "indication_tag": "analgésie_postop" },
          { "drug_id": "cefazoline", "indication_tag": "antibioprophylaxie" },
          { "drug_id": "acide_tranexamique", "indication_tag": "antifibrinolytique" },
          { "drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie" },
          { "drug_id": "noradrenaline", "indication_tag": "vasopresseur" }
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Le fascicule St Pierre mentionne explicitement le clou gamma dans les fractures trochantériennes, ce qui justifie un item distinct du clou fémoral diaphysaire déjà présent.",
          "NICE recommande encore un implant extramédullaire de type DHS pour les fractures trochantériennes au-dessus et au niveau du petit trochanter, sauf pattern reverse oblique.",
          "NICE recommande un clou intramédullaire pour les fractures sous-trochantériennes ; en pratique moderne, les patterns instables sont souvent traités par clou céphalomédullaire."
        ],
        "pitfalls": [
          "Appliquer un clou gamma à une fracture stable sans réfléchir au pattern exact peut surtraiter certains cas simples.",
          "Une réduction imparfaite avant enclouage se paie plus tard par un échec mécanique, même avec un implant robuste.",
          "Le patient âgé saigne souvent plus que ne le laisse penser la cicatrice ; les pertes cachées restent une cause fréquente de décompensation."
        ],
        "references": [
          {
            "source": "NICE CG124 — Hip fracture: management",
            "year": 2023,
            "note": "Implant selection by fracture pattern: sliding hip screw for most trochanteric fractures, intramedullary nail for subtrochanteric fractures."
          },
          {
            "source": "AAOS — Management of Hip Fractures in Older Adults",
            "year": 2021,
            "note": "Evidence-based operative guidance for older adults with hip fracture, including timing and fixation pathways."
          }
        ]
      }
    }
  }$$::jsonb,
  false
)
ON CONFLICT (id) DO UPDATE
SET
  specialty = EXCLUDED.specialty,
  titles = EXCLUDED.titles,
  synonyms = EXCLUDED.synonyms,
  content = EXCLUDED.content,
  updated_at = now();

INSERT INTO public.procedures (id, specialty, titles, synonyms, content, is_pro)
VALUES (
  'prothese_totale_genou',
  'orthopedie',
  $${
    "fr": "Prothèse totale du genou (PTG)",
    "en": "Total knee arthroplasty (TKA)",
    "pt": "Prótese total do joelho (PTJ)"
  }$$::jsonb,
  $${
    "fr": [
      "PTG",
      "arthroplastie totale du genou",
      "prothèse de genou"
    ],
    "en": [
      "TKA",
      "total knee replacement",
      "knee arthroplasty"
    ],
    "pt": [
      "PTJ",
      "artroplastia total do joelho",
      "prótese do joelho"
    ]
  }$$::jsonb,
  $${
    "quick": {
      "fr": {
        "preop": [
          "Optimiser glycémie, poids, statut inflammatoire, anémie et usage chronique d opioïdes avant chirurgie.",
          "Education préopératoire et préparation fonctionnelle font partie d un parcours de récupération améliorée.",
          "Planifier prophylaxie thromboembolique, stratégie antiémétique et analgésie multimodale avant entrée au bloc.",
          "Discuter rachianesthésie versus AG ; intégrer un bloc périphérique et une infiltration périarticulaire si possible.",
          "Vérifier risque infectieux, portage staphylococcique local et état cutané avant implantation."
        ],
        "intraop": [
          "PTG indiquée pour gonarthrose symptomatique réfractaire au traitement conservateur avec limitation fonctionnelle significative.",
          "Rachianesthésie ou anesthésie générale acceptables ; bloc périphérique et infiltration périarticulaire diminuent la douleur postopératoire.",
          "Céfazoline avant incision et réinjection si chirurgie prolongée ; éviter sondage urinaire prolongé si possible.",
          "Acide tranexamique de routine sauf contre-indication pour limiter les pertes sanguines et la transfusion.",
          "L usage de robotique ou de principes d alignement spécifiques ne montre pas de bénéfice clinique clair à court terme."
        ],
        "postop": [
          "Lever précoce, idéalement le jour même ou au plus tard dans les 24 heures, avec kinésithérapie structurée.",
          "Analgésie opioïd-sparing : paracétamol, AINS si possibles, bloc et morphine de secours titrée.",
          "Thromboprophylaxie médicamenteuse et mécanique selon protocole local et risque individuel.",
          "Surveiller glycémie, douleur, récupération de l extension, rétention urinaire et statut neurovasculaire distal.",
          "La mobilisation active et la rééducation priment ; le Kinetec reste sélectif et non systématique."
        ],
        "red_flags": [
          "Douleur disproportionnée, épanchement chaud ou drainage persistant : suspecter infection précoce ou hémarthrose.",
          "Déficit du SPE, chute du pied ou hypoesthésie dorsale : rechercher atteinte neurologique péri-fibulaire.",
          "Raideur rapide avec perte d extension ou flexion bloquée : prévenir arthrofibrose par rééducation et réévaluation.",
          "TVP ou EP : douleur mollet, asymétrie, dyspnée ou désaturation doivent déclencher un bilan urgent."
        ],
        "drugs": [
          { "drug_id": "propofol", "indication_tag": "induction" },
          { "drug_id": "bupivacaine", "indication_tag": "rachianesthésie" },
          { "drug_id": "bupivacaine", "indication_tag": "BIS" },
          { "drug_id": "paracetamol", "indication_tag": "analgésie" },
          { "drug_id": "ketorolac", "indication_tag": "analgésie" },
          { "drug_id": "morphine", "indication_tag": "analgésie_postop" },
          { "drug_id": "ondansetron", "indication_tag": "PONV" },
          { "drug_id": "dexamethasone", "indication_tag": "PONV_anti-oedème" },
          { "drug_id": "cefazoline", "indication_tag": "antibioprophylaxie" },
          { "drug_id": "acide_tranexamique", "indication_tag": "antifibrinolytique" },
          { "drug_id": "enoxaparine", "indication_tag": "thromboprophylaxie" }
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Le fascicule St Pierre liste la PTG comme intervention distincte avec options de bloc fémoral, canal des adducteurs et infiltration, ce qui n existait pas encore dans le seed local.",
          "Le consensus ERAS pour hanche et genou soutient une éducation préopératoire, une stratégie transfusionnelle structurée, une analgésie multimodale avec épargne morphinique et une mobilisation précoce.",
          "Le guideline AAOS 2022 renforce l optimisation glycémique, la réduction des opioïdes préopératoires, les blocs périphériques et les infiltrations périarticulaires pour réduire douleur et consommation d opioïdes."
        ],
        "pitfalls": [
          "Poursuivre des opioïdes chroniques sans préparation augmente la douleur postopératoire et dégrade les scores fonctionnels.",
          "Confondre récupération rapide et sortie précipitée : la décharge est conditionnée par douleur contrôlée, sécurité de marche et surveillance des complications.",
          "Laisser une hyperglycémie non corrigée augmente les complications de cicatrisation et infectieuses."
        ],
        "references": [
          {
            "source": "ERAS Society — THR/TKR perioperative care consensus",
            "year": 2020,
            "note": "Preoperative education, opioid-sparing multimodal analgesia, transfusion strategy, early mobilization."
          },
          {
            "source": "AAOS — Surgical Management of Osteoarthritis of the Knee",
            "year": 2022,
            "note": "Glucose optimisation, peripheral nerve block, periarticular infiltration, opioid reduction."
          },
          {
            "source": "European Consensus — Prevention of Periprosthetic Joint Infection in THR/TKR",
            "year": 2022,
            "note": "Structured infection-prevention bundle around arthroplasty."
          }
        ]
      }
    }
  }$$::jsonb,
  false
)
ON CONFLICT (id) DO UPDATE
SET
  specialty = EXCLUDED.specialty,
  titles = EXCLUDED.titles,
  synonyms = EXCLUDED.synonyms,
  content = EXCLUDED.content,
  updated_at = now();

INSERT INTO public.procedures (id, specialty, titles, synonyms, content, is_pro)
VALUES (
  'fracture_radius_distal',
  'orthopedie',
  $${
    "fr": "Fracture du radius distal (plâtre / brochage / plaque palmaire)",
    "en": "Distal radius fracture (casting / K-wire / volar plate)",
    "pt": "Fratura do rádio distal (gesso / fios de Kirschner / placa volar)"
  }$$::jsonb,
  $${
    "fr": [
      "fracture radius distal",
      "fracture poignet",
      "plaque palmaire radius",
      "brochage radius distal"
    ],
    "en": [
      "distal radius fracture",
      "wrist fracture",
      "volar plate distal radius"
    ],
    "pt": [
      "fratura do rádio distal",
      "fratura do punho",
      "placa volar do rádio"
    ]
  }$$::jsonb,
  $${
    "quick": {
      "fr": {
        "preop": [
          "Documenter peau, vascularisation, sensibilité et signes de compression du nerf médian dès la présentation.",
          "Radiographies de face et profil centrées sur le poignet ; TDM si fracture articulaire complexe ou doute sur le trait.",
          "Chez les patients non gériatriques, la chirurgie est plus souvent discutée si après réduction il persiste plus de 3 mm de raccourcissement radial, plus de 10 degrés de tilt dorsal, ou un step-off articulaire supérieur à 2 mm.",
          "Chez les patients de 65 ans et plus, un traitement non opératoire reste souvent valable sauf déformation importante ou atteinte neurologique.",
          "Si manipulation nécessaire, privilégier une anesthésie régionale et organiser un contrôle spécialisé dans les 72 heures."
        ],
        "intraop": [
          "Fracture stable : immobilisation bien moulée, poignet en position neutre, sans flexion palmaire forcée.",
          "Fracture dorsale réductible : brochage percutané envisageable si la congruence radiocarpienne est restaurée par réduction fermée.",
          "Fracture palmaire déplacée ou fracture irréductible : considérer ORIF par plaque palmaire.",
          "Si chirurgie indiquée, viser une prise en charge sous 72 heures pour les fractures intra-articulaires et sous une semaine pour les extra-articulaires.",
          "Les plaques palmaires donnent souvent une récupération fonctionnelle plus rapide à court terme, sans supériorité claire à long terme sur les autres fixations."
        ],
        "postop": [
          "Surélever le membre, mobiliser immédiatement les doigts et limiter l oedème.",
          "Fracture stable traitée orthopédiquement : mobiliser tôt depuis un support amovible dès que la douleur le permet.",
          "Un contrôle radiographique à 1 à 2 semaines n est utile que si la fracture est instable et que le résultat pourrait changer la stratégie.",
          "Rééducation de la main et du poignet si raideur, douleur persistante ou récupération lente.",
          "Profiter du parcours pour dépistage de fragilité osseuse et risque de chute chez le patient âgé."
        ],
        "red_flags": [
          "Paresthésies progressives, douleur volaire ou déficit pulpaire : suspecter syndrome du canal carpien aigu.",
          "Douleur croissante sous plâtre, doigts tendus ou perfusion altérée : rechercher syndrome compartimental ou plâtre compressif.",
          "Perte secondaire de réduction, surtout à la première semaine : réévaluer rapidement l indication opératoire.",
          "Douleur disproportionnée et raideur diffuse à distance : évoquer syndrome douloureux régional complexe."
        ],
        "drugs": [
          { "drug_id": "propofol", "indication_tag": "induction" },
          { "drug_id": "bupivacaine", "indication_tag": "BIS" },
          { "drug_id": "paracetamol", "indication_tag": "analgésie" },
          { "drug_id": "ketorolac", "indication_tag": "analgésie" },
          { "drug_id": "morphine", "indication_tag": "analgésie_secours" },
          { "drug_id": "ondansetron", "indication_tag": "PONV" },
          { "drug_id": "cefazoline", "indication_tag": "antibioprophylaxie" }
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Le fascicule St Pierre isole la fracture du radius distal comme intervention ambulatoire avec bloc axillaire, ce qui justifie une entrée dédiée plutôt qu un simple item générique main.",
          "Le fact sheet AAOS-ASSH 2020 soutient des seuils opératoires chez le patient non gériatrique après réduction, mais ne retrouve pas de bénéfice fonctionnel prolongé de la chirurgie systématique chez les patients gériatriques.",
          "Le BOASt 2017 insiste sur l anesthésie régionale pour les manipulations, la revue spécialisée sous 72 heures, la mobilisation précoce des fractures stables et des délais rapides quand une chirurgie est indiquée."
        ],
        "pitfalls": [
          "Traiter la radiographie plutôt que la fonction est une erreur fréquente chez le sujet âgé à faible demande.",
          "Un plâtre en flexion palmaire forcée augmente raideur et inconfort sans améliorer le résultat.",
          "Ignorer une compression médiane précoce peut transformer une fracture banale en séquelle neurologique évitable."
        ],
        "references": [
          {
            "source": "AAOS-ASSH — Management of Distal Radius Fractures",
            "year": 2020,
            "note": "Age-stratified operative thresholds, fixation technique equivalence long term, multimodal pain strategies."
          },
          {
            "source": "BOASt / BSSH — The Management of Distal Radial Fractures",
            "year": 2017,
            "note": "Regional anaesthesia for manipulation, fracture-clinic review in 72h, early mobilisation and operative timing standards."
          }
        ]
      }
    }
  }$$::jsonb,
  false
)
ON CONFLICT (id) DO UPDATE
SET
  specialty = EXCLUDED.specialty,
  titles = EXCLUDED.titles,
  synonyms = EXCLUDED.synonyms,
  content = EXCLUDED.content,
  updated_at = now();

COMMIT;
