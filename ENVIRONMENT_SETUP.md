# 🔐 Guia de Configuração - Environment Variables

## 📋 **Visão Geral**

O projeto Agita utiliza variáveis de ambiente para gerenciar configurações sensíveis e específicas do ambiente. Este guia explica como configurar corretamente todas as variáveis necessárias.

---

## 🚀 **Setup Rápido - Método Automático**

### **Opção 1: Script Interativo (Recomendado)**
```bash
# Execute o script de setup automático
npm run setup:env
# ou
bun run setup:env
```

O script irá:
- ✅ Criar o arquivo `.env.local` automaticamente
- ✅ Solicitar suas chaves passo a passo
- ✅ Configurar valores padrão sensatos
- ✅ Validar as configurações

### **Opção 2: Cópia Manual**
```bash
# Copie o arquivo de exemplo (recomendado)
cp example.env.local .env.local

# Ou use o arquivo genérico
cp environment.example .env.local

# Edite o arquivo com suas chaves
nano .env.local  # ou seu editor preferido
```

---

## 🔧 **Configuração Manual Detalhada**

### **1. 🚀 Supabase (OBRIGATÓRIO)**

```bash
# ====================================
# 🚀 SUPABASE CONFIGURATION
# ====================================
VITE_SUPABASE_URL=https://sua-url-do-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_publica_aqui
```

