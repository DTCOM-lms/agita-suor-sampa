import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, TrendingUp, Users, Clock, MapPin, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import MobileBottomNav from "@/components/MobileBottomNav";
import AchievementCard from "@/components/AchievementCard";
import { useUserAchievements, useAchievementProgress, useAchievementStats } from "@/hooks/useAchievements";
import { useAuth } from "@/contexts/AuthContext";

const Achievements = () => {
  const { profile } = useAuth();
  const { data: userAchievements, isLoading: achievementsLoading } = useUserAchievements();
  const { data: achievementProgress, isLoading: progressLoading } = useAchievementProgress();
  const { data: stats } = useAchievementStats();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'Todas', icon: <Trophy className="w-4 h-4" />, emoji: '🏆' },
    { id: 'activity', name: 'Atividades', icon: <TrendingUp className="w-4 h-4" />, emoji: '🏃‍♂️' },
    { id: 'distance', name: 'Distância', icon: <MapPin className="w-4 h-4" />, emoji: '📏' },
    { id: 'duration', name: 'Duração', icon: <Clock className="w-4 h-4" />, emoji: '⏱️' },
    { id: 'frequency', name: 'Frequência', icon: <Star className="w-4 h-4" />, emoji: '🔄' },
    { id: 'social', name: 'Social', icon: <Users className="w-4 h-4" />, emoji: '👥' },
    { id: 'special', name: 'Especiais', icon: <Sparkles className="w-4 h-4" />, emoji: '✨' },
  ];

  const getFilteredProgress = () => {
    if (!achievementProgress) return [];
    
    if (selectedCategory === 'all') {
      return achievementProgress;
    }
    
    return achievementProgress.filter(progress => 
      progress.achievement.category === selectedCategory
    );
  };

  const unlockedAchievements = getFilteredProgress().filter(p => p.is_unlocked);
  const lockedAchievements = getFilteredProgress().filter(p => !p.is_unlocked);

  if (achievementsLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Carregando Conquistas</h3>
              <p className="text-muted-foreground">
                Preparando suas conquistas...
              </p>
            </CardContent>
          </Card>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gradient-primary">🏆 Conquistas</h1>
          <p className="text-muted-foreground">
            Suas medalhas e troféus conquistados no Agita
          </p>
        </div>

        {/* Achievement Stats */}
        {stats && (
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Estatísticas de Conquistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.unlocked}</div>
                  <div className="text-sm text-muted-foreground">Desbloqueadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{stats.percentage}%</div>
                  <div className="text-sm text-muted-foreground">Progresso</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{stats.totalSuorFromAchievements}</div>
                  <div className="text-sm text-muted-foreground">SUOR Ganho</div>
                </div>
              </div>

              {/* Rarity breakdown */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="outline" className="bg-slate-100">
                    🥉 Comum: {stats.byRarity.common}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-100">
                    🥈 Raro: {stats.byRarity.rare}
                  </Badge>
                  <Badge variant="outline" className="bg-purple-100">
                    🥇 Épico: {stats.byRarity.epic}
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-100">
                    👑 Lendário: {stats.byRarity.legendary}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <span>{category.emoji}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Achievements Tabs */}
        <Tabs defaultValue="unlocked" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unlocked" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Desbloqueadas ({unlockedAchievements.length})
            </TabsTrigger>
            <TabsTrigger value="locked" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Em Progresso ({lockedAchievements.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unlocked" className="space-y-4">
            {unlockedAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedAchievements.map((progress) => (
                  <AchievementCard
                    key={progress.achievement_id}
                    id={progress.achievement_id}
                    name={progress.achievement.name}
                    description={progress.achievement.description}
                    category={progress.achievement.category}
                    type={progress.achievement.type}
                    rarity={progress.achievement.rarity}
                    suorReward={progress.achievement.suor_reward}
                    isUnlocked={true}
                    unlockedAt={userAchievements?.find(ua => ua.achievement_id === progress.achievement_id)?.unlocked_at}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma conquista desbloqueada</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete atividades para ganhar suas primeiras conquistas!
                  </p>
                  <Button onClick={() => window.location.href = '/'}>
                    Começar Atividade
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="locked" className="space-y-4">
            {lockedAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedAchievements
                  .sort((a, b) => b.percentage - a.percentage) // Sort by progress descending
                  .map((progress) => (
                    <AchievementCard
                      key={progress.achievement_id}
                      id={progress.achievement_id}
                      name={progress.achievement.name}
                      description={progress.achievement.description}
                      category={progress.achievement.category}
                      type={progress.achievement.type}
                      rarity={progress.achievement.rarity}
                      suorReward={progress.achievement.suor_reward}
                      isUnlocked={false}
                      progress={progress.percentage}
                      currentProgress={progress.current_progress}
                      targetValue={progress.target_value}
                    />
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Todas as conquistas desbloqueadas!</h3>
                  <p className="text-muted-foreground">
                    Parabéns! Você completou todas as conquistas disponíveis nesta categoria.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default Achievements; 