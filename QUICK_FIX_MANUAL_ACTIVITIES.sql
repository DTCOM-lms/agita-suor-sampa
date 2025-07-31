-- ========================================
-- QUICK FIX: ATIVIDADES MANUAIS 
-- Correção rápida e direta
-- ========================================

-- PASSO 1: Remover trigger problemático
DROP TRIGGER IF EXISTS calculate_suor_on_activity_completion ON activities CASCADE;

-- PASSO 2: Corrigir tipos de atividades rapidamente
UPDATE activity_types SET supports_gps = false WHERE name IN (
  'Musculação', 'Yoga', 'Pilates', 'Crossfit', 'Aeróbica', 'Zumba', 
  'Spinning', 'Alongamento', 'Meditação', 'Funcional', 'TRX', 'Natação Intensa', 'Boxe'
) AND is_active = true;

UPDATE activity_types SET supports_gps = true WHERE name IN (
  'Corrida', 'Caminhada', 'Ciclismo', 'Trilha'
) AND is_active = true;

-- PASSO 3: Verificar se corrigiu
SELECT name, supports_gps FROM activity_types WHERE is_active = true ORDER BY supports_gps, name;

-- PASSO 4: Criar função simples de cálculo
CREATE OR REPLACE FUNCTION calculate_simple_suor(
  activity_type_id UUID,
  duration_minutes INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  base_rate INTEGER;
  result INTEGER;
BEGIN
  SELECT base_suor_per_minute INTO base_rate
  FROM activity_types 
  WHERE id = activity_type_id;
  
  result := COALESCE(base_rate, 5) * duration_minutes;
  
  RETURN GREATEST(result, 0);
END;
$$ LANGUAGE plpgsql;

-- PASSO 5: Criar trigger simples
CREATE OR REPLACE FUNCTION simple_suor_trigger()
RETURNS TRIGGER AS $$
DECLARE
  calculated_suor INTEGER;
BEGIN
  IF NEW.status = 'completed' AND NEW.duration_minutes > 0 THEN
    calculated_suor := calculate_simple_suor(NEW.activity_type_id, NEW.duration_minutes);
    
    NEW.suor_earned := calculated_suor;
    
    -- Atualizar profile
    UPDATE profiles 
    SET current_suor = current_suor + calculated_suor,
        total_suor = total_suor + calculated_suor
    WHERE id = NEW.user_id;
    
    -- Criar transação
    INSERT INTO suor_transactions (user_id, type, source, amount, activity_id, description, created_at)
    VALUES (NEW.user_id, 'earned', 'activity', calculated_suor, NEW.id, 
            'Atividade: ' || NEW.title, NOW());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASSO 6: Aplicar trigger
CREATE TRIGGER simple_suor_calculation
  BEFORE UPDATE ON activities
  FOR EACH ROW 
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION simple_suor_trigger();

-- PASSO 7: Teste rápido
SELECT 'TESTE: Verificar se funciona' as status;

-- Descomente a linha abaixo para testar:
-- INSERT INTO activities (user_id, activity_type_id, title, duration_minutes, status, created_at, updated_at) 
-- VALUES ((SELECT id FROM profiles LIMIT 1), (SELECT id FROM activity_types WHERE name ILIKE '%musculação%' LIMIT 1), 'Teste', 30, 'completed', NOW(), NOW());

-- ========================================
-- INSTRUÇÕES FINAIS:
-- ========================================
-- 1. Execute este script no Supabase SQL Editor
-- 2. Teste criando uma atividade manual no frontend  
-- 3. Verifique se SUOR é gerado corretamente
-- ========================================