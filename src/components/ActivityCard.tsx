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
    <Card className="card-agita group cursor-pointer touch-manipulation">
      <CardHeader className="pb-3 px-4 md:px-6">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
          <div className="suor-coin">
            <span className="hidden xs:inline">+{suorReward} SUOR</span>
            <span className="xs:hidden">+{suorReward}</span>
          </div>
        </div>
        <CardTitle className="text-base md:text-lg leading-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 md:px-6">
        <p className="text-muted-foreground text-sm mb-3 md:mb-4 line-clamp-2">{description}</p>
        
        <div className="flex flex-col xs:flex-row gap-2 xs:gap-4 mb-3 md:mb-4 text-xs md:text-sm text-muted-foreground">
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
          {duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span>{duration}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className={`px-2 py-1 rounded-full text-xs text-white flex-shrink-0 ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
          <Button size="sm" className="group-hover:bg-primary-glow transition-colors btn-mobile">
            <Play className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            <span className="hidden sm:inline">Iniciar</span>
            <span className="sm:hidden">▶</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;