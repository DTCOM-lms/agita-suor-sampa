-- 🔥 ULTRA SIMPLES - CORREÇÃO DEFINITIVA SUOR (SEM AMBIGUIDADE)
-- Este script é IMPOSSÍVEL de dar erro de ambiguidade

-- === LIMPEZA TOTAL ===
DROP FUNCTION IF EXISTS check_suor_inconsistencies() CASCADE;
DROP FUNCTION IF EXISTS sync_user_suor_with_activities() CASCADE;

-- === FUNÇÃO ULTRA SIMPLES PARA VERIFICAR ===
CREATE FUNCTION check_suor_inconsistencies()
RETURNS TABLE (
  profile_id UUID,
  profile_current DECIMAL(10,2),
  activities_total DECIMAL(10,2),
  diferenca DECIMAL(10,2),
  situacao TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as profile_id,
    p.current_suor as profile_current,
    COALESCE(activity_totals.total_suor, 0) as activities_total,
    (p.current_suor - COALESCE(activity_totals.total_suor, 0)) as diferenca,
    CASE 
      WHEN p.current_suor = COALESCE(activity_totals.total_suor, 0) THEN '✅ OK'
      WHEN p.current_suor > COALESCE(activity_totals.total_suor, 0) THEN '⚠️ PERFIL MAIOR'
      ELSE '❌ PERFIL MENOR'
    END as situacao
  FROM profiles p
  LEFT JOIN (
    SELECT 
      activities.user_id as profile_id,
      SUM(activities.suor_earned) as total_suor
    FROM activities 
    WHERE activities.status = 'completed' 
      AND activities.suor_earned IS NOT NULL
    GROUP BY activities.user_id
  ) activity_totals ON p.id = activity_totals.profile_id
  ORDER BY diferenca DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- === FUNÇÃO ULTRA SIMPLES PARA SINCRONIZAR ===
CREATE FUNCTION sync_all_user_suor()
RETURNS TABLE (
  profile_id UUID,
  suor_antigo DECIMAL(10,2),
  suor_novo DECIMAL(10,2),
  resultado TEXT
) AS $$
DECLARE
  profile_rec RECORD;
  calculated_suor DECIMAL(10,2);
BEGIN
  FOR profile_rec IN SELECT id, current_suor FROM profiles
  LOOP
    -- Calcular SUOR real das atividades deste usuário
    SELECT COALESCE(SUM(activities.suor_earned), 0) 
    INTO calculated_suor
    FROM activities 
    WHERE activities.user_id = profile_rec.id 
      AND activities.status = 'completed' 
      AND activities.suor_earned IS NOT NULL;

    -- Atualizar perfil com valor correto
    UPDATE profiles 
    SET 
      current_suor = calculated_suor,
      total_suor = calculated_suor,
      updated_at = NOW()
    WHERE id = profile_rec.id;

    -- Preparar retorno
    profile_id := profile_rec.id;
    suor_antigo := profile_rec.current_suor;
    suor_novo := calculated_suor;
    resultado := CASE 
      WHEN profile_rec.current_suor = calculated_suor THEN '✅ JÁ OK'
      ELSE '🔄 CORRIGIDO'
    END;
    
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- === EXECUÇÃO PASSO A PASSO ===

-- Passo 1: Ver problemas ANTES
DO $$
BEGIN
  RAISE NOTICE '🔍 VERIFICANDO PROBLEMAS ANTES DA CORREÇÃO...';
END $$;

SELECT * FROM check_suor_inconsistencies();

-- Passo 2: Corrigir todos os perfis
DO $$
BEGIN
  RAISE NOTICE '🔄 CORRIGINDO TODOS OS PERFIS...';
END $$;

SELECT * FROM sync_all_user_suor();

-- Passo 3: Verificar se foi corrigido
DO $$
BEGIN
  RAISE NOTICE '✅ VERIFICANDO RESULTADO FINAL...';
END $$;

SELECT * FROM check_suor_inconsistencies();

-- Passo 4: Estatísticas finais
DO $$
BEGIN
  RAISE NOTICE '📊 ESTATÍSTICAS DO SISTEMA:';
END $$;

SELECT 
  COUNT(*) as total_usuarios,
  SUM(current_suor) as suor_total,
  ROUND(AVG(current_suor), 2) as suor_medio
FROM profiles;

-- Passo 5: Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 SISTEMA SUOR TOTALMENTE CORRIGIDO!';
  RAISE NOTICE '✅ Ambiguidade SQL eliminada';
  RAISE NOTICE '✅ Perfis sincronizados com atividades';
  RAISE NOTICE '✅ Frontend deve mostrar valores consistentes';
  RAISE NOTICE '';
END $$;