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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { CirclePlus, X, Users, Shield } from 'lucide-react';
import { 
    getAllPerfis, 
    createUser, 
    grantProfilesToUser, 
    type Perfil,
    type UsuarioPerfilGrantRequest 
} from '@/lib/api';

// Função para validar dígitos verificadores do CPF
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

// Schema atualizado para múltiplos perfis
const signUpForm = z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("E-mail inválido"),
    senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
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
    perfis: z.array(z.number()).min(1, "Selecione pelo menos um perfil"),
});

type SignUpForm = z.infer<typeof signUpForm>;

const getPerfilColor = (nome: string) => {
    switch (nome) {
        case 'Administrador': return 'bg-red-500 hover:bg-red-600';
        case 'Gestor': return 'bg-blue-500 hover:bg-blue-600';
        case 'Fiscal': return 'bg-green-500 hover:bg-green-600';
        default: return 'bg-gray-500 hover:bg-gray-600';
    }
};

export function NovoUsuarioMultiPerfil() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [perfis, setPerfis] = useState<Perfil[]>([]);
    const [loadingPerfis, setLoadingPerfis] = useState(false);
    const [selectedPerfis, setSelectedPerfis] = useState<number[]>([]);

    const { register, handleSubmit, control, reset, formState: { errors, isSubmitting }, setValue } = useForm<SignUpForm>({
        resolver: zodResolver(signUpForm),
        defaultValues: {
            perfis: []
        }
    });

    // Buscar perfis quando o diálogo abrir
    useEffect(() => {
        if (isDialogOpen) {
            const fetchPerfis = async () => {
                setLoadingPerfis(true);
                try {
                    const data = await getAllPerfis();
                    const perfisAtivos = data.filter((perfil: any) => perfil.ativo);
                    setPerfis(perfisAtivos);
                } catch (error) {
                    console.error("Erro ao buscar perfis:", error);
                    toast.error("Não foi possível carregar os perfis de usuário.");
                } finally {
                    setLoadingPerfis(false);
                }
            };
            fetchPerfis();
        }
    }, [isDialogOpen]);

    const handlePerfilToggle = (perfilId: number) => {
        const newSelectedPerfis = selectedPerfis.includes(perfilId)
            ? selectedPerfis.filter(id => id !== perfilId)
            : [...selectedPerfis, perfilId];
        
        setSelectedPerfis(newSelectedPerfis);
        setValue('perfis', newSelectedPerfis);
    };

    const removePerfil = (perfilId: number) => {
        const newSelectedPerfis = selectedPerfis.filter(id => id !== perfilId);
        setSelectedPerfis(newSelectedPerfis);
        setValue('perfis', newSelectedPerfis);
    };

    async function handleSignUp(data: SignUpForm) {
        try {
            console.log('🚀 Iniciando cadastro de usuário com múltiplos perfis...');
            console.log('📋 Dados do formulário:', data);

            // Primeiro, criar o usuário básico com o primeiro perfil selecionado
            // A API exige perfil_id, então usamos o primeiro perfil selecionado
            const usuarioPayload = {
                nome: data.nome,
                email: data.email,
                senha: data.senha,
                cpf: data.cpf.replace(/\D/g, ''),
                matricula: data.matricula || '',
                perfil_id: data.perfis[0], // Usar o primeiro perfil selecionado
            };

            console.log('👤 Criando usuário com perfil inicial:', usuarioPayload);
            const novoUsuario = await createUser(usuarioPayload);
            console.log('✅ Usuário criado com sucesso:', novoUsuario);

            // Em seguida, conceder os perfis adicionais (se houver mais de um)
            if (data.perfis.length > 1) {
                // Conceder apenas os perfis adicionais (excluindo o primeiro que já foi usado na criação)
                const perfisAdicionais = data.perfis.slice(1);
                const perfilRequest: UsuarioPerfilGrantRequest = {
                    perfil_ids: perfisAdicionais,
                    observacoes: `Perfis adicionais concedidos durante o cadastro inicial do usuário`
                };

                console.log('🔐 Concedendo perfis adicionais:', perfilRequest);
                await grantProfilesToUser(novoUsuario.id, perfilRequest);
                console.log('✅ Perfis adicionais concedidos com sucesso');
            } else {
                console.log('ℹ️ Apenas um perfil selecionado, não há perfis adicionais para conceder');
            }

            toast.success('Usuário cadastrado com sucesso com múltiplos perfis!');
            reset();
            setSelectedPerfis([]);
            setIsDialogOpen(false);
            
            // Recarregar a página após um pequeno delay
            setTimeout(() => window.location.reload(), 1000);

        } catch (error: any) {
            console.error('❌ Erro ao cadastrar usuário:', error);
            
            if (error.message?.includes('perfis ativos')) {
                toast.error('Erro: O usuário precisa ter pelo menos um perfil ativo. Verifique os perfis selecionados.');
            } else if (error.message?.includes('email')) {
                toast.error('Este e-mail já está em uso por outro usuário.');
            } else if (error.message?.includes('cpf')) {
                toast.error('Este CPF já está em uso por outro usuário.');
            } else {
                toast.error('Erro ao cadastrar usuário. Verifique os dados e tente novamente.');
            }
        }
    }

    const resetForm = () => {
        reset();
        setSelectedPerfis([]);
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
                resetForm();
            }
        }}>
            <DialogTrigger asChild>
                <Button variant="default" onClick={() => setIsDialogOpen(true)}>
                    <CirclePlus className="h-4 w-4" />
                    <span className="hidden lg:inline ml-2">Novo Usuário</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit(handleSignUp)}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Novo Usuário com Múltiplos Perfis
                        </DialogTitle>
                        <DialogDescription>
                            Cadastre um novo usuário e selecione os perfis que ele terá acesso no sistema.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-6 py-4">
                        {/* Dados Pessoais */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Dados Pessoais</CardTitle>
                                <CardDescription>Informações básicas do usuário</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="nome">Nome *</Label>
                                        <Input id="nome" {...register('nome')} />
                                        {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="email">E-mail *</Label>
                                        <Input id="email" type="email" {...register('email')} />
                                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="cpf">CPF *</Label>
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
                                                    placeholder="000.000.000-00"
                                                />
                                            )}
                                        />
                                        {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="matricula">Matrícula</Label>
                                        <Input id="matricula" {...register('matricula')} placeholder="Opcional" />
                                        {errors.matricula && <p className="text-red-500 text-sm mt-1">{errors.matricula.message}</p>}
                                    </div>
                                </div>
                                
                                <div>
                                    <Label htmlFor="senha">Senha *</Label>
                                    <Input id="senha" type="password" {...register('senha')} placeholder="Mínimo 6 caracteres" />
                                    {errors.senha && <p className="text-red-500 text-sm mt-1">{errors.senha.message}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Seleção de Perfis */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Perfis de Acesso
                                </CardTitle>
                                <CardDescription>
                                    Selecione os perfis que o usuário terá no sistema. É obrigatório selecionar pelo menos um perfil.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {loadingPerfis ? (
                                    <div className="text-center py-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="text-sm text-gray-500 mt-2">Carregando perfis...</p>
                                    </div>
                                ) : perfis.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500">Nenhum perfil disponível</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {perfis.map(perfil => (
                                                <div key={perfil.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                                                    <Checkbox
                                                        id={`perfil-${perfil.id}`}
                                                        checked={selectedPerfis.includes(perfil.id)}
                                                        onCheckedChange={() => handlePerfilToggle(perfil.id)}
                                                    />
                                                    <Label htmlFor={`perfil-${perfil.id}`} className="flex-1 cursor-pointer">
                                                        {perfil.nome}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Perfis Selecionados */}
                                        {selectedPerfis.length > 0 && (
                                            <div className="mt-4">
                                                <Label className="text-sm font-medium">Perfis Selecionados:</Label>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {selectedPerfis.map(perfilId => {
                                                        const perfil = perfis.find(p => p.id === perfilId);
                                                        if (!perfil) return null;
                                                        return (
                                                            <Badge
                                                                key={perfilId}
                                                                className={`${getPerfilColor(perfil.nome)} text-white flex items-center gap-1`}
                                                            >
                                                                {perfil.nome}
                                                                <X
                                                                    className="h-3 w-3 cursor-pointer hover:bg-black/20 rounded"
                                                                    onClick={() => removePerfil(perfilId)}
                                                                />
                                                            </Badge>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                                {errors.perfis && <p className="text-red-500 text-sm">{errors.perfis.message}</p>}
                            </CardContent>
                        </Card>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={resetForm}>
                            Limpar
                        </Button>
                        <Button 
                            disabled={isSubmitting || loadingPerfis || selectedPerfis.length === 0} 
                            type="submit"
                        >
                            {isSubmitting ? 'Cadastrando...' : 'Cadastrar Usuário'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
