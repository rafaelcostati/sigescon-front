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
    AlertCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
    getDashboardAdminRelatoriosPendentes,
    analisarRelatorio, 
    getStatusRelatorios,
    type RelatorioDetalhado, 
    type AnalisarRelatorioPayload,
    type StatusRelatorio
} from "@/lib/api";
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
    const { perfilAtivo, user } = useAuth();
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
            console.log('🔍 Carregando contratos com relatórios pendentes...');
            
            // Buscar contratos com relatórios pendentes
            const dashboardResponse = await getDashboardAdminRelatoriosPendentes();
            
            // Para simplificar, vamos usar os dados do dashboard
            // que já contém informações sobre relatórios pendentes
            console.log(`✅ ${dashboardResponse.contratos.length} contratos com relatórios pendentes carregados`);
            
            // Mock de relatórios baseado nos contratos (temporário até API estar completa)
            const mockRelatorios = dashboardResponse.contratos.map(contrato => ({
                id: contrato.id,
                contrato_id: contrato.id,
                contrato_numero: contrato.nr_contrato,
                contrato_objeto: contrato.objeto,
                fiscal_nome: contrato.fiscal_nome,
                gestor_nome: contrato.gestor_nome,
                mes_competencia: new Date().toISOString().slice(0, 7),
                observacoes_fiscal: `Relatório pendente de análise - Contrato ${contrato.nr_contrato}`,
                pendencia_id: 1,
                fiscal_id: 1,
                fiscal_usuario_id: 1,
                arquivo_id: 1,
                status_id: 1,
                status: 'Pendente de Análise',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                arquivo_nome: 'relatorio.pdf',
                observacoes_admin: null,
                aprovador_usuario_id: null
            })) as any[];
            
            setRelatorios(mockRelatorios);
            console.log(`✅ ${mockRelatorios.length} relatórios carregados de ${dashboardResponse.contratos.length} contratos`);
            
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

        setIsAnalyzing(true);
        const statusSelecionado = statusRelatorios.find(s => s.id === data.status_id);
        const toastId = toast.loading(`Alterando status para ${statusSelecionado?.nome || 'selecionado'}...`);

        try {
            const payload: AnalisarRelatorioPayload = {
                aprovador_usuario_id: user?.id || 0,
                status_id: data.status_id,
                observacoes_aprovador: data.observacoes_aprovador || undefined,
            };

            await analisarRelatorio(selectedRelatorio.contrato_id, selectedRelatorio.id, payload);

            toast.success(`Status alterado para ${statusSelecionado?.nome} com sucesso!`, {
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
            
            toast.error('Falha ao analisar relatório', {
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
                                                    {formatDate(relatorio.mes_competencia)}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDateTime(relatorio.created_at)}
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
                                        {formatDate(selectedRelatorio.mes_competencia)}
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

                            {/* Formulário de Análise */}
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
                                            Alterar Status
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
