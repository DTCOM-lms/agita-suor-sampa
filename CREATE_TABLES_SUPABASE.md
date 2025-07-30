# 📋 Criação de Tabelas - Referência

## 📌 **ARQUIVO DE REFERÊNCIA**

> ⚠️ **ATENÇÃO**: Este arquivo contém **APENAS** as definições de tabelas como referência.
> 
> **Para implementação completa**, use o arquivo principal:
> 👉 **[SUPABASE_IMPLEMENTATION.md](./SUPABASE_IMPLEMENTATION.md)** - Guia completo com tabelas + seeds + functions

Este documento serve como **referência rápida** para os scripts de criação de tabelas **APENAS**.

## 🚨 **PROBLEMAS RESOLVIDOS**

### ✅ **1. Ordem das Dependências**
**CORRIGIDO**: Tabela `challenges` agora é criada na **ETAPA 4.2** (antes de `suor_transactions` na ETAPA 4.4)  
**ANTES**: `suor_transactions` tentava referenciar `challenges` antes dela existir

### ✅ **2. Check-ins - Função IMMUTABLE**
**CORRIGIDO**: Adicionada coluna `checkin_date DATE` + constraint `UNIQUE(user_id, location_id, checkin_date)`  
**ANTES**: `CREATE UNIQUE INDEX` com `DATE(created_at)` causava erro de função não-imutável

### ✅ **3. Coordenadas - Tipo POINT vs GEOMETRY**
**CORRIGIDO**: Todos os campos de coordenadas agora usam `geometry(POINT, 4326)` (PostGIS)  
**ANTES**: Tipo `POINT` (PostgreSQL) incompatível com funções `ST_Point()` (PostGIS)

**🚨 SE JÁ CRIOU TABELAS COM POINT, EXECUTE PRIMEIRO:**
```sql
-- Dropar tabelas com tipo POINT incorreto (na ordem de dependências)
DROP TABLE IF EXISTS route_activities;
DROP TABLE IF EXISTS predefined_routes;
DROP TABLE IF EXISTS post_interactions;
DROP TABLE IF EXISTS social_posts;
DROP TABLE IF EXISTS user_rewards;
DROP TABLE IF EXISTS activities;
```

Execute **EM ORDEM** no SQL Editor do Supabase:

---

## 🎯 **ETAPA 1: Habilitar Extensões**

```sql
-- Execute PRIMEIRO - Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verificar se foram criadas
SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'postgis');
```

---

## 🎯 **ETAPA 2: Criar Todos os Types/Enums**

```sql
-- Types para atividades
CREATE TYPE activity_category AS ENUM (
  'running', 'cycling', 'walking', 'swimming', 'yoga', 
  'gym', 'dance', 'martial_arts', 'team_sports', 'outdoor',
  'home_workout', 'stretching', 'meditation', 'other'
);

CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE activity_source AS ENUM ('manual', 'gps', 'import', 'apple_health', 'google_fit');
CREATE TYPE activity_status AS ENUM ('active', 'paused', 'completed', 'cancelled');

-- Types para SUOR
CREATE TYPE transaction_type AS ENUM ('earned', 'spent', 'bonus', 'penalty', 'transfer');
CREATE TYPE transaction_source AS ENUM (
  'activity', 'challenge', 'achievement', 'daily_bonus', 'friend_referral',
  'marketplace', 'admin', 'check_in', 'quiz', 'habit', 'streak_bonus'
);

-- Types para gamificação
CREATE TYPE challenge_type AS ENUM ('individual', 'collective', 'city_wide');
CREATE TYPE challenge_status AS ENUM ('draft', 'active', 'completed', 'cancelled');
CREATE TYPE participation_status AS ENUM ('joined', 'active', 'completed', 'failed', 'quit');
CREATE TYPE recurrence_type AS ENUM ('none', 'daily', 'weekly', 'monthly');

CREATE TYPE achievement_category AS ENUM (
  'distance', 'duration', 'frequency', 'social', 'streak', 
  'challenge', 'level', 'exploration', 'seasonal', 'special'
);
CREATE TYPE achievement_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');

-- Types para sistema social
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked', 'declined');
CREATE TYPE post_type AS ENUM ('activity', 'achievement', 'challenge', 'photo', 'text');
CREATE TYPE post_visibility AS ENUM ('public', 'friends', 'private');
CREATE TYPE interaction_type AS ENUM ('like', 'comment', 'share');

-- Types para marketplace
CREATE TYPE reward_category AS ENUM (
  'fitness', 'food', 'mobility', 'entertainment', 
  'health', 'education', 'technology', 'tax_benefits'
);
CREATE TYPE reward_type AS ENUM ('product', 'service', 'discount', 'voucher', 'experience');
CREATE TYPE redemption_status AS ENUM ('pending', 'confirmed', 'used', 'expired', 'cancelled');

-- Types para localização
CREATE TYPE location_type AS ENUM ('park', 'gym', 'event', 'partner', 'municipal', 'ngo');
CREATE TYPE checkin_method AS ENUM ('qr_code', 'geofence', 'manual');

-- Types para hábitos
CREATE TYPE habit_type AS ENUM ('hydration', 'sun_protection', 'sleep', 'nutrition', 'custom');
CREATE TYPE quiz_category AS ENUM ('nutrition', 'exercise', 'health', 'environment', 'safety');
CREATE TYPE quiz_difficulty AS ENUM ('easy', 'medium', 'hard');
```

---

## 🎯 **ETAPA 3: Criar Tabelas de Referência**

### 3.1 Níveis de Usuário
```sql
-- Tabela de níveis do sistema de gamificação
CREATE TABLE user_levels (
  level INTEGER PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  min_experience INTEGER NOT NULL,
  max_experience INTEGER,
  benefits JSONB,
  icon_url TEXT
);
```

