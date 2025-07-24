import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Timer, 
  MapPin, 
  TrendingUp, 
  Zap,
  Share2,
  Home,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";

interface ActivityStats {
  duration: number;
  distance: number;
  pace: number;
  suorEarned: number;
}

interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

const ActivityResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { stats, route, activityType, activityName } = location.state as {
    stats: ActivityStats;
    route: LocationPoint[];
    activityType: string;
    activityName: string;
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}min ${secs}s`;
    }
    return `${mins}min ${secs}s`;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const formatPace = (pace: number): string => {
    if (pace === 0 || !isFinite(pace)) return "N/A";
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')} /km`;
  };

  const calculateCalories = (distance: number, duration: number): number => {
    // Rough calculation: ~0.75 calories per meter for running
    const multiplier = activityType === 'running' ? 0.75 : activityType === 'cycling' ? 0.5 : 0.4;
    return Math.round(distance * multiplier);
  };

  const handleShare = () => {
    const shareText = `Acabei de completar uma ${activityName.toLowerCase()} de ${formatDistance(stats.distance)} em ${formatTime(stats.duration)} e ganhei ${stats.suorEarned} SUOR! 🏃‍♂️ #AgitaSP`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Minha atividade no Agita',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Resultado copiado para área de transferência!");
    }
  };

  const achievements = [
    { 
      name: "Primeira Atividade", 
      description: "Complete sua primeira atividade", 
      unlocked: true 
    },
    { 
      name: "Explorador SP", 
      description: "Use GPS para mapear seu percurso", 
      unlocked: route.length > 10 
    },
    { 
      name: "Resistência", 
      description: "Atividade de mais de 30 minutos", 
      unlocked: stats.duration >= 1800 
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Atividade Concluída!</h1>
          <p className="text-muted-foreground">
            Parabéns! Você completou sua {activityName.toLowerCase()}
          </p>
          <Badge variant="default" className="mt-2 px-4 py-2 text-lg">
            +{stats.suorEarned} SUOR
          </Badge>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <Timer className="h-8 w-8 mx-auto mb-3 text-primary" />
              <div className="text-2xl font-bold">{formatTime(stats.duration)}</div>
              <div className="text-sm text-muted-foreground">Duração</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <MapPin className="h-8 w-8 mx-auto mb-3 text-secondary" />
              <div className="text-2xl font-bold">{formatDistance(stats.distance)}</div>
              <div className="text-sm text-muted-foreground">Distância</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-accent" />
              <div className="text-2xl font-bold">{formatPace(stats.pace)}</div>
              <div className="text-sm text-muted-foreground">Ritmo</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <Zap className="h-8 w-8 mx-auto mb-3 text-destructive" />
              <div className="text-2xl font-bold">{calculateCalories(stats.distance, stats.duration)}</div>
              <div className="text-sm text-muted-foreground">Calorias</div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Conquistas Desbloqueadas
            </CardTitle>
            <CardDescription>
              Você desbloqueou {achievements.filter(a => a.unlocked).length} de {achievements.length} conquistas nesta atividade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    achievement.unlocked 
                      ? 'bg-primary/5 border-primary' 
                      : 'bg-muted/50 border-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      achievement.unlocked ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <div className={`font-medium ${!achievement.unlocked && 'text-muted-foreground'}`}>
                        {achievement.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {achievement.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={handleShare} className="min-w-[160px]">
            <Share2 className="mr-2 h-5 w-5" />
            Compartilhar
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => navigate("/activity/start")}
            className="min-w-[160px]"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Nova Atividade
          </Button>
          
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => navigate("/")}
            className="min-w-[160px]"
          >
            <Home className="mr-2 h-5 w-5" />
            Início
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ActivityResults;