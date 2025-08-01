import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useRedeemReward, type Reward, type RewardCategory } from '@/hooks/useRewards';
import { useProfile } from '@/hooks/useProfile';
import { 
  ShoppingCart, 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Package, 
  Zap,
  Gift,
  Ticket,
  Utensils,
  Dumbbell,
  Car,
  Monitor,
  GraduationCap,
  Heart,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface RewardCardProps {
  reward: Reward;
  featured?: boolean;
  compact?: boolean;
}

// Função para mapear ícones por categoria
const getCategoryIcon = (category: RewardCategory) => {
  const iconMap = {
    fitness: Dumbbell,
    food: Utensils,
    mobility: Car,
    entertainment: Ticket,
    health: Heart,
    education: GraduationCap,
    technology: Monitor,
    tax_benefits: DollarSign
  };
  return iconMap[category] || Gift;
};

// Função para mapear cores por categoria
const getCategoryColor = (category: RewardCategory) => {
  const colorMap = {
    fitness: 'bg-blue-500',
    food: 'bg-orange-500',
    mobility: 'bg-green-500',
    entertainment: 'bg-purple-500',
    health: 'bg-red-500',
    education: 'bg-indigo-500',
    technology: 'bg-gray-600',
    tax_benefits: 'bg-yellow-500'
  };
  return colorMap[category] || 'bg-gray-500';
};

// Função para traduzir categorias
const translateCategory = (category: RewardCategory) => {
  const translations = {
    fitness: 'Fitness',
    food: 'Alimentação',
    mobility: 'Mobilidade',
    entertainment: 'Entretenimento',
    health: 'Saúde',
    education: 'Educação',
    technology: 'Tecnologia',
    tax_benefits: 'Benefícios Fiscais'
  };
  return translations[category] || category;
};

// Função para traduzir tipos
const translateType = (type: string) => {
  const translations = {
    product: 'Produto',
    service: 'Serviço',
    discount: 'Desconto',
    voucher: 'Voucher',
    experience: 'Experiência'
  };
  return translations[type as keyof typeof translations] || type;
};

const RewardCard = ({ reward, featured = false, compact = false }: RewardCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const { data: profile } = useProfile();
  const redeemReward = useRedeemReward();

  const CategoryIcon = getCategoryIcon(reward.category);
  const categoryColor = getCategoryColor(reward.category);
  
  const canAfford = profile ? profile.current_suor >= reward.suor_price : false;
  const hasStock = reward.stock_quantity === null || reward.stock_quantity > 0;
  const isAvailable = hasStock && reward.is_active;

  const handleRedeem = () => {
    if (!canAfford) {
      return;
    }

    redeemReward.mutate({
      reward_id: reward.id
    });
  };

  const savings = reward.original_price ? reward.original_price - (reward.suor_price / 10) : 0; // Assumindo 1 SUOR = R$ 0,10

  if (compact) {
    return (
      <Card className="card-agita hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${categoryColor} text-white flex-shrink-0`}>
              <CategoryIcon className="h-4 w-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm truncate">{reward.name}</h3>
                  <p className="text-xs text-muted-foreground">{reward.partner_name}</p>
                </div>
                
                {featured && (
                  <Badge variant="outline" className="text-xs border-warning text-warning">
                    <Star className="h-3 w-3 mr-1" />
                    Destaque
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-primary" />
                  <span className="text-sm font-bold text-primary">{reward.suor_price}</span>
                </div>
                
                <Button 
                  size="sm" 
                  variant={canAfford ? "default" : "secondary"}
                  disabled={!isAvailable || !canAfford || redeemReward.isPending}
                  onClick={handleRedeem}
                  className="h-7 px-2 text-xs"
                >
                  {redeemReward.isPending ? 'Resgatando...' : 'Resgatar'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-agita hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${categoryColor} text-white`}>
              <CategoryIcon className="h-5 w-5" />
            </div>
            <div>
              <Badge variant="outline" className="text-xs">
                {translateCategory(reward.category)}
              </Badge>
              {featured && (
                <Badge variant="outline" className="ml-1 text-xs border-warning text-warning">
                  <Star className="h-3 w-3 mr-1" />
                  Destaque
                </Badge>
              )}
            </div>
          </div>
          
          {!hasStock && (
            <Badge variant="destructive" className="text-xs">
              Esgotado
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Título e Parceiro */}
        <div>
          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
            {reward.name}
          </h3>
          <p className="text-sm text-muted-foreground">{reward.partner_name}</p>
        </div>

        {/* Descrição */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {reward.description}
        </p>

        {/* Preço e Economia */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold text-primary">{reward.suor_price}</span>
              <span className="text-sm text-muted-foreground">SUOR</span>
            </div>
            
            {reward.original_price && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground line-through">
                  {formatCurrency(reward.original_price)}
                </p>
                {savings > 0 && (
                  <p className="text-xs text-green-600 font-medium">
                    Economize {formatCurrency(savings)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            <span>{translateType(reward.type)}</span>
          </div>
          
          {reward.max_per_user > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>Máx. {reward.max_per_user}</span>
            </div>
          )}
          
          {reward.available_cities && reward.available_cities.length > 0 && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{reward.available_cities[0]}</span>
            </div>
          )}
        </div>

        {/* Disponibilidade temporal */}
        {reward.available_until && (
          <div className="flex items-center gap-1 text-xs text-orange-600">
            <Clock className="h-3 w-3" />
            <span>
              Válido até {new Date(reward.available_until).toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                Ver Detalhes
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${categoryColor} text-white`}>
                    <CategoryIcon className="h-5 w-5" />
                  </div>
                  {reward.name}
                </DialogTitle>
                <DialogDescription>{reward.partner_name}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Descrição</h4>
                  <p className="text-sm text-muted-foreground">{reward.description}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Como Resgatar</h4>
                  <p className="text-sm text-muted-foreground">{reward.redemption_instructions}</p>
                </div>

                {reward.terms_conditions && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Termos e Condições</h4>
                      <p className="text-sm text-muted-foreground">{reward.terms_conditions}</p>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="text-xl font-bold text-primary">{reward.suor_price}</span>
                    <span className="text-sm text-muted-foreground">SUOR</span>
                  </div>
                  
                  <Button 
                    disabled={!isAvailable || !canAfford || redeemReward.isPending}
                    onClick={handleRedeem}
                    className="flex items-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {redeemReward.isPending ? 'Resgatando...' : 'Resgatar'}
                  </Button>
                </div>

                {!canAfford && (
                  <p className="text-sm text-red-600 text-center">
                    SUOR insuficiente. Você precisa de {reward.suor_price - (profile?.current_suor || 0)} SUOR a mais.
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            disabled={!isAvailable || !canAfford || redeemReward.isPending}
            onClick={handleRedeem}
            className="flex-1 flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            {redeemReward.isPending ? 'Resgatando...' : 'Resgatar'}
          </Button>
        </div>

        {!canAfford && (
          <p className="text-sm text-red-600 text-center">
            SUOR insuficiente
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RewardCard;