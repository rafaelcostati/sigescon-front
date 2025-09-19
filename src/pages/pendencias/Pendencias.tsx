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
  AlertTriangle, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus,
  Search,
  Eye,
  Edit,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Mock data - substituir por dados reais da API
const mockPendencias = [
  {
    id: 1,
    contrato: "001/2024",
    objeto: "Prestação de serviços de limpeza",
    descricao: "Relatório mensal de janeiro pendente",
    dataPrazo: "2024-02-15",
    dataCriacao: "2024-01-20",
    status: "Urgente",
    prioridade: "Alta",
    criadoPor: "João Silva",
    responsavel: "Maria Santos",
    observacoes: "Necessário enviar relatório com detalhamento das atividades realizadas em janeiro",
    diasRestantes: -5,
    historico: [
      { data: "2024-01-20", acao: "Pendência criada", usuario: "João Silva" },
      { data: "2024-02-10", acao: "Lembrete enviado", usuario: "Sistema" }
    ]
  },
  {
    id: 2,
    contrato: "002/2024",
    objeto: "Fornecimento de material de escritório",
    descricao: "Documentação de renovação de contrato",
    dataPrazo: "2024-03-01",
    dataCriacao: "2024-02-01",
    status: "Pendente",
    prioridade: "Média",
    criadoPor: "Ana Costa",
    responsavel: "Pedro Lima",
    observacoes: "Preparar documentação necessária para renovação do contrato por mais 12 meses",
    diasRestantes: 10,
    historico: [
      { data: "2024-02-01", acao: "Pendência criada", usuario: "Ana Costa" }
    ]
  },
  {
    id: 3,
    contrato: "003/2024",
    objeto: "Manutenção de equipamentos",
    descricao: "Verificação de garantia dos equipamentos",
    dataPrazo: "2024-02-25",
    dataCriacao: "2024-02-05",
    status: "Concluída",
    prioridade: "Baixa",
    criadoPor: "Carlos Mendes",
    responsavel: "Lucia Oliveira",
    observacoes: "Verificar se todos os equipamentos estão dentro do prazo de garantia",
    diasRestantes: 0,
    dataResolucao: "2024-02-20",
    resolucao: "Verificação concluída. Todos os equipamentos estão dentro da garantia.",
    historico: [
      { data: "2024-02-05", acao: "Pendência criada", usuario: "Carlos Mendes" },
      { data: "2024-02-20", acao: "Pendência resolvida", usuario: "Lucia Oliveira" }
    ]
  }
];

const mockContratos = [
  { id: 1, numero: "001/2024", objeto: "Prestação de serviços de limpeza" },
  { id: 2, numero: "002/2024", objeto: "Fornecimento de material de escritório" },
  { id: 3, numero: "003/2024", objeto: "Manutenção de equipamentos" }
];

const mockUsuarios = [
  { id: 1, nome: "Maria Santos" },
  { id: 2, nome: "Pedro Lima" },
  { id: 3, nome: "Lucia Oliveira" },
  { id: 4, nome: "João Silva" },
  { id: 5, nome: "Ana Costa" }
];

