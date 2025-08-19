# 📋 Referência de Scripts SQL Essenciais

## 🎯 **VISÃO GERAL**

Este documento lista **apenas os scripts SQL essenciais** que devem ser mantidos no projeto, organizados por funcionalidade e ordem de execução.

## 📁 **SCRIPTS MANTIDOS (ESSENCIAIS)**

### **🔐 1. AUTENTICAÇÃO E PERFIS**
| Script | Status | Descrição | Ordem |
|--------|--------|-----------|-------|
| **[TRIGGER_PROFILE_CREATION.sql](./TRIGGER_PROFILE_CREATION.sql)** | ✅ **MANTIDO** | **Trigger automático** para criação de perfis | 1º |
| **[ADD_IS_ADMIN_COLUMN.sql](./ADD_IS_ADMIN_COLUMN.sql)** | ✅ **MANTIDO** | **Adiciona coluna admin** se não existir | 2º |

### **💰 2. SISTEMA SUOR (MOEDA VIRTUAL)**
| Script | Status | Descrição | Ordem |
|--------|--------|-----------|-------|
| **[SUOR_FUNCTIONS.sql](./SUOR_FUNCTIONS.sql)** | ✅ **MANTIDO** | **Funções para transações SUOR** | 3º |
| **[FIX_SUOR_TRANSACTIONS_RLS.sql](./FIX_SUOR_TRANSACTIONS_RLS.sql)** | ✅ **MANTIDO** | **Correção RLS** para transações SUOR | 4º |
| **[ULTRA_SIMPLE_SUOR_FIX.sql](./ULTRA_SIMPLE_SUOR_FIX.sql)** | ✅ **MANTIDO** | **Sincronização final** do sistema SUOR | 5º |

### **🎪 3. SISTEMA DE EVENTOS (NOVO!)**
| Script | Status | Descrição | Ordem |
|--------|--------|-----------|-------|
| **[EVENTS_WITHOUT_ADMIN_CHECK.sql](./EVENTS_WITHOUT_ADMIN_CHECK.sql)** | ✅ **MANTIDO** | **Configuração completa** do sistema de eventos | 6º |
| **[EVENTS_RPC_FUNCTIONS.sql](./EVENTS_RPC_FUNCTIONS.sql)** | ✅ **MANTIDO** | **5 funções RPC** para eventos otimizadas | 7º |

### **🔒 4. SEGURANÇA ADMINISTRATIVA**
| Script | Status | Descrição | Ordem |
|--------|--------|-----------|-------|
| **[FIX_ADMIN_RLS_RECURSION.sql](./FIX_ADMIN_RLS_RECURSION.sql)** | ✅ **MANTIDO** | **Correção de recursão infinita** RLS admin | 8º |
| **[EMERGENCY_RLS_FIX.sql](./EMERGENCY_RLS_FIX.sql)** | ✅ **MANTIDO** | **Script de emergência** para desabilitar RLS | 9º |

### **👥 5. SISTEMA SOCIAL**
| Script | Status | Descrição | Ordem |
|--------|--------|-----------|-------|
| **[SOCIAL_FUNCTIONS.sql](./SOCIAL_FUNCTIONS.sql)** | ✅ **MANTIDO** | **Funções para feed social** | 10º |

### **🗄️ 6. IMPLEMENTAÇÃO COMPLETA**
| Script | Status | Descrição | Ordem |
|--------|--------|-----------|-------|
| **[SUPABASE_IMPLEMENTATION.md](./SUPABASE_IMPLEMENTATION.md)** | ✅ **MANTIDO** | **Guia único** para implementação completa | 11º |

## 🗑️ **SCRIPTS REMOVIDOS (NÃO ESSENCIAIS)**

### **❌ SCRIPTS INTERMEDIÁRIOS REMOVIDOS**
- ~~EVENTS_SIMPLE_SETUP.sql~~ → Substituído por EVENTS_WITHOUT_ADMIN_CHECK.sql
- ~~EVENTS_FINAL_SETUP.sql~~ → Substituído por EVENTS_WITHOUT_ADMIN_CHECK.sql
- ~~FIX_EVENTS_ENUMS.sql~~ → Funcionalidade integrada ao script principal
- ~~EVENTS_DATABASE_SETUP.sql~~ → Substituído por EVENTS_WITHOUT_ADMIN_CHECK.sql
- ~~EVENTS_RPC_FUNCTIONS.sql (versão antiga)~~ → Substituído por versão corrigida

### **❌ SCRIPTS DE DEBUG REMOVIDOS**
- ~~Scripts específicos de correção~~ → Consolidadas nos scripts principais
- ~~Tentativas intermediárias~~ → Substituídas por soluções finais
- ~~Scripts de teste~~ → Funcionalidade integrada aos scripts principais

