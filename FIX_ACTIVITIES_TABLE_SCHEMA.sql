-- 🚨 FIX: Activities Table Schema Compatibility
-- Data: Janeiro 2025
-- Descrição: Corrige incompatibilidades entre código TypeScript e schema da tabela activities

-- ===============================================
-- 🔧 PROBLEMA: Colunas incompatíveis na tabela activities
-- ===============================================

-- Verificar estrutura atual da tabela activities
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'activities' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ===============================================
-- 🔧 ADICIONANDO COLUNAS FALTANTES
-- ===============================================

DO $$
BEGIN
    -- 1. Adicionar coluna is_public se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'is_public'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE activities 
        ADD COLUMN is_public BOOLEAN DEFAULT true;
        
        RAISE NOTICE 'Coluna is_public adicionada à tabela activities';
    ELSE
        RAISE NOTICE 'Coluna is_public já existe na tabela activities';
    END IF;

    -- 2. Adicionar coluna start_time se não existir (alias para started_at)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'start_time'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE activities 
        ADD COLUMN start_time TIMESTAMP WITH TIME ZONE;
        
        -- Migrar dados de started_at para start_time
        UPDATE activities 
        SET start_time = started_at 
        WHERE start_time IS NULL;
        
        RAISE NOTICE 'Coluna start_time adicionada e sincronizada com started_at';
    ELSE
        RAISE NOTICE 'Coluna start_time já existe na tabela activities';
    END IF;

    -- 3. Adicionar coluna end_time se não existir (alias para ended_at)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'end_time'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE activities 
        ADD COLUMN end_time TIMESTAMP WITH TIME ZONE;
        
        -- Migrar dados de ended_at para end_time
        UPDATE activities 
        SET end_time = ended_at 
        WHERE end_time IS NULL AND ended_at IS NOT NULL;
        
        RAISE NOTICE 'Coluna end_time adicionada e sincronizada com ended_at';
    ELSE
        RAISE NOTICE 'Coluna end_time já existe na tabela activities';
    END IF;

    -- 4. Adicionar outras colunas que o código TypeScript espera
    
    -- average_speed_kmh
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'average_speed_kmh'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE activities 
        ADD COLUMN average_speed_kmh DECIMAL(5,2);
        
        RAISE NOTICE 'Coluna average_speed_kmh adicionada';
    END IF;

    -- heart_rate_avg
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'heart_rate_avg'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE activities 
        ADD COLUMN heart_rate_avg INTEGER;
        
        -- Migrar dados de average_heart_rate se existir
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'activities' 
            AND column_name = 'average_heart_rate'
            AND table_schema = 'public'
        ) THEN
            UPDATE activities 
            SET heart_rate_avg = average_heart_rate 
            WHERE heart_rate_avg IS NULL AND average_heart_rate IS NOT NULL;
        END IF;
        
        RAISE NOTICE 'Coluna heart_rate_avg adicionada e sincronizada';
    END IF;

    -- heart_rate_max
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'heart_rate_max'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE activities 
        ADD COLUMN heart_rate_max INTEGER;
        
        -- Migrar dados de max_heart_rate se existir
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'activities' 
            AND column_name = 'max_heart_rate'
            AND table_schema = 'public'
        ) THEN
            UPDATE activities 
            SET heart_rate_max = max_heart_rate 
            WHERE heart_rate_max IS NULL AND max_heart_rate IS NOT NULL;
        END IF;
        
        RAISE NOTICE 'Coluna heart_rate_max adicionada e sincronizada';
    END IF;

    -- weather_conditions
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'weather_conditions'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE activities 
        ADD COLUMN weather_conditions JSONB;
        
        RAISE NOTICE 'Coluna weather_conditions adicionada';
    END IF;

    -- difficulty_rating
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'difficulty_rating'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE activities 
        ADD COLUMN difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10);
        
        RAISE NOTICE 'Coluna difficulty_rating adicionada';
    END IF;

    -- enjoyment_rating
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'enjoyment_rating'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE activities 
        ADD COLUMN enjoyment_rating INTEGER CHECK (enjoyment_rating >= 1 AND enjoyment_rating <= 10);
        
        RAISE NOTICE 'Coluna enjoyment_rating adicionada';
    END IF;

    -- effort_level
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'effort_level'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE activities 
        ADD COLUMN effort_level INTEGER CHECK (effort_level >= 1 AND effort_level <= 10);
        
        RAISE NOTICE 'Coluna effort_level adicionada';
    END IF;

    -- achievements_earned
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'achievements_earned'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE activities 
        ADD COLUMN achievements_earned TEXT[];
        
        RAISE NOTICE 'Coluna achievements_earned adicionada';
    END IF;

END $$;

-- ===============================================
-- 🔧 CRIAR TRIGGERS PARA SINCRONIZAÇÃO
-- ===============================================

-- Trigger para manter started_at e start_time sincronizados
CREATE OR REPLACE FUNCTION sync_activity_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    -- Sincronizar start_time <-> started_at
    IF NEW.start_time IS NOT NULL AND NEW.start_time != OLD.start_time THEN
        NEW.started_at = NEW.start_time;
    ELSIF NEW.started_at IS NOT NULL AND NEW.started_at != OLD.started_at THEN
        NEW.start_time = NEW.started_at;
    END IF;
    
    -- Sincronizar end_time <-> ended_at
    IF NEW.end_time IS NOT NULL AND NEW.end_time != OLD.end_time THEN
        NEW.ended_at = NEW.end_time;
    ELSIF NEW.ended_at IS NOT NULL AND NEW.ended_at != OLD.ended_at THEN
        NEW.end_time = NEW.ended_at;
    END IF;
    
    -- Sincronizar heart_rate_avg <-> average_heart_rate
    IF NEW.heart_rate_avg IS NOT NULL AND NEW.heart_rate_avg != OLD.heart_rate_avg THEN
        NEW.average_heart_rate = NEW.heart_rate_avg;
    ELSIF NEW.average_heart_rate IS NOT NULL AND NEW.average_heart_rate != OLD.average_heart_rate THEN
        NEW.heart_rate_avg = NEW.average_heart_rate;
    END IF;
    
    -- Sincronizar heart_rate_max <-> max_heart_rate
    IF NEW.heart_rate_max IS NOT NULL AND NEW.heart_rate_max != OLD.heart_rate_max THEN
        NEW.max_heart_rate = NEW.heart_rate_max;
    ELSIF NEW.max_heart_rate IS NOT NULL AND NEW.max_heart_rate != OLD.max_heart_rate THEN
        NEW.heart_rate_max = NEW.max_heart_rate;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS trigger_sync_activity_timestamps ON activities;
CREATE TRIGGER trigger_sync_activity_timestamps
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION sync_activity_timestamps();

-- ===============================================
-- 🔧 AJUSTAR POLÍTICAS RLS SE NECESSÁRIO
-- ===============================================

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'activities' AND schemaname = 'public';

-- Recriar políticas básicas se necessário
DO $$
BEGIN
    -- Política para permitir usuários verem suas próprias atividades
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'activities' 
        AND policyname = 'Users can view own activities'
    ) THEN
        CREATE POLICY "Users can view own activities" ON activities
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    -- Política para permitir usuários criarem atividades
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'activities' 
        AND policyname = 'Users can create own activities'
    ) THEN
        CREATE POLICY "Users can create own activities" ON activities
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    -- Política para permitir usuários atualizarem suas atividades
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'activities' 
        AND policyname = 'Users can update own activities'
    ) THEN
        CREATE POLICY "Users can update own activities" ON activities
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    -- Política para permitir visualização de atividades públicas
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'activities' 
        AND policyname = 'Users can view public activities'
    ) THEN
        CREATE POLICY "Users can view public activities" ON activities
            FOR SELECT USING (is_public = true);
    END IF;
    
    RAISE NOTICE 'Políticas RLS verificadas e criadas se necessário';
END $$;

-- ===============================================
-- 🔧 CRIAR ÍNDICES PARA PERFORMANCE
-- ===============================================

-- Índices essenciais para queries comuns (sem CONCURRENTLY para compatibilidade com transações)
DO $$
BEGIN
    -- Índice para consultas por usuário e data
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'activities' 
        AND indexname = 'idx_activities_user_id_created_at'
    ) THEN
        CREATE INDEX idx_activities_user_id_created_at 
        ON activities(user_id, created_at DESC);
        RAISE NOTICE 'Índice idx_activities_user_id_created_at criado';
    END IF;

    -- Índice para start_time
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'activities' 
        AND indexname = 'idx_activities_start_time'
    ) THEN
        CREATE INDEX idx_activities_start_time 
        ON activities(start_time);
        RAISE NOTICE 'Índice idx_activities_start_time criado';
    END IF;

    -- Índice para atividades públicas
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'activities' 
        AND indexname = 'idx_activities_is_public'
    ) THEN
        CREATE INDEX idx_activities_is_public 
        ON activities(is_public) WHERE is_public = true;
        RAISE NOTICE 'Índice idx_activities_is_public criado';
    END IF;

    -- Índice para status
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'activities' 
        AND indexname = 'idx_activities_status'
    ) THEN
        CREATE INDEX idx_activities_status 
        ON activities(status);
        RAISE NOTICE 'Índice idx_activities_status criado';
    END IF;
END $$;

-- ===============================================
-- 🔧 VERIFICAÇÃO FINAL
-- ===============================================

-- Mostrar estrutura final da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'activities' 
AND table_schema = 'public'
AND column_name IN (
    'is_public', 'start_time', 'end_time', 'average_speed_kmh',
    'heart_rate_avg', 'heart_rate_max', 'weather_conditions',
    'difficulty_rating', 'enjoyment_rating', 'effort_level', 'achievements_earned'
)
ORDER BY column_name;

-- Verificar políticas RLS
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'activities';

-- ===============================================
-- ✅ SUCESSO!
-- ===============================================
-- Execute este script no SQL Editor do Supabase
-- Após execução, a tabela activities estará alinhada com o código TypeScript