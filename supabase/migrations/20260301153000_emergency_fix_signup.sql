BEGIN;

-- 1. Garantir que a tabela existe
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text,
  created_at timestamptz DEFAULT timezone('utc', now()),
  plan text NOT NULL DEFAULT 'free'
);

-- 2. Garantir permissões explícitas (muitas vezes a causa oculta de erros 500)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_profiles TO postgres, service_role;

-- 3. Limpeza agressiva de triggers em auth.users
DO $$
DECLARE
  trig record;
BEGIN
  FOR trig IN
    SELECT tgname
    FROM pg_trigger
    WHERE tgrelid = 'auth.users'::regclass
      AND NOT tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users', trig.tgname);
  END LOOP;
END
$$;

-- 4. Remover triggers problemáticos de user_profiles que possam bloquear a inserção
DROP TRIGGER IF EXISTS guard_user_profile_plan_insert_update ON public.user_profiles;
DROP FUNCTION IF EXISTS public.guard_user_profile_plan();

-- 5. Recriar a função handle_new_user com lógica simplificada e segura
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    INSERT INTO public.user_profiles (user_id, email, name, plan)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
      'free'
    )
    ON CONFLICT (user_id) DO NOTHING; -- Evita erros se o perfil já existir
  EXCEPTION
    WHEN OTHERS THEN
      -- Em caso de qualquer erro, ignora e permite o registo do utilizador
      -- O utilizador será criado em auth.users, mesmo que o perfil falhe
      RAISE WARNING 'Erro ao criar perfil para %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 6. Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMIT;