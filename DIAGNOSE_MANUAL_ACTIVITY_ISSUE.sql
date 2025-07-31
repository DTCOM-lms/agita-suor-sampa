-- ========================================
-- DIAGNÓSTICO: PROBLEMA COM ATIVIDADES MANUAIS
-- Verificar se o banco está configurado corretamente
-- ========================================

-- 1. Verificar se a coluna supports_gps existe
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'activity_types' 
  AND column_name = 'supports_gps';

-- 2. Verificar tipos de atividades e seu supports_gps
SELECT 
  name,
  supports_gps,
  base_suor_per_minute,
  intensity_multiplier,
  is_active
FROM activity_types 
WHERE is_active = true
ORDER BY supports_gps DESC, name;

-- 3. Contar atividades por tipo de GPS
SELECT 
  supports_gps,
  COUNT(*) as total_activities
FROM activity_types 
WHERE is_active = true
GROUP BY supports_gps;

-- 4. Verificar atividades específicas que deveriam ser manuais
SELECT 
  name,
  supports_gps,
  base_suor_per_minute
FROM activity_types 
WHERE name IN (
  'Musculação', 'Yoga', 'Pilates', 'Crossfit',
  'Aeróbica', 'Zumba', 'Spinning', 'Alongamento'
)
AND is_active = true;

-- 5. Verificar se existem atividades ativas no geral
SELECT COUNT(*) as total_active_activities 
FROM activity_types 
WHERE is_active = true;

-- 6. Testar a função de cálculo de SUOR para atividade manual
SELECT 
  name,
  supports_gps,
  calculate_activity_suor_v2(
    id, 
    15, -- 15 minutos
    NULL, -- sem distância
    NULL, -- sem user_id específico
    supports_gps
  ) as calculated_suor_15min
FROM activity_types 
WHERE name = 'Musculação' 
  AND is_active = true
LIMIT 1;

-- 7. Verificar se as funções foram criadas
SELECT 
  proname as function_name,
  proargnames as argument_names
FROM pg_proc 
WHERE proname IN (
  'calculate_activity_suor_v2',
  'calculate_suor_on_activity_completion',
  'test_activity_suor_calculation'
);

-- 8. Verificar triggers
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'activities';

-- 9. Se necessário, corrigir tipos de atividades manualmente
-- DESCOMENTE AS LINHAS ABAIXO SE OS TIPOS NÃO ESTIVEREM CORRETOS:

/*
UPDATE activity_types 
SET supports_gps = false 
WHERE name IN (
  'Musculação', 'Yoga', 'Pilates', 'Crossfit',
  'Aeróbica', 'Zumba', 'Spinning', 'Alongamento',
  'Meditação', 'Funcional', 'TRX', 'Boxe',
  'Muay Thai', 'Jiu-Jitsu', 'Karatê', 'Judô',
  'Taekwondo', 'Academia', 'Ginástica', 'Dança',
  'Ballet', 'Natação em Piscina'
) AND is_active = true;
*/

-- 10. Inserir tipos de atividades manuais se não existirem
-- DESCOMENTE SE NECESSÁRIO:

/*
INSERT INTO activity_types (
  name, description, category, difficulty, 
  base_suor_per_minute, intensity_multiplier, 
  supports_gps, supports_heart_rate, supports_manual_entry,
  min_duration_minutes, max_duration_minutes, is_active
) VALUES 
('Musculação', 'Treinamento com pesos e equipamentos', 'strength', 'medium', 8, 1.2, false, true, true, 15, 120, true),
('Yoga', 'Prática de yoga e alongamento', 'flexibility', 'easy', 4, 0.8, false, false, true, 20, 90, true),
('Pilates', 'Exercícios de pilates', 'flexibility', 'medium', 6, 1.0, false, false, true, 30, 60, true)
ON CONFLICT (name) DO UPDATE SET
  supports_gps = EXCLUDED.supports_gps,
  supports_manual_entry = EXCLUDED.supports_manual_entry;
*/

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================

-- 1. Coluna supports_gps deve existir (boolean, default false)
-- 2. Deve haver atividades com supports_gps = false (manuais)
-- 3. Deve haver atividades com supports_gps = true (GPS)
-- 4. Musculação, Yoga, etc. devem ter supports_gps = false
-- 5. Funções devem existir no banco
-- 6. Trigger deve estar ativo na tabela activities

-- ========================================
-- INSTRUÇÕES:
-- ========================================

-- Execute este script no Supabase SQL Editor
-- Verifique os resultados de cada query
-- Se algo estiver incorreto, descomente e execute as correções