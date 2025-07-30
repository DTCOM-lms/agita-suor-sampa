import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SuorTransaction {
  id: string;
  user_id: string;
  type: 'earned' | 'spent' | 'bonus' | 'penalty' | 'transfer';
  source: 'activity' | 'challenge' | 'achievement' | 'daily_bonus' | 'friend_referral' | 'marketplace' | 'admin' | 'check_in' | 'quiz' | 'habit' | 'streak_bonus';
  amount: number;
  description: string;
  activity_id?: string;
  challenge_id?: string;
  achievement_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export const useSuorTransactions = (limit = 20) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['suor-transactions', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('suor_transactions')
        .select(`
          *,
          activities(title),
          challenges(title),
          achievements(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as (SuorTransaction & {
        activities?: { title: string };
        challenges?: { title: string };
        achievements?: { name: string };
      })[];
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
};

export const useCreateSuorTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (transaction: {
      type: SuorTransaction['type'];
      source: SuorTransaction['source'];
      amount: number;
      description: string;
      activity_id?: string;
      challenge_id?: string;
      achievement_id?: string;
      metadata?: Record<string, any>;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // 1. Criar transação
      const { data: newTransaction, error: transactionError } = await supabase
        .from('suor_transactions')
        .insert({
          user_id: user.id,
          ...transaction
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // 2. Atualizar saldo do usuário
      const { error: profileError } = await supabase.rpc('update_user_suor', {
        user_id: user.id,
        amount_change: transaction.type === 'earned' || transaction.type === 'bonus' 
          ? transaction.amount 
          : -transaction.amount
      });

      if (profileError) throw profileError;

      return newTransaction;
    },
    onSuccess: () => {
      // Invalidar caches relacionados
      queryClient.invalidateQueries({ queryKey: ['suor-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useSuorBalance = () => {
  const { profile } = useAuth();
  return {
    currentSuor: profile?.current_suor || 0,
    totalSuor: profile?.total_suor || 0,
    level: profile?.level || 1,
    experiencePoints: profile?.experience_points || 0
  };
}; 