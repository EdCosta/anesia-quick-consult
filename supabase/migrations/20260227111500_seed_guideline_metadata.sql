UPDATE public.guidelines
SET
  tags = CASE id
    WHEN 'airway-management' THEN '["airway","intubation","difficult-airway","cico","video-laryngoscope"]'::jsonb
    WHEN 'hemodynamic-monitoring' THEN '["hemodynamics","monitoring","arterial-line","goal-directed-therapy"]'::jsonb
    WHEN 'temperature-management' THEN '["temperature","hypothermia","warming"]'::jsonb
    WHEN 'pain-multimodal' THEN '["analgesia","multimodal","opioid-sparing","regional"]'::jsonb
    WHEN 'ponv-prevention' THEN '["ponv","nvpo","antiemesis","apfel"]'::jsonb
    WHEN 'fluid-management' THEN '["fluids","hemodynamics","goal-directed-therapy","transfusion"]'::jsonb
    WHEN 'preop-fasting' THEN '["fasting","aspiration","rsi","safety"]'::jsonb
    WHEN 'blood-products' THEN '["transfusion","bleeding","coagulation","massive-transfusion"]'::jsonb
    WHEN 'neuromuscular-blockade' THEN '["airway","nmb","reversal","sugammadex"]'::jsonb
    WHEN 'antibiotic-prophylaxis' THEN '["antibioprophylaxis","infection","safety"]'::jsonb
    WHEN 'thromboprophylaxis' THEN '["thrombosis","anticoag","vte","prophylaxis"]'::jsonb
    WHEN 'rapid-sequence-induction' THEN '["airway","rsi","aspiration","full-stomach"]'::jsonb
    ELSE tags
  END,
  specialties = CASE id
    WHEN 'airway-management' THEN '["chirurgie-generale","orthopedie","urologie","gynecologie","orl","neurochirurgie","obstetrique"]'::jsonb
    WHEN 'hemodynamic-monitoring' THEN '["chirurgie-generale","orthopedie","urologie","gynecologie","orl","neurochirurgie","obstetrique"]'::jsonb
    WHEN 'temperature-management' THEN '["chirurgie-generale","orthopedie","urologie","gynecologie","orl","neurochirurgie","obstetrique"]'::jsonb
    WHEN 'pain-multimodal' THEN '["chirurgie-generale","orthopedie","urologie","gynecologie","orl","neurochirurgie","obstetrique"]'::jsonb
    WHEN 'ponv-prevention' THEN '["chirurgie-generale","orthopedie","urologie","gynecologie","orl","neurochirurgie","obstetrique"]'::jsonb
    WHEN 'fluid-management' THEN '["chirurgie-generale","orthopedie","urologie","gynecologie","neurochirurgie","obstetrique"]'::jsonb
    WHEN 'preop-fasting' THEN '["chirurgie-generale","orthopedie","urologie","gynecologie","orl","neurochirurgie","obstetrique"]'::jsonb
    WHEN 'blood-products' THEN '["chirurgie-generale","orthopedie","urologie","gynecologie","neurochirurgie","obstetrique"]'::jsonb
    WHEN 'neuromuscular-blockade' THEN '["chirurgie-generale","orthopedie","urologie","gynecologie","orl","neurochirurgie","obstetrique"]'::jsonb
    WHEN 'antibiotic-prophylaxis' THEN '["chirurgie-generale","orthopedie","urologie","gynecologie","orl","neurochirurgie","obstetrique"]'::jsonb
    WHEN 'thromboprophylaxis' THEN '["chirurgie-generale","orthopedie","urologie","gynecologie","obstetrique"]'::jsonb
    WHEN 'rapid-sequence-induction' THEN '["chirurgie-generale","urologie","gynecologie","orl","obstetrique"]'::jsonb
    ELSE specialties
  END,
  organization = CASE id
    WHEN 'airway-management' THEN 'DAS/ASA'
    WHEN 'hemodynamic-monitoring' THEN 'ESAIC/ASA'
    WHEN 'temperature-management' THEN 'NICE'
    WHEN 'pain-multimodal' THEN 'SFAR/PROSPECT'
    WHEN 'ponv-prevention' THEN 'Consensus/SFAR'
    WHEN 'fluid-management' THEN 'SFAR'
    WHEN 'preop-fasting' THEN 'ESAIC/ASA'
    WHEN 'blood-products' THEN 'ESAIC/SFAR'
    WHEN 'neuromuscular-blockade' THEN 'ESAIC/SFAR'
    WHEN 'antibiotic-prophylaxis' THEN 'WHO/SFAR'
    WHEN 'thromboprophylaxis' THEN 'ACCP/SFAR'
    WHEN 'rapid-sequence-induction' THEN 'SFAR/ASA'
    ELSE organization
  END,
  recommendation_strength = CASE id
    WHEN 'airway-management' THEN 5
    WHEN 'hemodynamic-monitoring' THEN 4
    WHEN 'temperature-management' THEN 4
    WHEN 'pain-multimodal' THEN 5
    WHEN 'ponv-prevention' THEN 5
    WHEN 'fluid-management' THEN 4
    WHEN 'preop-fasting' THEN 5
    WHEN 'blood-products' THEN 4
    WHEN 'neuromuscular-blockade' THEN 5
    WHEN 'antibiotic-prophylaxis' THEN 4
    WHEN 'thromboprophylaxis' THEN 4
    WHEN 'rapid-sequence-induction' THEN 5
    ELSE recommendation_strength
  END
WHERE id IN (
  'airway-management',
  'hemodynamic-monitoring',
  'temperature-management',
  'pain-multimodal',
  'ponv-prevention',
  'fluid-management',
  'preop-fasting',
  'blood-products',
  'neuromuscular-blockade',
  'antibiotic-prophylaxis',
  'thromboprophylaxis',
  'rapid-sequence-induction'
);
