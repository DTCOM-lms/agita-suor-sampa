// 🎯 Tipos para o Sistema de Eventos

export type EventType = 
  | 'caminhada' 
  | 'corrida' 
  | 'ciclismo' 
  | 'yoga' 
  | 'meditacao' 
  | 'treino_funcional' 
  | 'danca' 
  | 'esporte_coletivo' 
  | 'outro';

export type EventCategory = 
  | 'saude_bem_estar' 
  | 'esporte' 
  | 'social' 
  | 'educativo' 
  | 'sustentabilidade' 
  | 'cultura' 
  | 'outro';

export type EventStatus = 
  | 'draft' 
  | 'published' 
  | 'registration_open' 
  | 'registration_closed' 
  | 'active' 
  | 'completed' 
  | 'cancelled';

export type ParticipationStatus = 
  | 'registered' 
  | 'confirmed' 
  | 'checked_in' 
  | 'completed' 
  | 'cancelled';

export interface EventLocation {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  neighborhood?: string;
}

export interface EventRequirements {
  age_min?: number;
  age_max?: number;
  equipment?: string;
  health_conditions?: string;
  skill_level?: string;
  [key: string]: any;
}

export interface EventSchedule {
  start_time: string;
  end_time: string;
  activities?: Array<{
    time: string;
    activity: string;
    description?: string;
  }>;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  
  // Tipo e categoria
  type: EventType;
  category: EventCategory;
  status: EventStatus;
  
  // Datas e horários
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  
  // Localização
  location: EventLocation;
  location_name: string;
  
  // Capacidade e participantes
  max_participants?: number;
  current_participants: number;
  
  // Recompensas
  suor_reward: number;
  checkin_suor_reward: number;
  
  // Organizador
  organizer_id: string;
  organizer_name: string;
  
  // Mídia
  image_urls?: string[];
  qr_code_url?: string;
  
  // Configurações
  requires_registration: boolean;
  is_featured: boolean;
  is_active: boolean;
  
  // Metadata
  tags?: string[];
  requirements?: EventRequirements;
  schedule?: EventSchedule;
  
  created_at: string;
  updated_at: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  
  status: ParticipationStatus;
  
  // Check-in
  checked_in: boolean;
  checkin_time?: string;
  checkin_location?: EventLocation;
  
  // Recompensas
  suor_earned: number;
  
  // Feedback
  rating?: number;
  feedback?: string;
  
  created_at: string;
  updated_at: string;
}

export interface EventWithParticipants extends Event {
  participants?: EventParticipant[];
  user_participation?: EventParticipant;
}

export interface EventFilters {
  type?: EventType;
  category?: EventCategory;
  status?: EventStatus;
  city?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  featured?: boolean;
}

export interface EventStats {
  total_events: number;
  upcoming_events: number;
  active_events: number;
  total_participants: number;
  events_this_month: number;
}

// Tipos para formulários
export interface CreateEventForm {
  name: string;
  description: string;
  type: EventType;
  category: EventCategory;
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  location: EventLocation;
  location_name: string;
  max_participants?: number;
  suor_reward: number;
  checkin_suor_reward: number;
  organizer_name: string;
  requires_registration: boolean;
  is_featured: boolean;
  tags?: string[];
  requirements?: EventRequirements;
  schedule?: EventSchedule;
}

export interface UpdateEventForm extends Partial<CreateEventForm> {
  id: string;
  status?: EventStatus;
}

// Tipos para respostas da API
export interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
}

export interface EventParticipationResponse {
  success: boolean;
  participant?: EventParticipant;
  message?: string;
}

// Tipos para mapas
export interface EventMapPin {
  id: string;
  name: string;
  type: EventType;
  location: EventLocation;
  status: EventStatus;
  start_date: string;
  participants_count: number;
  max_participants?: number;
  is_featured: boolean;
}
