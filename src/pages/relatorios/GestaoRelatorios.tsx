import React from "react";
import { useNavigate } from "react-router-dom";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    AlertCircle,
    Download,
    File
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    getRelatoriosPendentesAnalise,
    analisarRelatorio,
    downloadArquivoContrato,
    getDashboardAdminCompleto,
    getStatusRelatorios,
    type AnalisarRelatorioPayload,
    type RelatorioDetalhado,
    type StatusRelatorio
} from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const analisarSchema = z.object({
    status_id: z.number().min(1, "Selecione um status"),
    observacoes_aprovador: z.string().optional(),
});

type AnalisarFormData = z.infer<typeof analisarSchema>;

const statusColors = {
    'pendente': 'bg-yellow-100 text-yellow-800',
    'aprovado': 'bg-green-100 text-green-800',
    'rejeitado': 'bg-red-100 text-red-800',
    'cancelado': 'bg-gray-100 text-gray-800',
};

const statusIcons = {
    'pendente': Clock,
    'aprovado': CheckCircle,
    'rejeitado': XCircle,
    'cancelado': AlertCircle,
};

export default function GestaoRelatorios() {
    const { perfilAtivo } = useAuth();
    const navigate = useNavigate();
    const isAdmin = perfilAtivo?.nome === "Administrador";

    // Estados
    const [relatorios, setRelatorios] = React.useState<RelatorioDetalhado[]>([]);
    const [statusRelatorios, setStatusRelatorios] = React.useState<StatusRelatorio[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [selectedRelatorio, setSelectedRelatorio] = React.useState<RelatorioDetalhado | null>(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isAnalyzing, setIsAnalyzing] = React.useState(false);
    const [isDownloading, setIsDownloading] = React.useState(false);

    const form = useForm<AnalisarFormData>({
        resolver: zodResolver(analisarSchema),
        defaultValues: {
            observacoes_aprovador: "",
        },
    });

    // Verificação de administrador já feita acima na linha 89

    React.useEffect(() => {
        if (!isAdmin) {
            navigate('/contratos');
            return;
        }
        fetchRelatorios();
        fetchStatusRelatorios();
    }, [isAdmin, navigate]);

    const fetchRelatorios = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('🔍 Carregando relatórios pendentes (usando nova API)...');

            // Usar a nova API que retorna relatórios individuais
            const relatoriosResponse = await getRelatoriosPendentesAnalise();
            
            // Buscar dados do dashboard admin
            const dashboardResponse = await getDashboardAdminCompleto();
            
            // Se temos relatórios diretos da API, usar eles
            if (relatoriosResponse && relatoriosResponse.length > 0) {
                console.log('✅ Usando relatórios diretos da API:', relatoriosResponse);
                setRelatorios(relatoriosResponse);
                return;
            }

            // Usar os contratos com relatórios pendentes da API principal
            // Verificar diferentes possíveis nomes da propriedade
            let contratosComRelatorios = [];
            let fonteUsada = '';

            if (dashboardResponse.contratos_com_relatorios_pendentes?.length > 0) {
                contratosComRelatorios = dashboardResponse.contratos_com_relatorios_pendentes;
                fonteUsada = 'contratos_com_relatorios_pendentes';
            } else if (dashboardResponse.contratos_com_pendencias?.length > 0) {
                contratosComRelatorios = dashboardResponse.contratos_com_pendencias;
                fonteUsada = 'contratos_com_pendencias';
            } else {
                contratosComRelatorios = [];
                fonteUsada = 'nenhuma (arrays vazios ou inexistentes)';
            }

            console.log(`🎯 FONTE DE DADOS USADA: ${fonteUsada}`);

            console.log(`✅ ${contratosComRelatorios.length} contratos com relatórios pendentes carregados`);
            console.log("📋 DADOS COMPLETOS DA API:", dashboardResponse);
            console.log("📊 TOTAL RELATÓRIOS PARA ANÁLISE:", dashboardResponse.contadores.relatorios_para_analise);
            console.log("🔍 CONTRATOS COM RELATÓRIOS PENDENTES:", contratosComRelatorios);

            // Debug: verificar todas as propriedades disponíveis
            console.log("🔍 PROPRIEDADES DISPONÍVEIS:", Object.keys(dashboardResponse));
            console.log("🔍 contratos_com_relatorios_pendentes:", dashboardResponse.contratos_com_relatorios_pendentes);
            console.log("🔍 contratos_com_pendencias:", dashboardResponse.contratos_com_pendencias);

            // Debug: estrutura detalhada dos contratos
            if (contratosComRelatorios.length > 0) {
                console.log("🔍 ESTRUTURA DO PRIMEIRO CONTRATO:", contratosComRelatorios[0]);
                console.log("🔍 PROPRIEDADES DO CONTRATO:", Object.keys(contratosComRelatorios[0]));

                // Verificar se há uma lista de relatórios dentro do contrato
                if (contratosComRelatorios[0].relatorios) {
                    console.log("🔍 RELATÓRIOS DENTRO DO CONTRATO:", contratosComRelatorios[0].relatorios);
                }
            }

            // Verificar se há discrepância entre contador e lista
            if (dashboardResponse.contadores.relatorios_para_analise > 0 && contratosComRelatorios.length === 0) {
                console.warn("⚠️ DISCREPÂNCIA DETECTADA:");
                console.warn(`- Contador diz: ${dashboardResponse.contadores.relatorios_para_analise} relatórios`);
                console.warn(`- Lista tem: ${contratosComRelatorios.length} contratos`);
                console.warn("- Isso indica um problema no backend ou estrutura da API");
            }

            // Expandir cada contrato em seus relatórios individuais
            const relatóriosExpandidos: any[] = [];

            if (contratosComRelatorios.length > 0) {
                // Caso normal: temos contratos com dados reais
                contratosComRelatorios.forEach((contrato: any, index: number) => {
                    console.log(`🔍 PROCESSANDO CONTRATO ${index + 1}:`, contrato);

                    // Verificar se há uma lista de relatórios dentro do contrato
                    if (contrato.relatorios && Array.isArray(contrato.relatorios)) {
                        // Caso 1: Contrato tem lista de relatórios
                        console.log(`📋 Contrato ${contrato.nr_contrato} tem ${contrato.relatorios.length} relatórios`);
                        contrato.relatorios.forEach((relatorio: any) => {
                            relatóriosExpandidos.push({
                                id: relatorio.id, // ID REAL do relatório
                                contrato_id: contrato.id,
                                contrato_numero: contrato.nr_contrato,
                                contrato_objeto: contrato.objeto,
                                fiscal_nome: contrato.fiscal_nome,
                                gestor_nome: contrato.gestor_nome,
                                mes_competencia: relatorio.mes_competencia || new Date().toISOString().slice(0, 7),
                                observacoes_fiscal: relatorio.observacoes_fiscal || `Relatório pendente de análise - ${contrato.nr_contrato}`,
                                pendencia_id: relatorio.pendencia_id || 1,
                                fiscal_id: relatorio.fiscal_id || 1,
                                fiscal_usuario_id: relatorio.fiscal_usuario_id || 1,
                                arquivo_id: relatorio.arquivo_id, // ID REAL do arquivo
                                status_id: relatorio.status_id || 1,
                                status: relatorio.status || 'Pendente de Análise',
                                status_relatorio: relatorio.status_relatorio || 'pendente',
                                created_at: relatorio.created_at || contrato.ultimo_relatorio_data || new Date().toISOString(),
                                updated_at: relatorio.updated_at || contrato.ultimo_relatorio_data || new Date().toISOString(),
                                arquivo_nome: relatorio.arquivo_nome || relatorio.nome_arquivo || 'relatorio.pdf',
                                nome_arquivo: relatorio.nome_arquivo || relatorio.arquivo_nome || 'relatorio.pdf',
                                enviado_por: relatorio.enviado_por || contrato.ultimo_relatorio_fiscal || contrato.fiscal_nome,
                                observacoes_admin: relatorio.observacoes_admin,
                                aprovador_usuario_id: relatorio.aprovador_usuario_id,
                                is_mock: false // Dados reais do backend
                            });
                        });
                    } else {
                        // Caso 2: Usar dados do próprio contrato (fallback)
                        console.log(`📋 Contrato ${contrato.nr_contrato} sem lista de relatórios, usando dados do contrato`);
                        const numRelatorios = contrato.relatorios_pendentes_count || 1;

                        for (let i = 0; i < numRelatorios; i++) {
                            relatóriosExpandidos.push({
                                id: contrato.relatorio_id || `${contrato.id}_${i}`, // Usar ID real se disponível
                                contrato_id: contrato.id,
                                contrato_numero: contrato.nr_contrato,
                                contrato_objeto: contrato.objeto,
                                fiscal_nome: contrato.fiscal_nome,
                                gestor_nome: contrato.gestor_nome,
                                mes_competencia: new Date().toISOString().slice(0, 7),
                                observacoes_fiscal: contrato.observacoes_fiscal || `Relatório pendente de análise - ${contrato.nr_contrato}`,
                                pendencia_id: 1,
                                fiscal_id: 1,
                                fiscal_usuario_id: 1,
                                arquivo_id: contrato.arquivo_id, // ID REAL do arquivo se disponível
                                status_id: 1,
                                status: 'Pendente de Análise',
                                status_relatorio: 'pendente',
                                created_at: contrato.ultimo_relatorio_data || new Date().toISOString(),
                                updated_at: contrato.ultimo_relatorio_data || new Date().toISOString(),
                                arquivo_nome: contrato.arquivo_nome || contrato.nome_arquivo || 'relatorio.pdf',
                                nome_arquivo: contrato.nome_arquivo || contrato.arquivo_nome || 'relatorio.pdf',
                                enviado_por: contrato.ultimo_relatorio_fiscal || contrato.fiscal_nome,
                                observacoes_admin: null,
                                aprovador_usuario_id: null,
                                is_mock: false // Dados reais vindo do backend
                            });
                        }
                    }
                });
            } else if (dashboardResponse.contadores.relatorios_para_analise > 0) {
                // Fallback: se o contador mostra relatórios mas não há contratos na lista
                // Criar itens mock baseados no contador
                console.log("🔧 USANDO FALLBACK: Criando relatórios mock baseados no contador");

                for (let i = 0; i < dashboardResponse.contadores.relatorios_para_analise; i++) {
                    relatóriosExpandidos.push({
                        id: `mock_${i}`,
                        contrato_id: 999,
                        contrato_numero: `CONTRATO-${i + 1}`,
                        contrato_objeto: "Objeto do contrato pendente de análise",
                        fiscal_nome: "Fiscal Responsável",
                        gestor_nome: "Gestor Responsável",
                        mes_competencia: new Date().toISOString().slice(0, 7),
                        observacoes_fiscal: `Relatório ${i + 1} pendente de análise`,
                        pendencia_id: 1,
                        fiscal_id: 1,
                        fiscal_usuario_id: 1,
                        arquivo_id: null, // Marca como mock - sem arquivo real
                        status_id: 1,
                        status: 'Pendente de Análise',
                        status_relatorio: 'pendente',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        arquivo_nome: `relatorio_${i + 1}.pdf`,
                        nome_arquivo: `relatorio_${i + 1}.pdf`,
                        enviado_por: "Fiscal Sistema",
                        observacoes_admin: null,
                        aprovador_usuario_id: null,
                        is_mock: true // Flag para identificar dados mock
                    });
                }
            }

            setRelatorios(relatóriosExpandidos);
            console.log(`✅ ${relatóriosExpandidos.length} relatórios carregados de ${contratosComRelatorios.length} contratos`);
            console.log(`📊 Total esperado: ${dashboardResponse.contadores.relatorios_para_analise} relatórios`);
            
        } catch (error) {
            console.error('❌ Erro ao carregar relatórios:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            setError(errorMessage);
            toast.error('Erro ao carregar relatórios: ' + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStatusRelatorios = async () => {
        try {
            const status = await getStatusRelatorios();
            setStatusRelatorios(status);
        } catch (error) {
            console.error('Erro ao carregar status:', error);
        }
    };

    const handleAnalyzeClick = (relatorio: RelatorioDetalhado) => {
        setSelectedRelatorio(relatorio);
        form.reset({ 
            status_id: 0,
            observacoes_aprovador: "" 
        });
        setIsDialogOpen(true);
    };

    const onSubmitAnalise = async (data: AnalisarFormData) => {
        if (!selectedRelatorio) return;

        // Verificar se é um relatório mock (não pode ser analisado)
        if (selectedRelatorio.is_mock || !selectedRelatorio.arquivo_id) {
            toast.error("Este é um relatório de exemplo e não pode ser analisado. Aguarde a sincronização com dados reais do backend.");
            return;
        }

        setIsAnalyzing(true);
        const statusSelecionado = statusRelatorios.find(s => s.id === data.status_id);
        const toastId = toast.loading(`Realizando avaliação para ${statusSelecionado?.nome || 'status selecionado'}...`);

        try {
            const payload: AnalisarRelatorioPayload = {
                status_id: data.status_id,
                observacoes_analise: data.observacoes_aprovador || undefined,
            };

            await analisarRelatorio(selectedRelatorio.id, payload);

            toast.success(`Avaliação realizada com sucesso! Status: ${statusSelecionado?.nome}`, {
                id: toastId,
            });

            setIsDialogOpen(false);
            setSelectedRelatorio(null);
            form.reset();
            
            // Recarregar lista
            fetchRelatorios();
            
        } catch (error) {
            console.error('Erro ao analisar relatório:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            
            toast.error('Falha ao realizar avaliação', {
                id: toastId,
                description: errorMessage
            });
        } finally {
            setIsAnalyzing(false);
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

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        const iconProps = { size: 20, className: "text-blue-600" };

        switch (extension) {
            case 'pdf':
                return <FileText {...iconProps} className="text-red-600" />;
            case 'doc':
            case 'docx':
                return <FileText {...iconProps} className="text-blue-600" />;
            case 'xls':
            case 'xlsx':
                return <FileText {...iconProps} className="text-green-600" />;
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
                return <File {...iconProps} className="text-purple-600" />;
            default:
                return <File {...iconProps} />;
        }
    };

    const handleDownloadArquivo = async () => {
        if (!selectedRelatorio) return;

        // Verificar se é um relatório mock (sem arquivo real)
        if (selectedRelatorio.is_mock || !selectedRelatorio.arquivo_id) {
            toast.error("Este é um relatório de exemplo. O arquivo real não está disponível para download.");
            return;
        }

        setIsDownloading(true);
        const toastId = toast.loading("Preparando download do arquivo...");

        try {
            console.log("📥 Fazendo download do arquivo do relatório:", selectedRelatorio.nome_arquivo);

            // Usar a função de download de arquivo do contrato
            const blob = await downloadArquivoContrato(selectedRelatorio.contrato_id, selectedRelatorio.arquivo_id);

            // Criar URL temporária para download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = selectedRelatorio.nome_arquivo || selectedRelatorio.arquivo_nome || 'relatorio.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Download realizado com sucesso!", { id: toastId });
        } catch (error: any) {
            console.error("❌ Erro no download:", error);
            toast.error("Erro ao fazer download do arquivo", { id: toastId });
        } finally {
            setIsDownloading(false);
        }
    };

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Gestão de Relatórios</h1>
                <p className="text-muted-foreground">
                    Analise e gerencie os relatórios fiscais enviados pelos fiscais.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Relatórios Pendentes de Análise
                    </CardTitle>
                    <CardDescription>
                        Lista de relatórios enviados pelos fiscais aguardando aprovação ou rejeição.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-2 text-sm text-muted-foreground">Carregando relatórios...</p>
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
                                    onClick={fetchRelatorios}
                                >
                                    Tentar novamente
                                </Button>
                            </div>
                        </div>
                    ) : relatorios.length === 0 ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="text-center">
                                <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Nenhum relatório pendente de análise
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Contrato</TableHead>
                                        <TableHead>Fiscal</TableHead>
                                        <TableHead>Data Competência</TableHead>
                                        <TableHead>Enviado em</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {relatorios.map((relatorio) => {
                                        const StatusIcon = statusIcons[relatorio.status_relatorio as keyof typeof statusIcons] || Clock;
                                        
                                        return (
                                            <TableRow key={relatorio.id}>
                                                <TableCell className="font-medium">
                                                    {relatorio.contrato_numero || `Contrato ${relatorio.contrato_id}`}
                                                </TableCell>
                                                <TableCell>
                                                    {relatorio.fiscal_nome || relatorio.enviado_por}
                                                </TableCell>
                                                <TableCell>
                                                    {relatorio.mes_competencia ? formatDate(relatorio.mes_competencia) : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {relatorio.created_at ? formatDate(relatorio.created_at) : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge 
                                                        className={`${statusColors[relatorio.status_relatorio as keyof typeof statusColors] || statusColors.pendente}`}
                                                    >
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {relatorio.status_relatorio || 'Pendente'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleAnalyzeClick(relatorio)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Analisar
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog de Análise */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Analisar Relatório
                        </DialogTitle>
                        <DialogDescription>
                            Revise o relatório e tome uma decisão sobre sua aprovação.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRelatorio && (
                        <div className="space-y-4">
                            {/* Informações do Relatório */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Contrato</Label>
                                    <p className="font-medium">
                                        {selectedRelatorio.contrato_numero || `Contrato ${selectedRelatorio.contrato_id}`}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Fiscal</Label>
                                    <p className="font-medium">
                                        {selectedRelatorio.fiscal_nome || selectedRelatorio.enviado_por}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Data de Competência</Label>
                                    <p className="font-medium">
                                        {selectedRelatorio.mes_competencia ? formatDate(selectedRelatorio.mes_competencia) : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Arquivo</Label>
                                    <p className="font-medium">
                                        {selectedRelatorio.nome_arquivo}
                                    </p>
                                </div>
                            </div>

                            {/* Observações do Fiscal */}
                            <div>
                                <Label className="text-sm font-medium">Observações do Fiscal</Label>
                                <div className="mt-1 p-3 bg-muted rounded-md">
                                    <p className="text-sm">{selectedRelatorio.observacoes_fiscal}</p>
                                </div>
                            </div>

                            {/* Arquivo Anexado */}
                            <div className={`border rounded-lg p-4 ${
                                selectedRelatorio.is_mock || !selectedRelatorio.arquivo_id
                                    ? 'border-orange-200 bg-orange-50'
                                    : 'border-blue-200 bg-blue-50'
                            }`}>
                                <Label className={`text-sm font-medium ${
                                    selectedRelatorio.is_mock || !selectedRelatorio.arquivo_id
                                        ? 'text-orange-800'
                                        : 'text-blue-800'
                                }`}>
                                    {selectedRelatorio.is_mock || !selectedRelatorio.arquivo_id
                                        ? 'Arquivo Simulado (Dados de Exemplo)'
                                        : 'Arquivo Anexado pelo Fiscal'
                                    }
                                </Label>
                                <div className="mt-2 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-md ${
                                            selectedRelatorio.is_mock || !selectedRelatorio.arquivo_id
                                                ? 'bg-orange-100'
                                                : 'bg-blue-100'
                                        }`}>
                                            {getFileIcon(selectedRelatorio.nome_arquivo || selectedRelatorio.arquivo_nome || 'relatorio.pdf')}
                                        </div>
                                        <div>
                                            <p className={`font-medium ${
                                                selectedRelatorio.is_mock || !selectedRelatorio.arquivo_id
                                                    ? 'text-orange-900'
                                                    : 'text-blue-900'
                                            }`}>
                                                {selectedRelatorio.nome_arquivo || selectedRelatorio.arquivo_nome || 'relatorio.pdf'}
                                            </p>
                                            <p className={`text-xs ${
                                                selectedRelatorio.is_mock || !selectedRelatorio.arquivo_id
                                                    ? 'text-orange-600'
                                                    : 'text-blue-600'
                                            }`}>
                                                {selectedRelatorio.is_mock || !selectedRelatorio.arquivo_id
                                                    ? 'Dados simulados • Arquivo não disponível para download'
                                                    : `Enviado em ${selectedRelatorio.created_at ? formatDateTime(selectedRelatorio.created_at) : 'N/A'} • Clique para baixar e analisar`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDownloadArquivo}
                                        disabled={isDownloading || selectedRelatorio.is_mock || !selectedRelatorio.arquivo_id}
                                        className={
                                            selectedRelatorio.is_mock || !selectedRelatorio.arquivo_id
                                                ? 'border-orange-300 text-orange-700 opacity-50 cursor-not-allowed'
                                                : 'border-blue-300 text-blue-700 hover:bg-blue-100'
                                        }
                                    >
                                        {isDownloading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                                                Baixando...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="h-4 w-4 mr-2" />
                                                {selectedRelatorio.is_mock || !selectedRelatorio.arquivo_id
                                                    ? 'Indisponível'
                                                    : 'Baixar Arquivo'
                                                }
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Formulário de Análise */}
                            {selectedRelatorio.is_mock || !selectedRelatorio.arquivo_id ? (
                                <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                                        <Label className="text-sm font-medium text-yellow-800">
                                            Avaliação Indisponível
                                        </Label>
                                    </div>
                                    <p className="text-sm text-yellow-700">
                                        Este relatório é simulado para demonstração. A avaliação só estará disponível quando o backend retornar dados reais dos contratos com relatórios pendentes.
                                    </p>
                                </div>
                            ) : (
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmitAnalise)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="status_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status do Relatório *</FormLabel>
                                                <FormControl>
                                                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione o status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {statusRelatorios.map((status) => (
                                                                <SelectItem key={status.id} value={status.id.toString()}>
                                                                    {status.nome}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="observacoes_aprovador"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Observações do Aprovador (Opcional)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Adicione observações sobre sua decisão..."
                                                        className="min-h-[80px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <DialogFooter className="gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsDialogOpen(false)}
                                            disabled={isAnalyzing}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isAnalyzing}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Realizar Avaliação
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
