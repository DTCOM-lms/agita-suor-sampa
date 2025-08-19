import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Clock, Star, Search, Filter, Map, List } from "lucide-react";
import { useEvents, useEventStats, useNearbyEvents } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import EventsMap from '@/components/EventsMap';
import EventsList from '@/components/EventsList';
import { EventFilters, EventType, EventCategory } from '@/types/events';

export default function Events() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [filters, setFilters] = useState<EventFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Buscar eventos e estatísticas
  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useEvents(filters);
  const { data: stats, isLoading: statsLoading } = useEventStats();
  const { data: nearbyEvents, isLoading: nearbyLoading } = useNearbyEvents(userLocation, 10);

  // Obter localização do usuário
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('⚠️ Erro ao obter localização:', error);
          // Usar localização padrão de São Paulo
          setUserLocation({
            lat: -23.5505,
            lng: -46.6333
          });
        }
      );
    } else {
      setUserLocation({
        lat: -23.5505,
        lng: -46.6333
      });
    }
  }, []);

  // Aplicar filtros de busca
  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined
    }));
  };

  // Limpar filtros
  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  // Filtrar por tipo
  const handleTypeFilter = (type: EventType | 'all') => {
    setFilters(prev => ({
      ...prev,
      type: type === 'all' ? undefined : type
    }));
  };

  // Filtrar por categoria
  const handleCategoryFilter = (category: EventCategory | 'all') => {
    setFilters(prev => ({
      ...prev,
      category: category === 'all' ? undefined : category
    }));
  };

  // Filtrar por status
  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status as any
    }));
  };

  if (eventsError) {
    return (
      <div className="space-y-6 p-4">
        <div className="text-center text-destructive">
          <p>Erro ao carregar eventos: {eventsError.message}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Eventos</h1>
          <p className="text-muted-foreground">
            Descubra e participe de eventos incríveis na sua cidade
          </p>
        </div>

        {/* Estatísticas */}
        {!statsLoading && stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total de Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.total_events}</div>
                <p className="text-xs text-muted-foreground">Eventos disponíveis</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Próximos Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.upcoming_events}</div>
                <p className="text-xs text-muted-foreground">Para os próximos dias</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Eventos Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.active_events}</div>
                <p className="text-xs text-muted-foreground">Acontecendo hoje</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Participantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.total_participants}</div>
                <p className="text-xs text-muted-foreground">Pessoas inscritas</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
          <CardDescription>
            Encontre eventos que combinam com você
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de busca */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Buscar</Button>
            <Button variant="outline" onClick={clearFilters}>
              Limpar
            </Button>
          </div>

          {/* Filtros rápidos */}
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Select onValueChange={handleTypeFilter} value={filters.type || 'all'}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="caminhada">Caminhada</SelectItem>
                  <SelectItem value="corrida">Corrida</SelectItem>
                  <SelectItem value="ciclismo">Ciclismo</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="meditacao">Meditação</SelectItem>
                  <SelectItem value="treino_funcional">Treino Funcional</SelectItem>
                  <SelectItem value="danca">Dança</SelectItem>
                  <SelectItem value="esporte_coletivo">Esporte Coletivo</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Categoria</label>
              <Select onValueChange={handleCategoryFilter} value={filters.category || 'all'}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="saude_bem_estar">Saúde & Bem-estar</SelectItem>
                  <SelectItem value="esporte">Esporte</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="educativo">Educativo</SelectItem>
                  <SelectItem value="sustentabilidade">Sustentabilidade</SelectItem>
                  <SelectItem value="cultura">Cultura</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select onValueChange={handleStatusFilter} value={filters.status || 'all'}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="registration_open">Inscrições Abertas</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="upcoming">Próximo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Localização</label>
              <Select onValueChange={(city) => setFilters(prev => ({ ...prev, city: city === 'all' ? undefined : city }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as cidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as cidades</SelectItem>
                  <SelectItem value="São Paulo">São Paulo</SelectItem>
                  <SelectItem value="Campinas">Campinas</SelectItem>
                  <SelectItem value="Santos">Santos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seletor de Visualização */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
          >
            <Map className="h-4 w-4 mr-2" />
            Mapa
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            Lista
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {eventsData && (
            <>
              {eventsData.total} evento{eventsData.total !== 1 ? 's' : ''} encontrado{eventsData.total !== 1 ? 's' : ''}
            </>
          )}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'map' | 'list')}>
        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <EventsMap 
                events={eventsData?.events || []}
                userLocation={userLocation}
                isLoading={eventsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <EventsList 
            events={eventsData?.events || []}
            isLoading={eventsLoading}
            userLocation={userLocation}
          />
        </TabsContent>
      </Tabs>

      {/* Eventos Próximos */}
      {nearbyEvents && nearbyEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Eventos Próximos a Você
            </CardTitle>
            <CardDescription>
              Eventos acontecendo perto da sua localização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {nearbyEvents.slice(0, 3).map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {event.type}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location.neighborhood || event.location.city}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                      {event.name}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(event.start_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(event.start_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{event.current_participants}</span>
                        {event.max_participants && (
                          <span>/{event.max_participants}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="font-medium">{event.suor_reward} SUOR</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
