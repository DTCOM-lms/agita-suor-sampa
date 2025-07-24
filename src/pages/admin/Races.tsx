import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, MoreHorizontal, MapPin } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Races() {
  const races = [
    { 
      id: 1, 
      name: "Corrida Ibirapuera", 
      distance: "5km", 
      status: "Ativa", 
      participants: 234, 
      startDate: "25/12/2024",
      location: "Parque Ibirapuera",
      prize: "500 SUOR"
    },
    { 
      id: 2, 
      name: "Maratona SP", 
      distance: "21km", 
      status: "Programada", 
      participants: 89, 
      startDate: "15/01/2025",
      location: "Avenida Paulista",
      prize: "2000 SUOR"
    },
    { 
      id: 3, 
      name: "Corrida Noturna", 
      distance: "10km", 
      status: "Finalizada", 
      participants: 156, 
      startDate: "20/11/2024",
      location: "Vila Madalena",
      prize: "800 SUOR"
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Corridas</h2>
          <p className="text-muted-foreground">Gerencie corridas e eventos competitivos</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Corrida
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Corridas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">8</div>
            <p className="text-xs text-muted-foreground">+2 desde a semana passada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Participantes Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">1,247</div>
            <p className="text-xs text-muted-foreground">Inscritos em corridas ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">SUOR Distribuído</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">45,680</div>
            <p className="text-xs text-muted-foreground">Total em premiações</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Corridas</CardTitle>
          <CardDescription>
            Todas as corridas organizadas na plataforma
          </CardDescription>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar corridas..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Distância</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Participantes</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Premiação</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {races.map((race) => (
                <TableRow key={race.id}>
                  <TableCell className="font-medium">{race.name}</TableCell>
                  <TableCell>{race.distance}</TableCell>
                  <TableCell>
                    <Badge variant={
                      race.status === "Ativa" ? "default" : 
                      race.status === "Programada" ? "secondary" : 
                      "outline"
                    }>
                      {race.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{race.participants}</TableCell>
                  <TableCell>{race.startDate}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {race.location}
                  </TableCell>
                  <TableCell className="font-medium text-primary">{race.prize}</TableCell>
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
                        <DropdownMenuItem>Resultados</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Cancelar Corrida
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