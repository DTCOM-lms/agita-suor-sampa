import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Bike, 
  MapPin, 
  Target, 
  Clock,
  Zap,
  ArrowLeft,
  Loader2
} from "lucide-react";
import Header from "@/components/Header";
import { useActivityTypes } from "@/hooks/useActivityTypes";

// Mapeamento de categorias para ícones e cores
const categoryMapping = {
  running: {
    icon: Activity,
    color: "text-red-500",
    description: "Acompanhe sua corrida com GPS preciso"
  },
  cycling: {
    icon: Bike,
    color: "text-blue-500",
    description: "Registre suas pedaladas pela cidade"
  },
  walking: {
    icon: MapPin,
    color: "text-green-500",
    description: "Ideal para iniciantes e atividade relaxante"
  },
  swimming: {
    icon: Activity,
    color: "text-cyan-500",
    description: "Natação para condicionamento completo"
  },
  gym: {
    icon: Activity,
    color: "text-orange-500",
    description: "Treinamento em academia"
  }
} as const;

const ActivityStart = () => {
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  
  // Buscar tipos de atividades reais do Supabase
  const { data: activityTypes, isLoading, error } = useActivityTypes();
  
  // Filtrar apenas as principais categorias para exibição
  const mainCategories = ['running', 'cycling', 'walking', 'swimming', 'gym'];
  const filteredActivities = activityTypes?.filter(activity => 
    mainCategories.includes(activity.category)
  ) || [];
  
  // Agrupar por categoria e pegar o primeiro de cada
  const activities = mainCategories.map(category => {
    const activity = filteredActivities.find(a => a.category === category);
    if (!activity) return null;
    
    const mapping = categoryMapping[category as keyof typeof categoryMapping];
    return {
      ...activity,
      icon: mapping?.icon || Activity,
      color: mapping?.color || "text-primary",
      customDescription: mapping?.description || activity.description
    };
  }).filter(Boolean);

  const handleStartActivity = () => {
    if (selectedActivity) {
      navigate(`/activity/${selectedActivity}/tracking`);
    }
  };
  
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Iniciar Atividade</h1>
            <p className="text-muted-foreground">Escolha sua atividade e comece a ganhar SUOR</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {activities.map((activity) => {
            if (!activity) return null;
            
            const IconComponent = activity.icon;
            const isSelected = selectedActivity === activity.id;
            
            return (
              <Card 
                key={activity.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-primary border-primary' : ''
                }`}
                onClick={() => setSelectedActivity(activity.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4`}>
                    <IconComponent className={`h-8 w-8 ${activity.color}`} />
                  </div>
                  <CardTitle className="text-xl">{activity.name}</CardTitle>
                  <CardDescription>{activity.customDescription}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        SUOR {activity.base_suor_per_minute}/min
                      </span>
                    </div>
                    <Badge variant={
                      activity.difficulty === "easy" ? "secondary" : 
                      activity.difficulty === "medium" ? "default" : "destructive"
                    }>
                      {activity.difficulty === "easy" ? "Fácil" : 
                       activity.difficulty === "medium" ? "Médio" : "Difícil"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>{activity.supports_gps ? "GPS" : "Manual"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{activity.min_duration_minutes}+ min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button 
            size="lg"
            onClick={handleStartActivity}
            disabled={!selectedActivity}
            className="min-w-[200px]"
          >
            <Activity className="mr-2 h-5 w-5" />
            Começar Atividade
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ActivityStart;