import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-white/20 backdrop-blur-sm bg-white/80 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 hover:bg-blue-50 rounded-lg transition-colors" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4 bg-blue-200"
        />
        <h1 className="text-base font-semibold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
          SIGESCON
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex hover:bg-blue-50 text-blue-700">
            <a
              href="http://suportedti.pge.pa.gov.br/"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              Suporte
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}