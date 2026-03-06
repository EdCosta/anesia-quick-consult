DROP POLICY IF EXISTS analytics_events_select_admin ON public.analytics_events;

CREATE POLICY analytics_events_select_admin
ON public.analytics_events
FOR SELECT
TO authenticated
USING (public.is_admin());
