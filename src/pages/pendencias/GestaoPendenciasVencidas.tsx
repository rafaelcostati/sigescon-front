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
  Eye,
  Users,
  Filter,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  getDashboardAdminPendenciasVencidas, 
  getDashboardFiscalPendencias,
  type PendenciaVencida,
  type PendenciaFiscal,
  type DashboardAdminPendenciasVencidasResponseOld,
  type DashboardFiscalPendenciasResponse
} from "@/lib/api";

export default function GestaoPendenciasVencidas() {
  const { perfilAtivo } = useAuth();
  const isAdmin = perfilAtivo?.nome === "Administrador";
  const isFiscal = perfilAtivo?.nome === "Fiscal";
  const isGestor = perfilAtivo?.nome === "Gestor";

  // Estados para administrador
  const [dashboardAdmin, setDashboardAdmin] = useState<DashboardAdminPendenciasVencidasResponseOld | null>(null);
  const [pendenciasVencidas, setPendenciasVencidas] = useState<PendenciaVencida[]>([]);

  // Estados para fiscal e gestor
  const [dashboardFiscal, setDashboardFiscal] = useState<DashboardFiscalPendenciasResponse | null>(null);
  const [pendenciasFiscal, setPendenciasFiscal] = useState<PendenciaFiscal[]>([]);

  // Estados gerais
  const [loading, setLoading] = useState(true);
  const [filtroUrgencia, setFiltroUrgencia] = useState("todos");
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
        console.log("🔍 Carregando pendências vencidas para administrador...");
        const response = await getDashboardAdminPendenciasVencidas();
        setDashboardAdmin(response);
        setPendenciasVencidas(response.pendencias_vencidas);
      } else if (isFiscal || isGestor) {
        console.log(`🔍 Carregando pendências para ${perfilAtivo.nome.toLowerCase()}...`);
        const response = await getDashboardFiscalPendencias();
        setDashboardFiscal(response);
        
        // Filtrar apenas pendências vencidas
        const vencidas = response.pendencias.filter(p => p.em_atraso);
        setPendenciasFiscal(vencidas);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar pendências:", error);
      toast.error("Erro ao carregar pendências vencidas");
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

  // Filtrar pendências baseado na busca e urgência
  const pendenciasFiltradas = isAdmin 
    ? pendenciasVencidas.filter(pendencia => {
        const matchUrgencia = filtroUrgencia === "todos" || pendencia.urgencia.toLowerCase() === filtroUrgencia.toLowerCase();
        const matchBusca = busca === "" || 
          pendencia.contrato_numero.toLowerCase().includes(busca.toLowerCase()) ||
          pendencia.contrato_objeto.toLowerCase().includes(busca.toLowerCase()) ||
          pendencia.titulo.toLowerCase().includes(busca.toLowerCase()) ||
          pendencia.fiscal_nome.toLowerCase().includes(busca.toLowerCase()) ||
          pendencia.gestor_nome.toLowerCase().includes(busca.toLowerCase());
        
        return matchUrgencia && matchBusca;
      })
    : pendenciasFiscal.filter(pendencia => {
        const urgenciaCalculada = getUrgenciaText(pendencia.dias_restantes);
        const matchUrgencia = filtroUrgencia === "todos" || urgenciaCalculada.toLowerCase() === filtroUrgencia.toLowerCase();
        const matchBusca = busca === "" || 
          pendencia.contrato_numero.toLowerCase().includes(busca.toLowerCase()) ||
          pendencia.contrato_objeto.toLowerCase().includes(busca.toLowerCase()) ||
          pendencia.pendencia_titulo.toLowerCase().includes(busca.toLowerCase());
        
        return matchUrgencia && matchBusca;
      });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="ml-2 text-orange-600">Carregando pendências vencidas...</span>
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
            {isAdmin ? "Gestão de Pendências Vencidas" : isGestor ? "Pendências Vencidas - Gestão" : "Minhas Pendências Vencidas"}
          </h1>
          <p className="text-red-600 mt-1">
            {isAdmin 
              ? "Contratos com pendências vencidas no sistema" 
              : isGestor
              ? "Contratos sob sua gestão com pendências vencidas"
              : "Seus contratos com pendências em atraso"
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

      {/* Card de Estatísticas Simplificado */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-red-800">
              Total de Pendências Vencidas
            </CardTitle>
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600">
              {isAdmin 
                ? dashboardAdmin?.total_pendencias_vencidas || 0
                : dashboardFiscal?.pendencias_em_atraso || 0
              }
            </div>
            <p className="text-sm text-red-600 mt-2">
              {isAdmin 
                ? `${dashboardAdmin?.contratos_afetados || 0} contratos afetados`
                : isGestor
                ? "Contratos sob sua gestão"
                : "Seus contratos em atraso"
              }
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

      {/* Lista de Pendências Vencidas */}
      <div className="grid gap-4">
        {pendenciasFiltradas.map((pendencia) => (
          <Card key={isAdmin ? (pendencia as PendenciaVencida).pendencia_id : (pendencia as PendenciaFiscal).pendencia_id} 
                className="hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    Contrato {isAdmin ? (pendencia as PendenciaVencida).contrato_numero : (pendencia as PendenciaFiscal).contrato_numero}
                  </CardTitle>
                  <CardDescription>
                    {isAdmin ? (pendencia as PendenciaVencida).contrato_objeto : (pendencia as PendenciaFiscal).contrato_objeto}
                  </CardDescription>
                  <p className="text-sm font-medium mt-1">
                    {isAdmin ? (pendencia as PendenciaVencida).titulo : (pendencia as PendenciaFiscal).pendencia_titulo}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getUrgenciaColor(
                    isAdmin ? (pendencia as PendenciaVencida).urgencia : (pendencia as PendenciaFiscal).dias_restantes
                  )}>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {getUrgenciaText(
                      isAdmin ? (pendencia as PendenciaVencida).urgencia : (pendencia as PendenciaFiscal).dias_restantes
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
                    <p className="text-red-600 font-medium">
                      {new Date(isAdmin ? (pendencia as PendenciaVencida).prazo_entrega : (pendencia as PendenciaFiscal).prazo_entrega).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="font-medium text-gray-600">Dias em atraso:</span>
                    <p className="text-red-600 font-bold">
                      {isAdmin 
                        ? `${(pendencia as PendenciaVencida).dias_em_atraso} dias`
                        : `${Math.abs((pendencia as PendenciaFiscal).dias_restantes)} dias`
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
                        <p>{(pendencia as PendenciaVencida).fiscal_nome}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-600">Gestor:</span>
                        <p>{(pendencia as PendenciaVencida).gestor_nome}</p>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="font-medium text-gray-600">Criada em:</span>
                    <p>
                      {new Date(isAdmin ? (pendencia as PendenciaVencida).data_criacao : (pendencia as PendenciaFiscal).data_criacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <span className="font-medium text-gray-600">Descrição:</span>
                <p className="text-sm mt-1 p-3 bg-red-50 rounded border-l-4 border-red-400">
                  {isAdmin ? (pendencia as PendenciaVencida).descricao : (pendencia as PendenciaFiscal).pendencia_descricao}
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-xs text-red-600 font-medium">
                  ⚠️ PENDÊNCIA VENCIDA - Ação urgente necessária
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Ver Detalhes
                  </Button>
                  {isAdmin && (
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Cobrar Responsável
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado vazio */}
      {pendenciasFiltradas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {busca || filtroUrgencia !== "todos"
                ? "Nenhuma pendência encontrada com os filtros aplicados"
                : "Nenhuma pendência vencida encontrada"
              }
            </h3>
            <p className="text-gray-500 text-center">
              {busca || filtroUrgencia !== "todos"
                ? "Tente ajustar os filtros para encontrar pendências."
                : isAdmin
                  ? "Parabéns! Não há pendências vencidas no sistema."
                  : isGestor
                  ? "Você não possui contratos com pendências vencidas."
                  : "Você não possui pendências vencidas no momento."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
