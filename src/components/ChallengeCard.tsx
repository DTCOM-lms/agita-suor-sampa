import { Trophy, Clock, Users2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ChallengeCardProps {
  title: string;
  description: string;
  progress: number;
  participants: number;
  timeLeft: string;
  reward: number;
  type: "individual" | "coletivo";
  isActive?: boolean;
}

const ChallengeCard = ({ 
  title, 
  description, 
  progress, 
  participants, 
  timeLeft, 
  reward, 
  type,
  isActive = false 
}: ChallengeCardProps) => {
  return (
    <Card className={`card-agita group touch-manipulation ${isActive ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="px-4 md:px-6">
        <div className="flex items-start justify-between mb-2 gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Trophy className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
            <span className={`px-2 py-1 rounded-full text-xs flex-shrink-0 ${
              type === "coletivo" 
                ? "bg-secondary text-secondary-foreground" 
                : "bg-accent text-accent-foreground"
            }`}>
              {type === "coletivo" ? "Coletivo" : "Individual"}
            </span>
          </div>
          <div className="suor-coin flex-shrink-0">
            <Trophy className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden xs:inline">{reward} SUOR</span>
            <span className="xs:hidden">{reward}</span>
          </div>
        </div>
        <CardTitle className="text-base md:text-lg leading-tight pr-2">{title}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </CardHeader>
      
      <CardContent className="px-4 md:px-6">
        <div className="space-y-3 md:space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Stats */}
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users2 className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="truncate">
                <span className="xs:hidden">{participants}</span>
                <span className="hidden xs:inline">{participants} participando</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span>{timeLeft}</span>
            </div>
          </div>

          {/* Action */}
          <Button 
            className="w-full group-hover:bg-primary-glow transition-colors btn-mobile" 
            variant={isActive ? "default" : "outline"}
          >
            {isActive ? "Continuar" : "Participar"}
            <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengeCard;