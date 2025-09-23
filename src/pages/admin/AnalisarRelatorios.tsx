import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  IconFileText,
  IconCheck,
  IconX,
  IconEye,
  IconDownload,
  IconClock,
  IconUser,
  IconCalendar,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getRelatoriosPendentesAnalise,
  analisarRelatorio,
  downloadArquivoContrato,
  type AnalisarRelatorioPayload
} from "@/services/api";

type RelatorioParaAnalise = {
  id: number;
  contrato_id: number;
  contrato_numero: string;
  contrato_objeto: string;
  contratado_nome: string;
  fiscal_nome: string;
  pendencia_titulo?: string;
  data_envio: string;
  arquivo_nome: string;
  arquivo_id: number;
  observacoes?: string;
  status: string;
};

export function AnalisarRelatorios() {
  const navigate = useNavigate();
  const [relatorios, setRelatorios] = useState<RelatorioParaAnalise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRelatorio, setSelectedRelatorio] = useState<RelatorioParaAnalise | null>(null);
  const [analiseModalOpen, setAnaliseModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'aprovar' | 'rejeitar';
    relatorio: RelatorioParaAnalise | null;
  }>({ open: false, type: 'aprovar', relatorio: null });
  const [observacoesAnalise, setObservacoesAnalise] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Carregar relatórios pendentes
  const loadRelatorios = async () => {
    setIsLoading(true);
    try {
      console.log("🔍 Carregando relatórios para análise...");
      const data = await getRelatoriosPendentesAnalise();

      // Converter dados da API para o formato esperado
      const relatoriosFormatados: RelatorioParaAnalise[] = data.map((rel: any) => ({
        id: rel.id,
        contrato_id: rel.contrato_id,
        contrato_numero: rel.contrato_numero,
        contrato_objeto: rel.contrato_objeto,
        contratado_nome: rel.contratado_nome,
        fiscal_nome: rel.fiscal_nome,
        pendencia_titulo: rel.pendencia_titulo,
        data_envio: rel.data_envio,
        arquivo_nome: rel.arquivo_nome || "relatorio.pdf",
        arquivo_id: rel.arquivo_id || 0,
        observacoes: rel.observacoes,
        status: "aguardando_analise"
      }));

      setRelatorios(relatoriosFormatados);
      console.log("✅ Relatórios carregados:", relatoriosFormatados);
    } catch (error) {
      console.error("❌ Erro ao carregar relatórios:", error);
      toast.error("Erro ao carregar relatórios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRelatorios();
  }, []);

  // Filtrar relatórios por termo de busca
  const relatoriosFiltrados = relatorios.filter(relatorio =>
    relatorio.contrato_numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    relatorio.contrato_objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    relatorio.contratado_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    relatorio.fiscal_nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para analisar relatório
  const handleAnaliseRelatorio = async (relatorio: RelatorioParaAnalise, aprovado: boolean) => {
    setIsProcessing(true);
    try {
      const payload: AnalisarRelatorioPayload = {
        status_id: aprovado ? 2 : 3, // 2 = aprovado, 3 = rejeitado
        observacoes_analise: observacoesAnalise.trim() || undefined
      };

      console.log(`📋 ${aprovado ? 'Aprovando' : 'Rejeitando'} relatório:`, {
        contratoId: relatorio.contrato_id,
        relatorioId: relatorio.id,
        payload
      });

      await analisarRelatorio(relatorio.id, payload);

      toast.success(`Relatório ${aprovado ? 'aprovado' : 'rejeitado'} com sucesso!`);

      // Remover relatório da lista
      setRelatorios(prev => prev.filter(r => r.id !== relatorio.id));

      // Fechar modais
      setConfirmDialog({ open: false, type: 'aprovar', relatorio: null });
      setAnaliseModalOpen(false);
      setObservacoesAnalise("");
      setSelectedRelatorio(null);

    } catch (error: any) {
      console.error("❌ Erro ao analisar relatório:", error);
      toast.error(error.message || "Erro ao analisar relatório");
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para download do arquivo
  const handleDownload = async (relatorio: RelatorioParaAnalise) => {
    try {
      console.log("📥 Fazendo download do arquivo:", relatorio.arquivo_nome);

      if (!relatorio.arquivo_id) {
        toast.error("ID do arquivo não encontrado");
        return;
      }

      const blob = await downloadArquivoContrato(relatorio.contrato_id, relatorio.arquivo_id);

      // Criar URL temporária para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = relatorio.arquivo_nome;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Download iniciado!");
    } catch (error: any) {
      console.error("❌ Erro no download:", error);
      toast.error("Erro ao fazer download do arquivo");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-amber-800">📋 Analisar Relatórios</h1>
          <p className="text-amber-600 mt-1">Relatórios aguardando sua análise</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadRelatorios} variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50">
            <IconRefresh className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Voltar ao Dashboard
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Aguardando Análise</CardTitle>
            <IconClock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">{relatorios.length}</div>
            <p className="text-xs text-amber-600 mt-1">Relatórios pendentes</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Filtrados</CardTitle>
            <IconSearch className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{relatoriosFiltrados.length}</div>
            <p className="text-xs text-green-600 mt-1">Resultados da busca</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Ação Necessária</CardTitle>
            <IconFileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{relatorios.length > 0 ? 'SIM' : 'NÃO'}</div>
            <p className="text-xs text-blue-600 mt-1">Análises pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconSearch className="w-5 h-5" />
            Buscar Relatórios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por contrato, objeto, contratado ou fiscal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios para Análise</CardTitle>
          <CardDescription>
            {relatoriosFiltrados.length} relatório{relatoriosFiltrados.length !== 1 ? 's' : ''} encontrado{relatoriosFiltrados.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {relatoriosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <IconFileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>{relatorios.length === 0 ? 'Nenhum relatório aguardando análise' : 'Nenhum relatório encontrado com os filtros aplicados'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {relatoriosFiltrados.map((relatorio) => (
                <Card key={relatorio.id} className="border-amber-100 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{relatorio.contrato_numero}</h4>
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            <IconClock className="w-3 h-3 mr-1" />
                            Aguardando Análise
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3" title={relatorio.contrato_objeto}>
                          {relatorio.contrato_objeto}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <IconUser className="w-4 h-4 text-blue-600" />
                              <span className="font-medium">Contratado:</span>
                              <span>{relatorio.contratado_nome}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <IconUser className="w-4 h-4 text-green-600" />
                              <span className="font-medium">Fiscal:</span>
                              <span>{relatorio.fiscal_nome}</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <IconCalendar className="w-4 h-4 text-purple-600" />
                              <span className="font-medium">Enviado em:</span>
                              <span>{formatDate(relatorio.data_envio)}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <IconFileText className="w-4 h-4 text-orange-600" />
                              <span className="font-medium">Arquivo:</span>
                              <span>{relatorio.arquivo_nome}</span>
                            </div>
                          </div>
                        </div>

                        {relatorio.observacoes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-sm">Observações do fiscal:</span>
                            <p className="text-sm text-gray-600 mt-1">{relatorio.observacoes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          onClick={() => navigate(`/contratos/${relatorio.contrato_id}`)}
                          size="sm"
                          variant="outline"
                        >
                          <IconEye className="w-4 h-4 mr-1" />
                          Ver Contrato
                        </Button>

                        <Button
                          onClick={() => handleDownload(relatorio)}
                          size="sm"
                          variant="outline"
                        >
                          <IconDownload className="w-4 h-4 mr-1" />
                          Download
                        </Button>

                        <Button
                          onClick={() => {
                            setSelectedRelatorio(relatorio);
                            setAnaliseModalOpen(true);
                          }}
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700"
                        >
                          📋 Analisar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Análise */}
      <Dialog open={analiseModalOpen} onOpenChange={setAnaliseModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Analisar Relatório</DialogTitle>
            <DialogDescription>
              {selectedRelatorio && (
                <>Contrato: {selectedRelatorio.contrato_numero} - {selectedRelatorio.contratado_nome}</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="observacoes-analise">Observações da Análise</Label>
              <Textarea
                id="observacoes-analise"
                placeholder="Adicione observações sobre a análise do relatório..."
                value={observacoesAnalise}
                onChange={(e) => setObservacoesAnalise(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Obrigatório em caso de rejeição. Opcional para aprovação.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setAnaliseModalOpen(false);
                setObservacoesAnalise("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!observacoesAnalise.trim()) {
                  toast.error("Observações são obrigatórias para rejeição");
                  return;
                }
                setConfirmDialog({ open: true, type: 'rejeitar', relatorio: selectedRelatorio });
              }}
            >
              <IconX className="w-4 h-4 mr-2" />
              Rejeitar
            </Button>
            <Button
              onClick={() => {
                setConfirmDialog({ open: true, type: 'aprovar', relatorio: selectedRelatorio });
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <IconCheck className="w-4 h-4 mr-2" />
              Aprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, type: 'aprovar', relatorio: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === 'aprovar' ? 'Aprovar Relatório?' : 'Rejeitar Relatório?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === 'aprovar'
                ? 'Esta ação aprovará o relatório e marcará a pendência como concluída.'
                : 'Esta ação rejeitará o relatório e enviará feedback para o fiscal corrigir.'
              }
              {confirmDialog.relatorio && (
                <>
                  <br /><br />
                  <strong>Contrato:</strong> {confirmDialog.relatorio.contrato_numero}
                  <br />
                  <strong>Fiscal:</strong> {confirmDialog.relatorio.fiscal_nome}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.relatorio) {
                  handleAnaliseRelatorio(confirmDialog.relatorio, confirmDialog.type === 'aprovar');
                }
              }}
              disabled={isProcessing}
              className={confirmDialog.type === 'aprovar' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  {confirmDialog.type === 'aprovar' ? (
                    <>
                      <IconCheck className="w-4 h-4 mr-2" />
                      Confirmar Aprovação
                    </>
                  ) : (
                    <>
                      <IconX className="w-4 h-4 mr-2" />
                      Confirmar Rejeição
                    </>
                  )}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AnalisarRelatorios;