# 🔍 Debug: OAuth Google + Database Error

## ❌ **Problema Identificado**
- OAuth Google funciona (autorização ok)
- Erro: "Database error saving new user" 
- Aplicação na porta 8080

## 🛠️ **Verificações Necessárias no Supabase**

### **1. Callback URLs no Supabase**
No Dashboard Supabase → Authentication → URL Configuration:

**Site URL:**
```
http://localhost:8080
```

**Redirect URLs:**
```
http://localhost:8080/auth/callback
http://localhost:8080/**
```

### **2. Políticas RLS (Row Level Security)**

Execute no **SQL Editor** do Supabase:

```sql
-- Verificar se as políticas estão corretas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- Verificar se o trigger existe
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_schema = 'auth';

-- Testar criação manual de perfil
SELECT create_profile_for_user();
```

### **3. Configuração OAuth Google**
No **Google Cloud Console**:

1. **APIs & Services** → **Credentials**
2. **OAuth 2.0 Client IDs** → Seu projeto
3. **Authorized redirect URIs:**
   ```
   https://jjlgmxbgxbcksvviuhmo.supabase.co/auth/v1/callback
   ```

### **4. Script de Correção RLS**

Execute no SQL Editor para corrigir políticas:

```sql
-- Habilitar RLS na tabela profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários criem seu próprio perfil
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
CREATE POLICY "Users can create own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para permitir que usuários vejam seu próprio perfil  
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para permitir que usuários atualizem seu próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política ESPECIAL para o trigger automático
DROP POLICY IF EXISTS "Enable automatic profile creation" ON profiles;
CREATE POLICY "Enable automatic profile creation" ON profiles
  FOR INSERT WITH CHECK (true);
```

### **5. Recriar Trigger com Privilégios Corretos**

```sql
-- Dropar trigger existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_profile_for_user();

-- Recriar função com SECURITY DEFINER
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    city, 
    fitness_level,
    level,
    experience_points,
    total_suor,
    current_suor,
    is_public,
    allow_friend_requests,
    notification_preferences
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'São Paulo',
    'beginner',
    1,
    0,
    100.0,
    100.0,
    true,
    true,
    '{}'::jsonb
  );
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();
```

### **6. Testar Criação Manual**

```sql
-- Verificar se consegue inserir manualmente
INSERT INTO profiles (id, full_name, city, fitness_level, level, experience_points, total_suor, current_suor)
VALUES ('00000000-0000-0000-0000-000000000000', 'Teste', 'São Paulo', 'beginner', 1, 0, 100.0, 100.0);

-- Se der erro, verificar estrutura da tabela
\d profiles;
```

## 🚀 **Ordem de Execução**

1. **Configurar URLs no Supabase**
2. **Executar script RLS**
3. **Executar script do trigger**
4. **Testar login novamente**

## 📍 **Log de Debug**

Após executar as correções, teste novamente e verifique no console:
- `🔐 AuthContext: Iniciando login social com google`
- `✅ Login google iniciado com sucesso`
- `📍 AuthCallback: loading=false, user=true`

Se ainda der erro, execute no SQL Editor:
```sql
SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 1;
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 1;
```