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
import { Edit, X, Users, Shield, History } from 'lucide-react';
import { 
    getAllPerfis, 
    getUserCompleteInfo,
    updateUser,
    grantProfilesToUser,
    revokeProfilesFromUser,
    getUserPerfis,
    type Perfil,
    type UsuarioComPerfis,
    type UsuarioPerfilGrantRequest,
    type User
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

// Schema para edição de usuário
const editUserForm = z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("E-mail inválido"),
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

type EditUserForm = z.infer<typeof editUserForm>;

const getPerfilColor = (nome: string) => {
    switch (nome) {
        case 'Administrador': return 'bg-red-500 hover:bg-red-600';
        case 'Gestor': return 'bg-blue-500 hover:bg-blue-600';
        case 'Fiscal': return 'bg-green-500 hover:bg-green-600';
        default: return 'bg-gray-500 hover:bg-gray-600';
    }
};

interface EditarUsuarioMultiPerfilProps {
    usuario: User;
    onUsuarioUpdated?: () => void;
}

export function EditarUsuarioMultiPerfil({ usuario, onUsuarioUpdated }: EditarUsuarioMultiPerfilProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [perfis, setPerfis] = useState<Perfil[]>([]);
    const [loadingPerfis, setLoadingPerfis] = useState(false);
    const [loadingUsuario, setLoadingUsuario] = useState(false);
    const [selectedPerfis, setSelectedPerfis] = useState<number[]>([]);
    const [originalPerfis, setOriginalPerfis] = useState<number[]>([]);
    const [usuarioCompleto, setUsuarioCompleto] = useState<UsuarioComPerfis | null>(null);

    const { register, handleSubmit, control, reset, formState: { errors, isSubmitting }, setValue, watch } = useForm<EditUserForm>({
        resolver: zodResolver(editUserForm),
        defaultValues: {
            perfis: []
        }
    });

    // Carregar dados quando o diálogo abrir
    useEffect(() => {
        if (isDialogOpen) {
            const fetchData = async () => {
                setLoadingPerfis(true);
                setLoadingUsuario(true);
                
                try {
                    // Carregar perfis disponíveis e dados completos do usuário em paralelo
                    const [perfisData, usuarioData] = await Promise.all([
                        getAllPerfis(),
                        getUserCompleteInfo(usuario.id)
                    ]);

                    const perfisAtivos = perfisData.filter(perfil => perfil.ativo);
                    setPerfis(perfisAtivos);
                    setUsuarioCompleto(usuarioData);

                    // Preencher formulário com dados do usuário
                    reset({
                        nome: usuarioData.nome,
                        email: usuarioData.email,
                        cpf: '00000000000', // CPF não disponível na API - campo desabilitado
                        matricula: usuarioData.matricula,
                        perfis: usuarioData.perfil_ids
                    });

                    setSelectedPerfis(usuarioData.perfil_ids);
                    setOriginalPerfis(usuarioData.perfil_ids);

                } catch (error) {
                    console.error("Erro ao carregar dados:", error);
                    toast.error("Não foi possível carregar os dados do usuário.");
                } finally {
                    setLoadingPerfis(false);
                    setLoadingUsuario(false);
                }
            };
            fetchData();
        }
    }, [isDialogOpen, usuario.id, reset]);

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

    async function handleUpdateUser(data: EditUserForm) {
        try {
            console.log('🚀 Iniciando atualização de usuário com múltiplos perfis...');
            console.log('📋 Dados do formulário:', data);

            // Atualizar dados básicos do usuário
            const usuarioPayload = {
                nome: data.nome,
                email: data.email,
                matricula: data.matricula || '',
            };

            console.log('👤 Atualizando dados do usuário:', usuarioPayload);
            await updateUser(usuario.id, usuarioPayload);
            console.log('✅ Dados do usuário atualizados com sucesso');

            // Gerenciar perfis - comparar com perfis originais
            const perfisParaRevogar = originalPerfis.filter(id => !data.perfis.includes(id));
            const perfisParaConceder = data.perfis.filter(id => !originalPerfis.includes(id));

            // Revogar perfis removidos
            if (perfisParaRevogar.length > 0) {
                const revokeRequest: UsuarioPerfilGrantRequest = {
                    perfil_ids: perfisParaRevogar,
                    observacoes: `Perfis revogados durante edição do usuário`
                };

                console.log('🔒 Revogando perfis:', revokeRequest);
                await revokeProfilesFromUser(usuario.id, revokeRequest);
                console.log('✅ Perfis revogados com sucesso');
            }

            // Conceder novos perfis
            if (perfisParaConceder.length > 0) {
                const grantRequest: UsuarioPerfilGrantRequest = {
                    perfil_ids: perfisParaConceder,
                    observacoes: `Perfis concedidos durante edição do usuário`
                };

                console.log('🔐 Concedendo novos perfis:', grantRequest);
                await grantProfilesToUser(usuario.id, grantRequest);
                console.log('✅ Perfis concedidos com sucesso');
            }

            toast.success('Usuário atualizado com sucesso!');
            setIsDialogOpen(false);
            
            if (onUsuarioUpdated) {
                onUsuarioUpdated();
            }

        } catch (error: any) {
            console.error('❌ Erro ao atualizar usuário:', error);
            
            if (error.message?.includes('perfis ativos')) {
                toast.error('Erro: O usuário precisa ter pelo menos um perfil ativo.');
            } else if (error.message?.includes('email')) {
                toast.error('Este e-mail já está em uso por outro usuário.');
            } else {
                toast.error('Erro ao atualizar usuário. Verifique os dados e tente novamente.');
            }
        }
    }

    const resetForm = () => {
        reset();
        setSelectedPerfis([]);
        setOriginalPerfis([]);
        setUsuarioCompleto(null);
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
                resetForm();
            }
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit(handleUpdateUser)}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Editar Usuário: {usuario.nome}
                        </DialogTitle>
                        <DialogDescription>
                            Atualize os dados do usuário e gerencie seus perfis de acesso.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {loadingUsuario ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2">Carregando dados do usuário...</span>
                        </div>
                    ) : (
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
                                    
                                    <div>
                                        <Label htmlFor="matricula">Matrícula</Label>
                                        <Input id="matricula" {...register('matricula')} placeholder="Opcional" />
                                        {errors.matricula && <p className="text-red-500 text-sm mt-1">{errors.matricula.message}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Perfis Atuais */}
                            {usuarioCompleto && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <History className="h-5 w-5" />
                                            Perfis Atuais
                                        </CardTitle>
                                        <CardDescription>
                                            Perfis que o usuário possui atualmente no sistema
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {usuarioCompleto.perfis.map((perfilNome, index) => (
                                                <Badge
                                                    key={index}
                                                    className={`${getPerfilColor(perfilNome)} text-white`}
                                                >
                                                    {perfilNome}
                                                </Badge>
                                            ))}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {usuarioCompleto.perfis_texto}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Seleção de Perfis */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Gerenciar Perfis de Acesso
                                    </CardTitle>
                                    <CardDescription>
                                        Selecione os perfis que o usuário deve ter no sistema.
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
                                                    <Label className="text-sm font-medium">Novos Perfis Selecionados:</Label>
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
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={resetForm}>
                            Cancelar
                        </Button>
                        <Button 
                            disabled={isSubmitting || loadingPerfis || loadingUsuario || selectedPerfis.length === 0} 
                            type="submit"
                        >
                            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
