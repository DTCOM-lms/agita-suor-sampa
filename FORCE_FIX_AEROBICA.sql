-- ========================================
-- CORREÇÃO FORÇADA: AERÓBICA MANUAL
-- Script direto para resolver o problema específico
-- ========================================

-- 1. DIAGNOSTICAR o problema atual
SELECT 
  '🔍 DIAGNÓSTICO AERÓBICA' as status,
  name,
  supports_gps,
  base_suor_per_minute,
  intensity_multiplier,
  is_active,
  id
FROM activity_types 
WHERE name ILIKE '%aeróbica%' 
   OR name ILIKE '%aerobica%'
   OR name = 'Aeróbica'
   OR name = 'Aerobica';

-- 2. FORÇAR correção da Aeróbica
UPDATE activity_types 
SET 
  supports_gps = false,
  updated_at = NOW()
WHERE name ILIKE '%aeróbica%' 
   OR name ILIKE '%aerobica%'
   OR name = 'Aeróbica'
   OR name = 'Aerobica';

-- 3. VERIFICAR se a correção funcionou
SELECT 
  '✅ PÓS-CORREÇÃO AERÓBICA' as status,
  name,
  supports_gps,
  base_suor_per_minute,
  CASE 
    WHEN supports_gps = false THEN '✅ CORRETO (Manual)'
    WHEN supports_gps = true THEN '❌ ERRO (Ainda GPS)'
    ELSE '⚠️ NULL'
  END as resultado
FROM activity_types 
WHERE name ILIKE '%aeróbica%' 
   OR name ILIKE '%aerobica%';

-- 4. CORRIGIR TODAS as atividades indoor de uma vez
UPDATE activity_types 
SET supports_gps = false
WHERE 
  is_active = true
  AND (
    -- Por nome específico
    name IN (
      'Musculação', 'Yoga', 'Pilates', 'Crossfit', 
      'Aeróbica', 'Aerobica', 'Zumba', 'Spinning',
      'Alongamento', 'Meditação', 'Funcional', 'TRX',
      'Boxe', 'Muay Thai', 'Academia', 'Ginástica',
      'Dança', 'Ballet', 'Natação Intensa'
    )
    -- Por categoria
    OR category IN ('strength', 'flexibility', 'indoor')
    -- Por padrão no nome
    OR name ILIKE '%musculação%'
    OR name ILIKE '%academia%'
    OR name ILIKE '%ginástica%'
    OR name ILIKE '%indoor%'
    OR name ILIKE '%pilates%'
    OR name ILIKE '%yoga%'
    OR name ILIKE '%aeróbica%'
    OR name ILIKE '%aerobica%'
  );

-- 5. GARANTIR que atividades outdoor sejam GPS
UPDATE activity_types 
SET supports_gps = true
WHERE 
  is_active = true
  AND (
    name IN (
      'Corrida', 'Caminhada', 'Ciclismo', 'Trilha',
      'Escalada', 'Surf', 'Stand Up Paddle'
    )
    OR category IN ('cardio', 'outdoor', 'running', 'cycling')
    OR name ILIKE '%corrida%'
    OR name ILIKE '%caminhada%'
    OR name ILIKE '%ciclismo%'
    OR name ILIKE '%trilha%'
  );

-- 6. RESULTADO FINAL - Ver todas as atividades organizadas
SELECT 
  '📊 RESULTADO FINAL' as status,
  CASE 
    WHEN supports_gps = false THEN '⏱️ MANUAL'
    WHEN supports_gps = true THEN '📍 GPS'
    ELSE '❓ INDEFINIDO'
  END as tipo,
  name,
  supports_gps,
  base_suor_per_minute
FROM activity_types 
WHERE is_active = true
ORDER BY supports_gps, name;

-- 7. CONTAGEM por tipo
SELECT 
  '📈 ESTATÍSTICAS' as status,
  supports_gps,
  COUNT(*) as total_atividades,
  CASE 
    WHEN supports_gps = false THEN '⏱️ ATIVIDADES MANUAIS'
    WHEN supports_gps = true THEN '📍 ATIVIDADES GPS'
    ELSE '❓ INDEFINIDAS'
  END as descricao
FROM activity_types 
WHERE is_active = true
GROUP BY supports_gps
ORDER BY supports_gps;

-- 8. TESTE específico da função RPC
SELECT 
  '🧪 TESTE RPC' as status;

-- Testar busca da Aeróbica via RPC
SELECT 
  name,
  supports_gps,
  base_suor_per_minute,
  CASE 
    WHEN supports_gps = false THEN '✅ SERÁ MANUAL'
    WHEN supports_gps = true THEN '❌ SERÁ GPS (ERRO!)'
  END as resultado_esperado
FROM get_activity_type_by_name_or_id('aeróbica');

-- ========================================
-- COMANDOS PARA TESTAR NO FRONTEND
-- ========================================

-- Após executar este script:
-- 1. Abra o DevTools (F12) → Console
-- 2. Execute: localStorage.clear()
-- 3. Recarregue a página (F5)  
-- 4. Vá para atividade Aeróbica
-- 5. Verifique os logs:
--    ✅ supports_gps: false
--    ✅ requiresGPS: false  
--    ✅ "VAI USAR TIMER MANUAL"
--    ✅ Botão: "Iniciar Timer"

-- ========================================
-- SE AINDA NÃO FUNCIONAR:
-- ========================================

-- Execute no console do DevTools:
-- console.log('🔍 Cache TanStack Query:', window.queryCache);
-- localStorage.clear();
-- window.location.reload();

-- ========================================