## 🚀 **ORDEM DE EXECUÇÃO RECOMENDADA**

### **📋 SEQUÊNCIA COMPLETA**
```bash
# 1. Autenticação e Perfis
TRIGGER_PROFILE_CREATION.sql
ADD_IS_ADMIN_COLUMN.sql

# 2. Sistema SUOR
SUOR_FUNCTIONS.sql
FIX_SUOR_TRANSACTIONS_RLS.sql
ULTRA_SIMPLE_SUOR_FIX.sql

# 3. Sistema de Eventos (NOVO!)
EVENTS_WITHOUT_ADMIN_CHECK.sql
EVENTS_RPC_FUNCTIONS.sql

# 4. Segurança Administrativa
FIX_ADMIN_RLS_RECURSION.sql
EMERGENCY_RLS_FIX.sql

# 5. Sistema Social
SOCIAL_FUNCTIONS.sql

# 6. Implementação Completa
SUPABASE_IMPLEMENTATION.md (guia)
```

## 🎯 **FUNCIONALIDADES POR SCRIPT**

### **🔐 TRIGGER_PROFILE_CREATION.sql**
- ✅ **Trigger automático** para criação de perfis
- ✅ **Integração** com Supabase Auth
- ✅ **Políticas RLS** para criação automática

### **💰 SUOR_FUNCTIONS.sql**
- ✅ **Funções para transações** SUOR
- ✅ **Cálculo automático** de recompensas
- ✅ **Integração** com atividades e conquistas

### **🎪 EVENTS_WITHOUT_ADMIN_CHECK.sql**
- ✅ **Tabelas de eventos** (events, event_participants)
- ✅ **Tipos e enums** (event_type, event_category, etc.)
- ✅ **Localização PostGIS** com coordenadas geoespaciais
- ✅ **Políticas RLS** configuradas
- ✅ **Triggers automáticos** para contadores
- ✅ **3 eventos de exemplo** com localizações reais de São Paulo

### **🔧 EVENTS_RPC_FUNCTIONS.sql**
- ✅ **get_nearby_events()** - Busca por proximidade geográfica
- ✅ **get_event_stats()** - Estatísticas gerais
- ✅ **search_events()** - Busca avançada com filtros
- ✅ **get_user_event_participation()** - Verifica participação
- ✅ **update_event_participants_count_manual()** - Atualiza contadores

### **🔒 FIX_ADMIN_RLS_RECURSION.sql**
- ✅ **Correção de recursão infinita** nas políticas RLS
- ✅ **Função RPC** para verificação de admin
- ✅ **Políticas corrigidas** sem loops infinitos

## 📊 **ESTATÍSTICAS FINAIS**

### **📂 ARQUIVOS MANTIDOS**
- **Total**: 12 scripts essenciais
- **Autenticação**: 2 scripts
- **Sistema SUOR**: 3 scripts
- **Sistema de Eventos**: 2 scripts
- **Segurança Admin**: 2 scripts
- **Sistema Social**: 1 script
- **Implementação**: 1 guia

### **🗄️ FUNCIONALIDADES COBERTAS**
- ✅ **Sistema de usuários** completo
- ✅ **Sistema SUOR** funcional
- ✅ **Sistema de eventos** completo
- ✅ **Segurança administrativa** corrigida
- ✅ **Sistema social** configurado
- ✅ **Implementação completa** documentada

## 🎯 **PRÓXIMOS PASSOS**

### **🚀 IMPLEMENTAÇÃO COMPLETA**
1. **Execute os scripts** na ordem recomendada
2. **Teste as funcionalidades** após cada execução
3. **Verifique as políticas RLS** configuradas
4. **Teste as funções RPC** criadas

### **🔧 MANUTENÇÃO**
- **Mantenha apenas** os scripts listados acima
- **Atualize a documentação** quando necessário
- **Teste regularmente** as funcionalidades implementadas

---

## 📝 **NOTAS IMPORTANTES**

### **✅ BOAS PRÁTICAS**
- **Execute scripts na ordem** recomendada
- **Teste cada funcionalidade** após implementação
- **Mantenha backup** antes de execuções críticas
- **Documente alterações** realizadas

### **⚠️ ATENÇÃO**
- **Não execute scripts** fora de ordem
- **Verifique dependências** antes da execução
- **Teste em ambiente** de desenvolvimento primeiro
- **Mantenha scripts** atualizados com correções

---

*📋 Referência atualizada: Janeiro 2025 - Sistema de Eventos Implementado + Scripts Consolidados! 🚀*