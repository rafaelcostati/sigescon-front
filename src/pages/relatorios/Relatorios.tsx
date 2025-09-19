import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, 
  Upload, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus,
  Search,
  Filter
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Mock data - substituir por dados reais da API
const mockRelatorios = [
  {
    id: 1,
    contrato: "001/2024",
    objeto: "Prestação de serviços de limpeza",
    mesCompetencia: "2024-01",
    dataEnvio: "2024-02-05",
    fiscal: "Maria Santos",
    status: "Aprovado",
    observacoesFiscal: "Serviços executados conforme contrato",
    observacoesAprovador: "Relatório aprovado sem ressalvas",
    aprovadoPor: "João Silva",
    dataAprovacao: "2024-02-08",
    nomeArquivo: "relatorio_janeiro_2024.pdf"
  },
  {
    id: 2,
    contrato: "002/2024",
    objeto: "Fornecimento de material de escritório",
    mesCompetencia: "2024-01",
    dataEnvio: "2024-02-10",
    fiscal: "Pedro Lima",
    status: "Pendente",
    observacoesFiscal: "Entrega realizada dentro do prazo",
    observacoesAprovador: null,
    aprovadoPor: null,
    dataAprovacao: null,
    nomeArquivo: "relatorio_material_janeiro.pdf"
  },
  {
    id: 3,
    contrato: "003/2024",
    objeto: "Manutenção de equipamentos",
    mesCompetencia: "2024-01",
    dataEnvio: "2024-02-12",
    fiscal: "Lucia Oliveira",
    status: "Rejeitado",
    observacoesFiscal: "Manutenção realizada parcialmente",
    observacoesAprovador: "Necessário complementar informações sobre os equipamentos não atendidos",
    aprovadoPor: "Ana Costa",
    dataAprovacao: "2024-02-15",
    nomeArquivo: "relatorio_manutencao_janeiro.pdf"
  }
];

const mockContratos = [
  { id: 1, numero: "001/2024", objeto: "Prestação de serviços de limpeza" },
  { id: 2, numero: "002/2024", objeto: "Fornecimento de material de escritório" },
  { id: 3, numero: "003/2024", objeto: "Manutenção de equipamentos" }
];

