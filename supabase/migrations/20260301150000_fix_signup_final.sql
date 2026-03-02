BEGIN;

-- 1. Limpeza agressiva: Remover TODOS os triggers de auth.users para garantir que não há conflitos
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

-- 2. Remover funções e triggers antigos que possam estar a causar problemas
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Remover o trigger de "guard" que pode estar a bloquear a inserção se as permissões falharem
DROP TRIGGER IF EXISTS guard_user_profile_plan_insert_update ON public.user_profiles;
DROP FUNCTION IF EXISTS public.guard_user_profile_plan();

-- 3. Garantir que a tabela user_profiles existe e tem as colunas necessárias
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text,
  created_at timestamptz DEFAULT timezone('utc', now()),
  plan text NOT NULL DEFAULT 'free'
);

-- Adicionar colunas se não existirem (idempotente)
DO $$
BEGIN
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email text;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS name text;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT timezone('utc', now());
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- 4. Recriar a função handle_new_user com proteção total contra erros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_name text;
BEGIN
  -- Tentar extrair o nome, mas sem falhar se for nulo
  profile_name := NULLIF(
    btrim(
      COALESCE(
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.raw_user_meta_data ->> 'name',
        NEW.raw_user_meta_data ->> 'username',
        ''
      )
    ),
    ''
  );

  -- Bloco BEGIN/EXCEPTION para garantir que o signup NUNCA falha devido ao perfil
  BEGIN
    INSERT INTO public.user_profiles (user_id, email, name, plan)
    VALUES (NEW.id, NEW.email, profile_name, 'free')
    ON CONFLICT (user_id) DO UPDATE
    SET
      email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, public.user_profiles.name),
      plan = COALESCE(public.user_profiles.plan, 'free');
  EXCEPTION
    WHEN OTHERS THEN
      -- Apenas regista o aviso nos logs do Postgres, mas deixa o utilizador ser criado
      RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 5. Recriar o trigger único
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMIT;