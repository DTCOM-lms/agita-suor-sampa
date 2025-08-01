import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useRewards, useFeaturedRewards, useUserRewards, useRewardStats, type RewardCategory } from '@/hooks/useRewards';
import { useProfile } from '@/hooks/useProfile';
import RewardCard from '@/components/RewardCard';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import { 
  Search, 
  Filter, 
  Zap, 
  Star, 
  ShoppingBag, 
  History, 
  TrendingUp,
  Package,
  Gift,
  Utensils,
  Dumbbell,
  Car,
  Monitor,
  GraduationCap,
  Heart,
  DollarSign,
  Ticket
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mapeamento de ícones por categoria
const categoryIcons = {
  fitness: Dumbbell,
  food: Utensils,
  mobility: Car,
  entertainment: Ticket,
  health: Heart,
  education: GraduationCap,
  technology: Monitor,
  tax_benefits: DollarSign
};

// Tradução de categorias
const categoryLabels = {
  fitness: 'Fitness',
  food: 'Alimentação',
  mobility: 'Mobilidade',
  entertainment: 'Entretenimento',
  health: 'Saúde',
  education: 'Educação',
  technology: 'Tecnologia',
  tax_benefits: 'Benefícios Fiscais'
};

// Tradução de status
const statusLabels = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  used: 'Utilizado',
  expired: 'Expirado',
  cancelled: 'Cancelado'
};

const Store = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RewardCategory | 'all'>('all');
  const [activeTab, setActiveTab] = useState('store');

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: featuredRewards, isLoading: featuredLoading } = useFeaturedRewards();
  const { data: rewards, isLoading: rewardsLoading } = useRewards(
    selectedCategory === 'all' ? undefined : selectedCategory
  );
  const { data: userRewards, isLoading: userRewardsLoading } = useUserRewards();
  const { data: rewardStats } = useRewardStats();

  // Filtrar recompensas por termo de busca
  const filteredRewards = rewards?.filter(reward =>
    reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reward.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reward.partner_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Categorias disponíveis
  const categories: Array<{ key: RewardCategory | 'all'; label: string; icon: any }> = [
    { key: 'all', label: 'Todas', icon: Package },
    { key: 'fitness', label: 'Fitness', icon: categoryIcons.fitness },
    { key: 'food', label: 'Alimentação', icon: categoryIcons.food },
    { key: 'mobility', label: 'Mobilidade', icon: categoryIcons.mobility },
    { key: 'entertainment', label: 'Entretenimento', icon: categoryIcons.entertainment },
    { key: 'health', label: 'Saúde', icon: categoryIcons.health },
  ];

  const isLoading = profileLoading || featuredLoading || rewardsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Header />
      
      <div className="container mx-auto px-4 pt-20 pb-24 space-y-6">
        {/* Cabeçalho da Loja */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Loja SUOR
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Troque seus pontos SUOR por recompensas incríveis! Parceiros locais, descontos exclusivos e muito mais.
          </p>
        </div>

        {/* Saldo do Usuário */}
        {profile && (
          <Card className="card-agita">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Seu Saldo</p>
                    <p className="text-2xl font-bold text-primary">{profile.current_suor} SUOR</p>
                  </div>
                </div>
                
                {rewardStats && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Gasto</p>
                    <p className="text-lg font-semibold">{rewardStats.totalSuorSpent} SUOR</p>
                    <p className="text-xs text-muted-foreground">{rewardStats.totalRewards} recompensas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navegação por Abas */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="store" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Loja
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Meu Histórico
            </TabsTrigger>
          </TabsList>

          {/* Aba da Loja */}
          <TabsContent value="store" className="space-y-6">
            {/* Filtros e Busca */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar recompensas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtros por Categoria */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.key}
                      variant={selectedCategory === category.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.key)}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <Icon className="h-4 w-4" />
                      {category.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Recompensas em Destaque */}
            {featuredRewards && featuredRewards.length > 0 && selectedCategory === 'all' && !searchTerm && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-warning" />
                  <h2 className="text-xl font-bold">Destaques</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredRewards.map((reward) => (
                    <RewardCard key={reward.id} reward={reward} featured />
                  ))}
                </div>
                
                <Separator />
              </div>
            )}

            {/* Todas as Recompensas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {selectedCategory === 'all' ? 'Todas as Recompensas' : categoryLabels[selectedCategory]}
                </h2>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {filteredRewards.length} disponíveis
                </Badge>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                          <div className="h-8 bg-muted rounded" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredRewards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRewards.map((reward) => (
                    <RewardCard key={reward.id} reward={reward} />
                  ))}
                </div>
              ) : (
                <Card className="card-agita">
                  <CardContent className="p-8 text-center">
                    <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma recompensa encontrada</h3>
                    <p className="text-muted-foreground">
                      {searchTerm 
                        ? 'Tente buscar por outros termos ou alterar os filtros.'
                        : 'Não há recompensas disponíveis nesta categoria no momento.'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Aba do Histórico */}
          <TabsContent value="history" className="space-y-6">
            {/* Estatísticas do Usuário */}
            {rewardStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="card-agita">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{rewardStats.totalSuorSpent}</p>
                    <p className="text-sm text-muted-foreground">SUOR Gasto</p>
                  </CardContent>
                </Card>
                
                <Card className="card-agita">
                  <CardContent className="p-4 text-center">
                    <Package className="h-8 w-8 text-accent mx-auto mb-2" />
                    <p className="text-2xl font-bold">{rewardStats.totalRewards}</p>
                    <p className="text-sm text-muted-foreground">Recompensas</p>
                  </CardContent>
                </Card>
                
                <Card className="card-agita">
                  <CardContent className="p-4 text-center">
                    <Gift className="h-8 w-8 text-warning mx-auto mb-2" />
                    <p className="text-2xl font-bold">{rewardStats.statusBreakdown.used || 0}</p>
                    <p className="text-sm text-muted-foreground">Utilizadas</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Histórico de Recompensas */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Suas Recompensas</h2>
              
              {userRewardsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="h-4 bg-muted rounded w-2/3" />
                          <div className="h-3 bg-muted rounded w-1/3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : userRewards && userRewards.length > 0 ? (
                <div className="space-y-4">
                  {userRewards.map((userReward) => (
                    <Card key={userReward.id} className="card-agita">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{userReward.rewards?.name}</h3>
                              <Badge 
                                variant={userReward.status === 'used' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {statusLabels[userReward.status]}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {userReward.rewards?.partner_name}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                <span>{userReward.suor_spent} SUOR</span>
                              </div>
                              
                              <span>
                                {format(new Date(userReward.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                              </span>
                              
                              {userReward.redemption_code && (
                                <span>Código: {userReward.redemption_code}</span>
                              )}
                            </div>
                          </div>
                          
                          {userReward.rewards && (
                            <RewardCard reward={userReward.rewards} compact />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="card-agita">
                  <CardContent className="p-8 text-center">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma recompensa ainda</h3>
                    <p className="text-muted-foreground mb-4">
                      Você ainda não resgatou nenhuma recompensa. Que tal começar agora?
                    </p>
                    <Button onClick={() => setActiveTab('store')}>
                      Ver Recompensas Disponíveis
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default Store;