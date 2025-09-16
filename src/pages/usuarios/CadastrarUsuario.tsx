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

const signUpForm = z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("E-mail inválido"),
    senha: z.string().min(1, "Senha é obrigatória"),
    perfil_id: z.string().min(1, "Perfil é obrigatório"),
    cpf: z
        .string()
        .transform((val) => val.replace(/\D/g, ''))
        .refine((val) => val.length === 11, {
            message: "CPF deve conter 11 números"
        })
        .refine((val) => validateCPF(val), {
            message: "CPF inválido"
        }),
    matricula: z.string().optional(),
});

type SignUpForm = z.infer<typeof signUpForm>;

interface Perfil {
    id: number;
    nome: string;
    ativo: boolean;
}

export function NovoUsuario() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [perfis, setPerfis] = useState<Perfil[]>([]);
    const [loadingPerfis, setLoadingPerfis] = useState(false);

    const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<SignUpForm>({
        resolver: zodResolver(signUpForm),
    });

    // Hook para buscar os perfis da API quando o diálogo for aberto
    useEffect(() => {
        if (isDialogOpen) {
            const fetchPerfis = async () => {
                setLoadingPerfis(true);
                try {
                    const token = localStorage.getItem('token');
                    console.log('=== DEBUG PERFIS ===');
                    console.log('Token presente:', !!token);
                    console.log('Token valor:', token ? `${token.substring(0, 20)}...` : 'null');
                    console.log('API URL:', import.meta.env.VITE_API_URL);
                    console.log('URL completa:', `${import.meta.env.VITE_API_URL}/api/v1/perfis/`);
                    
                    if (!token) {
                        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
                    }

                    // Teste direto no navegador - você pode copiar esta URL e testar
                    console.log('Teste esta URL no Postman/Insomnia com Bearer token:', `${import.meta.env.VITE_API_URL}/api/v1/perfis/`);
                    
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/perfis/`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    
                    console.log('Status da resposta:', response.status);
                    console.log('Headers da resposta:', response.headers);
                    
                    // Log mais detalhado da resposta
                    const responseText = await response.text();
                    console.log('Resposta completa (texto):', responseText);
                    
                    if (response.status === 401) {
                        console.error('Token rejeitado pela API - pode estar expirado');
                        // Não remover o token ainda, vamos investigar
                        throw new Error('Token rejeitado pela API. Verifique se não expirou.');
                    }
                    
                    if (!response.ok) {
                        console.error('Erro HTTP:', response.status, response.statusText);
                        throw new Error(`Erro ${response.status}: ${response.statusText}`);
                    }
                    
                    // Tentar parsear JSON
                    let data;
                    try {
                        data = JSON.parse(responseText);
                    } catch (parseError) {
                        console.error('Erro ao parsear JSON:', parseError);
                        console.error('Texto recebido:', responseText);
                        throw new Error('Resposta não é um JSON válido');
                    }
                    
                    console.log('Perfis carregados (JSON):', data);
                    console.log('Tipo de dados recebidos:', typeof data, Array.isArray(data));
                    console.log('Quantidade de perfis:', Array.isArray(data) ? data.length : 'N/A');
                    
                    // Verifica se data é um array
                    if (!Array.isArray(data)) {
                        console.error('Dados recebidos não são um array:', data);
                        throw new Error('Formato de dados inválido recebido da API');
                    }
                    
                    // Log de cada perfil
                    data.forEach((perfil, index) => {
                        console.log(`Perfil ${index}:`, perfil);
                    });
                    
                    // Filtra apenas perfis ativos
                    const perfisAtivos = data.filter((perfil: Perfil) => perfil.ativo);
                    console.log('Perfis ativos filtrados:', perfisAtivos);
                    console.log('Quantidade de perfis ativos:', perfisAtivos.length);
                    
                    setPerfis(perfisAtivos);
                    console.log('=== FIM DEBUG PERFIS ===');

                } catch (error: any) {
                    console.error("=== ERRO AO BUSCAR PERFIS ===");
                    console.error("Tipo do erro:", typeof error);
                    console.error("Erro completo:", error);
                    console.error("Message:", error.message);
                    console.error("Stack:", error.stack);
                    
                    if (error.message?.includes('Token rejeitado') || error.message?.includes('Token')) {
                        toast.error("Problema com autenticação. Verifique se o token não expirou.");
                    } else {
                        toast.error("Não foi possível carregar os perfis de usuário.");
                    }
                } finally {
                    setLoadingPerfis(false);
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
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.status === 201) {
                toast.success('Usuário cadastrado com sucesso.');
                reset(); // Limpa o formulário
                setIsDialogOpen(false);
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
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
                reset(); // Limpa o formulário quando o diálogo é fechado
            }
        }}>
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
                                                <SelectValue placeholder={
                                                    loadingPerfis 
                                                        ? "Carregando perfis..." 
                                                        : perfis.length === 0 
                                                            ? "Nenhum perfil disponível" 
                                                            : "Escolha um perfil"
                                                } />
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
                        <Button disabled={isSubmitting || loadingPerfis} type="submit">
                            {isSubmitting ? 'Salvando...' : 'Finalizar Cadastro'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}