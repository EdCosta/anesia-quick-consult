
-- Fix: move expiry check from client-side to RLS policy
-- Previously, expires_at was only validated in the frontend hook,
-- allowing direct API access to bypass the expiry check.

DROP POLICY "Users read own entitlement" ON public.user_entitlements;

CREATE POLICY "Users read own entitlement" ON public.user_entitlements
  FOR SELECT USING (
    auth.uid() = user_id
    AND active = true
    AND (expires_at IS NULL OR expires_at > now())
  );
