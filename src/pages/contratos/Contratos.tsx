import * as React from "react";
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
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconCircleCheckFilled,
    IconClockHour4,
    IconDotsVertical,
    IconDownload,
    IconExclamationCircle,
    IconPlus,
    IconSearch,
    IconX,
} from "@tabler/icons-react";
import {
    type ColumnDef,
    type ColumnFiltersState,
    getCoreRowModel,
    type SortingState,
    type Table,
    useReactTable,
} from "@tanstack/react-table";
import { jwtDecode } from "jwt-decode";
import { PlusCircle } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

// Importar as funções da API
import {
    getContratos,
    deleteContrato,
    getContratoDetalhado,
    getPendenciasByContratoId,
    createPendencia,
    downloadArquivoContrato,
    deleteArquivoContrato,
    getArquivosByContratoId,
    getRelatoriosByContratoId,
    getContratados,
    getStatus,
    getUsers,
    logout,
    type Contratado,
    type Status,
    type User,
    type ArquivosResponse,
    type Perfil,
} from "@/lib/api";

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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// ============================================================================
// Tipos corrigidos baseados na API real
// ============================================================================

// Tipo para listagem de contratos (GET /contratos)
type ContratoList = {
    id: number;
    nr_contrato: string;
    objeto: string;
    data_fim: string;
    contratado_nome: string | null;
    status_nome: string | null;
};

// Tipo para detalhes do contrato (GET /contratos/{id})
type ContratoDetalhado = {
    nr_contrato: string;
    objeto: string;
    data_inicio: string;
    data_fim: string;
    contratado_id: number;
    modalidade_id: number;
    status_id: number;
    gestor_id: number;
    fiscal_id: number;
    valor_anual: number | null;
    valor_global: number | null;
    base_legal: string | null;
    termos_contratuais: string | null;
    fiscal_substituto_id: number | null;
    pae: string | null;
    doe: string | null;
    data_doe: string | null;
    id: number;
    ativo: boolean;
    contratado_nome: string | null;
    modalidade_nome: string | null;
    status_nome: string | null;
    gestor_nome: string | null;
    fiscal_nome: string | null;
    fiscal_substituto_nome: string | null;
    documento_nome_arquivo: string | null;
};

type Pendencia = {
    descricao: string;
    data_prazo: string;
    status_pendencia_id: number;
    criado_por_usuario_id: number;
    id: number;
    contrato_id: number;
    created_at: string;
    updated_at: string;
    status_nome: string | null;
    criado_por_nome: string | null;
};

type NewPendenciaPayload = {
    descricao: string;
    data_prazo: string;
    status_pendencia_id: number;
    criado_por_usuario_id: number;
};

type PaginationMeta = {
    total_items: number;
    total_pages: number;
    current_page: number;
    per_page: number;
};

// ============================================================================
// Funções Auxiliares
// ============================================================================
const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return "N/A";
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
};

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR", {
        timeZone: "UTC",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const formatCnpj = (cnpj: string | null | undefined) => {
    if (!cnpj) return "N/A";
    const digitsOnly = cnpj.replace(/\D/g, "");
    if (digitsOnly.length !== 14) return cnpj;
    return digitsOnly.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5",
    );
};

const formatCpf = (cpf: string | null | undefined) => {
    if (!cpf) return "N/A";
    const digitsOnly = cpf.replace(/\D/g, "");
    if (digitsOnly.length !== 11) return cpf;
    return digitsOnly.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const getCurrentUserId = (): number | null => {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) return null;
        const decoded: { sub: string } = jwtDecode(token);
        return parseInt(decoded.sub, 10);
    } catch (error) {
        console.error("Failed to decode token:", error);
        toast.error("Sessão inválida ou expirada. Faça login novamente.");
        return null;
    }
};

const convertToContratoList = (contrato: any): ContratoList => {
    return {
        id: contrato.id,
        nr_contrato: contrato.nr_contrato,
        objeto: contrato.objeto,
        data_fim: contrato.data_fim,
        contratado_nome: contrato.contratado_nome ?? null,
        status_nome: contrato.status_nome ?? null
    };
};

// Funções de conversão para garantir compatibilidade de tipos
const convertToContratoDetalhado = (data: any): ContratoDetalhado => {
    return {
        nr_contrato: data.nr_contrato,
        objeto: data.objeto,
        data_inicio: data.data_inicio,
        data_fim: data.data_fim,
        contratado_id: data.contratado_id,
        modalidade_id: data.modalidade_id,
        status_id: data.status_id,
        gestor_id: data.gestor_id,
        fiscal_id: data.fiscal_id,
        valor_anual: data.valor_anual ?? null,
        valor_global: data.valor_global ?? null,
        base_legal: data.base_legal ?? null,
        termos_contratuais: data.termos_contratuais ?? null,
        fiscal_substituto_id: data.fiscal_substituto_id ?? null,
        pae: data.pae ?? null,
        doe: data.doe ?? null,
        data_doe: data.data_doe ?? null,
        id: data.id,
        ativo: data.ativo ?? true,
        contratado_nome: data.contratado_nome ?? null,
        modalidade_nome: data.modalidade_nome ?? null,
        status_nome: data.status_nome ?? null,
        gestor_nome: data.gestor_nome ?? null,
        fiscal_nome: data.fiscal_nome ?? null,
        fiscal_substituto_nome: data.fiscal_substituto_nome ?? null,
        documento_nome_arquivo: data.documento_nome_arquivo ?? null
    };
};

const convertToPendencia = (data: any): Pendencia => {
    return {
        descricao: data.descricao,
        data_prazo: data.data_prazo,
        status_pendencia_id: data.status_pendencia_id,
        criado_por_usuario_id: data.criado_por_usuario_id,
        id: data.id,
        contrato_id: data.contrato_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status_nome: data.status_nome ?? null,
        criado_por_nome: data.criado_por_nome ?? null
    };
};

// ============================================================================
// Componentes
// ============================================================================
function ContratosFilters({
    table,
    statusList,
    usuarios,
    perfilAtivo,
    pageDescription,
}: {
    table: Table<ContratoList>;
    statusList: Status[];
    usuarios: User[];
    perfilAtivo: Perfil | null;
    pageDescription: string;
}) {
    const isAdmin = perfilAtivo?.nome === "Administrador";
    const [filters, setFilters] = React.useState({
        objeto: "",
        nr_contrato: "",
        pae: "",
        ano: "",
        status_id: "",
        gestor_id: "",
        fiscal_id: "",
    });

    React.useEffect(() => {
        // Sincronizar filtros atuais com o estado local
        const currentFilters = {
            objeto: (table.getColumn("objeto")?.getFilterValue() as string) ?? "",
            nr_contrato: (table.getColumn("nr_contrato")?.getFilterValue() as string) ?? "",
            pae: (table.getColumn("pae")?.getFilterValue() as string) ?? "",
            ano: (table.getColumn("ano")?.getFilterValue() as string) ?? "",
            status_id: (table.getColumn("status_id")?.getFilterValue() as string) ?? "",
            gestor_id: (table.getColumn("gestor_id")?.getFilterValue() as string) ?? "",
            fiscal_id: (table.getColumn("fiscal_id")?.getFilterValue() as string) ?? "",
        };
        setFilters(currentFilters);
    }, [table]);

    const handleApplyFilters = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Aplicar filtros à tabela
        table.getColumn("objeto")?.setFilterValue(filters.objeto || undefined);
        table.getColumn("nr_contrato")?.setFilterValue(filters.nr_contrato || undefined);
        table.getColumn("pae")?.setFilterValue(filters.pae || undefined);
        table.getColumn("ano")?.setFilterValue(filters.ano || undefined);
        table.getColumn("status_id")?.setFilterValue(filters.status_id === "all" ? undefined : filters.status_id || undefined);
        table.getColumn("gestor_id")?.setFilterValue(filters.gestor_id === "all" ? undefined : filters.gestor_id || undefined);
        table.getColumn("fiscal_id")?.setFilterValue(filters.fiscal_id === "all" ? undefined : filters.fiscal_id || undefined);
    };

    const handleClearFilters = () => {
        setFilters({
            objeto: "",
            nr_contrato: "",
            pae: "",
            ano: "",
            status_id: "",
            gestor_id: "",
            fiscal_id: "",
        });
        table.resetColumnFilters();
    };

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Filtros de Contratos</CardTitle>
                <CardDescription>
                    {pageDescription}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleApplyFilters} className="p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="nrContrato">Número do Contrato</Label>
                        <Input
                            id="nrContrato"
                            placeholder="Ex: 99/2025"
                            value={filters.nr_contrato}
                            onChange={(e) => handleFilterChange("nr_contrato", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="objeto">Objeto do Contrato</Label>
                        <Input
                            id="objeto"
                            placeholder="Pesquisar no objeto..."
                            value={filters.objeto}
                            onChange={(e) => handleFilterChange("objeto", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="pae">Nº (PAE)</Label>
                        <Input
                            id="pae"
                            placeholder="Ex: 2025/123456"
                            value={filters.pae}
                            onChange={(e) => handleFilterChange("pae", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="ano">Ano Início</Label>
                        <Input
                            id="ano"
                            type="number"
                            placeholder="Ex: 2024"
                            value={filters.ano}
                            onChange={(e) => handleFilterChange("ano", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Status</Label>
                        <Select
                            value={filters.status_id}
                            onValueChange={(value) => handleFilterChange("status_id", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Escolha um status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Status</SelectItem>
                                {(statusList || []).map((status) => (
                                    <SelectItem key={status.id} value={String(status.id)}>
                                        {status.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Mostrar filtros de Gestor e Fiscal apenas para Administradores */}
                    {isAdmin && (
                        <>
                            <div className="space-y-1.5">
                                <Label>Gestor</Label>
                                <Select
                                    value={filters.gestor_id}
                                    onValueChange={(value) => handleFilterChange("gestor_id", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Escolha um gestor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os Gestores</SelectItem>
                                        {(usuarios || []).map((user) => (
                                            <SelectItem key={user.id} value={String(user.id)}>
                                                {user.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Fiscal</Label>
                                <Select
                                    value={filters.fiscal_id}
                                    onValueChange={(value) => handleFilterChange("fiscal_id", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Escolha um fiscal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os Fiscais</SelectItem>
                                        {(usuarios || []).map((user) => (
                                            <SelectItem key={user.id} value={String(user.id)}>
                                                {user.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                    <div className="flex flex-col gap-2 self-end md:flex-row">
                        <Button type="submit" className="w-full md:w-auto">
                            <IconSearch className="mr-2 h-4 w-4" /> Pesquisar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleClearFilters}
                            variant="outline"
                            className="w-full md:w-auto"
                        >
                            <IconX className="mr-2 h-4 w-4" /> Limpar
                        </Button>
                    </div>
                </div>
            </form>
        </Card>
    );
}

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
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!descricao.trim() || !dataPrazo) {
            toast.error("Por favor, preencha a descrição e a data prazo.");
            return;
        }

        const adminId = getCurrentUserId();
        if (!adminId) {
            toast.error("Não foi possível identificar o usuário. Faça o login novamente.");
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading("Criando pendência...");

        try {
            const payload: NewPendenciaPayload = {
                descricao: descricao.trim(),
                data_prazo: dataPrazo,
                status_pendencia_id: 1,
                criado_por_usuario_id: adminId,
            };

            await createPendencia(contratoId, payload);

            toast.success("Pendência criada com sucesso!", { id: toastId });
            onPendenciaCriada();
            setDescricao("");
            setDataPrazo("");
            setIsOpen(false);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";

            if (errorMessage.includes("401") || errorMessage.includes("não autorizado")) {
                toast.error("Sessão expirada", {
                    description: "Por favor, faça o login novamente.",
                });
                await logout();
                navigate("/login", { replace: true });
            } else {
                toast.error("Erro ao criar pendência", {
                    description: errorMessage,
                    id: toastId,
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                className="sm:max-w-md"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <DialogHeader>
                    <DialogTitle>Criar Nova Pendência</DialogTitle>
                    <DialogDescription>
                        Para o contrato: <strong>{contratoNumero}</strong>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição da Pendência</Label>
                        <Textarea
                            id="descricao"
                            placeholder="Ex: Relatório do 1º trimestre"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onFocus={(e) => e.stopPropagation()}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="data_prazo">Data Prazo</Label>
                        <Input
                            id="data_prazo"
                            type="date"
                            className="mt-1 w-full"
                            value={dataPrazo}
                            onChange={(e) => setDataPrazo(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onFocus={(e) => e.stopPropagation()}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isSubmitting}
                                onClick={(e) => e.stopPropagation()}
                            >
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {isSubmitting ? "Salvando..." : "Salvar Pendência"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function PendenciasContrato({ contratoId, contratoNumero }: { contratoId: number; contratoNumero: string; }) {
    const [pendencias, setPendencias] = React.useState<Pendencia[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const navigate = useNavigate();
    const { perfilAtivo } = useAuth();

    const isAdmin = perfilAtivo?.nome === "Administrador";

    const fetchPendencias = React.useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getPendenciasByContratoId(contratoId);
            setPendencias(response.map(convertToPendencia));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";

            if (errorMessage.includes("401") || errorMessage.includes("não autorizado")) {
                toast.error("Sessão expirada", {
                    description: "Por favor, faça o login novamente.",
                });
                await logout();
                navigate("/login", { replace: true });
            } else {
                setError(errorMessage);
                toast.error("Erro ao carregar pendências", {
                    description: errorMessage,
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, [contratoId, navigate]);

    React.useEffect(() => {
        fetchPendencias();
    }, [fetchPendencias]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">Pendências do Contrato</h4>
                {isAdmin && (
                    <CriarPendenciaDialog
                        contratoId={contratoId}
                        contratoNumero={contratoNumero}
                        onPendenciaCriada={fetchPendencias}
                    >
                        <Button size="sm" className="gap-2" onClick={(e) => e.stopPropagation()}>
                            <IconPlus className="h-4 w-4" />
                            Nova Pendência
                        </Button>
                    </CriarPendenciaDialog>
                )}
            </div>

            {isLoading ? (
                <div className="py-4 text-center">Carregando pendências...</div>
            ) : error ? (
                <div className="py-4 text-center text-red-600">
                    <strong>Erro:</strong> {error}
                </div>
            ) : pendencias.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <IconExclamationCircle className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">Nenhuma pendência encontrada</p>
                        <p className="text-xs text-muted-foreground">
                            Este contrato não possui pendências registradas.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {pendencias.map((pendencia) => (
                        <Card key={pendencia.id} className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="font-medium">{pendencia.descricao}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Prazo: {format(new Date(pendencia.data_prazo), 'dd/MM/yyyy', { locale: ptBR })}
                                    </p>
                                    <Badge variant="secondary" className="mt-1">{pendencia.status_nome}</Badge>
                                </div>
                                {isAdmin && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                                                <IconX className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Confirmar exclusão?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Tem certeza que deseja excluir a pendência: "{pendencia.descricao}"? Esta ação não pode ser desfeita.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function DraggableContratoCard({
    contrato,
    onContratoDeleted,
    canManageContratos,
    isFiscal,
}: {
    contrato: ContratoList;
    onContratoDeleted: (id: number) => void;
    canManageContratos: boolean;
    isFiscal: boolean;
}) {
    const [pendencias, setPendencias] = React.useState<Pendencia[]>([]);
    const [relatorios, setRelatorios] = React.useState<any[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

    // Carregar pendências quando for fiscal
    React.useEffect(() => {
        if (isFiscal) {
            const fetchPendencias = async () => {
                try {
                    const response = await getPendenciasByContratoId(contrato.id);
                    setPendencias(response || []);
                } catch (error) {
                    console.error('Erro ao carregar pendências:', error);
                }
            };
            fetchPendencias();
        }
    }, [isFiscal, contrato.id]);

    // Carregar relatórios para verificar se há relatório pendente/concluído
    React.useEffect(() => {
        if (isFiscal) {
            const fetchRelatorios = async () => {
                try {
                    const response = await getRelatoriosByContratoId(contrato.id);
                    setRelatorios(response.data || []);
                } catch (error) {
                    console.error('Erro ao carregar relatórios:', error);
                }
            };
            fetchRelatorios();
        }
    }, [isFiscal, contrato.id]);

    // Verificar se há relatório pendente de análise ou aprovado
    const temRelatorioResolvido = relatorios.some(rel =>
        rel.status_relatorio === 'Aguardando Análise' ||
        rel.status_relatorio === 'Aprovado'
    );

    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: contrato.id as UniqueIdentifier,
    });
    const navigate = useNavigate();

    const handlePendenciaCriada = () => {
        // Fechar o dropdown após criar a pendência
        setIsDropdownOpen(false);
        // Recarregar pendências se for fiscal
        if (isFiscal) {
            const fetchPendencias = async () => {
                try {
                    const response = await getPendenciasByContratoId(contrato.id);
                    setPendencias(response || []);
                } catch (error) {
                    console.error('Erro ao carregar pendências:', error);
                }
            };
            fetchPendencias();
        }
    };

    const handleDeleteContrato = async () => {
        const toastId = toast.loading("Excluindo contrato...");
        try {
            await deleteContrato(contrato.id);
            toast.success("Contrato excluído com sucesso!", { id: toastId });
            onContratoDeleted(contrato.id);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";

            if (errorMessage.includes("401") || errorMessage.includes("não autorizado")) {
                toast.error("Sessão expirada", {
                    description: "Por favor, faça o login novamente.",
                });
                await logout();
                navigate("/login", { replace: true });
            } else {
                toast.error("Erro ao excluir", {
                    description: errorMessage,
                    id: toastId,
                });
            }
        }
    };

    const getStatusIcon = (statusName: string | null) => {
        if (!statusName) return <IconClockHour4 className="text-blue-500" />;
        if (statusName.toLowerCase().includes("vencido"))
            return <IconExclamationCircle className="text-red-500" />;
        if (statusName.toLowerCase().includes("ativo"))
            return <IconCircleCheckFilled className="text-green-500" />;
        return <IconClockHour4 className="text-blue-500" />;
    };

    const getStatusColor = (statusName: string | null) => {
        if (!statusName) return "from-blue-500 to-blue-600";
        if (statusName.toLowerCase().includes("vencido")) return "from-red-500 to-red-600";
        if (statusName.toLowerCase().includes("ativo")) return "from-green-500 to-green-600";
        return "from-blue-500 to-blue-600";
    };

    const getStatusBadgeColor = (statusName: string | null) => {
        if (!statusName) return "bg-blue-100 text-blue-800 border-blue-200";
        if (statusName.toLowerCase().includes("vencido")) return "bg-red-100 text-red-800 border-red-200";
        if (statusName.toLowerCase().includes("ativo")) return "bg-green-100 text-green-800 border-green-200";
        return "bg-blue-100 text-blue-800 border-blue-200";
    };

    return (
        <Card
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            data-dragging={isDragging}
            className="group relative z-0 overflow-hidden bg-white border border-gray-200/60 shadow-lg hover:shadow-2xl hover:border-gray-300/80 transition-all duration-500 ease-out data-[dragging=true]:z-10 data-[dragging=true]:shadow-2xl data-[dragging=true]:scale-105 data-[dragging=true]:rotate-2 cursor-pointer"
            onClick={() => navigate(`/contratos/${contrato.id}`)}
        >
            {/* Header com gradiente */}
            <div className={`h-1 bg-gradient-to-r ${getStatusColor(contrato.status_nome)} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>

            <CardHeader className="pb-2 pt-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-1 mb-1">
                            <Badge className={`${getStatusBadgeColor(contrato.status_nome)} text-xs font-medium border px-1 py-0.5`}>
                                {getStatusIcon(contrato.status_nome)}
                                <span className="ml-0.5">{contrato.status_nome || "Pendente"}</span>
                            </Badge>
                            {pendencias.length > 0 && !temRelatorioResolvido && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 text-xs px-1 py-0.5">
                                    <IconExclamationCircle className="w-3 h-3 mr-0.5" />
                                    {pendencias.length}
                                </Badge>
                            )}
                        </div>
                        <h3 className="font-bold text-sm text-gray-900 leading-tight truncate group-hover:text-blue-700 transition-colors">
                            {contrato.nr_contrato}
                        </h3>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-1 leading-relaxed group-hover:text-gray-700 transition-colors">
                            {contrato.objeto}
                        </p>
                    </div>

                    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <IconDotsVertical className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 p-0.5">
                            {canManageContratos && !isFiscal && (
                                <CriarPendenciaDialog
                                    contratoId={contrato.id}
                                    contratoNumero={contrato.nr_contrato}
                                    onPendenciaCriada={handlePendenciaCriada}
                                >
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex cursor-pointer items-center gap-1.5 py-1 px-2 rounded-sm hover:bg-orange-50 text-xs"
                                    >
                                        <IconPlus className="h-3 w-3 text-orange-600" />
                                        <span>Criar Pendência</span>
                                    </DropdownMenuItem>
                                </CriarPendenciaDialog>
                            )}
                            {canManageContratos && (
                                <>
                                    {!isFiscal && <DropdownMenuSeparator className="my-0.5" />}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem
                                                className="flex cursor-pointer items-center gap-1.5 py-1 px-2 rounded-sm text-red-600 hover:bg-red-50 focus:text-red-600 text-xs"
                                                onSelect={(e) => e.preventDefault()}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <IconX className="h-3 w-3" />
                                                <span>Excluir</span>
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta ação excluirá permanentemente o contrato "{contrato.nr_contrato}".
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteContrato();
                                                    }}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    Sim, excluir
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="pt-0 pb-2 px-3 space-y-1.5">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between py-1 px-1.5 bg-gray-50/80 rounded-sm">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Contratado</span>
                        <span className="text-xs font-medium text-gray-900 truncate ml-1">
                            {contrato.contratado_nome || "Não informado"}
                        </span>
                    </div>

                    <div className="flex items-center justify-between py-1 px-1.5 bg-gray-50/80 rounded-sm">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Data Fim</span>
                        <span className="text-xs font-medium text-gray-900">
                            {formatDate(contrato.data_fim)}
                        </span>
                    </div>
                </div>

                {/* Indicador visual de urgência */}
                {contrato.status_nome?.toLowerCase().includes("vencido") && (
                    <div className="flex items-center gap-1 p-1.5 bg-red-50 border border-red-200/50 rounded-sm">
                        <IconExclamationCircle className="h-3 w-3 text-red-600 flex-shrink-0" />
                        <span className="text-xs font-medium text-red-800">Vencido</span>
                    </div>
                )}

                {/* Indicador de contratos próximos ao vencimento */}
                {contrato.status_nome?.toLowerCase().includes("ativo") && (
                    <div className="flex items-center gap-1 p-1.5 bg-blue-50 border border-blue-200/50 rounded-sm">
                        <IconClockHour4 className="h-3 w-3 text-blue-600 flex-shrink-0" />
                        <span className="text-xs font-medium text-blue-800">Em Execução</span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-2 pb-3 px-3 border-t border-gray-100 bg-gray-50/50">
                <div className="flex flex-col gap-1.5 w-full">
                    <ContratoDetailsViewer contrato={contrato} />

                    
                </div>
            </CardFooter>
        </Card>
    );
}
const columns: ColumnDef<ContratoList>[] = [
    { accessorKey: "objeto" },
    { accessorKey: "nr_contrato" },
    { accessorKey: "pae" },
    { accessorKey: "ano" },
    { accessorKey: "status_id" },
    { accessorKey: "gestor_id" },
    { accessorKey: "fiscal_id" },
    { accessorKey: "data_fim" },
];

export function ContratosDataTable() {
    const { user, perfilAtivo } = useAuth();
    const [contratos, setContratos] = React.useState<ContratoList[]>([]);
    const [contratados, setContratados] = React.useState<Contratado[]>([]);
    const [statusList, setStatusList] = React.useState<Status[]>([]);
    const [usuarios, setUsuarios] = React.useState<User[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Determinar permissões baseadas no perfil
    const isAdmin = perfilAtivo?.nome === "Administrador";
    const isGestor = perfilAtivo?.nome === "Gestor";
    const isFiscal = perfilAtivo?.nome === "Fiscal";
    const canManageContratos = isAdmin; // Apenas admin pode criar/editar/excluir
    
    // Título dinâmico baseado no perfil
    const getPageTitle = () => {
        if (isFiscal) return "Meus Contratos - Fiscalização";
        if (isGestor) return "Meus Contratos - Gestão";
        return "Todos os Contratos";
    };
    
    const getPageDescription = () => {
        if (isFiscal) return "Contratos sob sua responsabilidade de fiscalização";
        if (isGestor) return "Contratos sob sua responsabilidade de gestão";
        return "Gerenciamento completo de contratos do sistema";
    };

    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([
        { id: "data_fim", desc: true },
    ]);
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 12,
    });
    const [paginationMeta, setPaginationMeta] = React.useState<PaginationMeta | null>(null);

    const sortableId = React.useId();
    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor),
    );

    const navigate = useNavigate();

    const handleLogout = React.useCallback(async () => {
        try {
            await logout();
        } catch (error) {
            console.warn("Erro ao fazer logout:", error);
        }
        navigate("/login", { replace: true });
    }, [navigate]);

    React.useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                // Carregar dados básicos sempre necessários
                const promises = [
                    getContratados({ page: 1, per_page: 10 }),
                    getStatus(),
                ];

                // Adicionar busca de usuários apenas para administradores
                if (isAdmin) {
                    promises.push(getUsers({ page: 1, per_page: 10 }));
                }

                const responses = await Promise.all(promises);
                
                // Processar respostas com tipos corretos
                const contratadosResponse = responses[0] as any; // ContratadoApiResponse
                const statusResponse = responses[1] as Status[];
                
                setContratados(contratadosResponse.data || []);
                setStatusList(statusResponse || []);
                
                // Definir usuários apenas se for admin
                if (isAdmin && responses[2]) {
                    const usuariosResponse = responses[2] as any; // UserApiResponse
                    setUsuarios(usuariosResponse.data || []);
                } else {
                    setUsuarios([]); // Lista vazia para não-admins
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";

                if (errorMessage.includes("401") || errorMessage.includes("não autorizado")) {
                    toast.error("Sessão expirada", {
                        description: "Por favor, faça o login novamente.",
                    });
                    handleLogout();
                    return;
                }

                setError(errorMessage);
                toast.error("Erro ao carregar dados de suporte: " + errorMessage);
                setIsLoading(false); // Finalizar loading em caso de erro
            }
        };
        fetchInitialData();
    }, [handleLogout, isAdmin]);

    React.useEffect(() => {
        const fetchContratos = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const filters: Record<string, any> = {
                    page: pagination.pageIndex + 1,
                    per_page: pagination.pageSize,
                };

                // Aplicar filtros automáticos baseados no perfil
                if (isFiscal && user?.id) {
                    filters.fiscal_id = user.id;
                    console.log(`🔍 Filtro Fiscal aplicado: fiscal_id=${user.id}`);
                } else if (isGestor && user?.id) {
                    filters.gestor_id = user.id;
                    console.log(`🔍 Filtro Gestor aplicado: gestor_id=${user.id}`);
                } else if (isAdmin) {
                    console.log(`🔍 Admin: carregando todos os contratos`);
                }

                columnFilters.forEach((filter) => {
                    if (filter.value) {
                        filters[filter.id] = filter.value;
                    }
                });

                // Aplicar ordenação
                if (sorting.length > 0) {
                    const sort = sorting[0];
                    filters.sort_by = sort.id;
                    filters.sort_order = sort.desc ? 'desc' : 'asc';
                }

                const response = await getContratos(filters);

                // Converter os dados para o tipo ContratoList
                const contratoListData = response.data.map(convertToContratoList);

                setContratos(contratoListData);
                setPaginationMeta({
                    total_items: response.total_items,
                    total_pages: response.total_pages,
                    current_page: response.current_page,
                    per_page: response.per_page,
                });
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";

                if (errorMessage.includes("401") || errorMessage.includes("não autorizado")) {
                    toast.error("Sessão expirada", {
                        description: "Por favor, faça o login novamente.",
                    });
                    handleLogout();
                    return;
                }

                setError(errorMessage);
                toast.error("Erro ao carregar contratos: " + errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        // Verificar se os dados básicos estão carregados
        const dadosBasicosCarregados = contratados.length > 0 && statusList.length > 0;
        // Para admins, também aguardar usuários; para outros perfis, não é necessário
        const dadosCompletos = isAdmin ? dadosBasicosCarregados && usuarios.length > 0 : dadosBasicosCarregados;
        
        if (dadosCompletos) {
            fetchContratos();
        }
    }, [columnFilters, pagination, sorting, contratados, statusList, usuarios, handleLogout, perfilAtivo, user, isFiscal, isGestor, isAdmin]);

    const handleContratoDeleted = (deletedId: number) => {
        setContratos((current) => current.filter((c) => c.id !== deletedId));
    };

    const table = useReactTable({
        data: contratos,
        columns,
        pageCount: paginationMeta?.total_pages ?? -1,
        state: { sorting, columnFilters, pagination },
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        getRowId: (row) => row.id.toString(),
        getCoreRowModel: getCoreRowModel(),
    });

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!active || !over || active.id === over.id) return;
        setContratos((currentData) => {
            const oldIndex = currentData.findIndex(
                (d) => String(d.id) === String(active.id),
            );
            const newIndex = currentData.findIndex(
                (d) => String(d.id) === String(over.id),
            );
            return arrayMove(currentData, oldIndex, newIndex);
        });
        toast.info("A ordem foi alterada apenas na visualização atual.");
    }

    if (error && !isLoading) {
        return (
            <div className="p-8 text-center text-red-600">
                <strong>Erro ao carregar dados:</strong> {error}
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col justify-start gap-4 p-4">
            <ContratosFilters
                table={table}
                statusList={statusList}
                usuarios={usuarios}
                perfilAtivo={perfilAtivo}
                pageDescription={getPageDescription()}
            />
            <Tabs defaultValue="all" className="w-full">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="all">{getPageTitle()}</TabsTrigger>
                    </TabsList>
                    {canManageContratos && (
                        <NavLink to="/novocontrato">
                            <Button variant="default" size="sm" className="gap-2">
                                <IconPlus className="h-4 w-4" />
                                <span className="hidden lg:inline">Novo Contrato</span>
                            </Button>
                        </NavLink>
                    )}
                </div>
                <TabsContent value="all" className="relative mt-4 flex flex-col gap-4">
                    {isLoading ? (
                        <div className="flex h-60 items-center justify-center">
                            <div className="text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                                    Carregando contratos...
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    {isFiscal 
                                        ? "Buscando seus contratos de fiscalização"
                                        : isGestor 
                                        ? "Buscando seus contratos de gestão"
                                        : "Buscando todos os contratos do sistema"
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <DndContext
                                collisionDetection={closestCenter}
                                modifiers={[restrictToVerticalAxis]}
                                onDragEnd={handleDragEnd}
                                sensors={sensors}
                                id={sortableId}
                            >
                                <SortableContext
                                    items={contratos.map((c) => c.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {table.getRowModel().rows?.length ? (
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {table.getRowModel().rows.map((row) => (
                                                <DraggableContratoCard
                                                    key={row.original.id}
                                                    contrato={row.original}
                                                    onContratoDeleted={handleContratoDeleted}
                                                    canManageContratos={canManageContratos}
                                                    isFiscal={isFiscal}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex h-60 items-center justify-center rounded-lg border border-dashed border-gray-300">
                                            <div className="text-center">
                                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                                    <IconExclamationCircle className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                                                    Nenhum contrato encontrado
                                                </h3>
                                                <p className="mt-2 text-sm text-gray-500">
                                                    {isFiscal 
                                                        ? "Você não possui contratos sob sua fiscalização."
                                                        : isGestor 
                                                        ? "Você não possui contratos sob sua gestão."
                                                        : "Não há contratos cadastrados no sistema."
                                                    }
                                                </p>
                                                {!isFiscal && !isGestor && (
                                                    <div className="mt-4">
                                                        <p className="text-xs text-gray-400 mb-2">
                                                            Tente limpar os filtros ou cadastre um novo contrato.
                                                        </p>
                                                        {canManageContratos && (
                                                            <NavLink to="/novocontrato">
                                                                <Button variant="outline" size="sm" className="gap-2">
                                                                    <PlusCircle className="h-4 w-4" />
                                                                    Cadastrar Primeiro Contrato
                                                                </Button>
                                                            </NavLink>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </SortableContext>
                            </DndContext>
                            <div className="flex items-center justify-between">
                                <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                                    Exibindo {table.getRowModel().rows.length} de{" "}
                                    {paginationMeta?.total_items ?? 0} contrato(s).
                                </div>
                                <div className="flex w-full items-center gap-6 lg:w-fit">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">Itens por página</p>
                                        <Select
                                            value={`${table.getState().pagination.pageSize}`}
                                            onValueChange={(value) => {
                                                table.setPageSize(Number(value));
                                            }}
                                        >
                                            <SelectTrigger className="h-8 w-[70px]">
                                                <SelectValue
                                                    placeholder={table.getState().pagination.pageSize}
                                                />
                                            </SelectTrigger>
                                            <SelectContent side="top">
                                                {[6, 12, 18, 24].map((pageSize) => (
                                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                                        {pageSize}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                        Página {table.getState().pagination.pageIndex + 1} de{" "}
                                        {table.getPageCount() || 1}
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
                                            onClick={() =>
                                                table.setPageIndex(table.getPageCount() - 1)
                                            }
                                            disabled={!table.getCanNextPage()}
                                        >
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
    );
}

function ContratoDetailsViewer({ contrato }: { contrato: ContratoList; }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [detailedData, setDetailedData] = React.useState<ContratoDetalhado | null>(null);
    const [arquivos, setArquivos] = React.useState<ArquivosResponse | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [contratados, setContratados] = React.useState<Contratado[]>([]);
    const [statusList, setStatusList] = React.useState<Status[]>([]);
    const [usuarios, setUsuarios] = React.useState<User[]>([]);

    const navigate = useNavigate();

    const handleLogout = React.useCallback(async () => {
        try {
            await logout();
        } catch (error) {
            console.warn("Erro ao fazer logout:", error);
        }
        navigate("/login", { replace: true });
    }, [navigate]);

    const handleDownloadArquivo = async (arquivoId: number, nomeOriginal: string) => {
        const toastId = toast.loading(`Baixando "${nomeOriginal}"...`);
        try {
            const blob = await downloadArquivoContrato(contrato.id, arquivoId);
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
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro.";

            if (errorMessage.includes("401") || errorMessage.includes("não autorizado")) {
                toast.error("Sessão expirada", {
                    description: "Por favor, faça o login novamente.",
                });
                handleLogout();
                return;
            }

            toast.error(`Falha no download de "${nomeOriginal}"`, {
                description: errorMessage,
                id: toastId,
            });
        }
    };

    const handleDeleteArquivo = async (arquivoId: number, nomeOriginal: string) => {
        const toastId = toast.loading(`Excluindo "${nomeOriginal}"...`);
        try {
            await deleteArquivoContrato(contrato.id, arquivoId);
            // Atualizar a lista de arquivos após exclusão
            if (arquivos) {
                const updatedArquivos = {
                    ...arquivos,
                    arquivos: arquivos.arquivos.filter(arquivo => arquivo.id !== arquivoId),
                    total_arquivos: arquivos.total_arquivos - 1
                };
                setArquivos(updatedArquivos);
            }
            toast.success(`Arquivo "${nomeOriginal}" excluído com sucesso!`, { id: toastId });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro.";

            if (errorMessage.includes("401") || errorMessage.includes("não autorizado")) {
                toast.error("Sessão expirada", {
                    description: "Por favor, faça o login novamente.",
                });
                handleLogout();
                return;
            }

            toast.error(`Falha ao excluir "${nomeOriginal}"`, {
                description: errorMessage,
                id: toastId,
            });
        }
    };

    React.useEffect(() => {
        if (!isOpen) return;

        const fetchAllDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [
                    detailsData,
                    arquivosData,
                    contratadosData,
                    statusData,
                    usuariosData,
                ] = await Promise.all([
                    getContratoDetalhado(contrato.id),
                    getArquivosByContratoId(contrato.id),
                    getContratados({ page: 1, per_page: 100 }),
                    getStatus(),
                    getUsers({ page: 1, per_page: 100 }),
                ]);

                // Converter os dados para os tipos corretos
                setDetailedData(convertToContratoDetalhado(detailsData));
                setArquivos(arquivosData);
                setContratados(contratadosData.data || []);
                setStatusList(statusData || []);
                setUsuarios(usuariosData.data || []);

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";

                if (errorMessage.includes("401") || errorMessage.includes("não autorizado")) {
                    toast.error("Sessão expirada", {
                        description: "Por favor, faça o login novamente.",
                    });
                    handleLogout();
                    return;
                }

                setError(errorMessage);
                toast.error("Falha ao carregar dados do contrato", {
                    description: errorMessage,
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllDetails();
    }, [isOpen, contrato.id, handleLogout]);

    const dataToShow = detailedData || contrato;

    // Status
    const status = detailedData
        ? statusList.find((s) => s.id === detailedData.status_id) ?? {
            nome: detailedData.status_nome ?? "Status não encontrado",
            id: detailedData.status_id
        }
        : {
            nome: dataToShow.status_nome ?? "..."
        };

    // Contratado
    const contratado = detailedData
        ? contratados.find((c) => c.id === detailedData.contratado_id) ?? {
            nome: detailedData.contratado_nome ?? "Contratado não encontrado",
            cnpj: null,
            cpf: null,
            email: "",
            id: detailedData.contratado_id,
            ativo: true
        }
        : {
            nome: dataToShow.contratado_nome ?? "...",
            cnpj: null,
            cpf: null,
            email: "",
            id: 0,
            ativo: true
        };

    // Gestor
    const gestor = detailedData
        ? usuarios.find((u) => u.id === detailedData.gestor_id) ?? {
            nome: detailedData.gestor_nome ?? "Gestor não encontrado",
            id: detailedData.gestor_id,
            perfil: "",
            email: ""
        }
        : {
            nome: "...",
            id: 0,
            perfil: "",
            email: ""
        };

    // Fiscal
    const fiscal = detailedData
        ? usuarios.find((u) => u.id === detailedData.fiscal_id) ?? {
            nome: detailedData.fiscal_nome ?? "Fiscal não encontrado",
            id: detailedData.fiscal_id,
            perfil: "",
            email: ""
        }
        : {
            nome: "...",
            id: 0,
            perfil: "",
            email: ""
        };

    // Fiscal Substituto
    const fiscalSubstituto = detailedData && detailedData.fiscal_substituto_id
        ? usuarios.find((u) => u.id === detailedData.fiscal_substituto_id) ?? {
            nome: detailedData.fiscal_substituto_nome ?? "Fiscal substituto não encontrado",
            id: detailedData.fiscal_substituto_id!,
            perfil: "",
            email: ""
        }
        : null;

    const DetailItem = ({
        label,
        children,
    }: {
        label: string;
        children: React.ReactNode;
    }) => (
        <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <div className="font-medium">{children}</div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="secondary"
                    className="w-full"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    Ver Detalhes
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>
                        Detalhes do Contrato: {dataToShow.nr_contrato}
                    </DialogTitle>
                    <DialogDescription>{dataToShow.objeto}</DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-8 text-center">Carregando detalhes...</div>
                ) : error ? (
                    <div className="py-8 text-center text-red-600">
                        <strong>Erro:</strong> {error}
                    </div>
                ) : (
                    <Tabs defaultValue="geral" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="geral">Dados Gerais</TabsTrigger>
                            <TabsTrigger value="pendencias">Pendências</TabsTrigger>
                            <TabsTrigger value="arquivos">
                                Arquivos {arquivos && arquivos.total_arquivos > 0 && (
                                    <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                                        {arquivos.total_arquivos}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="geral" className="mt-6">
                            <div className="flex flex-col gap-6 text-sm">
                                <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-3">
                                    <DetailItem label="Status">{status.nome}</DetailItem>
                                    <DetailItem label="Valor Anual">
                                        {detailedData ? formatCurrency(detailedData.valor_anual) : "..."}
                                    </DetailItem>
                                    <DetailItem label="Valor Global">
                                        {detailedData ? formatCurrency(detailedData.valor_global) : "..."}
                                    </DetailItem>
                                </div>

                                <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-2">
                                    <DetailItem label="Data Início">
                                        {formatDate(detailedData?.data_inicio)}
                                    </DetailItem>
                                    <DetailItem label="Data Fim">
                                        {formatDate(detailedData?.data_fim || dataToShow.data_fim)}
                                    </DetailItem>
                                </div>

                                <Separator />

                                <h4 className="font-semibold">Contratado</h4>
                                <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-2">
                                    <DetailItem label="Nome">{contratado.nome}</DetailItem>
                                    <DetailItem label="CNPJ/CPF">
                                        {contratado.cnpj
                                            ? formatCnpj(contratado.cnpj)
                                            : formatCpf(contratado.cpf)}
                                    </DetailItem>
                                </div>

                                <Separator />

                                <h4 className="font-semibold">Documentação e Processos</h4>
                                <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-3">
                                    <DetailItem label="Processo (PAE)">
                                        {detailedData?.pae || "N/A"}
                                    </DetailItem>
                                    <DetailItem label="DOE">{detailedData?.doe || "N/A"}</DetailItem>
                                    <DetailItem label="Data DOE">
                                        {formatDate(detailedData?.data_doe)}
                                    </DetailItem>
                                </div>

                                <Separator />

                                <h4 className="font-semibold">Responsáveis</h4>
                                <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-3">
                                    <DetailItem label="Gestor">{gestor.nome}</DetailItem>
                                    <DetailItem label="Fiscal">{fiscal.nome}</DetailItem>
                                    <DetailItem label="Fiscal Substituto">
                                        {fiscalSubstituto?.nome ?? "N/A"}
                                    </DetailItem>
                                </div>

                                {detailedData?.base_legal && (
                                    <>
                                        <Separator />
                                        <div>
                                            <h4 className="font-semibold mb-2">Base Legal</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {detailedData.base_legal}
                                            </p>
                                        </div>
                                    </>
                                )}

                                {detailedData?.termos_contratuais && (
                                    <>
                                        <Separator />
                                        <div>
                                            <h4 className="font-semibold mb-2">Termos Contratuais</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {detailedData.termos_contratuais}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="pendencias" className="mt-6">
                            <PendenciasContrato
                                contratoId={contrato.id}
                                contratoNumero={dataToShow.nr_contrato}
                            />
                        </TabsContent>

                        <TabsContent value="arquivos" className="mt-6">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-foreground">Arquivos do Contrato</h4>
                                    {arquivos && arquivos.total_arquivos > 0 && (
                                        <Badge variant="secondary">
                                            {arquivos.total_arquivos} arquivo{arquivos.total_arquivos !== 1 ? 's' : ''}
                                        </Badge>
                                    )}
                                </div>
                                {arquivos && arquivos.arquivos.length > 0 ? (
                                    <div className="space-y-3">
                                        {arquivos.arquivos.map((arquivo) => {
                                            const formatFileSize = (bytes: number) => {
                                                if (bytes === 0) return '0 Bytes';
                                                const k = 1024;
                                                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                                                const i = Math.floor(Math.log(bytes) / Math.log(k));
                                                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                                            };

                                            const formatDate = (dateString: string) => {
                                                return new Date(dateString).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                });
                                            };

                                            return (
                                                <div key={arquivo.id} className="flex items-center justify-between rounded-md border p-4 hover:bg-muted/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-100">
                                                            <IconDownload className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm">
                                                                {arquivo.nome_arquivo}
                                                            </p>
                                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                                <span>{arquivo.tipo_arquivo}</span>
                                                                <span>{formatFileSize(arquivo.tamanho_bytes)}</span>
                                                                <span>Enviado em {formatDate(arquivo.created_at)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDownloadArquivo(arquivo.id, arquivo.nome_arquivo)}
                                                            className="gap-2"
                                                        >
                                                            <IconDownload className="h-4 w-4" />
                                                            Baixar
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <IconX className="h-4 w-4" />
                                                                    Excluir
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Tem certeza que deseja excluir o arquivo "{arquivo.nome_arquivo}"? Esta ação não pode ser desfeita.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDeleteArquivo(arquivo.id, arquivo.nome_arquivo)}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        Sim, excluir
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="rounded-md border border-dashed p-8 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                                <IconDownload className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <p className="text-sm font-medium">Nenhum arquivo encontrado</p>
                                            <p className="text-xs text-muted-foreground">
                                                Este contrato não possui arquivos anexados.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
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
    );
}