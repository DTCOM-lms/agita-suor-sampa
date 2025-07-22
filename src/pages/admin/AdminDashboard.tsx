import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MapPin, Calendar, Coins, Trophy, TrendingUp } from "lucide-react"

export default function AdminDashboard() {
  const stats = [
    { title: "Usuários Ativos", value: "12,847", change: "+12%", icon: Users },
    { title: "Atividades Hoje", value: "2,341", change: "+8%", icon: MapPin },
    { title: "Eventos Ativos", value: "23", change: "+2", icon: Calendar },
    { title: "SUOR Circulante", value: "847,320", change: "+15%", icon: Coins },
    { title: "Desafios Concluídos", value: "1,256", change: "+23%", icon: Trophy },
    { title: "Taxa de Retenção", value: "68%", change: "+5%", icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral do sistema Agita</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-primary">
                {stat.change} em relação ao mês passado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas atividades registradas no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { user: "Maria Silva", activity: "Corrida", duration: "35 min", suor: "150" },
                { user: "João Santos", activity: "Ciclismo", duration: "1h 15min", suor: "280" },
                { user: "Ana Costa", activity: "Caminhada", duration: "45 min", suor: "120" },
                { user: "Pedro Lima", activity: "Natação", duration: "30 min", suor: "200" },
              ].map((activity, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">{activity.activity} • {activity.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary">+{activity.suor} SUOR</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas do Sistema</CardTitle>
            <CardDescription>Notificações importantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-foreground">Servidor de GPS instável</p>
                  <p className="text-sm text-muted-foreground">Alguns usuários relataram problemas</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-foreground">Evento "Corrida SP" em 2 dias</p>
                  <p className="text-sm text-muted-foreground">458 inscritos confirmados</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-foreground">Novo parceiro adicionado</p>
                  <p className="text-sm text-muted-foreground">Academia Smart Fit</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}