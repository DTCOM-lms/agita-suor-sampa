import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateSuorTransaction } from '@/hooks/useSuor';
import { useAchievementNotificationContext } from '@/contexts/AchievementNotificationContext';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'activity' | 'distance' | 'duration' | 'frequency' | 'social' | 'special';
  type: 'milestone' | 'challenge' | 'badge' | 'trophy';
  condition_type: 'total_activities' | 'total_distance' | 'total_duration' | 'streak_days' | 'single_activity' | 'social_interaction' | 'custom';
  condition_value: number;
  condition_operator: 'gte' | 'eq' | 'lte';
  suor_reward: number;
  icon_name?: string;
  badge_color?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  is_active: boolean;
  unlock_message?: string;
  requirements_description?: string;
  created_at: string;
}

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress_value?: number;
  is_notified: boolean;
  achievements?: Achievement;
}

interface AchievementProgress {
  achievement_id: string;
  current_progress: number;
  target_value: number;
  percentage: number;
  is_unlocked: boolean;
  achievement: Achievement;
}

export const useUserAchievements = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements(*)
        `)
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return data as (UserAchievement & {
        achievements: Achievement;
      })[];
    },
    enabled: !!user?.id,
  });
};

export const useAvailableAchievements = () => {
  return useQuery({
    queryKey: ['available-achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('rarity', { ascending: true })
        .order('suor_reward', { ascending: true });

      if (error) throw error;
      return data as Achievement[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAchievementProgress = () => {
  const { user, profile } = useAuth();
  const { data: availableAchievements } = useAvailableAchievements();
  const { data: userAchievements } = useUserAchievements();

  return useQuery({
    queryKey: ['achievement-progress', user?.id, profile?.updated_at],
    queryFn: async () => {
      if (!user?.id || !profile || !availableAchievements) return [];

      const unlockedAchievementIds = userAchievements?.map(ua => ua.achievement_id) || [];
      
      const progress: AchievementProgress[] = availableAchievements.map(achievement => {
        const isUnlocked = unlockedAchievementIds.includes(achievement.id);
        let currentProgress = 0;

        // Calcular progresso baseado no tipo de condição
        switch (achievement.condition_type) {
          case 'total_activities':
            currentProgress = profile.total_activities || 0;
            break;
          case 'total_distance':
            currentProgress = Math.round(profile.total_distance_km || 0);
            break;
          case 'total_duration':
            currentProgress = Math.round((profile.total_duration_minutes || 0) / 60); // em horas
            break;
          case 'streak_days':
            currentProgress = profile.streak_days || 0;
            break;
          default:
            currentProgress = 0;
        }

        const percentage = Math.min(100, Math.round((currentProgress / achievement.condition_value) * 100));

        return {
          achievement_id: achievement.id,
          current_progress: currentProgress,
          target_value: achievement.condition_value,
          percentage,
          is_unlocked: isUnlocked,
          achievement
        };
      });

      return progress;
    },
    enabled: !!user?.id && !!profile && !!availableAchievements,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useUnlockAchievement = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const createSuorTransaction = useCreateSuorTransaction();
  const { showNotification } = useAchievementNotificationContext();

  return useMutation({
    mutationFn: async ({ achievementId, progressValue }: { achievementId: string; progressValue?: number }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // 1. Verificar se o achievement já foi desbloqueado
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', user.id)
        .eq('achievement_id', achievementId)
        .single();

      if (existing) {
        throw new Error('Achievement already unlocked');
      }

      // 2. Buscar dados do achievement
      const { data: achievement, error: achievementError } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .single();

      if (achievementError || !achievement) {
        throw new Error('Achievement not found');
      }

      // 3. Criar registro de conquista
      const { data: userAchievement, error: unlockError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
          progress_value: progressValue,
          is_notified: false
        })
        .select(`
          *,
          achievements(*)
        `)
        .single();

      if (unlockError) throw unlockError;

      // 4. Criar transação SUOR se tem recompensa
      if (achievement.suor_reward > 0) {
        await createSuorTransaction.mutateAsync({
          type: 'earned',
          source: 'achievement',
          amount: achievement.suor_reward,
          description: `Conquista desbloqueada: ${achievement.name}`,
          achievement_id: achievementId,
          metadata: {
            achievement_name: achievement.name,
            achievement_rarity: achievement.rarity,
            progress_value: progressValue
          }
        });
      }

      return {
        userAchievement,
        achievement
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
      queryClient.invalidateQueries({ queryKey: ['achievement-progress'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['suor-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });

      // Mostrar notificação da conquista
      if (result.achievement) {
        showNotification({
          id: result.achievement.id,
          name: result.achievement.name,
          description: result.achievement.description,
          rarity: result.achievement.rarity as any,
          type: result.achievement.type as any,
          suor_reward: result.achievement.suor_reward
        });
      }
    },
  });
};

export const useMarkAchievementAsNotified = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (userAchievementId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_achievements')
        .update({ is_notified: true })
        .eq('id', userAchievementId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
    },
  });
};

// Hook para verificar automaticamente conquistas após atividades
export const useCheckAchievements = () => {
  const { data: achievementProgress } = useAchievementProgress();
  const unlockAchievement = useUnlockAchievement();

  const checkAndUnlockAchievements = async () => {
    if (!achievementProgress) return [];

    const newlyUnlocked: Achievement[] = [];

    for (const progress of achievementProgress) {
      if (!progress.is_unlocked) {
        const shouldUnlock = progress.current_progress >= progress.target_value;
        
        if (shouldUnlock) {
          try {
            const result = await unlockAchievement.mutateAsync({
              achievementId: progress.achievement_id,
              progressValue: progress.current_progress
            });
            
            newlyUnlocked.push(result.achievement);
          } catch (error) {
            console.error('Erro ao desbloquear conquista:', error);
          }
        }
      }
    }

    return newlyUnlocked;
  };

  return { checkAndUnlockAchievements };
};

// Estatísticas de conquistas
export const useAchievementStats = () => {
  const { data: userAchievements } = useUserAchievements();
  const { data: availableAchievements } = useAvailableAchievements();

  return useQuery({
    queryKey: ['achievement-stats', userAchievements?.length, availableAchievements?.length],
    queryFn: async () => {
      if (!userAchievements || !availableAchievements) return null;

      const total = availableAchievements.length;
      const unlocked = userAchievements.length;
      const percentage = Math.round((unlocked / total) * 100);

      const byRarity = {
        common: 0,
        rare: 0,
        epic: 0,
        legendary: 0
      };

      userAchievements.forEach(ua => {
        if (ua.achievements) {
          byRarity[ua.achievements.rarity]++;
        }
      });

      const totalSuorFromAchievements = userAchievements.reduce((sum, ua) => {
        return sum + (ua.achievements?.suor_reward || 0);
      }, 0);

      return {
        total,
        unlocked,
        percentage,
        byRarity,
        totalSuorFromAchievements
      };
    },
    enabled: !!userAchievements && !!availableAchievements,
  });
}; 