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
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconDotsVertical,
    IconLayoutColumns,
    IconPlus,
} from "@tabler/icons-react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type Row,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

// ============================================================================
// 1. ATUALIZAÇÃO DO SCHEMA
// O schema agora reflete a estrutura de um contrato do arquivo JSON.
// ============================================================================
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

// Função auxiliar para formatar moeda
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value)
}

// Função auxiliar para formatar data
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", { timeZone: "UTC" })
}

// Mapeamento de status para exibição
const statusMap = {
    1: {
        text: "Ativo",
        icon: <IconCircleCheckFilled className="text-green-500" />,
        variant: "outline",
    },
    2: {
        text: "Encerrado",
        icon: <IconExclamationCircle className="text-gray-500" />,
        variant: "secondary",
    },
    3: {
        text: "Em Elaboração",
        icon: <IconClockHour4 className="text-blue-500" />,
        variant: "outline",
    },
    4: {
        text: "Pendente",
        icon: <IconClockHour4 className="text-blue-500" />,
        variant: "outline",
    },
} as const

const contratadoMap = {
    1: {
        name: "Tecnologia Soluções em TI",
        cnpj: "12.345.678/0001-90",
        icon: <IconCircleCheckFilled className="text-green-500" />,
        variant: "outline",
    },
    2: {
        name: "Global Distribuidora",
        cnpj: "98.765.432/0001-09",
        icon: <IconExclamationCircle className="text-gray-500" />,
        variant: "secondary",
    },
    3: {
        name: "Alfa Componentes Eletrônicos",
        cnpj: "11.222.333/0001-44",
        icon: <IconClockHour4 className="text-blue-500" />,
        variant: "outline",
    },
    4: {
        name: "Beta Serviços Ltda.",
        cnpj: "55.666.777/0001-55",
        icon: <IconClockHour4 className="text-blue-500" />,
        variant: "outline",
    },
} as const


const columns: ColumnDef<Contrato>[] = [

    // Coluna "Nº do Contrato"

    {
        accessorKey: "nr_contrato",
        header: "Nº do Contrato",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                        {row.original.nr_contrato}
                    </span>
                </div>
            )
        },
        enableHiding: false,
    },

    // Coluna 'Objeto' (principal e clicável)
    {
        accessorKey: "objeto",
        header: "Objeto do Contrato",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col">
                    <TableCellViewer item={row.original} />
                </div>
            )
        },
        enableHiding: false,
    },
    // Coluna 'Contratado' (principal e clicável)
    {
        accessorKey: "contratado",
        header: "Contratado",
        cell: ({ row }) => {
            const contratado =
                contratadoMap[row.original.contratado_id as keyof typeof contratadoMap] ||
                contratadoMap[2]
            return (
                <Badge variant={contratado.variant} className="gap-1.5 whitespace-nowrap">
                    {contratado.icon}
                    {contratado.name} - {contratado.cnpj}
                </Badge>
            )
        },
        size: 120,
    },
    // Coluna 'Status'
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status =
                statusMap[row.original.status_id as keyof typeof statusMap] ||
                statusMap[2]
            return (
                <Badge variant={status.variant} className="gap-1.5 whitespace-nowrap">
                    {status.icon}
                    {status.text}
                </Badge>
            )
        },
        size: 120,
    },
    // Coluna 'Valor Anual'
    {
        accessorKey: "valor",
        header: () => <div className="text-right">Valor Anual</div>,
        cell: ({ row }) => (
            <div className="text-right font-medium">
                {formatCurrency(row.original.valor_anual)}
            </div>
        ),
        size: 150,
    },
    // Coluna 'Vigência'
    {
        id: "vigencia",
        header: "Vigência",
        cell: ({ row }) => (
            <div className="whitespace-nowrap">
                {formatDate(row.original.data_inicio)} a{" "}
                {formatDate(row.original.data_fim)}
            </div>
        ),
        size: 220,
    },
    // Coluna de Ações
    {
        id: "actions",
        cell: () => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="data-[state=open]:bg-muted text-muted-foreground flex size-8 p-0"
                    >
                        <IconDotsVertical className="size-4" />
                        <span className="sr-only">Abrir menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem>Editar Contrato</DropdownMenuItem>
                    <DropdownMenuItem>Ver Documento</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">Excluir</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
        size: 40,
    },
]

// Componente DraggableRow atualizado para usar o tipo 'Contrato'
function DraggableRow({ row }: { row: Row<Contrato> }) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.id,
    })

    return (
        <TableRow
            data-state={row.getIsSelected() && "selected"}
            data-dragging={isDragging}
            ref={setNodeRef}
            className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:bg-accent"
            style={{
                transform: CSS.Transform.toString(transform),
                transition: transition,
            }}
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    )
}

