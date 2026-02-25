
-- App role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS on user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- PROCEDURES
-- ============================================================
CREATE TABLE public.procedures (
  id text PRIMARY KEY,
  specialty text NOT NULL,
  titles jsonb NOT NULL,
  synonyms jsonb DEFAULT '{}',
  content jsonb NOT NULL,
  tags jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read procedures" ON public.procedures FOR SELECT USING (true);
CREATE POLICY "Admin write procedures" ON public.procedures FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update procedures" ON public.procedures FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete procedures" ON public.procedures FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_procedures_specialty ON public.procedures(specialty);

-- ============================================================
-- DRUGS
-- ============================================================
CREATE TABLE public.drugs (
  id text PRIMARY KEY,
  names jsonb NOT NULL,
  class text,
  dosing jsonb NOT NULL DEFAULT '{}',
  notes jsonb DEFAULT '{}',
  contraindications jsonb DEFAULT '[]',
  tags jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read drugs" ON public.drugs FOR SELECT USING (true);
CREATE POLICY "Admin write drugs" ON public.drugs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update drugs" ON public.drugs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete drugs" ON public.drugs FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- GUIDELINES
-- ============================================================
CREATE TABLE public.guidelines (
  id text PRIMARY KEY,
  category text NOT NULL,
  titles jsonb NOT NULL,
  items jsonb NOT NULL,
  refs jsonb DEFAULT '[]',
  tags jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.guidelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read guidelines" ON public.guidelines FOR SELECT USING (true);
CREATE POLICY "Admin write guidelines" ON public.guidelines FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update guidelines" ON public.guidelines FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete guidelines" ON public.guidelines FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_guidelines_category ON public.guidelines(category);

-- ============================================================
-- PROTOCOLES
-- ============================================================
CREATE TABLE public.protocoles (
  id text PRIMARY KEY,
  category text NOT NULL,
  titles jsonb NOT NULL,
  steps jsonb NOT NULL,
  refs jsonb DEFAULT '[]',
  tags jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.protocoles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read protocoles" ON public.protocoles FOR SELECT USING (true);
CREATE POLICY "Admin write protocoles" ON public.protocoles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update protocoles" ON public.protocoles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete protocoles" ON public.protocoles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_protocoles_category ON public.protocoles(category);

-- ============================================================
-- ALR BLOCKS
-- ============================================================
CREATE TABLE public.alr_blocks (
  id text PRIMARY KEY,
  region text NOT NULL,
  titles jsonb NOT NULL,
  indications jsonb DEFAULT '{}',
  contraindications jsonb DEFAULT '{}',
  technique jsonb DEFAULT '{}',
  drugs jsonb DEFAULT '{}',
  tags jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.alr_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read alr_blocks" ON public.alr_blocks FOR SELECT USING (true);
CREATE POLICY "Admin write alr_blocks" ON public.alr_blocks FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update alr_blocks" ON public.alr_blocks FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete alr_blocks" ON public.alr_blocks FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_alr_blocks_region ON public.alr_blocks(region);

-- ============================================================
-- Updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_procedures_updated_at BEFORE UPDATE ON public.procedures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_drugs_updated_at BEFORE UPDATE ON public.drugs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guidelines_updated_at BEFORE UPDATE ON public.guidelines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_protocoles_updated_at BEFORE UPDATE ON public.protocoles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_alr_blocks_updated_at BEFORE UPDATE ON public.alr_blocks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
