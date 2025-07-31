# 🧪 Teste Manual Activity - Guia de Debug

## 🔍 **PASSOS PARA IDENTIFICAR O PROBLEMA**

### **1. Verificar Backend no Supabase**
Execute no **Supabase SQL Editor**:

```sql
-- 1. Verificar se a coluna supports_gps existe
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'activity_types' AND column_name = 'supports_gps';

-- 2. Verificar atividades que deveriam ser manuais
SELECT name, supports_gps, base_suor_per_minute 
FROM activity_types 
WHERE name IN ('Musculação', 'Yoga', 'Pilates') 
AND is_active = true;

-- 3. Se não existir ou estiver null, corrigir:
UPDATE activity_types 
SET supports_gps = false 
WHERE name IN ('Musculação', 'Yoga', 'Pilates', 'Crossfit', 'Aeróbica') 
AND is_active = true;
```

### **2. Verificar Debug no Frontend**
1. **Abra o DevTools** (F12) 
2. **Vá para Console**
3. **Inicie uma atividade** (ex: Musculação)
4. **Procure pelas mensagens:**

**✅ Deve aparecer:**
```
🔍 ActivityTracking Debug: {
  activityName: "Musculação",
  supports_gps: false,      // ← DEVE SER FALSE
  requiresGPS: false,       // ← DEVE SER FALSE
  isManualTracking: false,  // ← INICIAL
  finalIsTracking: false    // ← INICIAL
}

🚀 Iniciando atividade: {
  name: "Musculação",
  supports_gps: false,      // ← CONFIRMA FALSE
  requiresGPS: false        // ← CONFIRMA FALSE
}

⏱️ Iniciando timer manual para atividade sem GPS

⏱️ Timer Effect: {
  requiresGPS: false,       // ← DEVE SER FALSE
  isManualTracking: true,   // ← DEVE SER TRUE
  shouldStartTimer: true    // ← DEVE SER TRUE
}

▶️ Iniciando interval do timer manual
⏱️ Timer tick: 1
⏱️ Timer tick: 2
...
```

**❌ Se aparecer diferente:**

### **Problema 1: supports_gps = true ou null**
```
supports_gps: true        // ← PROBLEMA!
requiresGPS: true         // ← PROBLEMA!
```
**Solução:** Execute o script SQL acima para corrigir.

### **Problema 2: Timer não inicia**
```
shouldStartTimer: false   // ← PROBLEMA!
```
**Solução:** Verifique se isManualTracking está sendo setado.

### **Problema 3: ActivityTypeData null**
```
⚠️ ActivityTypeData não carregado ainda
```
**Solução:** Problema de conectividade ou ID inválido.

## 🛠️ **CORREÇÕES RÁPIDAS**

### **Correção 1: Forçar supports_gps = false**
Se o campo está null ou true, execute:
```sql
-- Execute no Supabase SQL Editor
UPDATE activity_types 
SET supports_gps = false 
WHERE name ILIKE '%musculação%' 
   OR name ILIKE '%yoga%' 
   OR name ILIKE '%pilates%'
   OR category = 'strength';
```

### **Correção 2: Inserir tipos missing**
Se não existem tipos de atividade:
```sql
-- Execute no Supabase SQL Editor  
INSERT INTO activity_types (name, category, difficulty, base_suor_per_minute, intensity_multiplier, supports_gps, is_active)
VALUES 
('Musculação', 'strength', 'medium', 8, 1.2, false, true),
('Yoga', 'flexibility', 'easy', 4, 0.8, false, true),
('Pilates', 'flexibility', 'medium', 6, 1.0, false, true)
ON CONFLICT (name) DO UPDATE SET supports_gps = EXCLUDED.supports_gps;
```

### **Correção 3: Verificar function RPC**
```sql
-- Testar function
SELECT * FROM get_activity_type_by_name_or_id('musculação');
-- Deve retornar supports_gps = false
```

## 📋 **CHECKLIST DE TROUBLESHOOTING**

- [ ] **Backend**: Executei `DIAGNOSE_MANUAL_ACTIVITY_ISSUE.sql`
- [ ] **Backend**: `supports_gps = false` para atividades indoor  
- [ ] **Frontend**: Console mostra `supports_gps: false`
- [ ] **Frontend**: Console mostra `requiresGPS: false`
- [ ] **Frontend**: Console mostra `isManualTracking: true` após iniciar
- [ ] **Frontend**: Console mostra timer ticks (1, 2, 3...)
- [ ] **Interface**: Botão muda de "Iniciar" para "Pausar/Finalizar"
- [ ] **Interface**: Timer na tela conta (0:01, 0:02, 0:03...)
- [ ] **Interface**: SUOR aumenta conforme o tempo

## 🎯 **RESULTADO ESPERADO**

Após executar as correções:

1. **Inicie uma atividade indoor** (Musculação, Yoga, etc.)
2. **Deve iniciar sem pedir GPS**
3. **Timer deve contar**: 0:01, 0:02, 0:03...
4. **SUOR deve aumentar** conforme tempo passa
5. **Interface deve mostrar** stats relevantes para atividade manual

---

**🔧 Se ainda não funcionar após essas correções, execute o script completo `FIX_MANUAL_ACTIVITY_TRACKING.sql` no Supabase SQL Editor.**