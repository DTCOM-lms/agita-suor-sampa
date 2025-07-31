-- ============================================
-- CHECK RPC FUNCTIONS SIMPLE - Verificação Básica
-- ============================================

-- 1. Verificar se as funções RPC existem
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_name IN ('create_activity_with_location', 'update_activity_with_end_location', 'create_social_post_with_location')
  AND routine_schema = 'public'
ORDER BY routine_name;

-- 2. Verificar tipos das colunas de localização  
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns 
WHERE table_name IN ('activities', 'social_posts')
  AND column_name IN ('start_location', 'end_location', 'location')
  AND table_schema = 'public'
ORDER BY table_name, column_name;

-- 3. Verificar dados básicos
SELECT COUNT(*) as total_activities FROM activities;
SELECT COUNT(*) as total_activity_types FROM activity_types;

-- 4. Verificar activity_types específicos
SELECT id, name, supports_gps 
FROM activity_types 
WHERE name ILIKE '%aeróbica%' OR name ILIKE '%corrida%' 
LIMIT 3;