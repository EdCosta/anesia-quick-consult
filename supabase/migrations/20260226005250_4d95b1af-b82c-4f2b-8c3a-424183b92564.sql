-- Import logs table for CSV import audit trail
CREATE TABLE public.import_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  total integer NOT NULL DEFAULT 0,
  success integer NOT NULL DEFAULT 0,
  failed integer NOT NULL DEFAULT 0,
  errors jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage import_logs"
  ON public.import_logs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert import_logs"
  ON public.import_logs FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Hospital profiles table
CREATE TABLE public.hospital_profiles (
  id text PRIMARY KEY,
  name text NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hospital_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read hospital_profiles"
  ON public.hospital_profiles FOR SELECT
  USING (true);

CREATE POLICY "Admin write hospital_profiles"
  ON public.hospital_profiles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin update hospital_profiles"
  ON public.hospital_profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin delete hospital_profiles"
  ON public.hospital_profiles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_hospital_profiles_updated_at
  BEFORE UPDATE ON public.hospital_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();