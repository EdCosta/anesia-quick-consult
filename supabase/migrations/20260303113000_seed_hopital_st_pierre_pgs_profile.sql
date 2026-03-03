BEGIN;

INSERT INTO public.hospital_profiles (
  id,
  name,
  settings,
  country,
  default_lang,
  formulary,
  protocol_overrides
)
VALUES (
  'hopital_st_pierre_pgs_2025_2026',
  'Hôpital St Pierre - PGs 2025-2026',
  jsonb_build_object(
    'source_document', jsonb_build_object(
      'title', 'FASCICULE DE PROTOCOLES PGs 2025-2026 11225.pdf',
      'edition', '2025-2026',
      'page_count', 174
    ),
    'source_type', 'institutional_handbook'
  ),
  'BE',
  'fr',
  '{
    "drug_ids": [
      "paracetamol",
      "propofol",
      "rocuronium",
      "sugammadex",
      "bupivacaine",
      "cefazoline",
      "acide_tranexamique",
      "enoxaparine"
    ],
    "presentations": [
      { "drug_id": "paracetamol", "label": "Paracétamol IV 1g/100mL (10mg/mL)" },
      { "drug_id": "propofol", "label": "Propofol 1% 500mg/50mL" },
      { "drug_id": "rocuronium", "label": "Rocuronium 100mg/10mL (10mg/mL)" },
      { "drug_id": "sugammadex", "label": "Sugammadex 500mg/5mL (100mg/mL)" },
      { "drug_id": "bupivacaine", "label": "Bupivacaïne hyperbare 0,5% 15mg/3mL" },
      { "drug_id": "cefazoline", "label": "Céfazoline 2g poudre lyoph." },
      { "drug_id": "acide_tranexamique", "label": "Acide tranexamique 1g/10mL (100mg/mL)" },
      { "drug_id": "enoxaparine", "label": "Énoxaparine 40mg/0,4mL (100mg/mL)" }
    ]
  }'::jsonb,
  '{
    "source_document": {
      "title": "FASCICULE DE PROTOCOLES PGs 2025-2026 11225.pdf",
      "edition": "2025-2026",
      "service": "Service d''anesthésie",
      "page_count": 174
    },
    "priority_protocol_domains": [
      "orthopedie",
      "obstetrique",
      "pediatrie",
      "transfusion"
    ],
    "sections": [
      { "key": "secteur_1", "label": "Cardiaque / thoracique / vasculaire / ophtalmologie / plastique", "page_start": 5 },
      { "key": "secteur_2", "label": "Obstétrique et salle d''accouchement", "page_start": 42 },
      { "key": "secteur_3", "label": "Pédiatrie, ORL, stomatologie / maxillo-facial", "page_start": 93 },
      { "key": "secteur_4", "label": "Orthopédie, neurochirurgie, endoscopie", "page_start": 144 }
    ],
    "orthopedie_defaults": {
      "source_pages": [149, 150],
      "antibioprophylaxie": {
        "drug_id": "cefazoline",
        "default_dose_label": "2 g IV avant incision",
        "repeat_patterns": [
          "H+8",
          "H+16"
        ]
      },
      "thromboprophylaxie": {
        "drug_id": "enoxaparine",
        "default_timing": "H+6 postop pour la plupart des chirurgies orthopédiques",
        "exceptions": [
          "chirurgie avant-pied: le lendemain"
        ]
      },
      "antifibrinolytique": {
        "drug_id": "acide_tranexamique",
        "local_alias": "Exacyl",
        "usage_note": "utilisé dans plusieurs protocoles orthopédiques sélectionnés"
      },
      "regional_patterns": [
        "bloc PENG / iliofascial pour hanche",
        "bloc fémoral ou canal des adducteurs pour genou",
        "bloc poplité faible dose si risque de syndrome des loges",
        "bloc interscalénique pour épaule"
      ],
      "disposition_labels": [
        "Hospit",
        "One day",
        "Hospit gériatrie"
      ]
    }
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  settings = EXCLUDED.settings,
  country = EXCLUDED.country,
  default_lang = EXCLUDED.default_lang,
  formulary = EXCLUDED.formulary,
  protocol_overrides = EXCLUDED.protocol_overrides,
  updated_at = now();

INSERT INTO public.hospital_drug_availability (
  hospital_id,
  drug_id,
  is_available,
  preferred_presentation_id,
  local_note
)
VALUES
  (
    'hopital_st_pierre_pgs_2025_2026',
    'paracetamol',
    true,
    (
      SELECT id FROM public.drug_presentations
      WHERE drug_id = 'paracetamol' AND label = 'Paracétamol IV 1g/100mL (10mg/mL)'
      LIMIT 1
    ),
    'Starter formulary derived from recurrent mentions in the 2025-2026 fascicle.'
  ),
  (
    'hopital_st_pierre_pgs_2025_2026',
    'propofol',
    true,
    (
      SELECT id FROM public.drug_presentations
      WHERE drug_id = 'propofol' AND label = 'Propofol 1% 500mg/50mL'
      LIMIT 1
    ),
    'Common induction agent across service protocols.'
  ),
  (
    'hopital_st_pierre_pgs_2025_2026',
    'rocuronium',
    true,
    (
      SELECT id FROM public.drug_presentations
      WHERE drug_id = 'rocuronium' AND label = 'Rocuronium 100mg/10mL (10mg/mL)'
      LIMIT 1
    ),
    'Starter formulary entry for standard airway management.'
  ),
  (
    'hopital_st_pierre_pgs_2025_2026',
    'sugammadex',
    true,
    (
      SELECT id FROM public.drug_presentations
      WHERE drug_id = 'sugammadex' AND label = 'Sugammadex 500mg/5mL (100mg/mL)'
      LIMIT 1
    ),
    'Starter formulary entry for neuromuscular reversal.'
  ),
  (
    'hopital_st_pierre_pgs_2025_2026',
    'bupivacaine',
    true,
    (
      SELECT id FROM public.drug_presentations
      WHERE drug_id = 'bupivacaine' AND label = 'Bupivacaïne hyperbare 0,5% 15mg/3mL'
      LIMIT 1
    ),
    'Used across neuraxial and peripheral blocks described in the fascicle.'
  ),
  (
    'hopital_st_pierre_pgs_2025_2026',
    'cefazoline',
    true,
    (
      SELECT id FROM public.drug_presentations
      WHERE drug_id = 'cefazoline' AND label = 'Céfazoline 2g poudre lyoph.'
      LIMIT 1
    ),
    'Orthopedics tables repeatedly specify cefazoline 2 g before incision.'
  ),
  (
    'hopital_st_pierre_pgs_2025_2026',
    'acide_tranexamique',
    true,
    (
      SELECT id FROM public.drug_presentations
      WHERE drug_id = 'acide_tranexamique' AND label = 'Acide tranexamique 1g/10mL (100mg/mL)'
      LIMIT 1
    ),
    'Referenced as Exacyl in multiple orthopedic pathways.'
  ),
  (
    'hopital_st_pierre_pgs_2025_2026',
    'enoxaparine',
    true,
    (
      SELECT id FROM public.drug_presentations
      WHERE drug_id = 'enoxaparine' AND label = 'Énoxaparine 40mg/0,4mL (100mg/mL)'
      LIMIT 1
    ),
    'HBPM H+6 appears as the recurring postoperative thromboprophylaxis default.'
  )
ON CONFLICT (hospital_id, drug_id) DO UPDATE
SET
  is_available = EXCLUDED.is_available,
  preferred_presentation_id = EXCLUDED.preferred_presentation_id,
  local_note = EXCLUDED.local_note,
  updated_at = now();

COMMIT;