### 3.2 Tipos de Atividades
```sql
-- Catálogo de tipos de atividades
CREATE TABLE activity_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category activity_category NOT NULL,
  difficulty difficulty_level NOT NULL,
  
  -- Cálculo SUOR
  base_suor_per_minute DECIMAL(5,2) NOT NULL,
  intensity_multiplier DECIMAL(3,2) DEFAULT 1.0,
  
  -- Métricas suportadas
  supports_gps BOOLEAN DEFAULT false,
  supports_heart_rate BOOLEAN DEFAULT false,
  supports_manual_entry BOOLEAN DEFAULT true,
  
  -- Estimativas
  estimated_calories_per_minute INTEGER,
  min_duration_minutes INTEGER DEFAULT 5,
  max_duration_minutes INTEGER DEFAULT 300,
  
  icon_name VARCHAR(50),
  color_hex VARCHAR(7),
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.3 Configurações SUOR
```sql
-- Configurações globais do sistema SUOR
CREATE TABLE suor_settings (
  key VARCHAR(100) PRIMARY KEY,
  value DECIMAL(10,2) NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.4 Conquistas
```sql
-- Catálogo de conquistas
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  category achievement_category NOT NULL,
  rarity achievement_rarity DEFAULT 'common',
  
  -- Critérios para desbloquear
  criteria JSONB NOT NULL,
  
  -- Recompensas
  suor_reward DECIMAL(8,2) DEFAULT 0,
  experience_reward INTEGER DEFAULT 0,
  
  -- Visual
  icon_url TEXT,
  badge_url TEXT,
  color_hex VARCHAR(7),
  
  -- Configurações
  is_hidden BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🎯 **ETAPA 4: Criar Tabelas Principais**

### 4.1 Perfis de Usuário
```sql
-- Tabela de perfis (estende auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  birth_date DATE,
  gender VARCHAR(20),
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  fitness_level VARCHAR(20) DEFAULT 'beginner',
  city VARCHAR(100) DEFAULT 'São Paulo',
  neighborhood VARCHAR(100),
  
  -- Gamificação
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  total_suor DECIMAL(10,2) DEFAULT 100.0,
  current_suor DECIMAL(10,2) DEFAULT 100.0,
  
  -- Estatísticas
  total_activities INTEGER DEFAULT 0,
  total_distance_km DECIMAL(10,2) DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  
  -- Configurações
  is_public BOOLEAN DEFAULT true,
  allow_friend_requests BOOLEAN DEFAULT true,
  notification_preferences JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.2 Desafios
```sql
-- Tabela de desafios
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  type challenge_type NOT NULL,
  status challenge_status DEFAULT 'draft',
  recurrence recurrence_type DEFAULT 'none',
  
  -- Período
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Objetivos
  target_type VARCHAR(50) NOT NULL,
  target_value DECIMAL(10,2) NOT NULL,
  target_unit VARCHAR(20) NOT NULL,
  
  -- Gamificação
  suor_reward DECIMAL(8,2) NOT NULL,
  experience_reward INTEGER DEFAULT 0,
  
  -- Limitações
  max_participants INTEGER,
  min_level INTEGER DEFAULT 1,
  activity_types UUID[],
  
  -- Localização
  target_city VARCHAR(100),
  target_neighborhood VARCHAR(100),
  
  -- Mídia
  banner_url TEXT,
  icon_url TEXT,
  
  -- Configurações
  is_featured BOOLEAN DEFAULT false,
  auto_join BOOLEAN DEFAULT false,
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.3 Atividades
```sql
-- Tabela de atividades dos usuários
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  activity_type_id UUID REFERENCES activity_types(id) NOT NULL,
  
  -- Básico
  title VARCHAR(255),
  description TEXT,
  status activity_status DEFAULT 'completed',
  source activity_source DEFAULT 'manual',
  
  -- Tempo e duração
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  
  -- Localização
  start_location geometry(POINT, 4326),
  end_location geometry(POINT, 4326),
  city VARCHAR(100),
  
  -- Métricas básicas
  distance_km DECIMAL(8,3),
  calories_burned INTEGER,
  average_heart_rate INTEGER,
  max_heart_rate INTEGER,
  
  -- GPS Data
  gps_route JSONB,
  elevation_gain_m INTEGER,
  average_pace_min_per_km DECIMAL(4,2),
  max_speed_kmh DECIMAL(5,2),
  
  -- Gamificação
  suor_earned DECIMAL(8,2) NOT NULL DEFAULT 0,
  experience_gained INTEGER DEFAULT 0,
  
  -- Mídia
  photos JSONB,
  notes TEXT,
  
  -- Validação antifraude
  is_verified BOOLEAN DEFAULT false,
  fraud_score DECIMAL(3,2) DEFAULT 0.0,
  verification_data JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.4 Transações SUOR
```sql
-- Histórico de transações SUOR
CREATE TABLE suor_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  
  type transaction_type NOT NULL,
  source transaction_source NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  
  -- Referências
  activity_id UUID REFERENCES activities(id),
  challenge_id UUID REFERENCES challenges(id),
  achievement_id UUID REFERENCES achievements(id),
  
  -- Detalhes
  description TEXT NOT NULL,
  metadata JSONB,
  
  -- Auditoria
  admin_user_id UUID REFERENCES profiles(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🎯 **ETAPA 5: Tabelas de Gamificação**

### 5.1 Participação em Desafios
```sql
-- Participação dos usuários em desafios
CREATE TABLE challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  
  status participation_status DEFAULT 'joined',
  
  -- Progresso
  current_value DECIMAL(10,2) DEFAULT 0,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Conclusão
  completed_at TIMESTAMP WITH TIME ZONE,
  suor_earned DECIMAL(8,2) DEFAULT 0,
  
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(challenge_id, user_id)
);
```

### 5.2 Conquistas dos Usuários
```sql
-- Conquistas desbloqueadas pelos usuários
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  achievement_id UUID REFERENCES achievements(id) NOT NULL,
  
  -- Progresso
  current_progress DECIMAL(10,2) DEFAULT 0,
  required_progress DECIMAL(10,2) NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  
  -- Conclusão
  completed_at TIMESTAMP WITH TIME ZONE,
  suor_earned DECIMAL(8,2) DEFAULT 0,
  
  -- Contexto
  activity_id UUID REFERENCES activities(id),
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, achievement_id)
);
```

---

## 🎯 **ETAPA 6: Sistema Social**

### 6.1 Amizades
```sql
-- Rede de amigos
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES profiles(id) NOT NULL,
  addressee_id UUID REFERENCES profiles(id) NOT NULL,
  
  status friendship_status DEFAULT 'pending',
  
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);
```

### 6.2 Posts Sociais
```sql
-- Feed social
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  
  type post_type NOT NULL,
  visibility post_visibility DEFAULT 'friends',
  
  -- Conteúdo
  content TEXT,
  media_urls JSONB,
  
  -- Referências
  activity_id UUID REFERENCES activities(id),
  achievement_id UUID REFERENCES achievements(id),
  challenge_id UUID REFERENCES challenges(id),
  
  -- Localização
  location geometry(POINT, 4326),
  location_name VARCHAR(255),
  
  -- Estatísticas
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.3 Interações nos Posts
```sql
-- Curtidas, comentários e compartilhamentos
CREATE TABLE post_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES social_posts(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  
  type interaction_type NOT NULL,
  content TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(post_id, user_id, type)
);
```

