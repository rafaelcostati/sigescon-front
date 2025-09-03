import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"



export default function Page() {
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
      
      <SidebarInset>        
        {/* Usamos a cor de fundo principal aqui */}
        <div className="flex flex-1 flex-col bg-background text-foreground">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                {/* O componente de gráfico usará as cores primárias e de accent que definimos */}
                <ChartAreaInteractive />
              </div>
             
              
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}