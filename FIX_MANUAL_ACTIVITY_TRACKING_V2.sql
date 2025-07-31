-- ========================================
-- FIX MANUAL ACTIVITY TRACKING V2
-- Correção robusta para atividades manuais + debug
-- ========================================

-- ATENÇÃO: Execute este script no Supabase SQL Editor

-- 1. Limpar triggers antigos de forma robusta
DO $$
BEGIN
    -- Remover todos os triggers relacionados na tabela activities
    DROP TRIGGER IF EXISTS calculate_suor_on_activity_insert ON activities;
    DROP TRIGGER IF EXISTS calculate_suor_on_activity_update ON activities;
    DROP TRIGGER IF EXISTS calculate_suor_on_activity_completion ON activities;
    DROP TRIGGER IF EXISTS calculate_activity_suor ON activities;
    
    RAISE NOTICE 'Triggers antigos removidos com sucesso';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao remover triggers: %', SQLERRM;
END $$;

-- 2. Verificar e corrigir tipos de atividades
-- Primeiro, vamos ver o que temos
SELECT 'ANTES DA CORREÇÃO' as status, name, supports_gps, base_suor_per_minute 
FROM activity_types 
WHERE name IN ('Musculação', 'Yoga', 'Pilates', 'Corrida', 'Caminhada') 
AND is_active = true;

-- Corrigir atividades indoor para supports_gps = false
UPDATE activity_types 
SET supports_gps = false 
WHERE name IN (
  'Musculação', 'Yoga', 'Pilates', 'Crossfit', 'Aeróbica', 
  'Zumba', 'Spinning', 'Alongamento', 'Meditação', 'Funcional',
  'TRX', 'Boxe', 'Muay Thai', 'Jiu-Jitsu', 'Karatê', 'Judô',
  'Taekwondo', 'Academia', 'Ginástica', 'Dança', 'Ballet',
  'Natação em Piscina'
)
AND is_active = true;

-- Corrigir atividades outdoor para supports_gps = true  
UPDATE activity_types 
SET supports_gps = true 
WHERE name IN (
  'Corrida', 'Caminhada', 'Ciclismo', 'Natação em Mar/Lago',
  'Trilha', 'Escalada', 'Surf', 'Stand Up Paddle', 'Skate',
  'Patins', 'Futebol', 'Basquete', 'Vôlei', 'Tênis', 'Badminton'
)
AND is_active = true;

-- Verificar resultado
SELECT 'APÓS CORREÇÃO' as status, name, supports_gps, base_suor_per_minute 
FROM activity_types 
WHERE name IN ('Musculação', 'Yoga', 'Pilates', 'Corrida', 'Caminhada') 
AND is_active = true;

-- 3. Função SUOR melhorada
CREATE OR REPLACE FUNCTION calculate_activity_suor_v2(
  p_activity_type_id UUID,
  p_duration_minutes INTEGER,
  p_distance_km DECIMAL DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_supports_gps BOOLEAN DEFAULT true
)
RETURNS DECIMAL(8,2) AS $$
DECLARE
  base_suor DECIMAL(5,2);
  intensity_mult DECIMAL(3,2);
  user_level INTEGER := 1;
  level_bonus DECIMAL(3,2) := 1.0;
  distance_bonus DECIMAL(6,2) := 0;
  final_suor DECIMAL(8,2);
