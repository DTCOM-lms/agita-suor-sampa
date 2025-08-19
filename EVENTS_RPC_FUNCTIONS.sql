-- 🎯 FUNÇÕES RPC PARA O SISTEMA DE EVENTOS (CORRIGIDAS)
-- Execute este script no SQL Editor do Supabase

-- ====================================
-- 1. FUNÇÃO PARA BUSCAR EVENTOS PRÓXIMOS
-- ====================================

CREATE OR REPLACE FUNCTION get_nearby_events(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  type event_type,
  category event_category,
  status event_status,
  start_date timestamptz,
  end_date timestamptz,
  location geometry,
  location_name text,
  address text,
  city text,
  neighborhood text,
  max_participants integer,
  current_participants integer,
  suor_reward decimal,
  checkin_suor_reward decimal,
  organizer_id uuid,
  organizer_name text,
  is_featured boolean,
  tags jsonb,
  requirements jsonb,
  created_at timestamptz,
  distance_km double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name::text,
    e.description::text,
    e.type,
    e.category,
    e.status,
    e.start_date,
    e.end_date,
    e.location,
    e.location_name::text,
    e.address::text,
    e.city::text,
    e.neighborhood::text,
    e.max_participants,
    e.current_participants,
    e.suor_reward,
    e.checkin_suor_reward,
    e.organizer_id,
    e.organizer_name::text,
    e.is_featured,
    e.tags,
    e.requirements,
    e.created_at,
    ST_Distance(
      e.location::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) / 1000 as distance_km
  FROM events e
  WHERE e.is_active = true
    AND e.status IN ('published', 'registration_open', 'active')
    AND ST_DWithin(
      e.location::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_km * 1000
    )
  ORDER BY distance_km ASC, e.start_date ASC;
END;
$$;

-- ====================================
-- 2. FUNÇÃO PARA ESTATÍSTICAS DOS EVENTOS
-- ====================================

CREATE OR REPLACE FUNCTION get_event_stats()
RETURNS TABLE (
  total_events bigint,
  upcoming_events bigint,
  active_events bigint,
  total_participants bigint,
  events_this_month bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM events WHERE is_active = true) as total_events,
    (SELECT COUNT(*) FROM events 
     WHERE is_active = true 
       AND status IN ('published', 'registration_open')
       AND start_date > NOW()) as upcoming_events,
    (SELECT COUNT(*) FROM events 
     WHERE is_active = true 
       AND status = 'active'
       AND NOW() BETWEEN start_date AND end_date) as active_events,
    (SELECT COALESCE(SUM(current_participants), 0) FROM events WHERE is_active = true) as total_participants,
    (SELECT COUNT(*) FROM events 
     WHERE is_active = true 
       AND EXTRACT(MONTH FROM start_date) = EXTRACT(MONTH FROM NOW())
       AND EXTRACT(YEAR FROM start_date) = EXTRACT(YEAR FROM NOW())) as events_this_month;
END;
$$;

-- ====================================
-- 3. FUNÇÃO PARA BUSCAR EVENTOS POR FILTROS (CORRIGIDA)
-- ====================================

CREATE OR REPLACE FUNCTION search_events(
  search_term text DEFAULT NULL,
  event_type_filter event_type DEFAULT NULL,
  event_category_filter event_category DEFAULT NULL,
  city_filter text DEFAULT NULL,
  featured_filter boolean DEFAULT NULL,
  date_from timestamptz DEFAULT NULL,
  date_to timestamptz DEFAULT NULL,
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  type event_type,
  category event_category,
  status event_status,
  start_date timestamptz,
  end_date timestamptz,
  location geometry,
  location_name text,
  address text,
  city text,
  neighborhood text,
  max_participants integer,
  current_participants integer,
  suor_reward decimal,
  checkin_suor_reward decimal,
  organizer_id uuid,
  organizer_name text,
  is_featured boolean,
  tags jsonb,
  requirements jsonb,
  created_at timestamptz,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_count bigint;
BEGIN
  -- Contar total de eventos que correspondem aos filtros
  SELECT COUNT(*) INTO total_count
  FROM events e
  WHERE e.is_active = true
    AND (search_term IS NULL OR 
         e.name ILIKE '%' || search_term || '%' OR 
         e.description ILIKE '%' || search_term || '%')
    AND (event_type_filter IS NULL OR e.type = event_type_filter)
    AND (event_category_filter IS NULL OR e.category = event_category_filter)
    AND (city_filter IS NULL OR e.city = city_filter)
    AND (featured_filter IS NULL OR e.is_featured = featured_filter)
    AND (date_from IS NULL OR e.start_date >= date_from)
    AND (date_to IS NULL OR e.start_date <= date_to);

  -- Retornar eventos filtrados
  RETURN QUERY
  SELECT 
    e.id,
    e.name::text,
    e.description::text,
    e.type,
    e.category,
    e.status,
    e.start_date,
    e.end_date,
    e.location,
    e.location_name::text,
    e.address::text,
    e.city::text,
    e.neighborhood::text,
    e.max_participants,
    e.current_participants,
    e.suor_reward,
    e.checkin_suor_reward,
    e.organizer_id,
    e.organizer_name::text,
    e.is_featured,
    e.tags,
    e.requirements,
    e.created_at,
    total_count
  FROM events e
  WHERE e.is_active = true
    AND (search_term IS NULL OR 
         e.name ILIKE '%' || search_term || '%' OR 
         e.description ILIKE '%' || search_term || '%')
    AND (event_type_filter IS NULL OR e.type = event_type_filter)
    AND (event_category_filter IS NULL OR e.category = event_category_filter)
    AND (city_filter IS NULL OR e.city = city_filter)
    AND (featured_filter IS NULL OR e.is_featured = featured_filter)
    AND (date_from IS NULL OR e.start_date >= date_from)
    AND (date_to IS NULL OR e.start_date <= date_to)
  ORDER BY e.start_date ASC, e.is_featured DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- ====================================
-- 4. FUNÇÃO PARA VERIFICAR PARTICIPAÇÃO DO USUÁRIO
-- ====================================

CREATE OR REPLACE FUNCTION get_user_event_participation(
  user_id_input uuid,
  event_id_input uuid
)
RETURNS TABLE (
  id uuid,
  event_id uuid,
  user_id uuid,
  status participation_status,
  checked_in boolean,
  checkin_time timestamptz,
  suor_earned decimal,
  rating integer,
  feedback text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ep.id,
    ep.event_id,
    ep.user_id,
    ep.status,
    ep.checked_in,
    ep.checkin_time,
    ep.suor_earned,
    ep.rating,
    ep.feedback::text,
    ep.created_at
  FROM event_participants ep
  WHERE ep.user_id = user_id_input
    AND ep.event_id = event_id_input;
END;
$$;

-- ====================================
-- 5. FUNÇÃO PARA ATUALIZAR CONTADOR DE PARTICIPANTES
-- ====================================

CREATE OR REPLACE FUNCTION update_event_participants_count_manual()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar contador de participantes para todos os eventos
  UPDATE events 
  SET current_participants = (
    SELECT COUNT(*) 
    FROM event_participants ep 
    WHERE ep.event_id = events.id 
      AND ep.status != 'cancelled'
  );
END;
$$;

-- ====================================
-- 6. VERIFICAÇÃO DAS FUNÇÕES
-- ====================================

-- Verificar se as funções foram criadas
SELECT 
  proname as function_name,
  prosrc as source
FROM pg_proc 
WHERE proname IN (
  'get_nearby_events',
  'get_event_stats', 
  'search_events',
  'get_user_event_participation',
  'update_event_participants_count_manual'
);

-- Testar função de estatísticas
SELECT * FROM get_event_stats();

-- Testar função de busca (sem filtros)
SELECT * FROM search_events(limit_count := 5);

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 FUNÇÕES RPC DOS EVENTOS CRIADAS COM SUCESSO!';
  RAISE NOTICE '';
  RAISE NOTICE '✅ get_nearby_events() - Busca eventos próximos por localização';
  RAISE NOTICE '✅ get_event_stats() - Estatísticas gerais dos eventos';
  RAISE NOTICE '✅ search_events() - Busca avançada com filtros (CORRIGIDA)';
  RAISE NOTICE '✅ get_user_event_participation() - Verifica participação do usuário';
  RAISE NOTICE '✅ update_event_participants_count_manual() - Atualiza contadores';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Correções aplicadas:';
  RAISE NOTICE '   - Tipos VARCHAR convertidos para text usando ::text';
  RAISE NOTICE '   - Compatibilidade de tipos resolvida';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Próximo passo: Testar as funções com dados reais';
  RAISE NOTICE '';
END $$;
