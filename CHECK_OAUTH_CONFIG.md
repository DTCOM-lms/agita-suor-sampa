# ✅ **CHECKLIST: Configuração OAuth Google**

## 🔧 **1. Configurações no Supabase Dashboard**

### **Authentication → URL Configuration**
```
Site URL: http://localhost:8080
```

### **Redirect URLs** (adicionar todas):
```
http://localhost:8080/auth/callback
http://localhost:8080/**
```

### **Provider: Google**
- ✅ Enabled: ON
- ✅ Client ID: [seu-google-client-id]
- ✅ Client Secret: [seu-google-client-secret]

## 🔧 **2. Configurações no Google Cloud Console**

### **APIs & Services → Credentials → OAuth 2.0 Client**

**Authorized JavaScript origins:**
```
http://localhost:8080
```

**Authorized redirect URIs:**
```
https://jjlgmxbgxbcksvviuhmo.supabase.co/auth/v1/callback
```

## 🔧 **3. Execute o Script SQL**

No **SQL Editor** do Supabase, execute:
```sql
-- Copie e cole o conteúdo de FIX_OAUTH_DATABASE_ERROR.sql
```

## 🔧 **4. Verificar Estrutura da Tabela**

Execute no SQL Editor:
```sql
-- Verificar colunas da tabela profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
```

## 🔧 **5. Logs para Debug**

Após as correções, o console deve mostrar:
```
🔐 AuthContext: Iniciando login social com google
✅ Login google iniciado com sucesso. Redirecionando...
📍 AuthCallback: loading=false, user=true
✅ AuthCallback: Usuário autenticado, redirecionando...
```

## ❌ **Se ainda der erro:**

1. **Verificar logs do Supabase:**
   - Dashboard → Logs → Auth
   - Procurar por erros relacionados ao trigger

2. **Testar criação manual:**
   ```sql
   -- No SQL Editor
   INSERT INTO profiles (id, full_name, city, fitness_level, level, experience_points, total_suor, current_suor)
   VALUES (gen_random_uuid(), 'Teste Manual', 'São Paulo', 'beginner', 1, 0, 100.0, 100.0);
   ```

3. **Verificar se todas as colunas existem:**
   ```sql
   -- Verificar estrutura
   \d profiles;
   ```

## 🚀 **Ordem de Execução:**

1. ✅ **Configurar URLs no Supabase**
2. ✅ **Configurar URLs no Google Cloud**  
3. ✅ **Executar FIX_OAUTH_DATABASE_ERROR.sql**
4. ✅ **Testar login novamente**
5. ✅ **Verificar logs no console**