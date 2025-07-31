import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from './useUserStats';

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

      console.log('🔍 CRIANDO TRANSAÇÃO SUOR:', transaction);

      // 1. Tentar usar função RPC primeiro (mais seguro)
      try {
        const { data: newTransaction, error: rpcError } = await supabase
          .rpc('create_suor_transaction_secure', {
            p_type: transaction.type,
            p_source: transaction.source,
            p_amount: transaction.amount,
            p_description: transaction.description,
            p_activity_id: transaction.activity_id,
            p_challenge_id: transaction.challenge_id,
            p_achievement_id: transaction.achievement_id,
            p_metadata: transaction.metadata
          });

        if (rpcError) {
          console.warn('⚠️ RPC falhou, tentando INSERT direto:', rpcError);
          throw rpcError;
        }

        console.log('✅ TRANSAÇÃO CRIADA VIA RPC:', newTransaction);
        return newTransaction;

      } catch (rpcError) {
        console.log('🔄 RPC falhou, tentando INSERT direto...');

        // 2. Fallback: tentar INSERT direto
        const { data: newTransaction, error: transactionError } = await supabase
          .from('suor_transactions')
          .insert({
            user_id: user.id,
            ...transaction
          })
          .select()
          .single();

        if (transactionError) {
          console.error('❌ ERRO AO CRIAR TRANSAÇÃO:', transactionError);
          throw transactionError;
        }

        console.log('✅ TRANSAÇÃO CRIADA VIA INSERT:', newTransaction);

        // Para INSERT direto, ainda precisamos atualizar o perfil
        const { error: profileError } = await supabase.rpc('update_user_suor', {
          user_id: user.id,
          amount_change: transaction.type === 'earned' || transaction.type === 'bonus' 
            ? transaction.amount 
            : -transaction.amount
        });

        if (profileError) {
          console.error('❌ ERRO AO ATUALIZAR PERFIL:', profileError);
          throw profileError;
        }

        return newTransaction;
      }
    },
    onSuccess: () => {
      console.log('✅ TRANSAÇÃO SUOR CONCLUÍDA COM SUCESSO');
      // Invalidar caches relacionados
      queryClient.invalidateQueries({ queryKey: ['suor-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
  });
};

export const useSuorBalance = () => {
  const { profile } = useAuth();
  const { data: userStats } = useUserStats();
  
  return {
    currentSuor: userStats?.total_suor_earned || 0, // Usar dados reais das atividades
    totalSuor: userStats?.total_suor_earned || 0,   // Usar dados reais das atividades
    level: profile?.level || 1,
    experiencePoints: profile?.experience_points || 0
  };
}; 