-- ========================================
-- DEBUG: PROBLEMA COM ATIVIDADE AERÓBICA
-- Verificar por que não está sendo detectada como manual
-- ========================================

-- 1. Verificar se Aeróbica existe e seus dados
SELECT 
  'VERIFICAÇÃO AERÓBICA' as status,
  id,
  name,
  supports_gps,
  base_suor_per_minute,
  intensity_multiplier,
  is_active,
  category
FROM activity_types 
WHERE name ILIKE '%aeróbica%' OR name ILIKE '%aerobica%';

-- 2. Verificar todas as atividades e seu supports_gps
SELECT 
  'TODAS AS ATIVIDADES' as status,
  name,
  supports_gps,
  base_suor_per_minute,
  is_active
FROM activity_types 
WHERE is_active = true
ORDER BY supports_gps DESC, name;

-- 3. Contar por supports_gps
SELECT 
  'CONTAGEM POR TIPO' as status,
  supports_gps,
  COUNT(*) as total
FROM activity_types 
WHERE is_active = true
GROUP BY supports_gps;

-- 4. Forçar correção da Aeróbica especificamente
UPDATE activity_types 
SET supports_gps = false 
WHERE name ILIKE '%aeróbica%' 
   OR name ILIKE '%aerobica%'
   OR name = 'Aeróbica'
   OR name = 'Aerobica';

-- 5. Verificar se a correção funcionou
SELECT 
  'APÓS CORREÇÃO AERÓBICA' as status,
  name,
  supports_gps,
  base_suor_per_minute
FROM activity_types 
WHERE name ILIKE '%aeróbica%' OR name ILIKE '%aerobica%';

-- 6. Corrigir TODAS as atividades que deveriam ser manuais
UPDATE activity_types 
SET supports_gps = false 
WHERE (
  name IN (
    'Musculação', 'Yoga', 'Pilates', 'Crossfit', 'Aeróbica', 'Aerobica',
    'Zumba', 'Spinning', 'Alongamento', 'Meditação', 'Funcional',
    'TRX', 'Boxe', 'Muay Thai', 'Jiu-Jitsu', 'Karatê', 'Judô',
    'Taekwondo', 'Academia', 'Ginástica', 'Dança', 'Ballet',
    'Natação em Piscina', 'Natação Intensa'
  )
  OR category IN ('strength', 'flexibility', 'indoor')
  OR name ILIKE '%academia%'
  OR name ILIKE '%indoor%'
  OR name ILIKE '%ginástica%'
) AND is_active = true;

-- 7. Garantir que atividades outdoor sejam GPS
UPDATE activity_types 
SET supports_gps = true 
WHERE (
  name IN (
    'Corrida', 'Caminhada', 'Ciclismo', 'Trilha', 'Escalada',
    'Surf', 'Stand Up Paddle', 'Skate', 'Patins'
  )
  OR category IN ('cardio', 'outdoor', 'cycling', 'running')
  OR name ILIKE '%corrida%'
  OR name ILIKE '%ciclismo%'
  OR name ILIKE '%caminhada%'
) AND is_active = true;

-- 8. Resultado final
SELECT 
  'RESULTADO FINAL' as status,
  supports_gps,
  COUNT(*) as total,
  string_agg(name, ', ') as atividades
FROM activity_types 
WHERE is_active = true
GROUP BY supports_gps
ORDER BY supports_gps;

-- 9. Testar função RPC com Aeróbica
SELECT 'TESTE RPC AERÓBICA' as status;
SELECT * FROM get_activity_type_by_name_or_id('aeróbica') LIMIT 1;

-- ========================================
-- COMANDOS PARA VERIFICAR NO FRONTEND
-- ========================================

-- Depois de executar este script, no frontend:
-- 1. Abra DevTools (F12) → Console
-- 2. Vá para atividade Aeróbica
-- 3. Verifique o log:
--    🔍 ActivityTracking Debug: { supports_gps: false } ← DEVE SER FALSE

-- Se ainda aparecer supports_gps: true, o problema é no frontend
-- Se aparecer supports_gps: false mas ainda ativar GPS, é lógica do frontend

-- ========================================