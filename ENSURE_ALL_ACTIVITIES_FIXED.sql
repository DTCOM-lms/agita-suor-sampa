-- ========================================
-- GARANTIR TODAS AS ATIVIDADES - VERSÃO CORRIGIDA
-- Script com valores corretos do enum activity_category
-- ========================================

-- 1. VERIFICAR atividades existentes
SELECT 
  'ATIVIDADES EXISTENTES' as status,
  name,
  category,
  supports_gps,
  base_suor_per_minute,
  is_active
FROM activity_types 
WHERE is_active = true
ORDER BY supports_gps DESC, name;

-- 2. CONTAR atividades por tipo
SELECT 
  'ESTATÍSTICAS' as status,
  supports_gps,
  COUNT(*) as total,
  CASE 
    WHEN supports_gps = true THEN 'GPS'
    WHEN supports_gps = false THEN 'MANUAL'
    ELSE 'INDEFINIDO'
  END as tipo
FROM activity_types 
WHERE is_active = true
GROUP BY supports_gps;

-- 3. INSERIR atividades essenciais se não existirem
-- Usando valores corretos do enum: 'running', 'cycling', 'walking', 'swimming', 'yoga', 
-- 'gym', 'dance', 'martial_arts', 'team_sports', 'outdoor', 'home_workout', 'stretching', 'meditation', 'other'

INSERT INTO activity_types (
  name, description, category, difficulty, 
  base_suor_per_minute, intensity_multiplier, 
  supports_gps, supports_heart_rate, supports_manual_entry,
  min_duration_minutes, max_duration_minutes, 
  estimated_calories_per_minute, is_active
) VALUES 

-- ACADEMIA E FORÇA (categoria 'gym')
('Musculação', 'Treinamento com pesos e equipamentos de academia', 'gym', 'medium', 8, 1.2, false, true, true, 15, 120, 6, true),
('Academia', 'Exercícios gerais de academia e fitness', 'gym', 'medium', 7, 1.1, false, true, true, 20, 90, 5, true),
('Crossfit', 'Treinamento funcional de alta intensidade', 'gym', 'hard', 12, 1.5, false, true, true, 20, 60, 10, true),
('TRX', 'Treinamento suspenso funcional', 'gym', 'medium', 9, 1.3, false, false, true, 15, 45, 7, true),
('Funcional', 'Exercícios funcionais variados', 'gym', 'medium', 8, 1.2, false, false, true, 20, 60, 6, true),

-- FLEXIBILIDADE E BEM-ESTAR (categorias 'yoga', 'stretching', 'meditation')
('Yoga', 'Prática de yoga para flexibilidade e bem-estar', 'yoga', 'easy', 4, 0.8, false, false, true, 30, 90, 3, true),
('Pilates', 'Exercícios de pilates para core e postura', 'yoga', 'medium', 6, 1.0, false, false, true, 30, 60, 4, true),
('Alongamento', 'Sessão dedicada de alongamento e mobilidade', 'stretching', 'easy', 3, 0.6, false, false, true, 15, 45, 2, true),
('Meditação', 'Prática de meditação e mindfulness', 'meditation', 'easy', 2, 0.5, false, false, true, 10, 60, 1, true),

-- EXERCÍCIOS EM CASA (categoria 'home_workout')
('Aeróbica', 'Exercícios aeróbicos de academia', 'home_workout', 'medium', 8, 1.2, false, true, true, 20, 60, 7, true),
('Exercícios em Casa', 'Treino completo em casa sem equipamentos', 'home_workout', 'medium', 6, 1.0, false, false, true, 20, 60, 5, true),
('HIIT', 'Treinamento intervalado de alta intensidade', 'home_workout', 'hard', 10, 1.4, false, true, true, 15, 45, 9, true),

-- DANÇA (categoria 'dance')
('Zumba', 'Dança fitness latina energética', 'dance', 'medium', 9, 1.3, false, true, true, 30, 60, 8, true),
('Dança', 'Aulas de dança variadas', 'dance', 'medium', 7, 1.1, false, false, true, 30, 90, 6, true),
('Step', 'Exercícios com step e coreografia', 'dance', 'medium', 8, 1.2, false, true, true, 20, 45, 7, true),

-- ARTES MARCIAIS (categoria 'martial_arts')
('Boxe', 'Treinamento de boxe e técnicas de soco', 'martial_arts', 'hard', 10, 1.4, false, true, true, 30, 90, 9, true),
('Muay Thai', 'Arte marcial tailandesa completa', 'martial_arts', 'hard', 11, 1.5, false, true, true, 30, 90, 10, true),
('Jiu-Jitsu', 'Arte marcial brasileira de solo', 'martial_arts', 'hard', 9, 1.3, false, false, true, 45, 120, 8, true),
('Karatê', 'Arte marcial japonesa tradicional', 'martial_arts', 'medium', 8, 1.2, false, false, true, 45, 90, 7, true),
('Judô', 'Arte marcial de arremessos e quedas', 'martial_arts', 'medium', 8, 1.2, false, false, true, 45, 90, 7, true),
('Taekwondo', 'Arte marcial coreana de chutes', 'martial_arts', 'medium', 8, 1.2, false, false, true, 45, 90, 7, true),

-- NATAÇÃO (categoria 'swimming')
('Natação', 'Natação em piscina ou ambiente controlado', 'swimming', 'medium', 10, 1.3, false, true, true, 30, 90, 8, true),
('Natação Intensa', 'Natação de alta intensidade e treino', 'swimming', 'hard', 12, 1.5, false, true, true, 30, 90, 10, true),
('Hidroginástica', 'Exercícios aquáticos de baixo impacto', 'swimming', 'easy', 6, 0.9, false, false, true, 30, 60, 5, true),

-- ATIVIDADES GPS OUTDOOR (categoria 'outdoor')
('Trilha', 'Caminhada em trilhas naturais', 'outdoor', 'medium', 6, 1.0, true, true, true, 60, 480, 5, true),
('Escalada', 'Escalada ao ar livre', 'outdoor', 'hard', 9, 1.4, true, true, true, 60, 240, 8, true),
('Surf', 'Surfe em ondas naturais', 'outdoor', 'hard', 8, 1.3, true, false, true, 60, 240, 7, true),
('Stand Up Paddle', 'SUP em lagos, rios ou mar', 'outdoor', 'medium', 7, 1.1, true, false, true, 30, 120, 6, true),
('Skate', 'Skate urbano ou em pistas', 'outdoor', 'medium', 6, 1.0, true, false, true, 30, 120, 5, true),
('Patins', 'Patinação inline ou roller', 'outdoor', 'medium', 7, 1.1, true, false, true, 30, 120, 6, true),

-- CORRIDA (categoria 'running')
('Corrida', 'Corrida ao ar livre com tracking GPS', 'running', 'medium', 10, 1.3, true, true, true, 15, 180, 8, true),
('Corrida Intensa', 'Corrida de alta intensidade e velocidade', 'running', 'hard', 12, 1.5, true, true, true, 15, 120, 10, true),
('Cooper', 'Teste de corrida de 12 minutos', 'running', 'medium', 9, 1.2, true, true, true, 12, 12, 8, true),

-- CAMINHADA (categoria 'walking')
('Caminhada', 'Caminhada monitorada por GPS', 'walking', 'easy', 4, 0.8, true, true, true, 20, 240, 3, true),
('Caminhada Rápida', 'Caminhada em ritmo acelerado', 'walking', 'medium', 6, 1.0, true, true, true, 20, 180, 4, true),

-- CICLISMO (categoria 'cycling')
('Ciclismo', 'Pedalar com monitoramento de rota', 'cycling', 'medium', 8, 1.2, true, true, true, 30, 300, 6, true),
('Spinning', 'Ciclismo indoor em bicicleta estacionária', 'cycling', 'hard', 11, 1.4, false, true, true, 30, 60, 9, true),
('Bike Outdoor', 'Ciclismo ao ar livre em diferentes terrenos', 'cycling', 'medium', 9, 1.3, true, true, true, 30, 240, 7, true),

