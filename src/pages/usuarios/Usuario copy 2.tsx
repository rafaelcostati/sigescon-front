import { useEffect, useState, useCallback } from "react";
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
} from "@/components/ui/alert-dialog"
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
import { Trash2, LoaderCircle, CirclePlus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { UserEditar } from '@/pages/usuarios/EditarUsuario';

//================================================================================
// SECTION: TIPOS E SCHEMAS
//================================================================================

// --- Tipos para a listagem de usuários (conforme nova API) ---
export type User = {
    id: number;
    nome: string;
    email: string;
    perfil_nome: string;
    matricula?: string;
};

// --- Tipo para a resposta da API com paginação ---
type ApiResponse = {
    data: User[];
    total_items: number;
    total_pages: number;
    current_page: number;
    per_page: number;
};

type Perfil = {
    id: number;
    nome: string;
};

// --- Schema Zod para o formulário de novo usuário (mantido como estava) ---
const signUpForm = z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("E-mail inválido"),
    senha: z.string().min(1, "Senha é obrigatória"),
    perfil_id: z.string().min(1, "Perfil é obrigatório"),
    cpf: z.string()
        .transform((val) => val.replace(/\D/g, ''))
        .refine((val) => val.length === 11, { message: "CPF deve conter 11 números" })
        .refine((val) => validateCPF(val), { message: "CPF inválido" }),
    matricula: z.string().optional(),
});

type SignUpForm = z.infer<typeof signUpForm>;


//================================================================================
// SECTION: FUNÇÕES AUXILIARES (mantidas como estavam)
//================================================================================

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

const cpfMask = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

//================================================================================
// SECTION: COMPONENTE NOVO USUÁRIO (MODAL - CORRIGIDO)
//================================================================================

