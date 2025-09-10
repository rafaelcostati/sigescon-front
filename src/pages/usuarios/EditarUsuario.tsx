import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { UserRoundPen } from 'lucide-react';

// --- Funções auxiliares para CPF ---
function validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let sum = 0, remainder;
    for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder >= 10) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if (remainder >= 10) remainder = 0;
    return remainder === parseInt(cpf.substring(10, 11));
}
const cpfMask = (value: string = '') =>
    value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

// --- Schema do formulário (senha opcional) ---
const editUserFormSchema = z.object({
    nome: z.string().min(1, "O nome não pode ficar em branco").optional(),
    email: z.string().email("Formato de e-mail inválido").optional(),
    perfil_id: z.string().optional(),
    senha: z.union([
        z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
        z.literal("")
    ]).optional(),
    cpf: z.string().transform((val) => val.replace(/\D/g, ''))
        .refine((val) => val.length === 11, { message: "CPF deve conter 11 dígitos" })
        .refine((val) => validateCPF(val), { message: "CPF inválido" })
        .optional(),
    matricula: z.string().optional(),
});
type EditUserForm = z.infer<typeof editUserFormSchema>;

interface Perfil {
    id: number;
    nome: string;
}
interface UserData {
    id: number;
    nome: string;
    email: string;
    cpf: string;
    matricula?: string;
    perfil_id: number;
}
interface UserEditarProps {
    user: { id: number };
    onUserUpdated: () => void;
}

export function UserEditar({ user, onUserUpdated }: UserEditarProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [perfis, setPerfis] = useState<Perfil[]>([]);
    const [originalUserData, setOriginalUserData] = useState<Partial<UserData>>({});

    const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<EditUserForm>({
        resolver: zodResolver(editUserFormSchema),
    });

    // --- Carregar dados do usuário + perfis ---
    useEffect(() => {
        if (!isDialogOpen) return;

        const loadDataForEdit = async () => {
            const token = localStorage.getItem('token');
            try {
                const [perfisResponse, userResponse] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/perfis`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${import.meta.env.VITE_API_URL}/usuarios/${user.id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (!perfisResponse.ok || !userResponse.ok) {
                    throw new Error('Falha ao carregar dados para edição.');
                }

                const perfisData: Perfil[] = await perfisResponse.json();
                const userData: UserData = await userResponse.json();

                setPerfis(perfisData);
                setOriginalUserData(userData); // 👈 apenas seta os dados
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                toast.error("Não foi possível carregar os dados do usuário.");
                setIsDialogOpen(false);
            }
        };

        loadDataForEdit();
    }, [isDialogOpen, user.id]);

    // --- Garante reset assim que originalUserData mudar ---
    useEffect(() => {
        if (originalUserData && Object.keys(originalUserData).length > 0) {
            reset({
                nome: originalUserData.nome ?? "",
                email: originalUserData.email ?? "",
                cpf: originalUserData.cpf ?? "",
                matricula: originalUserData.matricula ?? "",
                perfil_id: String(originalUserData.perfil_id ?? ""),
                senha: "", // senha sempre vazia
            });
        }
    }, [originalUserData, reset]);

    // --- Enviar PATCH apenas dos campos alterados ---
    async function handleUpdate(data: EditUserForm) {
        const changedFields: Partial<EditUserForm> = {};

        for (const key in data) {
            const formKey = key as keyof EditUserForm;
            const value = data[formKey];

            if (formKey === "senha") {
                if (data.senha && data.senha.trim() !== "") {
                    changedFields.senha = data.senha;
                }
                continue;
            }

            if (
                value !== undefined &&
                String(value) !== String(originalUserData[formKey as keyof UserData] ?? "")
            ) {
                changedFields[formKey] = value;
            }
        }

        if (Object.keys(changedFields).length === 0) {
            toast.info("Nenhuma alteração foi feita.");
            return;
        }

        const payload: { [key: string]: any } = { ...changedFields };
        if (payload.perfil_id) {
            payload.perfil_id = parseInt(payload.perfil_id, 10);
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast.success('Usuário atualizado com sucesso!');
                setIsDialogOpen(false);
                onUserUpdated();
            } else {
                const result = await response.json();
                toast.error(result.error || 'Erro ao atualizar usuário.');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Ocorreu um erro no servidor. Tente novamente.');
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <UserRoundPen className="h-4 w-4 text-indigo-700" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleSubmit(handleUpdate)}>
                    <DialogHeader>
                        <DialogTitle>Editar Usuário</DialogTitle>
                        <DialogDescription>
                            Altere apenas os campos necessários. Clique em salvar para confirmar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Nome */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nome" className="text-right">Nome</Label>
                            <div className="col-span-3">
                                <Input id="nome" {...register('nome')} />
                                {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
                            </div>
                        </div>
                        {/* Email */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">E-mail</Label>
                            <div className="col-span-3">
                                <Input id="email" type="email" {...register('email')} />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>
                        </div>
                        {/* CPF */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cpf" className="text-right">CPF</Label>
                            <div className="col-span-3">
                                <Controller
                                    name="cpf"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            id="cpf"
                                            value={cpfMask(field.value)}
                                            onChange={(e) => {
                                                const unmasked = e.target.value.replace(/\D/g, '');
                                                if (unmasked.length <= 11) field.onChange(unmasked);
                                            }}
                                            maxLength={14}
                                        />
                                    )}
                                />
                                {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>}
                            </div>
                        </div>
                        {/* Matrícula */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="matricula" className="text-right">Matrícula</Label>
                            <div className="col-span-3">
                                <Input id="matricula" {...register('matricula')} />
                            </div>
                        </div>
                        {/* Perfil */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="perfil_id" className="text-right">Perfil</Label>
                            <div className="col-span-3">
                                <Controller
                                    name="perfil_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um perfil" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {perfis.map(perfil => (
                                                    <SelectItem key={perfil.id} value={String(perfil.id)}>
                                                        {perfil.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                        {/* Senha opcional */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="senha" className="text-right">Nova Senha</Label>
                            <div className="col-span-3">
                                <Input
                                    id="senha"
                                    type="password"
                                    placeholder="Deixe em branco para não alterar"
                                    {...register('senha')}
                                />
                                {errors.senha && <p className="text-red-500 text-sm mt-1">{errors.senha.message}</p>}
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
