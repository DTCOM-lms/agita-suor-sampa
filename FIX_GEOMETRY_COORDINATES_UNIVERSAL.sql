-- ============================================
-- FIX GEOMETRY COORDINATES UNIVERSAL - Agita v0.2.7
-- ============================================
-- Detecta e corrige problemas de coordenadas automaticamente
-- Funciona tanto para tipo 'point' quanto 'geometry(POINT, 4326)'

-- 1. Verificar tipos atuais das colunas
DO $$
DECLARE
    start_loc_type text;
    end_loc_type text;
    social_loc_type text;
BEGIN
    -- Verificar tipo de start_location na tabela activities
    SELECT data_type, udt_name 
    INTO start_loc_type
    FROM information_schema.columns 
    WHERE table_name = 'activities' 
    AND column_name = 'start_location'
    AND table_schema = 'public';
    
    -- Verificar tipo de end_location na tabela activities
    SELECT data_type, udt_name 
    INTO end_loc_type
    FROM information_schema.columns 
    WHERE table_name = 'activities' 
    AND column_name = 'end_location'
    AND table_schema = 'public';
    
    -- Verificar tipo de location na tabela social_posts
    SELECT data_type, udt_name 
    INTO social_loc_type
    FROM information_schema.columns 
    WHERE table_name = 'social_posts' 
    AND column_name = 'location'
    AND table_schema = 'public';
    
    RAISE NOTICE '🔍 TIPOS DETECTADOS:';
    RAISE NOTICE '📍 activities.start_location: %', COALESCE(start_loc_type, 'NÃO ENCONTRADA');
    RAISE NOTICE '📍 activities.end_location: %', COALESCE(end_loc_type, 'NÃO ENCONTRADA');
    RAISE NOTICE '📍 social_posts.location: %', COALESCE(social_loc_type, 'NÃO ENCONTRADA');
END $$;

-- 2. Função universal para inserir atividades (funciona com point e geometry)
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
DECLARE
    start_loc_type text;
    location_value text;