export default function Relatorios() {
  const { perfilAtivo } = useAuth();
  const [relatorios, setRelatorios] = useState(mockRelatorios);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(false);
  const [novoRelatorio, setNovoRelatorio] = useState({
    contratoId: "",
    mesCompetencia: "",
    observacoesFiscal: "",
    arquivo: null as File | null
  });

  const podeSubmeterRelatorio = perfilAtivo?.nome === "Fiscal";
  const podeAprovarRelatorio = perfilAtivo?.nome === "Administrador" || perfilAtivo?.nome === "Gestor";

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado': return 'bg-green-500';
      case 'Pendente': return 'bg-yellow-500';
      case 'Rejeitado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aprovado': return <CheckCircle className="w-4 h-4" />;
      case 'Pendente': return <Clock className="w-4 h-4" />;
      case 'Rejeitado': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const relatoriosFiltrados = relatorios.filter(relatorio => {
    const matchStatus = filtroStatus === "todos" || relatorio.status.toLowerCase() === filtroStatus.toLowerCase();
    const matchBusca = busca === "" || 
      relatorio.contrato.toLowerCase().includes(busca.toLowerCase()) ||
      relatorio.objeto.toLowerCase().includes(busca.toLowerCase()) ||
      relatorio.fiscal.toLowerCase().includes(busca.toLowerCase());
    
    return matchStatus && matchBusca;
  });

  const handleSubmitRelatorio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoRelatorio.contratoId || !novoRelatorio.mesCompetencia || !novoRelatorio.arquivo) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      // Simular envio para API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const novoId = Math.max(...relatorios.map(r => r.id)) + 1;
      const contratoSelecionado = mockContratos.find(c => c.id === parseInt(novoRelatorio.contratoId));
      
      const novoRelatorioCompleto = {
        id: novoId,
        contrato: contratoSelecionado?.numero || "",
        objeto: contratoSelecionado?.objeto || "",
        mesCompetencia: novoRelatorio.mesCompetencia,
        dataEnvio: new Date().toISOString().split('T')[0],
        fiscal: "Usuário Atual", // Pegar do contexto
        status: "Pendente",
        observacoesFiscal: novoRelatorio.observacoesFiscal,
        observacoesAprovador: null,
        aprovadoPor: null,
        dataAprovacao: null,
        nomeArquivo: novoRelatorio.arquivo.name
      };

      setRelatorios([novoRelatorioCompleto, ...relatorios]);
      setNovoRelatorio({
        contratoId: "",
        mesCompetencia: "",
        observacoesFiscal: "",
        arquivo: null
      });
      
      toast.success("Relatório enviado com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar relatório");
    } finally {
      setLoading(false);
    }
  };

  const handleAprovarRelatorio = async (id: number, aprovado: boolean, observacoes?: string) => {
    setLoading(true);
    try {
      // Simular aprovação/rejeição na API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRelatorios(relatorios.map(relatorio => 
        relatorio.id === id 
          ? {
              ...relatorio,
              status: aprovado ? "Aprovado" : "Rejeitado",
              observacoesAprovador: observacoes || "",
              aprovadoPor: "Usuário Atual", // Pegar do contexto
              dataAprovacao: new Date().toISOString().split('T')[0]
            }
          : relatorio
      ));
      
      toast.success(`Relatório ${aprovado ? 'aprovado' : 'rejeitado'} com sucesso!`);
    } catch (error) {
      toast.error("Erro ao processar relatório");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (relatorio: any) => {
    // Simular download do arquivo
    toast.info(`Baixando ${relatorio.nomeArquivo}...`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Relatórios Fiscais</h1>
          <p className="text-gray-600 mt-1">Gestão de relatórios de fiscalização</p>
        </div>
        {podeSubmeterRelatorio && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Relatório
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submeter Novo Relatório</DialogTitle>
                <DialogDescription>
                  Envie um relatório de fiscalização para análise
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitRelatorio} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contrato">Contrato *</Label>
                    <Select value={novoRelatorio.contratoId} onValueChange={(value) => 
                      setNovoRelatorio({...novoRelatorio, contratoId: value})
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o contrato" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockContratos.map(contrato => (
                          <SelectItem key={contrato.id} value={contrato.id.toString()}>
                            {contrato.numero} - {contrato.objeto}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="mesCompetencia">Mês de Competência *</Label>
                    <Input
                      id="mesCompetencia"
                      type="month"
                      value={novoRelatorio.mesCompetencia}
                      onChange={(e) => setNovoRelatorio({...novoRelatorio, mesCompetencia: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações do Fiscal</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Descreva os principais pontos da fiscalização..."
                    value={novoRelatorio.observacoesFiscal}
                    onChange={(e) => setNovoRelatorio({...novoRelatorio, observacoesFiscal: e.target.value})}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="arquivo">Arquivo do Relatório *</Label>
                  <Input
                    id="arquivo"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setNovoRelatorio({...novoRelatorio, arquivo: e.target.files?.[0] || null})}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Formatos aceitos: PDF, DOC, DOCX</p>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">Cancelar</Button>
                  </DialogTrigger>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Enviar Relatório
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="busca"
                  placeholder="Buscar por contrato, objeto ou fiscal..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Relatórios */}
      <div className="grid gap-4">
        {relatoriosFiltrados.map((relatorio) => (
          <Card key={relatorio.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Contrato {relatorio.contrato}</CardTitle>
                  <CardDescription>{relatorio.objeto}</CardDescription>
                </div>
                <Badge className={`${getStatusColor(relatorio.status)} text-white flex items-center gap-1`}>
                  {getStatusIcon(relatorio.status)}
                  {relatorio.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Mês de Competência:</span>
                  <p>{new Date(relatorio.mesCompetencia + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Data de Envio:</span>
                  <p>{new Date(relatorio.dataEnvio).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Fiscal:</span>
                  <p>{relatorio.fiscal}</p>
                </div>
              </div>

              {relatorio.observacoesFiscal && (
                <div>
                  <span className="font-medium text-gray-600">Observações do Fiscal:</span>
                  <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{relatorio.observacoesFiscal}</p>
                </div>
              )}

              {relatorio.observacoesAprovador && (
                <div>
                  <span className="font-medium text-gray-600">Observações do Aprovador:</span>
                  <p className="text-sm mt-1 p-2 bg-blue-50 rounded">{relatorio.observacoesAprovador}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Por {relatorio.aprovadoPor} em {relatorio.dataAprovacao ? new Date(relatorio.dataAprovacao).toLocaleDateString('pt-BR') : ''}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  {relatorio.nomeArquivo}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(relatorio)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  {podeAprovarRelatorio && relatorio.status === "Pendente" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAprovarRelatorio(relatorio.id, false, "Necessário revisar documentação")}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rejeitar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAprovarRelatorio(relatorio.id, true, "Aprovado sem ressalvas")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aprovar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {relatoriosFiltrados.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum relatório encontrado</h3>
            <p className="text-gray-500 text-center">
              {busca || filtroStatus !== "todos" 
                ? "Tente ajustar os filtros para encontrar relatórios."
                : "Não há relatórios cadastrados ainda."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
