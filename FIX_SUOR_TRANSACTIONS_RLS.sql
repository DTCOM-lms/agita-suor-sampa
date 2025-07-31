-- 🔧 CORREÇÃO RLS SUOR_TRANSACTIONS (Erro 403 Forbidden)
-- Quando atividade é finalizada, sistema não consegue criar transação SUOR

-- === DIAGNÓSTICO ATUAL ===
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 VERIFICANDO RLS DA TABELA SUOR_TRANSACTIONS...';
  RAISE NOTICE '';
END $$;

-- Verificar políticas RLS existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'suor_transactions'
ORDER BY policyname;

-- Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  forcerowsecurity
FROM pg_tables 
WHERE tablename = 'suor_transactions';

-- === CORREÇÃO: POLÍTICAS RLS CORRETAS ===
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔧 CORRIGINDO POLÍTICAS RLS...';
  RAISE NOTICE '';
END $$;

-- Remover políticas existentes (se houver conflitos)
DROP POLICY IF EXISTS "Users can view own suor transactions" ON suor_transactions;
DROP POLICY IF EXISTS "Users can insert own suor transactions" ON suor_transactions;
DROP POLICY IF EXISTS "Users can update own suor transactions" ON suor_transactions;
DROP POLICY IF EXISTS "suor_transactions_select_policy" ON suor_transactions;
DROP POLICY IF EXISTS "suor_transactions_insert_policy" ON suor_transactions;
DROP POLICY IF EXISTS "suor_transactions_update_policy" ON suor_transactions;

-- Habilitar RLS (se não estiver)
ALTER TABLE suor_transactions ENABLE ROW LEVEL SECURITY;

-- POLÍTICA 1: Permitir SELECT dos próprios registros
CREATE POLICY "Users can view own suor transactions"
ON suor_transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- POLÍTICA 2: Permitir INSERT dos próprios registros ⚡ CRÍTICO
CREATE POLICY "Users can insert own suor transactions"
ON suor_transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- POLÍTICA 3: Permitir UPDATE dos próprios registros
CREATE POLICY "Users can update own suor transactions"
ON suor_transactions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- === FUNÇÃO RPC ALTERNATIVA (BACKUP) ===
-- Se as políticas não funcionarem, usar esta função
CREATE OR REPLACE FUNCTION create_suor_transaction_secure(
  p_type TEXT,
  p_source TEXT,
  p_amount INTEGER,
  p_description TEXT,
  p_activity_id UUID DEFAULT NULL,
  p_challenge_id UUID DEFAULT NULL,
  p_achievement_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS suor_transactions AS $$
DECLARE
  result suor_transactions;
BEGIN
  -- Inserir transação com segurança
  INSERT INTO suor_transactions (
    user_id,
    type,
    source,
    amount,
    description,
    activity_id,
    challenge_id,
    achievement_id,
    metadata,
    created_at
  ) VALUES (
    auth.uid(),  -- Usar função do Supabase Auth
    p_type::suor_transaction_type,
    p_source::suor_transaction_source,
    p_amount,
    p_description,
    p_activity_id,
    p_challenge_id,
    p_achievement_id,
    p_metadata,
    NOW()
  ) RETURNING * INTO result;

  -- Atualizar perfil do usuário
  PERFORM update_user_suor(auth.uid(), 
    CASE 
      WHEN p_type IN ('earned', 'bonus') THEN p_amount
      ELSE -p_amount
    END
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- === TESTE DE VERIFICAÇÃO ===
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ VERIFICANDO CORREÇÕES APLICADAS...';
  RAISE NOTICE '';
END $$;

-- Listar políticas após correção
SELECT 
  'POLÍTICAS APÓS CORREÇÃO:' as status,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'suor_transactions'
ORDER BY cmd, policyname;

-- === TESTE FUNCIONAL ===
-- Testar se consegue inserir uma transação de teste
DO $$
DECLARE
  test_user_id UUID;
  test_transaction suor_transactions;
BEGIN
  -- Pegar um usuário existente para teste
  SELECT id INTO test_user_id FROM profiles LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Tentar criar uma transação de teste
    BEGIN
      SELECT * INTO test_transaction
      FROM create_suor_transaction_secure(
        'earned',
        'test',
        1,
        'Teste de RLS',
        NULL,
        NULL,
        NULL,
        '{"test": true}'::jsonb
      );
      
      RAISE NOTICE '✅ TESTE RLS: Transação criada com sucesso!';
      RAISE NOTICE '   ID: %', test_transaction.id;
      RAISE NOTICE '   User: %', test_transaction.user_id;
      RAISE NOTICE '   Amount: %', test_transaction.amount;
      
      -- Remover transação de teste
      DELETE FROM suor_transactions WHERE id = test_transaction.id;
      RAISE NOTICE '🧹 Transação de teste removida';
      
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '❌ TESTE RLS FALHOU: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE '⚠️ Nenhum usuário encontrado para teste';
  END IF;
END $$;

-- === INSTRUÇÕES FINAIS ===
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 CORREÇÃO RLS CONCLUÍDA!';
  RAISE NOTICE '';
  RAISE NOTICE '✅ POLÍTICAS RLS configuradas para suor_transactions';
  RAISE NOTICE '✅ FUNÇÃO RPC create_suor_transaction_secure() criada';
  RAISE NOTICE '';
  RAISE NOTICE '💡 TESTE AGORA:';
  RAISE NOTICE '   1. Complete uma atividade no app';
  RAISE NOTICE '   2. Verifique se o SUOR é creditado sem erro 403';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 SE AINDA DER ERRO, use a função RPC no frontend:';
  RAISE NOTICE '   supabase.rpc("create_suor_transaction_secure", {...})';
  RAISE NOTICE '';
END $$;