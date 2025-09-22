import React from "react";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    FileText, 
    Download,
    CheckCircle, 
    AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
    getRelatoriosByContratoId,
    type Relatorio 
} from "@/lib/api";

const statusColors = {
    'pendente': 'bg-yellow-100 text-yellow-800',
    'aprovado': 'bg-green-100 text-green-800',
    'rejeitado': 'bg-red-100 text-red-800',
    'cancelado': 'bg-gray-100 text-gray-800',
};


interface RelatoriosContratoProps {
    contratoId: number;
    contratoNumero?: string;
    showOnlyApproved?: boolean; // Para mostrar apenas aprovados nos detalhes
}

export function RelatoriosContrato({ 
    contratoId, 
    showOnlyApproved = false 
}: RelatoriosContratoProps) {
    const [relatorios, setRelatorios] = React.useState<Relatorio[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        fetchRelatorios();
    }, [contratoId]);

    const fetchRelatorios = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getRelatoriosByContratoId(contratoId);
            let relatoriosData = response.data || [];
            
            // Para o tipo Relatorio básico, não temos status_relatorio
            // Assumir que todos os relatórios retornados são válidos para exibição
            // if (showOnlyApproved) {
            //     relatoriosData = relatoriosData.filter(r => 
            //         r.status_relatorio?.toLowerCase() === 'aprovado'
            //     );
            // }
            
            setRelatorios(relatoriosData);
        } catch (error) {
            console.error('Erro ao carregar relatórios:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            setError(errorMessage);
            if (!showOnlyApproved) { // Só mostrar toast se não for visualização silenciosa
                toast.error('Erro ao carregar relatórios: ' + errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
        } catch {
            return dateString;
        }
    };

    const formatDateTime = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
        } catch {
            return dateString;
        }
    };

    const handleDownload = async (relatorioId: number, nomeArquivo: string) => {
        try {
            // Implementar download do arquivo
            toast.info(`Download de ${nomeArquivo} iniciado...`);
            // TODO: Implementar função de download real
            console.log('Download do relatório:', relatorioId);
        } catch (error) {
            console.error('Erro ao fazer download:', error);
            toast.error('Erro ao fazer download do arquivo');
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {showOnlyApproved ? 'Relatórios Aprovados' : 'Relatórios do Contrato'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-2 text-sm text-muted-foreground">Carregando relatórios...</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error && !showOnlyApproved) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {showOnlyApproved ? 'Relatórios Aprovados' : 'Relatórios do Contrato'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32">
                        <div className="text-center">
                            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                            <p className="mt-2 text-sm text-red-600">{error}</p>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2"
                                onClick={fetchRelatorios}
                            >
                                Tentar novamente
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (relatorios.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {showOnlyApproved ? 'Relatórios Aprovados' : 'Relatórios do Contrato'}
                    </CardTitle>
                    <CardDescription>
                        {showOnlyApproved 
                            ? 'Relatórios fiscais aprovados para este contrato'
                            : 'Histórico de relatórios fiscais enviados para este contrato'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32">
                        <div className="text-center">
                            <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
                            <p className="mt-2 text-sm text-muted-foreground">
                                {showOnlyApproved 
                                    ? 'Nenhum relatório aprovado ainda'
                                    : 'Nenhum relatório enviado ainda'
                                }
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {showOnlyApproved ? 'Relatórios Aprovados' : 'Relatórios do Contrato'}
                    <Badge variant="secondary" className="ml-auto">
                        {relatorios.length}
                    </Badge>
                </CardTitle>
                <CardDescription>
                    {showOnlyApproved 
                        ? 'Relatórios fiscais aprovados para este contrato'
                        : 'Histórico de relatórios fiscais enviados para este contrato'
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data Competência</TableHead>
                                <TableHead>Enviado por</TableHead>
                                <TableHead>Enviado em</TableHead>
                                {!showOnlyApproved && <TableHead>Status</TableHead>}
                                <TableHead>Arquivo</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {relatorios.map((relatorio) => {
                                return (
                                    <TableRow key={relatorio.id}>
                                        <TableCell className="font-medium">
                                            {formatDate(relatorio.data_envio)}
                                        </TableCell>
                                        <TableCell>
                                            Fiscal
                                        </TableCell>
                                        <TableCell>
                                            {formatDateTime(relatorio.data_envio)}
                                        </TableCell>
                                        {!showOnlyApproved && (
                                            <TableCell>
                                                <Badge className={statusColors.aprovado}>
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Aprovado
                                                </Badge>
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                Relatório {relatorio.id}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownload(relatorio.id, `Relatório ${relatorio.id}`)}
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                Download
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
