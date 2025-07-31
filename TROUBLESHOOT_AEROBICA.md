# 🚨 Debug: Problema com Atividade Aeróbica

## 🔍 **DIAGNÓSTICO PASSO-A-PASSO**

O problema "Aeróbica ativa GPS mas deveria ser manual" pode ter 3 causas:

### **1. Problema no Backend (Banco)**
- Campo `supports_gps` ainda é `true` 
- Atividade não foi corrigida no script SQL

### **2. Problema na Busca (Query)**
- RPC function não retorna `supports_gps` correto
- Cache do TanStack Query desatualizado

### **3. Problema no Frontend (Lógica)**
- `requiresGPS` não detecta `supports_gps = false`
- Lógica de decisão GPS vs Manual falha

---

## 🧪 **TESTE DIAGNÓSTICO**

### **PASSO 1: Verificar Backend**
Execute no **Supabase SQL Editor**:
```sql
-- Copie e cole o conteúdo de DEBUG_AEROBICA_ISSUE.sql
```

**✅ RESULTADO ESPERADO:**
```sql
name     | supports_gps | base_suor_per_minute
---------|-------------|--------------------
Aeróbica | false       | 6
```

**❌ SE APARECER:**
```sql
Aeróbica | true | 6    ← PROBLEMA NO BANCO!
```

### **PASSO 2: Verificar Frontend**
1. **Abra DevTools** (F12) → Console
2. **Limpe o console** (Ctrl+L)
3. **Vá para atividade Aeróbica**
4. **Analise os logs**:

**✅ LOGS CORRETOS:**
```javascript
🔍 useActivityType - Buscando: aeróbica
✅ Resultado RPC: { name: "Aeróbica", supports_gps: false }
🔴 AERÓBICA - DADOS DO BANCO: { supports_gps: false }
🔍 ATIVIDADE DEBUG COMPLETO: { supports_gps: false, requiresGPS: false }
🚀 INICIANDO ATIVIDADE: { DECISION: "VAI USAR TIMER MANUAL" }
✅ OK: Aeróbica vai usar timer manual
```

**❌ LOGS COM PROBLEMA:**
```javascript
🔴 AERÓBICA - DADOS DO BANCO: { supports_gps: true }  ← BANCO ERRADO
// OU
🔍 ATIVIDADE DEBUG: { requiresGPS: true }             ← LÓGICA ERRADA
// OU  
🚀 DECISION: "VAI USAR GPS"                           ← RESULTADO ERRADO
```

### **PASSO 3: Verificar Interface**
**✅ INTERFACE CORRETA:**
- Botão: **"Iniciar Timer"** (não "Iniciar com GPS")
- Toast: **"Atividade iniciada! Timer ativo."**
- Timer conta: **0:01, 0:02, 0:03...**

**❌ INTERFACE ERRADA:**
- Botão: **"Iniciar com GPS"** 
- Toast: **"GPS ativado!"**
- Timer: **00:00** (não avança)

---

## 🔧 **CORREÇÕES ESPECÍFICAS**

### **CORREÇÃO 1: Backend (se supports_gps = true)**
```sql
-- Execute no Supabase SQL Editor
UPDATE activity_types 
SET supports_gps = false 
WHERE name ILIKE '%aeróbica%' OR name ILIKE '%aerobica%';

-- Verificar se funcionou
SELECT name, supports_gps FROM activity_types 
WHERE name ILIKE '%aeróbica%';
```

### **CORREÇÃO 2: Cache Frontend (se banco OK mas frontend errado)**
```javascript
// No DevTools Console, execute:
localStorage.clear();
// Depois recarregue a página (F5)
```

### **CORREÇÃO 3: Forçar Refresh Query**
```javascript
// No DevTools Console, execute:
// (isso força o TanStack Query a buscar dados novos)
window.location.reload();
```

---

## 🎯 **ROTEIRO DE SOLUÇÃO**

### **Se Banco Errado (supports_gps = true):**
1. ✅ Execute `DEBUG_AEROBICA_ISSUE.sql`
2. ✅ Verifique se `supports_gps = false` após script
3. ✅ Limpe cache frontend (`localStorage.clear()`)
4. ✅ Teste novamente

### **Se Frontend Errado (banco OK):**
1. ✅ Recarregue página (F5)
2. ✅ Teste em aba anônima/privada
3. ✅ Verifique logs no console
4. ✅ Se ainda falhar, há bug na lógica

### **Se Lógica Errada (dados OK):**
1. ✅ Verifique logs: `requiresGPS` deve ser `false`
2. ✅ Se `requiresGPS = true` mas `supports_gps = false`, há bug
3. ✅ Me informe os logs exatos para correção

---

## 📋 **CHECKLIST FINAL**

Execute e me informe os resultados:

- [ ] **SQL executado**: `DEBUG_AEROBICA_ISSUE.sql`
- [ ] **Backend corrigido**: `supports_gps = false` para Aeróbica
- [ ] **Cache limpo**: `localStorage.clear()` + F5
- [ ] **Logs verificados**: Console mostra dados corretos
- [ ] **Interface testada**: Botão mostra "Iniciar Timer"
- [ ] **Timer funcionando**: Conta 0:01, 0:02, 0:03...

---

## 🎯 **PRÓXIMO PASSO**

**Execute o script SQL e me informe:**

1. **O que aparece** quando executa `DEBUG_AEROBICA_ISSUE.sql`
2. **Os logs do console** quando testa Aeróbica após SQL
3. **Se o botão** mostra "Iniciar Timer" ou "Iniciar com GPS"
4. **Se o timer** conta ou fica parado

Com essas informações, posso identificar exatamente onde está o problema!