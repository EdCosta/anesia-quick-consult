CREATE TABLE IF NOT EXISTS public.pro_upgrade_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method text NOT NULL CHECK (method IN ('stripe', 'sepa_transfer', 'invoice')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected', 'canceled')),
  requested_plan text NOT NULL DEFAULT 'pro' CHECK (requested_plan = 'pro'),
  contact_email text,
  notes text,
  amount_cents integer,
  currency text NOT NULL DEFAULT 'eur',
  stripe_checkout_session_id text,
  stripe_subscription_id text,
  external_payment_reference text,
  admin_comment text,
  approved_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pro_upgrade_requests_user_id
  ON public.pro_upgrade_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_pro_upgrade_requests_status
  ON public.pro_upgrade_requests(status);

ALTER TABLE public.pro_upgrade_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pro_upgrade_requests_select_self ON public.pro_upgrade_requests;
DROP POLICY IF EXISTS pro_upgrade_requests_insert_self ON public.pro_upgrade_requests;
DROP POLICY IF EXISTS pro_upgrade_requests_update_self ON public.pro_upgrade_requests;
DROP POLICY IF EXISTS pro_upgrade_requests_manage_admin ON public.pro_upgrade_requests;

CREATE POLICY pro_upgrade_requests_select_self
  ON public.pro_upgrade_requests
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY pro_upgrade_requests_insert_self
  ON public.pro_upgrade_requests
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND requested_plan = 'pro'
  );

CREATE POLICY pro_upgrade_requests_update_self
  ON public.pro_upgrade_requests
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND status IN ('pending', 'canceled')
  );

CREATE POLICY pro_upgrade_requests_manage_admin
  ON public.pro_upgrade_requests
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS update_pro_upgrade_requests_updated_at ON public.pro_upgrade_requests;
CREATE TRIGGER update_pro_upgrade_requests_updated_at
  BEFORE UPDATE ON public.pro_upgrade_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.apply_pro_upgrade_request_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP <> 'UPDATE' THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('approved', 'paid') THEN
    INSERT INTO public.user_entitlements (user_id, plan_id, active, expires_at)
    VALUES (NEW.user_id, 'pro', true, NEW.approved_expires_at)
    ON CONFLICT (user_id) DO UPDATE
      SET plan_id = 'pro',
          active = true,
          expires_at = EXCLUDED.expires_at;

    INSERT INTO public.user_profiles (user_id, plan)
    VALUES (NEW.user_id, 'pro')
    ON CONFLICT (user_id) DO UPDATE
      SET plan = 'pro';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pro_upgrade_requests_apply_approval ON public.pro_upgrade_requests;
CREATE TRIGGER pro_upgrade_requests_apply_approval
  AFTER UPDATE ON public.pro_upgrade_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_pro_upgrade_request_approval();
