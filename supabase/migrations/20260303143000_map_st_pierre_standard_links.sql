BEGIN;

UPDATE public.hospital_profiles
SET
  protocol_overrides = COALESCE(protocol_overrides, '{}'::jsonb) || '{
    "procedure_ids": [
      "arthroplastie_epaule",
      "fracture_femur_diaphysaire",
      "fracture_humerus_proximal",
      "chirurgie_pied_cheville",
      "fracture_hanche_hemiarthroplastie",
      "arthroplastie_pth_ptg",
      "fracture_radius_distal"
    ],
    "procedure_aliases": {
      "fracture_col_femoral_deplacee_arthroplastie": "fracture_hanche_hemiarthroplastie",
      "prothese_totale_genou": "arthroplastie_pth_ptg"
    },
    "procedure_contexts": {
      "arthroplastie_epaule": {
        "title": {
          "fr": "Repere local PGs 2025-2026"
        },
        "summary": {
          "fr": [
            "Le fascicule St Pierre garde le bloc interscalenique comme reference pour l analgesie de l epaule.",
            "En position beach chair, le protocole local insiste sur une pression arterielle corrigee au niveau cerebral.",
            "La table orthopedique locale garde la cefazoline 2 g IV avant incision comme standard."
          ]
        },
        "source_pages": [149],
        "linked_procedure_ids": ["arthroplastie_epaule"]
      },
      "fracture_femur_diaphysaire": {
        "title": {
          "fr": "Repere local PGs 2025-2026"
        },
        "summary": {
          "fr": [
            "Au St Pierre, cette voie correspond a l enclouage centromedullaire avec bloc femoral ou fascia iliaca en preop si possible.",
            "Le fascicule met l accent sur le risque de saignement cache et l anticipation transfusionnelle des l admission.",
            "HBPM et mobilisation precoce sont attendues des que l hemostase le permet."
          ]
        },
        "source_pages": [149],
        "linked_procedure_ids": ["fracture_femur_diaphysaire"]
      },
      "fracture_humerus_proximal": {
        "title": {
          "fr": "Repere local PGs 2025-2026"
        },
        "summary": {
          "fr": [
            "Le fascicule local traite cette fracture dans la meme logique que l epaule prothetique: bloc interscalenique et surveillance beach chair.",
            "Le choix ORIF versus prothese est note comme dependant de la comminution, de l age et de la fragilite.",
            "La cefazoline pre-incision reste le standard du tableau orthopedique local."
          ]
        },
        "source_pages": [149],
        "linked_procedure_ids": ["fracture_humerus_proximal"]
      },
      "chirurgie_pied_cheville": {
        "title": {
          "fr": "Repere local PGs 2025-2026"
        },
        "summary": {
          "fr": [
            "Le parcours St Pierre privilegie bloc poplite + saphene pour l ambulatoire du pied et de la cheville.",
            "Le fascicule garde la cefazoline 2 g IV avant garrot comme prophylaxie standard.",
            "Pour l avant-pied, la thromboprophylaxie locale peut etre repoussee au lendemain plutot qu a H+6."
          ]
        },
        "source_pages": [150],
        "linked_procedure_ids": ["chirurgie_pied_cheville"]
      },
      "fracture_hanche_hemiarthroplastie": {
        "title": {
          "fr": "Correspondance locale: fracture intracapsulaire deplacee"
        },
        "summary": {
          "fr": [
            "Au St Pierre, cette fiche standard couvre surtout la fracture intracapsulaire deplacee du col femoral.",
            "Le fascicule oppose PTH versus hemiarthroplastie selon autonomie pre-fracture, cognition et fragilite globale.",
            "Le bloc PENG ou fascia iliaca est repris en preop, avec enoxaparine a partir de H+6 si l hemostase est satisfaisante."
          ]
        },
        "source_pages": [149],
        "linked_procedure_ids": [
          "fracture_hanche_hemiarthroplastie",
          "fracture_col_femoral_deplacee_arthroplastie"
        ]
      },
      "arthroplastie_pth_ptg": {
        "title": {
          "fr": "Correspondance locale: PTG / arthroplastie ortho"
        },
        "summary": {
          "fr": [
            "Dans le fascicule St Pierre, cette fiche standard sert de tronc commun et couvre ici surtout la declinaison PTG.",
            "Le tableau local privilegie bloc femoral ou canal des adducteurs selon l objectif de mobilisation postoperatoire.",
            "Cefazoline 2 g avant incision, acide tranexamique frequent et enoxaparine a H+6 sont les reperes recurents du service."
          ]
        },
        "source_pages": [149, 150],
        "linked_procedure_ids": [
          "arthroplastie_pth_ptg",
          "prothese_totale_genou"
        ]
      },
      "fracture_radius_distal": {
        "title": {
          "fr": "Repere local PGs 2025-2026"
        },
        "summary": {
          "fr": [
            "Le fascicule la presente comme une trajectoire ambulatoire, avec sortie rapide si controle de la douleur et examen neurovasculaire correct.",
            "Le bloc axillaire est la technique regionale privilegiee quand l ALR est retenue.",
            "La feuille locale insiste sur des consignes de retour et de surveillance de l oedeme ou de la douleur disproportionnee."
          ]
        },
        "source_pages": [150],
        "linked_procedure_ids": ["fracture_radius_distal"]
      }
    }
  }'::jsonb,
  updated_at = now()
WHERE id = 'hopital_st_pierre_pgs_2025_2026';

COMMIT;
