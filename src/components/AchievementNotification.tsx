import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Award, Medal, Coins, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Achievement {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  type: 'milestone' | 'challenge' | 'badge' | 'trophy';
  suor_reward: number;
}

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  show: boolean;
}

const AchievementNotification = ({ achievement, onClose, show }: AchievementNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      // Delay para animação de entrada
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-slate-500 to-slate-600';
      case 'rare': return 'from-blue-500 to-blue-600';
      case 'epic': return 'from-purple-500 to-purple-600';
      case 'legendary': return 'from-yellow-500 to-yellow-600';
      default: return 'from-primary to-primary';
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
      case 'trophy': return <Trophy className="w-8 h-8" />;
      case 'medal': return <Medal className="w-8 h-8" />;
      case 'badge': return <Award className="w-8 h-8" />;
      default: return <Star className="w-8 h-8" />;
    }
  };

  const getRarityEmoji = (rarity: string) => {
    switch (rarity) {
      case 'common': return '🥉';
      case 'rare': return '🥈';
      case 'epic': return '🥇';
      case 'legendary': return '👑';
      default: return '🏆';
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Delay para animação de saída
  };

  useEffect(() => {
    if (show) {
      // Auto close after 5 seconds
      const timer = setTimeout(handleClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <Card className={`w-full max-w-md mx-4 transform transition-all duration-500 ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      } relative overflow-hidden`}>
        
        {/* Background gradient based on rarity */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(achievement.rarity)} opacity-10`} />
        
        {/* Sparkle effects for legendary */}
        {achievement.rarity === 'legendary' && (
          <div className="absolute inset-0 overflow-hidden">
            <Sparkles className="absolute top-2 left-2 w-4 h-4 text-yellow-400 animate-pulse" />
            <Sparkles className="absolute top-4 right-4 w-3 h-3 text-yellow-400 animate-pulse delay-300" />
            <Sparkles className="absolute bottom-4 left-4 w-3 h-3 text-yellow-400 animate-pulse delay-500" />
          </div>
        )}

        <div className="relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>

          <CardContent className="p-6 text-center space-y-4">
            {/* Main icon with animation */}
            <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${getRarityColor(achievement.rarity)} 
              flex items-center justify-center text-white animate-bounce`}>
              {getTypeIcon(achievement.type)}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gradient-primary">
                🎉 Conquista Desbloqueada!
              </h2>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">{getRarityEmoji(achievement.rarity)}</span>
                <h3 className="text-xl font-semibold">{achievement.name}</h3>
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground">
              {achievement.description}
            </p>

            {/* Rarity and reward */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white text-sm font-medium`}>
                {getRarityLabel(achievement.rarity)}
              </div>
              
              {achievement.suor_reward > 0 && (
                <div className="flex items-center gap-1 text-primary font-semibold">
                  <Coins className="w-4 h-4" />
                  <span>+{achievement.suor_reward} SUOR</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.location.href = '/achievements'}
              >
                Ver Conquistas
              </Button>
              <Button 
                className="flex-1"
                onClick={handleClose}
              >
                Continuar
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

// Hook para gerenciar notificações de conquistas
export const useAchievementNotifications = () => {
  const [notifications, setNotifications] = useState<Achievement[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Achievement | null>(null);

  const showNotification = (achievement: Achievement) => {
    setNotifications(prev => [...prev, achievement]);
    
    // Também mostrar toast para notificação rápida
    toast.success("🏆 Nova conquista desbloqueada!", {
      description: achievement.name,
      action: {
        label: "Ver",
        onClick: () => window.location.href = '/achievements'
      }
    });
  };

  const processNextNotification = () => {
    if (notifications.length > 0 && !currentNotification) {
      const next = notifications[0];
      setCurrentNotification(next);
      setNotifications(prev => prev.slice(1));
    }
  };

  const closeCurrentNotification = () => {
    setCurrentNotification(null);
    // Process next notification after a delay
    setTimeout(processNextNotification, 500);
  };

  // Auto process next notification
  useEffect(() => {
    processNextNotification();
  }, [notifications, currentNotification]);

  return {
    currentNotification,
    showNotification,
    closeCurrentNotification,
    hasNotifications: notifications.length > 0 || !!currentNotification
  };
};

export default AchievementNotification; 