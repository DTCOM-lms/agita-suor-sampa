-- 🔄 SYNC CURRENT USER SUOR - Correção Rápida para Inconsistência
-- 
-- PROBLEMA: profile.current_suor (19) ≠ soma das atividades (9 SUOR)
-- SOLUÇÃO: Sincronizar profile.current_suor com dados reais das atividades
--
-- Execute este script no Supabase SQL Editor

-- 1️⃣ VERIFICAR INCONSISTÊNCIA ATUAL
SELECT 
  p.id as user_id,
  p.current_suor as profile_suor,
  p.total_suor as profile_total,
  COALESCE(SUM(a.suor_earned), 0) as activities_suor,
  COUNT(a.id) as total_activities,
  (p.current_suor - COALESCE(SUM(a.suor_earned), 0)) as diferenca,
  CASE 
    WHEN p.current_suor = COALESCE(SUM(a.suor_earned), 0) THEN '✅ SINCRONIZADO'
    WHEN p.current_suor > COALESCE(SUM(a.suor_earned), 0) THEN '⚠️ PERFIL MAIOR'
    ELSE '❌ PERFIL MENOR'
  END as status
FROM profiles p
LEFT JOIN activities a ON p.id = a.user_id 
  AND a.status = 'completed' 
  AND a.suor_earned IS NOT NULL
WHERE p.id = auth.uid()
GROUP BY p.id, p.current_suor, p.total_suor;

-- 2️⃣ CORRIGIR AUTOMATICAMENTE O PERFIL ATUAL
WITH activity_totals AS (
  SELECT 
    user_id,
    COALESCE(SUM(suor_earned), 0) as total_suor_from_activities,
    COUNT(*) as completed_activities
  FROM activities 
  WHERE user_id = auth.uid() 
    AND status = 'completed' 
    AND suor_earned IS NOT NULL
  GROUP BY user_id
)
UPDATE profiles 
SET 
  current_suor = activity_totals.total_suor_from_activities,
  total_suor = activity_totals.total_suor_from_activities,
  total_activities = activity_totals.completed_activities,
  updated_at = NOW()
FROM activity_totals 
WHERE profiles.id = auth.uid()
  AND profiles.id = activity_totals.user_id;

-- 3️⃣ VERIFICAR RESULTADO FINAL
SELECT 
  p.id as user_id,
  p.current_suor as profile_suor_atualizado,
  p.total_suor as profile_total_atualizado,
  COALESCE(SUM(a.suor_earned), 0) as activities_suor,
  COUNT(a.id) as total_activities,
  CASE 
    WHEN p.current_suor = COALESCE(SUM(a.suor_earned), 0) THEN '✅ CORRIGIDO COM SUCESSO'
    ELSE '❌ AINDA HÁ PROBLEMA'
  END as resultado_final
FROM profiles p
LEFT JOIN activities a ON p.id = a.user_id 
  AND a.status = 'completed' 
  AND a.suor_earned IS NOT NULL
WHERE p.id = auth.uid()
GROUP BY p.id, p.current_suor, p.total_suor;

-- 💡 INSTRUÇÕES:
-- 1. Execute este script no Supabase SQL Editor
-- 2. Veja o resultado das 3 consultas
-- 3. Atualize a página do aplicativo (Ctrl+F5)
-- 4. Verifique se o SUOR agora aparece consistente (9 SUOR em todos os locais)
-- 5. Se ainda aparecer inconsistência visual (⚠️19), aguarde alguns segundos para o cache atualizar

-- 🎯 RESULTADO ESPERADO:
-- - Primeira consulta: ⚠️ PERFIL MAIOR (mostra inconsistência)
-- - Segunda consulta: Atualiza profile.current_suor de 19 para 9
-- - Terceira consulta: ✅ CORRIGIDO COM SUCESSO