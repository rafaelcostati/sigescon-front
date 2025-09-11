import * as React from "react"
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
import { NavLink } from 'react-router-dom'

// Importe seus componentes de UI. Ajuste os caminhos se necessário.
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
import { useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react'

// ============================================================================
// Schema e Tipos para Dados da API
// ============================================================================
export const contratoSchema = z.object({
    id: z.number(),
    nr_contrato: z.string(),
    objeto: z.string(),
    // ALTERAÇÃO AQUI: Pré-processa os valores para convertê-los em número
    valor_anual: z.preprocess(
        (val) => (typeof val === "string" ? parseFloat(val) : val),
        z.number().nullable()
    ),
    valor_global: z.preprocess(
        (val) => (typeof val === "string" ? parseFloat(val) : val),
        z.number().nullable()
    ),
    base_legal: z.string().nullable(),
    data_inicio: z.string(),
    data_fim: z.string(),
    termos_contratuais: z.string().nullable(),
    contratado_id: z.number(),
    modalidade_id: z.number(),
    status_id: z.number(),
    gestor_id: z.number(),
    fiscal_id: z.number(),
    fiscal_substituto_id: z.number().nullable(),
    pae: z.string().nullable(),
    doe: z.string().nullable(),
    data_doe: z.string().nullable(),
    // ALTERAÇÃO AQUI: Pré-processa o documento para convertê-lo em string
    documento: z.preprocess(
        (val) => (typeof val === "number" ? String(val) : val),
        z.string().nullable()
    ),
    created_at: z.string(),
    updated_at: z.string(),
});
type Contrato = z.infer<typeof contratoSchema>

// --- NOVOS SCHEMAS E TIPOS PARA DETALHES ---
export const relatorioSchema = z.object({
    id: z.number(),
    descricao: z.string(),
    data_envio: z.string(),
});
export type Relatorio = z.infer<typeof relatorioSchema>;

export const pendenciaSchema = z.object({
    id: z.number(),
    descricao: z.string(),
    resolvida: z.boolean(),
});
export type Pendencia = z.infer<typeof pendenciaSchema>;

export const contratoDetalhadoSchema = contratoSchema.extend({
    relatorios: z.array(relatorioSchema).optional(),
    pendencias: z.array(pendenciaSchema).optional(),
});
export type ContratoDetalhado = z.infer<typeof contratoDetalhadoSchema>;


type ContratadoInfo = { id: number; nome: string; cnpj: string }
type StatusInfo = { id: number; nome: string }
type UsuarioInfo = { id: number; nome: string; perfil: string }

// ============================================================================
// Funções Auxiliares de Formatação
// ============================================================================
const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return "N/A";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("pt-BR", {
        timeZone: "UTC",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })
}

const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("pt-BR", { timeZone: "UTC" })
}

