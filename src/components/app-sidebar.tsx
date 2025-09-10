import * as React from "react"
import {
  IconDashboard,
  IconUsers,
  IconBuilding,
  IconFileText,
  IconFileCertificate, 
} from "@tabler/icons-react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"

const data = {
  user: {
    name: "Anderson Pontes",
    email: "anderson.pontes@pge.pa.gov.br",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Contratos",
      url: "/contratos",
      icon: IconFileText,
    },
    {
      title: "Modalidades",
      url: "/modalidades",
      icon: IconFileCertificate,
    },
    {
      title: "Contratados",
      url: "/contratado",
      icon: IconBuilding,
    },   
    {
      title: "Usuários",
      url: "/usuarios",
      icon: IconUsers,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/home">
                <ShieldCheck className="!size-5" />
                <span className="text-base font-semibold">SIGESCON</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* navegação principal */}
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
