import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AdminUserProfile {
  id: string;
  email?: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
  is_admin: boolean;
  is_public: boolean;
  level: number;
  experience_points: number;
  total_suor: number;
  current_suor: number;
  total_activities: number;
  created_at: string;
}

export const useAdminUsers = (search?: string) => {
  const { profile } = useAuth();
  
  return useQuery<AdminUserProfile[]>({
    queryKey: ['admin','users', { search }],
    queryFn: async () => {
      try {
        // Verificar se o usuário é admin
        if (!profile?.is_admin) {
          console.error('❌ Usuário não é admin. Acesso negado.');
          throw new Error('Acesso negado: usuário não é admin');
        }
        
        console.log('🔍 Buscando usuários admin...');
        console.log('👤 Usuário logado é admin:', profile.is_admin);
        
        let query = supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, is_admin, is_public, level, experience_points, total_suor, current_suor, total_activities, created_at')
          .order('created_at', { ascending: false });

        if (search && search.trim()) {
          query = query.ilike('full_name', `%${search}%`);
          console.log('🔍 Aplicando filtro de busca:', search);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error('❌ Erro ao buscar usuários:', error);
          throw error;
        }
        
        console.log('✅ Usuários encontrados:', data?.length || 0);
        return (data || []) as AdminUserProfile[];
      } catch (error) {
        console.error('💥 Erro fatal ao buscar usuários:', error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
    enabled: !!profile?.is_admin, // Só executa se for admin
  });
};

export const useAdminToggleAdmin = () => {
  const qc = useQueryClient();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      try {
        // Verificar se o usuário é admin
        if (!profile?.is_admin) {
          console.error('❌ Usuário não é admin. Acesso negado.');
          throw new Error('Acesso negado: usuário não é admin');
        }
        
        console.log('🔄 Alterando status admin para usuário:', userId, 'isAdmin:', isAdmin);
        console.log('👤 Usuário logado é admin:', profile.is_admin);
        
        const { data, error } = await supabase
          .from('profiles')
          .update({ is_admin: isAdmin })
          .eq('id', userId)
          .select(); // Adicionar select para ver o que foi retornado
          
        if (error) {
          console.error('❌ Erro ao alterar status admin:', error);
          throw error;
        }
        
        console.log('✅ Status admin alterado com sucesso');
        console.log('📊 Dados retornados:', data);
        
        // Verificar se realmente foi alterado
        if (data && data.length > 0) {
          console.log('✅ Confirmação: usuário agora é admin:', data[0].is_admin);
        } else {
          console.warn('⚠️ Nenhum dado retornado na atualização');
        }
        
      } catch (error) {
        console.error('💥 Erro fatal ao alterar status admin:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidando cache de usuários admin');
      qc.invalidateQueries({ queryKey: ['admin','users'] });
    },
    onError: (error) => {
      console.error('💥 Erro na mutação toggle admin:', error);
    }
  });
};

