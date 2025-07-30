-- 🚨 FIX CRITICAL ERRORS: Activity Tracking & Achievements
-- Data: Janeiro 2025
-- Descrição: Corrige problemas de loading infinito ao iniciar atividades

-- ===============================================
-- 🔧 PROBLEMA 1: Ajustar tabela user_achievements 
-- ===============================================

-- Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_achievements' 
AND table_schema = 'public';

-- Adicionar colunas necessárias se não existirem
DO $$
BEGIN
    -- Adicionar unlocked_at se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_achievements' 
        AND column_name = 'unlocked_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_achievements 
        ADD COLUMN unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        -- Migrar dados de completed_at para unlocked_at se completed_at existir
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_achievements' 
            AND column_name = 'completed_at'
            AND table_schema = 'public'
        ) THEN
            UPDATE user_achievements 
            SET unlocked_at = completed_at 
            WHERE completed_at IS NOT NULL AND unlocked_at IS NULL;
        END IF;
    END IF;

    -- Adicionar progress_value se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_achievements' 
        AND column_name = 'progress_value'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_achievements 
        ADD COLUMN progress_value DECIMAL(10,2);
    END IF;

    -- Adicionar is_notified se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_achievements' 
        AND column_name = 'is_notified'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_achievements 
        ADD COLUMN is_notified BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ===============================================
-- 🔧 PROBLEMA 2: Melhorar estrutura achievements
-- ===============================================

-- Atualizar tabela achievements para compatibilidade com o código
DO $$
BEGIN
    -- Adicionar colunas necessárias para achievements se não existirem
    
    -- condition_type para o sistema de conquistas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'achievements' 
        AND column_name = 'condition_type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE achievements 
        ADD COLUMN condition_type VARCHAR(50) DEFAULT 'total_activities';
    END IF;

    -- condition_value para o sistema de conquistas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'achievements' 
        AND column_name = 'condition_value'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE achievements 
        ADD COLUMN condition_value INTEGER DEFAULT 1;
    END IF;

    -- condition_operator para o sistema de conquistas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'achievements' 
        AND column_name = 'condition_operator'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE achievements 
        ADD COLUMN condition_operator VARCHAR(10) DEFAULT 'gte';
    END IF;

    -- type para categorização
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'achievements' 
        AND column_name = 'type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE achievements 
        ADD COLUMN type VARCHAR(20) DEFAULT 'milestone';
    END IF;

    -- unlock_message e requirements_description
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'achievements' 
        AND column_name = 'unlock_message'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE achievements 
        ADD COLUMN unlock_message TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'achievements' 
        AND column_name = 'requirements_description'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE achievements 
        ADD COLUMN requirements_description TEXT;
    END IF;

    -- icon_name para consistência
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'achievements' 
        AND column_name = 'icon_name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE achievements 
        ADD COLUMN icon_name VARCHAR(50);
    END IF;

    -- badge_color para consistência
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'achievements' 
        AND column_name = 'badge_color'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE achievements 
        ADD COLUMN badge_color VARCHAR(7);
    END IF;
END $$;

-- ===============================================
-- 🎯 PROBLEMA 3: Criar Function para buscar activity_type por nome
-- ===============================================