**Como obter:**
1. Acesse [supabase.com](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **Settings** → **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys** → `anon/public` → `VITE_SUPABASE_ANON_KEY`

### **2. 🗺️ Mapbox (OPCIONAL)**

```bash
# ====================================
# 🗺️ MAPBOX CONFIGURATION
# ====================================
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoibWV1dXN1YXJpbyIsImEiOiJjbGdrbm...
```

**Como obter:**
1. Acesse [mapbox.com](https://account.mapbox.com/access-tokens/)
2. Crie uma conta gratuita
3. Copie o **Default public token** ou crie um novo
4. O token deve começar com `pk.`

**💡 Nota:** Se não configurar, os mapas não funcionarão. A aplicação mostrará instruções de configuração.

### **3. 🏃‍♂️ Configurações da Aplicação**

```bash
# ====================================
# 🏃‍♂️ APPLICATION SETTINGS
# ====================================
VITE_APP_NAME=Agita
VITE_APP_VERSION=0.2.0
VITE_APP_ENVIRONMENT=development
VITE_APP_BASE_URL=http://localhost:5173
```

### **4. 💰 Sistema SUOR**

```bash
# ====================================
# 💰 SUOR SYSTEM SETTINGS
# ====================================
VITE_SUOR_INITIAL_BALANCE=100
VITE_SUOR_MAX_DAILY_EARNED=1000
VITE_SUOR_STREAK_BONUS=50
```

### **5. 🔒 Configurações de Segurança**

```bash
# ====================================
# 🔒 SECURITY SETTINGS
# ====================================
VITE_ENABLE_RATE_LIMITING=true
VITE_MAX_UPLOAD_SIZE_MB=10
VITE_SESSION_TIMEOUT_MINUTES=60
```

### **6. 🧪 Configurações de Desenvolvimento**

```bash
# ====================================
# 🧪 DEVELOPMENT SETTINGS
# ====================================
VITE_ENABLE_DEBUG_MODE=true
VITE_SHOW_DEV_TOOLS=true
VITE_ENABLE_MOCK_DATA=false
```

---

## 📱 **Configuração por Ambiente**

### **🟢 Development (Desenvolvimento)**
```bash
VITE_APP_ENVIRONMENT=development
VITE_ENABLE_DEBUG_MODE=true
VITE_SHOW_DEV_TOOLS=true
VITE_APP_BASE_URL=http://localhost:5173
```

### **🟡 Staging (Teste)**
```bash
VITE_APP_ENVIRONMENT=staging
VITE_ENABLE_DEBUG_MODE=false
VITE_SHOW_DEV_TOOLS=false
VITE_APP_BASE_URL=https://staging.agita.com
```

### **🔴 Production (Produção)**
```bash
VITE_APP_ENVIRONMENT=production
VITE_ENABLE_DEBUG_MODE=false
VITE_SHOW_DEV_TOOLS=false
VITE_APP_BASE_URL=https://agita.com
```

---

## 🌍 **APIs Externas (Futuro)**

Para futuras integrações, estas variáveis estão disponíveis:

```bash
# ====================================
# 🌍 EXTERNAL APIS (OPCIONAL)
# ====================================

# Google Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Sentry (monitoramento de erros)
VITE_SENTRY_DSN=https://your-sentry-dsn-here

# OpenWeatherMap (dados de clima)
VITE_OPENWEATHER_API_KEY=your_weather_api_key_here

# Google Places API (busca de locais)
VITE_GOOGLE_PLACES_API_KEY=your_google_places_key_here

# Strava API (integração fitness)
VITE_STRAVA_CLIENT_ID=your_strava_client_id
VITE_STRAVA_CLIENT_SECRET=your_strava_client_secret
```

---

## 🗺️ **Sistema de Mapas Melhorado**

### **Configuração Automática**
- ✅ **Detecção automática** da chave do Mapbox
- ✅ **Validação inteligente** do token
- ✅ **Fallback gracioso** quando não configurado
- ✅ **Mensagens de erro** informativas

### **Utilitários Disponíveis**
O projeto inclui utilitários para trabalhar com mapas:
- `isMapboxConfigured()` - Verificar se está configurado
- `getMapboxToken()` - Obter token com validação
- `logMapboxConfig()` - Debug da configuração

### **Como Funciona**
1. **Token configurado**: Mapas carregam automaticamente
2. **Token não configurado**: Mostra instruções claras
3. **Token inválido**: Detecta e informa o erro
4. **Debug mode**: Logs detalhados no console

---

## ✅ **Validação e Testes**

### **Validar Configuração**
```bash
# Verificar se as variáveis estão corretas
npm run env:validate
# ou
bun run env:validate
```

### **Testar Aplicação**
```bash
# Executar em desenvolvimento
npm run dev
# ou
bun dev
```

### **Verificar Console**
Se `VITE_ENABLE_DEBUG_MODE=true`, você verá no console:
```
🔐 Environment Configuration
App: {name: "Agita", version: "0.2.0", ...}
Supabase URL: https://sua-url...
Mapbox Token: ✅ Configurado / ❌ Não configurado
SUOR Settings: {initialBalance: 100, ...}
```

---

## 🔒 **Segurança**

### **❌ NÃO FAÇA:**
- ❌ Nunca commite arquivos `.env*` no Git
- ❌ Não compartilhe chaves privadas
- ❌ Não use chaves de produção em desenvolvimento

### **✅ FAÇA:**
- ✅ Use `.env.local` para desenvolvimento
- ✅ Configure `.env.production` no servidor
- ✅ Mantenha chaves de ambiente separadas
- ✅ Use HTTPS em produção

### **🛡️ Proteção Automática:**
O projeto já inclui no `.gitignore`:
```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.staging
```

---

## 🐛 **Solução de Problemas**

### **❌ Erro: "Variáveis de ambiente do Supabase não configuradas"**
**Solução:**
1. Verifique se o arquivo `.env.local` existe
2. Confirme se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão preenchidos
3. Reinicie o servidor de desenvolvimento

### **❌ Mapa não carrega**
**Possíveis causas:**
1. `VITE_MAPBOX_ACCESS_TOKEN` não configurado
2. Token inválido ou expirado
3. Cota do Mapbox esgotada

**Solução:**
1. Configure o token no `.env.local`
2. Verifique se o token é válido no [Mapbox Dashboard](https://account.mapbox.com/)

### **❌ Dados não carregam do Supabase**
**Possíveis causas:**
1. URL ou chave incorreta
2. RLS (Row Level Security) bloqueando
3. Tabelas não criadas

**Solução:**
1. Valide as configurações: `npm run env:validate`
2. Verifique se seguiu os passos do [SUPABASE_IMPLEMENTATION.md](./SUPABASE_IMPLEMENTATION.md)
3. Confirme se executou [CREATE_TABLES_SUPABASE.md](./CREATE_TABLES_SUPABASE.md)

---

## 📚 **Referências**

- **Vite Environment Variables:** [vitejs.dev/guide/env-and-mode](https://vitejs.dev/guide/env-and-mode.html)
- **Supabase Setup:** [supabase.com/docs/guides/getting-started](https://supabase.com/docs/guides/getting-started)
- **Mapbox Tokens:** [docs.mapbox.com/help/getting-started/access-tokens](https://docs.mapbox.com/help/getting-started/access-tokens)

---

## 📞 **Suporte**

Se encontrar problemas:
1. Consulte a [documentação principal](./README.md)
2. Verifique os [scripts de implementação](./SUPABASE_IMPLEMENTATION.md)
3. Execute `npm run env:validate` para diagnóstico

---

*📈 Documentação atualizada em Dezembro 2024* 