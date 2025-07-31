import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from './useUserStats';
import { useSuorBalance } from './useSuor';

/**
 * Hook para debug e verificação de consistência do sistema SUOR
 * Compara valores de diferentes fontes para identificar discrepâncias
 */
export const useSuorDebug = () => {
  const { profile } = useAuth();
  const { data: userStats } = useUserStats();
  const { currentSuor, totalSuor } = useSuorBalance();

  const debug = {
    // Dados do perfil (banco de dados direto)
    profile: {
      current_suor: profile?.current_suor || 0,
      total_suor: profile?.total_suor || 0,
    },
    
    // Dados calculados das atividades
    activities: {
      total_suor_earned: userStats?.total_suor_earned || 0,
      total_activities: userStats?.total_activities || 0,
    },
    
    // Dados do hook useSuorBalance (após sincronização)
    suorBalance: {
      currentSuor,
      totalSuor,
    },
    
    // Verificação de consistência
    consistency: {
      profile_vs_activities: (profile?.current_suor || 0) === (userStats?.total_suor_earned || 0),
      profile_vs_balance: (profile?.current_suor || 0) === currentSuor,
      activities_vs_balance: (userStats?.total_suor_earned || 0) === currentSuor,
      all_consistent: (profile?.current_suor || 0) === (userStats?.total_suor_earned || 0) && 
                      (userStats?.total_suor_earned || 0) === currentSuor,
    },
    
    // Diferenças (para identificar problemas)
    differences: {
      profile_minus_activities: (profile?.current_suor || 0) - (userStats?.total_suor_earned || 0),
      profile_minus_balance: (profile?.current_suor || 0) - currentSuor,
      activities_minus_balance: (userStats?.total_suor_earned || 0) - currentSuor,
    }
  };

  // Função para log detalhado (apenas em desenvolvimento)
  const logDebugInfo = () => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 SUOR DEBUG INFO');
      console.log('📊 Perfil (banco):', debug.profile);
      console.log('🏃 Atividades (calculado):', debug.activities);
      console.log('⚖️ SuorBalance (hook):', debug.suorBalance);
      console.log('✅ Consistência:', debug.consistency);
      console.log('📈 Diferenças:', debug.differences);
      
      if (!debug.consistency.all_consistent) {
        console.warn('⚠️ INCONSISTÊNCIA DETECTADA!');
        console.warn('💡 Execute SYNC_SUOR_PROFILE_WITH_ACTIVITIES.sql no Supabase');
      } else {
        console.log('🎉 Todos os valores estão consistentes!');
      }
      console.groupEnd();
    }
  };

  return {
    debug,
    logDebugInfo,
    isConsistent: debug.consistency.all_consistent,
    recommendedValue: userStats?.total_suor_earned || 0, // Valor mais confiável
  };
};

/**
 * Hook simples para obter o valor de SUOR mais confiável
 * Prioriza dados das atividades (mais precisos) sobre o perfil
 */
export const useReliableSuor = () => {
  const { data: userStats } = useUserStats();
  const { profile } = useAuth();
  
  // Priorizar dados calculados das atividades
  const suorValue = userStats?.total_suor_earned ?? profile?.current_suor ?? 0;
  
  return {
    suor: Math.round(suorValue),
    isFromActivities: userStats?.total_suor_earned !== undefined,
    isFromProfile: userStats?.total_suor_earned === undefined && profile?.current_suor !== undefined,
    source: userStats?.total_suor_earned !== undefined ? 'activities' : 'profile'
  };
};