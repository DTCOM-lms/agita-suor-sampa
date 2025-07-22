import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, MoreHorizontal, Trophy, Target, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Challenges() {
  const challenges = [
    { 
      id: 1, 
      name: "Dezembro Ativo", 
      type: "Individual", 
      status: "Ativo", 
      participants: 1247, 
      goal: "30 atividades em 30 dias",
      reward: "1000 SUOR",
      startDate: "01/12/2024",
      endDate: "31/12/2024",
      completion: "67%"
    },
    { 
      id: 2, 
      name: "Corrida Coletiva SP", 
      type: "Coletivo", 
      status: "Ativo", 
      participants: 456, 
      goal: "10.000km coletivos",
      reward: "500 SUOR cada",
      startDate: "15/12/2024",
      endDate: "15/01/2025",
      completion: "34%"
    },
    { 
      id: 3, 
      name: "Hidratação Consciente", 
      type: "Individual", 
      status: "Programado", 
      participants: 89, 
      goal: "2L água por 7 dias",
      reward: "200 SUOR",
      startDate: "01/01/2025",
      endDate: "07/01/2025",
      completion: "0%"
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Desafios</h2>
          <p className="text-muted-foreground">Crie e gerencie desafios motivacionais</p>
        </div>
        <Button className="gap-2">
          <Trophy className="h-4 w-4" />
          Novo Desafio
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Desafios Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">15</div>
            <p className="text-xs text-muted-foreground">Em andamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Participações Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">3,456</div>
            <p className="text-xs text-muted-foreground">Usuários engajados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Taxa de Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">73%</div>
            <p className="text-xs text-muted-foreground">Média de finalização</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">SUOR Distribuído</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">89,340</div>
            <p className="text-xs text-muted-foreground">Em recompensas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Desafios Mais Populares</CardTitle>
            <CardDescription>Por número de participantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Passos Diários", participants: "2,134", type: "Individual" },
                { name: "Km Coletivos", participants: "1,567", type: "Coletivo" },
                { name: "Semana Ativa", participants: "1,234", type: "Individual" },
                { name: "Hidratação", participants: "987", type: "Individual" },
              ].map((challenge, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground">{challenge.name}</p>
                    <p className="text-sm text-muted-foreground">{challenge.type}</p>
                  </div>
                  <div className="text-right flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-primary">{challenge.participants}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance dos Desafios</CardTitle>
            <CardDescription>Taxa de conclusão por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: "Corrida", completion: "78%", participants: "1,456" },
                { category: "Caminhada", completion: "85%", participants: "2,234" },
                { category: "Ciclismo", completion: "65%", participants: "987" },
                { category: "Bem-estar", completion: "92%", participants: "1,678" },
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground">{stat.category}</p>
                    <p className="text-sm text-muted-foreground">{stat.participants} participantes</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary">{stat.completion}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Desafios</CardTitle>
          <CardDescription>
            Todos os desafios criados na plataforma
          </CardDescription>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar desafios..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Participantes</TableHead>
                <TableHead>Meta</TableHead>
                <TableHead>Recompensa</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Período</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {challenges.map((challenge) => (
                <TableRow key={challenge.id}>
                  <TableCell className="font-medium">{challenge.name}</TableCell>
                  <TableCell>
                    <Badge variant={challenge.type === "Individual" ? "default" : "secondary"}>
                      {challenge.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      challenge.status === "Ativo" ? "default" : 
                      challenge.status === "Programado" ? "secondary" : 
                      "outline"
                    }>
                      {challenge.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {challenge.participants}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3 text-muted-foreground" />
                      {challenge.goal}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-primary">{challenge.reward}</TableCell>
                  <TableCell>
                    <div className="w-16 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: challenge.completion }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground">{challenge.completion}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{challenge.startDate}</div>
                      <div className="text-muted-foreground">até {challenge.endDate}</div>
                    </div>
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
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Participantes</DropdownMenuItem>
                        <DropdownMenuItem>Relatório</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Finalizar Desafio
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