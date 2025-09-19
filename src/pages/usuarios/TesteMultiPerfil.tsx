import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { 
    getAllPerfis, 
    createUser, 
    grantProfilesToUser, 
    type Perfil,
    type UsuarioPerfilGrantRequest 
} from '@/lib/api';

export function TesteMultiPerfil() {
    const [loading, setLoading] = useState(false);
    const [perfis, setPerfis] = useState<Perfil[]>([]);

    const testarBuscarPerfis = async () => {
        setLoading(true);
        try {
            console.log('🔍 Testando busca de perfis...');
            const data = await getAllPerfis();
            console.log('✅ Perfis encontrados:', data);
            setPerfis(data);
            toast.success(`${data.length} perfis encontrados!`);
        } catch (error) {
            console.error('❌ Erro ao buscar perfis:', error);
            toast.error('Erro ao buscar perfis');
        } finally {
            setLoading(false);
        }
    };

    const testarCriarUsuario = async () => {
        setLoading(true);
        try {
            console.log('🔍 Testando criação de usuário...');
            
            // Dados de teste
            const usuarioTeste = {
                nome: "Teste Multi Perfil",
                email: "teste.multiperfil@email.com",
                senha: "123456",
                cpf: "12345678901",
                matricula: "TEST001",
                perfil_id: 1 // Usar ID do primeiro perfil disponível
            };

            console.log('👤 Criando usuário de teste:', usuarioTeste);
            const novoUsuario = await createUser(usuarioTeste);
            console.log('✅ Usuário criado:', novoUsuario);

            // Testar concessão de perfis adicionais
            if (perfis.length > 1) {
                const perfisAdicionais = perfis.slice(1, 3).map(p => p.id); // Pegar até 2 perfis adicionais
                const perfilRequest: UsuarioPerfilGrantRequest = {
                    perfil_ids: perfisAdicionais,
                    observacoes: 'Teste de concessão de múltiplos perfis'
                };

                console.log('🔐 Concedendo perfis adicionais:', perfilRequest);
                await grantProfilesToUser(novoUsuario.id, perfilRequest);
                console.log('✅ Perfis adicionais concedidos');
            }

            toast.success('Usuário de teste criado com múltiplos perfis!');
        } catch (error: any) {
            console.error('❌ Erro ao criar usuário:', error);
            toast.error(`Erro: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Teste Multi-Perfil</CardTitle>
                <CardDescription>
                    Componente para testar a funcionalidade de múltiplos perfis
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button 
                    onClick={testarBuscarPerfis} 
                    disabled={loading}
                    className="w-full"
                >
                    {loading ? 'Carregando...' : 'Testar Buscar Perfis'}
                </Button>

                {perfis.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-medium">Perfis Encontrados:</h4>
                        {perfis.map(perfil => (
                            <div key={perfil.id} className="text-sm p-2 bg-gray-100 rounded">
                                ID: {perfil.id} - {perfil.nome} - {(perfil as any).ativo ? 'Ativo' : 'Inativo'}
                            </div>
                        ))}
                    </div>
                )}

                <Button 
                    onClick={testarCriarUsuario} 
                    disabled={loading || perfis.length === 0}
                    className="w-full"
                    variant="outline"
                >
                    {loading ? 'Criando...' : 'Testar Criar Usuário'}
                </Button>

                <div className="text-xs text-gray-500">
                    <p>Este componente é apenas para teste.</p>
                    <p>Verifique o console para logs detalhados.</p>
                </div>
            </CardContent>
        </Card>
    );
}
