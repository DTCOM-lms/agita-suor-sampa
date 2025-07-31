-- ============================================
-- CHECK RPC FUNCTIONS - Verificação de Funções
-- ============================================
-- Verificar se as funções RPC foram criadas corretamente

-- 1. Verificar se as funções existem
SELECT 
  routine_name,
  routine_type,
  data_type as return_type,
  specific_name
FROM information_schema.routines 
WHERE routine_name IN ('create_activity_with_location', 'update_activity_with_end_location', 'create_social_post_with_location')
  AND routine_schema = 'public'
ORDER BY routine_name;

-- 2. Verificar tipos das colunas de localização  
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('activities', 'social_posts')
  AND column_name IN ('start_location', 'end_location', 'location')
  AND table_schema = 'public'
ORDER BY table_name, column_name;

-- 3. Verificar se existe alguma atividade (para debug)
SELECT COUNT(*) as total_activities FROM activities;

-- 4. Verificar se existe algum activity_type (importante para FK)
SELECT COUNT(*) as total_activity_types FROM activity_types;

-- 5. Verificar um activity_type específico (para teste)
SELECT id, name, supports_gps 
FROM activity_types 
WHERE name ILIKE '%aeróbica%' OR name ILIKE '%corrida%' 
LIMIT 3;

-- ✅ SUCESSO
DO $$
BEGIN
  RAISE NOTICE '🔍 VERIFICAÇÃO COMPLETA - Verifique os resultados acima';
  RAISE NOTICE '📊 Funções RPC, tipos de coluna, e dados de teste listados';
  RAISE NOTICE '⚠️ Se alguma função não aparecer, execute FIX_GEOMETRY_COORDINATES_UNIVERSAL.sql primeiro!';
END $$;