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
import { Pencil, PlusCircle } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

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
// Schemas e Tipos
// ============================================================================
export const arquivoSchema = z.object({
  id: z.number(),
  nome_arquivo: z.string(),
  data_upload: z.string().optional(),
});
export type Arquivo = z.infer<typeof arquivoSchema>;

export const relatorioSchema = z.object({
  id: z.number(),
  descricao: z.string(),
  data_envio: z.string(),
});
export type Relatorio = z.infer<typeof relatorioSchema>;

export const pendenciaSchema = z.object({
  id: z.number(),
  contrato_id: z.number(),
  descricao: z.string(),
  data_prazo: z.string(),
  status_pendencia_id: z.number(),
  criado_por_usuario_id: z.number(),
  status_nome: z.string().optional(),
  criado_por_nome: z.string().optional(),
});
export type Pendencia = z.infer<typeof pendenciaSchema>;

export const contratoSchema = z.object({
  id: z.number(),
  nr_contrato: z.string(),
  objeto: z.string(),
  valor_anual: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().nullable(),
  ),
  valor_global: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().nullable(),
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
    z.string().nullable(),
  ),
  created_at: z.string(),
  updated_at: z.string(),
});

export const contratoDetalhadoSchema = contratoSchema.extend({
  arquivos: z.array(arquivoSchema).optional(),
  relatorios: z.array(relatorioSchema).optional(),
  pendencias: z.array(pendenciaSchema).optional(),
});
export type ContratoDetalhado = z.infer<typeof contratoDetalhadoSchema>;

type Contrato = z.infer<typeof contratoSchema> & {
  modalidade_nome?: string;
  contratado_nome?: string;
  status_nome?: string;
};
type ContratadoInfo = { id: number; nome: string; cnpj: string; cpf: string };
type StatusInfo = { id: number; nome: string };
type UsuarioInfo = { id: number; nome: string; perfil: string };
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
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded: { sub: string } = jwtDecode(token);
    return parseInt(decoded.sub, 10);
  } catch (error) {
    console.error("Failed to decode token:", error);
    toast.error("Sessão inválida ou expirada. Faça login novamente.");
    return null;
  }
};

