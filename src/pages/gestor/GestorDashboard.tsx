import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  IconFileText,
  IconBuilding,
  IconAlertTriangle,
  IconReportAnalytics,
  IconPlus,
  IconRefresh,
  IconClock,
  IconCheck,
  IconX,
  IconUser,
  IconCalendar,
} from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  getDashboardGestorCompleto,
  type DashboardGestorCompletoResponse,
  type PendenciaGestor
} from "@/lib/api";

export function GestorDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardGestorCompletoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      console.log("🔍 Carregando dashboard completo do gestor...");
      const data = await getDashboardGestorCompleto();
      setDashboardData(data);
      console.log("✅ Dashboard carregado:", data);
    } catch (error) {
      console.error("❌ Erro ao carregar dashboard:", error);
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {[...Array(3)].map((_, i) => (
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
          <IconAlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Erro ao carregar dashboard</h3>
          <Button onClick={loadDashboardData} variant="outline">
            <IconRefresh className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">Dashboard Gestor</h1>
          <p className="text-blue-600 mt-1">
            Gerencie contratos, contratados e acompanhe o desempenho
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDashboardData} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
            <IconRefresh className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button 
            onClick={() => navigate("/novocontrato")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Novo Contrato
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Contratos Sob Gestão</CardTitle>
            <IconFileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{dashboardData.contadores.contratos_sob_gestao}</div>
            <p className="text-xs text-blue-600">
              Contratos gerenciados
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Relatórios da Equipe</CardTitle>
            <IconReportAnalytics className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{dashboardData.contadores.relatorios_equipe_aguardando}</div>
            <p className="text-xs text-orange-600">
              Pendentes de revisão
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Contratos com Pendências</CardTitle>
            <IconAlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{dashboardData.contadores.equipe_pendencias_atraso}</div>
            <p className="text-xs text-red-600">
              Pendências em atraso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card className="border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-800">Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso rápido às principais funcionalidades de gestão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/contratos")}
            >
              <IconFileText className="h-6 w-6" />
              <span>Contratos</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/contratado")}
            >
              <IconBuilding className="h-6 w-6" />
              <span>Contratados</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/pendencias")}
            >
              <IconAlertTriangle className="h-6 w-6" />
              <span>Pendências</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/relatorios")}
            >
              <IconReportAnalytics className="h-6 w-6" />
              <span>Relatórios</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alertas Baseados nos Dados Reais */}
      <Card className="border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-800">Alertas e Notificações</CardTitle>
          <CardDescription>
            Itens que requerem sua atenção baseados nos dados atuais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData.contadores.relatorios_equipe_aguardando > 0 && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <IconReportAnalytics className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800">
                    {dashboardData.contadores.relatorios_equipe_aguardando} relatórios da equipe pendentes
                  </p>
                  <p className="text-xs text-orange-600">
                    Aguardando sua revisão e aprovação
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => navigate("/relatorios")}
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  Revisar
                </Button>
              </div>
            )}
            
            {dashboardData.contadores.contratos_sob_gestao > 0 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <IconFileText className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">
                    {dashboardData.contadores.contratos_sob_gestao} contratos sob sua gestão
                  </p>
                  <p className="text-xs text-blue-600">
                    Acompanhe o andamento e prazos
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => navigate("/contratos")}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Ver Contratos
                </Button>
              </div>
            )}
            
            {dashboardData.contadores.equipe_pendencias_atraso > 0 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <IconAlertTriangle className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">
                    {dashboardData.contadores.equipe_pendencias_atraso} pendências em atraso
                  </p>
                  <p className="text-xs text-red-600">
                    Requerem ação urgente da equipe
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/pendencias")}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  Ver Pendências
                </Button>
              </div>
            )}

            {dashboardData.contadores.contratos_proximos_vencimento > 0 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <IconAlertTriangle className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    {dashboardData.contadores.contratos_proximos_vencimento} contratos vencendo em breve
                  </p>
                  <p className="text-xs text-yellow-600">
                    Requerem renovação ou encerramento
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/contratos")}
                  className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                >
                  Ver Contratos
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seção de Pendências por Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pendências Vencidas */}
        <Card className="border-red-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <IconAlertTriangle className="w-5 h-5" />
              Pendências Vencidas
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {dashboardData.pendencias.estatisticas.vencidas}
              </span>
            </CardTitle>
            <CardDescription>
              Pendências em atraso que requerem ação urgente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!dashboardData.pendencias.pendencias_vencidas || dashboardData.pendencias.pendencias_vencidas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <IconCheck className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">Nenhuma pendência vencida</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {(dashboardData.pendencias.pendencias_vencidas || []).slice(0, 5).map((pendencia) => (
                  <div key={pendencia.pendencia_id} className="border border-red-200 rounded-lg p-3 bg-red-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm text-red-900">{pendencia.contrato_numero}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        pendencia.urgencia === 'CRÍTICA' ? 'bg-red-600 text-white' :
                        pendencia.urgencia === 'ALTA' ? 'bg-orange-500 text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                        {pendencia.urgencia}
                      </span>
                    </div>
                    <p className="text-xs text-red-700 mb-2">{pendencia.pendencia_titulo}</p>
                    <div className="flex items-center justify-between text-xs text-red-600">
                      <div className="flex items-center gap-1">
                        <IconUser className="w-3 h-3" />
                        {pendencia.fiscal_nome}
                      </div>
                      <div className="flex items-center gap-1">
                        <IconClock className="w-3 h-3" />
                        {Math.abs(pendencia.dias_restantes)} dias em atraso
                      </div>
                    </div>
                  </div>
                ))}
                {(dashboardData.pendencias.pendencias_vencidas || []).length > 5 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate("/pendencias")}
                    className="w-full border-red-200 text-red-700 hover:bg-red-50"
                  >
                    Ver todas ({(dashboardData.pendencias.pendencias_vencidas || []).length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pendências Pendentes */}
        <Card className="border-yellow-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <IconClock className="w-5 h-5" />
              Pendências Ativas
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                {dashboardData.pendencias.estatisticas.pendentes}
              </span>
            </CardTitle>
            <CardDescription>
              Pendências aguardando envio de relatório
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!dashboardData.pendencias.pendencias_pendentes || dashboardData.pendencias.pendencias_pendentes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <IconCheck className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">Nenhuma pendência ativa</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {(dashboardData.pendencias.pendencias_pendentes || []).slice(0, 5).map((pendencia) => (
                  <div key={pendencia.pendencia_id} className="border border-yellow-200 rounded-lg p-3 bg-yellow-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm text-yellow-900">{pendencia.contrato_numero}</h4>
                      <span className="text-xs text-yellow-700 bg-yellow-200 px-2 py-1 rounded-full">
                        {pendencia.dias_restantes > 0 ? `${pendencia.dias_restantes} dias restantes` : 'Vence hoje'}
                      </span>
                    </div>
                    <p className="text-xs text-yellow-700 mb-2">{pendencia.pendencia_titulo}</p>
                    <div className="flex items-center justify-between text-xs text-yellow-600">
                      <div className="flex items-center gap-1">
                        <IconUser className="w-3 h-3" />
                        {pendencia.fiscal_nome}
                      </div>
                      <div className="flex items-center gap-1">
                        <IconCalendar className="w-3 h-3" />
                        Prazo: {new Date(pendencia.prazo_entrega).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
                {(dashboardData.pendencias.pendencias_pendentes || []).length > 5 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate("/pendencias")}
                    className="w-full border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                  >
                    Ver todas ({(dashboardData.pendencias.pendencias_pendentes || []).length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
