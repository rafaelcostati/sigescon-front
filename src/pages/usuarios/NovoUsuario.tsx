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
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { CirclePlus } from 'lucide-react';

// Função para validar dígitos verificadores do CPF
function validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos ou se é uma sequência de números repetidos
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

const cpfMask = (value: string) => {
    return value
        .replace(/\D/g, '') // Remove tudo que não for número
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const signUpForm = z.object({
    nome: z.string(),
    perfil: z.string(),
    email: z.string().email(),
    senha: z.string(),
    cpf: z
        .string()
        .transform((val) => val.replace(/\D/g, '')) // Remove caracteres não numéricos
        .refine((val) => val.length === 11, { 
            message: "CPF deve conter exatamente 11 números" 
        })
        .refine((val) => validateCPF(val), { 
            message: "CPF inválido (dígitos verificadores incorretos)" 
        })
});

type SignUpForm = z.infer<typeof signUpForm>;

export function NovoUsuario() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, control, formState: { isSubmitting } } = useForm<SignUpForm>({
        resolver: zodResolver(signUpForm),
    });

    async function handleSignUp(data: SignUpForm) {
        try {
            const payload = {
                nome: data.nome,
                perfil: data.perfil,
                email: data.email,
                senha: data.senha,
                cpf: data.cpf.replace(/\D/g, '') // Remove pontos e traços
            };

            const token = localStorage.getItem('token');
            const response = await fetch(import.meta.env.VITE_API_URL + '/create_user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Usuário cadastrado com sucesso.');
                setIsDialogOpen(false);
                navigate('/usuarios');
                window.location.reload();
            } else {
                toast.error(result.error || 'Cadastro inválido, favor verificar todos os campos.');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Erro ao cadastrar usuário, favor tentar novamente.');
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="default" onClick={() => setIsDialogOpen(true)}>
                    <CirclePlus className="h-4 w-4" />
                    <span className="hidden lg:inline">Novo Usuário</span>
                    
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit(handleSignUp)}>
                    <DialogHeader>
                        <DialogTitle>Novo Usuário</DialogTitle>
                        <DialogDescription>
                            Cadastre um novo usuário aqui. Clique em finalizar cadastro quando terminar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nome" className="text-right">
                                Nome
                            </Label>
                            <Input id="nome" {...register('nome')} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                E-mail
                            </Label>
                            <Input id="email" {...register('email')} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cpf" className="text-right">CPF</Label>
                            <div className="col-span-3">
                                <Controller
                                    name="cpf"
                                    control={control}
                                    defaultValue=""
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Input
                                                id="cpf"
                                                value={cpfMask(field.value)}
                                                onChange={(e) => {
                                                    const unmasked = e.target.value.replace(/\D/g, '');
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
                                defaultValue=""
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Escolha uma opção" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Administrador">Administrador</SelectItem>
                                            <SelectItem value="Chefia">Gestor</SelectItem>
                                            <SelectItem value="Procurador">Fiscal</SelectItem>
                                            <SelectItem value="Assessor">Fiscal Substituto</SelectItem>
                                            <SelectItem value="Estagiario">Externo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="senha" className="text-right">
                                Nova Senha
                            </Label>
                            <Input id="senha" type="password" {...register('senha')} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button disabled={isSubmitting} type="submit">Finalizar Cadastro</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}