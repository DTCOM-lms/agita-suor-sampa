-- ============================================
-- FIX GEOMETRY COORDINATES - Agita v0.2.7
-- ============================================
-- Corrige problemas de inserção de coordenadas geoespaciais
-- para campos geometry do PostgreSQL/PostGIS

-- 1. Criar função RPC para inserir atividades com localização
CREATE OR REPLACE FUNCTION create_activity_with_location(
  p_user_id UUID,
  p_title TEXT,
  p_activity_type_id UUID,
  p_start_time TIMESTAMPTZ,
  p_longitude FLOAT,
  p_latitude FLOAT,
  p_description TEXT DEFAULT NULL,
  p_suor_earned INTEGER DEFAULT 0,
  p_is_public BOOLEAN DEFAULT true,
  p_status TEXT DEFAULT 'active'
)
RETURNS SETOF activities AS $$
BEGIN
  RETURN QUERY
  INSERT INTO activities (
    user_id,
    title,
    description,
    activity_type_id,
    started_at,
    start_time,
    start_location,
    suor_earned,
    is_public,
    status,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_title,
    p_description,
    p_activity_type_id,
    p_start_time,
    p_start_time,
    ST_Point(p_longitude, p_latitude)::point, -- Cast para tipo point
    p_suor_earned,
    p_is_public,
    p_status::activity_status,
    NOW(),
    NOW()
  )
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar função RPC para atualizar atividades com localização final
CREATE OR REPLACE FUNCTION update_activity_with_end_location(
  p_activity_id UUID,
  p_user_id UUID,
  p_end_time TIMESTAMPTZ,
  p_longitude FLOAT DEFAULT NULL,
  p_latitude FLOAT DEFAULT NULL,
  p_duration_minutes INTEGER DEFAULT NULL,
  p_distance_km FLOAT DEFAULT NULL,
  p_gps_route JSONB DEFAULT NULL,
  p_suor_earned INTEGER DEFAULT NULL,
  p_status TEXT DEFAULT 'completed'
)
RETURNS SETOF activities AS $$
BEGIN
  RETURN QUERY
  UPDATE activities 
  SET 
    end_time = p_end_time,
    ended_at = p_end_time,
    end_location = CASE 
      WHEN p_longitude IS NOT NULL AND p_latitude IS NOT NULL 
      THEN ST_Point(p_longitude, p_latitude)::point
      ELSE end_location 
    END,
    duration_minutes = COALESCE(p_duration_minutes, duration_minutes),
    distance_km = COALESCE(p_distance_km, distance_km),
    gps_route = COALESCE(p_gps_route, gps_route),
    suor_earned = COALESCE(p_suor_earned, suor_earned),
    status = p_status::activity_status,
    updated_at = NOW()
  WHERE id = p_activity_id 
    AND user_id = p_user_id
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar função RPC para inserir social posts com localização
CREATE OR REPLACE FUNCTION create_social_post_with_location(
  p_user_id UUID,
  p_post_type TEXT,
  p_longitude FLOAT,
  p_latitude FLOAT,
  p_activity_id UUID DEFAULT NULL,
  p_content TEXT DEFAULT NULL,
  p_media_urls TEXT[] DEFAULT NULL,
  p_visibility TEXT DEFAULT 'public'
)
RETURNS SETOF social_posts AS $$
BEGIN
  RETURN QUERY
  INSERT INTO social_posts (
    user_id,
    activity_id,
    content,
    post_type,
    media_urls,
    visibility,
    location,
    likes_count,
    comments_count,
    shares_count,
    is_pinned,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_activity_id,
    p_content,
    p_post_type::post_type,
    p_media_urls,
    p_visibility::post_visibility,
    ST_Point(p_longitude, p_latitude)::point, -- Cast para tipo point
    0,
    0,
    0,
    false,
    NOW(),
    NOW()
  )
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Verificar se as funções foram criadas
SELECT 
  routine_name,
  routine_type,
  specific_name
FROM information_schema.routines 
WHERE routine_name IN ('create_activity_with_location', 'update_activity_with_end_location', 'create_social_post_with_location')
  AND routine_schema = 'public';

-- 5. Testar inserção (descomente para testar)
/*
-- Teste básico da função (substitua pelos IDs reais)
SELECT * FROM create_activity_with_location(
  'user-id-aqui'::UUID,        -- p_user_id
  'Teste de Corrida',          -- p_title  
  'activity-type-id-aqui'::UUID, -- p_activity_type_id
  NOW(),                       -- p_start_time
  -46.6333,                    -- p_longitude (São Paulo)
  -23.5505,                    -- p_latitude (São Paulo)
  'Atividade de teste',        -- p_description (opcional)
  0,                           -- p_suor_earned (opcional)
  true,                        -- p_is_public (opcional)
  'active'                     -- p_status (opcional)
);
*/

-- ✅ SUCESSO: Funções criadas para inserção segura de geometrias
RAISE NOTICE '🎉 SUCESSO: Funções PostGIS criadas para coordenadas geoespaciais!';
RAISE NOTICE '📍 create_activity_with_location() - Criar atividade com localização';
RAISE NOTICE '📍 update_activity_with_end_location() - Atualizar com localização final';
RAISE NOTICE '📍 create_social_post_with_location() - Criar post social com localização';
RAISE NOTICE '🔧 Frontend agora usa RPC calls para evitar erros de geometry';
RAISE NOTICE '⚠️ EXECUTE ESTE SCRIPT NO SUPABASE ANTES DE TESTAR O FRONTEND!';