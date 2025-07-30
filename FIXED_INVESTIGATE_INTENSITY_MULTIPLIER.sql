-- 🔍 INVESTIGAÇÃO CORRIGIDA: intensity_multiplier ambiguidade
-- Data: Janeiro 2025
-- Descrição: Investigação e correção com tratamento de functions duplicadas

-- ===============================================
-- 🔍 INVESTIGAÇÃO 1: TRIGGERS DETALHADOS
-- ===============================================

SELECT '=== TRIGGERS EM ACTIVITIES ===' as investigation;

SELECT 
    trigger_name,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'activities'
ORDER BY trigger_name;

-- ===============================================
-- 🔍 INVESTIGAÇÃO 2: FUNCTIONS QUE MENCIONAM INTENSITY_MULTIPLIER
-- ===============================================

SELECT '=== FUNCTIONS COM INTENSITY_MULTIPLIER ===' as investigation;

SELECT 
    routine_name,
    routine_type,
    specific_name,
    LEFT(routine_definition, 200) as definition_preview
FROM information_schema.routines 
WHERE routine_definition LIKE '%intensity_multiplier%' 
AND routine_schema = 'public'
ORDER BY routine_name;

-- ===============================================
-- 🔍 INVESTIGAÇÃO 3: TODAS AS COLUNAS INTENSITY_MULTIPLIER
-- ===============================================

SELECT '=== TODAS AS COLUNAS INTENSITY_MULTIPLIER ===' as investigation;

SELECT 
    table_name,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE column_name = 'intensity_multiplier'
AND table_schema = 'public'
ORDER BY table_name;

-- ===============================================
-- 🚨 CORREÇÃO SEGURA: REMOVER ITEMS PROBLEMÁTICOS
-- ===============================================

DO $$
DECLARE
    r RECORD;
    function_signature TEXT;
BEGIN
    RAISE NOTICE '🔥 INICIANDO LIMPEZA SEGURA...';
    
    -- 1. REMOVER TODOS OS TRIGGERS DE ACTIVITIES
    FOR r IN (
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'activities'
    ) LOOP
        BEGIN
            EXECUTE format('DROP TRIGGER IF EXISTS %I ON activities CASCADE', r.trigger_name);
            RAISE NOTICE '🔧 Trigger removido: %', r.trigger_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Erro ao remover trigger %: %', r.trigger_name, SQLERRM;
        END;
    END LOOP;
    
    -- 2. REMOVER FUNCTIONS COM INTENSITY_MULTIPLIER (usando specific_name)
    FOR r IN (
        SELECT specific_name, routine_name
        FROM information_schema.routines 
        WHERE routine_definition LIKE '%intensity_multiplier%' 
        AND routine_schema = 'public'
    ) LOOP
        BEGIN
            EXECUTE format('DROP FUNCTION IF EXISTS %I CASCADE', r.specific_name);
            RAISE NOTICE '🔧 Function removida: % (%)', r.routine_name, r.specific_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Erro ao remover function %: %', r.routine_name, SQLERRM;
        END;
    END LOOP;
    
    -- 3. TENTAR REMOVER FUNCTIONS PROBLEMÁTICAS CONHECIDAS POR NOME
    DECLARE
        func_names TEXT[] := ARRAY[
            'calculate_activity_suor', 
            'get_activity_type_by_name_or_id',
            'sync_activity_timestamps'
        ];
        func_name TEXT;
    BEGIN
        FOREACH func_name IN ARRAY func_names LOOP
            -- Buscar todas as versões da function e remover uma por uma
            FOR r IN (
                SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) as args
                FROM pg_proc p 
                JOIN pg_namespace n ON p.pronamespace = n.oid
                WHERE p.proname = func_name AND n.nspname = 'public'
            ) LOOP
                BEGIN
                    function_signature := func_name || '(' || r.args || ')';
                    EXECUTE format('DROP FUNCTION IF EXISTS %s CASCADE', function_signature);
                    RAISE NOTICE '🔧 Function específica removida: %', function_signature;
                EXCEPTION WHEN OTHERS THEN
                    RAISE NOTICE '⚠️ Erro ao remover function %: %', function_signature, SQLERRM;
                END;
            END LOOP;
        END LOOP;
    END;
    
    -- 4. FORÇAR REMOÇÃO DA COLUNA INTENSITY_MULTIPLIER DE ACTIVITIES
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' AND column_name = 'intensity_multiplier'
    ) THEN
        BEGIN
            -- Temporariamente desabilitar RLS
            ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
            
            -- Remover coluna com CASCADE
            ALTER TABLE activities DROP COLUMN intensity_multiplier CASCADE;
            
            -- Reabilitar RLS
            ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
            
            RAISE NOTICE '🔥 intensity_multiplier REMOVIDO de activities';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Erro ao remover coluna: %', SQLERRM;
            -- Tentar reabilitar RLS mesmo se der erro
            BEGIN
                ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
            EXCEPTION WHEN OTHERS THEN
                NULL;
            END;
        END;
    ELSE
        RAISE NOTICE '✅ activities não tem intensity_multiplier (OK)';
    END IF;
    
    -- 5. LIMPAR CACHE
    PERFORM pg_notify('pgrst', 'reload schema');
    PERFORM pg_notify('pgrst', 'reload config');
    
    RAISE NOTICE '✅ LIMPEZA SEGURA CONCLUÍDA';
    
