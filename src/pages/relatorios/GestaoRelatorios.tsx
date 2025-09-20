import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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
    DialogTrigger,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    FileText, 
    CheckCircle, 
    XCircle, 
    Clock, 
    Download,
    Eye,
    AlertCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
    getAllRelatorios, 
    analisarRelatorio, 
    getRelatorioDetalhes,
    type RelatorioDetalhado, 
    type AnalisarRelatorioPayload 
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const analisarSchema = z.object({
    acao: z.enum(['aprovar', 'rejeitar', 'cancelar']),
    observacoes_admin: z.string().optional(),
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

export function GestaoRelatorios() {
    const { user, perfilAtivo } = useAuth();
    const navigate = useNavigate();
    const [relatorios, setRelatorios] = React.useState<RelatorioDetalhado[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [selectedRelatorio, setSelectedRelatorio] = React.useState<RelatorioDetalhado | null>(null);
    const [isAnalyzing, setIsAnalyzing] = React.useState(false);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    const form = useForm<AnalisarFormData>({
        resolver: zodResolver(analisarSchema),
        defaultValues: {
            observacoes_admin: "",
        },
    });

    // Verificar se é administrador
    const isAdmin = perfilAtivo?.nome?.toLowerCase() === 'administrador';

    React.useEffect(() => {
        if (!isAdmin) {
            navigate('/contratos');
            return;
        }
        fetchRelatorios();
    }, [isAdmin, navigate]);

    const fetchRelatorios = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Buscar apenas relatórios pendentes de análise
            const response = await getAllRelatorios({ 
                status: 'pendente',
                page: 1,
                per_page: 10 
            });
            setRelatorios(response.data || []);
        } catch (error) {
            console.error('Erro ao carregar relatórios:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            setError(errorMessage);
            toast.error('Erro ao carregar relatórios: ' + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyzeClick = (relatorio: RelatorioDetalhado) => {
        setSelectedRelatorio(relatorio);
        form.reset({ observacoes_admin: "" });
        setIsDialogOpen(true);
    };

    const onSubmitAnalise = async (data: AnalisarFormData) => {
        if (!selectedRelatorio) return;

        setIsAnalyzing(true);
        const toastId = toast.loading(`${data.acao === 'aprovar' ? 'Aprovando' : data.acao === 'rejeitar' ? 'Rejeitando' : 'Cancelando'} relatório...`);

        try {
            const payload: AnalisarRelatorioPayload = {
                acao: data.acao,
                observacoes_admin: data.observacoes_admin || undefined,
            };

            await analisarRelatorio(selectedRelatorio.contrato_id, selectedRelatorio.id, payload);

            toast.success(`Relatório ${data.acao === 'aprovar' ? 'aprovado' : data.acao === 'rejeitar' ? 'rejeitado' : 'cancelado'} com sucesso!`, {
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
                                        name="observacoes_admin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Observações do Administrador (Opcional)</FormLabel>
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
                                            type="button"
                                            variant="destructive"
                                            onClick={() => {
                                                form.setValue('acao', 'rejeitar');
                                                form.handleSubmit(onSubmitAnalise)();
                                            }}
                                            disabled={isAnalyzing}
                                        >
                                            <XCircle className="h-4 w-4 mr-1" />
                                            Rejeitar
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                form.setValue('acao', 'aprovar');
                                                form.handleSubmit(onSubmitAnalise)();
                                            }}
                                            disabled={isAnalyzing}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Aprovar
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
