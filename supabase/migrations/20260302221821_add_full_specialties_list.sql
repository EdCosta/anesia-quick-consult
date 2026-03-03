INSERT INTO public.specialties (id, name, sort_base, is_active) VALUES
  ('chirurgie-cardiaque',          '{"fr":"Chirurgie cardiaque","en":"Cardiac surgery","pt":"Cirurgia cardíaca"}'::jsonb,          8,  true),
  ('chirurgie-thoracique',         '{"fr":"Chirurgie thoracique","en":"Thoracic surgery","pt":"Cirurgia torácica"}'::jsonb,         9,  true),
  ('chirurgie-vasculaire',         '{"fr":"Chirurgie vasculaire","en":"Vascular surgery","pt":"Cirurgia vascular"}'::jsonb,         10, true),
  ('ophtalmologie',                '{"fr":"Ophtalmologie","en":"Ophthalmology","pt":"Oftalmologia"}'::jsonb,                        11, true),
  ('chirurgie-pediatrique',        '{"fr":"Chirurgie pédiatrique","en":"Paediatric surgery","pt":"Cirurgia pediátrica"}'::jsonb,    12, true),
  ('chirurgie-plastique',          '{"fr":"Chirurgie plastique","en":"Plastic surgery","pt":"Cirurgia plástica"}'::jsonb,           13, true),
  ('chirurgie-maxillo-faciale',    '{"fr":"Chirurgie maxillo-faciale","en":"Maxillofacial surgery","pt":"Cirurgia maxilofacial"}'::jsonb, 14, true),
  ('gastroenterologie',            '{"fr":"Gastroentérologie","en":"Gastroenterology","pt":"Gastroenterologia"}'::jsonb,            15, true),
  ('radiologie-interventionnelle', '{"fr":"Radiologie interventionnelle","en":"Interventional radiology","pt":"Radiologia de intervenção"}'::jsonb, 16, true),
  ('reanimation',                  '{"fr":"Réanimation / USI","en":"Critical care / ICU","pt":"Cuidados intensivos"}'::jsonb,       17, true),
  ('cardiologie-interventionnelle','{"fr":"Cardiologie interventionnelle","en":"Interventional cardiology","pt":"Cardiologia de intervenção"}'::jsonb, 18, true),
  ('chirurgie-main',               '{"fr":"Chirurgie de la main","en":"Hand surgery","pt":"Cirurgia da mão"}'::jsonb,              19, true)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, sort_base=EXCLUDED.sort_base, is_active=true;;