BEGIN
  -- Log da função
  RAISE NOTICE 'Calculando SUOR: type_id=%, duration=%, distance=%, supports_gps=%', 
    p_activity_type_id, p_duration_minutes, p_distance_km, p_supports_gps;

  -- Validar inputs
  IF p_duration_minutes <= 0 THEN
    RAISE NOTICE 'Duração inválida: %', p_duration_minutes;
    RETURN 0;
  END IF;
  
  -- Buscar dados do tipo de atividade
  SELECT base_suor_per_minute, COALESCE(intensity_multiplier, 1.0)
  INTO base_suor, intensity_mult
  FROM activity_types 
  WHERE id = p_activity_type_id;
  
  -- Se não encontrou o tipo de atividade
  IF base_suor IS NULL THEN
    RAISE NOTICE 'Tipo de atividade não encontrado: %', p_activity_type_id;
    RETURN 0;
  END IF;
  
  RAISE NOTICE 'Dados da atividade: base_suor=%, intensity=%, supports_gps=%', 
    base_suor, intensity_mult, p_supports_gps;

  -- Buscar nível do usuário se fornecido
  IF p_user_id IS NOT NULL THEN
    SELECT COALESCE(level, 1) INTO user_level
    FROM profiles WHERE id = p_user_id;
    
    -- Calcular bonus por nível (5% a mais por nível acima de 1)
    level_bonus := 1 + (user_level - 1) * 0.05;
  END IF;

  -- Bonus por distância (apenas para atividades com GPS)
  IF p_supports_gps AND p_distance_km IS NOT NULL AND p_distance_km > 0 THEN
    distance_bonus := p_distance_km * 2; -- 2 SUOR por km
  END IF;

  -- Cálculo final
  final_suor := (base_suor * p_duration_minutes * intensity_mult * level_bonus) + distance_bonus;
  
  -- Garantir que não seja negativo e limitar
  final_suor := LEAST(GREATEST(final_suor, 0), 9999.99);
  
  RAISE NOTICE 'SUOR calculado: %', final_suor;

  RETURN ROUND(final_suor, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger função melhorada
CREATE OR REPLACE FUNCTION calculate_suor_on_activity_completion()
RETURNS TRIGGER AS $$
DECLARE
  calculated_suor DECIMAL(8,2);
  activity_supports_gps BOOLEAN;
  activity_name TEXT;
BEGIN
  RAISE NOTICE 'Trigger executado: OLD.status=%, NEW.status=%, duration=%', 
    OLD.status, NEW.status, NEW.duration_minutes;

  -- Só calcular SUOR quando a atividade for completada
  IF NEW.status = 'completed' AND NEW.duration_minutes > 0 THEN
    
    -- Buscar dados do tipo de atividade
    SELECT supports_gps, name INTO activity_supports_gps, activity_name
    FROM activity_types 
    WHERE id = NEW.activity_type_id;
    
    RAISE NOTICE 'Atividade: %, supports_gps=%, duration=%min', 
      activity_name, activity_supports_gps, NEW.duration_minutes;
    
    -- Calcular SUOR usando a nova função
    calculated_suor := calculate_activity_suor_v2(
      NEW.activity_type_id,
      NEW.duration_minutes,
      NEW.distance_km,
      NEW.user_id,
      COALESCE(activity_supports_gps, false)
    );
    
    RAISE NOTICE 'SUOR calculado pelo trigger: %', calculated_suor;
    
    -- Atualizar o SUOR na atividade
    NEW.suor_earned := calculated_suor;
    
    -- Só atualizar profile e criar transação se houver SUOR
    IF calculated_suor > 0 THEN
      -- Atualizar profile do usuário
      UPDATE profiles 
      SET 
        current_suor = current_suor + calculated_suor,
        total_suor = total_suor + calculated_suor,
        experience_points = experience_points + (calculated_suor::INTEGER / 10),
        total_activities = total_activities + 1,
        updated_at = NOW()
      WHERE id = NEW.user_id;
      
      RAISE NOTICE 'Profile atualizado para usuário: %', NEW.user_id;
      
      -- Criar transação SUOR
      INSERT INTO suor_transactions (
        user_id, type, source, amount, activity_id,
        description, metadata, created_at
      ) VALUES (
        NEW.user_id, 
        'earned', 
        'activity', 
        calculated_suor, 
        NEW.id,
        CONCAT('Atividade concluída: ', COALESCE(NEW.title, activity_name)),
        jsonb_build_object(
          'duration_minutes', NEW.duration_minutes,
          'distance_km', COALESCE(NEW.distance_km, 0),
          'supports_gps', activity_supports_gps,
          'activity_name', activity_name
        ),
        NOW()
      );
      
      RAISE NOTICE 'Transação SUOR criada: % pontos', calculated_suor;
    ELSE
      RAISE NOTICE 'Nenhum SUOR foi calculado';
    END IF;
    
  ELSE
    RAISE NOTICE 'Condições não atendidas: status=% (expected completed), duration=%', 
      NEW.status, NEW.duration_minutes;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar o novo trigger
CREATE TRIGGER calculate_suor_on_activity_completion
  BEFORE UPDATE ON activities
  FOR EACH ROW 
  WHEN (NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed'))
  EXECUTE FUNCTION calculate_suor_on_activity_completion();

-- 6. Função de teste
CREATE OR REPLACE FUNCTION test_manual_activity_suor()
RETURNS TEXT AS $$
DECLARE
  test_user_id UUID;
  test_activity_type_id UUID;
  test_activity_id UUID;
  result_suor DECIMAL;
  result_text TEXT;
BEGIN
  -- Buscar um usuário de teste
  SELECT id INTO test_user_id FROM profiles LIMIT 1;
  
  -- Buscar tipo de atividade manual (sem GPS)
  SELECT id INTO test_activity_type_id 
  FROM activity_types 
  WHERE supports_gps = false AND is_active = true 
  LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RETURN 'ERRO: Nenhum usuário encontrado para teste';
  END IF;
  
  IF test_activity_type_id IS NULL THEN
    RETURN 'ERRO: Nenhuma atividade manual encontrada';
  END IF;
  
  -- Criar atividade de teste
  INSERT INTO activities (
    user_id, activity_type_id, title, 
    duration_minutes, status, created_at, updated_at
  ) VALUES (
    test_user_id, test_activity_type_id, 'TESTE Manual Activity',
    30, 'active', NOW(), NOW()
  ) RETURNING id INTO test_activity_id;
  
  -- Completar a atividade (deve triggar o cálculo de SUOR)
  UPDATE activities 
  SET status = 'completed', updated_at = NOW()
  WHERE id = test_activity_id;
  
  -- Verificar se SUOR foi calculado
  SELECT suor_earned INTO result_suor
  FROM activities 
  WHERE id = test_activity_id;
  
  -- Limpar teste
  DELETE FROM suor_transactions WHERE activity_id = test_activity_id;
  DELETE FROM activities WHERE id = test_activity_id;
  
  -- Retornar resultado
  IF result_suor > 0 THEN
    result_text := 'SUCESSO: SUOR calculado = ' || result_suor::TEXT;
  ELSE
    result_text := 'FALHA: SUOR não foi calculado (valor: ' || COALESCE(result_suor::TEXT, 'NULL') || ')';
  END IF;
  
  RETURN result_text;
END;
$$ LANGUAGE plpgsql;

-- 7. Verificações e testes
SELECT 'VERIFICAÇÃO 1: Tipos de atividades corrigidos' as teste;
SELECT name, supports_gps, base_suor_per_minute 
FROM activity_types 
WHERE is_active = true 
ORDER BY supports_gps DESC, name;

SELECT 'VERIFICAÇÃO 2: Triggers na tabela activities' as teste;
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'activities';

SELECT 'VERIFICAÇÃO 3: Teste de cálculo manual' as teste;
SELECT test_manual_activity_suor();

-- 8. Comandos de teste manual (descomente para usar)
/*
-- Teste direto da função de cálculo
SELECT calculate_activity_suor_v2(
  (SELECT id FROM activity_types WHERE name = 'Musculação' LIMIT 1),
  30, -- 30 minutos
  NULL, -- sem distância
  (SELECT id FROM profiles LIMIT 1),
  false -- sem GPS
) as suor_calculado;

-- Testar criação de atividade manual
INSERT INTO activities (
  user_id, 
  activity_type_id, 
  title, 
  duration_minutes, 
  status,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM profiles LIMIT 1),
  (SELECT id FROM activity_types WHERE name = 'Musculação' LIMIT 1),
  'Teste Musculação Manual',
  25,
  'completed',
  NOW(),
  NOW()
);
*/

-- ========================================
-- COMANDOS PARA DEBUG E VERIFICAÇÃO
-- ========================================

-- Ver últimas atividades e SUOR
SELECT 'ÚLTIMAS ATIVIDADES' as info;
SELECT 
  a.title,
  a.duration_minutes,
  a.suor_earned,
  a.status,
  at.name as activity_type,
  at.supports_gps,
  a.created_at
FROM activities a
JOIN activity_types at ON a.activity_type_id = at.id
ORDER BY a.created_at DESC
LIMIT 5;

-- Ver últimas transações SUOR
SELECT 'ÚLTIMAS TRANSAÇÕES SUOR' as info;
SELECT 
  type,
  source, 
  amount,
  description,
  created_at
FROM suor_transactions 
ORDER BY created_at DESC 
LIMIT 5;

-- ========================================
-- FIM DO SCRIPT V2
-- ========================================