function NovoUsuario({ onUserAdded }: { onUserAdded: () => void }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [perfis, setPerfis] = useState<Perfil[]>([]);

    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<SignUpForm>({
        resolver: zodResolver(signUpForm),
    });

    useEffect(() => {
        if (isDialogOpen) {
            const fetchPerfis = async () => {
                try {
                    // CORRIGIDO: Adicionando Authorization header para buscar perfis
                    const token = localStorage.getItem('token');
                    if (!token) {
                        toast.error("Acesso não autorizado. Faça o login novamente.");
                        return;
                    }

                    const response = await fetch(`${import.meta.env.VITE_API_URL}/perfis/`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 401) {
                        toast.error("Sua sessão expirou. Faça o login novamente.");
                        return;
                    }

                    if (!response.ok) {
                        throw new Error('Falha ao buscar perfis da API.');
                    }

                    const data = await response.json();
                    setPerfis(data);
                } catch (error) {
                    console.error("Erro ao buscar perfis:", error);
                    toast.error("Não foi possível carregar os perfis.");
                }
            };
            fetchPerfis();
        }
    }, [isDialogOpen]);

    async function handleSignUp(data: SignUpForm) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Acesso não autorizado. Faça o login novamente.");
                return;
            }

            const payload = {
                ...data,
                perfil_id: parseInt(data.perfil_id, 10),
                cpf: data.cpf.replace(/\D/g, '')
            };

            // CORRIGIDO: Usando fetch com Authorization header para criar o usuário
            const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 401) {
                toast.error("Sua sessão expirou. Faça o login novamente.");
                return;
            }

            if (response.status === 201) {
                toast.success('Usuário cadastrado com sucesso.');
                setIsDialogOpen(false);
                reset();
                onUserAdded();
            } else {
                const result = await response.json();
                const errorMessage = result.detail || result.error || 'Erro ao cadastrar usuário.';
                toast.error(errorMessage);
            }
        } catch (error: any) {
            console.error('Error:', error);
            toast.error('Ocorreu um erro de rede. Tente novamente.');
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="default">
                    <CirclePlus className="h-4 w-4" />
                    <span className="hidden lg:inline ml-2">Novo Usuário</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit(handleSignUp)}>
                    <DialogHeader>
                        <DialogTitle>Novo Usuário</DialogTitle>
                        <DialogDescription>
                            Preencha os campos para cadastrar um novo usuário.
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
                            <div className="col-span-3"><Controller name="cpf" control={control} defaultValue="" render={({ field }) => (<Input id="cpf" value={cpfMask(field.value)} onChange={(e) => { const unmasked = e.target.value.replace(/\D/g, ''); if (unmasked.length <= 11) field.onChange(unmasked); }} maxLength={14} />)} />{errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="matricula" className="text-right">Matrícula</Label>
                            <div className="col-span-3"><Input id="matricula" {...register('matricula')} />{errors.matricula && <p className="text-red-500 text-sm mt-1">{errors.matricula.message}</p>}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="perfil_id" className="text-right">Perfil</Label>
                            <div className="col-span-3"><Controller name="perfil_id" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Escolha um perfil" /></SelectTrigger><SelectContent>{perfis.map(p => (<SelectItem key={p.id} value={String(p.id)}>{p.nome}</SelectItem>))}</SelectContent></Select>)} />{errors.perfil_id && <p className="text-red-500 text-sm mt-1">{errors.perfil_id.message}</p>}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="senha" className="text-right">Senha</Label>
                            <div className="col-span-3"><Input id="senha" type="password" {...register('senha')} />{errors.senha && <p className="text-red-500 text-sm mt-1">{errors.senha.message}</p>}</div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button disabled={isSubmitting} type="submit">
                            {isSubmitting ? 'Salvando...' : 'Finalizar Cadastro'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

//================================================================================
// SECTION: COMPONENTE DE EXCLUSÃO (sem alterações)
//================================================================================
function ExcluirUsuarioDialog({ user, onUserDeleted }: { user: User, onUserDeleted: () => void }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/${user.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.ok) {
                toast.success(`Usuário "${user.nome}" excluído com sucesso.`);
                onUserDeleted();
            } else {
                const result = await response.json();
                toast.error(result.detail || result.error || 'Falha ao excluir usuário.');
            }
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            toast.error('Ocorreu um erro de rede. Tente novamente.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="p-2 h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação irá excluir o usuário <span className="font-bold">{user.nome}</span>. Deseja continuar?
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
// SECTION: COMPONENTE CARD MÓVEL (Atualizado para nova estrutura de User)
//================================================================================

function UserMobileCard({ user, onUserUpdated, onUserDeleted }: { user: User, onUserUpdated: () => void, onUserDeleted: () => void }) {
    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{user.nome}</CardTitle>
                        <CardDescription className="text-sm lowercase truncate">{user.email}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2 text-xs">
                        {user.perfil_nome} {/* <-- ATUALIZADO */}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {/* O CPF foi removido pois não é mais retornado pela API de listagem */}
                {user.matricula && (
                    <div className="text-sm text-muted-foreground">
                        <strong>Matrícula:</strong> {user.matricula}
                    </div>
                )}
                <div className="flex gap-2 pt-3">
                    {/* ATENÇÃO: O componente UserEditar pode precisar ser ajustado se ele depende do CPF vindo da listagem. */}
                    {/* É recomendado que UserEditar busque os dados completos do usuário pelo ID. */}
                    <UserEditar user={user} onUserUpdated={onUserUpdated} />
                    <ExcluirUsuarioDialog user={user} onUserDeleted={onUserDeleted} />
                </div>
            </CardContent>
        </Card>
    );
}

//================================================================================
// SECTION: COMPONENTE PRINCIPAL (LISTAGEM COM DATATABLE) - GRANDES MUDANÇAS
//================================================================================

export default function UserDataTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    // --- NOVOS ESTADOS PARA PAGINAÇÃO ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(10); // Valor padrão

    const fetchUsers = useCallback(async (page = 1, limit = 10, search = "") => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Acesso não autorizado. Faça o login novamente.");
                setLoading(false);
                return;
            }

            // --- Construção da URL com parâmetros de paginação e filtro ---
            const usersUrl = new URL(`${import.meta.env.VITE_API_URL}/usuarios/`);
            usersUrl.searchParams.append('page', String(page));
            usersUrl.searchParams.append('per_page', String(limit));
            if (search) {
                usersUrl.searchParams.append('nome', search);
            }

            const response = await fetch(usersUrl.toString(), {
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

            setUsers(result.data);
            setTotalPages(result.total_pages);
            setCurrentPage(result.current_page);
            setTotalItems(result.total_items);
            setPerPage(result.per_page);

        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            if (!(error instanceof Error && error.message === 'Não autorizado')) {
                toast.error("Não foi possível carregar a lista de usuários.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(currentPage, perPage, searchTerm);
    }, [fetchUsers]); // Apenas na montagem inicial

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setCurrentPage(1); // Reseta para a primeira página ao buscar
        fetchUsers(1, perPage, searchTerm);
    };

    const handleClearFilter = () => {
        setSearchTerm("");
        setCurrentPage(1); // Reseta para a primeira página
        fetchUsers(1, perPage, "");
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            fetchUsers(newPage, perPage, searchTerm);
        }
    };

    const refreshCurrentPage = () => {
        fetchUsers(currentPage, perPage, searchTerm);
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoaderCircle className="w-8 h-8 animate-spin text-gray-500" />
                <p className="ml-2 text-gray-600">Carregando usuários...</p>
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
                <NovoUsuario onUserAdded={refreshCurrentPage} />
            </div>

            {users.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-300">Nenhum usuário encontrado.</p>
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
                                        <TableHead className="font-semibold">Email</TableHead>
                                        <TableHead className="font-semibold hidden lg:table-cell">Matrícula</TableHead>
                                        <TableHead className="font-semibold">Perfil</TableHead>
                                        <TableHead className="font-semibold text-center">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                                            <TableCell className="font-medium">{user.nome}</TableCell>
                                            <TableCell className="text-muted-foreground lowercase">{user.email}</TableCell>
                                            <TableCell className="hidden text-muted-foreground lg:table-cell">
                                                {user.matricula || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-xs">
                                                    {user.perfil_nome} {/* <-- ATUALIZADO */}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    <UserEditar user={user} onUserUpdated={refreshCurrentPage} />
                                                    <ExcluirUsuarioDialog user={user} onUserDeleted={refreshCurrentPage} />
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
                        {users.map((user) => (
                            <UserMobileCard
                                key={user.id}
                                user={user}
                                onUserUpdated={refreshCurrentPage}
                                onUserDeleted={refreshCurrentPage}
                            />
                        ))}
                    </div>

                    {/* --- CONTROLES DE PAGINAÇÃO --- */}
                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="text-sm text-muted-foreground">
                            Total de {totalItems} usuário(s).
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