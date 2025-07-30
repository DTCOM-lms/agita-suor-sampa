import React, { createContext, useContext } from 'react';
import { useAchievementNotifications } from '@/components/AchievementNotification';

interface Achievement {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  type: 'milestone' | 'challenge' | 'badge' | 'trophy';
  suor_reward: number;
}

interface AchievementNotificationContextType {
  showNotification: (achievement: Achievement) => void;
  currentNotification: Achievement | null;
  closeCurrentNotification: () => void;
  hasNotifications: boolean;
}

const AchievementNotificationContext = createContext<AchievementNotificationContextType | undefined>(undefined);

export const useAchievementNotificationContext = () => {
  const context = useContext(AchievementNotificationContext);
  if (context === undefined) {
    throw new Error('useAchievementNotificationContext must be used within an AchievementNotificationProvider');
  }
  return context;
};

interface AchievementNotificationProviderProps {
  children: React.ReactNode;
}

export const AchievementNotificationProvider: React.FC<AchievementNotificationProviderProps> = ({ children }) => {
  const notificationHook = useAchievementNotifications();

  return (
    <AchievementNotificationContext.Provider value={notificationHook}>
      {children}
    </AchievementNotificationContext.Provider>
  );
}; 