export default function Pendencias() {
  const { perfilAtivo } = useAuth();
  const [pendencias, setPendencias] = useState(mockPendencias);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState("todos");
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(false);
  const [novaPendencia, setNovaPendencia] = useState({
    contratoId: "",
    descricao: "",
    dataPrazo: "",
    prioridade: "Média",
    responsavelId: "",
    observacoes: ""
  });

  const podeGerenciarPendencias = perfilAtivo?.nome === "Administrador" || perfilAtivo?.nome === "Gestor";
  const podeResolverPendencias = perfilAtivo?.nome === "Administrador" || perfilAtivo?.nome === "Gestor" || perfilAtivo?.nome === "Fiscal";

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluída': return 'bg-green-500';
      case 'Pendente': return 'bg-yellow-500';
      case 'Urgente': return 'bg-red-500';
      case 'Atrasada': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Concluída': return <CheckCircle className="w-4 h-4" />;
      case 'Pendente': return <Clock className="w-4 h-4" />;
      case 'Urgente': return <AlertTriangle className="w-4 h-4" />;
      case 'Atrasada': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const calcularDiasRestantes = (dataPrazo: string) => {
    const hoje = new Date();
    const prazo = new Date(dataPrazo);
    const diffTime = prazo.getTime() - hoje.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const pendenciasFiltradas = pendencias.filter(pendencia => {
    const matchStatus = filtroStatus === "todos" || pendencia.status.toLowerCase() === filtroStatus.toLowerCase();
    const matchPrioridade = filtroPrioridade === "todos" || pendencia.prioridade.toLowerCase() === filtroPrioridade.toLowerCase();
    const matchBusca = busca === "" || 
      pendencia.contrato.toLowerCase().includes(busca.toLowerCase()) ||
      pendencia.objeto.toLowerCase().includes(busca.toLowerCase()) ||
      pendencia.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      pendencia.responsavel.toLowerCase().includes(busca.toLowerCase());
    
    return matchStatus && matchPrioridade && matchBusca;
  });

  const handleSubmitPendencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaPendencia.contratoId || !novaPendencia.descricao || !novaPendencia.dataPrazo || !novaPendencia.responsavelId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      // Simular envio para API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const novoId = Math.max(...pendencias.map(p => p.id)) + 1;
      const contratoSelecionado = mockContratos.find(c => c.id === parseInt(novaPendencia.contratoId));
      const responsavelSelecionado = mockUsuarios.find(u => u.id === parseInt(novaPendencia.responsavelId));
      
      const diasRestantes = calcularDiasRestantes(novaPendencia.dataPrazo);
      const status = diasRestantes < 0 ? "Atrasada" : diasRestantes <= 3 ? "Urgente" : "Pendente";
      
      const novaPendenciaCompleta = {
        id: novoId,
        contrato: contratoSelecionado?.numero || "",
        objeto: contratoSelecionado?.objeto || "",
        descricao: novaPendencia.descricao,
        dataPrazo: novaPendencia.dataPrazo,
        dataCriacao: new Date().toISOString().split('T')[0],
        status: status,
        prioridade: novaPendencia.prioridade,
        criadoPor: "Usuário Atual", // Pegar do contexto
        responsavel: responsavelSelecionado?.nome || "",
        observacoes: novaPendencia.observacoes,
        diasRestantes: diasRestantes,
        historico: [
          { 
            data: new Date().toISOString().split('T')[0], 
            acao: "Pendência criada", 
            usuario: "Usuário Atual" 
          }
        ]
      };

      setPendencias([novaPendenciaCompleta, ...pendencias]);
      setNovaPendencia({
        contratoId: "",
        descricao: "",
        dataPrazo: "",
        prioridade: "Média",
        responsavelId: "",
        observacoes: ""
      });
      
      toast.success("Pendência criada com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar pendência");
    } finally {
      setLoading(false);
    }
  };

  const handleResolverPendencia = async (id: number, resolucao: string) => {
    setLoading(true);
    try {
      // Simular resolução na API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPendencias(pendencias.map(pendencia => 
        pendencia.id === id 
          ? {
              ...pendencia,
              status: "Concluída",
              dataResolucao: new Date().toISOString().split('T')[0],
              resolucao: resolucao,
              historico: [
                ...pendencia.historico,
                { 
                  data: new Date().toISOString().split('T')[0], 
                  acao: "Pendência resolvida", 
                  usuario: "Usuário Atual" 
                }
              ]
            }
          : pendencia
      ));
      
      toast.success("Pendência resolvida com sucesso!");
    } catch (error) {
      toast.error("Erro ao resolver pendência");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-orange-800">Pendências</h1>
          <p className="text-orange-600 mt-1">Gestão de pendências de contratos</p>
        </div>
        {podeGerenciarPendencias && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Pendência
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Pendência</DialogTitle>
                <DialogDescription>
                  Crie uma nova pendência para um contrato específico
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitPendencia} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contrato">Contrato *</Label>
                    <Select value={novaPendencia.contratoId} onValueChange={(value) => 
                      setNovaPendencia({...novaPendencia, contratoId: value})
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
                    <Label htmlFor="responsavel">Responsável *</Label>
                    <Select value={novaPendencia.responsavelId} onValueChange={(value) => 
                      setNovaPendencia({...novaPendencia, responsavelId: value})
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockUsuarios.map(usuario => (
                          <SelectItem key={usuario.id} value={usuario.id.toString()}>
                            {usuario.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Input
                    id="descricao"
                    placeholder="Descreva a pendência..."
                    value={novaPendencia.descricao}
                    onChange={(e) => setNovaPendencia({...novaPendencia, descricao: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dataPrazo">Data Prazo *</Label>
                    <Input
                      id="dataPrazo"
                      type="date"
                      value={novaPendencia.dataPrazo}
                      onChange={(e) => setNovaPendencia({...novaPendencia, dataPrazo: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select value={novaPendencia.prioridade} onValueChange={(value) => 
                      setNovaPendencia({...novaPendencia, prioridade: value})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Baixa">Baixa</SelectItem>
                        <SelectItem value="Média">Média</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Informações adicionais sobre a pendência..."
                    value={novaPendencia.observacoes}
                    onChange={(e) => setNovaPendencia({...novaPendencia, observacoes: e.target.value})}
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
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Pendência
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
                  placeholder="Buscar por contrato, descrição ou responsável..."
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
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="atrasada">Atrasada</SelectItem>
                  <SelectItem value="concluída">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="média">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pendências */}
      <div className="grid gap-4">
        {pendenciasFiltradas.map((pendencia) => (
          <Card key={pendencia.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Contrato {pendencia.contrato}</CardTitle>
                  <CardDescription>{pendencia.objeto}</CardDescription>
                  <p className="text-sm font-medium mt-1">{pendencia.descricao}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getPrioridadeColor(pendencia.prioridade)}>
                    {pendencia.prioridade}
                  </Badge>
                  <Badge className={`${getStatusColor(pendencia.status)} text-white flex items-center gap-1`}>
                    {getStatusIcon(pendencia.status)}
                    {pendencia.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="font-medium text-gray-600">Prazo:</span>
                    <p className={pendencia.diasRestantes < 0 ? "text-red-600 font-medium" : ""}>
                      {new Date(pendencia.dataPrazo).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="font-medium text-gray-600">Responsável:</span>
                    <p>{pendencia.responsavel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="font-medium text-gray-600">Dias restantes:</span>
                    <p className={pendencia.diasRestantes < 0 ? "text-red-600 font-medium" : pendencia.diasRestantes <= 3 ? "text-yellow-600 font-medium" : ""}>
                      {pendencia.diasRestantes < 0 ? `${Math.abs(pendencia.diasRestantes)} dias atrasado` : `${pendencia.diasRestantes} dias`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="font-medium text-gray-600">Criado por:</span>
                    <p>{pendencia.criadoPor}</p>
                  </div>
                </div>
              </div>

              {pendencia.observacoes && (
                <div>
                  <span className="font-medium text-gray-600">Observações:</span>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded">{pendencia.observacoes}</p>
                </div>
              )}

              {pendencia.resolucao && (
                <div>
                  <span className="font-medium text-green-600">Resolução:</span>
                  <p className="text-sm mt-1 p-3 bg-green-50 rounded border-l-4 border-green-400">{pendencia.resolucao}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Resolvida em {pendencia.dataResolucao ? new Date(pendencia.dataResolucao).toLocaleDateString('pt-BR') : ''}
                  </p>
                </div>
              )}

              {/* Histórico */}
              {pendencia.historico && pendencia.historico.length > 0 && (
                <div>
                  <span className="font-medium text-gray-600">Histórico:</span>
                  <div className="mt-2 space-y-1">
                    {pendencia.historico.map((item, index) => (
                      <div key={index} className="text-xs p-2 bg-gray-50 rounded flex items-center gap-2">
                        <MessageSquare className="w-3 h-3 text-gray-400" />
                        <span>{new Date(item.data).toLocaleDateString('pt-BR')}</span>
                        <span>-</span>
                        <span>{item.acao}</span>
                        <span>por {item.usuario}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-xs text-gray-500">
                  Criada em {new Date(pendencia.dataCriacao).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Ver Detalhes
                  </Button>
                  {podeGerenciarPendencias && pendencia.status !== "Concluída" && (
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  )}
                  {podeResolverPendencias && pendencia.status !== "Concluída" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolver
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Resolver Pendência</DialogTitle>
                          <DialogDescription>
                            Descreva como a pendência foi resolvida
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.target as HTMLFormElement);
                          const resolucao = formData.get('resolucao') as string;
                          if (resolucao.trim()) {
                            handleResolverPendencia(pendencia.id, resolucao);
                          }
                        }}>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="resolucao">Descrição da Resolução *</Label>
                              <Textarea
                                id="resolucao"
                                name="resolucao"
                                placeholder="Descreva como a pendência foi resolvida..."
                                required
                                rows={4}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <DialogTrigger asChild>
                                <Button type="button" variant="outline">Cancelar</Button>
                              </DialogTrigger>
                              <Button type="submit" disabled={loading}>
                                {loading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Resolvendo...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Resolver
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pendenciasFiltradas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma pendência encontrada</h3>
            <p className="text-gray-500 text-center">
              {busca || filtroStatus !== "todos" || filtroPrioridade !== "todos"
                ? "Tente ajustar os filtros para encontrar pendências."
                : "Não há pendências cadastradas ainda."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
