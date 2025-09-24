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
            {/* Sidebar com glass morphism */}
            <AppSidebar variant="inset" className="bg-sidebar/90 backdrop-blur-xl border-r border-white/20" />
            <SidebarInset>
                <SiteHeader />
                {/* Background com gradiente sutil */}
                <div className="flex flex-1 flex-col bg-background text-foreground relative overflow-hidden">
                    {/* Elementos decorativos de fundo */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                    </div>
                    
                    <div className="@container/main flex flex-1 flex-col gap-2 relative z-10">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 md:px-6">
                            <Outlet />
                        </div>
                        <footer className="w-full text-center p-6">
                            <div className="inline-flex items-center justify-center space-x-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-6 py-3 shadow-lg">
                                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Copyright © PGE-PA {new Date().getFullYear()} | DTIGD - Todos os direitos reservados
                                </p>
                            </div>
                        </footer>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}