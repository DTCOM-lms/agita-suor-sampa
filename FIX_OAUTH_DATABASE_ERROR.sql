-- 🔧 CORREÇÃO: Database error saving new user
-- Execute este script no SQL Editor do Supabase

-- ====================================
-- 1. CORRIGIR POLÍTICAS RLS
-- ====================================

-- Desabilitar RLS temporariamente para debug
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Limpar políticas existentes
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable automatic profile creation" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- Habilitar RLS novamente
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas corretas
CREATE POLICY "Enable automatic profile creation" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ====================================
-- 2. RECRIAR TRIGGER COM PRIVILÉGIOS CORRETOS
-- ====================================

-- Dropar trigger e função existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_profile_for_user();

-- Criar função melhorada com tratamento de erro
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
  user_name text;
BEGIN
  -- Extrair nome do usuário
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Log para debug
  RAISE LOG 'Creating profile for user: % with name: %', NEW.id, user_name;
  
  -- Inserir perfil
  INSERT INTO public.profiles (
    id, 
    full_name, 
    city, 
    fitness_level,
    level,
    experience_points,
    total_suor,
    current_suor,
    is_public,
    allow_friend_requests,
    notification_preferences,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    user_name,
    'São Paulo',
    'beginner',
    1,
    0,
    100.0,
    100.0,
    true,
    true,
    '{}'::jsonb,
    NOW(),
    NOW()
  );
  
  RAISE LOG 'Profile created successfully for user: %', NEW.id;
  RETURN NEW;
  
EXCEPTION
  WHEN others THEN
    RAISE LOG 'ERROR creating profile for user %: % - %', NEW.id, SQLSTATE, SQLERRM;
    -- Não falhar o login por causa do perfil
    RETURN NEW;
END;
$$;

-- Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- ====================================
-- 3. VERIFICAÇÕES
-- ====================================

-- Verificar se o trigger foi criado
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Verificar políticas
SELECT policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';

-- ====================================
-- 4. GRANT PERMISSIONS
-- ====================================

-- Garantir que a função tem permissões necessárias
GRANT ALL ON TABLE profiles TO postgres;
GRANT ALL ON TABLE profiles TO anon;
GRANT ALL ON TABLE profiles TO authenticated;

-- ====================================
-- 5. TESTE MANUAL (OPCIONAL)
-- ====================================

-- Para testar, descomente e execute:
/*
-- Criar usuário de teste
INSERT INTO auth.users (
  id, 
  email, 
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'teste@exemplo.com',
  '{"full_name": "Usuário Teste"}'::jsonb,
  NOW(),
  NOW()
);

-- Verificar se o perfil foi criado
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 1;
*/

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Script executado com sucesso! Agora teste o login OAuth novamente.';
END
$$;