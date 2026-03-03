BEGIN;

-- Generic anesthesia workflows should not be anchored to a surgical specialty.
INSERT INTO public.specialties (id, name, sort_base)
VALUES (
  'anesthesie',
  '{"fr":"Anesthésie","en":"Anesthesia","pt":"Anestesia"}'::jsonb,
  10
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  sort_base = EXCLUDED.sort_base,
  updated_at = now();

UPDATE public.procedures AS p
SET
  specialty = v.specialty,
  specialties = v.specialties,
  tags = COALESCE(p.tags, '[]'::jsonb) || v.extra_tags,
  updated_at = now()
FROM (
  VALUES
    (
      'induction_sequence_rapide',
      'anesthesie',
      '["anesthesie","chirurgie-generale","orl","obstetrique","gynecologie"]'::jsonb,
      '["airway","aspiration","anesthesie"]'::jsonb
    ),
    (
      'prevention_nvpo',
      'anesthesie',
      '["anesthesie","chirurgie-generale","gynecologie","obstetrique","orl","orthopedie"]'::jsonb,
      '["ponv","anesthesie"]'::jsonb
    ),
    (
      'analgesie_multimodale',
      'anesthesie',
      '["anesthesie","chirurgie-generale","orthopedie","gynecologie","neurochirurgie","urologie"]'::jsonb,
      '["douleur","anesthesie"]'::jsonb
    ),
    (
      'choc_anaphylactique_perop',
      'anesthesie',
      '["anesthesie","chirurgie-generale","orthopedie","gynecologie","neurochirurgie","urologie","orl","obstetrique"]'::jsonb,
      '["urgence","anesthesie"]'::jsonb
    ),
    (
      'rachianesthesie',
      'anesthesie',
      '["anesthesie","orthopedie","gynecologie","urologie","obstetrique"]'::jsonb,
      '["neuraxial","anesthesie"]'::jsonb
    )
) AS v (id, specialty, specialties, extra_tags)
WHERE p.id = v.id;

COMMIT;
