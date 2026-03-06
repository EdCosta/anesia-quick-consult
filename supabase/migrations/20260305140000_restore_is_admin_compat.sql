CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _roles_table_exists boolean;
  _is_admin boolean := false;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'user_roles'
  )
  INTO _roles_table_exists;

  IF NOT _roles_table_exists OR _user_id IS NULL THEN
    RETURN false;
  END IF;

  EXECUTE
    'SELECT EXISTS (
       SELECT 1
       FROM public.user_roles
       WHERE user_id = $1
         AND role::text = ''admin''
     )'
  INTO _is_admin
  USING _user_id;

  RETURN COALESCE(_is_admin, false);
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin(auth.uid());
$$;