-- ESPORTES COLETIVOS (categoria 'team_sports')
('Futebol', 'Futebol de campo ou society', 'team_sports', 'medium', 9, 1.3, true, true, true, 60, 120, 8, true),
('Basquete', 'Basquetebol em quadra', 'team_sports', 'medium', 8, 1.2, false, true, true, 40, 120, 7, true),
('Vôlei', 'Voleibol em quadra ou praia', 'team_sports', 'medium', 7, 1.1, false, true, true, 40, 120, 6, true),
('Tênis', 'Tênis em quadra', 'team_sports', 'medium', 8, 1.2, false, true, true, 30, 120, 7, true),
('Badminton', 'Badminton em quadra fechada', 'team_sports', 'medium', 7, 1.1, false, true, true, 30, 90, 6, true),

-- OUTRAS ATIVIDADES (categoria 'other')
('Fisioterapia', 'Sessão de fisioterapia e reabilitação', 'other', 'easy', 3, 0.7, false, false, true, 30, 90, 2, true),
('Aquecimento', 'Aquecimento pré-atividade', 'other', 'easy', 2, 0.5, false, false, true, 5, 20, 1, true)

ON CONFLICT (name) DO UPDATE SET
  supports_gps = EXCLUDED.supports_gps,
  base_suor_per_minute = EXCLUDED.base_suor_per_minute,
  intensity_multiplier = EXCLUDED.intensity_multiplier,
  is_active = EXCLUDED.is_active,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  min_duration_minutes = EXCLUDED.min_duration_minutes,
  max_duration_minutes = EXCLUDED.max_duration_minutes,
  estimated_calories_per_minute = EXCLUDED.estimated_calories_per_minute,
  supports_heart_rate = EXCLUDED.supports_heart_rate,
  supports_manual_entry = EXCLUDED.supports_manual_entry;

-- 4. VERIFICAR resultado final
SELECT 
  'RESULTADO FINAL' as status,
  COUNT(*) as total_atividades
FROM activity_types 
WHERE is_active = true;

-- 5. LISTAR por categoria
SELECT 
  'POR CATEGORIA' as status,
  category,
  supports_gps,
  COUNT(*) as quantidade,
  string_agg(name, ', ' ORDER BY name) as atividades
FROM activity_types 
WHERE is_active = true
GROUP BY category, supports_gps
ORDER BY category, supports_gps DESC;

-- 6. VALIDAR se Aeróbica está correta
SELECT 
  'VALIDAÇÃO AERÓBICA' as status,
  name,
  supports_gps,
  base_suor_per_minute,
  category,
  CASE 
    WHEN supports_gps = false THEN '✅ CORRETO (Manual)'
    WHEN supports_gps = true THEN '❌ ERRO (Deveria ser Manual)'
    ELSE '⚠️ NULL'
  END as resultado
FROM activity_types 
WHERE name ILIKE '%aeróbica%' OR name ILIKE '%aerobica%';

-- 7. GARANTIR que função RPC retorna dados corretos
SELECT 
  'TESTE RPC AERÓBICA' as status;

-- Testar se função existe e funciona
SELECT 
  name,
  supports_gps,
  base_suor_per_minute,
  category
FROM get_activity_type_by_name_or_id('aeróbica')
UNION ALL
SELECT 
  name,
  supports_gps, 
  base_suor_per_minute,
  category
FROM get_activity_type_by_name_or_id('Aeróbica');

-- ========================================
-- COMANDOS PARA TESTE NO FRONTEND
-- ========================================

-- Após executar este script:
-- 1. Recarregue a página /activity/start
-- 2. Verifique se todas as atividades aparecem
-- 3. Procure por "Aeróbica" na busca
-- 4. Selecione uma atividade manual (Musculação, Yoga, Aeróbica)
-- 5. Clique no botão flutuante "Iniciar"
-- 6. Verifique se o timer funciona

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================

-- ✅ 35+ atividades disponíveis
-- ✅ Atividades manuais: Musculação, Yoga, Aeróbica, Boxe, etc.
-- ✅ Atividades GPS: Corrida, Ciclismo, Caminhada, Trilha, etc.
-- ✅ Botão flutuante aparece ao selecionar
-- ✅ Timer funciona para atividades manuais
-- ✅ GPS funciona para atividades outdoor

-- ========================================