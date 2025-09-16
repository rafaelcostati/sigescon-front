import { useEffect, useState, useCallback } from "react";
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

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

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Trash2, LoaderCircle, CirclePlus, Pencil, X, ChevronLeft, ChevronRight } from "lucide-react";

//================================================================================
// SECTION: TIPOS E SCHEMAS
//================================================================================

// --- Tipo para o contratado, conforme a API ---
export type Contratado = {
    id: number;
    nome: string;
    email: string;
    cnpj?: string | null;
    cpf?: string | null;
    telefone?: string | null;
};

// --- Tipo para a resposta da API com paginação ---
type ApiResponse = {
    data: Contratado[];
    total_items: number;
    total_pages: number;
    current_page: number;
    per_page: number;
};

// --- Funções de validação ---
function validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let sum = 0;
    for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    return true;
}

function validateCNPJ(cnpj: string): boolean {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    const digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;
    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;
    return true;
}

// --- Schema Zod para o formulário de novo contratado ---
const contratadoSchema = z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("E-mail inválido"),
    telefone: z.string().optional(),
    cpf: z.string()
        .transform((val) => val.replace(/\D/g, ''))
        .optional()
        .refine((val) => !val || val.length === 11, { message: "CPF deve conter 11 números" })
        .refine((val) => !val || validateCPF(val), { message: "CPF inválido" }),
    cnpj: z.string()
        .transform((val) => val.replace(/\D/g, ''))
        .optional()
        .refine((val) => !val || val.length === 14, { message: "CNPJ deve conter 14 números" })
        .refine((val) => !val || validateCNPJ(val), { message: "CNPJ inválido" }),
});

type ContratadoForm = z.infer<typeof contratadoSchema>;

//================================================================================
// SECTION: FUNÇÕES AUXILIARES DE MÁSCARA
//================================================================================

const applyMask = (value: string = '', mask: (v: string) => string) => mask(value);

const cpfMask = (value: string) => value
    .replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

const cnpjMask = (value: string) => value
    .replace(/\D/g, '').slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');

const phoneMask = (value: string) => value
    .replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');

//================================================================================
// SECTION: COMPONENTE DE EDIÇÃO
//================================================================================
interface ContratadoEditarProps {
    contratado: { id: number };
    onContratadoUpdated: () => void;
}

