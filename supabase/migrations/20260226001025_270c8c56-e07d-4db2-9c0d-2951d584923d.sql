
-- Create specialties table
CREATE TABLE public.specialties (
  id text PRIMARY KEY,
  name jsonb NOT NULL DEFAULT '{}',
  synonyms jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  sort_base integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read specialties" ON public.specialties
  FOR SELECT USING (true);

CREATE POLICY "Admin write specialties" ON public.specialties
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin update specialties" ON public.specialties
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin delete specialties" ON public.specialties
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_specialties_updated_at
  BEFORE UPDATE ON public.specialties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial specialties
INSERT INTO public.specialties (id, name, sort_base) VALUES
  ('chirurgie-generale', '{"fr":"Chirurgie générale","en":"General Surgery","pt":"Cirurgia Geral"}', 1),
  ('orthopedie', '{"fr":"Orthopédie","en":"Orthopedics","pt":"Ortopedia"}', 2),
  ('urologie', '{"fr":"Urologie","en":"Urology","pt":"Urologia"}', 3),
  ('gynecologie', '{"fr":"Gynécologie","en":"Gynecology","pt":"Ginecologia"}', 4),
  ('orl', '{"fr":"ORL","en":"ENT","pt":"ORL"}', 5),
  ('neurochirurgie', '{"fr":"Neurochirurgie","en":"Neurosurgery","pt":"Neurocirurgia"}', 6),
  ('obstetrique', '{"fr":"Obstétrique","en":"Obstetrics","pt":"Obstetrícia"}', 7);
