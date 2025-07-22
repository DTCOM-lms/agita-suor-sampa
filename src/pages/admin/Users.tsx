import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, MoreHorizontal, UserPlus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Users() {
  const users = [
    { 
      id: 1, 
      name: "Maria Silva", 
      email: "maria@email.com", 
      status: "Ativo", 
      suor: "1,250", 
      level: "Atleta", 
      joinDate: "15/01/2024",
      activities: 45
    },
    { 
      id: 2, 
      name: "João Santos", 
      email: "joao@email.com", 
      status: "Ativo", 
      suor: "2,180", 
      level: "Campeão", 
      joinDate: "03/12/2023",
      activities: 78
    },
    { 
      id: 3, 
      name: "Ana Costa", 
      email: "ana@email.com", 
      status: "Inativo", 
      suor: "890", 
      level: "Iniciante", 
      joinDate: "28/02/2024",
      activities: 12
    },
    { 
      id: 4, 
      name: "Pedro Lima", 
      email: "pedro@email.com", 
      status: "Ativo", 
      suor: "3,450", 
      level: "Lenda", 
      joinDate: "10/08/2023",
      activities: 156
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Usuários</h2>
          <p className="text-muted-foreground">Gerencie todos os usuários do sistema</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Adicionar Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Todos os usuários registrados na plataforma
          </CardDescription>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar usuários..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SUOR</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Atividades</TableHead>
                <TableHead>Data Cadastro</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "Ativo" ? "default" : "secondary"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-primary">{user.suor}</TableCell>
                  <TableCell>{user.level}</TableCell>
                  <TableCell>{user.activities}</TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Histórico SUOR</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Suspender Conta
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