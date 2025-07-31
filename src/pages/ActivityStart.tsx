import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Activity, 
  Bike, 
  MapPin, 
  Target, 
  Clock,
  Zap,
  ArrowLeft,
  Loader2,
  Search,
  Dumbbell,
  Heart,
  TreePine,
  Waves,
  Play
} from "lucide-react";
import Header from "@/components/Header";
import { useActivityTypes } from "@/hooks/useActivityTypes";

// Mapeamento ampliado de ícones por atividade e categoria
const getActivityIcon = (name: string, category: string) => {
  const activityName = name.toLowerCase();
  
  // Mapeamento específico por nome
  if (activityName.includes('musculação') || activityName.includes('academia')) return Dumbbell;
  if (activityName.includes('corrida')) return Activity;
  if (activityName.includes('ciclismo') || activityName.includes('bike')) return Bike;
  if (activityName.includes('caminhada')) return MapPin;
  if (activityName.includes('natação') || activityName.includes('swimming')) return Waves;
  if (activityName.includes('yoga') || activityName.includes('pilates')) return Heart;
  if (activityName.includes('trilha')) return TreePine;
  if (activityName.includes('aeróbica') || activityName.includes('aerobica')) return Activity;
  
  // Mapeamento por categoria
  switch (category) {
    case 'running': return Activity;
    case 'cycling': return Bike;
    case 'walking': return MapPin;
    case 'swimming': return Waves;
    case 'strength': return Dumbbell;
    case 'flexibility': return Heart;
    case 'outdoor': return TreePine;
    default: return Activity;
  }
};

const getActivityColor = (category: string, supports_gps: boolean) => {
  if (supports_gps) {
    // Atividades GPS - cores mais vibrantes
    switch (category) {
      case 'running': return 'text-red-500';
      case 'cycling': return 'text-blue-500';
      case 'walking': return 'text-green-500';
      case 'outdoor': return 'text-emerald-500';
      default: return 'text-blue-600';
    }
  } else {
    // Atividades manuais - cores mais suaves
    switch (category) {
      case 'strength': return 'text-orange-500';
      case 'flexibility': return 'text-purple-500';
      case 'indoor': return 'text-amber-500';
      default: return 'text-gray-600';
    }
  }
};

const ActivityStart = () => {
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Buscar TODAS as atividades do Supabase
  const { data: activityTypes, isLoading, error } = useActivityTypes();
  
  // Filtrar e preparar TODAS as atividades ativas
  const activities = (activityTypes || [])
    .filter(activity => activity.is_active) // Só atividades ativas
    .filter(activity => 
      searchTerm === '' || 
      activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(activity => ({
      ...activity,
      icon: getActivityIcon(activity.name, activity.category),
      color: getActivityColor(activity.category, activity.supports_gps)
    }))
    .sort((a, b) => {
      // Ordenar: GPS primeiro, depois alfabético
      if (a.supports_gps && !b.supports_gps) return -1;
      if (!a.supports_gps && b.supports_gps) return 1;
      return a.name.localeCompare(b.name);
    });
  
  console.log('🔍 ActivityStart Debug:', {
    totalActivityTypes: activityTypes?.length,
    activeActivities: activities.length,
    searchTerm,
    selectedActivity,
    sampleActivities: activities.slice(0, 3).map(a => ({ name: a.name, supports_gps: a.supports_gps }))
  });

  const handleStartActivity = () => {
    if (selectedActivity) {
      console.log('🚀 Iniciando atividade:', selectedActivity);
      navigate(`/activity/${selectedActivity}/tracking`);
    }
  };
  
  const selectedActivityData = activities.find(a => a.id === selectedActivity);
  
  // Auto-scroll to selected activity
  useEffect(() => {
    if (selectedActivity) {
      const element = document.getElementById(`activity-${selectedActivity}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedActivity]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando tipos de atividade...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Erro ao carregar atividades</p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24"> {/* Espaço para botão flutuante */}
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Iniciar Atividade</h1>
            <p className="text-muted-foreground">Escolha sua atividade e comece a ganhar SUOR</p>
          </div>
        </div>

        {/* Barra de busca */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar atividade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Contador de atividades */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {activities.length} atividade{activities.length !== 1 ? 's' : ''} disponível{activities.length !== 1 ? 'eis' : ''}
            {searchTerm && ` para "${searchTerm}"`}
          </p>
        </div>

        {/* Lista de atividades */}
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma atividade encontrada</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Tente uma busca diferente' : 'Carregando atividades...'}
              </p>
            </div>
          ) : (
            activities.map((activity) => {
              const IconComponent = activity.icon;
              const isSelected = selectedActivity === activity.id;
              
              return (
                <Card 
                  key={activity.id}
                  id={`activity-${activity.id}`}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedActivity(activity.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Ícone */}
                      <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className={`h-6 w-6 ${activity.color}`} />
                      </div>
                      
                      {/* Informações principais */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg truncate">{activity.name}</h3>
                          <Badge variant={
                            activity.difficulty === "easy" ? "secondary" : 
                            activity.difficulty === "medium" ? "default" : "destructive"
                          } size="sm">
                            {activity.difficulty === "easy" ? "Fácil" : 
                             activity.difficulty === "medium" ? "Médio" : "Difícil"}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4 text-primary" />
                            <span className="font-medium">{activity.base_suor_per_minute} SUOR/min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            <span>{activity.supports_gps ? "GPS" : "Manual"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{activity.min_duration_minutes}+ min</span>
                          </div>
                        </div>
                        
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {activity.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Indicador de seleção */}
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
      
      {/* Botão flutuante fixo na parte inferior */}
      {selectedActivity && selectedActivityData && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg">
          <div className="container mx-auto">
            <div className="flex items-center gap-4">
              {/* Informações da atividade selecionada */}
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center`}>
                  <selectedActivityData.icon className={`h-5 w-5 ${selectedActivityData.color}`} />
                </div>
                <div>
                  <h4 className="font-semibold">{selectedActivityData.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedActivityData.base_suor_per_minute} SUOR/min • {selectedActivityData.supports_gps ? 'GPS' : 'Manual'}
                  </p>
                </div>
              </div>
              
              {/* Botão de iniciar */}
              <Button 
                size="lg"
                onClick={handleStartActivity}
                className="px-8"
              >
                <Play className="mr-2 h-5 w-5" />
                Iniciar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityStart;