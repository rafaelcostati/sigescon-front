import * as React from "react"
import initialData from "@/pages/contratos/data.json"
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
    IconCircleCheckFilled,
    IconClockHour4,
    IconExclamationCircle,
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconDotsVertical,
    IconPlus,
    IconX,
    IconSearch,
} from "@tabler/icons-react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
    type VisibilityState,
    type Table,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NavLink } from 'react-router-dom'

// Schema, Tipos e Funções Auxiliares
export const contratoSchema = z.object({
    id: z.number(),
    nr_contrato: z.string(),
    objeto: z.string(),
    valor_anual: z.number(),
    valor_global: z.number(),
    base_legal: z.string(),
    data_inicio: z.string(),
    data_fim: z.string(),
    termos_contratuais: z.string(),
    contratado_id: z.number(),
    modalidade_id: z.number(),
    status_id: z.number(),
    gestor_id: z.number(),
    fiscal_id: z.number(),
    fiscal_substituto_id: z.number().nullable(),
    pae: z.string(),
    doe: z.string(),
    data_doe: z.string(),
    documento: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
})
type Contrato = z.infer<typeof contratoSchema>

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("pt-BR", {
        timeZone: "UTC",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })
}
const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("pt-BR", { timeZone: "UTC" })
}

const statusMap = {
    1: { text: "Ativo", icon: <IconCircleCheckFilled className="text-green-500" />, variant: "outline" },
    2: { text: "Encerrado", icon: <IconExclamationCircle className="text-gray-500" />, variant: "secondary" },
    3: { text: "Em Elaboração", icon: <IconClockHour4 className="text-blue-500" />, variant: "outline" },
    4: { text: "Pendente", icon: <IconClockHour4 className="text-blue-500" />, variant: "outline" },
} as const

const contratadoMap = {
    1: { name: "Tecnologia Soluções em TI", cnpj: "12.345.678/0001-90" },
    2: { name: "Global Distribuidora", cnpj: "98.765.432/0001-09" },
    3: { name: "Alfa Componentes Eletrônicos", cnpj: "11.222.333/0001-44" },
    4: { name: "Beta Serviços Ltda.", cnpj: "55.666.777/0001-55" },
} as const