// Componente principal DataTable atualizado para usar o tipo 'Contrato'
export function ContratosDataTable() {
    const [data, setData] = React.useState(() => initialData)
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const sortableId = React.useId()
    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    )

    const dataIds = React.useMemo<UniqueIdentifier[]>(
        () => data?.map(({ id }) => id) || [],
        [data]
    )

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row) => row.id.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (active && over && active.id !== over.id) {
            setData((currentData) => {
                const oldIndex = dataIds.indexOf(active.id)
                const newIndex = dataIds.indexOf(over.id)
                return arrayMove(currentData, oldIndex, newIndex)
            })
            toast.success("Ordem dos contratos atualizada.")
        }
    }

    return (
        <Tabs
            defaultValue="all"
            className="w-full flex-col justify-start gap-4 p-4"
        >
            <div className="flex items-center justify-between">
                <TabsList>
                    <TabsTrigger value="all">Todos os Contratos</TabsTrigger>
                    <TabsTrigger value="Ativo">Ativos</TabsTrigger>
                    <TabsTrigger value="finished">Encerrados</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <IconLayoutColumns className="size-4" />
                                <span className="hidden lg:inline">Colunas</span>
                                <IconChevronDown className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56">
                            {table
                                .getAllColumns()
                                .filter(
                                    (column) =>
                                        typeof column.accessorFn !== "undefined" &&
                                        column.getCanHide()
                                )
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}


                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="default" size="sm" className="gap-2">
                        <IconPlus className="size-4" />
                        <span className="hidden lg:inline">Novo Contrato</span>
                    </Button>
                </div>
            </div>
            <TabsContent value="all" className="relative flex flex-col gap-4">
                <div className="overflow-hidden rounded-lg border">
                    <DndContext
                        collisionDetection={closestCenter}
                        modifiers={[restrictToVerticalAxis]}
                        onDragEnd={handleDragEnd}
                        sensors={sensors}
                        id={sortableId}
                    >
                        <Table>
                            <TableHeader className="bg-muted/50 sticky top-0 z-10">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id} colSpan={header.colSpan}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            )
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    <SortableContext
                                        items={dataIds}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {table.getRowModel().rows.map((row) => (
                                            <DraggableRow key={row.id} row={row} />
                                        ))}
                                    </SortableContext>
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            Nenhum resultado encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </DndContext>
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                        {table.getFilteredSelectedRowModel().rows.length} de{" "}
                        {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
                    </div>
                    <div className="flex w-full items-center gap-6 lg:w-fit">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">Linhas por página</p>
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => {
                                    table.setPageSize(Number(value))
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue
                                        placeholder={table.getState().pagination.pageSize}
                                    />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                            Página {table.getState().pagination.pageIndex + 1} de{" "}
                            {table.getPageCount()}
                        </div>
                        <div className="ml-auto flex items-center gap-2 lg:ml-0">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Primeira página</span>
                                <IconChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Página anterior</span>
                                <IconChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Próxima página</span>
                                <IconChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Última página</span>
                                <IconChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </TabsContent>
            {/* Outras Tabs podem ser implementadas aqui */}
        </Tabs>
    )
}

// ============================================================================
// 3. AJUSTE DO DRAWER DE DETALHES
// O drawer agora exibe os detalhes de um contrato.
// ============================================================================
function TableCellViewer({ item }: { item: Contrato }) {
    const isMobile = useIsMobile()

    const status =
        statusMap[item.status_id as keyof typeof statusMap] || statusMap[2]

    return (
        <Drawer direction={isMobile ? "bottom" : "right"}>
            <DrawerTrigger asChild>
                <Button
                    variant="link"
                    className="text-foreground h-auto p-0 text-left font-semibold"
                >
                    {item.objeto}
                </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-screen">
                <DrawerHeader className="text-left">
                    <DrawerTitle className="text-lg">{item.nr_contrato}</DrawerTitle>
                    <DrawerDescription>{item.objeto}</DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                    <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-3">
                        <div>
                            <Label className="text-xs text-muted-foreground">Status</Label>
                            <div className="flex items-center gap-2 font-medium">
                                {status.icon} {status.text}
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">
                                Valor Global
                            </Label>
                            <p className="font-medium">{formatCurrency(item.valor_global)}</p>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Vigência</Label>
                            <p className="font-medium">
                                {formatDate(item.data_inicio)} a {formatDate(item.data_fim)}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 rounded-lg border p-4">
                        <h3 className="font-semibold">Detalhes do Contrato</h3>
                        <div>
                            <Label className="text-xs text-muted-foreground">
                                Base Legal
                            </Label>
                            <p>{item.base_legal}</p>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">
                                Processo (PAE)
                            </Label>
                            <p>{item.pae}</p>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">
                                Termos Contratuais
                            </Label>
                            <p className="text-muted-foreground">
                                {item.termos_contratuais}
                            </p>
                        </div>
                    </div>
                </div>
                <DrawerFooter>
                    <Button>Salvar Alterações</Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Fechar</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}