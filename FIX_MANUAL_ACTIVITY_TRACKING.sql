-- ========================================
-- FIX MANUAL ACTIVITY TRACKING
-- Correções para suportar atividades manuais (sem GPS)
-- ========================================

-- 1. Verificar e ajustar tipos de atividades para supports_gps
-- Algumas atividades devem ser marcadas como supports_gps = false

-- Atualizar atividades indoor para supports_gps = false
UPDATE activity_types 
SET supports_gps = false 
WHERE name IN (
  'Musculação',
  'Yoga',
  'Pilates',
  'Crossfit',
  'Aeróbica',
  'Zumba',
  'Spinning',
  'Alongamento',
  'Meditação',
  'Funcional',
  'TRX',
  'Boxe',
  'Muay Thai',
  'Jiu-Jitsu',
  'Karatê',
  'Judô',
  'Taekwondo',
  'Academia',
  'Ginástica',
  'Dança',
  'Ballet',
  'Natação em Piscina'
);

-- Garantir que atividades outdoor tenham supports_gps = true
UPDATE activity_types 
SET supports_gps = true 
WHERE name IN (
  'Corrida',
  'Caminhada',
  'Ciclismo',
  'Natação em Mar/Lago',
  'Trilha',
  'Escalada',
  'Surf',
  'Stand Up Paddle',
  'Skate',
  'Patins',
  'Futebol',
  'Basquete',
  'Vôlei',
  'Tênis',
  'Badminton'
);

-- 2. Função melhorada para calcular SUOR (tanto GPS quanto manual)
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
  max_daily DECIMAL(8,2) := 1000; -- Default daily limit