// ============================================================================
// Componente: ContratosFilters
// ============================================================================
function ContratosFilters({ table, statusList }: { table: Table<Contrato>; statusList: StatusInfo[] }) {
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
                    <div className="space-y-1.5">
                        <Label htmlFor="nrContrato">Número do Contrato</Label>
                        <Input
                            id="nrContrato"
                            placeholder="Ex: 001/2025"
                            value={nrContratoFilter}
                            onChange={(e) => table.getColumn("nr_contrato")?.setFilterValue(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="objeto">Objeto do Contrato</Label>
                        <Input
                            id="objeto"
                            placeholder="Pesquisar no objeto..."
                            value={objetoFilter}
                            onChange={(e) => table.getColumn("objeto")?.setFilterValue(e.target.value)}
                        />
                    </div>
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
                                {statusList.map((status) => (
                                    <SelectItem key={status.id} value={String(status.id)}>
                                        {status.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 self-end">
                        <Button type="button" className="w-full md:w-auto">
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

// ============================================================================
// Componente: DraggableContratoCard (VERSÃO CORRIGIDA)
// ============================================================================
function DraggableContratoCard({
    contrato,
    contratados, 
    statusList,  
    usuarios,
}: {
    contrato: any // Usando 'any' temporariamente para acomodar os novos campos da API
    contratados: ContratadoInfo[]
    statusList: StatusInfo[]
    usuarios: UsuarioInfo[]
}) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: contrato.id as UniqueIdentifier,
    });

    const navigate = useNavigate();

    
    const handleEditClick = () => {
        // 3. Navegue para a rota de edição, passando o ID do contrato
        navigate(`/contratos/editar/${contrato.id}`);
    };


    // ATENÇÃO: A lógica de ícone/cor de status foi simplificada pois não temos mais o ID.
    // O ideal seria a API enviar o ID para termos mais controle.
    const getStatusIcon = (statusName: string) => {
        // Você pode adicionar uma lógica simples baseada no nome se desejar
        if (statusName?.toLowerCase().includes('vencido')) {
            return <IconExclamationCircle className="text-gray-500" />;
        }
        if (statusName?.toLowerCase().includes('ativo')) {
            return <IconCircleCheckFilled className="text-green-500" />;
        }
        return <IconClockHour4 className="text-blue-500" />;
    };

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
                        <Button variant="ghost" className="text-muted-foreground h-8 w-8 p-0">
                            <IconDotsVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={handleEditClick} className="cursor-pointer">
                            <Pencil className="h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>Ver Documento</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex flex-grow flex-col gap-4 text-sm">
                <div className="flex flex-col gap-2">
                    <div>
                        <Label className="text-xs text-muted-foreground">Modalidade</Label>
                        
                        <Badge variant={"secondary"} className="gap-1.5 whitespace-nowrap">
                            {getStatusIcon(contrato.modalidade_nome)}
                            {contrato.modalidade_nome || "Não informado"}
                        </Badge>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">Contratado</Label>
                        {/* MUDANÇA AQUI: Exibindo o nome do contratado diretamente */}
                        <p className="font-medium">{contrato.contratado_nome || "Não informado"}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    
                    <div>
                        <Label className="text-xs text-muted-foreground">Vigência</Label>
                        <p className="whitespace-nowrap font-medium">
                            {formatDate(contrato.data_inicio)} a {formatDate(contrato.data_fim)}
                        </p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <ContratoDetailsViewer
                    contrato={contrato}
                    contratados={contratados}
                    statusList={statusList}
                    usuarios={usuarios}
                />
            </CardFooter>
        </Card>
    )
}

const columns: ColumnDef<Contrato>[] = [
    { accessorKey: "nr_contrato" },
    { accessorKey: "objeto" },
    { accessorKey: "status_id", filterFn: "equals" },
    { accessorKey: "contratado_id", filterFn: "equals" },
]

// ============================================================================
// Componente Principal: ContratosDataTable
// ============================================================================
export function ContratosDataTable() {
    const [contratos, setContratos] = React.useState<Contrato[]>([])
    const [contratados, setContratados] = React.useState<ContratadoInfo[]>([])
    const [statusList, setStatusList] = React.useState<StatusInfo[]>([])
    const [usuarios, setUsuarios] = React.useState<UsuarioInfo[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 9 })
    const sortableId = React.useId()
    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor), useSensor(KeyboardSensor))

    React.useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("Acesso não autorizado. Por favor, faça o login.");
                }

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                };

                const apiUrl = import.meta.env.VITE_API_URL;
                if (!apiUrl) {
                    throw new Error("VITE_API_URL não está configurada.");
                }

                const [
                    contratosRes,
                    contratadosRes,
                    statusRes,
                    usuariosRes,
                ] = await Promise.all([
                    fetch(`${apiUrl}/contratos`, { headers }),
                    fetch(`${apiUrl}/contratados`, { headers }),
                    fetch(`${apiUrl}/status`, { headers }),
                    fetch(`${apiUrl}/usuarios`, { headers }),
                ]);

                const responses = [contratosRes, contratadosRes, statusRes, usuariosRes];
                for (const res of responses) {
                    if (res.status === 401) {
                        throw new Error("Sua sessão expirou ou o token é inválido. Faça o login novamente.");
                    }
                    if (!res.ok) {
                        throw new Error(`Falha na requisição para ${res.url} com status ${res.status}`);
                    }
                }

                const contratosData = await contratosRes.json();
                const contratadosData = await contratadosRes.json();
                const statusData = await statusRes.json();
                const usuariosData = await usuariosRes.json();

                setContratos(contratosData);
                setContratados(contratadosData);
                setStatusList(statusData);
                setUsuarios(usuariosData);

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
                setError(errorMessage);
                toast.error("Erro ao carregar dados: " + errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const dataIds = React.useMemo<UniqueIdentifier[]>(
        () => contratos?.map(({ id }) => id as UniqueIdentifier) || [],
        [contratos]
    )

    const table = useReactTable({
        data: contratos,
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
        if (!active || !over || active.id === over.id) return

        setContratos((currentData) => {
            const oldIndex = currentData.findIndex((d) => String(d.id) === String(active.id))
            const newIndex = currentData.findIndex((d) => String(d.id) === String(over.id))
            if (oldIndex === -1 || newIndex === -1) return currentData
            return arrayMove(currentData, oldIndex, newIndex)
        })
        toast.success("Ordem dos contratos atualizada localmente.")
    }

    if (isLoading) {
        return <div className="p-8 text-center">Carregando dados dos contratos...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-600"><strong>Erro ao carregar:</strong> {error}</div>;
    }

    return (
        <div className="w-full flex flex-col justify-start gap-4 p-4">
            <ContratosFilters table={table} statusList={statusList} />

            <Tabs defaultValue="all" className="w-full mt-4">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="all">Todos os Contratos</TabsTrigger>
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
                                        <DraggableContratoCard
                                            key={row.original.id}
                                            contrato={row.original}
                                            contratados={contratados}
                                            statusList={statusList}
                                            usuarios={usuarios}
                                        />
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
                            {table.getFilteredRowModel().rows.length} de {contratos.length} contrato(s) exibido(s).
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
                                <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                                    <IconChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                                    <IconChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                                    <IconChevronRight className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
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

// ============================================================================
// Componente: DetailItem (Helper para Modal)
// ============================================================================
const DetailItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <div className="font-medium">{children}</div>
    </div>
)

// ============================================================================
// Componente: ContratoDetailsViewer (Modal) - VERSÃO CORRIGIDA
// ============================================================================
function ContratoDetailsViewer({
    contrato, // Usado para exibição inicial e para obter o ID
    contratados,
    statusList,
    usuarios,
}: {
    contrato: Contrato
    contratados: ContratadoInfo[]
    statusList: StatusInfo[]
    usuarios: UsuarioInfo[]
}) {
    // --- NOVOS ESTADOS ---
    const [isOpen, setIsOpen] = React.useState(false)
    const [detailedData, setDetailedData] = React.useState<ContratoDetalhado | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    // --- EFEITO PARA BUSCAR DADOS AO ABRIR O MODAL ---
    React.useEffect(() => {
        // Se o modal não estiver aberto, não faz nada
        if (!isOpen) {
            return
        }

        const fetchDetails = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const token = localStorage.getItem("token")
                if (!token) throw new Error("Usuário não autenticado.")

                const apiUrl = import.meta.env.VITE_API_URL
                if (!apiUrl) throw new Error("VITE_API_URL não configurada.")

                const response = await fetch(`${apiUrl}/contratos/${contrato.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (!response.ok) {
                    throw new Error(`Erro ao buscar detalhes: ${response.statusText}`)
                }

                const data = await response.json()
                const validatedData = contratoDetalhadoSchema.parse(data); // Valida os dados recebidos
                setDetailedData(validatedData)

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido."
                setError(errorMessage)
                toast.error("Falha ao carregar detalhes", { description: errorMessage })
            } finally {
                setIsLoading(false)
            }
        }

        fetchDetails()
    }, [isOpen, contrato.id]) // Dependências: re-executa se o modal abrir ou o ID do contrato mudar

    // --- DADOS PARA EXIBIÇÃO ---
    // Usa os dados detalhados se já carregaram, senão, usa os dados do card como fallback
    const dataToShow = detailedData || contrato;

    const status = statusList.find(s => s.id === dataToShow.status_id) || { nome: 'Desconhecido' };
    const contratado = contratados.find(c => c.id === dataToShow.contratado_id) || { nome: 'Não encontrado', cnpj: 'N/A' };
    const gestor = usuarios.find(u => u.id === dataToShow.gestor_id) || { nome: `ID: ${dataToShow.gestor_id}` };
    const fiscal = usuarios.find(u => u.id === dataToShow.fiscal_id) || { nome: `ID: ${dataToShow.fiscal_id}` };
    const fiscalSubstituto = usuarios.find(u => u.id === dataToShow.fiscal_substituto_id) || null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" className="w-full" onPointerDown={(e) => e.stopPropagation()}>
                    Ver Detalhes
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detalhes do Contrato: {dataToShow.nr_contrato}</DialogTitle>
                    <DialogDescription>{dataToShow.objeto}</DialogDescription>
                </DialogHeader>

                {isLoading && <div className="py-8 text-center">Carregando detalhes...</div>}
                {error && <div className="py-8 text-center text-red-600"><strong>Erro:</strong> {error}</div>}

                {!isLoading && !error && (
                    <div className="flex flex-col gap-6 py-4 text-sm">
                        {/* Seções de Detalhes (usando dataToShow) */}
                        <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-3">
                            <DetailItem label="Status">{status.nome}</DetailItem>
                            <DetailItem label="Valor Anual">{formatCurrency(dataToShow.valor_anual)}</DetailItem>
                            <DetailItem label="Valor Global">{formatCurrency(dataToShow.valor_global)}</DetailItem>
                            <DetailItem label="Vigência">{`${formatDate(dataToShow.data_inicio)} a ${formatDate(dataToShow.data_fim)}`}</DetailItem>
                            <DetailItem label="Contratado">{contratado.nome}</DetailItem>
                            <DetailItem label="CNPJ do Contratado">{contratado.cnpj}</DetailItem>
                        </div>
                        <Separator />
                        <h4 className="font-semibold text-foreground">Documentação e Processos</h4>
                        <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-3">
                            <DetailItem label="Processo (PAE)">{dataToShow.pae || 'N/A'}</DetailItem>
                            <DetailItem label="DOE">{dataToShow.doe || 'N/A'}</DetailItem>
                            <DetailItem label="Data DOE">{formatDate(dataToShow.data_doe)}</DetailItem>
                            <DetailItem label="Base Legal">{dataToShow.base_legal || 'N/A'}</DetailItem>
                        </div>
                        <Separator />
                        <h4 className="font-semibold text-foreground">Responsáveis</h4>
                        <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-3">
                            <DetailItem label="Gestor">{gestor.nome}</DetailItem>
                            <DetailItem label="Fiscal">{fiscal.nome}</DetailItem>
                            <DetailItem label="Fiscal Substituto">{fiscalSubstituto?.nome ?? "N/A"}</DetailItem>
                        </div>
                        <Separator />

                        {/* --- NOVA SEÇÃO: RELATÓRIOS --- */}
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Relatórios</h4>
                            {detailedData?.relatorios && detailedData.relatorios.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                    {detailedData.relatorios.map(rel => (
                                        <li key={rel.id}>{rel.descricao} - {formatDate(rel.data_envio)}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">Nenhum relatório associado.</p>
                            )}
                        </div>

                        {/* --- NOVA SEÇÃO: PENDÊNCIAS --- */}
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Pendências</h4>
                            {detailedData?.pendencias && detailedData.pendencias.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                    {detailedData.pendencias.map(pend => (
                                        <li key={pend.id} className={pend.resolvida ? 'line-through' : ''}>
                                            {pend.descricao}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">Nenhuma pendência encontrada.</p>
                            )}
                        </div>

                        <Separator />
                        <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-3">                            
                            <DetailItem label="Criado em">{formatDateTime(dataToShow.created_at)}</DetailItem>
                            <DetailItem label="Atualizado em">{formatDateTime(dataToShow.updated_at)}</DetailItem>
                        </div>
                    </div>
                )}

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