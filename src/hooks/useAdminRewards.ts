import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminReward {
  id: string;
  name: string;
  description: string;
  category: 'fitness' | 'food' | 'mobility' | 'entertainment' | 'health' | 'education' | 'technology' | 'tax_benefits';
  type: 'product' | 'service' | 'discount' | 'voucher' | 'experience';
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

export interface UpsertRewardInput extends Omit<AdminReward, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}

export const useAdminRewards = (search?: string, category?: AdminReward['category']) => {
  return useQuery<AdminReward[]>({
    queryKey: ['admin','rewards', { search, category }],
    queryFn: async () => {
      let query = supabase.from('rewards').select('*').order('order_index', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }
      if (search && search.trim()) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AdminReward[];
    }
  });
};

export const useAdminUpsertReward = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpsertRewardInput) => {
      const payload = { ...input } as any;
      if (!payload.id) delete payload.id;
      const { data, error } = await supabase.from('rewards').upsert(payload).select().single();
      if (error) throw error;
      return data as AdminReward;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin','rewards'] });
    }
  });
};

export const useAdminDeleteReward = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rewardId: string) => {
      const { error } = await supabase.from('rewards').delete().eq('id', rewardId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin','rewards'] });
    }
  });
};

