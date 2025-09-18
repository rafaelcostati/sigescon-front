import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { Outlet } from 'react-router-dom'

export default function AppLayout() {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            {/* A sidebar geralmente tem um fundo de card */}
            <AppSidebar variant="inset" className="bg-card" />
            <SidebarInset>
                <SiteHeader />
                {/* Usamos a cor de fundo principal aqui */}
                <div className="flex flex-1 flex-col bg-background text-foreground">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <Outlet />
                        </div>
                        <footer className="w-full text-center p-4 text-sm text-muted-foreground">
                            Copyright &copy; PGE-PA {new Date().getFullYear()} | DTIGD - Todos os
                            direitos reservados.
                        </footer>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}