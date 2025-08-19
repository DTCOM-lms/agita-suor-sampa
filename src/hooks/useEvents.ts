import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Event, 
  EventWithParticipants, 
  EventFilters, 
  EventStats,
  CreateEventForm,
  UpdateEventForm,
  EventsResponse 
} from '@/types/events';

// ====================================
// HOOKS PARA BUSCAR EVENTOS
// ====================================

// Buscar todos os eventos com filtros
export const useEvents = (filters: EventFilters = {}, page = 1, limit = 20) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['events', filters, page, limit],
    queryFn: async (): Promise<EventsResponse> => {
      let query = supabase
        .from('events')
        .select('*')
        .eq('is_active', true);

      // Aplicar filtros
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.city) {
        query = query.eq('city', filters.city);
      }
      if (filters.date_from) {
        query = query.gte('start_date', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('start_date', filters.date_to);
      }
      if (filters.featured) {
        query = query.eq('is_featured', true);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Paginação
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Ordenação
      query = query.order('start_date', { ascending: true });

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Erro ao buscar eventos:', error);
        throw new Error(error.message);
      }

      // Converter dados do Supabase para o formato da aplicação
      const events: Event[] = (data || []).map(event => ({
        ...event,
        location: {
          lat: event.location.coordinates[1],
          lng: event.location.coordinates[0],
          address: event.address,
          city: event.city,
          neighborhood: event.neighborhood
        }
      }));

      return {
        events,
        total: count || 0,
        page,
        limit
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Buscar eventos próximos ao usuário
export const useNearbyEvents = (userLocation?: { lat: number; lng: number }, radiusKm = 10) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['nearby-events', user?.id, userLocation, radiusKm],
    queryFn: async (): Promise<Event[]> => {
      if (!userLocation) {
        return [];
      }

      // Buscar eventos próximos usando PostGIS
      const { data, error } = await supabase
        .rpc('get_nearby_events', {
          user_lat: userLocation.lat,
          user_lng: userLocation.lng,
          radius_km: radiusKm
        });

      if (error) {
        console.error('❌ Erro ao buscar eventos próximos:', error);
        throw new Error(error.message);
      }

      // Converter dados do Supabase
      const events: Event[] = (data || []).map(event => ({
        ...event,
        location: {
          lat: event.location.coordinates[1],
          lng: event.location.coordinates[0],
          address: event.address,
          city: event.city,
          neighborhood: event.neighborhood
        }
      }));

      return events;
    },
    enabled: !!user && !!userLocation,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Buscar eventos por status
export const useEventsByStatus = (status: string) => {
  return useEvents({ status: status as any });
};

// Buscar eventos em destaque
export const useFeaturedEvents = () => {
  return useEvents({ featured: true }, 1, 10);
};

// Buscar evento específico
export const useEvent = (eventId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async (): Promise<EventWithParticipants> => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_participants!inner(
            *,
            profiles!inner(id, full_name, username, avatar_url)
          )
        `)
        .eq('id', eventId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar evento:', error);
        throw new Error(error.message);
      }

      // Converter dados do Supabase
      const event: EventWithParticipants = {
        ...data,
        location: {
          lat: data.location.coordinates[1],
          lng: data.location.coordinates[0],
          address: data.address,
          city: data.city,
          neighborhood: data.neighborhood
        },
        participants: data.event_participants || []
      };

      return event;
    },
    enabled: !!user && !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// ====================================
// HOOKS PARA ESTATÍSTICAS
// ====================================

// Buscar estatísticas dos eventos
export const useEventStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['event-stats'],
    queryFn: async (): Promise<EventStats> => {
      // Buscar estatísticas usando RPC
      const { data, error } = await supabase
        .rpc('get_event_stats');

      if (error) {
        console.error('❌ Erro ao buscar estatísticas dos eventos:', error);
        throw new Error(error.message);
      }

      return data || {
        total_events: 0,
        upcoming_events: 0,
        active_events: 0,
        total_participants: 0,
        events_this_month: 0
      };
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// ====================================
// HOOKS PARA ADMIN (CRUD)
// ====================================

// Criar novo evento (apenas admin)
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (eventData: CreateEventForm): Promise<Event> => {
      if (!user?.is_admin) {
        throw new Error('Apenas administradores podem criar eventos');
      }

      // Converter localização para formato PostGIS
      const postgisLocation = `POINT(${eventData.location.lng} ${eventData.location.lat})`;

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          location: postgisLocation,
          organizer_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar evento:', error);
        throw new Error(error.message);
      }

      return {
        ...data,
        location: eventData.location
      };
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event-stats'] });
    },
  });
};

// Atualizar evento (apenas admin)
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...eventData }: UpdateEventForm): Promise<Event> => {
      if (!user?.is_admin) {
        throw new Error('Apenas administradores podem editar eventos');
      }

      const updateData: any = { ...eventData };
      
      // Converter localização se fornecida
      if (eventData.location) {
        updateData.location = `POINT(${eventData.location.lng} ${eventData.location.lat})`;
      }

      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar evento:', error);
        throw new Error(error.message);
      }

      return {
        ...data,
        location: eventData.location || {
          lat: data.location.coordinates[1],
          lng: data.location.coordinates[0]
        }
      };
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['event-stats'] });
    },
  });
};

// Deletar evento (apenas admin)
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (eventId: string): Promise<void> => {
      if (!user?.is_admin) {
        throw new Error('Apenas administradores podem deletar eventos');
      }

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('❌ Erro ao deletar evento:', error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event-stats'] });
    },
  });
};
