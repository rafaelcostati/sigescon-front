import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ClipboardCheck, 
  Calendar, 
  MapPin, 
  User, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus,
  Search,
  Eye,
  Edit
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Mock data - substituir por dados reais da API
const mockFiscalizacoes = [
  {
    id: 1,
    contrato: "001/2024",
    objeto: "Prestação de serviços de limpeza",
    dataFiscalizacao: "2024-02-15",
    fiscal: "Maria Santos",
    local: "Prédio Administrativo - 1º Andar",
    status: "Concluída",
    tipoFiscalizacao: "Rotineira",
    observacoes: "Serviços executados conforme especificações. Equipe adequada e equipamentos em bom estado.",
    pontuacao: 9.5,
    conformidades: ["Limpeza adequada", "Equipamentos apropriados", "Equipe uniformizada"],
    naoConformidades: ["Falta de alguns produtos de limpeza específicos"],
    proximaFiscalizacao: "2024-03-15"
  },
  {
    id: 2,
    contrato: "002/2024",
    objeto: "Fornecimento de material de escritório",
    dataFiscalizacao: "2024-02-10",
    fiscal: "Pedro Lima",
    local: "Almoxarifado Central",
    status: "Pendente",
    tipoFiscalizacao: "Extraordinária",
    observacoes: "Verificação de qualidade dos materiais entregues. Aguardando complementação da documentação.",
    pontuacao: null,
    conformidades: ["Entrega no prazo", "Quantidades corretas"],
    naoConformidades: ["Qualidade inferior em alguns itens", "Documentação incompleta"],
    proximaFiscalizacao: "2024-03-10"
  },
  {
    id: 3,
    contrato: "003/2024",
    objeto: "Manutenção de equipamentos",
    dataFiscalizacao: "2024-02-20",
    fiscal: "Lucia Oliveira",
    local: "Sala de Equipamentos - Subsolo",
    status: "Agendada",
    tipoFiscalizacao: "Rotineira",
    observacoes: "",
    pontuacao: null,
    conformidades: [],
    naoConformidades: [],
    proximaFiscalizacao: "2024-03-20"
  }
];

const mockContratos = [
  { id: 1, numero: "001/2024", objeto: "Prestação de serviços de limpeza", fiscal: "Maria Santos" },
  { id: 2, numero: "002/2024", objeto: "Fornecimento de material de escritório", fiscal: "Pedro Lima" },
  { id: 3, numero: "003/2024", objeto: "Manutenção de equipamentos", fiscal: "Lucia Oliveira" }
];

