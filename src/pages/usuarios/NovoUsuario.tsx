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
import { CirclePlus } from 'lucide-react';

// Função para validar dígitos verificadores do CPF (sem alterações)
function validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    let sum = 0;
    let remainder;
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
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

// --- AJUSTE 1: Atualização do Schema Zod ---
const signUpForm = z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("E-mail inválido"),
    senha: z.string().min(1, "Senha é obrigatória"),
    perfil_id: z.string().min(1, "Perfil é obrigatório"), // Alterado de 'perfil' para 'perfil_id'
    cpf: z
        .string()
        .transform((val) => val.replace(/\D/g, ''))
        .refine((val) => val.length === 11, { 
            message: "CPF deve conter 11 números" 
        })
        .refine((val) => validateCPF(val), { 
            message: "CPF inválido" 
        }),
    matricula: z.string().optional(), // Adicionado campo opcional 'matricula'
});

type SignUpForm = z.infer<typeof signUpForm>;

// Interface para os perfis que serão carregados da API
interface Perfil {
    id: number;
    nome: string;
}

export function NovoUsuario() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [perfis, setPerfis] = useState<Perfil[]>([]);

    const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<SignUpForm>({
        resolver: zodResolver(signUpForm),
    });

    // Hook para buscar os perfis da API quando o diálogo for aberto
    useEffect(() => {
        if (isDialogOpen) {
            const fetchPerfis = async () => {
                try {
                    // --- AJUSTE 2: Busca dinâmica dos perfis ---
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/perfis`);
                    if (!response.ok) {
                        throw new Error('Falha ao buscar perfis.');
                    }
                    const data = await response.json();
                    
                    // Mapeia os dados da API para o formato esperado pelo Select
                    const perfisFormatados = data.map((item: any) => ({
                        id: item.id,
                        nome: item.nome 
                    }));

                    setPerfis(perfisFormatados);

                } catch (error) {
                    console.error("Erro ao buscar perfis:", error);
                    toast.error("Não foi possível carregar os perfis de usuário.");
                }
            };
            fetchPerfis();
        }
    }, [isDialogOpen]);


    async function handleSignUp(data: SignUpForm) {
        try {
            // --- AJUSTE 3: Montagem do Payload ---
            const payload = {
                ...data,
                perfil_id: parseInt(data.perfil_id, 10), // Converte perfil_id para integer
                cpf: data.cpf.replace(/\D/g, '') // Garante que o CPF não tenha máscara
            };

            const token = localStorage.getItem('token');
            // --- AJUSTE 4: Correção do Endpoint da API ---
            const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios`, { // Endpoint corrigido
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // A documentação diz que a API está aberta, mas manter o token é uma boa prática para o futuro [cite: 11]
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.status === 201) { // Verifica o status code 201 Created [cite: 15]
                toast.success('Usuário cadastrado com sucesso.');
                setIsDialogOpen(false);
                // Opcional: Adicionar um delay ou usar um método de atualização de dados mais moderno que window.location.reload()
                setTimeout(() => window.location.reload(), 1000); 
            } else {
                const result = await response.json();
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
                    <span className="hidden lg:inline ml-2">Novo Usuário</span>
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
                    {/* --- AJUSTE 5: Estrutura do Formulário e Exibição de Erros --- */}
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
                                <Input id="email" {...register('email')} />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cpf" className="text-right">CPF</Label>
                            <div className="col-span-3">
                                <Controller
                                    name="cpf"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
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
                                        />
                                    )}
                                />
                                {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="matricula" className="text-right">Matrícula</Label>
                             <div className="col-span-3">
                                <Input id="matricula" {...register('matricula')} />
                                {errors.matricula && <p className="text-red-500 text-sm mt-1">{errors.matricula.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="perfil_id" className="text-right">Perfil</Label>
                            <div className="col-span-3">
                                <Controller
                                    name="perfil_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Escolha um perfil" />
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
                                {errors.perfil_id && <p className="text-red-500 text-sm mt-1">{errors.perfil_id.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="senha" className="text-right">Senha</Label>
                            <div className="col-span-3">
                                <Input id="senha" type="password" {...register('senha')} />
                                {errors.senha && <p className="text-red-500 text-sm mt-1">{errors.senha.message}</p>}
                            </div>
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