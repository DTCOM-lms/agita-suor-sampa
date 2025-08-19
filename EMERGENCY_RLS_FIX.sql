-- 🚨 SCRIPT DE EMERGÊNCIA: Reverter Políticas RLS Problemáticas
-- Execute este script se ainda houver problemas de recursão

-- ====================================
-- 1. DESABILITAR RLS TEMPORARIAMENTE
-- ====================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🚨 DESABILITANDO RLS TEMPORARIAMENTE...';
  RAISE NOTICE '⚠️ ATENÇÃO: Isso remove todas as restrições de segurança!';
  RAISE NOTICE '';
END $$;

-- Desabilitar RLS para resolver problemas imediatos
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ====================================
-- 2. VERIFICAR STATUS
-- ====================================

-- Verificar se RLS foi desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  forcerowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- ====================================
-- 3. TESTAR ACESSO
-- ====================================

-- Testar se consegue acessar a tabela sem erros
DO $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  RAISE NOTICE '✅ Acesso à tabela profiles restaurado. Usuários encontrados: %', user_count;
END $$;

-- ====================================
-- 4. INSTRUÇÕES PARA REATIVAR SEGURANÇA
-- ====================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 RLS DESABILITADO COM SUCESSO!';
  RAISE NOTICE '';
  RAISE NOTICE '💡 PRÓXIMOS PASSOS:';
  RAISE NOTICE '   1. Teste se o app funciona sem erros 500';
  RAISE NOTICE '   2. Configure um usuário como admin:';
  RAISE NOTICE '      UPDATE profiles SET is_admin = true WHERE id = ''SEU_USER_ID'';';
  RAISE NOTICE '   3. Execute o script FIX_ADMIN_RLS_RECURSION.sql para reativar segurança';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ IMPORTANTE: RLS está desabilitado - sem segurança!';
  RAISE NOTICE '   Reative a segurança assim que possível.';
  RAISE NOTICE '';
END $$;