BEGIN
  -- Validar inputs
  IF p_duration_minutes <= 0 THEN
    RETURN 0;
  END IF;
  
  -- Buscar dados do tipo de atividade
  SELECT base_suor_per_minute, COALESCE(intensity_multiplier, 1.0)
  INTO base_suor, intensity_mult
  FROM activity_types 
  WHERE id = p_activity_type_id;
  
  -- Se não encontrou o tipo de atividade, retornar 0
  IF base_suor IS NULL THEN
    RETURN 0;
  END IF;

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

  -- Cálculo final com proteção contra overflow
  final_suor := LEAST(
    (base_suor * p_duration_minutes * intensity_mult * level_bonus) + distance_bonus,
    9999.99 -- Valor máximo
  );
  
  -- Garantir que não seja negativo
  final_suor := GREATEST(final_suor, 0);

  RETURN ROUND(final_suor, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger atualizado para cálculo de SUOR automático
CREATE OR REPLACE FUNCTION calculate_suor_on_activity_completion()
RETURNS TRIGGER AS $$
DECLARE
  calculated_suor DECIMAL(8,2);
  activity_supports_gps BOOLEAN;
BEGIN
  -- Só calcular SUOR quando a atividade for completada
  IF NEW.status = 'completed' AND NEW.duration_minutes > 0 THEN
    
    -- Verificar se o tipo de atividade suporta GPS
    SELECT supports_gps INTO activity_supports_gps
    FROM activity_types 
    WHERE id = NEW.activity_type_id;
    
    -- Calcular SUOR usando a nova função
    calculated_suor := calculate_activity_suor_v2(
      NEW.activity_type_id,
      NEW.duration_minutes,
      NEW.distance_km,
      NEW.user_id,
      COALESCE(activity_supports_gps, false)
    );
    
    -- Atualizar o SUOR na atividade
    NEW.suor_earned := calculated_suor;
    
    -- Atualizar profile do usuário (saldo e totais)
    UPDATE profiles 
    SET 
      current_suor = current_suor + calculated_suor,
      total_suor = total_suor + calculated_suor,
      experience_points = experience_points + (calculated_suor::INTEGER / 10),
      total_activities = total_activities + 1,
      updated_at = NOW()
    WHERE id = NEW.user_id;
    
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
      CONCAT('Atividade concluída: ', NEW.title),
      jsonb_build_object(
        'duration_minutes', NEW.duration_minutes,
        'distance_km', COALESCE(NEW.distance_km, 0),
        'supports_gps', activity_supports_gps
      ),
      NOW()
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Remover triggers antigos e criar novo
DROP TRIGGER IF EXISTS calculate_suor_on_activity_insert ON activities;
DROP TRIGGER IF EXISTS calculate_suor_on_activity_update ON activities;

-- Criar trigger apenas para UPDATE (quando status muda para completed)
CREATE TRIGGER calculate_suor_on_activity_completion
  BEFORE UPDATE ON activities
  FOR EACH ROW 
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION calculate_suor_on_activity_completion();

-- 5. Função para teste do sistema
CREATE OR REPLACE FUNCTION test_activity_suor_calculation()
RETURNS TABLE(
  activity_type TEXT,
  supports_gps BOOLEAN,
  duration_min INTEGER,
  calculated_suor DECIMAL,
  test_result TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH test_data AS (
    SELECT 
      at.name as activity_name,
      at.supports_gps,
      at.id as type_id,
      15 as test_duration -- 15 minutos de teste
    FROM activity_types at 
    WHERE at.is_active = true
    LIMIT 10
  )
  SELECT 
    td.activity_name::TEXT,
    td.supports_gps,
    td.test_duration,
    calculate_activity_suor_v2(td.type_id, td.test_duration, 1.0, NULL, td.supports_gps),
    CASE 
      WHEN calculate_activity_suor_v2(td.type_id, td.test_duration, 1.0, NULL, td.supports_gps) > 0 
      THEN 'PASS'
      ELSE 'FAIL'
    END::TEXT
  FROM test_data td;
END;
$$ LANGUAGE plpgsql;

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_activities_status_user_id ON activities(status, user_id);
CREATE INDEX IF NOT EXISTS idx_activity_types_supports_gps ON activity_types(supports_gps);
CREATE INDEX IF NOT EXISTS idx_suor_transactions_user_date ON suor_transactions(user_id, created_at);

-- 7. Verificação da estrutura (para debug)
DO $$
BEGIN
  -- Verificar se a coluna supports_gps existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activity_types' AND column_name = 'supports_gps'
  ) THEN
    RAISE EXCEPTION 'Coluna supports_gps não existe na tabela activity_types!';
  END IF;
  
  -- Verificar se existem tipos de atividade
  IF NOT EXISTS (SELECT 1 FROM activity_types WHERE is_active = true) THEN
    RAISE EXCEPTION 'Nenhum tipo de atividade ativo encontrado!';
  END IF;
  
  RAISE NOTICE 'Verificações de estrutura concluídas com sucesso!';
END;
$$;

-- 8. Log de execução
INSERT INTO system_logs (level, message, metadata, created_at) 
VALUES (
  'INFO', 
  'Manual Activity Tracking Fix Applied',
  jsonb_build_object(
    'script', 'FIX_MANUAL_ACTIVITY_TRACKING.sql',
    'version', '1.0',
    'timestamp', NOW()
  ),
  NOW()
) ON CONFLICT DO NOTHING;

-- ========================================
-- COMANDOS PARA TESTAR A CORREÇÃO
-- ========================================

-- Teste 1: Verificar tipos de atividades
-- SELECT name, supports_gps, base_suor_per_minute FROM activity_types WHERE is_active = true ORDER BY supports_gps, name;

-- Teste 2: Testar cálculo de SUOR
-- SELECT * FROM test_activity_suor_calculation();

-- Teste 3: Criar atividade manual de teste
-- INSERT INTO activities (user_id, activity_type_id, title, duration_minutes, status) 
-- VALUES (
--   (SELECT id FROM profiles LIMIT 1),
--   (SELECT id FROM activity_types WHERE name = 'Musculação' LIMIT 1),
--   'Teste Musculação Manual',
--   30,
--   'completed'
-- );

-- ========================================
-- FIM DO SCRIPT
-- ========================================