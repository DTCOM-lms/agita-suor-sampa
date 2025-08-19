-- 🎯 CONFIGURAÇÃO DOS EVENTOS (SEM VERIFICAÇÃO ADMIN)
-- Execute este script no SQL Editor do Supabase

-- ====================================
-- 1. LIMPEZA COMPLETA
-- ====================================

-- Remover tudo se existir
DROP TABLE IF EXISTS event_participants CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TYPE IF EXISTS participation_status CASCADE;
DROP TYPE IF EXISTS event_status CASCADE;
DROP TYPE IF EXISTS event_category CASCADE;
DROP TYPE IF EXISTS event_type CASCADE;

-- ====================================
-- 2. CRIAR TIPOS E ENUMS
-- ====================================

-- Tipos de eventos
CREATE TYPE event_type AS ENUM (
  'caminhada', 'corrida', 'ciclismo', 'yoga', 'meditacao', 
  'treino_funcional', 'danca', 'esporte_coletivo', 'outro'
);

-- Categorias de eventos
CREATE TYPE event_category AS ENUM (
  'saude_bem_estar', 'esporte', 'social', 'educativo', 
  'sustentabilidade', 'cultura', 'outro'
);

-- Status dos eventos
CREATE TYPE event_status AS ENUM (
  'draft', 'published', 'registration_open', 'registration_closed', 
  'active', 'completed', 'cancelled'
);

-- Status de participação
CREATE TYPE participation_status AS ENUM (
  'registered', 'confirmed', 'checked_in', 'completed', 'cancelled'
);

-- ====================================
-- 3. CRIAR TABELA DE EVENTOS
-- ====================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  -- Tipo e categoria
  type event_type NOT NULL,
  category event_category NOT NULL,
  status event_status DEFAULT 'draft',
  
  -- Datas e horários
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  
  -- Localização
  location geometry(POINT, 4326) NOT NULL,
  location_name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100) DEFAULT 'São Paulo',
  neighborhood VARCHAR(100),
  
  -- Capacidade e participantes
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  
  -- Recompensas
  suor_reward DECIMAL(8,2) DEFAULT 0,
  checkin_suor_reward DECIMAL(6,2) DEFAULT 0,
  
  -- Organizador
  organizer_id UUID REFERENCES profiles(id) NOT NULL,
  organizer_name VARCHAR(255) NOT NULL,
  
  -- Mídia
  image_urls JSONB,
  qr_code_url TEXT,
  
  -- Configurações
  requires_registration BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  tags JSONB,
  requirements JSONB,
  schedule JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 4. CRIAR TABELA DE PARTICIPANTES
-- ====================================

CREATE TABLE event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  
  status participation_status DEFAULT 'registered',
  
  -- Check-in
  checked_in BOOLEAN DEFAULT false,
  checkin_time TIMESTAMP WITH TIME ZONE,
  checkin_location geometry(POINT, 4326),
  
  -- Recompensas
  suor_earned DECIMAL(8,2) DEFAULT 0,
  
  -- Feedback
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(event_id, user_id)
);

-- ====================================
-- 5. CRIAR ÍNDICES
-- ====================================

-- Índice espacial para localização
CREATE INDEX idx_events_location ON events USING GIST (location);

-- Índices para consultas comuns
CREATE INDEX idx_events_status ON events (status);
CREATE INDEX idx_events_start_date ON events (start_date);
CREATE INDEX idx_events_city ON events (city);
CREATE INDEX idx_events_type ON events (type);
CREATE INDEX idx_events_organizer ON events (organizer_id);

-- Índices para participantes
CREATE INDEX idx_event_participants_event ON event_participants (event_id);
CREATE INDEX idx_event_participants_user ON event_participants (user_id);
CREATE INDEX idx_event_participants_status ON event_participants (status);

-- ====================================
-- 6. CRIAR FUNÇÕES E TRIGGERS
-- ====================================

-- Função para atualizar contador de participantes
CREATE OR REPLACE FUNCTION update_event_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events 
    SET current_participants = current_participants + 1
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events 
    SET current_participants = current_participants - 1
    WHERE id = OLD.event_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Se mudou o status para cancelled, decrementar
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
      UPDATE events 
      SET current_participants = current_participants - 1
      WHERE id = NEW.event_id;
    -- Se mudou de cancelled para outro status, incrementar
    ELSIF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
      UPDATE events 
      SET current_participants = current_participants + 1
      WHERE id = NEW.event_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contador automaticamente
CREATE TRIGGER trigger_update_event_participants_count
  AFTER INSERT OR UPDATE OR DELETE ON event_participants
  FOR EACH ROW EXECUTE FUNCTION update_event_participants_count();

-- ====================================
-- 7. CRIAR POLÍTICAS RLS (CORRIGIDAS)
-- ====================================

-- Habilitar RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- Políticas para eventos (CORRIGIDAS)
CREATE POLICY "Eventos são visíveis para todos os usuários autenticados"
ON events FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Usuários autenticados podem criar eventos"
ON events FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuários podem editar eventos que criaram"
ON events FOR UPDATE
TO authenticated
USING (organizer_id = auth.uid())
WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Usuários podem deletar eventos que criaram"
ON events FOR DELETE
TO authenticated
USING (organizer_id = auth.uid());

