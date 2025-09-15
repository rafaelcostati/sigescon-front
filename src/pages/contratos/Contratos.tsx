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
    IconDownload,
} from "@tabler/icons-react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    getCoreRowModel,
    type SortingState,
    useReactTable,
    type Table,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { z } from "zod"
import { NavLink, useNavigate } from 'react-router-dom'
import { jwtDecode } from "jwt-decode"; 

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
import { Pencil, PlusCircle, X } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea" // **NOVA IMPORTAÇÃO** para a descrição

// ============================================================================
// Schema e Tipos para Dados da API
// ============================================================================
export const contratoSchema = z.object({
    id: z.number(),
    nr_contrato: z.string(),
    objeto: z.string(),
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
    documento: z.preprocess(
        (val) => (typeof val === "number" ? String(val) : val),
        z.string().nullable()
    ),
    created_at: z.string(),
    updated_at: z.string(),
});
type ContratoFromApi = z.infer<typeof contratoSchema>

type Contrato = ContratoFromApi & {
    modalidade_nome?: string;
    contratado_nome?: string;
    status_nome?: string;
};

export const relatorioSchema = z.object({
    id: z.number(),
    descricao: z.string(),
    data_envio: z.string(),
});
export type Relatorio = z.infer<typeof relatorioSchema>;

// **SCHEMA ATUALIZADO para corresponder à API**
export const pendenciaSchema = z.object({
    id: z.number(),
    contrato_id: z.number(),
    descricao: z.string(),
    data_prazo: z.string(),
    status_pendencia_id: z.number(),
    criado_por_usuario_id: z.number(),
    status_nome: z.string().optional(), // opcional, vem do GET
    criado_por_nome: z.string().optional(), // opcional, vem do GET
});
export type Pendencia = z.infer<typeof pendenciaSchema>;


export const arquivoSchema = z.object({
    id: z.number(),
    nome_arquivo: z.string(),
    data_upload: z.string().optional(),
});
export type Arquivo = z.infer<typeof arquivoSchema>;

export const contratoDetalhadoSchema = contratoSchema.extend({
    relatorios: z.array(relatorioSchema).optional(),
    pendencias: z.array(z.any()).optional(), // Usando z.any() temporariamente
});
export type ContratoDetalhado = z.infer<typeof contratoDetalhadoSchema>;

type ContratadoInfo = { id: number; nome: string; cnpj: string; cpf: string }
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

const formatCnpj = (cnpj: string | null | undefined) => {
    if (!cnpj) return "N/A";
    const digitsOnly = cnpj.replace(/\D/g, "");

    if (digitsOnly.length !== 14) {
        return cnpj;
    }

    return digitsOnly.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
    );
};

const formatCpf = (cpf: string | null | undefined) => {
    if (!cpf) return "N/A";
    const digitsOnly = cpf.replace(/\D/g, "");

    if (digitsOnly.length !== 11) {
        return cpf;
    }

    return digitsOnly.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

// **NOVA FUNÇÃO AUXILIAR** para obter ID do usuário do token
const getCurrentUserId = (): number | null => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const decoded: { sub: number } = jwtDecode(token); // 'sub' é o padrão para ID de usuário em JWT
        return decoded.sub;
    } catch (error) {
        console.error("Failed to decode token:", error);
        toast.error("Sessão inválida ou expirada. Faça login novamente.");
        return null;
    }
};


