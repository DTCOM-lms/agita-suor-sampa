-- 🔍 VERIFICAÇÃO RÁPIDA - SUOR SINCRONIZADO
-- 
-- Execute este script APÓS executar SYNC_CURRENT_USER_SUOR.sql
-- para confirmar que a inconsistência foi corrigida

-- ✅ VERIFICAÇÃO FINAL
SELECT 
  p.id as user_id,
  p.current_suor as profile_suor,
  p.total_suor as profile_total,
  COALESCE(SUM(a.suor_earned), 0) as activities_suor,
  COUNT(a.id) as total_activities,
  (p.current_suor - COALESCE(SUM(a.suor_earned), 0)) as diferenca,
  CASE 
    WHEN p.current_suor = COALESCE(SUM(a.suor_earned), 0) THEN '✅ SINCRONIZADO'
    WHEN p.current_suor > COALESCE(SUM(a.suor_earned), 0) THEN '⚠️ PERFIL AINDA MAIOR'
    ELSE '❌ PERFIL MENOR'
  END as status_final
FROM profiles p
LEFT JOIN activities a ON p.id = a.user_id 
  AND a.status = 'completed' 
  AND a.suor_earned IS NOT NULL
WHERE p.id = auth.uid()
GROUP BY p.id, p.current_suor, p.total_suor;

-- 🎯 RESULTADO ESPERADO:
-- profile_suor = 9
-- activities_suor = 9
-- diferenca = 0
-- status_final = ✅ SINCRONIZADO