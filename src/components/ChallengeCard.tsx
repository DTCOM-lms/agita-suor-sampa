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
    <Card className={`card-agita group ${isActive ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span className={`px-2 py-1 rounded-full text-xs ${
              type === "coletivo" 
                ? "bg-secondary text-secondary-foreground" 
                : "bg-accent text-accent-foreground"
            }`}>
              {type === "coletivo" ? "Coletivo" : "Individual"}
            </span>
          </div>
          <div className="suor-coin">
            <Trophy className="h-4 w-4" />
            {reward} SUOR
          </div>
        </div>
        <CardTitle className="text-lg leading-tight">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Users2 className="h-4 w-4" />
                <span>{participants} participando</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{timeLeft}</span>
              </div>
            </div>
          </div>

          {/* Action */}
          <Button 
            className="w-full group-hover:bg-primary-glow transition-colors" 
            variant={isActive ? "default" : "outline"}
          >
            {isActive ? "Continuar" : "Participar"}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengeCard;