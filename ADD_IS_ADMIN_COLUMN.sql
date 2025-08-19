-- 🔧 ADICIONAR COLUNA IS_ADMIN À TABELA PROFILES
-- Execute este script no SQL Editor do Supabase

-- ====================================
-- 1. ADICIONAR COLUNA IS_ADMIN
-- ====================================

-- Adicionar coluna is_admin se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
        RAISE NOTICE 'Coluna is_admin adicionada à tabela profiles';
    ELSE
        RAISE NOTICE 'Coluna is_admin já existe na tabela profiles';
    END IF;
END $$;

-- ====================================
-- 2. CRIAR ÍNDICE PARA PERFORMANCE
-- ====================================

-- Criar índice para consultas por admin
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- ====================================
-- 3. ATUALIZAR POLÍTICAS RLS (OPCIONAL)
-- ====================================

-- Permitir que admins vejam todos os perfis
-- (Descomente se quiser implementar essa funcionalidade)
/*
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
*/

-- ====================================
-- 4. VERIFICAÇÕES
-- ====================================

-- Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'is_admin';

-- Verificar se o índice foi criado
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'profiles' 
AND indexname = 'idx_profiles_is_admin';

-- ====================================
-- 5. TESTE MANUAL (OPCIONAL)
-- ====================================

-- Testar se a coluna funciona
SELECT id, full_name, is_admin 
FROM profiles 
LIMIT 5;
