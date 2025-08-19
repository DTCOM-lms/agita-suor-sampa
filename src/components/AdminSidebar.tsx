import { NavLink, useLocation } from "react-router-dom"
import {
  Users,
  MapPin,
  Route,
  Calendar,
  Activity,
  Coins,
  Trophy,
  Handshake,
  BarChart3,
  Settings
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: BarChart3 },
  { title: "Usuários", url: "/admin/users", icon: Users },
  { title: "Corridas", url: "/admin/races", icon: MapPin },
  { title: "Percursos", url: "/admin/routes", icon: Route },
  { title: "Eventos", url: "/admin/events", icon: Calendar },
  { title: "Atividades", url: "/admin/activities", icon: Activity },
  { title: "Controle SUOR", url: "/admin/suor", icon: Coins },
  { title: "Desafios", url: "/admin/challenges", icon: Trophy },
  { title: "Parceiros", url: "/admin/partners", icon: Handshake },
  { title: "Configurações", url: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === path
    }
    return currentPath.startsWith(path)
  }

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-accent hover:text-accent-foreground"

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="sidebar-label-text">
            Administração
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/admin"}
                      className={getNavCls}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}