import { useState } from 'react';
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
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRoundPen } from 'lucide-react';

// Mapeamento de perfis (valor da API -> valor exibido)
const profileMapping = {
    'Administrador': 'Administrador',
    'Chefia': 'Coordenação',
    'Procurador': 'Procurador',
    'Assessor': 'Assessor',
    'Estagiario': 'Externo'
} as const;

// Mapeamento inverso (valor exibido -> valor da API)
const reverseProfileMapping = {
    'Administrador': 'Administrador',
    'Coordenação': 'Chefia',
    'Procurador': 'Procurador',
    'Assessor': 'Assessor',
    'Externo': 'Estagiario'
} as const;

type ProfileKey = keyof typeof profileMapping;
type DisplayProfile = typeof profileMapping[ProfileKey];

// Função para obter o valor exibido a partir do valor da API
function getDisplayProfile(apiValue: string): DisplayProfile {
    return profileMapping[apiValue as ProfileKey] || apiValue;
}

// Função para obter o valor da API a partir do valor exibido
function getApiProfile(displayValue: string): string {
    return reverseProfileMapping[displayValue as keyof typeof reverseProfileMapping] || displayValue;
}

// Função para validar CPF
function validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    let sum = 0;
    let remainder;

    // Valida primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpf.substring(i-1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) {
        remainder = 0;
    }
    if (remainder !== parseInt(cpf.substring(9, 10))) {
        return false;
    }

    // Valida segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpf.substring(i-1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) {
        remainder = 0;
    }
    if (remainder !== parseInt(cpf.substring(10, 11))) {
        return false;
    }

    return true;
}

const updateUserSchema = z.object({
    nome: z.string(),
    email: z.string().email(),
    perfil: z.string(),
    senha: z.string().optional(),
    cpf: z
        .string()
        .transform((val) => val.replace(/\D/g, '')) // Remove caracteres não numéricos
        .refine((val) => val.length === 11, { message: "CPF deve conter exatamente 11 números" })
        .refine((val) => validateCPF(val), { message: "CPF inválido" })
});

type UpdateUserForm = z.infer<typeof updateUserSchema>;

interface User {
    id: number;
    nome: string; 
    email: string;
    perfil: string; 
    cpf: string;
}

interface UserEditarProps {
    user: User;
}

function formatCPF(value: string) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function unmaskCPF(value: string) {
    return value.replace(/\D/g, '');
}

export function UserEditar({ user }: UserEditarProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { register, handleSubmit, control, formState: { isSubmitting } } = useForm<UpdateUserForm>({
        resolver: zodResolver(updateUserSchema),
        defaultValues: {
            nome: user.nome,
            email: user.email,
            perfil: user.perfil, // Valor original da API
            cpf: formatCPF(user.cpf || ''),
        },
    });

    async function handleUpdate(data: UpdateUserForm) {
        try {
            const payload = {
                ...data,
                cpf: unmaskCPF(data.cpf),
                // Não precisamos converter o perfil aqui pois já usamos o valor da API
            };
            
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/edit_user/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast.success('Usuário atualizado com sucesso.');
                setIsDialogOpen(false);
                window.location.reload();
            } else {
                const result = await response.json();
                toast.error(result.error || 'Erro ao atualizar usuário.');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Erro ao atualizar usuário, favor tentar novamente.');
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                    <UserRoundPen className="h-4 w-4 text-indigo-700"/> 
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit(handleUpdate)}>
                    <DialogHeader>
                        <DialogTitle>Editar Usuário</DialogTitle>
                        <DialogDescription>
                            Faça as alterações do usuário aqui. Clique em salvar quando terminar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nome" className="text-right">Nome</Label>
                            <Input id="nome" {...register('nome')} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">E-mail</Label>
                            <Input id="email" {...register('email')} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cpf" className="text-right">CPF</Label>
                            <div className="col-span-3">
                                <Controller
                                    name="cpf"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Input
                                                id="cpf"
                                                value={formatCPF(field.value)}
                                                onChange={(e) => {
                                                    const unmasked = unmaskCPF(e.target.value);
                                                    if (unmasked.length <= 11) {
                                                        field.onChange(unmasked);
                                                    }
                                                }}
                                                maxLength={14}
                                                className={`w-full ${fieldState.error ? 'border-red' : ''}`}
                                            />
                                            {fieldState.error && (
                                                <p className="text-red text-sm mt-1">
                                                    {fieldState.error.message}
                                                </p>
                                            )}
                                        </>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="id_perfil" className="text-right">Perfil:</Label>
                            <Controller
                                name="perfil"
                                control={control}
                                defaultValue={user.perfil}
                                render={({ field }) => (
                                    <Select 
                                        onValueChange={(value) => {
                                            // Converte o valor exibido de volta para o valor da API
                                            field.onChange(getApiProfile(value));
                                        }}
                                        value={getDisplayProfile(field.value)} // Exibe o valor traduzido
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Selecione o perfil" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(profileMapping).map(([apiValue, displayValue]) => (
                                                <SelectItem 
                                                    key={apiValue} 
                                                    value={displayValue} // Usamos o valor exibido como value
                                                >
                                                    {displayValue}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="senha" className="text-right">Nova Senha</Label>
                            <Input id="senha" type="password" {...register('senha')} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>Salvar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}