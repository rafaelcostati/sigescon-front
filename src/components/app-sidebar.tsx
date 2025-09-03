import * as React from "react"
import {
  IconDashboard,
  IconUsers,
  IconBuilding,
  IconFileText,
  IconGavel,
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
import { ShieldCheck } from 'lucide-react'

const data = {
  user: {
    name: "Anderson Pontes",
    email: "anderson.pontes@pge.pa.gov.br",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Contratos",
      url: "#",
      icon: IconFileText,
    },
    {
      title: "Fornecedores",
      url: "#",
      icon: IconBuilding,
    },
    {
      title: "Processos",
      url: "#",
      icon: IconGavel,
    },
    {
      title: "Usuários",
      url: "#",
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
              <a href="#">
                <ShieldCheck className="!size-5" />                
                <span className="text-base font-semibold">SIGESCON</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />     
     </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
