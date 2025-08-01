import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types baseados no schema do Supabase
export type RewardCategory = 'fitness' | 'food' | 'mobility' | 'entertainment' | 'health' | 'education' | 'technology' | 'tax_benefits';
export type RewardType = 'product' | 'service' | 'discount' | 'voucher' | 'experience';
export type RedemptionStatus = 'pending' | 'confirmed' | 'used' | 'expired' | 'cancelled';

export interface Reward {
  id: string;
  name: string;
  description: string;
  category: RewardCategory;
  type: RewardType;
  suor_price: number;
  original_price?: number;
  stock_quantity?: number;
  max_per_user: number;
  available_from?: string;
  available_until?: string;
  available_cities?: string[];
  partner_name: string;
  partner_logo_url?: string;
  partner_website?: string;
  image_urls?: string[];
  qr_code_url?: string;
  redemption_instructions: string;
  terms_conditions?: string;
  is_featured: boolean;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface UserReward {
  id: string;
  user_id: string;
  reward_id: string;
  status: RedemptionStatus;
  suor_spent: number;
  redemption_code?: string;
  qr_code_data?: string;
  expires_at?: string;
  used_at?: string;
  used_location?: any; // geometry
  used_location_name?: string;
  created_at: string;
  updated_at: string;
  // Relations
  rewards?: Reward;
}

interface RedeemRewardData {
  reward_id: string;
  user_location?: { lat: number; lng: number };
  location_name?: string;
}

// Hook para buscar todas as recompensas disponíveis
export const useRewards = (category?: RewardCategory, featured_only = false) => {
  return useQuery({
    queryKey: ['rewards', category, featured_only],
    queryFn: async () => {
      let query = supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      if (featured_only) {
        query = query.eq('is_featured', true);
      }

      // Filtrar por disponibilidade temporal
      const now = new Date().toISOString();
      query = query.or(`available_from.is.null,available_from.lte.${now}`);
      query = query.or(`available_until.is.null,available_until.gte.${now}`);

      const { data, error } = await query;

      if (error) throw error;
      return data as Reward[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar recompensas em destaque
export const useFeaturedRewards = (limit = 5) => {
  return useQuery({
    queryKey: ['featured-rewards', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('order_index', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data as Reward[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para buscar uma recompensa específica
export const useReward = (reward_id: string) => {
  return useQuery({
    queryKey: ['reward', reward_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('id', reward_id)
        .single();

      if (error) throw error;
      return data as Reward;
    },
    enabled: !!reward_id,
  });
};

// Hook para buscar recompensas resgatadas pelo usuário
export const useUserRewards = (status?: RedemptionStatus) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-rewards', user?.id, status],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      let query = supabase
        .from('user_rewards')
        .select(`
          *,
          rewards(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as UserReward[];
    },
    enabled: !!user?.id,
  });
};

// Hook para resgatar uma recompensa
export const useRedeemReward = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: RedeemRewardData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Buscar informações da recompensa
      const { data: reward, error: rewardError } = await supabase
        .from('rewards')
        .select('*')
        .eq('id', data.reward_id)
        .single();

      if (rewardError) throw rewardError;
      if (!reward) throw new Error('Reward not found');

      // Verificar saldo SUOR do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_suor')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('Profile not found');

      if (profile.current_suor < reward.suor_price) {
        throw new Error('Saldo SUOR insuficiente');
      }

      // Verificar limitações de quantidade por usuário
      if (reward.max_per_user > 0) {
        const { count, error: countError } = await supabase
          .from('user_rewards')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('reward_id', data.reward_id)
          .in('status', ['pending', 'confirmed', 'used']);

        if (countError) throw countError;

        if (count && count >= reward.max_per_user) {
          throw new Error('Limite de resgates por usuário atingido');
        }
      }

      // Verificar estoque disponível
      if (reward.stock_quantity !== null && reward.stock_quantity <= 0) {
        throw new Error('Recompensa fora de estoque');
      }

      // Gerar código de resgate único
      const redemption_code = `AGT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Criar registro de resgate
      const { data: userReward, error: userRewardError } = await supabase
        .from('user_rewards')
        .insert({
          user_id: user.id,
          reward_id: data.reward_id,
          status: 'pending',
          suor_spent: reward.suor_price,
          redemption_code,
          expires_at: reward.available_until,
          used_location_name: data.location_name
        })
        .select('*')
        .single();

      if (userRewardError) throw userRewardError;

      // Criar transação SUOR
      const { error: transactionError } = await supabase
        .from('suor_transactions')
        .insert({
          user_id: user.id,
          type: 'spent',
          source: 'marketplace',
          amount: -reward.suor_price,
          description: `Resgate: ${reward.name}`,
          related_id: userReward.id
        });

      if (transactionError) throw transactionError;

      // Atualizar saldo do usuário
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          current_suor: profile.current_suor - reward.suor_price
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Decrementar estoque se aplicável
      if (reward.stock_quantity !== null) {
        const { error: stockError } = await supabase
          .from('rewards')
          .update({
            stock_quantity: reward.stock_quantity - 1
          })
          .eq('id', data.reward_id);

        if (stockError) throw stockError;
      }

      return userReward;
    },
    onSuccess: (userReward) => {
      toast.success('Recompensa resgatada com sucesso!', {
        description: `Código: ${userReward.redemption_code}`
      });

      // Invalidar caches relevantes
      queryClient.invalidateQueries({ queryKey: ['user-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['suor-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
    onError: (error: Error) => {
      toast.error('Erro ao resgatar recompensa', {
        description: error.message
      });
    },
  });
};

// Hook para marcar uma recompensa como usada
export const useMarkRewardAsUsed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userRewardId: string) => {
      const { data, error } = await supabase
        .from('user_rewards')
        .update({
          status: 'used',
          used_at: new Date().toISOString()
        })
        .eq('id', userRewardId)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Recompensa marcada como utilizada!');
      queryClient.invalidateQueries({ queryKey: ['user-rewards'] });
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar recompensa', {
        description: error.message
      });
    },
  });
};

// Hook para buscar estatísticas de recompensas
export const useRewardStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['reward-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Total de SUOR gasto
      const { data: totalSpent, error: spentError } = await supabase
        .from('user_rewards')
        .select('suor_spent')
        .eq('user_id', user.id);

      if (spentError) throw spentError;

      // Recompensas por status
      const { data: statusCounts, error: statusError } = await supabase
        .from('user_rewards')
        .select('status')
        .eq('user_id', user.id);

      if (statusError) throw statusError;

      const totalSuorSpent = totalSpent?.reduce((sum, reward) => sum + reward.suor_spent, 0) || 0;
      
      const statusBreakdown = statusCounts?.reduce((acc: Record<string, number>, reward) => {
        acc[reward.status] = (acc[reward.status] || 0) + 1;
        return acc;
      }, {}) || {};

      return {
        totalSuorSpent,
        totalRewards: statusCounts?.length || 0,
        statusBreakdown
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};