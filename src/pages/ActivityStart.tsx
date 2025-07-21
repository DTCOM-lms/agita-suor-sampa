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
  ArrowLeft
} from "lucide-react";
import Header from "@/components/Header";

const activities = [
  {
    id: "running",
    name: "Corrida",
    icon: Activity,
    color: "text-primary",
    description: "Acompanhe sua corrida com GPS preciso",
    suorMultiplier: 1.5,
    difficulty: "Médio"
  },
  {
    id: "cycling",
    name: "Ciclismo",
    icon: Bike,
    color: "text-secondary",
    description: "Registre suas pedaladas pela cidade",
    suorMultiplier: 1.2,
    difficulty: "Fácil"
  },
  {
    id: "walking",
    name: "Caminhada",
    icon: MapPin,
    color: "text-accent",
    description: "Ideal para iniciantes e atividade relaxante",
    suorMultiplier: 1.0,
    difficulty: "Fácil"
  }
];

const ActivityStart = () => {
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const handleStartActivity = () => {
    if (selectedActivity) {
      navigate(`/activity/${selectedActivity}/tracking`);
    }
  };

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
                  <CardDescription>{activity.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        SUOR x{activity.suorMultiplier}
                      </span>
                    </div>
                    <Badge variant={
                      activity.difficulty === "Fácil" ? "secondary" : 
                      activity.difficulty === "Médio" ? "default" : "destructive"
                    }>
                      {activity.difficulty}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>GPS</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Tempo real</span>
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