import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Activity, 
  Calendar, 
  Clock, 
  Route, 
  Zap, 
  MapPin, 
  TrendingUp,
  Search,
  Filter,
  Plus,
  ArrowLeft
} from "lucide-react";
import Header from "@/components/Header";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useUserActivityHistory, useUserStats } from "@/hooks/useUserStats";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Activities = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  const { data: activityHistory, isLoading } = useUserActivityHistory();
  const { data: userStats } = useUserStats();

  // Filtros
  const filteredActivities = activityHistory?.filter(activity => {
    const matchesSearch = !searchTerm || 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.activity_types?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      activity.activity_types?.category === selectedCategory;
    
    const matchesStatus = selectedStatus === 'all' || 
      activity.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const formatDistance = (km: number) => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
  };

  const getActivityIcon = (category: string, supports_gps: boolean) => {
    // Usar a mesma lógica do ActivityStart para consistência
    if (supports_gps) {
      return <Route className="h-5 w-5" />;
    } else {
      return <Activity className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'active':
        return 'Ativa';
      case 'paused':
        return 'Pausada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando histórico...</p>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Header da página */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Histórico de Atividades</h1>
            <p className="text-muted-foreground">
              {userStats?.total_activities || 0} atividade{(userStats?.total_activities || 0) !== 1 ? 's' : ''} registrada{(userStats?.total_activities || 0) !== 1 ? 's' : ''}
            </p>
          </div>
          <Button 
            onClick={() => navigate('/activity/start')}
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova
          </Button>
        </div>

        {/* Estatísticas resumidas */}
        {userStats && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card>
              <CardContent className="p-3 text-center">
                <Route className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs text-green-600/70">Distância</p>
                <p className="font-bold text-green-700">
                  {formatDistance(userStats.total_distance_km)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 text-center">
                <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                <p className="text-xs text-purple-600/70">Tempo</p>
                <p className="font-bold text-purple-700">
                  {Math.round(userStats.total_duration_minutes / 60)}h
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 text-center">
                <Zap className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                <p className="text-xs text-yellow-600/70">SUOR Total</p>
                <p className="font-bold text-yellow-700">
                  {Math.round(userStats.total_suor_earned)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros e busca */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar atividades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="running">Corrida</TabsTrigger>
              <TabsTrigger value="gym">Academia</TabsTrigger>
              <TabsTrigger value="outdoor">Outdoor</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Lista de atividades */}
        <div className="space-y-3">
          {filteredActivities.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma atividade encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'Tente ajustar sua busca ou filtros' : 'Que tal começar sua primeira atividade?'}
                </p>
                <Button onClick={() => navigate('/activity/start')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Começar Agora
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredActivities.map((activity) => (
              <Card 
                key={activity.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/activity/${activity.id}/results`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Ícone da atividade */}
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {getActivityIcon(
                        activity.activity_types?.category || 'other', 
                        activity.activity_types?.supports_gps || false
                      )}
                    </div>
                    
                    {/* Informações principais */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{activity.title}</h3>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getStatusColor(activity.status)}`}
                        >
                          {getStatusLabel(activity.status)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.activity_types?.name} • {' '}
                        {format(new Date(activity.created_at), 'dd MMM, HH:mm', { locale: ptBR })}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {activity.duration_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(activity.duration_minutes)}
                          </div>
                        )}
                        {activity.distance_km && activity.distance_km > 0 && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {formatDistance(activity.distance_km)}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {activity.suor_earned || 0} SUOR
                        </div>
                      </div>
                    </div>
                    
                    {/* Seta indicativa */}
                    <div className="text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default Activities;