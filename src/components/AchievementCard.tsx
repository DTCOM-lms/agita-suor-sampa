import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Award, Medal, Coins, Lock } from "lucide-react";

interface AchievementCardProps {
  id: string;
  name: string;
  description: string;
  category: 'activity' | 'distance' | 'duration' | 'frequency' | 'social' | 'special';
  type: 'milestone' | 'challenge' | 'badge' | 'trophy';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  suorReward: number;
  isUnlocked: boolean;
  progress?: number; // 0-100
  currentProgress?: number;
  targetValue?: number;
  unlockedAt?: string;
  iconName?: string;
  badgeColor?: string;
}

const AchievementCard = ({
  name,
  description,
  category,
  type,
  rarity,
  suorReward,
  isUnlocked,
  progress = 0,
  currentProgress,
  targetValue,
  unlockedAt,
  iconName,
  badgeColor
}: AchievementCardProps) => {
  
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-slate-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-muted';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Comum';
      case 'rare': return 'Raro';
      case 'epic': return 'Épico';
      case 'legendary': return 'Lendário';
      default: return rarity;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trophy': return <Trophy className="w-5 h-5" />;
      case 'medal': return <Medal className="w-5 h-5" />;
      case 'badge': return <Award className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'activity': return '🏃‍♂️';
      case 'distance': return '📏';
      case 'duration': return '⏱️';
      case 'frequency': return '🔄';
      case 'social': return '👥';
      case 'special': return '✨';
      default: return '🏆';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card className={`relative transition-all duration-200 ${
      isUnlocked 
        ? 'border-primary bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-lg' 
        : 'border-muted bg-muted/50 hover:bg-muted/70'
    }`}>
      
      {/* Rarity indicator */}
      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getRarityColor(rarity)}`} />
      
      {/* Lock overlay for locked achievements */}
      {!isUnlocked && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isUnlocked ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <span className="text-xl">{getCategoryEmoji(category)}</span>
            </div>
            <div>
              <CardTitle className={`text-base md:text-lg ${
                isUnlocked ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {name}
              </CardTitle>
              {unlockedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Desbloqueado em {formatDate(unlockedAt)}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {getTypeIcon(type)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className={`text-sm ${
          isUnlocked ? 'text-foreground' : 'text-muted-foreground'
        }`}>
          {description}
        </p>

        {/* Progress bar for locked achievements */}
        {!isUnlocked && typeof progress === 'number' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progresso</span>
              <span>
                {currentProgress}/{targetValue} ({progress}%)
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {getRarityLabel(rarity)}
            </Badge>
            <Badge variant="secondary" className="text-xs capitalize">
              {type}
            </Badge>
          </div>
          
          {suorReward > 0 && (
            <div className={`flex items-center gap-1 text-sm ${
              isUnlocked ? 'text-primary' : 'text-muted-foreground'
            }`}>
              <Coins className="w-4 h-4" />
              <span className="font-medium">+{suorReward}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementCard; 