// ============================================================================
// Componentes
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
  const [objeto, setObjeto] = React.useState(
    (table.getColumn("objeto")?.getFilterValue() as string) ?? "",
  );
  const [nrContrato, setNrContrato] = React.useState(
    (table.getColumn("nr_contrato")?.getFilterValue() as string) ?? "",
  );
  const [pae, setPae] = React.useState(
    (table.getColumn("pae")?.getFilterValue() as string) ?? "",
  );
  const [ano, setAno] = React.useState(
    (table.getColumn("ano")?.getFilterValue() as string) ?? "",
  );
  const [statusId, setStatusId] = React.useState(
    (table.getColumn("status_id")?.getFilterValue() as string) ?? "",
  );
  const [gestorId, setGestorId] = React.useState(
    (table.getColumn("gestor_id")?.getFilterValue() as string) ?? "",
  );
  const [fiscalId, setFiscalId] = React.useState(
    (table.getColumn("fiscal_id")?.getFilterValue() as string) ?? "",
  );

  const handleApplyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    table.getColumn("objeto")?.setFilterValue(objeto || null);
    table.getColumn("nr_contrato")?.setFilterValue(nrContrato || null);
    table.getColumn("pae")?.setFilterValue(pae || null);
    table.getColumn("ano")?.setFilterValue(ano || null);
    table
      .getColumn("status_id")
      ?.setFilterValue(statusId === "all" ? null : statusId || null);
    table
      .getColumn("gestor_id")
      ?.setFilterValue(gestorId === "all" ? null : gestorId || null);
    table
      .getColumn("fiscal_id")
      ?.setFilterValue(fiscalId === "all" ? null : fiscalId || null);
  };

  const handleClearFilters = () => {
    setObjeto("");
    setNrContrato("");
    setPae("");
    setAno("");
    setStatusId("");
    setGestorId("");
    setFiscalId("");
    table.resetColumnFilters();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros de Contratos</CardTitle>
        <CardDescription>
          Utilize os campos abaixo para refinar sua busca.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleApplyFilters} className="p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="nrContrato">Número do Contrato</Label>
            <Input
              id="nrContrato"
              placeholder="Ex: 99/2025"
              value={nrContrato}
              onChange={(e) => setNrContrato(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="objeto">Objeto do Contrato</Label>
            <Input
              id="objeto"
              placeholder="Pesquisar no objeto..."
              value={objeto}
              onChange={(e) => setObjeto(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pae">Nº (PAE)</Label>
            <Input
              id="pae"
              placeholder="Ex: 2025/123456"
              value={pae}
              onChange={(e) => setPae(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ano">Ano Início</Label>
            <Input
              id="ano"
              type="number"
              placeholder="Ex: 2024"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={statusId} onValueChange={setStatusId}>
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
          <div className="space-y-1.5">
            <Label>Gestor</Label>
            <Select value={gestorId} onValueChange={setGestorId}>
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
            <Select value={fiscalId} onValueChange={setFiscalId}>
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
        description:
          "Não foi possível identificar o usuário. Faça o login novamente.",
      });
      return;
    }
    setIsSubmitting(true);
    const toastId = toast.loading("Criando pendência...");
    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl || !token)
        throw new Error("Configuração ou autenticação ausente.");
      const requestBody = {
        descricao: descricao.trim(),
        data_prazo: dataPrazo,
        status_pendencia_id: 1,
        criado_por_usuario_id: adminId,
      };
      const response = await fetch(
        `${apiUrl}/contratos/${contratoId}/pendencias/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );
      if (response.status === 201) {
        toast.success("Pendência criada com sucesso!", { id: toastId });
        onPendenciaCriada();
        setDescricao("");
        setDataPrazo("");
        setIsOpen(false);
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.detail ||
            `Falha ao criar pendência. Status: ${response.status}`,
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      toast.error("Erro ao criar pendência", {
        description: errorMessage,
        id: toastId,
      });
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
              placeholder="Ex: Relatório do 1º trimestre"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
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

function DraggableContratoCard({
  contrato,
  onContratoDeleted,
}: {
  contrato: Contrato;
  onContratoDeleted: (id: number) => void;
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: contrato.id as UniqueIdentifier,
  });
  const navigate = useNavigate();

  const handleEditClick = () => navigate(`/contratos/editar/${contrato.id}`);

  const handleDeleteContrato = async () => {
    const toastId = toast.loading("Excluindo contrato...");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Acesso não autorizado.");
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) throw new Error("VITE_API_URL não está configurada.");

      const response = await fetch(`${apiUrl}/contratos/${contrato.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 204) {
        toast.success("Contrato excluído com sucesso!", { id: toastId });
        onContratoDeleted(contrato.id);
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `Falha ao excluir. Status: ${response.status}`,
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      toast.error("Erro ao excluir", {
        description: errorMessage,
        id: toastId,
      });
    }
  };

  const getStatusIcon = (statusName: string) => {
    if (statusName?.toLowerCase().includes("vencido"))
      return <IconExclamationCircle className="text-gray-500" />;
    if (statusName?.toLowerCase().includes("ativo"))
      return <IconCircleCheckFilled className="text-green-500" />;
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
          <CardDescription className="line-clamp-2">
            {contrato.objeto}
          </CardDescription>
        </div>
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground"
              >
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={handleEditClick}
                className="flex cursor-pointer items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
              <CriarPendenciaDialog
                contratoId={contrato.id}
                contratoNumero={contrato.nr_contrato}
                onPendenciaCriada={() => {}}
              >
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Criar Pendência</span>
                </DropdownMenuItem>
              </CriarPendenciaDialog>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="flex cursor-pointer items-center gap-2 text-red-600 focus:text-red-600"
                  onSelect={(e) => e.preventDefault()}
                >
                  <IconX className="h-4 w-4" />
                  <span>Excluir</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação excluirá permanentemente o contrato "
                {contrato.nr_contrato}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteContrato}
                className="bg-red-600 hover:bg-red-700"
              >
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
              {getStatusIcon(contrato.status_nome || "")}
              {contrato.status_nome || "Não informado"}
            </Badge>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Contratado</Label>
            <p className="font-medium">
              {contrato.contratado_nome || "Não informado"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Vigência</Label>
            <p className="whitespace-nowrap font-medium">
              {formatDate(contrato.data_inicio)} a{" "}
              {formatDate(contrato.data_fim)}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <ContratoDetailsViewer contrato={contrato} />
      </CardFooter>
    </Card>
  );
}

const columns: ColumnDef<Contrato>[] = [
  { accessorKey: "objeto" },
  { accessorKey: "nr_contrato" },
  { accessorKey: "pae" },
  { accessorKey: "ano" },
  { accessorKey: "status_id" },
  { accessorKey: "gestor_id" },
  { accessorKey: "fiscal_id" },
  { accessorKey: "data_inicio" },
  { accessorKey: "data_fim" },
];

export function ContratosDataTable() {
  const [contratos, setContratos] = React.useState<Contrato[]>([]);
  const [contratados, setContratados] = React.useState<ContratadoInfo[]>([]);
  const [statusList, setStatusList] = React.useState<StatusInfo[]>([]);
  const [usuarios, setUsuarios] = React.useState<UsuarioInfo[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "data_fim", desc: true },
  ]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 9,
  });
  const [paginationMeta, setPaginationMeta] =
    React.useState<PaginationMeta | null>(null);

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );
  
  // ✅ HOOK PARA NAVEGAÇÃO
  const navigate = useNavigate();

  // ✅ FUNÇÃO REUTILIZÁVEL PARA LOGOUT
  const handleLogout = React.useCallback(() => {
    toast.error("Sessão expirada", {
      description: "Por favor, faça o login novamente.",
    });
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }, [navigate]);

  React.useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
            handleLogout();
            return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!apiUrl) throw new Error("VITE_API_URL não configurada.");

        const responses = await Promise.all([
          fetch(`${apiUrl}/contratados`, { headers }),
          fetch(`${apiUrl}/status`, { headers }),
          fetch(`${apiUrl}/usuarios`, { headers }),
        ]);
        
        for (const res of responses) {
            if (res.status === 401) {
                handleLogout();
                return;
            }
            if (!res.ok) throw new Error("Falha ao carregar dados de suporte.");
        }

        const [contratadosData, statusData, usuariosData] = await Promise.all(responses.map(res => res.json()));

        setContratados(contratadosData.data || []);
        setStatusList(statusData.data || []);
        setUsuarios(usuariosData.data || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
        setError(errorMessage);
        toast.error("Erro ao carregar dados de suporte: " + errorMessage);
      }
    };
    fetchInitialData();
  }, [handleLogout]);

  React.useEffect(() => {
    const fetchContratos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
            handleLogout();
            return;
        }
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!apiUrl) throw new Error("VITE_API_URL não está configurada.");

        const params = new URLSearchParams();
        params.append("page", String(pagination.pageIndex + 1));
        params.append("per_page", String(pagination.pageSize));

        columnFilters.forEach((filter) => {
          if (filter.value) {
            params.append(filter.id, String(filter.value));
          }
        });

        const res = await fetch(`${apiUrl}/contratos?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
            handleLogout();
            return;
        }
        if (!res.ok) {
          throw new Error(`Falha ao buscar contratos: ${res.statusText}`);
        }

        const data = await res.json();

        setContratos(data.data || []);
        setPaginationMeta({
          total_items: data.total_items,
          total_pages: data.total_pages,
          current_page: data.current_page,
          per_page: data.per_page,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
        setError(errorMessage);
        toast.error("Erro ao carregar contratos: " + errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (contratados.length > 0 && statusList.length > 0 && usuarios.length > 0) {
      fetchContratos();
    } else if (!isLoading) {
        // Se os dados iniciais não carregaram (possivelmente por erro), paramos o loading
        setIsLoading(false);
    }
  }, [columnFilters, pagination, sorting, contratados, statusList, usuarios, handleLogout]);

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
      />
      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">Todos os Contratos</TabsTrigger>
          </TabsList>
          <NavLink to="/novocontrato">
            <Button variant="default" size="sm" className="gap-2">
              <IconPlus className="h-4 w-4" />
              <span className="hidden lg:inline">Novo Contrato</span>
            </Button>
          </NavLink>
        </div>
        <TabsContent value="all" className="relative mt-4 flex flex-col gap-4">
          {isLoading ? (
            <div className="py-8 text-center">Carregando...</div>
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
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {table.getRowModel().rows.map((row) => (
                        <DraggableContratoCard
                          key={row.original.id}
                          contrato={row.original}
                          onContratoDeleted={handleContratoDeleted}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-60 items-center justify-center rounded-lg border border-dashed">
                      <div className="text-center">
                        <h3 className="mt-4 text-lg font-semibold">
                          Nenhum contrato encontrado
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Tente limpar os filtros ou cadastre um novo contrato.
                        </p>
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
                        {[9, 12, 24, 48].map((pageSize) => (
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

function ContratoDetailsViewer({ contrato }: { contrato: Contrato }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [detailedData, setDetailedData] =
    React.useState<ContratoDetalhado | null>(null);
  const [pendencias, setPendencias] = React.useState<Pendencia[]>([]);
  const [relatorios, setRelatorios] = React.useState<Relatorio[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const [contratados, setContratados] = React.useState<ContratadoInfo[]>([]);
  const [statusList, setStatusList] = React.useState<StatusInfo[]>([]);
  const [usuarios, setUsuarios] = React.useState<UsuarioInfo[]>([]);
  
  const navigate = useNavigate();
  const handleLogout = React.useCallback(() => {
    toast.error("Sessão expirada", {
      description: "Por favor, faça o login novamente.",
    });
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }, [navigate]);

  const handleDownloadArquivo = async (
    arquivoId: number,
    nomeOriginal: string,
  ) => {
    const toastId = toast.loading(`Baixando "${nomeOriginal}"...`);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
          handleLogout();
          return;
      }
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) throw new Error("VITE_API_URL não configurada.");

      const response = await fetch(`${apiUrl}/arquivos/${arquivoId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
          handleLogout();
          return;
      }
      if (!response.ok)
        throw new Error(`Erro no servidor: ${response.statusText}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nomeOriginal;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Download de "${nomeOriginal}" concluído!`, {
        id: toastId,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ocorreu um erro.";
      toast.error(`Falha no download de "${nomeOriginal}"`, {
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
        const token = localStorage.getItem("token");
        if (!token) {
            handleLogout();
            return;
        }
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!apiUrl) throw new Error("VITE_API_URL não configurada.");
        const headers = { Authorization: `Bearer ${token}` };

        const responses = await Promise.all([
          fetch(`${apiUrl}/contratos/${contrato.id}`, { headers }),
          fetch(`${apiUrl}/contratos/${contrato.id}/pendencias/`, { headers }),
          fetch(`${apiUrl}/contratos/${contrato.id}/relatorios/`, { headers }),
          fetch(`${apiUrl}/contratados`, { headers }),
          fetch(`${apiUrl}/status`, { headers }),
          fetch(`${apiUrl}/usuarios`, { headers }),
        ]);

        for (const res of responses) {
            if (res.status === 401) {
                handleLogout();
                return;
            }
            if (!res.ok) throw new Error("Erro ao buscar dados para o modal.");
        }

        const [
            detailsData,
            pendenciasData,
            relatoriosData,
            contratadosData,
            statusData,
            usuariosData,
        ] = await Promise.all(responses.map(res => res.json()));

        setDetailedData(contratoDetalhadoSchema.parse(detailsData));
        setPendencias(z.array(pendenciaSchema).parse(pendenciasData.data || []));
        setRelatorios(z.array(relatorioSchema).parse(relatoriosData.data || []));
        setContratados(contratadosData.data || []);
        setStatusList(statusData.data || []);
        setUsuarios(usuariosData.data || []);

      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
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
  const status = statusList.find((s) => s.id === dataToShow.status_id) || { nome: "..." };
  const contratado = contratados.find((c) => c.id === dataToShow.contratado_id) || { nome: "...", cnpj: "", cpf: "" };
  const gestor = usuarios.find((u) => u.id === dataToShow.gestor_id) || { nome: "..." };
  const fiscal = usuarios.find((u) => u.id === dataToShow.fiscal_id) || { nome: "..." };
  const fiscalSubstituto = usuarios.find((u) => u.id === dataToShow.fiscal_substituto_id) || null;

  const DetailItem = ({ label, children, }: { label: string; children: React.ReactNode; }) => (
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
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
          <div className="flex flex-col gap-6 py-4 text-sm">
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-3">
              <DetailItem label="Status">{status.nome}</DetailItem>
              <DetailItem label="Valor Anual">
                {formatCurrency(dataToShow.valor_anual)}
              </DetailItem>
              <DetailItem label="Valor Global">
                {formatCurrency(dataToShow.valor_global)}
              </DetailItem>
              <DetailItem label="Vigência">{`${formatDate(
                dataToShow.data_inicio,
              )} a ${formatDate(dataToShow.data_fim)}`}</DetailItem>
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
                {dataToShow.pae || "N/A"}
              </DetailItem>
              <DetailItem label="DOE">{dataToShow.doe || "N/A"}</DetailItem>
              <DetailItem label="Data DOE">
                {formatDate(dataToShow.data_doe)}
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
            <Separator />
            <div>
              <h4 className="mb-2 font-semibold text-foreground">Arquivos</h4>
              {detailedData?.arquivos && detailedData.arquivos.length > 0 ? (
                <ul className="space-y-2">
                  {detailedData.arquivos.map((arq) => (
                    <li
                      key={arq.id}
                      className="flex items-center justify-between rounded-md bg-muted/50 p-2 hover:bg-muted"
                    >
                      <span className="text-muted-foreground">
                        {arq.nome_arquivo}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDownloadArquivo(arq.id, arq.nome_arquivo)
                        }
                        className="gap-2"
                      >
                        <IconDownload className="h-4 w-4" />
                        Baixar
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">
                  Nenhum arquivo encontrado.
                </p>
              )}
            </div>
            <Separator />
            <div>
              <h4 className="mb-2 font-semibold text-foreground">Pendências</h4>
              {pendencias.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                  {pendencias.map((pend) => (
                    <li key={pend.id}>
                      {pend.descricao} (Prazo: {formatDate(pend.data_prazo)}) -{" "}
                      <span className="font-bold">{pend.status_nome}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">
                  Nenhuma pendência encontrada.
                </p>
              )}
            </div>
            <Separator />
            <div>
              <h4 className="mb-2 font-semibold text-foreground">Relatórios</h4>
              {relatorios.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                  {relatorios.map((rel) => (
                    <li key={rel.id}>
                      {rel.descricao} - Enviado em: {formatDate(rel.data_envio)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">
                  Nenhum relatório associado.
                </p>
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
  );
}