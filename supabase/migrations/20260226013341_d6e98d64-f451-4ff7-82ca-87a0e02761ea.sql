
-- Plans table
CREATE TABLE public.plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  features jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read plans" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Admin write plans" ON public.plans FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update plans" ON public.plans FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete plans" ON public.plans FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Seed plans
INSERT INTO public.plans (id, name, features) VALUES
  ('free', 'Free', '{"max_procedures": 10, "scores": false, "advanced_dose": false}'::jsonb),
  ('pro', 'Pro', '{"max_procedures": -1, "scores": true, "advanced_dose": true}'::jsonb);

-- User entitlements table
CREATE TABLE public.user_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES public.plans(id) DEFAULT 'free',
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own entitlement" ON public.user_entitlements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin manage entitlements" ON public.user_entitlements FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Add is_pro to procedures
ALTER TABLE public.procedures ADD COLUMN IF NOT EXISTS is_pro boolean NOT NULL DEFAULT false;

-- Triggers for updated_at
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_entitlements_updated_at BEFORE UPDATE ON public.user_entitlements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
