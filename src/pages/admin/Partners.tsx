import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, MoreHorizontal, Handshake, Store, TrendingUp } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Partners() {
  const partners = [
    { 
      id: 1, 
      name: "Smart Fit", 
      category: "Academia", 
      status: "Ativo", 
      since: "15/03/2024",
      totalRedeems: 1247,
      suorValue: "500",
      discount: "20% desconto",
      locations: 45
    },
    { 
      id: 2, 
      name: "Mundo Verde", 
      category: "Alimentação", 
      status: "Ativo", 
      since: "22/01/2024",
      totalRedeems: 856,
      suorValue: "300",
      discount: "15% desconto",
      locations: 12
    },
    { 
      id: 3, 
      name: "Decathlon", 
      category: "Esportes", 
      status: "Ativo", 
      since: "10/05/2024",
      totalRedeems: 623,
      suorValue: "800",
      discount: "10% desconto",
      locations: 8
    },
    { 
      id: 4, 
      name: "Uber", 
      category: "Mobilidade", 
      status: "Pendente", 
      since: "05/12/2024",
      totalRedeems: 0,
      suorValue: "200",
      discount: "R$ 5 desconto",
      locations: 1
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Parceiros</h2>
          <p className="text-muted-foreground">Gerencie parcerias e recompensas</p>
        </div>
        <Button className="gap-2">
          <Handshake className="h-4 w-4" />
          Novo Parceiro
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Parceiros Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">47</div>
            <p className="text-xs text-muted-foreground">+3 este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total de Resgates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">15,678</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +25% este mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">SUOR Movimentado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">567,890</div>
            <p className="text-xs text-muted-foreground">Total em resgates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Satisfação Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">4.7</div>
            <p className="text-xs text-muted-foreground">Avaliação dos usuários</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Categorias Mais Populares</CardTitle>
            <CardDescription>Por número de resgates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: "Alimentação", redeems: "6,234", percentage: "40%" },
                { category: "Academia", redeems: "4,567", percentage: "29%" },
                { category: "Esportes", redeems: "2,890", percentage: "18%" },
                { category: "Mobilidade", redeems: "1,987", percentage: "13%" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground">{item.category}</p>
                    <p className="text-sm text-muted-foreground">{item.percentage} dos resgates</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary">{item.redeems}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parceiros Top Performance</CardTitle>
            <CardDescription>Maior volume de resgates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Smart Fit", redeems: "1,247", rating: "4.8" },
                { name: "Mundo Verde", redeems: "856", rating: "4.6" },
                { name: "Subway", redeems: "734", rating: "4.5" },
                { name: "Decathlon", redeems: "623", rating: "4.9" },
              ].map((partner, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground">{partner.name}</p>
                    <p className="text-sm text-muted-foreground">★ {partner.rating}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary">{partner.redeems} resgates</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Parceiros</CardTitle>
          <CardDescription>
            Todas as parcerias da plataforma
          </CardDescription>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar parceiros..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Desde</TableHead>
                <TableHead>Resgates</TableHead>
                <TableHead>Valor SUOR</TableHead>
                <TableHead>Benefício</TableHead>
                <TableHead>Locais</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell className="font-medium">{partner.name}</TableCell>
                  <TableCell>{partner.category}</TableCell>
                  <TableCell>
                    <Badge variant={
                      partner.status === "Ativo" ? "default" : 
                      partner.status === "Pendente" ? "secondary" : 
                      "outline"
                    }>
                      {partner.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{partner.since}</TableCell>
                  <TableCell>{partner.totalRedeems.toLocaleString()}</TableCell>
                  <TableCell className="font-medium text-primary">{partner.suorValue} SUOR</TableCell>
                  <TableCell>{partner.discount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Store className="h-3 w-3 text-muted-foreground" />
                      {partner.locations}
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
                        <DropdownMenuItem>Relatório</DropdownMenuItem>
                        <DropdownMenuItem>Contrato</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Suspender Parceria
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