// ============================================================================
// Componente: ContratosFilters (SEM ALTERAÇÕES)
// ============================================================================
function ContratosFilters({
    table,
    statusList,
    usuarios,
}: {
    table: Table<Contrato>;
    statusList: StatusInfo[];
    usuarios: UsuarioInfo[];
}) {
    // Estados locais para controlar os inputs antes de aplicar o filtro
    const [objeto, setObjeto] = React.useState((table.getColumn('objeto')?.getFilterValue() as string) ?? '');
    const [nrContrato, setNrContrato] = React.useState((table.getColumn('nr_contrato')?.getFilterValue() as string) ?? '');
    const [pae, setPae] = React.useState((table.getColumn('pae')?.getFilterValue() as string) ?? '');
    const [ano, setAno] = React.useState((table.getColumn('ano')?.getFilterValue() as string) ?? '');
    // O valor inicial '' faz o placeholder ser exibido
    const [statusId, setStatusId] = React.useState((table.getColumn('status_id')?.getFilterValue() as string) ?? '');
    const [gestorId, setGestorId] = React.useState((table.getColumn('gestor_id')?.getFilterValue() as string) ?? '');
    const [fiscalId, setFiscalId] = React.useState((table.getColumn('fiscal_id')?.getFilterValue() as string) ?? '');

    const handleApplyFilters = (e?: React.FormEvent) => {
        // Previne o recarregamento da página se o evento vier de um formulário
        if (e) {
            e.preventDefault();
        }

        // Trata 'all' ou '' como ausência de filtro
        table.getColumn('objeto')?.setFilterValue(objeto || null);
        table.getColumn('nr_contrato')?.setFilterValue(nrContrato || null);
        table.getColumn('pae')?.setFilterValue(pae || null);
        table.getColumn('ano')?.setFilterValue(ano || null);
        table.getColumn('status_id')?.setFilterValue(statusId === 'all' ? null : statusId || null);
        table.getColumn('gestor_id')?.setFilterValue(gestorId === 'all' ? null : gestorId || null);
        table.getColumn('fiscal_id')?.setFilterValue(fiscalId === 'all' ? null : fiscalId || null);
    };

    const handleClearFilters = () => {
        setObjeto('');
        setNrContrato('');
        setPae('');
        setAno('');
        setStatusId(''); // Resetar para '' exibe o placeholder
        setGestorId('');
        setFiscalId('');
        table.resetColumnFilters();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Filtros de Contratos</CardTitle>
                <CardDescription>Utilize os campos abaixo para refinar sua busca.</CardDescription>
            </CardHeader>
            <form onSubmit={handleApplyFilters} className='p-4'>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    {/* Filtro: Número do Contrato */}
                    <div className="space-y-1.5">
                        <Label htmlFor="nrContrato">Número do Contrato</Label>
                        <Input id="nrContrato" placeholder="Ex: 99/2025" value={nrContrato} onChange={(e) => setNrContrato(e.target.value)} />
                    </div>
                    {/* Filtro: Objeto */}
                    <div className="space-y-1.5">
                        <Label htmlFor="objeto">Objeto do Contrato</Label>
                        <Input id="objeto" placeholder="Pesquisar no objeto..." value={objeto} onChange={(e) => setObjeto(e.target.value)} />
                    </div>
                    
                    {/* Filtro: PAe */}
                    <div className="space-y-1.5">
                        <Label htmlFor="pae">Nº (PAE)</Label>
                        <Input id="pae" placeholder="Ex: 2025/123456" value={pae} onChange={(e) => setPae(e.target.value)} />
                    </div>
                    {/* Filtro: Ano */}
                    <div className="space-y-1.5">
                        <Label htmlFor="ano">Ano Início</Label>
                        <Input id="ano" type="number" placeholder="Ex: 2024" value={ano} onChange={(e) => setAno(e.target.value)} />
                    </div>
                    {/* Filtro: Status */}
                    <div className="space-y-1.5">
                        <Label>Status</Label>
                        <Select value={statusId} onValueChange={setStatusId}>
                            <SelectTrigger><SelectValue placeholder="Escolha um status" /></SelectTrigger>
                            <SelectContent>
                                {/* CORREÇÃO APLICADA AQUI */}
                                <SelectItem value="all">Todos os Status</SelectItem>
                                {statusList.map((status) => (
                                    <SelectItem key={status.id} value={String(status.id)}>{status.nome}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Filtro: Gestor */}
                    <div className="space-y-1.5">
                        <Label>Gestor</Label>
                        <Select value={gestorId} onValueChange={setGestorId}>
                            <SelectTrigger><SelectValue placeholder="Escolha um gestor" /></SelectTrigger>
                            <SelectContent>
                                {/* CORREÇÃO APLICADA AQUI */}
                                <SelectItem value="all">Todos os Gestores</SelectItem>
                                {usuarios.map((user) => (
                                    <SelectItem key={user.id} value={String(user.id)}>{user.nome}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Filtro: Fiscal */}
                    <div className="space-y-1.5">
                        <Label>Fiscal</Label>
                        <Select value={fiscalId} onValueChange={setFiscalId}>
                            <SelectTrigger><SelectValue placeholder="Escolha um fiscal" /></SelectTrigger>
                            <SelectContent>
                                {/* CORREÇÃO APLICADA AQUI */}
                                <SelectItem value="all">Todos os Fiscais</SelectItem>
                                {usuarios.map((user) => (
                                    <SelectItem key={user.id} value={String(user.id)}>{user.nome}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Botões */}
                    <div className="flex flex-col md:flex-row gap-2 self-end">
                        <Button type="submit" className="w-full md:w-auto">
                            <IconSearch className="h-4 w-4 mr-2" /> Pesquisar
                        </Button>
                        <Button type="button" onClick={handleClearFilters} variant="outline" className="w-full md:w-auto">
                            <IconX className="h-4 w-4 mr-2" /> Limpar
                        </Button>
                    </div>
                </div>
            </form>
        </Card>
    )
}

// ============================================================================
// **NOVO COMPONENTE**: CriarPendenciaDialog
// ============================================================================
function CriarPendenciaDialog({
    contratoId,
    contratoNumero,
    onPendenciaCriada,
    children,
}: {
    contratoId: number;
    contratoNumero: string;
    onPendenciaCriada: () => void;
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [descricao, setDescricao] = React.useState("");
    const [dataPrazo, setDataPrazo] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!descricao.trim() || !dataPrazo) {
            toast.error("Erro de Validação", {
                description: "Por favor, preencha a descrição e a data prazo.",
            });
            return;
        }

        const adminId = getCurrentUserId();
        if (!adminId) {
            toast.error("Erro de Autenticação", {
                description: "Não foi possível identificar o usuário. Faça o login novamente.",
            });
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading("Criando pendência...");

        try {
            const token = localStorage.getItem("token");
            const apiUrl = import.meta.env.VITE_API_URL;
            if (!apiUrl || !token) throw new Error("Configuração ou autenticação ausente.");

            const requestBody = {
                descricao: descricao.trim(),
                data_prazo: dataPrazo,
                status_pendencia_id: 1, // Conforme a API, 1 = "Pendente"
                criado_por_usuario_id: adminId,
            };

            const response = await fetch(`${apiUrl}/contratos/${contratoId}/pendencias`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (response.status === 201) {
                toast.success("Pendência criada com sucesso!", { id: toastId });
                onPendenciaCriada();
                setDescricao(""); // Limpa o formulário
                setDataPrazo("");
                setIsOpen(false); // Fecha o modal
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `Falha ao criar pendência. Status: ${response.status}`);
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
            toast.error("Erro ao criar pendência", { description: errorMessage, id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Criar Nova Pendência</DialogTitle>
                    <DialogDescription>
                        Para o contrato: <strong>{contratoNumero}</strong>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição da Pendência</Label>
                        <Textarea
                            id="descricao"
                            placeholder="Ex: Relatório referente ao primeiro trimestre de 2024"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="data_prazo">Data Prazo</label>
                        <input
                        id="data_prazo" 
                        type="date" 
                        className="mt-1 border rounded-lg p-2 w-full"
                        value={dataPrazo}                         
                        onChange={(e) => setDataPrazo(e.target.value)}
                        required 
                        />

                    </div>
                   
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isSubmitting}>
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Salvando..." : "Salvar Pendência"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// Componente: DraggableContratoCard (COM ALTERAÇÕES)
// ============================================================================
function DraggableContratoCard({
    contrato,
    contratados,
    statusList,
    usuarios,
    onContratoDeleted, // <-- NOVA PROP
}: {
    contrato: Contrato
    contratados: ContratadoInfo[]
    statusList: StatusInfo[]
    usuarios: UsuarioInfo[]
    onContratoDeleted: (id: number) => void; // <-- TIPO DA NOVA PROP
}) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: contrato.id as UniqueIdentifier,
    });
    const navigate = useNavigate();

    const handleEditClick = () => {
        navigate(`/contratos/editar/${contrato.id}`);
    };

    // NOVA FUNÇÃO para exclusão
    const handleDeleteContrato = async () => {
        const toastId = toast.loading("Excluindo contrato...");
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Acesso não autorizado.");

            const apiUrl = import.meta.env.VITE_API_URL;
            if (!apiUrl) throw new Error("VITE_API_URL não está configurada.");

            const response = await fetch(`${apiUrl}/contratos/${contrato.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 204) {
                toast.success("Contrato excluído com sucesso!", { id: toastId });
                onContratoDeleted(contrato.id); // Avisa o componente pai
            } else if (response.status === 404) {
                throw new Error("Contrato não encontrado.");
            } else if (response.status === 403) {
                throw new Error("Você não tem permissão para excluir este contrato.");
            } else {
                throw new Error(`Falha ao excluir o contrato. Status: ${response.status}`);
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
            toast.error("Erro ao excluir", { description: errorMessage, id: toastId });
        }
    };

    const getStatusIcon = (statusName: string) => {
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
                {/* AlertDialog para confirmação de exclusão */}
                <AlertDialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="text-muted-foreground h-8 w-8 p-0">
                                <IconDotsVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={handleEditClick} className="cursor-pointer flex items-center gap-2">
                                <Pencil className="h-4 w-4" />
                                <span>Editar</span>
                            </DropdownMenuItem>
                            
                            {/* **NOVA IMPLEMENTAÇÃO AQUI** */}
                            <CriarPendenciaDialog
                                contratoId={contrato.id}
                                contratoNumero={contrato.nr_contrato}
                                onPendenciaCriada={() => {
                                    /* Opcional: pode adicionar lógica aqui, como recarregar detalhes */
                                }}
                            >
                                <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()} // Impede o fechamento do menu ao abrir o diálogo
                                    className="cursor-pointer flex items-center gap-2"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Criar Pendência</span>
                                </DropdownMenuItem>
                            </CriarPendenciaDialog>

                            <DropdownMenuSeparator />
                            {/* O gatilho para o AlertDialog está aqui */}
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                    className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                                    onSelect={(e) => e.preventDefault()} // Evita que o menu feche ao clicar
                                >
                                    <X className="h-4 w-4" />
                                    <span>Excluir</span>
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação irá desativar o contrato "{contrato.nr_contrato}". Ele não será permanentemente removido, mas ficará inativo. Você não poderá desfazer esta ação.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteContrato} className="bg-red-600 hover:bg-red-700">
                                Sim, excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardHeader>
            <CardContent className="flex flex-grow flex-col gap-4 text-sm">
                <div className="flex flex-col gap-2">
                    <div>
                        <Label className="text-xs text-muted-foreground">Status</Label>
                        <Badge variant={"secondary"} className="gap-1.5 whitespace-nowrap">
                            {getStatusIcon(contrato.status_nome || '')}
                            {contrato.status_nome || "Não informado"}
                        </Badge>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">Contratado</Label>
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

// O restante do arquivo permanece igual...

// ============================================================================
// Componente: Definição de Colunas e Tipos de Paginação (SEM ALTERAÇÕES)
// ============================================================================
const columns: ColumnDef<Contrato>[] = [
    { accessorKey: "objeto" },
    { accessorKey: "nr_contrato" },
    { accessorKey: "pae" },
    { accessorKey: "ano" },
    { accessorKey: "status_id" },
    { accessorKey: "gestor_id" },
    { accessorKey: "fiscal_id" },
    // Colunas para ordenação
    { accessorKey: "data_inicio" },
    { accessorKey: "data_fim" },
]

type PaginationMeta = {
    total_items: number;
    total_pages: number;
    current_page: number;
    per_page: number;
}

// ============================================================================
// Componente Principal: ContratosDataTable (SEM ALTERAÇÕES)
// ============================================================================
export function ContratosDataTable() {
    // Estados de dados
    const [contratos, setContratos] = React.useState<Contrato[]>([])
    const [contratados, setContratados] = React.useState<ContratadoInfo[]>([])
    const [statusList, setStatusList] = React.useState<StatusInfo[]>([])
    const [usuarios, setUsuarios] = React.useState<UsuarioInfo[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    // Estados da Tabela (controlados para API)
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([{ id: 'data_fim', desc: true }]) // Padrão
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 9 })
    const [paginationMeta, setPaginationMeta] = React.useState<PaginationMeta | null>(null);
    const [fetchTrigger] = React.useState(0);


    // DND Kit
    const sortableId = React.useId()
    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor), useSensor(KeyboardSensor))

    // Efeito para buscar dados da API sempre que os filtros, paginação ou ordenação mudarem
    React.useEffect(() => {
        const fetchContratos = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error("Acesso não autorizado. Por favor, faça o login.");

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                };

                const apiUrl = import.meta.env.VITE_API_URL;
                if (!apiUrl) throw new Error("VITE_API_URL não está configurada.");

                // Constrói os parâmetros da query
                const params = new URLSearchParams();

                // Paginação
                params.append('page', String(pagination.pageIndex + 1));
                params.append('per_page', String(pagination.pageSize));

                // Ordenação
                if (sorting.length > 0) {
                    params.append('sortBy', sorting[0].id);
                    params.append('order', sorting[0].desc ? 'desc' : 'asc');
                }

                // Filtros
                columnFilters.forEach(filter => {
                    if (filter.value) {
                        params.append(filter.id, String(filter.value));
                    }
                });

                // Busca os contratos com os parâmetros
                const res = await fetch(`${apiUrl}/contratos?${params.toString()}`, { headers });

                if (res.status === 401) throw new Error("Sua sessão expirou. Faça o login novamente.");
                if (!res.ok) throw new Error(`Falha na requisição de contratos com status ${res.status}`);

                const data = await res.json();

                // A API já retorna os nomes, então podemos usar os dados diretamente.
                setContratos(data.data || []);
                setPaginationMeta(data.pagination);

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
                setError(errorMessage);
                toast.error("Erro ao carregar contratos: " + errorMessage);
                setContratos([]);
                setPaginationMeta(null);
            } finally {
                setIsLoading(false);
            }
        };

        // Só busca os contratos se os dados de suporte (status, etc.) já foram carregados
        if (statusList.length > 0 && contratados.length > 0) {
            fetchContratos();
        }
    }, [columnFilters, pagination, sorting, statusList, contratados, fetchTrigger]); // Dependências do efeito

    // Efeito para buscar dados iniciais (status, contratados, usuários) apenas uma vez
    React.useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error("Acesso não autorizado.");
                const headers = { 'Authorization': `Bearer ${token}` };
                const apiUrl = import.meta.env.VITE_API_URL;
                if (!apiUrl) throw new Error("VITE_API_URL não configurada.");

                const [contratadosRes, statusRes, usuariosRes] = await Promise.all([
                    fetch(`${apiUrl}/contratados`, { headers }),
                    fetch(`${apiUrl}/status`, { headers }),
                    fetch(`${apiUrl}/usuarios`, { headers }),
                ]);

                if (!contratadosRes.ok || !statusRes.ok || !usuariosRes.ok) {
                    throw new Error("Falha ao carregar dados de suporte.");
                }

                setContratados(await contratadosRes.json());
                setStatusList(await statusRes.json());
                setUsuarios(await usuariosRes.json());
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
                setError(errorMessage);
                toast.error("Erro ao carregar dados de suporte: " + errorMessage);
            }
        };
        fetchInitialData();
    }, []);

    const handleContratoDeleted = () => {
        // Força o recarregamento da página para garantir que todos os estados sejam atualizados.
        window.location.reload();
    };

    const dataIds = React.useMemo<UniqueIdentifier[]>(
        () => contratos?.map(({ id }) => id as UniqueIdentifier) || [],
        [contratos]
    )

    const table = useReactTable({
        data: contratos,
        columns,
        pageCount: paginationMeta?.total_pages ?? -1,
        state: { sorting, columnFilters, pagination },
        // Configuração para controle manual
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        // Handlers
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        // Outras configs
        getRowId: (row) => row.id.toString(),
        getCoreRowModel: getCoreRowModel(),
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
        toast.info("A ordem dos contratos foi alterada apenas nesta visualização.")
    }

    if (error && contratos.length === 0) {
        return <div className="p-8 text-center text-red-600"><strong>Erro ao carregar:</strong> {error}</div>;
    }

    return (
        <div className="w-full flex flex-col justify-start gap-4 p-4">
            <ContratosFilters table={table} statusList={statusList} usuarios={usuarios} />

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
                    {isLoading && <div className="py-8 text-center">Carregando contratos...</div>}

                    {!isLoading && (
                        <>
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
                                                    onContratoDeleted={handleContratoDeleted}
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

                            {/* Paginação */}
                            <div className="flex items-center justify-between">
                                <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                                    Exibindo {table.getRowModel().rows.length} de {paginationMeta?.total_items ?? 0} contrato(s).
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
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

// ============================================================================
// Componente: DetailItem (Helper para Modal) (SEM ALTERAÇÕES)
// ============================================================================
const DetailItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <div className="font-medium">{children}</div>
    </div>
)

// ============================================================================
// Componente: ContratoDetailsViewer (Modal) (COM PEQUENA ALTERAÇÃO NO SCHEMA)
// ============================================================================
function ContratoDetailsViewer({
    contrato,
    contratados,
    statusList,
    usuarios,
}: {
    contrato: Contrato
    contratados: ContratadoInfo[]
    statusList: StatusInfo[]
    usuarios: UsuarioInfo[]
}) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [detailedData, setDetailedData] = React.useState<ContratoDetalhado | null>(null)
    const [arquivos, setArquivos] = React.useState<Arquivo[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    // **NOVO ESTADO** para pendências
    const [pendencias, setPendencias] = React.useState<Pendencia[]>([])

    const handleDownloadArquivo = async (arquivoId: number, nomeOriginal: string) => {
        const toastId = toast.loading(`Baixando "${nomeOriginal}"...`);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Usuário não autenticado.");

            const apiUrl = import.meta.env.VITE_API_URL;
            if (!apiUrl) throw new Error("VITE_API_URL não configurada.");

            const response = await fetch(`${apiUrl}/arquivos/${arquivoId}/download`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Arquivo não encontrado no servidor.");
                }
                throw new Error(`Erro no servidor: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = nomeOriginal;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast.success(`Download de "${nomeOriginal}" concluído!`, { id: toastId });

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
            toast.error(`Falha no download de "${nomeOriginal}"`, {
                description: errorMessage,
                id: toastId,
            });
        }
    };

    React.useEffect(() => {
        if (!isOpen) {
            setDetailedData(null);
            setArquivos([]);
            setPendencias([]); // Limpa as pendências ao fechar
            return;
        }

        const fetchAllDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Usuário não autenticado.");

                const apiUrl = import.meta.env.VITE_API_URL;
                if (!apiUrl) throw new Error("VITE_API_URL não configurada.");

                const headers = { Authorization: `Bearer ${token}` };

                // **Busca de pendências adicionada**
                const [detailsRes, arquivosRes, pendenciasRes] = await Promise.all([
                    fetch(`${apiUrl}/contratos/${contrato.id}`, { headers }),
                    fetch(`${apiUrl}/contratos/${contrato.id}/arquivos`, { headers }),
                    fetch(`${apiUrl}/contratos/${contrato.id}/pendencias`, { headers }), // NOVA REQUISIÇÃO
                ]);

                if (!detailsRes.ok) throw new Error(`Erro ao buscar detalhes: ${detailsRes.statusText}`);
                if (!arquivosRes.ok) throw new Error(`Erro ao buscar arquivos: ${arquivosRes.statusText}`);
                if (!pendenciasRes.ok) throw new Error(`Erro ao buscar pendências: ${pendenciasRes.statusText}`);

                const detailsData = await detailsRes.json();
                const arquivosData = await arquivosRes.json();
                const pendenciasData = await pendenciasRes.json(); // Novos dados

                const validatedDetails = contratoDetalhadoSchema.parse(detailsData);
                const validatedArquivos = z.array(arquivoSchema).parse(arquivosData);
                const validatedPendencias = z.array(pendenciaSchema).parse(pendenciasData); // Validação

                setDetailedData(validatedDetails);
                setArquivos(validatedArquivos);
                setPendencias(validatedPendencias); // Seta no estado

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
                setError(errorMessage);
                toast.error("Falha ao carregar dados do contrato", { description: errorMessage });
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllDetails();
    }, [isOpen, contrato.id]);

    const dataToShow = detailedData || contrato;
    const status = statusList.find(s => s.id === dataToShow.status_id) || { nome: 'Desconhecido' };
    const contratado = contratados.find(c => c.id === dataToShow.contratado_id) || { nome: 'Não encontrado', cnpj: 'N/A', cpf: 'N/A' };
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
                        <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-3">
                            <DetailItem label="Status">{status.nome}</DetailItem>
                            <DetailItem label="Modalidade">
                                {
                                    (detailedData as any)?.modalidade?.nome ||
                                    contrato.modalidade_nome || "Não informado"
                                }
                            </DetailItem>
                            <DetailItem label="Valor Anual">{formatCurrency(dataToShow.valor_anual)}</DetailItem>
                            <DetailItem label="Valor Global">{formatCurrency(dataToShow.valor_global)}</DetailItem>
                            <DetailItem label="Vigência">{`${formatDate(dataToShow.data_inicio)} a ${formatDate(dataToShow.data_fim)}`}</DetailItem>
                        </div>
                        <Separator />
                        <h4 className="font-semibold text-foreground">Contratado</h4>
                        <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-3">
                            <DetailItem label="Contratado">{contratado.nome}</DetailItem>
                            <DetailItem label="CNPJ do Contratado">{formatCnpj(contratado.cnpj)}</DetailItem>
                            <DetailItem label="CPF do Contratado">{formatCpf(contratado.cpf)}</DetailItem>
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
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Pendências</h4>
                            {/* **LISTAGEM DE PENDÊNCIAS ATUALIZADA** */}
                            {pendencias.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                    {pendencias.map(pend => (
                                        <li key={pend.id} className={pend.status_nome !== 'Pendente' ? 'line-through' : ''}>
                                            {pend.descricao} (Prazo: {formatDate(pend.data_prazo)}) - Status: <strong>{pend.status_nome}</strong>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">Nenhuma pendência encontrada.</p>
                            )}
                        </div>
                        <Separator />
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Arquivos</h4>
                            {arquivos.length > 0 ? (
                                <ul className="space-y-2">
                                    {arquivos.map(arq => (
                                        <li key={arq.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted">
                                            <span className="text-muted-foreground">{arq.nome_arquivo}</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownloadArquivo(arq.id, arq.nome_arquivo)}
                                                className="gap-2"
                                            >
                                                <IconDownload className="h-4 w-4" />
                                                Baixar
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">Nenhum arquivo encontrado para este contrato.</p>
                            )}
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