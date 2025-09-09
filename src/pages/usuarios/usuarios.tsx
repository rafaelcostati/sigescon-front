import { useEffect, useState } from "react";
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
import { Edit2, Trash2, Power, LoaderCircle, CirclePlus } from "lucide-react";

//================================================================================
// SECTION: TIPOS E SCHEMAS
//================================================================================

// --- Tipos para a listagem de usuários ---
type ApiUser = {
    id: number;
    nome: string;
    email: string;
    cpf: string;
    perfil_id: number;
    matricula?: string;
};

export type User = {
    id: number;
    nome: string;
    email: string;
    perfil: string;
    ativo: boolean;
    cpf: string;
    matricula?: string; // Adicionado matrícula
};

type Perfil = {
    id: number;
    nome: string;
};

// --- Schema Zod para o formulário de novo usuário ---
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
// SECTION: FUNÇÕES AUXILIARES
//================================================================================

// --- Validação de CPF ---
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

// --- Máscara de CPF ---
const cpfMask = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

// --- Formatação de CPF para exibição ---
function formatCPF(cpf: string): string {
    if (!cpf) return "";
    const numericCPF = cpf.replace(/\D/g, "");
    return numericCPF
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

//================================================================================
// SECTION: COMPONENTE NOVO USUÁRIO (MODAL)
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
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/perfis`);
                    if (!response.ok) throw new Error('Falha ao buscar perfis.');
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
            const payload = {
                ...data,
                perfil_id: parseInt(data.perfil_id, 10),
                cpf: data.cpf.replace(/\D/g, '')
            };
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            if (response.status === 201) {
                toast.success('Usuário cadastrado com sucesso.');
                setIsDialogOpen(false);
                reset();
                onUserAdded(); // Chama a função de atualização da lista
            } else {
                const result = await response.json();
                toast.error(result.error || 'Cadastro inválido.');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Erro ao cadastrar usuário.');
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
                        {/* Fields: Nome, E-mail, CPF, Matrícula, Perfil, Senha */}
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
                            <div className="col-span-3"><Controller name="cpf" control={control} defaultValue="" render={({ field }) => (<Input id="cpf" value={cpfMask(field.value)} onChange={(e) => { const unmasked = e.target.value.replace(/\D/g, ''); if (unmasked.length <= 11) field.onChange(unmasked); }} maxLength={14} /> )}/>{errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="matricula" className="text-right">Matrícula</Label>
                             <div className="col-span-3"><Input id="matricula" {...register('matricula')} />{errors.matricula && <p className="text-red-500 text-sm mt-1">{errors.matricula.message}</p>}</div>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="perfil_id" className="text-right">Perfil</Label>
                            <div className="col-span-3"><Controller name="perfil_id" control={control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Escolha um perfil" /></SelectTrigger><SelectContent>{perfis.map(p => (<SelectItem key={p.id} value={String(p.id)}>{p.nome}</SelectItem>))}</SelectContent></Select> )}/>{errors.perfil_id && <p className="text-red-500 text-sm mt-1">{errors.perfil_id.message}</p>}</div>
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
// SECTION: COMPONENTE PRINCIPAL (LISTAGEM)
//================================================================================
export default function UserCard() {
    const [users, setUsers] = useState<User[]>([]);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchUsersAndPerfis = async () => {
        setLoading(true);
        try {
            const [usersResponse, perfisResponse] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/usuarios`),
                fetch(`${import.meta.env.VITE_API_URL}/perfis`)
            ]);
            if (!usersResponse.ok || !perfisResponse.ok) throw new Error('Falha ao buscar dados.');

            const usersData: ApiUser[] = await usersResponse.json();
            const perfisData: Perfil[] = await perfisResponse.json();
            const perfisMap = new Map(perfisData.map(p => [p.id, p.nome]));

            const mappedUsers: User[] = usersData.map((user) => ({
                id: user.id,
                nome: user.nome,
                email: user.email,
                cpf: user.cpf,
                matricula: user.matricula, // Mapeado matrícula
                perfil: perfisMap.get(user.perfil_id) || "Desconhecido",
                ativo: true,
            }));
            setUsers(mappedUsers);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            toast.error("Não foi possível carregar a lista de usuários.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsersAndPerfis();
    }, []);

    const filteredUsers = users.filter((user) =>
        user.nome.toLowerCase().includes(filter.toLowerCase()) ||
        user.email.toLowerCase().includes(filter.toLowerCase()) ||
        user.cpf.includes(filter)
    );
    
    const toggleAtivo = (id: number) => {
        setUsers((prev) => prev.map((user) => user.id === id ? { ...user, ativo: !user.ativo } : user));
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
            <div className="flex items-center justify-between py-4 gap-4">
                <Input
                    placeholder="Filtrar por nome, e-mail ou CPF..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="max-w-sm"
                />
                <NovoUsuario onUserAdded={fetchUsersAndPerfis} />
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <div key={user.id} className="backdrop-blur-sm bg-white/40 dark:bg-gray-900/40 border border-white/30 dark:border-gray-700/50 rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1">
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1 truncate">{user.nome}</h2>
                                <p className="text-gray-500 dark:text-gray-300 text-sm lowercase truncate">{user.email}</p>
                                <p className="text-gray-500 dark:text-gray-300 text-sm">CPF: {formatCPF(user.cpf)}</p>
                                {user.matricula && (
                                    <p className="text-gray-500 dark:text-gray-300 text-sm">
                                        Matrícula: {user.matricula}
                                    </p>
                                )}
                                <p className="text-gray-500 dark:text-gray-300 text-sm">Perfil: {user.perfil}</p>
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${user.ativo ? "bg-green-100 text-green-700 dark:bg-green-200/30 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-200/30 dark:text-red-300"}`}>
                                    {user.ativo ? "Ativo" : "Inativo"}
                                </span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="p-2 rounded-lg" onClick={() => console.log("Editar:", user)}><Edit2 className="w-5 h-5 text-violet-700" /></Button>
                                    <Button variant="destructive" size="sm" className="p-2 rounded-lg" onClick={() => console.log("Excluir:", user)}><Trash2 className="w-5 h-5" /></Button>
                                    <Button variant="outline" size="sm" className={`p-2 rounded-lg ${user.ativo ? "text-red-700" : "text-green-700"}`} onClick={() => toggleAtivo(user.id)}><Power className="w-5 h-5" /></Button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-500 dark:text-gray-300 py-10">Nenhum usuário encontrado.</p>
                )}
            </div>
        </div>
    );
}