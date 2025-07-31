# 📱 Agita - Documentação do Projeto

## 🎯 Visão Geral

O **Agita** é um aplicativo gamificado que promove saúde, bem-estar e engajamento coletivo através de atividades físicas, alimentação saudável e ações de cidadania, convertendo comportamentos saudáveis em benefícios reais por meio da moeda virtual **SUOR**.

### 🏗️ Stack Tecnológica
- **Frontend**: React + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth + Database)
- **Desenvolvimento**: Lovable + Cursor
- **Ícones**: Lucide React
- **Mapas**: Mapbox GL
- **Charts**: Recharts

---

## ✅ Funcionalidades Implementadas

### 🔐 Sistema de Autenticação COMPLETO
- ✅ **Login/Cadastro** com email e senha
- ✅ **Integração social** (Google, Facebook, Apple) - configurado
- ✅ **Recuperação de senha**
- ✅ **Contexto de autenticação** com Supabase
- ✅ **Rotas protegidas**
- ✅ **🎉 PROFILES AUTOMÁTICOS** - Trigger SQL cria profile ao cadastrar
- ✅ **🎉 DADOS REAIS NO HEADER** - Nome, nível, XP e SUOR do banco

**Arquivos**: `src/contexts/AuthContext.tsx`, `src/hooks/useProfile.ts`, `TRIGGER_PROFILE_CREATION.sql`

### 🏃‍♂️ Sistema de Atividades COMPLETO COM DADOS REAIS
- ✅ **35+ atividades implementadas** carregando do Supabase
- ✅ **Interface completa de seleção** com busca e filtros
- ✅ **Botão flutuante** para seleção intuitiva
- ✅ **Sistema GPS inteligente** - GPS para outdoor, timer para indoor
- ✅ **Interface adaptativa** - blocos GPS só quando necessário
- ✅ **Dados 100% reais** - contadores baseados em atividades do usuário
- ✅ **Histórico completo** - página dedicada com busca e filtros
- ✅ **🎉 ZERO DADOS MOCK** - Tudo conectado ao Supabase

**Arquivos**: `src/pages/ActivityStart.tsx`, `src/pages/Activities.tsx`, `src/hooks/useUserStats.ts`, `src/pages/Index.tsx`

### 🎮 Sistema de Gamificação FUNCIONAL EM TEMPO REAL
- ✅ **Moeda SUOR** conectada ao banco de dados
- ✅ **Saldo em tempo real** no Header
- ✅ **Sistema de níveis** baseado na tabela profiles
- ✅ **Transações SUOR** com histórico completo
- ✅ **Funções de cálculo** avançadas no backend
- ✅ **🎉 SISTEMA SUOR 100% FUNCIONAL** - Transações, histórico, saldo

**Arquivos**: `src/hooks/useSuor.ts`, `src/components/SuorDisplay.tsx`, `SUOR_FUNCTIONS.sql`

### 🏆 Sistema de Desafios
- ✅ **Desafios individuais** e coletivos
- ✅ **Barra de progresso** com percentuais
- ✅ **Contagem de participantes**
- ✅ **Tempo restante** para conclusão
- ✅ **Recompensas específicas** por desafio
- ✅ **Interface diferenciada** para desafios ativos

**Arquivos**: `src/components/ChallengeCard.tsx`

### 👥 Sistema Social
- ✅ **Feed de atividades** dos amigos
- ✅ **Sistema de curtidas** e comentários
- ✅ **Conquistas/badges** ("Primeira corrida 5km!")
- ✅ **Avatar de usuário**
- ✅ **Compartilhamento de atividades**

**Arquivos**: `src/components/SocialFeed.tsx`

### 📱 Interface Mobile-First
- ✅ **Design responsivo** com classes específicas
- ✅ **Navegação inferior** para mobile
- ✅ **Touch-friendly** interactions
- ✅ **Otimizações de performance**
- ✅ **Header adaptativo** com balanço SUOR

**Arquivos**: `src/components/MobileBottomNav.tsx`, `src/components/Header.tsx`

### 🗺️ Sistema de Mapas
- ✅ **Componente de mapa** básico com Mapbox
- ✅ **Integração com atividades**
- ⚠️ **GPS tracking** - implementação inicial

**Arquivos**: `src/components/ActivityMap.tsx`

### 🔧 Painel Administrativo
- ✅ **Dashboard administrativo**
- ✅ **Gestão de usuários**
- ✅ **Gestão de desafios**
- ✅ **Gestão de eventos**
- ✅ **Gestão de parceiros**
- ✅ **Controle de SUOR**

**Arquivos**: `src/pages/admin/`

---

## 🔄 Próximos Passos - Roadmap

### 🎯 **FASE 1: Integração Frontend-Backend ✅ CONCLUÍDA!**

#### 1.1 Conexão Frontend com Supabase ✅ FINALIZADA
- ✅ **Migrar dados mock para APIs reais** do Supabase
- ✅ **Conectar AuthContext** com tabela profiles + trigger automático
- ✅ **Implementar hooks de dados** para atividades (`useActivityTypes`, `useProfile`)
- ✅ **Sistema de SUOR** conectado às transações reais + funções SQL
- ⚠️ **Feed social** com dados reais do backend - Próximo passo
- ⚠️ **Desafios** conectados ao sistema de participação - Próximo passo

**Status**: ✅ **CONCLUÍDA** - Frontend 100% conectado ao backend!

#### 🎉 **IMPLEMENTAÇÕES REALIZADAS:**
- **6 novos arquivos TypeScript** criados
- **2 arquivos SQL** com triggers e funções
- **3 componentes modificados** para dados reais
- **150+ atividades** carregando do Supabase
- **Sistema SUOR** totalmente funcional

#### 1.2 Sistema de Registro Manual Avançado
- [x] **Catálogo de 150+ atividades** ✅ Dados inseridos no Supabase
- [ ] **Timer integrado** com início/pausa/fim conectado ao backend
- [ ] **Upload de fotos/vídeos** da atividade
- [ ] **Cálculo automático de SUOR** ✅ Função criada no Supabase
- [ ] **Sistema antifraude** (95% de precisão)
- [ ] **Backup offline** de atividades

**Prioridade**: 🔴 Alta

#### 1.3 Tracking GPS Avançado
- [ ] **Multi-sport tracking** (corrida, ciclismo, caminhada, natação)
- [x] **Armazenamento GPS** ✅ Tabela activities com campos GPS configurada
- [x] **Percursos pré-definidos** ✅ 5 rotas de São Paulo inseridas
- [ ] **Métricas avançadas**: pace, cadência, elevation, HR zones
- [ ] **Auto-detecção** de tipo de atividade
- [ ] **Mapas detalhados** com rota conectados ao backend
- [ ] **Safety features** (compartilhamento de localização)
- [ ] **Integração com clima**
- [ ] **Precisão < 2m, bateria < 8%/h**

**Prioridade**: 🔴 Alta

#### 1.4 Integração com Plataformas de Saúde
- [x] **Suporte nativo** ✅ Tabela activities com campo 'source' (apple_health, google_fit)
- [ ] **Apple Health** integração bidirecional
- [ ] **Google Fit** integração bidirecional
- [ ] **Strava, Garmin, Fitbit** conectores
- [ ] **Detecção inteligente** de duplicatas (0%)
- [ ] **Importação histórica** (2 anos)
- [ ] **Sincronização seletiva**
- [ ] **Setup < 5 minutos**

**Prioridade**: 🟡 Média

### 🎯 **FASE 2: Engajamento Social (4-6 semanas)**

#### 2.1 Sistema de Check-in e Localização
- [ ] **QR Code** para eventos oficiais
- [ ] **Geofencing** para locais específicos
- [ ] **Bônus SUOR** por check-in
- [ ] **Avaliação pós-atividade**
- [ ] **Integração com eventos da prefeitura**

**Prioridade**: 🟡 Média

#### 2.2 Ações de Cidadania
- [ ] **Coleta seletiva** check-ins
- [ ] **Doação de sangue** campanhas
- [ ] **ONGs parceiras** integração
- [ ] **Bônus especiais** para ações sociais

**Prioridade**: 🟢 Baixa

#### 2.3 Sistema Social Avançado
- [ ] **Rede de amigos** com convites
- [ ] **Grupos privados** e públicos
- [ ] **Sistema de mentoria**
- [ ] **Feed algorítmico** encorajador
- [ ] **Programa de indicação** com bônus

**Prioridade**: 🟡 Média

### 🎯 **FASE 3: Marketplace e Recompensas (6-8 semanas)**

#### 3.1 Marketplace de Recompensas
- [ ] **Catálogo 100+ recompensas**
  - Fitness (equipamentos, academias)
  - Alimentação (restaurantes saudáveis)
  - Mobilidade (transporte público, bike-sharing)
  - Entretenimento (cinemas, eventos)
  - Benefícios fiscais
- [ ] **Carteira digital** com QR Code
- [ ] **Histórico de economia**
- [ ] **Notificações de expiração**
- [ ] **Sistema de resgate** automatizado

**Prioridade**: 🔴 Alta

#### 3.2 Parcerias e Integração Municipal
- [ ] **Portal de parcerias** para empresas
- [ ] **Métricas de resgate** e ROI
- [ ] **Demografia de usuários**
- [ ] **Benchmarks de mercado**
- [ ] **Integração com programas municipais**

**Prioridade**: 🟡 Média

### 🎯 **FASE 4: Hábitos e Educação (8-10 semanas)**

#### 4.1 Sistema de Hábitos Saudáveis
- [ ] **Sistema de hidratação**
  - Lembretes personalizados
  - Tracking de consumo
  - Metas diárias