---

## 🎯 **ETAPA 7: Marketplace e Recompensas**

### 7.1 Recompensas
```sql
-- Catálogo de recompensas
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  category reward_category NOT NULL,
  type reward_type NOT NULL,
  
  -- Preço
  suor_price DECIMAL(8,2) NOT NULL,
  original_price DECIMAL(8,2),
  
  -- Disponibilidade
  stock_quantity INTEGER,
  max_per_user INTEGER DEFAULT 1,
  
  -- Período
  available_from TIMESTAMP WITH TIME ZONE,
  available_until TIMESTAMP WITH TIME ZONE,
  
  -- Localização
  available_cities TEXT[],
  
  -- Parceiro
  partner_name VARCHAR(255) NOT NULL,
  partner_logo_url TEXT,
  partner_website TEXT,
  
  -- Mídia
  image_urls JSONB,
  qr_code_url TEXT,
  
  -- Resgate
  redemption_instructions TEXT NOT NULL,
  terms_conditions TEXT,
  
  -- Configurações
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7.2 Recompensas dos Usuários
```sql
-- Recompensas resgatadas
CREATE TABLE user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  reward_id UUID REFERENCES rewards(id) NOT NULL,
  
  status redemption_status DEFAULT 'pending',
  
  -- Resgate
  suor_spent DECIMAL(8,2) NOT NULL,
  redemption_code VARCHAR(100) UNIQUE,
  qr_code_data TEXT,
  
  -- Datas importantes
  expires_at TIMESTAMP WITH TIME ZONE,
  used_at TIMESTAMP WITH TIME ZONE,
  
  -- Localização de uso
  used_location geometry(POINT, 4326),
  used_location_name VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🎯 **ETAPA 8: Localizações e Check-ins**

