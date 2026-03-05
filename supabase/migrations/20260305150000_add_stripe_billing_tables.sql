CREATE TABLE IF NOT EXISTS public.billing_customers (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text NOT NULL UNIQUE,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.billing_customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS billing_customers_select_self ON public.billing_customers;
DROP POLICY IF EXISTS billing_customers_manage_admin ON public.billing_customers;

CREATE POLICY billing_customers_select_self
  ON public.billing_customers
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY billing_customers_manage_admin
  ON public.billing_customers
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS update_billing_customers_updated_at ON public.billing_customers;
CREATE TRIGGER update_billing_customers_updated_at
  BEFORE UPDATE ON public.billing_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
  stripe_subscription_id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text NOT NULL,
  status text NOT NULL,
  price_id text,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  current_period_end timestamptz,
  canceled_at timestamptz,
  raw_event jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_user_id
  ON public.billing_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_customer_id
  ON public.billing_subscriptions(stripe_customer_id);

ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS billing_subscriptions_select_self ON public.billing_subscriptions;
DROP POLICY IF EXISTS billing_subscriptions_manage_admin ON public.billing_subscriptions;

CREATE POLICY billing_subscriptions_select_self
  ON public.billing_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY billing_subscriptions_manage_admin
  ON public.billing_subscriptions
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS update_billing_subscriptions_updated_at ON public.billing_subscriptions;
CREATE TRIGGER update_billing_subscriptions_updated_at
  BEFORE UPDATE ON public.billing_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