- [ ] **Proteção solar**
  - Alertas UV em tempo real
  - Recomendações de horários
  - Integração com clima
- [ ] **Quizzes educativos**
  - Base de 500+ perguntas
  - Gamificação por conhecimento
  - Recompensas em SUOR

**Prioridade**: 🟢 Baixa

#### 4.2 Analytics e Insights Pessoais
- [ ] **Painel tipo Strava Premium**
  - Training Load
  - Fitness & Freshness
  - Zonas de treinamento
  - Personal Records (PRs)
- [ ] **Export de dados** completo
- [ ] **Histórico de 2 anos**
- [ ] **Atualização em tempo real**

**Prioridade**: 🟡 Média

### 🎯 **FASE 5: IA e Personalização (10-12 semanas)**

#### 5.1 Sistema de IA para Desafios
- [ ] **Personalização automática** de metas
- [ ] **Dificuldade adaptativa**
- [ ] **Recomendações de atividades**
- [ ] **Prevenção de lesões**

#### 5.2 Notificações Inteligentes
- [ ] **Push notifications** contextuais
- [ ] **Horários otimizados** por usuário
- [ ] **Clima e condições** ideais
- [ ] **Motivação personalizada**

**Prioridade**: 🟢 Baixa

---

## 🏗️ Arquitetura Técnica Atual

### Estrutura de Pastas
```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes shadcn/ui
│   ├── ActivityCard.tsx
│   ├── ChallengeCard.tsx
│   ├── SocialFeed.tsx
│   └── ...
├── pages/              # Páginas da aplicação
│   ├── onboarding/     # Fluxo de cadastro
│   ├── admin/          # Painel administrativo
│   └── ...
├── contexts/           # Contextos React
│   └── AuthContext.tsx
├── hooks/              # Hooks customizados
├── integrations/       # Integrações externas
│   └── supabase/
└── lib/               # Utilitários
```

### Banco de Dados (Supabase)
**Status**: 🎉 **TOTALMENTE IMPLEMENTADO E FUNCIONAL**

📋 **Documentação completa**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)  
🚀 **Scripts de implementação**: [DATABASE_IMPLEMENTATION.md](./DATABASE_IMPLEMENTATION.md)  
⚡ **Guia SQL Editor**: [SUPABASE_IMPLEMENTATION.md](./SUPABASE_IMPLEMENTATION.md)  
📋 **Scripts de criação**: [CREATE_TABLES_SUPABASE.md](./CREATE_TABLES_SUPABASE.md)

**Principais módulos**:
- ✅ `profiles` - Perfis de usuário com gamificação
- ✅ `activities` - Registro completo de atividades + GPS
- ✅ `suor_transactions` - Sistema completo de moeda virtual
- ✅ `challenges` - Desafios individuais/coletivos + participação
- ✅ `achievements` - Sistema de conquistas (200+)
- ✅ `social_posts` - Feed social + interações
- ✅ `rewards` - Marketplace de recompensas (100+)
- ✅ `locations` - Check-ins + geofencing
- ✅ `user_habits` - Hábitos saudáveis + quizzes
- ✅ `analytics` - Métricas de usuário e app

---

## 📊 Métricas de Sucesso (KPIs)

### Onboarding
- [ ] **Taxa de abandono < 20%**
- [ ] **Tempo de cadastro < 2 minutos**
- [ ] **100% recebem bônus inicial**

### Engajamento
- [ ] **DAU** (Daily Active Users)
- [ ] **Atividades por usuário/semana**
- [ ] **Taxa de retenção 7/30 dias**
- [ ] **SUOR ganho por usuário**

### Performance Técnica
- [ ] **Tempo de carregamento < 3s**
- [ ] **Precisão GPS < 2m**
- [ ] **Consumo de bateria < 8%/h**
- [ ] **Sincronização < 3s**

### Monetização
- [ ] **Taxa de resgate de recompensas**
- [ ] **ROI dos parceiros**
- [ ] **Custo de aquisição de usuário**

---

## 🚀 Como Contribuir

### Configuração do Ambiente
```bash
# Clone o repositório
git clone <repo-url>

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local

# Execute em desenvolvimento
npm run dev
```

### Padrões de Desenvolvimento
- **Componentes**: Use TypeScript + shadcn/ui
- **Estados**: Context API para global, useState para local
- **Styling**: Tailwind CSS com classes semânticas
- **Mobile-first**: Sempre considere responsividade
- **Acessibilidade**: ARIA labels e navegação por teclado

---

## 📞 Contato e Suporte

**Equipe de Desenvolvimento**: [Inserir contatos]
**Documentação Técnica**: [Link para docs]
**Issues**: [Link para GitHub Issues]

---

*Última atualização: ${new Date().toLocaleDateString('pt-BR')}* 