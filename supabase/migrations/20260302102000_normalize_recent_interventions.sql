BEGIN;

-- Add missing specialty catalog entries used by recent procedure seeds.
INSERT INTO public.specialties (id, name, sort_base)
VALUES
  (
    'gastroenterologie',
    '{"fr":"Gastroentérologie","en":"Gastroenterology","pt":"Gastroenterologia"}'::jsonb,
    8
  ),
  (
    'chirurgie-thoracique',
    '{"fr":"Chirurgie thoracique","en":"Thoracic Surgery","pt":"Cirurgia Torácica"}'::jsonb,
    9
  )
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  sort_base = EXCLUDED.sort_base,
  updated_at = now();

-- Normalize specialty metadata for recent interventions so filters,
-- display labels, and recommendation matching stay consistent.
UPDATE public.procedures AS p
SET
  specialty = v.specialty,
  specialties = v.specialties,
  tags = v.tags,
  updated_at = now()
FROM (
  VALUES
    (
      'fracture_hanche_hemiarthroplastie',
      'orthopedie',
      '["orthopedie"]'::jsonb,
      '["orthopedie","geriatrique","tev"]'::jsonb
    ),
    (
      'amygdalectomie_adulte',
      'orl',
      '["orl"]'::jsonb,
      '["orl","ponv","airway"]'::jsonb
    ),
    (
      'endoscopie_digestive_sedation',
      'gastroenterologie',
      '["gastroenterologie"]'::jsonb,
      '["sedation","airway","gastro"]'::jsonb
    ),
    (
      'toracoscopie_vats',
      'chirurgie-thoracique',
      '["chirurgie-thoracique"]'::jsonb,
      '["thorax","airway","respiratoire"]'::jsonb
    ),
    (
      'arthroplastie_epaule',
      'orthopedie',
      '["orthopedie"]'::jsonb,
      '["orthopedie","alr","beach-chair"]'::jsonb
    ),
    (
      'fracture_femur_diaphysaire',
      'orthopedie',
      '["orthopedie"]'::jsonb,
      '["orthopedie","trauma","tev"]'::jsonb
    ),
    (
      'arthrodese_lombaire',
      'neurochirurgie',
      '["neurochirurgie"]'::jsonb,
      '["neurochirurgie","rachis","hemorragie"]'::jsonb
    ),
    (
      'chirurgie_pied_cheville',
      'orthopedie',
      '["orthopedie"]'::jsonb,
      '["orthopedie","ambulatoire","alr"]'::jsonb
    ),
    (
      'amputation_membre',
      'orthopedie',
      '["orthopedie"]'::jsonb,
      '["orthopedie","vasculaire","douleur"]'::jsonb
    ),
    (
      'fracture_humerus_proximal',
      'orthopedie',
      '["orthopedie"]'::jsonb,
      '["orthopedie","trauma","beach-chair"]'::jsonb
    )
) AS v (id, specialty, specialties, tags)
WHERE p.id = v.id;

COMMIT;
