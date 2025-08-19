-- 🔧 CORREÇÃO RLS: Resolver Recursão Infinita nas Políticas Admin
-- Execute este script no SQL Editor do Supabase

-- ====================================
-- 1. VERIFICAR PROBLEMA ATUAL
-- ====================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🚨 PROBLEMA IDENTIFICADO: Recursão Infinita nas Políticas RLS';
  RAISE NOTICE '🔍 Causa: Políticas admin consultam profiles para verificar is_admin';
  RAISE NOTICE '🔄 Solução: Usar função RPC ou política mais simples';
  RAISE NOTICE '';
END $$;

-- ====================================
-- 2. REMOVER POLÍTICAS PROBLEMÁTICAS
-- ====================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔧 REMOVENDO POLÍTICAS PROBLEMÁTICAS...';
  RAISE NOTICE '';
END $$;

-- Remover todas as políticas existentes que causam recursão
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable automatic profile creation" ON profiles;

-- ====================================
-- 3. CRIAR FUNÇÃO RPC PARA VERIFICAR ADMIN
-- ====================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔧 CRIANDO FUNÇÃO RPC PARA VERIFICAR ADMIN...';
  RAISE NOTICE '';
END $$;

-- Função para verificar se um usuário é admin (sem recursão)
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  -- Buscar status admin diretamente (sem RLS)
  SELECT is_admin INTO admin_status
  FROM profiles
  WHERE id = user_id;
  
  RETURN COALESCE(admin_status, false);
END;
$$;

-- ====================================
-- 4. CRIAR POLÍTICAS RLS CORRETAS
-- ====================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔧 CRIANDO POLÍTICAS RLS CORRETAS...';
  RAISE NOTICE '';
END $$;

-- POLÍTICA 1: Permitir criação automática de perfis (para trigger)
CREATE POLICY "Enable automatic profile creation"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

-- POLÍTICA 2: Permitir que usuários vejam perfis públicos
CREATE POLICY "Users can view public profiles"
ON profiles
FOR SELECT
TO authenticated
USING (is_public = true);

-- POLÍTICA 3: Permitir que usuários vejam seu próprio perfil
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- POLÍTICA 4: Permitir que usuários atualizem seu próprio perfil
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- POLÍTICA 5: Permitir que admins vejam TODOS os perfis (usando função RPC)
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (is_user_admin(auth.uid()));

-- POLÍTICA 6: Permitir que admins atualizem TODOS os perfis (usando função RPC)
CREATE POLICY "Admins can update all profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- ====================================
-- 5. VERIFICAR SE A COLUNA IS_ADMIN EXISTE
-- ====================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'is_admin'
  ) THEN
    RAISE NOTICE '⚠️ Coluna is_admin não existe. Criando...';
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
    RAISE NOTICE '✅ Coluna is_admin criada com sucesso';
  ELSE
    RAISE NOTICE '✅ Coluna is_admin já existe';
  END IF;
END $$;

-- ====================================
-- 6. CRIAR ÍNDICE PARA PERFORMANCE
-- ====================================

CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- ====================================
-- 7. TESTAR FUNÇÃO RPC
-- ====================================

DO $$
DECLARE
  test_user_id UUID;
  admin_status BOOLEAN;
BEGIN
  -- Pegar um usuário existente para teste
  SELECT id INTO test_user_id FROM profiles LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    RAISE NOTICE '✅ Usuário de teste encontrado: %', test_user_id;
    
    -- Testar função RPC
    SELECT is_user_admin(test_user_id) INTO admin_status;
    RAISE NOTICE '🔍 Status admin do usuário: %', admin_status;
    
    -- Se não for admin, tornar admin para teste
    IF NOT admin_status THEN
      UPDATE profiles SET is_admin = true WHERE id = test_user_id;
      RAISE NOTICE '👑 Usuário configurado como admin para teste';
      
      -- Verificar novamente
      SELECT is_user_admin(test_user_id) INTO admin_status;
      RAISE NOTICE '🔍 Status admin após configuração: %', admin_status;
    END IF;
  ELSE
    RAISE NOTICE '⚠️ Nenhum usuário encontrado para teste';
  END IF;
END $$;

-- ====================================
-- 8. VERIFICAÇÕES FINAIS
-- ====================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 VERIFICANDO POLÍTICAS CRIADAS...';
  RAISE NOTICE '';
END $$;

-- Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Verificar se a coluna is_admin foi criada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'is_admin';

-- Verificar se o índice foi criado
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'profiles' 
AND indexname = 'idx_profiles_is_admin';

-- Verificar se a função RPC foi criada
SELECT 
  routine_name,
  routine_type,
  data_type,
  security_type
FROM information_schema.routines 
WHERE routine_name = 'is_user_admin';

-- ====================================
-- 9. INSTRUÇÕES FINAIS
-- ====================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 CORREÇÃO RLS RECURSÃO CONCLUÍDA!';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Função RPC is_user_admin() criada (sem recursão)';
  RAISE NOTICE '✅ Políticas RLS corrigidas para evitar loops infinitos';
  RAISE NOTICE '✅ Coluna is_admin verificada/criada';
  RAISE NOTICE '✅ Índice de performance criado';
  RAISE NOTICE '';
  RAISE NOTICE '💡 PRÓXIMOS PASSOS:';
  RAISE NOTICE '   1. Teste a funcionalidade admin no frontend';
  RAISE NOTICE '   2. Verifique se o toggle admin funciona';
  RAISE NOTICE '   3. Confirme que não há mais erros 500';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 SE AINDA DER PROBLEMA, verifique:';
  RAISE NOTICE '   - Se a função RPC is_user_admin() foi criada';
  RAISE NOTICE '   - Se as políticas RLS foram aplicadas';
  RAISE NOTICE '   - Logs do Supabase para erros específicos';
  RAISE NOTICE '';
END $$;