// ============================================================================
// Filtros para Contratos
// ============================================================================
function ContratosFilters({ table }: { table: Table<Contrato> }) {
    const nrContratoFilter = (table.getColumn("nr_contrato")?.getFilterValue() as string) ?? ""
    const objetoFilter = (table.getColumn("objeto")?.getFilterValue() as string) ?? ""
    const statusFilter = (table.getColumn("status_id")?.getFilterValue() as string) ?? "all"

    const handleClearFilters = () => {
        table.resetColumnFilters()
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Filtros de Contratos</CardTitle>
                <CardDescription>Utilize os campos abaixo para refinar sua busca.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    {/* Número do Contrato */}
                    <div className="space-y-1.5">
                        <Label htmlFor="nrContrato">Número do Contrato</Label>
                        <Input
                            id="nrContrato"
                            placeholder="Ex: 001/2025"
                            value={nrContratoFilter}
                            onChange={(e) => table.getColumn("nr_contrato")?.setFilterValue(e.target.value)}
                        />
                    </div>

                    {/* Objeto */}
                    <div className="space-y-1.5">
                        <Label htmlFor="objeto">Objeto do Contrato</Label>
                        <Input
                            id="objeto"
                            placeholder="Pesquisar no objeto..."
                            value={objetoFilter}
                            onChange={(e) => table.getColumn("objeto")?.setFilterValue(e.target.value)}
                        />
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                        <Label>Status</Label>
                        <Select
                            value={statusFilter}
                            onValueChange={(value) =>
                                table.getColumn("status_id")?.setFilterValue(value === "all" ? null : value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Escolha um status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Status</SelectItem>
                                {Object.entries(statusMap).map(([id, { text }]) => (
                                    <SelectItem key={id} value={id}>
                                        {text}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Botões */}
                    <div className="flex flex-col md:flex-row gap-2 self-end">
                        <Button type="submit" className="w-full md:w-auto">
                            <IconSearch className="h-4 w-4 mr-2" /> Pesquisar
                        </Button>
                        <Button onClick={handleClearFilters} variant="outline" className="w-full md:w-auto">
                            <IconX className="h-4 w-4 mr-2" /> Limpar
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Draggable Card
function DraggableContratoCard({ contrato }: { contrato: Contrato }) {
    // convertemos o id para UniqueIdentifier explícito (número/string aceitáveis)
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: contrato.id as UniqueIdentifier,
    })

    const status = statusMap[contrato.status_id as keyof typeof statusMap] || statusMap[2]
    const contratado = contratadoMap[contrato.contratado_id as keyof typeof contratadoMap] || contratadoMap[2]

    return (
        <Card
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            data-dragging={isDragging}
            className="relative z-0 flex flex-col data-[dragging=true]:z-10 data-[dragging=true]:shadow-lg data-[dragging=true]:bg-accent"
        >
            <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex flex-col gap-1.5">
                    <CardTitle className="text-base">{contrato.nr_contrato}</CardTitle>
                    <CardDescription className="line-clamp-2">{contrato.objeto}</CardDescription>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {/* corrigi classes inválidas para tamanhos */}
                        <Button variant="ghost" className="text-muted-foreground h-8 w-8 p-0">
                            <IconDotsVertical className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem>Editar Contrato</DropdownMenuItem>
                        <DropdownMenuItem>Ver Documento</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>

            <CardContent className="flex flex-grow flex-col gap-4 text-sm">
                <div className="flex flex-col gap-2">
                    <div>
                        <Label className="text-xs text-muted-foreground">Status</Label>
                        <Badge variant={status.variant as any} className="gap-1.5 whitespace-nowrap">
                            {status.icon}
                            {status.text}
                        </Badge>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">Contratado</Label>
                        <p className="font-medium">{contratado.name}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="text-xs text-muted-foreground">Valor Anual</Label>
                        <p className="font-medium">{formatCurrency(contrato.valor_anual)}</p>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">Vigência</Label>
                        <p className="whitespace-nowrap font-medium">
                            {formatDate(contrato.data_inicio)} a {formatDate(contrato.data_fim)}
                        </p>
                    </div>
                </div>
            </CardContent>

            <CardFooter>
                <ContratoDetailsViewer contrato={contrato} />
            </CardFooter>
        </Card>
    )
}

// Colunas
const columns: ColumnDef<Contrato>[] = [
    { accessorKey: "nr_contrato" },
    { accessorKey: "objeto" },
    { accessorKey: "status_id", filterFn: "equals" },
    { accessorKey: "contratado_id", filterFn: "equals" },
]

export function ContratosDataTable() {
    // tipagem explícita do estado dos dados (evita 'any')
    const [data, setData] = React.useState<Contrato[]>(() => initialData as Contrato[])
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 9 })
    const sortableId = React.useId()
    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor), useSensor(KeyboardSensor))

    const dataIds = React.useMemo<UniqueIdentifier[]>(
        () => data?.map(({ id }) => id as UniqueIdentifier) || [],
        [data]
    )

    const table = useReactTable({
        data,
        columns,
        state: { sorting, columnVisibility, rowSelection, columnFilters, pagination },
        onColumnFiltersChange: setColumnFilters,
        getRowId: (row) => row.id.toString(),
        onPaginationChange: setPagination,
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!active || !over) return
        if (active.id === over.id) return

        // --- IMPORTANTE: usar currentData do setState para calcular índices,
        // evitando índice baseado em closure com data antiga
        setData((currentData) => {
            const oldIndex = currentData.findIndex((d) => String(d.id) === String(active.id))
            const newIndex = currentData.findIndex((d) => String(d.id) === String(over.id))
            if (oldIndex === -1 || newIndex === -1) return currentData
            const next = arrayMove(currentData, oldIndex, newIndex)
            return next
        })
        toast.success("Ordem dos contratos atualizada.")
    }

    return (
        // corrigi: faltava 'flex' para que flex-col funcione
        <div className="w-full flex flex-col justify-start gap-4 p-4">
            <ContratosFilters table={table} />

            <Tabs
                defaultValue="all"
                className="w-full mt-4"
                onValueChange={(value) => {
                    const statusIdToFilter = {
                        Ativo: "1",
                        Encerrado: "2",
                        all: null,
                    }[value] ?? null
                    table.getColumn("status_id")?.setFilterValue(statusIdToFilter)
                }}
            >
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="all">Todos os Contratos</TabsTrigger>
                        <TabsTrigger value="Ativo">Ativos</TabsTrigger>
                        <TabsTrigger value="Encerrado">Encerrados</TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-2">
                        <NavLink to="/novocontrato" style={{ textDecoration: 'none' }}>
                            <Button variant="default" size="sm" className="gap-2">
                                <IconPlus className="h-4 w-4" />
                                <span className="hidden lg:inline">Novo Contrato</span>
                            </Button>
                        </NavLink>

                    </div>
                </div>

                <TabsContent value="all" className="relative flex flex-col gap-4 mt-4">
                    <DndContext
                        collisionDetection={closestCenter}
                        modifiers={[restrictToVerticalAxis]}
                        onDragEnd={handleDragEnd}
                        sensors={sensors}
                        id={sortableId}
                    >
                        <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                            {table.getRowModel().rows?.length ? (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {table.getRowModel().rows.map((row) => (
                                        // use uma chave estável: row.original.id
                                        <DraggableContratoCard key={row.original.id} contrato={row.original} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-60 items-center justify-center rounded-lg border border-dashed">
                                    <div className="text-center">
                                        <h3 className="mt-4 text-lg font-semibold text-slate-800">Nenhum resultado encontrado</h3>
                                        <p className="mt-1 text-sm text-slate-500">Tente ajustar os filtros para encontrar o que procura.</p>
                                    </div>
                                </div>
                            )}
                        </SortableContext>
                    </DndContext>

                    <div className="flex items-center justify-between">
                        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                            {table.getFilteredRowModel().rows.length} de {initialData.length} contrato(s) exibido(s).
                        </div>

                        <div className="flex w-full items-center gap-6 lg:w-fit">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">Itens por página</p>
                                <Select
                                    value={`${table.getState().pagination.pageSize}`}
                                    onValueChange={(value) => {
                                        table.setPageSize(Number(value))
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-[70px]">
                                        <SelectValue placeholder={table.getState().pagination.pageSize} />
                                    </SelectTrigger>
                                    <SelectContent side="top">
                                        {[9, 12, 24, 48].map((pageSize) => (
                                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                                {pageSize}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                            </div>

                            <div className="ml-auto flex items-center gap-2 lg:ml-0">
                                <Button
                                    variant="outline"
                                    className="hidden h-8 w-8 p-0 lg:flex"
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <IconChevronsLeft className="h-4 w-4" />
                                </Button>

                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <IconChevronLeft className="h-4 w-4" />
                                </Button>

                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    <IconChevronRight className="h-4 w-4" />
                                </Button>

                                <Button
                                    variant="outline"
                                    className="hidden h-8 w-8 p-0 lg:flex"
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                >
                                    <IconChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

// DetailItem
const DetailItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <div className="font-medium">{children}</div>
    </div>
)

// ContratoDetailsViewer
function ContratoDetailsViewer({ contrato }: { contrato: Contrato }) {
    const status = statusMap[contrato.status_id as keyof typeof statusMap] || statusMap[2]
    const contratado = contratadoMap[contrato.contratado_id as keyof typeof contratadoMap] || contratadoMap[2]

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary" className="w-full" onPointerDown={(e) => e.stopPropagation()}>
                    Ver Detalhes
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detalhes do Contrato: {contrato.nr_contrato}</DialogTitle>
                    <DialogDescription>{contrato.objeto}</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4 text-sm">
                    <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-3">
                        <DetailItem label="Status">
                            <Badge variant={status.variant as any} className="gap-1.5 whitespace-nowrap">
                                {status.icon} {status.text}
                            </Badge>
                        </DetailItem>
                        <DetailItem label="Valor Anual">{formatCurrency(contrato.valor_anual)}</DetailItem>
                        <DetailItem label="Valor Global">{formatCurrency(contrato.valor_global)}</DetailItem>
                        <DetailItem label="Vigência">{`${formatDate(contrato.data_inicio)} a ${formatDate(contrato.data_fim)}`}</DetailItem>
                        <DetailItem label="Contratado">{`${contratado.name}`}</DetailItem>
                        <DetailItem label="CNPJ do Contratado">{contratado.cnpj}</DetailItem>
                    </div>

                    <Separator />

                    <h4 className="font-semibold text-foreground">Documentação e Processos</h4>
                    <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-3">
                        <DetailItem label="Processo (PAE)">{contrato.pae}</DetailItem>
                        <DetailItem label="DOE">{contrato.doe}</DetailItem>
                        <DetailItem label="Data DOE">{formatDate(contrato.data_doe)}</DetailItem>
                        <DetailItem label="Documento">{contrato.documento}</DetailItem>
                        <DetailItem label="Base Legal">{contrato.base_legal}</DetailItem>
                    </div>

                    <Separator />

                    <h4 className="font-semibold text-foreground">Responsáveis</h4>
                    <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-3">
                        <DetailItem label="ID Gestor">{contrato.gestor_id}</DetailItem>
                        <DetailItem label="ID Fiscal">{contrato.fiscal_id}</DetailItem>
                        <DetailItem label="ID Fiscal Substituto">{contrato.fiscal_substituto_id ?? "N/A"}</DetailItem>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 gap-y-6">
                        <DetailItem label="Termos Contratuais">
                            <p className="text-muted-foreground">{contrato.termos_contratuais}</p>
                        </DetailItem>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-3">
                        <DetailItem label="ID">{contrato.id}</DetailItem>
                        <DetailItem label="Criado em">{formatDateTime(contrato.created_at)}</DetailItem>
                        <DetailItem label="Atualizado em">{formatDateTime(contrato.updated_at)}</DetailItem>
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="default">
                            Fechar
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