### 8.1 Locais para Check-in
```sql
-- Locais para check-in
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  type location_type NOT NULL,
  
  -- Coordenadas
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  geofence_radius_m INTEGER DEFAULT 100,
  
  -- Endereço
  address TEXT,
  city VARCHAR(100) DEFAULT 'São Paulo',
  neighborhood VARCHAR(100),
  
  -- Recompensas
  checkin_suor_reward DECIMAL(6,2) DEFAULT 0,
  daily_suor_limit DECIMAL(6,2) DEFAULT 50,
  
  -- Configurações
  requires_qr_code BOOLEAN DEFAULT false,
  qr_code_data TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- Parceria
  partner_name VARCHAR(255),
  partner_contact TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 8.2 Check-ins dos Usuários

**🚨 SE JÁ EXECUTOU A VERSÃO ANTERIOR COM ERRO, EXECUTE PRIMEIRO:**
```sql
-- Dropar tabela se já foi criada com erro
DROP TABLE IF EXISTS check_ins;
```

**✅ AGORA EXECUTE A VERSÃO CORRIGIDA:**
```sql
-- Histórico de check-ins
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  location_id UUID REFERENCES locations(id) NOT NULL,
  
  method checkin_method NOT NULL,
  
  -- Coordenadas do check-in
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Recompensa
  suor_earned DECIMAL(6,2) DEFAULT 0,
  
  -- Dados extras
  notes TEXT,
  photo_url TEXT,
  
  -- Data do check-in (para constraint única por dia)
  checkin_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: apenas 1 check-in por usuário/local/dia
  UNIQUE(user_id, location_id, checkin_date)
);
```

---

## 🎯 **ETAPA 9: Percursos Pré-definidos**

### 9.1 Tabela de Percursos
```sql
-- Percursos/rotas pré-definidas
CREATE TABLE predefined_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Localização
  city VARCHAR(100) DEFAULT 'São Paulo',
  neighborhood VARCHAR(100),
  start_location geometry(POINT, 4326) NOT NULL,
  end_location geometry(POINT, 4326),
  
  -- Características da rota
  distance_km DECIMAL(8,3) NOT NULL,
  estimated_duration_minutes INTEGER,
  difficulty difficulty_level NOT NULL,
  elevation_gain_m INTEGER DEFAULT 0,
  
  -- Tipos de atividade recomendados
  recommended_activities activity_category[] NOT NULL,
  
  -- Dados do percurso
  route_points JSONB NOT NULL,
  waypoints JSONB,
  
  -- Informações adicionais
  surface_type VARCHAR(50),
  traffic_level VARCHAR(20),
  scenic_rating INTEGER CHECK (scenic_rating >= 1 AND scenic_rating <= 5),
  safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),
  
  -- Recursos disponíveis
  has_water_fountains BOOLEAN DEFAULT false,
  has_restrooms BOOLEAN DEFAULT false,
  has_parking BOOLEAN DEFAULT false,
  has_bike_parking BOOLEAN DEFAULT false,
  has_lighting BOOLEAN DEFAULT false,
  
  -- Mídia
  thumbnail_url TEXT,
  images JSONB,
  
  -- Metadata
  tags JSONB,
  best_times JSONB,
  weather_conditions JSONB,
  
  -- Configurações
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 9.2 Atividades em Percursos
```sql
-- Relaciona atividades com percursos pré-definidos
CREATE TABLE route_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) NOT NULL,
  route_id UUID REFERENCES predefined_routes(id) NOT NULL,
  
  -- Métricas específicas desta execução
  completion_percentage DECIMAL(5,2) DEFAULT 100,
  deviated_from_route BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(activity_id, route_id)
);
```

---

## ✅ **Verificação**

Após executar todas as etapas, verifique se todas as tabelas foram criadas:

```sql
-- Verificar se todas as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

---

## 🚨 **Se Der Erro de Dependência**

Se alguma tabela falhar por dependência de outra (ex: foreign key), execute as tabelas base primeiro:

1. **SEMPRE PRIMEIRO**: user_levels, activity_types, achievements, suor_settings
2. **DEPOIS**: profiles
3. **POR ÚLTIMO**: activities, suor_transactions, etc.

---

🎉 **Agora você pode executar os dados de seed** do arquivo `SUPABASE_IMPLEMENTATION.md` a partir do **PASSO 12**!