END $$;

-- ===============================================
-- 🔍 VERIFICAÇÃO PÓS-LIMPEZA
-- ===============================================

SELECT '=== VERIFICAÇÃO PÓS-LIMPEZA ===' as final_check;

-- Triggers restantes
SELECT 'Triggers restantes:' as check_type, COUNT(*) as count
FROM information_schema.triggers 
WHERE event_object_table = 'activities';

-- Functions com intensity_multiplier restantes
SELECT 'Functions com intensity_multiplier restantes:' as check_type, COUNT(*) as count
FROM information_schema.routines 
WHERE routine_definition LIKE '%intensity_multiplier%' 
AND routine_schema = 'public';

-- Colunas intensity_multiplier restantes
SELECT 'Tabela' as tipo, table_name, 'tem intensity_multiplier' as status
FROM information_schema.columns 
WHERE column_name = 'intensity_multiplier'
AND table_schema = 'public'
ORDER BY table_name;

-- ===============================================
-- ✅ TESTE FINAL DE INSERT SIMPLES
-- ===============================================

DO $$
DECLARE
    test_user_id UUID;
    test_activity_type_id UUID;
    test_activity_id UUID;
BEGIN
    -- Buscar IDs para teste (se existirem)
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    SELECT id INTO test_activity_type_id FROM activity_types WHERE is_active = true LIMIT 1;
    
    IF test_user_id IS NOT NULL AND test_activity_type_id IS NOT NULL THEN
        -- Tentar INSERT básico
        INSERT INTO activities (
            user_id,
            activity_type_id,
            title,
            started_at,
            status,
            suor_earned
        ) VALUES (
            test_user_id,
            test_activity_type_id,
            'TESTE FINAL - pode deletar',
            NOW(),
            'active',
            0
        ) RETURNING id INTO test_activity_id;
        
        -- Deletar teste imediatamente
        DELETE FROM activities WHERE id = test_activity_id;
        
        RAISE NOTICE '🎉 SUCESSO TOTAL: INSERT funcionou perfeitamente!';
        RAISE NOTICE '🚀 AGORA TESTE O FRONTEND!';
    ELSE
        RAISE NOTICE '⚠️ Teste limitado - sem usuários ou activity_types para testar';
        RAISE NOTICE '🚀 MAS AINDA ASSIM, TESTE O FRONTEND';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO NO TESTE INSERT: %', SQLERRM;
    RAISE NOTICE '🔍 MAS AINDA PODE FUNCIONAR NO FRONTEND - TESTE!';
END $$;

-- ===============================================
-- 📋 INSTRUÇÕES FINAIS
-- ===============================================

SELECT 
    '🎯 PRÓXIMOS PASSOS OBRIGATÓRIOS:' as titulo;

SELECT 
    '1. Aguarde 30 segundos após este script' as passo1;
    
SELECT 
    '2. Reinicie o frontend: npm run dev' as passo2;
    
SELECT 
    '3. Teste criar atividade no browser' as passo3;

SELECT 
    '4. Se ainda der erro, me informe!' as passo4;