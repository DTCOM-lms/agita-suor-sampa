import { Coins, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSuorBalance, useSuorTransactions } from '@/hooks/useSuor';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const SuorBalance = () => {
  const { currentSuor, totalSuor, level, experiencePoints } = useSuorBalance();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  return (
    <Card className="gradient-primary text-primary-foreground">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Coins className="w-5 h-5" />
          Saldo SUOR
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold mb-1">
            {formatNumber(currentSuor)}
          </div>
          <div className="text-primary-foreground/80 text-sm">
            Total ganho: {formatNumber(totalSuor)}
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-primary-foreground/20">
          <div className="text-center">
            <div className="text-lg font-semibold">{level}</div>
            <div className="text-xs text-primary-foreground/80">Nível</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{formatNumber(experiencePoints)}</div>
            <div className="text-xs text-primary-foreground/80">XP</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const SuorTransactionsList = () => {
  const { data: transactions, isLoading } = useSuorTransactions(10);

  if (isLoading) {
    return <div className="text-center py-4">Carregando transações...</div>;
  }

  if (!transactions?.length) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Coins className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhuma transação ainda</p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete atividades para começar a ganhar SUOR!
          </p>
        </CardContent>
      </Card>
    );
  }

  const getTransactionIcon = (type: string, source: string) => {
    if (type === 'earned') return <TrendingUp className="w-4 h-4 text-success" />;
    if (type === 'spent') return <Coins className="w-4 h-4 text-destructive" />;
    if (source === 'achievement') return <Award className="w-4 h-4 text-warning" />;
    return <Coins className="w-4 h-4 text-muted-foreground" />;
  };

  const getTransactionColor = (type: string) => {
    return type === 'earned' || type === 'bonus' ? 'text-success' : 'text-destructive';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Histórico SUOR</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <div className="flex items-center gap-3">
              {getTransactionIcon(transaction.type, transaction.source)}
              <div>
                <div className="text-sm font-medium">
                  {transaction.description}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(transaction.created_at), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </div>
              </div>
            </div>
            <div className={`text-sm font-semibold ${getTransactionColor(transaction.type)}`}>
              {transaction.type === 'earned' || transaction.type === 'bonus' ? '+' : '-'}
              {new Intl.NumberFormat('pt-BR').format(transaction.amount)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}; 