BEGIN
    -- Detectar tipo da coluna dinamicamente
    SELECT data_type 
    INTO start_loc_type
    FROM information_schema.columns 
    WHERE table_name = 'activities' 
    AND column_name = 'start_location'
    AND table_schema = 'public';
    
    -- Preparar valor de localização baseado no tipo
    IF start_loc_type = 'point' THEN
        -- Para tipo point nativo do PostgreSQL
        location_value := '(' || p_longitude || ',' || p_latitude || ')';
        
        RETURN QUERY EXECUTE format('
            INSERT INTO activities (
                user_id, title, description, activity_type_id,
                started_at, start_time, start_location, suor_earned,
                is_public, status, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, %L::point, $7, $8, $9::activity_status, NOW(), NOW()
            ) RETURNING *', location_value)
            USING p_user_id, p_title, p_description, p_activity_type_id, 
                  p_start_time, p_start_time, p_suor_earned, p_is_public, p_status;
    ELSE
        -- Para tipo geometry (PostGIS)
        RETURN QUERY
        INSERT INTO activities (
            user_id, title, description, activity_type_id,
            started_at, start_time, start_location, suor_earned,
            is_public, status, created_at, updated_at
        ) VALUES (
            p_user_id, p_title, p_description, p_activity_type_id,
            p_start_time, p_start_time, ST_Point(p_longitude, p_latitude),
            p_suor_earned, p_is_public, p_status::activity_status, NOW(), NOW()
        ) RETURNING *;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Função universal para atualizar atividades com localização final
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
DECLARE
    end_loc_type text;
    location_value text;
BEGIN
    -- Detectar tipo da coluna dinamicamente
    SELECT data_type 
    INTO end_loc_type
    FROM information_schema.columns 
    WHERE table_name = 'activities' 
    AND column_name = 'end_location'
    AND table_schema = 'public';
    
    IF p_longitude IS NOT NULL AND p_latitude IS NOT NULL THEN
        IF end_loc_type = 'point' THEN
            -- Para tipo point nativo do PostgreSQL
            location_value := '(' || p_longitude || ',' || p_latitude || ')';
            
            RETURN QUERY EXECUTE format('
                UPDATE activities SET
                    end_time = $1,
                    ended_at = $1,
                    end_location = %L::point,
                    duration_minutes = COALESCE($2, duration_minutes),
                    distance_km = COALESCE($3, distance_km),
                    gps_route = COALESCE($4, gps_route),
                    suor_earned = COALESCE($5, suor_earned),
                    status = $6::activity_status,
                    updated_at = NOW()
                WHERE id = $7 AND user_id = $8
                RETURNING *', location_value)
                USING p_end_time, p_duration_minutes, p_distance_km, p_gps_route, 
                      p_suor_earned, p_status, p_activity_id, p_user_id;
        ELSE
            -- Para tipo geometry (PostGIS)
            RETURN QUERY
            UPDATE activities SET
                end_time = p_end_time,
                ended_at = p_end_time,
                end_location = ST_Point(p_longitude, p_latitude),
                duration_minutes = COALESCE(p_duration_minutes, duration_minutes),
                distance_km = COALESCE(p_distance_km, distance_km),
                gps_route = COALESCE(p_gps_route, gps_route),
                suor_earned = COALESCE(p_suor_earned, suor_earned),
                status = p_status::activity_status,
                updated_at = NOW()
            WHERE id = p_activity_id AND user_id = p_user_id
            RETURNING *;
        END IF;
    ELSE
        -- Atualizar sem localização
        RETURN QUERY
        UPDATE activities SET
            end_time = p_end_time,
            ended_at = p_end_time,
            duration_minutes = COALESCE(p_duration_minutes, duration_minutes),
            distance_km = COALESCE(p_distance_km, distance_km),
            gps_route = COALESCE(p_gps_route, gps_route),
            suor_earned = COALESCE(p_suor_earned, suor_earned),
            status = p_status::activity_status,
            updated_at = NOW()
        WHERE id = p_activity_id AND user_id = p_user_id
        RETURNING *;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Função universal para social posts com localização
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
DECLARE
    social_loc_type text;
    location_value text;
BEGIN
    -- Detectar tipo da coluna dinamicamente
    SELECT data_type 
    INTO social_loc_type
    FROM information_schema.columns 
    WHERE table_name = 'social_posts' 
    AND column_name = 'location'
    AND table_schema = 'public';
    
    -- Preparar valor de localização baseado no tipo
    IF social_loc_type = 'point' THEN
        -- Para tipo point nativo do PostgreSQL
        location_value := '(' || p_longitude || ',' || p_latitude || ')';
        
        RETURN QUERY EXECUTE format('
            INSERT INTO social_posts (
                user_id, activity_id, content, post_type, media_urls,
                visibility, location, likes_count, comments_count,
                shares_count, is_pinned, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4::post_type, $5, $6::post_visibility,
                %L::point, 0, 0, 0, false, NOW(), NOW()
            ) RETURNING *', location_value)
            USING p_user_id, p_activity_id, p_content, p_post_type, 
                  p_media_urls, p_visibility;
    ELSE
        -- Para tipo geometry (PostGIS)
        RETURN QUERY
        INSERT INTO social_posts (
            user_id, activity_id, content, post_type, media_urls,
            visibility, location, likes_count, comments_count,
            shares_count, is_pinned, created_at, updated_at
        ) VALUES (
            p_user_id, p_activity_id, p_content, p_post_type::post_type,
            p_media_urls, p_visibility::post_visibility,
            ST_Point(p_longitude, p_latitude), 0, 0, 0, false, NOW(), NOW()
        ) RETURNING *;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Verificar se as funções foram criadas
SELECT 
  routine_name,
  routine_type,
  specific_name
FROM information_schema.routines 
WHERE routine_name IN ('create_activity_with_location', 'update_activity_with_end_location', 'create_social_post_with_location')
  AND routine_schema = 'public';

-- 6. Testar inserção básica (descomente para testar)
/*
-- Teste com coordenadas de São Paulo
SELECT 'Testando função create_activity_with_location...' as status;

-- Substitua pelos IDs reais do seu projeto
SELECT * FROM create_activity_with_location(
  '00000000-0000-0000-0000-000000000000'::UUID,  -- p_user_id (substitua por ID real)
  'Teste Universal',                              -- p_title
  '00000000-0000-0000-0000-000000000000'::UUID,  -- p_activity_type_id (substitua por ID real)
  NOW(),                                          -- p_start_time
  -46.6333,                                       -- p_longitude (São Paulo)
  -23.5505                                        -- p_latitude (São Paulo)
);
*/

-- ✅ RESULTADO FINAL
RAISE NOTICE '🎉 FUNÇÕES UNIVERSAIS CRIADAS COM SUCESSO!';
RAISE NOTICE '📍 create_activity_with_location() - Detecta tipo automaticamente';
RAISE NOTICE '📍 update_activity_with_end_location() - Compatible com point/geometry';
RAISE NOTICE '📍 create_social_post_with_location() - Universal para ambos tipos';
RAISE NOTICE '⚠️ EXECUTE ESTE SCRIPT NO SUPABASE ANTES DE TESTAR O FRONTEND!';