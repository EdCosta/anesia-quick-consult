BEGIN;

-- Emergency isolation:
-- remove every custom trigger from auth.users and replace it with a no-op trigger.
-- If signup still fails after this is applied remotely, the cause is not public.handle_new_user.
DO $$
DECLARE
  trigger_row record;
BEGIN
  FOR trigger_row IN
    SELECT tgname
    FROM pg_trigger
    WHERE tgrelid = 'auth.users'::regclass
      AND NOT tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users', trigger_row.tgname);
  END LOOP;
END
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMIT;
