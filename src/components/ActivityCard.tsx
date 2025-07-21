import { Play, MapPin, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  suorReward: number;
  difficulty: "Fácil" | "Médio" | "Difícil";
  location?: string;
  duration?: string;
}

const ActivityCard = ({ 
  title, 
  description, 
  icon, 
  suorReward, 
  difficulty, 
  location, 
  duration 
}: ActivityCardProps) => {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Fácil": return "bg-success";
      case "Médio": return "bg-warning";
      case "Difícil": return "bg-destructive";
      default: return "bg-muted";
    }
  };

  return (
    <Card className="card-agita group cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
          <div className="suor-coin">
            +{suorReward} SUOR
          </div>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          )}
          {duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs text-white ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
          <Button size="sm" className="group-hover:bg-primary-glow transition-colors">
            <Play className="h-4 w-4 mr-1" />
            Iniciar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;