-- Function para buscar activity_type por nome ou ID
CREATE OR REPLACE FUNCTION get_activity_type_by_name_or_id(input_value TEXT)
RETURNS TABLE (
    id UUID,
    name VARCHAR(100),
    description TEXT,
    category TEXT,
    difficulty TEXT,
    base_suor_per_minute DECIMAL(5,2),
    intensity_multiplier DECIMAL(3,2),
    supports_gps BOOLEAN,
    supports_heart_rate BOOLEAN,
    supports_manual_entry BOOLEAN,
    estimated_calories_per_minute INTEGER,
    min_duration_minutes INTEGER,
    max_duration_minutes INTEGER,
    icon_name VARCHAR(50),
    color_hex VARCHAR(7),
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Primeiro tenta buscar por UUID (se input for válido UUID)
    IF input_value ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
        RETURN QUERY
        SELECT at.id, at.name, at.description, at.category::TEXT, at.difficulty::TEXT,
               at.base_suor_per_minute, at.intensity_multiplier, at.supports_gps,
               at.supports_heart_rate, at.supports_manual_entry, at.estimated_calories_per_minute,
               at.min_duration_minutes, at.max_duration_minutes, at.icon_name, at.color_hex,
               at.is_active, at.created_at
        FROM activity_types at
        WHERE at.id = input_value::UUID AND at.is_active = true;
    -- Senão busca por nome similar
    ELSE
        RETURN QUERY
        SELECT at.id, at.name, at.description, at.category::TEXT, at.difficulty::TEXT,
               at.base_suor_per_minute, at.intensity_multiplier, at.supports_gps,
               at.supports_heart_rate, at.supports_manual_entry, at.estimated_calories_per_minute,
               at.min_duration_minutes, at.max_duration_minutes, at.icon_name, at.color_hex,
               at.is_active, at.created_at
        FROM activity_types at
        WHERE at.is_active = true
        AND (
            LOWER(at.name) LIKE '%' || LOWER(input_value) || '%'
            OR LOWER(at.category::TEXT) = LOWER(input_value)
            OR (
                LOWER(input_value) = 'running' AND LOWER(at.category::TEXT) = 'running'
            )
            OR (
                LOWER(input_value) = 'cycling' AND LOWER(at.category::TEXT) = 'cycling'
            )
            OR (
                LOWER(input_value) = 'walking' AND LOWER(at.category::TEXT) = 'walking'
            )
        )
        ORDER BY 
            CASE 
                WHEN LOWER(at.category::TEXT) = LOWER(input_value) THEN 1
                WHEN LOWER(at.name) LIKE LOWER(input_value) || '%' THEN 2
                ELSE 3
            END,
            at.difficulty::TEXT,
            at.name
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================
-- 🔧 PROBLEMA 4: Atualizar tipos de dados se necessário
-- ===============================================

-- Verificar se activity_types.activity_category existe como enum
DO $$
BEGIN
    -- Se category não for enum, converter para TEXT temporariamente
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activity_types' 
        AND column_name = 'category'
        AND data_type = 'USER-DEFINED'
        AND table_schema = 'public'
    ) THEN
        -- Já é enum, não precisa fazer nada
        NULL;
    ELSE
        -- Converter para TEXT se não for enum ainda
        ALTER TABLE activity_types 
        ALTER COLUMN category TYPE TEXT;
    END IF;
    
    -- Mesmo para difficulty
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activity_types' 
        AND column_name = 'difficulty'
        AND data_type = 'USER-DEFINED'
        AND table_schema = 'public'
    ) THEN
        -- Já é enum, não precisa fazer nada
        NULL;
    ELSE
        -- Converter para TEXT se não for enum ainda
        ALTER TABLE activity_types 
        ALTER COLUMN difficulty TYPE TEXT;
    END IF;
END $$;

-- ===============================================
-- 🎯 VERIFICAÇÃO FINAL
-- ===============================================

-- Verificar se as correções foram aplicadas
SELECT 
    'user_achievements' as tabela,
    COUNT(*) as colunas_encontradas
FROM information_schema.columns 
WHERE table_name = 'user_achievements' 
AND column_name IN ('unlocked_at', 'progress_value', 'is_notified')
AND table_schema = 'public'

UNION ALL

SELECT 
    'achievements' as tabela,
    COUNT(*) as colunas_encontradas
FROM information_schema.columns 
WHERE table_name = 'achievements' 
AND column_name IN ('condition_type', 'condition_value', 'condition_operator', 'type')
AND table_schema = 'public';

-- Testar function
SELECT * FROM get_activity_type_by_name_or_id('running') LIMIT 1;
SELECT * FROM get_activity_type_by_name_or_id('cycling') LIMIT 1;
SELECT * FROM get_activity_type_by_name_or_id('walking') LIMIT 1;

-- ===============================================
-- ✅ SUCESSO!
-- ===============================================
-- Execute este script no SQL Editor do Supabase
-- Após execução, os erros de loading infinito devem ser resolvidos