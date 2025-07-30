import { Play, MapPin, Clock, TrendingUp, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// NOVA INTERFACE baseada no backend
interface ActivityCardProps {
  id: string;
  name: string;
  description?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  base_suor_per_minute: number;
  min_duration_minutes: number;
  icon_name?: string;
  color_hex?: string;
  onStart?: (id: string) => void;
}

const ActivityCard = ({ 
  id,
  name, 
  description, 
  category,
  difficulty, 
  base_suor_per_minute,
  min_duration_minutes,
  icon_name,
  color_hex,
  onStart
}: ActivityCardProps) => {
  
  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case "easy": return "Fácil";
      case "medium": return "Médio";
      case "hard": return "Difícil";
      default: return "Médio";
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy": return "bg-success";
      case "medium": return "bg-warning";
      case "hard": return "bg-destructive";
      default: return "bg-muted";
    }
  };

  // Calcular SUOR estimado para duração mínima
  const estimatedSuor = Math.round(base_suor_per_minute * min_duration_minutes);

  // Icone baseado na categoria
  const getCategoryIcon = () => {
    switch (category) {
      case 'running': return '🏃‍♂️';
      case 'cycling': return '🚴‍♂️';
      case 'walking': return '🚶‍♂️';
      case 'swimming': return '🏊‍♂️';
      case 'yoga': return '🧘‍♀️';
      case 'gym': return '💪';
      default: return '⚡';
    }
  };

  const handleStartActivity = () => {
    if (onStart) {
      onStart(id);
    }
  };

  return (
    <Card className="card-agita group cursor-pointer touch-manipulation">
      <CardHeader className="pb-3 px-4 md:px-6">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <span className="text-xl">{getCategoryIcon()}</span>
          </div>
          <div className="suor-coin">
            <Coins className="w-3 h-3" />
            <span className="text-xs font-medium">+{estimatedSuor}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <CardTitle className="text-base md:text-lg text-foreground group-hover:text-primary transition-colors">
            {name}
          </CardTitle>
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <span className={`text-xs px-2 py-1 rounded-full text-white ${getDifficultyColor(difficulty)}`}>
            {getDifficultyLabel(difficulty)}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
            <Clock className="w-3 h-3 inline mr-1" />
            {min_duration_minutes} min
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-4 md:px-6 pt-0">
        <Button 
          className="w-full text-sm group-hover:bg-primary/90 transition-colors"
          onClick={handleStartActivity}
        >
          <Play className="w-4 h-4 mr-2" />
          Iniciar Atividade
        </Button>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;