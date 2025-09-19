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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Shield, UserPlus, X, History } from 'lucide-react';
import { 
    getAllPerfis, 
    getUserCompleteInfo,
    grantProfilesToUser,
    revokeProfilesFromUser,
    type Perfil,
    type UsuarioComPerfis,
    type UsuarioPerfilGrantRequest,
    type User
} from '@/lib/api';

const getPerfilColor = (nome: string) => {
    switch (nome) {
        case 'Administrador': return 'bg-red-500 hover:bg-red-600';
        case 'Gestor': return 'bg-blue-500 hover:bg-blue-600';
        case 'Fiscal': return 'bg-green-500 hover:bg-green-600';
        default: return 'bg-gray-500 hover:bg-gray-600';
    }
};

interface ConcederPerfisProps {
    usuario: User;
    onPerfisUpdated?: () => void;
}

export function ConcederPerfis({ usuario, onPerfisUpdated }: ConcederPerfisProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [perfis, setPerfis] = useState<Perfil[]>([]);
    const [loadingPerfis, setLoadingPerfis] = useState(false);
    const [loadingUsuario, setLoadingUsuario] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPerfis, setSelectedPerfis] = useState<number[]>([]);
    const [originalPerfis, setOriginalPerfis] = useState<number[]>([]);
    const [usuarioCompleto, setUsuarioCompleto] = useState<UsuarioComPerfis | null>(null);

    // Carregar dados quando o diálogo abrir
    useEffect(() => {
        if (isDialogOpen) {
            const fetchData = async () => {
                setLoadingPerfis(true);
                setLoadingUsuario(true);
                
                try {
                    console.log('🔍 Carregando dados para concessão de perfis...');
                    
                    // Carregar perfis disponíveis primeiro
                    const perfisData = await getAllPerfis();
                    console.log('📋 Perfis disponíveis:', perfisData);
                    
                    const perfisAtivos = perfisData.filter((perfil: any) => perfil.ativo);
                    setPerfis(perfisAtivos);

                    // Tentar carregar dados completos do usuário (pode falhar para usuários novos)
                    try {
                        const usuarioData = await getUserCompleteInfo(usuario.id);
                        console.log('👤 Dados do usuário:', usuarioData);
                        setUsuarioCompleto(usuarioData);
                        
                        // Definir perfis já concedidos
                        setSelectedPerfis(usuarioData.perfil_ids || []);
                        setOriginalPerfis(usuarioData.perfil_ids || []);
                    } catch (userError: any) {
                        console.warn('⚠️ Não foi possível carregar dados completos do usuário (usuário novo?):', userError);
                        
                        // Para usuários novos, criar dados básicos
                        const usuarioBasico: UsuarioComPerfis = {
                            id: usuario.id,
                            nome: usuario.nome,
                            email: usuario.email || '',
                            matricula: usuario.matricula || '',
                            ativo: true,
                            perfis: [],
                            perfil_ids: [],
                            perfis_texto: 'Nenhum perfil concedido'
                        };
                        
                        setUsuarioCompleto(usuarioBasico);
                        setSelectedPerfis([]);
                        setOriginalPerfis([]);
                        
                        console.log('📝 Usuário configurado como novo (sem perfis)');
                    }

                } catch (error) {
                    console.error("❌ Erro ao carregar perfis:", error);
                    toast.error("Não foi possível carregar os perfis disponíveis.");
                } finally {
                    setLoadingPerfis(false);
                    setLoadingUsuario(false);
                }
            };
            fetchData();
        }
    }, [isDialogOpen, usuario.id]);

    const handlePerfilToggle = (perfilId: number) => {
        const newSelectedPerfis = selectedPerfis.includes(perfilId)
            ? selectedPerfis.filter(id => id !== perfilId)
            : [...selectedPerfis, perfilId];
        
        setSelectedPerfis(newSelectedPerfis);
    };

    const removePerfil = (perfilId: number) => {
        const newSelectedPerfis = selectedPerfis.filter(id => id !== perfilId);
        setSelectedPerfis(newSelectedPerfis);
    };

    async function handleConcederPerfis() {
        if (selectedPerfis.length === 0) {
            toast.error('Selecione pelo menos um perfil para o usuário.');
            return;
        }

        setIsSubmitting(true);
        try {
            console.log('🚀 Iniciando concessão/revogação de perfis...');
            console.log('👤 Usuário:', usuario.nome, '(ID:', usuario.id, ')');
            console.log('📋 Perfis originais:', originalPerfis);
            console.log('📋 Perfis selecionados:', selectedPerfis);

            // Calcular diferenças
            const perfisParaRevogar = originalPerfis.filter(id => !selectedPerfis.includes(id));
            const perfisParaConceder = selectedPerfis.filter(id => !originalPerfis.includes(id));

            console.log('🔒 Perfis para revogar:', perfisParaRevogar);
            console.log('🔐 Perfis para conceder:', perfisParaConceder);

            // Revogar perfis removidos
            if (perfisParaRevogar.length > 0) {
                const revokeRequest: UsuarioPerfilGrantRequest = {
                    perfil_ids: perfisParaRevogar
                };

                console.log('🔒 Revogando perfis:', revokeRequest);
                await revokeProfilesFromUser(usuario.id, revokeRequest);
                console.log('✅ Perfis revogados com sucesso');
            }

            // Conceder novos perfis
            if (perfisParaConceder.length > 0) {
                const grantRequest: UsuarioPerfilGrantRequest = {
                    perfil_ids: perfisParaConceder
                };

                console.log('🔐 Concedendo perfis:', grantRequest);
                await grantProfilesToUser(usuario.id, grantRequest);
                console.log('✅ Perfis concedidos com sucesso');
            }

            if (perfisParaRevogar.length === 0 && perfisParaConceder.length === 0) {
                toast.info('Nenhuma alteração foi feita nos perfis do usuário.');
            } else {
                toast.success('Perfis do usuário atualizados com sucesso!');
            }

            setIsDialogOpen(false);
            
            if (onPerfisUpdated) {
                onPerfisUpdated();
            }

        } catch (error: any) {
            console.error('❌ Erro ao gerenciar perfis:', error);
            
            if (error.message?.includes('perfis ativos')) {
                toast.error('Erro: O usuário precisa ter pelo menos um perfil ativo.');
            } else {
                toast.error('Erro ao atualizar perfis. Tente novamente.');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    const resetForm = () => {
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
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Perfis</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Gerenciar Perfis: {usuario.nome}
                    </DialogTitle>
                    <DialogDescription>
                        Conceda ou revogue perfis de acesso para este usuário. As alterações entram em vigor imediatamente.
                    </DialogDescription>
                </DialogHeader>
                
                {loadingUsuario ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Carregando dados do usuário...</span>
                    </div>
                ) : (
                    <div className="grid gap-6 py-4">
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
                                    {usuarioCompleto.perfis && usuarioCompleto.perfis.length > 0 ? (
                                        <>
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
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            ⚠️ Este usuário não possui perfis ativos no sistema
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Seleção de Perfis */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Selecionar Perfis
                                </CardTitle>
                                <CardDescription>
                                    Marque os perfis que o usuário deve ter no sistema.
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
                        onClick={handleConcederPerfis}
                    >
                        {isSubmitting ? 'Salvando...' : 'Salvar Perfis'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