-- Políticas para participantes (CORRIGIDAS)
CREATE POLICY "Usuários podem ver suas próprias participações"
ON event_participants FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Usuários podem se inscrever em eventos"
ON event_participants FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar suas próprias participações"
ON event_participants FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ====================================
-- 8. DADOS DE EXEMPLO (SEM VERIFICAÇÃO ADMIN)
-- ====================================

-- Primeiro, vamos pegar um usuário qualquer da tabela profiles
DO $$
DECLARE
  sample_user_id UUID;
BEGIN
  -- Pegar o primeiro usuário disponível
  SELECT id INTO sample_user_id FROM profiles LIMIT 1;
  
  -- Se não houver usuários, criar um evento sem organizador específico
  IF sample_user_id IS NULL THEN
    RAISE NOTICE 'Nenhum usuário encontrado na tabela profiles';
  ELSE
    -- Inserir eventos de exemplo
    INSERT INTO events (
      name, description, type, category, status, 
      start_date, end_date, location, location_name, address,
      max_participants, suor_reward, organizer_id, organizer_name,
      tags, requirements
    ) VALUES 
    (
      'Caminhada Coletiva - Paulista',
      'Venha participar da nossa caminhada coletiva na Avenida Paulista! Uma manhã de exercício e socialização.',
      'caminhada',
      'saude_bem_estar',
      'published',
      '2024-12-28 07:00:00+00',
      '2024-12-28 09:00:00+00',
      ST_SetSRID(ST_MakePoint(-46.6551, -23.5631), 4326),
      'Avenida Paulista',
      'Av. Paulista, São Paulo - SP',
      100,
      50,
      sample_user_id,
      'Prefeitura de São Paulo',
      '["saude", "social", "paulista"]',
      '{"age_min": 16, "health_conditions": "Consultar médico se necessário"}'
    ),
    (
      'Pedalada Sustentável - Ciclovia Tietê',
      'Pedalada coletiva pela sustentabilidade! Vamos promover o uso da bicicleta como meio de transporte.',
      'ciclismo',
      'sustentabilidade',
      'published',
      '2024-12-30 08:30:00+00',
      '2024-12-30 11:00:00+00',
      ST_SetSRID(ST_MakePoint(-46.6333, -23.5505), 4326),
      'Ciclovia Tietê',
      'Marginal Tietê, São Paulo - SP',
      200,
      75,
      sample_user_id,
      'EcoSP',
      '["sustentabilidade", "ciclismo", "tietê"]',
      '{"age_min": 14, "equipment": "Bicicleta e capacete obrigatórios"}'
    ),
    (
      'Yoga no Parque Villa-Lobos',
      'Sessão de yoga ao ar livre no Parque Villa-Lobos. Conecte-se com a natureza e pratique mindfulness.',
      'yoga',
      'saude_bem_estar',
      'published',
      '2024-12-22 06:00:00+00',
      '2024-12-22 07:30:00+00',
      ST_SetSRID(ST_MakePoint(-46.7222, -23.5465), 4326),
      'Parque Villa-Lobos',
      'Av. Prof. Fonseca Rodrigues, 2001, São Paulo - SP',
      50,
      30,
      sample_user_id,
      'Vida Saudável',
      '["yoga", "meditacao", "parque", "bem_estar"]',
      '{"age_min": 12, "equipment": "Tapete de yoga (opcional)"}'
    );
    
    RAISE NOTICE 'Eventos de exemplo criados com sucesso usando usuário ID: %', sample_user_id;
  END IF;
END $$;

-- ====================================
-- 9. VERIFICAÇÃO FINAL
-- ====================================

-- Verificar se as tabelas foram criadas
SELECT 
  table_name,
  row_count
FROM (
  SELECT 'events' as table_name, COUNT(*) as row_count FROM events
  UNION ALL
  SELECT 'event_participants' as table_name, COUNT(*) as row_count FROM event_participants
) t;

-- Verificar tipos criados
SELECT typname, typtype 
FROM pg_type 
WHERE typname IN ('event_type', 'event_category', 'event_status', 'participation_status');

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('events', 'event_participants');

-- ====================================
-- 10. MENSAGEM DE SUCESSO
-- ====================================

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 SISTEMA DE EVENTOS CONFIGURADO COM SUCESSO!';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Tabelas criadas: events, event_participants';
  RAISE NOTICE '✅ Tipos e enums criados';
  RAISE NOTICE '✅ Índices de performance criados';
  RAISE NOTICE '✅ Funções e triggers criados';
  RAISE NOTICE '✅ Políticas RLS configuradas (corrigidas)';
  RAISE NOTICE '✅ Dados de exemplo inseridos (sem verificação admin)';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Próximo passo: Executar EVENTS_RPC_FUNCTIONS.sql';
  RAISE NOTICE '';
END $$;
