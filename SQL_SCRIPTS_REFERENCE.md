# 📚 Referência de Scripts SQL - Agita

Este documento lista todos os scripts SQL essenciais do projeto e suas funções.

## 🗄️ Scripts Essenciais (Mantidos)

### **🔧 Scripts de Correção de Bugs**

#### `FIX_ACTIVITY_TRACKING_ERRORS.sql`
**Função**: Corrige erros de loading infinito e compatibilidade UUID/string
- ✅ Adiciona coluna `unlocked_at` em `user_achievements`
- ✅ Migra dados de `completed_at` para `unlocked_at`
- ✅ Cria função `get_activity_type_by_name_or_id` para busca flexível
- ✅ Adiciona colunas `progress_value` e `is_notified`

#### `FIX_ACTIVITIES_TABLE_SCHEMA.sql`
**Função**: Corrige schema inconsistências na tabela activities
- ✅ Adiciona colunas missing: `is_public`, `start_time`, `end_time`, etc.
- ✅ Cria triggers de sincronização de timestamps
- ✅ Atualiza políticas RLS
- ✅ Cria índices otimizados

#### `FIXED_INVESTIGATE_INTENSITY_MULTIPLIER.sql`
**Função**: Resolve definitivamente o erro "intensity_multiplier is ambiguous"
- ✅ Remove functions duplicadas sistematicamente
- ✅ Elimina triggers conflitantes
- ✅ Remove coluna `intensity_multiplier` de `activities`
- ✅ Testa INSERT para validação
- ✅ **SCRIPT FINAL QUE RESOLVEU O PROBLEMA**

### **🔐 Scripts de Autenticação**

#### `FIX_OAUTH_DATABASE_ERROR.sql`
**Função**: Corrige erros de OAuth e criação de perfis
- ✅ Cria função `create_profile_for_user` com SECURITY DEFINER
- ✅ Atualiza políticas RLS para permitir auto-criação
- ✅ Corrige triggers de criação de perfil
- ✅ Trata exceções para não quebrar login

#### `TRIGGER_PROFILE_CREATION.sql`
**Função**: Triggers automáticos para criação e atualização de perfis
- ✅ Trigger `on_auth_user_created` para auto-criação
- ✅ Trigger `update_profiles_updated_at` para timestamps
- ✅ Função `update_updated_at_column` genérica

### **💰 Scripts do Sistema SUOR**

#### `SUOR_FUNCTIONS.sql`
**Função**: Funções principais do sistema de moeda virtual SUOR
- ✅ Função `update_user_suor` para atualizar saldo
- ✅ Função `calculate_activity_suor` para cálculo automático
- ✅ Business logic para transações SUOR

### **👥 Scripts do Sistema Social**

#### `SOCIAL_FUNCTIONS.sql`
**Função**: Funções para o sistema social (likes, comentários)
- ✅ `increment_post_likes` / `decrement_post_likes`
- ✅ `increment_post_comments` / `decrement_post_comments`
- ✅ `increment_comment_likes` / `decrement_comment_likes`
- ✅ `cleanup_comment_likes` com trigger automático
- ✅ Atomic operations para performance

## 🗑️ Scripts Removidos (Desnecessários)

### **❌ Tentativas de Fix que Falharam**
- `INVESTIGATE_INTENSITY_MULTIPLIER.sql` - arquivo vazio
- `DEEP_FIX_INTENSITY_MULTIPLIER.sql` - tentativa radical que falhou
- `EMERGENCY_FIX_INTENSITY_MULTIPLIER.sql` - tentativa de emergência que falhou
- `SIMPLE_FIX_INTENSITY_MULTIPLIER.sql` - tentativa simples que falhou
- `FIX_INTENSITY_MULTIPLIER_AMBIGUITY.sql` - primeira tentativa que falhou

### **❌ Scripts Incorporados ou Não Necessários**
- `FIX_ACTIVITY_STATUS_ENUM.sql` - resolvido via frontend
- `QUICK_DISABLE_RLS.sql` - não foi necessário desabilitar RLS

### **❌ Documentos Summary Individuais (Consolidados)**
- `ACTIVITY_TRACKING_FIX_SUMMARY.md`
- `ACTIVITY_STATUS_FIX_SUMMARY.md`
- `FIX_IS_PUBLIC_ERROR_SUMMARY.md`
- `INTENSITY_MULTIPLIER_AMBIGUITY_FIX_SUMMARY.md`

**📖 Informações consolidadas em**: `BUG_FIXES_CONSOLIDATED_v0.2.5.md`

## 📋 Como Usar os Scripts

### **🔄 Para aplicar todos os fixes em um novo ambiente:**
```sql
-- Execute na ordem:
1. TRIGGER_PROFILE_CREATION.sql
2. FIX_OAUTH_DATABASE_ERROR.sql
3. SUOR_FUNCTIONS.sql
4. SOCIAL_FUNCTIONS.sql
5. FIX_ACTIVITY_TRACKING_ERRORS.sql
6. FIX_ACTIVITIES_TABLE_SCHEMA.sql
7. FIXED_INVESTIGATE_INTENSITY_MULTIPLIER.sql (se necessário)
```

### **🔍 Para diagnosticar problemas:**
```sql
-- Verificar se as correções foram aplicadas:
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_achievements' AND column_name = 'unlocked_at';

SELECT column_name FROM information_schema.columns 
WHERE table_name = 'activities' AND column_name = 'is_public';

SELECT column_name FROM information_schema.columns 
WHERE table_name = 'activities' AND column_name = 'intensity_multiplier';
-- Esta deve retornar 0 rows (coluna removida)
```

### **⚠️ Scripts de Emergência:**
Se algum problema crítico voltar:
1. **Primeiro**: Execute `FIXED_INVESTIGATE_INTENSITY_MULTIPLIER.sql`
2. **Segundo**: Verifique logs do frontend (Network tab)
3. **Terceiro**: Consulte `BUG_FIXES_CONSOLIDATED_v0.2.5.md`

## 📊 Status Atual

- ✅ **7 scripts essenciais** mantidos e organizados
- ✅ **11 arquivos desnecessários** removidos
- ✅ **Documentação consolidada** em documento único
- ✅ **Sistema limpo** e maintível
- ✅ **Todos os bugs críticos** resolvidos

---

**🎯 Objetivo**: Manter apenas os scripts essenciais e funcionais, eliminando confusão e mantendo o projeto organizado.

*Última atualização: Janeiro 2025 - Organização completa! 🚀*