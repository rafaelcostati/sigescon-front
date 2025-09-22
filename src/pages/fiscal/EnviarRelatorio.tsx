import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    FileText,
    Upload,
    AlertCircle,
    Calendar,
    User,
    Building
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardFiscalCompleto, type PendenciaFiscalCompleta } from '@/lib/api';
import { RelatorioUploadModal } from '@/components/RelatorioUploadModal';

export default function EnviarRelatorio() {
    const { perfilAtivo, user } = useAuth();
    const navigate = useNavigate();
    const isFiscal = perfilAtivo?.nome === 'Fiscal';

    // Estados
    const [pendencias, setPendencias] = useState<PendenciaFiscalCompleta[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPendencia, setSelectedPendencia] = useState<PendenciaFiscalCompleta | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Verificação de fiscal
    React.useEffect(() => {
        if (!isFiscal) {
            navigate('/contratos');
            return;
        }
        fetchPendencias();
    }, [isFiscal, navigate]);

    const fetchPendencias = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('🔍 Carregando pendências do fiscal...');

            const dashboardResponse = await getDashboardFiscalCompleto();
            setPendencias(dashboardResponse.minhas_pendencias || []);

            console.log(`✅ ${dashboardResponse.minhas_pendencias?.length || 0} pendências carregadas`);

        } catch (error) {
            console.error('❌ Erro ao carregar pendências:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            setError(errorMessage);
            toast.error('Erro ao carregar pendências: ' + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnviarRelatorio = (pendencia: PendenciaFiscalCompleta) => {
        setSelectedPendencia(pendencia);
        setIsUploadModalOpen(true);
    };

    const handleUploadSuccess = () => {
        setIsUploadModalOpen(false);
        setSelectedPendencia(null);
        fetchPendencias(); // Recarregar lista
        toast.success('Relatório enviado com sucesso!');
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('pt-BR');
        } catch {
            return dateString;
        }
    };

    if (!isFiscal) {
        return null;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-green-800">Enviar Relatórios</h1>
                <p className="text-muted-foreground">
                    Envie relatórios de fiscalização para as pendências dos contratos sob sua responsabilidade.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-green-600" />
                        Pendências Aguardando Relatório
                    </CardTitle>
                    <CardDescription>
                        Lista de pendências dos seus contratos que precisam de relatório de fiscalização.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                                <p className="mt-2 text-sm text-muted-foreground">Carregando pendências...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="text-center">
                                <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                                <p className="mt-2 text-sm text-red-600">{error}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={fetchPendencias}
                                >
                                    Tentar novamente
                                </Button>
                            </div>
                        </div>
                    ) : pendencias.length === 0 ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="text-center">
                                <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Nenhuma pendência aguardando relatório
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Você está em dia com suas obrigações de fiscalização!
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Contrato</TableHead>
                                        <TableHead>Pendência</TableHead>
                                        <TableHead>Prazo</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendencias.map((pendencia) => (
                                        <TableRow key={pendencia.pendencia_id}>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Building className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">{pendencia.contrato_numero}</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground truncate max-w-[200px]" title={pendencia.contrato_objeto}>
                                                        {pendencia.contrato_objeto}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="font-medium">{pendencia.pendencia_titulo}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {pendencia.pendencia_descricao}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    {formatDate(pendencia.prazo_entrega)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className="bg-yellow-50 text-yellow-700 border-yellow-200"
                                                >
                                                    Aguardando Relatório
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleEnviarRelatorio(pendencia)}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <Upload className="h-4 w-4 mr-1" />
                                                    Enviar Relatório
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal de Upload */}
            {selectedPendencia && (
                <RelatorioUploadModal
                    open={isUploadModalOpen}
                    onOpenChange={(open) => {
                        setIsUploadModalOpen(open);
                        if (!open) {
                            setSelectedPendencia(null);
                        }
                    }}
                    onSuccess={handleUploadSuccess}
                    contratoId={selectedPendencia.contrato_id}
                    pendenciaId={selectedPendencia.pendencia_id}
                    pendenciaTitulo={selectedPendencia.pendencia_titulo}
                />
            )}
        </div>
    );
}