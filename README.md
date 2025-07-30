# 🏆 Agita - São Paulo | MVP Completo

## 🎉 **MVP Enterprise-Ready Implementado!**

Um aplicativo **gamificado completo** para promover atividades físicas e bem-estar em São Paulo, convertendo comportamentos saudáveis em benefícios reais através da moeda virtual **SUOR**.

### ✅ **SISTEMA COMPLETO FUNCIONAL**
- **🔐 Autenticação & Profiles** com gamificação completa
- **🏃‍♂️ 15+ tipos de atividades** com dados reais do Supabase  
- **💰 Sistema SUOR** completo com transações e economia
- **🏆 Sistema de Conquistas** com notificações em tempo real
- **📱 Feed Social** com likes, comentários e posts automáticos
- **🗺️ GPS Tracking Avançado** com precisão profissional
- **🎯 Dashboard Rico** com métricas e estatísticas completas

## 📚 Documentação

### **📋 Documentação Principal**
| Documento | Status | Descrição |
|-----------|--------|-----------|
| **[📋 Visão Geral](./AGITA_DOCUMENTATION.md)** | ✅ Completo | Funcionalidades, roadmap e visão do produto |
| **[📈 Status Desenvolvimento](./DEVELOPMENT_STATUS.md)** | ✅ Atualizado | Progresso atual, tarefas e changelog completo |
| **[🏆 Plano Implementação](./IMPLEMENTATION_PLAN.md)** | ✅ **MVP COMPLETO!** | **Todos os sistemas implementados** |

### **🗄️ Database & Backend**
| Documento | Status | Descrição |
|-----------|--------|-----------|
| **[🚀 Supabase Completo](./SUPABASE_IMPLEMENTATION.md)** | ✅ Centralizado | **Guia único: Tables + Seeds + Functions** |
| **[📋 Tabelas Only](./CREATE_TABLES_SUPABASE.md)** | ✅ Referência | Scripts isolados apenas para criação de tabelas |

### **🔧 Configuração & Setup**
| Documento | Status | Descrição |
|-----------|--------|-----------|
| **[🔐 Environment Setup](./ENVIRONMENT_SETUP.md)** | ✅ Completo | Configuração de variáveis de ambiente |
| **[🎉 Integração Summary](./FRONTEND_BACKEND_INTEGRATION_SUMMARY.md)** | ✅ Completo | Resumo das implementações realizadas |

## 🚀 Quick Start

### **📋 Pré-requisitos**
- **Node.js 18+** 
- **npm ou bun**
- **Conta Supabase** (backend)
- **Token Mapbox** (opcional - para mapas)

### **⚙️ Instalação & Setup**
```bash
# Clone o repositório
git clone <YOUR_GIT_URL>
cd agita-suor-sampa

# Instale dependências
npm install

# 🔧 Setup automático de environment (RECOMENDADO)
npm run setup:env

# 🗄️ Configure o Supabase
# 1. Execute SUPABASE_IMPLEMENTATION.md no SQL Editor
# 2. Obtenha URL e Anon Key do seu projeto

# 🗺️ Configure Mapbox (opcional)
# 1. Crie conta em mapbox.com
# 2. Obtenha Access Token
# 3. Configure no .env.local

# 🚀 Inicie o servidor
npm run dev
```

### **💾 Setup Manual Environment**
Se preferir configurar manualmente:
# cp environment.example .env.local

# Execute em desenvolvimento
npm run dev
# ou
bun dev
```

### Acesse o aplicativo
- **Local**: http://localhost:5173
- **Produção**: [Link quando disponível]

## 🎯 Funcionalidades Implementadas

### ✅ **CORE FEATURES - 100% Completo**
- 🔐 **Autenticação Supabase** com profiles automáticos
- 🏃‍♂️ **15+ Tipos de Atividades** com dados reais do backend
- 💰 **Sistema SUOR Completo** com transações e economia virtual
- 🏆 **Sistema de Conquistas** com progress tracking automático
- 📱 **Feed Social** com likes, comentários e posts automáticos
- 📊 **Dashboard Rico** com estatísticas em tempo real

### ✅ **GPS & TRACKING - 100% Completo**
- 🗺️ **GPS Tracking Avançado** com precisão profissional
- 📏 **Cálculo Automático** de distância, velocidade, ritmo, elevação
- 🗺️ **Mapbox Integration** com visualização de rotas em tempo real
- 💾 **Armazenamento GPS** detalhado no PostgreSQL
- 📈 **Interface Rica** com métricas avançadas

### ✅ **TECH FEATURES - 100% Completo**
- 🔧 **TypeScript 100%** tipado com interfaces robustas
- ⚡ **15+ React Hooks** customizados especializados
- 🔄 **TanStack Query** para cache inteligente e sync
- 🔐 **Environment System** centralizado com validação
- 🛡️ **Error Handling** robusto com fallbacks gracioso
- 📱 **Mobile-First Design** totalmente responsivo

### 🚀 **PRÓXIMAS FEATURES**
- 📍 Sistema de Check-in com QR Codes
- 📱 PWA (Progressive Web App)
- 🔔 Push Notifications
- ⌚ Integração com Wearables
- 📊 Analytics Dashboard

## 🏗️ Stack Tecnológica

### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Ícones**: Lucide React
- **Mapas**: Mapbox GL
- **Roteamento**: React Router DOM

### Backend
- **BaaS**: Supabase (Auth + Database + Storage)
- **Queries**: TanStack Query (React Query)
- **Validação**: Zod + React Hook Form

### Desenvolvimento
- **Plataforma**: Lovable + Cursor
- **Linting**: ESLint + TypeScript ESLint
- **Formatação**: Prettier (configurado no editor)

## 🎮 Sobre o Conceito

O **Agita** transforma atividades físicas em uma experiência gamificada, onde:

- 🏃‍♂️ **Cada atividade** gera moedas SUOR
- 🎯 **Desafios** aumentam engajamento
- 🏆 **Rankings** promovem competição saudável
- 🛒 **Recompensas reais** podem ser resgatadas
- 👥 **Conexão social** motiva participação
- 🏛️ **Integração municipal** conecta com políticas públicas

## 📱 Plataformas Suportadas

### Web (PWA)
- ✅ Chrome Mobile (Android/iOS)
- ✅ Safari Mobile (iOS)
- ✅ Chrome Desktop
- ✅ Firefox Desktop

### Futuro
- 📱 React Native (iOS/Android)
- ⌚ Apple Watch / Wear OS
- 🖥️ Desktop App (Electron)

## 🤝 Como Contribuir

1. **Fork** o projeto
2. **Clone** seu fork
3. **Crie** uma branch para sua feature
4. **Desenvolva** seguindo os padrões do projeto
5. **Teste** suas alterações
6. **Commit** com mensagens descritivas
7. **Push** para sua branch
8. **Abra** um Pull Request

### Padrões de Commit
```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: mudanças de formatação
refactor: refatoração de código
test: adiciona/atualiza testes
chore: tarefas de manutenção
```

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/[username]/agita-suor-sampa/issues)
- **Documentação**: Ver links acima
- **Contato**: [Inserir email de contato]

## 📄 Licença

Este projeto está sob a licença [MIT](./LICENSE).

---

## 🔗 Links Úteis

- **[Lovable Project](https://lovable.dev/projects/88f4572d-439d-4fec-9968-b1b8e9e06885)** - Ambiente de desenvolvimento
- **[Supabase](https://supabase.com)** - Backend as a Service
- **[Tailwind CSS](https://tailwindcss.com)** - Framework CSS
- **[shadcn/ui](https://ui.shadcn.com)** - Componentes UI
- **[Mapbox](https://mapbox.com)** - Mapas e geolocalização

---

*Projeto desenvolvido com ❤️ para promover saúde e bem-estar em São Paulo*