function EditarContratado({ contratado, onContratadoUpdated }: ContratadoEditarProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [originalContratadoData, setOriginalContratadoData] = useState<Partial<Contratado>>({});

    const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<ContratadoForm>({
        resolver: zodResolver(contratadoSchema),
    });

    useEffect(() => {
        if (!isDialogOpen) return;

        const loadContratadoData = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/contratados/${contratado.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Falha ao carregar dados para edição.');

                const data: Contratado = await response.json();
                setOriginalContratadoData(data);
                
                reset({
                    nome: data.nome ?? "",
                    email: data.email ?? "",
                    cpf: data.cpf ?? "",
                    cnpj: data.cnpj ?? "",
                    telefone: data.telefone ?? "",
                });

            } catch (error) {
                console.error("Erro ao carregar dados do contratado:", error);
                toast.error("Não foi possível carregar os dados.");
                setIsDialogOpen(false);
            }
        };

        loadContratadoData();
    }, [isDialogOpen, contratado.id, reset]);

    async function handleUpdate(data: ContratadoForm) {
        const payload: { [key: string]: string | null } = {};

        const numericFields = ['cpf', 'cnpj', 'telefone'];

        Object.keys(data).forEach((key) => {
            const formKey = key as keyof ContratadoForm;
            const formValue = data[formKey];
            const originalValue = originalContratadoData[formKey as keyof Contratado];

            const normalizedFormValue = formValue ?? "";
            const normalizedOriginalValue = originalValue ?? "";

            if (numericFields.includes(formKey)) {
                const cleanFormValue = String(normalizedFormValue).replace(/\D/g, '');
                const cleanOriginalValue = String(normalizedOriginalValue).replace(/\D/g, '');
                
                if (cleanFormValue !== cleanOriginalValue) {
                    payload[formKey] = cleanFormValue === "" ? null : cleanFormValue;
                }
            } else {
                if (String(normalizedFormValue).trim() !== String(normalizedOriginalValue).trim()) {
                    payload[formKey] = normalizedFormValue === "" ? null : String(normalizedFormValue);
                }
            }
        });

        if (Object.keys(payload).length === 0) {
            toast.info("Nenhuma alteração foi feita.");
            setIsDialogOpen(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/contratados/${contratado.id}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast.success('Contratado atualizado com sucesso!');
                setIsDialogOpen(false);
                onContratadoUpdated();
            } else {
                const result = await response.json();
                toast.error(result.error || 'Erro ao atualizar contratado.');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Ocorreu um erro no servidor. Tente novamente.');
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="p-2 rounded-lg">
                    <Pencil className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <form onSubmit={handleSubmit(handleUpdate)}>
                    <DialogHeader>
                        <DialogTitle>Editar Contratado</DialogTitle>
                        <DialogDescription>Altere apenas os campos necessários.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nome" className="text-right">Nome</Label>
                            <div className="col-span-3">
                                <Input id="nome" {...register('nome')} />
                                {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">E-mail</Label>
                            <div className="col-span-3">
                                <Input id="email" type="email" {...register('email')} />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cpf" className="text-right">CPF</Label>
                            <div className="col-span-3">
                                <Controller name="cpf" control={control} render={({ field }) => ( <Input id="cpf" value={applyMask(field.value || '', cpfMask)} onChange={field.onChange} /> )} />
                                {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cnpj" className="text-right">CNPJ</Label>
                            <div className="col-span-3">
                                <Controller name="cnpj" control={control} render={({ field }) => ( <Input id="cnpj" value={applyMask(field.value || '', cnpjMask)} onChange={field.onChange} /> )} />
                                {errors.cnpj && <p className="text-red-500 text-sm mt-1">{errors.cnpj.message}</p>}
                            </div>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="telefone" className="text-right">Telefone</Label>
                            <div className="col-span-3">
                                <Controller name="telefone" control={control} render={({ field }) => ( <Input id="telefone" value={applyMask(field.value || '', phoneMask)} onChange={field.onChange} /> )} />
                                {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone.message}</p>}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button disabled={isSubmitting} type="submit">
                            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

//================================================================================
// SECTION: COMPONENTE NOVO CONTRATADO (MODAL)
//================================================================================

function NovoContratado({ onContratadoAdded }: { onContratadoAdded: () => void }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<ContratadoForm>({
        resolver: zodResolver(contratadoSchema),
    });

    async function handleCriarContratado(data: ContratadoForm) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Acesso não autorizado. Faça o login novamente.");
                return;
            }

            const payload = {
                ...data,
                cpf: data.cpf ? data.cpf.replace(/\D/g, '') : null,
                cnpj: data.cnpj ? data.cnpj.replace(/\D/g, '') : null,
                telefone: data.telefone ? data.telefone.replace(/\D/g, '') : null,
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/contratados`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload),
            });

            if (response.status === 401) {
                toast.error("Sua sessão expirou. Faça o login novamente.");
                return;
            }

            if (response.status === 201) {
                toast.success('Contratado cadastrado com sucesso.');
                setIsDialogOpen(false);
                reset();
                onContratadoAdded();
            } else {
                const result = await response.json();
                toast.error(result.error || 'Cadastro inválido.');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Erro ao cadastrar contratado.');
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="default">
                    <CirclePlus className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Novo Contratado</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <form onSubmit={handleSubmit(handleCriarContratado)}>
                    <DialogHeader>
                        <DialogTitle>Novo Contratado</DialogTitle>
                        <DialogDescription>
                            Preencha os campos para cadastrar uma nova empresa ou pessoa.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nome" className="text-right">Nome</Label>
                            <div className="col-span-3"><Input id="nome" {...register('nome')} />{errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">E-mail</Label>
                            <div className="col-span-3"><Input id="email" {...register('email')} />{errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cpf" className="text-right">CPF</Label>
                            <div className="col-span-3"><Controller name="cpf" control={control} render={({ field }) => (<Input id="cpf" {...field} onChange={e => field.onChange(applyMask(e.target.value, cpfMask))} placeholder="Opcional" />)} />{errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cnpj" className="text-right">CNPJ</Label>
                            <div className="col-span-3"><Controller name="cnpj" control={control} render={({ field }) => (<Input id="cnpj" {...field} onChange={e => field.onChange(applyMask(e.target.value, cnpjMask))} placeholder="Opcional" />)} />{errors.cnpj && <p className="text-red-500 text-sm mt-1">{errors.cnpj.message}</p>}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="telefone" className="text-right">Telefone</Label>
                            <div className="col-span-3"><Controller name="telefone" control={control} render={({ field }) => (<Input id="telefone" {...field} onChange={e => field.onChange(applyMask(e.target.value, phoneMask))} placeholder="Opcional" />)} />{errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone.message}</p>}</div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button disabled={isSubmitting} type="submit">
                            {isSubmitting ? 'Salvando...' : 'Salvar Contratado'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

//================================================================================
// SECTION: COMPONENTE DE EXCLUSÃO
//================================================================================

function ExcluirContratadoDialog({ contratado, onContratadoDeleted }: { contratado: Contratado, onContratadoDeleted: () => void }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/contratados/${contratado.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 204) {
                toast.success(`Contratado "${contratado.nome}" excluído com sucesso.`);
                onContratadoDeleted();
            } else if (response.status === 409) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    try {
                        const result = await response.json();
                        const contratos = result.contratos;
                        if (Array.isArray(contratos) && contratos.length > 0) {
                            const contractList = contratos.map((c: any) => {
                                if (c && typeof c === 'object' && 'nr_contrato' in c) {
                                    return c.nr_contrato;
                                }
                                if (typeof c === 'string') {
                                    return c;
                                }
                                return 'Contrato sem número';
                            }).join(', ');
                            
                            toast.error(result.error || 'Contratado possui vínculos', {
                                description: `Vinculado aos contratos: ${contractList}`,
                                duration: 8000
                            });
                        } else {
                            toast.error(result.error || 'Contratado possui vínculos ativos.');
                        }
                    } catch (jsonError) {
                        console.error('Erro ao fazer parse do JSON:', jsonError);
                        toast.error('Contratado possui vínculos ativos e não pode ser excluído.');
                    }
                } else {
                    toast.error('Contratado possui vínculos ativos e não pode ser excluído.');
                }
            } else if (response.status === 500) {
                console.error('Erro 500 ao excluir contratado');
                toast.error('Erro interno do servidor. Entre em contato com o suporte.', {
                    description: 'O contratado pode possuir vínculos que impedem a exclusão.',
                    duration: 8000
                });
            } else {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    try {
                        const result = await response.json();
                        toast.error(result.error || 'Falha ao excluir contratado.');
                    } catch (jsonError) {
                        toast.error('Falha ao excluir contratado.');
                    }
                } else {
                    toast.error('Falha ao excluir contratado.');
                }
            }
        } catch (error) {
            console.error('Erro ao excluir contratado:', error);
            toast.error('Ocorreu um erro de rede. Tente novamente.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="p-2 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação irá excluir o contratado <span className="font-bold">{contratado.nome}</span>. Deseja continuar?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                        {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

//================================================================================
// SECTION: COMPONENTE CARD MÓVEL
//================================================================================

function ContratadoMobileCard({ contratado, onContratadoUpdated, onContratadoDeleted }: { 
    contratado: Contratado, 
    onContratadoUpdated: () => void, 
    onContratadoDeleted: () => void 
}) {
    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{contratado.nome}</CardTitle>
                        <CardDescription className="text-sm lowercase truncate">{contratado.email}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2 text-xs">
                        {contratado.cpf ? 'CPF' : contratado.cnpj ? 'CNPJ' : 'Contato'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {contratado.cpf && (
                    <div className="text-sm text-muted-foreground">
                        <strong>CPF:</strong> {cpfMask(contratado.cpf)}
                    </div>
                )}
                {contratado.cnpj && (
                    <div className="text-sm text-muted-foreground">
                        <strong>CNPJ:</strong> {cnpjMask(contratado.cnpj)}
                    </div>
                )}
                {contratado.telefone && (
                    <div className="text-sm text-muted-foreground">
                        <strong>Telefone:</strong> {phoneMask(contratado.telefone)}
                    </div>
                )}
                <div className="flex gap-2 pt-3">
                    <EditarContratado contratado={contratado} onContratadoUpdated={onContratadoUpdated} />
                    <ExcluirContratadoDialog contratado={contratado} onContratadoDeleted={onContratadoDeleted} />
                </div>
            </CardContent>
        </Card>
    );
}

//================================================================================
// SECTION: COMPONENTE PRINCIPAL COM PAGINAÇÃO
//================================================================================
export default function Contratados() {
    const [contratados, setContratados] = useState<Contratado[]>([]);
    const [searchTerm, setSearchTerm] = useState(""); 
    const [loading, setLoading] = useState(true);

    // --- NOVOS ESTADOS PARA PAGINAÇÃO ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(10); // Valor padrão

    const fetchContratados = useCallback(async (page = 1, limit = 10, search = "") => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Acesso não autorizado. Faça o login novamente.");
                setLoading(false);
                return;
            }

            // --- Construção da URL com parâmetros de paginação e filtro ---
            const contratadosUrl = new URL(`${import.meta.env.VITE_API_URL}/contratados/`);
            contratadosUrl.searchParams.append('page', String(page));
            contratadosUrl.searchParams.append('per_page', String(limit));
            if (search) {
                contratadosUrl.searchParams.append('nome', search);
            }

            const response = await fetch(contratadosUrl.toString(), {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                toast.error("Sua sessão expirou. Faça o login novamente.");
                throw new Error('Não autorizado');
            }
            if (!response.ok) {
                throw new Error('Falha ao buscar dados da API.');
            }

            // --- Processa a nova estrutura de resposta da API ---
            const result: ApiResponse = await response.json();

            setContratados(result.data);
            setTotalPages(result.total_pages);
            setCurrentPage(result.current_page);
            setTotalItems(result.total_items);
            setPerPage(result.per_page);

        } catch (error) {
            console.error("Erro ao carregar contratados:", error);
            if (!(error instanceof Error && error.message === 'Não autorizado')) {
                toast.error("Não foi possível carregar a lista de contratados.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContratados(currentPage, perPage, searchTerm);
    }, [fetchContratados]); // Apenas na montagem inicial

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setCurrentPage(1); // Reseta para a primeira página ao buscar
        fetchContratados(1, perPage, searchTerm);
    };

    const handleClearFilter = () => {
        setSearchTerm("");
        setCurrentPage(1); // Reseta para a primeira página
        fetchContratados(1, perPage, "");
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            fetchContratados(newPage, perPage, searchTerm);
        }
    };

    const refreshCurrentPage = () => {
        fetchContratados(currentPage, perPage, searchTerm);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoaderCircle className="w-8 h-8 animate-spin text-gray-500" />
                <p className="ml-2 text-gray-600">Carregando contratados...</p>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto p-6">
            {/* Barra de Filtro e Ações */}
            <div className="flex items-center justify-between py-4 gap-4">
                <form onSubmit={handleSearchSubmit} className="flex gap-2 items-center flex-grow">
                    <Input
                        placeholder="Filtrar por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button type="submit">Buscar</Button>
                    {searchTerm && (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleClearFilter}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </form>
                <NovoContratado onContratadoAdded={refreshCurrentPage} />
            </div>

            {contratados.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-300">Nenhum contratado encontrado.</p>
                </div>
            ) : (
                <>
                    {/* DataTable para telas maiores */}
                    <div className="hidden md:block">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="font-semibold">Nome</TableHead>
                                        <TableHead className="font-semibold">E-mail</TableHead>
                                        <TableHead className="font-semibold hidden lg:table-cell">CPF</TableHead>
                                        <TableHead className="font-semibold hidden xl:table-cell">CNPJ</TableHead>
                                        <TableHead className="font-semibold hidden 2xl:table-cell">Telefone</TableHead>
                                        <TableHead className="font-semibold text-center">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contratados.map((contratado, index) => (
                                        <TableRow 
                                            key={contratado.id}
                                            className={`hover:bg-muted/50 transition-colors ${
                                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                            } dark:${index % 2 === 0 ? 'bg-gray-950' : 'bg-gray-900/50'}`}
                                        >
                                            <TableCell className="font-medium truncate max-w-[200px]">
                                                {contratado.nome}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground lowercase truncate max-w-[200px]">
                                                {contratado.email}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm hidden lg:table-cell">
                                                {contratado.cpf ? cpfMask(contratado.cpf) : '-'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm hidden xl:table-cell">
                                                {contratado.cnpj ? cnpjMask(contratado.cnpj) : '-'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm hidden 2xl:table-cell">
                                                {contratado.telefone ? phoneMask(contratado.telefone) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    <EditarContratado 
                                                        contratado={contratado} 
                                                        onContratadoUpdated={refreshCurrentPage} 
                                                    />
                                                    <ExcluirContratadoDialog 
                                                        contratado={contratado} 
                                                        onContratadoDeleted={refreshCurrentPage} 
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Cards para telas menores */}
                    <div className="md:hidden space-y-4">
                        {contratados.map((contratado) => (
                            <ContratadoMobileCard
                                key={contratado.id}
                                contratado={contratado}
                                onContratadoUpdated={refreshCurrentPage}
                                onContratadoDeleted={refreshCurrentPage}
                            />
                        ))}
                    </div>

                    {/* --- CONTROLES DE PAGINAÇÃO --- */}
                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="text-sm text-muted-foreground">
                            Total de {totalItems} contratado(s).
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                                Página {currentPage} de {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                            >
                                Próxima
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}