export default function Fiscalizacao() {
  const { perfilAtivo } = useAuth();
  const [fiscalizacoes, setFiscalizacoes] = useState(mockFiscalizacoes);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(false);
  const [novaFiscalizacao, setNovaFiscalizacao] = useState({
    contratoId: "",
    dataFiscalizacao: "",
    local: "",
    tipoFiscalizacao: "Rotineira",
    observacoes: ""
  });

  const podeGerenciarFiscalizacao = perfilAtivo?.nome === "Administrador" || perfilAtivo?.nome === "Fiscal";

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluída': return 'bg-green-500';
      case 'Pendente': return 'bg-yellow-500';
      case 'Agendada': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Concluída': return <CheckCircle className="w-4 h-4" />;
      case 'Pendente': return <Clock className="w-4 h-4" />;
      case 'Agendada': return <Calendar className="w-4 h-4" />;
      default: return <ClipboardCheck className="w-4 h-4" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Rotineira': return 'bg-blue-100 text-blue-800';
      case 'Extraordinária': return 'bg-orange-100 text-orange-800';
      case 'Emergencial': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const fiscalizacoesFiltradas = fiscalizacoes.filter(fiscalizacao => {
    const matchStatus = filtroStatus === "todos" || fiscalizacao.status.toLowerCase() === filtroStatus.toLowerCase();
    const matchBusca = busca === "" || 
      fiscalizacao.contrato.toLowerCase().includes(busca.toLowerCase()) ||
      fiscalizacao.objeto.toLowerCase().includes(busca.toLowerCase()) ||
      fiscalizacao.fiscal.toLowerCase().includes(busca.toLowerCase());
    
    return matchStatus && matchBusca;
  });

  const handleSubmitFiscalizacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaFiscalizacao.contratoId || !novaFiscalizacao.dataFiscalizacao || !novaFiscalizacao.local) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      // Simular envio para API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const novoId = Math.max(...fiscalizacoes.map(f => f.id)) + 1;
      const contratoSelecionado = mockContratos.find(c => c.id === parseInt(novaFiscalizacao.contratoId));
      
      const novaFiscalizacaoCompleta = {
        id: novoId,
        contrato: contratoSelecionado?.numero || "",
        objeto: contratoSelecionado?.objeto || "",
        dataFiscalizacao: novaFiscalizacao.dataFiscalizacao,
        fiscal: contratoSelecionado?.fiscal || "Usuário Atual",
        local: novaFiscalizacao.local,
        status: "Agendada",
        tipoFiscalizacao: novaFiscalizacao.tipoFiscalizacao,
        observacoes: novaFiscalizacao.observacoes,
        pontuacao: null,
        conformidades: [],
        naoConformidades: [],
        proximaFiscalizacao: ""
      };

      setFiscalizacoes([novaFiscalizacaoCompleta, ...fiscalizacoes]);
      setNovaFiscalizacao({
        contratoId: "",
        dataFiscalizacao: "",
        local: "",
        tipoFiscalizacao: "Rotineira",
        observacoes: ""
      });
      
      toast.success("Fiscalização agendada com sucesso!");
    } catch (error) {
      toast.error("Erro ao agendar fiscalização");
    } finally {
      setLoading(false);
    }
  };

  const handleConcluirFiscalizacao = (id: number) => {
    setFiscalizacoes(fiscalizacoes.map(fiscalizacao => 
      fiscalizacao.id === id 
        ? { ...fiscalizacao, status: "Concluída", pontuacao: 8.5 }
        : fiscalizacao
    ));
    toast.success("Fiscalização marcada como concluída!");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Fiscalização</h1>
          <p className="text-green-600 mt-1">Gestão de fiscalizações de contratos</p>
        </div>
        {podeGerenciarFiscalizacao && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Agendar Fiscalização
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Agendar Nova Fiscalização</DialogTitle>
                <DialogDescription>
                  Agende uma fiscalização para um contrato específico
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitFiscalizacao} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contrato">Contrato *</Label>
                    <Select value={novaFiscalizacao.contratoId} onValueChange={(value) => 
                      setNovaFiscalizacao({...novaFiscalizacao, contratoId: value})
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
                    <Label htmlFor="dataFiscalizacao">Data da Fiscalização *</Label>
                    <Input
                      id="dataFiscalizacao"
                      type="date"
                      value={novaFiscalizacao.dataFiscalizacao}
                      onChange={(e) => setNovaFiscalizacao({...novaFiscalizacao, dataFiscalizacao: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="local">Local da Fiscalização *</Label>
                    <Input
                      id="local"
                      placeholder="Ex: Prédio A - 2º Andar"
                      value={novaFiscalizacao.local}
                      onChange={(e) => setNovaFiscalizacao({...novaFiscalizacao, local: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tipo">Tipo de Fiscalização</Label>
                    <Select value={novaFiscalizacao.tipoFiscalizacao} onValueChange={(value) => 
                      setNovaFiscalizacao({...novaFiscalizacao, tipoFiscalizacao: value})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rotineira">Rotineira</SelectItem>
                        <SelectItem value="Extraordinária">Extraordinária</SelectItem>
                        <SelectItem value="Emergencial">Emergencial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Descreva os pontos específicos a serem verificados..."
                    value={novaFiscalizacao.observacoes}
                    onChange={(e) => setNovaFiscalizacao({...novaFiscalizacao, observacoes: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">Cancelar</Button>
                  </DialogTrigger>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Agendando...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 mr-2" />
                        Agendar
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
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="concluída">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Fiscalizações */}
      <div className="grid gap-4">
        {fiscalizacoesFiltradas.map((fiscalizacao) => (
          <Card key={fiscalizacao.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Contrato {fiscalizacao.contrato}</CardTitle>
                  <CardDescription>{fiscalizacao.objeto}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getTipoColor(fiscalizacao.tipoFiscalizacao)}>
                    {fiscalizacao.tipoFiscalizacao}
                  </Badge>
                  <Badge className={`${getStatusColor(fiscalizacao.status)} text-white flex items-center gap-1`}>
                    {getStatusIcon(fiscalizacao.status)}
                    {fiscalizacao.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="detalhes" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                  <TabsTrigger value="conformidades">Conformidades</TabsTrigger>
                  <TabsTrigger value="historico">Histórico</TabsTrigger>
                </TabsList>
                
                <TabsContent value="detalhes" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-600">Data:</span>
                        <p>{new Date(fiscalizacao.dataFiscalizacao).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-600">Fiscal:</span>
                        <p>{fiscalizacao.fiscal}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-600">Local:</span>
                        <p>{fiscalizacao.local}</p>
                      </div>
                    </div>
                    {fiscalizacao.pontuacao && (
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="w-4 h-4 text-gray-500" />
                        <div>
                          <span className="font-medium text-gray-600">Pontuação:</span>
                          <p className="font-bold text-green-600">{fiscalizacao.pontuacao}/10</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {fiscalizacao.observacoes && (
                    <div>
                      <span className="font-medium text-gray-600">Observações:</span>
                      <p className="text-sm mt-1 p-3 bg-gray-50 rounded">{fiscalizacao.observacoes}</p>
                    </div>
                  )}

                  {fiscalizacao.proximaFiscalizacao && (
                    <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                      <span className="font-medium text-blue-800">Próxima Fiscalização:</span>
                      <p className="text-blue-700">{new Date(fiscalizacao.proximaFiscalizacao).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="conformidades" className="space-y-4">
                  {fiscalizacao.conformidades.length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Conformidades
                      </h4>
                      <ul className="space-y-1">
                        {fiscalizacao.conformidades.map((item, index) => (
                          <li key={index} className="text-sm p-2 bg-green-50 rounded flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {fiscalizacao.naoConformidades.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Não Conformidades
                      </h4>
                      <ul className="space-y-1">
                        {fiscalizacao.naoConformidades.map((item, index) => (
                          <li key={index} className="text-sm p-2 bg-red-50 rounded flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {fiscalizacao.conformidades.length === 0 && fiscalizacao.naoConformidades.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      {fiscalizacao.status === "Agendada" 
                        ? "Aguardando realização da fiscalização"
                        : "Nenhuma conformidade registrada ainda"
                      }
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="historico" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm p-2 bg-blue-50 rounded">
                      <Calendar className="w-3 h-3 text-blue-600" />
                      <span>Fiscalização agendada para {new Date(fiscalizacao.dataFiscalizacao).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {fiscalizacao.status === "Concluída" && (
                      <div className="flex items-center gap-2 text-sm p-2 bg-green-50 rounded">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span>Fiscalização concluída com pontuação {fiscalizacao.pontuacao}/10</span>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  Ver Detalhes
                </Button>
                {podeGerenciarFiscalizacao && fiscalizacao.status === "Agendada" && (
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                )}
                {podeGerenciarFiscalizacao && fiscalizacao.status === "Pendente" && (
                  <Button 
                    size="sm"
                    onClick={() => handleConcluirFiscalizacao(fiscalizacao.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Concluir
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {fiscalizacoesFiltradas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardCheck className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma fiscalização encontrada</h3>
            <p className="text-gray-500 text-center">
              {busca || filtroStatus !== "todos" 
                ? "Tente ajustar os filtros para encontrar fiscalizações."
                : "Não há fiscalizações cadastradas ainda."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
