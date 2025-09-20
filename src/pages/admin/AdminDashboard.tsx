import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Eye,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  getDashboardAdminCompleto,
  type DashboardAdminCompletoResponse
} from "@/lib/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardAdminCompletoResponse | null>(null);

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      console.log("🔍 Carregando dashboard completo do administrador...");
      const data = await getDashboardAdminCompleto();
      setDashboardData(data);
      console.log("✅ Dashboard carregado:", data);
    } catch (error) {
      console.error("❌ Erro ao carregar dashboard:", error);
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Erro ao carregar dashboard</h3>
          <Button onClick={loadDashboardData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const { contadores, contratos_com_relatorios_pendentes, contratos_com_pendencias } = dashboardData;

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-red-800">Dashboard Administrativo</h1>
          <p className="text-red-600 mt-1">Visão geral completa do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDashboardData} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => navigate('/gestao-relatorios')} className="bg-red-600 hover:bg-red-700">
            <BarChart3 className="w-4 h-4 mr-2" />
            Gestão de Relatórios
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Relatórios para Análise */}
        <Card className="border-red-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Relatórios para Análise</CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{contadores.relatorios_para_analise}</div>
            <p className="text-xs text-red-600 mt-1">Aguardando aprovação</p>
          </CardContent>
        </Card>

        {/* Contratos Ativos */}
        <Card className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Contratos Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{contadores.contratos_ativos}</div>
            <p className="text-xs text-green-600 mt-1">Em execução</p>
          </CardContent>
        </Card>

        {/* Contratos com Pendências */}
        <Card className="border-yellow-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Contratos com Pendências</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{contadores.contratos_com_pendencias}</div>
            <p className="text-xs text-yellow-600 mt-1">Requer atenção</p>
          </CardContent>
        </Card>

        {/* Usuários Ativos */}
        <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{contadores.usuarios_ativos}</div>
            <p className="text-xs text-blue-600 mt-1">No sistema</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Contratos com Relatórios Pendentes e Contratos com Pendências */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contratos com Relatórios Pendentes */}
        <Card className="border-red-200 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-red-800">Contratos com Relatórios Pendentes</CardTitle>
                <CardDescription>Relatórios aguardando análise</CardDescription>
              </div>
              <Button 
                onClick={() => navigate('/gestao-relatorios')} 
                variant="outline" 
                size="sm"
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                Analisar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {contratos_com_relatorios_pendentes.length > 0 ? (
              contratos_com_relatorios_pendentes.slice(0, 3).map((contrato) => (
                <div key={contrato.id} className="border border-red-100 rounded-lg p-4 hover:bg-red-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-red-800">{contrato.nr_contrato}</h4>
                      <p className="text-sm text-gray-600 truncate">{contrato.objeto}</p>
                    </div>
                    <Badge className="bg-red-500 text-white">
                      {contrato.relatorios_pendentes_count} relatórios
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Contratado:</span>
                      <span className="font-medium">{contrato.contratado_nome}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Gestor:</span>
                      <span className="font-medium">{contrato.gestor_nome}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fiscal:</span>
                      <span className="font-medium">{contrato.fiscal_nome}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Último relatório:</span>
                      <span className="font-medium">
                        {new Date(contrato.ultimo_relatorio_data).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button 
                        onClick={() => navigate(`/contratos/${contrato.id}`)}
                        size="sm" 
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhum relatório pendente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contratos com Pendências */}
        <Card className="border-orange-200 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-orange-800">Contratos com Pendências</CardTitle>
                <CardDescription>Contratos que requerem atenção</CardDescription>
              </div>
              <Button 
                onClick={() => navigate('/pendencias')} 
                variant="outline" 
                size="sm"
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {contratos_com_pendencias.length > 0 ? (
              contratos_com_pendencias.slice(0, 3).map((contrato) => (
                <div key={contrato.id} className="border border-orange-100 rounded-lg p-4 hover:bg-orange-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-orange-800">{contrato.nr_contrato}</h4>
                      <p className="text-sm text-gray-600 truncate">{contrato.objeto}</p>
                    </div>
                    <div className="flex gap-1">
                      <Badge className="bg-orange-500 text-white">
                        {contrato.pendencias_count} pendências
                      </Badge>
                      {contrato.pendencias_em_atraso > 0 && (
                        <Badge className="bg-red-500 text-white">
                          {contrato.pendencias_em_atraso} em atraso
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Contratado:</span>
                      <span className="font-medium">{contrato.contratado_nome}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Gestor:</span>
                      <span className="font-medium">{contrato.gestor_nome}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fiscal:</span>
                      <span className="font-medium">{contrato.fiscal_nome}</span>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button 
                        onClick={() => navigate(`/contratos/${contrato.id}`)}
                        size="sm" 
                        variant="outline"
                        className="border-orange-200 text-orange-700 hover:bg-orange-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma pendência encontrada</p>
              </div>
            )}
            
            {/* Ações Rápidas */}
            <div className="border-t border-orange-200 pt-4 mt-4">
              <h5 className="font-semibold text-orange-800 mb-3">Ações Rápidas</h5>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => navigate('/contratos')} 
                  variant="outline" 
                  size="sm"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver Contratos
                </Button>
                <Button 
                  onClick={() => navigate('/usuarios')} 
                  variant="outline" 
                  size="sm"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Users className="w-4 h-4 mr-1" />
                  Gerenciar Usuários
                </Button>
                <Button 
                  onClick={() => navigate('/pendencias-vencidas')} 
                  variant="outline" 
                  size="sm"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Pendências Vencidas
                </Button>
                <Button 
                  onClick={() => navigate('/gestao-relatorios')} 
                  variant="outline" 
                  size="sm"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Gestão Relatórios
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
