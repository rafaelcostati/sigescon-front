import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  IconFile,
  IconDownload,
  IconRefresh,
  IconFileText,
  IconCalendar,
  IconUser,
  IconCheck,
  IconX,
  IconClock,
  IconEye,
} from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  downloadArquivoContrato,
  getRelatoriosByContratoId,
  type RelatorioDetalhado
} from "@/services/api";

interface RelatoriosArquivosProps {
  contratoId: number;
  className?: string;
}

export function RelatoriosArquivos({ contratoId, className }: RelatoriosArquivosProps) {
  const [relatorios, setRelatorios] = useState<RelatorioDetalhado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRelatorio, setSelectedRelatorio] = useState<RelatorioDetalhado | null>(null);

  // Carregar relatórios do contrato
  const loadRelatorios = async () => {
    setIsLoading(true);
    try {
      console.log("🔍 Carregando relatórios do contrato:", contratoId);
      const response = await getRelatoriosByContratoId(contratoId);
      setRelatorios(response.data);
      console.log("✅ Relatórios carregados:", response.data);
    } catch (error) {
      console.error("❌ Erro ao carregar relatórios:", error);
      toast.error("Erro ao carregar relatórios do contrato");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRelatorios();
  }, [contratoId]);

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aprovado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejeitado':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'aguardando_analise':
      case 'aguardando análise':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'pendente':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Função para obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aprovado':
        return <IconCheck className="w-4 h-4" />;
      case 'rejeitado':
        return <IconX className="w-4 h-4" />;
      case 'aguardando_analise':
      case 'aguardando análise':
        return <IconClock className="w-4 h-4" />;
      case 'pendente':
        return <IconFile className="w-4 h-4" />;
      default:
        return <IconFile className="w-4 h-4" />;
    }
  };

  // Função para formatar data
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para download de arquivo
  const handleDownload = async (relatorio: RelatorioDetalhado) => {
    try {
      if (!relatorio.arquivo_id) {
        toast.error("Arquivo não encontrado para este relatório");
        return;
      }

      console.log("📥 Fazendo download do relatório:", relatorio.titulo);
      toast.loading("Preparando download...", { id: `download-${relatorio.id}` });

      const blob = await downloadArquivoContrato(contratoId, relatorio.arquivo_id);

      // Criar URL temporária para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = relatorio.titulo || `Relatorio_${relatorio.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Download realizado com sucesso!", { id: `download-${relatorio.id}` });
    } catch (error: any) {
      console.error("❌ Erro no download:", error);
      toast.error("Erro ao fazer download do relatório", { id: `download-${relatorio.id}` });
    }
  };

  // Agrupar relatórios por status
  const relatoriosAprovados = relatorios.filter(r => r.status_relatorio.toLowerCase() === 'aprovado');
  const relatoriosAguardando = relatorios.filter(r =>
    r.status_relatorio.toLowerCase().includes('aguardando') ||
    r.status_relatorio.toLowerCase() === 'pendente'
  );
  const relatoriosRejeitados = relatorios.filter(r => r.status_relatorio.toLowerCase() === 'rejeitado');

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFileText className="w-5 h-5" />
            Histórico de Relatórios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total</p>
                <p className="text-2xl font-bold text-blue-800">{relatorios.length}</p>
              </div>
              <IconFileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Aprovados</p>
                <p className="text-2xl font-bold text-green-800">{relatoriosAprovados.length}</p>
              </div>
              <IconCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">Aguardando</p>
                <p className="text-2xl font-bold text-amber-800">{relatoriosAguardando.length}</p>
              </div>
              <IconClock className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Rejeitados</p>
                <p className="text-2xl font-bold text-red-800">{relatoriosRejeitados.length}</p>
              </div>
              <IconX className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Relatórios */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconFileText className="w-5 h-5 text-green-600" />
                Histórico de Relatórios de Fiscalização
                <Badge variant="secondary">{relatorios.length}</Badge>
              </CardTitle>
              <CardDescription>
                Todos os relatórios enviados pelos fiscais com seus respectivos status
              </CardDescription>
            </div>
            <Button onClick={loadRelatorios} variant="outline" size="sm">
              <IconRefresh className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {relatorios.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <IconFileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhum relatório de fiscalização encontrado</p>
              <p className="text-sm mt-1">Os relatórios enviados pelos fiscais aparecerão aqui</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Relatório</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fiscal</TableHead>
                    <TableHead>Data Envio</TableHead>
                    <TableHead>Análise</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatorios.map((relatorio) => (
                    <TableRow key={relatorio.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <IconFileText className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium">{relatorio.titulo || `Relatório #${relatorio.id}`}</p>
                            {relatorio.observacoes && (
                              <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">
                                {relatorio.observacoes}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(relatorio.status_relatorio)} border text-xs`}>
                          {getStatusIcon(relatorio.status_relatorio)}
                          <span className="ml-1">{relatorio.status_relatorio}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <IconUser className="w-3 h-3" />
                          {relatorio.fiscal_nome || 'Fiscal'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <IconCalendar className="w-3 h-3" />
                          {formatDate(relatorio.data_envio)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {relatorio.data_analise ? (
                          <div>
                            <div className="text-xs text-gray-600">
                              {formatDate(relatorio.data_analise)}
                            </div>
                            {relatorio.analisado_por_nome && (
                              <div className="text-xs text-gray-500">
                                por {relatorio.analisado_por_nome}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedRelatorio(relatorio)}
                              >
                                <IconEye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                              <DialogHeader>
                                <DialogTitle>Detalhes do Relatório</DialogTitle>
                                <DialogDescription>
                                  Informações completas sobre o relatório de fiscalização
                                </DialogDescription>
                              </DialogHeader>
                              {selectedRelatorio && (
                                <div className="space-y-4 py-4">
                                  <div>
                                    <Label className="text-sm font-medium">Título:</Label>
                                    <p className="text-sm">{selectedRelatorio.titulo || `Relatório #${selectedRelatorio.id}`}</p>
                                  </div>

                                  <div>
                                    <Label className="text-sm font-medium">Status:</Label>
                                    <div className="mt-1">
                                      <Badge className={`${getStatusColor(selectedRelatorio.status_relatorio)} border`}>
                                        {getStatusIcon(selectedRelatorio.status_relatorio)}
                                        <span className="ml-1">{selectedRelatorio.status_relatorio}</span>
                                      </Badge>
                                    </div>
                                  </div>

                                  <div>
                                    <Label className="text-sm font-medium">Fiscal Responsável:</Label>
                                    <p className="text-sm">{selectedRelatorio.fiscal_nome || 'Não informado'}</p>
                                  </div>

                                  <div>
                                    <Label className="text-sm font-medium">Data de Envio:</Label>
                                    <p className="text-sm">{formatDate(selectedRelatorio.data_envio)}</p>
                                  </div>

                                  {selectedRelatorio.observacoes && (
                                    <div>
                                      <Label className="text-sm font-medium">Observações do Fiscal:</Label>
                                      <p className="text-sm bg-gray-50 p-2 rounded mt-1">{selectedRelatorio.observacoes}</p>
                                    </div>
                                  )}

                                  {selectedRelatorio.data_analise && (
                                    <div>
                                      <Label className="text-sm font-medium">Análise:</Label>
                                      <div className="text-sm bg-gray-50 p-2 rounded mt-1 space-y-1">
                                        <p><strong>Data:</strong> {formatDate(selectedRelatorio.data_analise)}</p>
                                        {selectedRelatorio.analisado_por_nome && (
                                          <p><strong>Analisado por:</strong> {selectedRelatorio.analisado_por_nome}</p>
                                        )}
                                        {selectedRelatorio.observacoes_analise && (
                                          <div>
                                            <strong>Observações da análise:</strong>
                                            <p className="mt-1">{selectedRelatorio.observacoes_analise}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {relatorio.arquivo_id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(relatorio)}
                            >
                              <IconDownload className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente Label para ser reutilizado
function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}