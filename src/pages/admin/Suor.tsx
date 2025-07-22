import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, MoreHorizontal, Coins, TrendingUp, TrendingDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Suor() {
  const transactions = [
    { 
      id: 1, 
      user: "Maria Silva", 
      type: "Ganho", 
      amount: "+150", 
      activity: "Corrida 5km", 
      date: "24/12/2024 14:30",
      status: "Confirmado"
    },
    { 
      id: 2, 
      user: "João Santos", 
      type: "Resgate", 
      amount: "-500", 
      activity: "Cupom Alimentação", 
      date: "24/12/2024 12:15",
      status: "Processado"
    },
    { 
      id: 3, 
      user: "Ana Costa", 
      type: "Bônus", 
      amount: "+300", 
      activity: "Desafio Semanal", 
      date: "24/12/2024 09:45",
      status: "Confirmado"
    },
    { 
      id: 4, 
      user: "Pedro Lima", 
      type: "Ganho", 
      amount: "+80", 
      activity: "Caminhada", 
      date: "24/12/2024 07:20",
      status: "Confirmado"
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Controle SUOR</h2>
          <p className="text-muted-foreground">Monitore a economia virtual da plataforma</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Ajuste Manual
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">SUOR Total Circulante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">2.847.320</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +15% este mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">SUOR Distribuído Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">45.680</div>
            <p className="text-xs text-muted-foreground">1.247 transações</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">SUOR Resgatado Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">28.340</div>
            <p className="text-xs text-muted-foreground">734 resgates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">62%</div>
            <p className="text-xs text-muted-foreground">SUOR ganho vs resgatado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Atividade</CardTitle>
            <CardDescription>SUOR distribuído por tipo de atividade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { activity: "Corrida", amount: "28,450", percentage: "45%" },
                { activity: "Caminhada", amount: "15,680", percentage: "25%" },
                { activity: "Ciclismo", amount: "12,340", percentage: "20%" },
                { activity: "Outros", amount: "6,170", percentage: "10%" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground">{item.activity}</p>
                    <p className="text-sm text-muted-foreground">{item.percentage} do total</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary">{item.amount} SUOR</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Resgates</CardTitle>
            <CardDescription>Recompensas mais populares</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { reward: "Cupom Alimentação", redeems: "234", suor: "117,000" },
                { reward: "Desconto Academia", redeems: "156", suor: "78,000" },
                { reward: "Transporte Público", redeems: "98", suor: "49,000" },
                { reward: "Produtos Esportivos", redeems: "67", suor: "33,500" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground">{item.reward}</p>
                    <p className="text-sm text-muted-foreground">{item.redeems} resgates</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-destructive">-{item.suor} SUOR</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>
            Histórico de movimentações de SUOR na plataforma
          </CardDescription>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar transações..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Atividade/Item</TableHead>
                <TableHead>Data & Hora</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.user}</TableCell>
                  <TableCell>
                    <Badge variant={
                      transaction.type === "Ganho" ? "default" : 
                      transaction.type === "Bônus" ? "secondary" : 
                      "outline"
                    }>
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={`font-medium flex items-center gap-1 ${
                      transaction.amount.startsWith('+') ? 'text-primary' : 'text-destructive'
                    }`}>
                      {transaction.amount.startsWith('+') ? 
                        <TrendingUp className="h-3 w-3" /> : 
                        <TrendingDown className="h-3 w-3" />
                      }
                      {transaction.amount} SUOR
                    </div>
                  </TableCell>
                  <TableCell>{transaction.activity}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Histórico Usuário</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Reverter Transação
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}