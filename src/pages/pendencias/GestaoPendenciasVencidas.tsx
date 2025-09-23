import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertTriangle, 
  Calendar, 
  User, 
  FileText, 
  Clock, 
  Search,
  Users,
  Filter,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  getDashboardAdminPendenciasVencidas, 
  getDashboardFiscalPendencias,
  getDashboardAdminPendenciasPendentes,
  type PendenciaVencida,
  type PendenciaFiscal,
  type DashboardAdminPendenciasVencidasResponseOld,
  type DashboardFiscalPendenciasResponse
} from "@/lib/api";

export default function GestaoPendencias() {
  const { perfilAtivo } = useAuth();
  const isAdmin = perfilAtivo?.nome === "Administrador";
  const isFiscal = perfilAtivo?.nome === "Fiscal";
  const isGestor = perfilAtivo?.nome === "Gestor";

  // Estados para administrador
  const [dashboardAdmin, setDashboardAdmin] = useState<DashboardAdminPendenciasVencidasResponseOld | null>(null);
  const [pendenciasVencidas, setPendenciasVencidas] = useState<PendenciaVencida[]>([]);
  const [pendenciasPendentes, setPendenciasPendentes] = useState<any[]>([]);

  // Estados para fiscal e gestor
  const [dashboardFiscal, setDashboardFiscal] = useState<DashboardFiscalPendenciasResponse | null>(null);
  const [pendenciasFiscal, setPendenciasFiscal] = useState<PendenciaFiscal[]>([]);

  // Estados gerais
  const [loading, setLoading] = useState(true);
  const [filtroUrgencia, setFiltroUrgencia] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos"); // "todos", "vencidas", "pendentes"
  const [busca, setBusca] = useState("");

  // Carregar dados baseado no perfil
  useEffect(() => {
    loadPendenciasVencidas();
  }, [perfilAtivo]);

  const loadPendenciasVencidas = async () => {
    if (!perfilAtivo) return;

    setLoading(true);
    try {
      if (isAdmin) {
        console.log("🔍 Carregando pendências para administrador...");
        
        // Carregar pendências vencidas
        const responseVencidas = await getDashboardAdminPendenciasVencidas();
        setDashboardAdmin(responseVencidas);
        setPendenciasVencidas(responseVencidas.pendencias_vencidas);
        
        // Carregar pendências pendentes
        const responsePendentes = await getDashboardAdminPendenciasPendentes();
        setPendenciasPendentes(responsePendentes.pendencias_pendentes);
        
        console.log("📊 GESTÃO PENDÊNCIAS - Vencidas:", responseVencidas.pendencias_vencidas.length, "Pendentes:", responsePendentes.pendencias_pendentes.length);
        
      } else if (isFiscal || isGestor) {
        console.log(`🔍 Carregando pendências para ${perfilAtivo.nome.toLowerCase()}...`);
        const response = await getDashboardFiscalPendencias();
        setDashboardFiscal(response);
        
        // Separar pendências vencidas e pendentes
        const vencidas = response.pendencias.filter(p => p.em_atraso);
        const pendentes = response.pendencias.filter(p => !p.em_atraso);
        setPendenciasFiscal(vencidas);
        setPendenciasPendentes(pendentes);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar pendências:", error);
      toast.error("Erro ao carregar pendências");
    } finally {
      setLoading(false);
    }
  };

  // Função para obter cor da urgência
  const getUrgenciaColor = (urgencia: string | number) => {
    if (typeof urgencia === 'number') {
      // Para fiscal - baseado em dias em atraso
      if (urgencia <= -30) return 'bg-red-600 text-white'; // Crítica
      if (urgencia <= -15) return 'bg-orange-500 text-white'; // Alta
      return 'bg-yellow-500 text-white'; // Média
    }
    
    // Para admin - baseado na urgência da API
    switch (urgencia) {
      case 'CRÍTICA': return 'bg-red-600 text-white';
      case 'ALTA': return 'bg-orange-500 text-white';
      case 'MÉDIA': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Função para obter texto da urgência
  const getUrgenciaText = (urgencia: string | number) => {
    if (typeof urgencia === 'number') {
      if (urgencia <= -30) return 'CRÍTICA';
      if (urgencia <= -15) return 'ALTA';
      return 'MÉDIA';
    }
    return urgencia;
  };

  // Combinar todas as pendências baseado no filtro de tipo
  const todasPendencias = isAdmin 
    ? (() => {
        let lista: any[] = [];
        if (filtroTipo === "todos" || filtroTipo === "vencidas") {
          lista = [...lista, ...pendenciasVencidas.map(p => ({ ...p, tipo: 'vencida' }))];
        }
        if (filtroTipo === "todos" || filtroTipo === "pendentes") {
          lista = [...lista, ...pendenciasPendentes.map(p => ({ ...p, tipo: 'pendente' }))];
        }
        return lista;
      })()
    : (() => {
        let lista: any[] = [];
        if (filtroTipo === "todos" || filtroTipo === "vencidas") {
          lista = [...lista, ...pendenciasFiscal.map(p => ({ ...p, tipo: 'vencida' }))];
        }
        if (filtroTipo === "todos" || filtroTipo === "pendentes") {
          lista = [...lista, ...pendenciasPendentes.map(p => ({ ...p, tipo: 'pendente' }))];
        }
        return lista;
      })();

  // Filtrar pendências baseado na busca, urgência e tipo
  const pendenciasFiltradas = todasPendencias.filter(pendencia => {
    // Filtro de urgência
    let matchUrgencia = true;
    if (filtroUrgencia !== "todos") {
      if (pendencia.tipo === 'vencida') {
        if (isAdmin) {
          matchUrgencia = pendencia.urgencia?.toLowerCase() === filtroUrgencia.toLowerCase();
        } else {
          const urgenciaCalculada = getUrgenciaText(pendencia.dias_restantes);
          matchUrgencia = urgenciaCalculada.toLowerCase() === filtroUrgencia.toLowerCase();
        }
      } else {
        // Para pendências pendentes, não aplicar filtro de urgência
        matchUrgencia = filtroUrgencia === "todos";
      }
    }

    // Filtro de busca
    const matchBusca = busca === "" || 
      (pendencia.contrato_numero || pendencia.contrato_numero)?.toLowerCase().includes(busca.toLowerCase()) ||
      (pendencia.contrato_objeto || pendencia.contrato_objeto)?.toLowerCase().includes(busca.toLowerCase()) ||
      (pendencia.titulo || pendencia.descricao || pendencia.pendencia_titulo)?.toLowerCase().includes(busca.toLowerCase()) ||
      (pendencia.fiscal_nome)?.toLowerCase().includes(busca.toLowerCase()) ||
      (pendencia.gestor_nome)?.toLowerCase().includes(busca.toLowerCase());
    
    return matchUrgencia && matchBusca;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="ml-2 text-orange-600">Carregando pendências...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-red-800">
            {isAdmin ? "Gestão de Pendências" : isGestor ? "Pendências - Gestão" : "Minhas Pendências"}
          </h1>
          <p className="text-red-600 mt-1">
            {isAdmin 
              ? "Contratos com pendências vencidas e pendentes no sistema" 
              : isGestor
              ? "Contratos sob sua gestão com pendências"
              : "Seus contratos com pendências"
            }
          </p>
        </div>
        <Button 
          onClick={loadPendenciasVencidas} 
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-red-800">
              Pendências Vencidas
            </CardTitle>
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {isAdmin 
                ? dashboardAdmin?.total_pendencias_vencidas || 0
                : dashboardFiscal?.pendencias_em_atraso || 0
              }
            </div>
            <p className="text-sm text-red-600 mt-2">
              Requerem ação urgente
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-orange-800">
              Pendências Pendentes
            </CardTitle>
            <Clock className="h-6 w-6 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {pendenciasPendentes.length}
            </div>
            <p className="text-sm text-orange-600 mt-2">
              Aguardando resposta do fiscal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="busca"
                  placeholder="Buscar por contrato, título, fiscal ou gestor..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="vencidas">Vencidas</SelectItem>
                  <SelectItem value="pendentes">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="urgencia">Urgência</Label>
              <Select value={filtroUrgencia} onValueChange={setFiltroUrgencia}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="crítica">Crítica</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="média">Média</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Pendências Vencidas */}
      {pendenciasFiltradas.some(p => p.tipo === 'vencida') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-semibold text-red-800">Pendências Vencidas</h2>
            <Badge className="bg-red-100 text-red-800">
              {pendenciasFiltradas.filter(p => p.tipo === 'vencida').length}
            </Badge>
          </div>
          <div className="grid gap-4">
            {pendenciasFiltradas.filter(p => p.tipo === 'vencida').map((pendencia) => (
              <Card key={`vencida-${pendencia.pendencia_id}`} 
                    className="hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Contrato {pendencia.contrato_numero}
                      </CardTitle>
                      <CardDescription>
                        {pendencia.contrato_objeto}
                      </CardDescription>
                      <p className="text-sm font-medium mt-1">
                        {pendencia.titulo || pendencia.descricao || pendencia.pendencia_titulo}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getUrgenciaColor(
                        isAdmin ? pendencia.urgencia : pendencia.dias_restantes
                      )}>
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {getUrgenciaText(
                          isAdmin ? pendencia.urgencia : pendencia.dias_restantes
                        )}
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
                        <p className="font-medium text-red-600">
                          {pendencia.data_prazo || pendencia.prazo_entrega 
                            ? new Date(pendencia.data_prazo || pendencia.prazo_entrega).toLocaleDateString('pt-BR')
                            : 'Sem prazo definido'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-600">Dias em atraso:</span>
                        <p className="font-bold text-red-600">
                          {pendencia.dias_em_atraso || Math.abs(pendencia.dias_restantes)} dias
                        </p>
                      </div>
                    </div>

                    {isAdmin && (
                      <>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <span className="font-medium text-gray-600">Fiscal:</span>
                            <p>{pendencia.fiscal_nome}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <div>
                            <span className="font-medium text-gray-600">Gestor:</span>
                            <p>{pendencia.gestor_nome}</p>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-600">Criada em:</span>
                        <p>
                          {new Date(pendencia.data_criacao || pendencia.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-600">Descrição:</span>
                    <p className="text-sm mt-1 p-3 bg-red-50 rounded border-l-4 border-red-400">
                      {pendencia.descricao || pendencia.pendencia_descricao || pendencia.titulo}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-xs text-red-600 font-medium">
                      ⚠️ PENDÊNCIA VENCIDA - Ação urgente necessária
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Seção de Pendências Pendentes */}
      {pendenciasFiltradas.some(p => p.tipo === 'pendente') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-orange-800">Pendências Pendentes</h2>
            <Badge className="bg-orange-100 text-orange-800">
              {pendenciasFiltradas.filter(p => p.tipo === 'pendente').length}
            </Badge>
          </div>
          <div className="grid gap-4">
            {pendenciasFiltradas.filter(p => p.tipo === 'pendente').map((pendencia) => (
              <Card key={`pendente-${pendencia.pendencia_id}`} 
                    className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Contrato {pendencia.contrato_numero}
                      </CardTitle>
                      <CardDescription>
                        {pendencia.contrato_objeto}
                      </CardDescription>
                      <p className="text-sm font-medium mt-1">
                        {pendencia.titulo || pendencia.descricao || pendencia.pendencia_titulo}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-orange-500 text-white">
                        <Clock className="w-3 h-3 mr-1" />
                        PENDENTE
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
                        <p className="font-medium text-orange-600">
                          {pendencia.data_prazo || pendencia.prazo_entrega 
                            ? new Date(pendencia.data_prazo || pendencia.prazo_entrega).toLocaleDateString('pt-BR')
                            : 'Sem prazo definido'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-600">Dias restantes:</span>
                        <p className="font-bold text-orange-600">
                          {pendencia.dias_restantes !== null 
                            ? `${pendencia.dias_restantes} dias`
                            : 'Sem prazo'
                          }
                        </p>
                      </div>
                    </div>

                    {isAdmin && (
                      <>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <span className="font-medium text-gray-600">Fiscal:</span>
                            <p>{pendencia.fiscal_nome}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <div>
                            <span className="font-medium text-gray-600">Gestor:</span>
                            <p>{pendencia.gestor_nome}</p>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-600">Criada em:</span>
                        <p>
                          {new Date(pendencia.data_criacao || pendencia.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-600">Descrição:</span>
                    <p className="text-sm mt-1 p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                      {pendencia.descricao || pendencia.pendencia_descricao || pendencia.titulo}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-xs text-orange-600 font-medium">
                      ⏳ PENDÊNCIA PENDENTE - Aguardando resposta do fiscal
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {pendenciasFiltradas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {busca || filtroUrgencia !== "todos" || filtroTipo !== "todos"
                ? "Nenhuma pendência encontrada com os filtros aplicados"
                : "Nenhuma pendência encontrada"
              }
            </h3>
            <p className="text-gray-500 text-center">
              {busca || filtroUrgencia !== "todos" || filtroTipo !== "todos"
                ? "Tente ajustar os filtros para encontrar pendências."
                : isAdmin
                  ? "Não há pendências no sistema no momento."
                  : isGestor
                  ? "Você não possui contratos com pendências."
                  : "Você não possui pendências no momento."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
