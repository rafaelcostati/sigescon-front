import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  IconFileText,
  IconAlertTriangle,
  IconRefresh,
  IconClock,
  IconCheck,
  IconUser,
  IconCalendar,
} from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  getDashboardGestorCompleto,
  type DashboardGestorCompletoResponse
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
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <p className="text-xs text-red-700 mb-2">{(pendencia as any).descricao || pendencia.pendencia_titulo || 'Sem descrição'}</p>
                    <div className="flex items-center justify-between text-xs text-red-600">
                      <div className="flex items-center gap-1">
                        <IconUser className="w-3 h-3" />
                        {pendencia.fiscal_nome}
                      </div>
                      <div className="flex items-center gap-1">
                        <IconClock className="w-3 h-3" />
                        {(() => {
                          const dataPrazo = (pendencia as any).data_prazo || pendencia.prazo_entrega;
                          if (dataPrazo) {
                            const prazo = new Date(dataPrazo);
                            const hoje = new Date();
                            const diffTime = hoje.getTime() - prazo.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            return diffDays > 0 ? `${diffDays} dias em atraso` : 'No prazo';
                          }
                          return 'Em atraso';
                        })()}
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
                        {(() => {
                          const dataPrazo = (pendencia as any).data_prazo || pendencia.prazo_entrega;
                          if (dataPrazo) {
                            const prazo = new Date(dataPrazo);
                            const hoje = new Date();
                            const diffTime = prazo.getTime() - hoje.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            return diffDays > 0 ? `${diffDays} dias restantes` : 'Vence hoje';
                          }
                          return 'Vence hoje';
                        })()}
                      </span>
                    </div>
                    <p className="text-xs text-yellow-700 mb-2">{(pendencia as any).descricao || pendencia.pendencia_titulo || 'Sem descrição'}</p>
                    <div className="flex items-center justify-between text-xs text-yellow-600">
                      <div className="flex items-center gap-1">
                        <IconUser className="w-3 h-3" />
                        {pendencia.fiscal_nome}
                      </div>
                      <div className="flex items-center gap-1">
                        <IconCalendar className="w-3 h-3" />
                        Prazo: {(() => {
                          const dataPrazo = (pendencia as any).data_prazo || pendencia.prazo_entrega;
                          if (dataPrazo && dataPrazo !== 'Invalid Date') {
                            try {
                              return new Date(dataPrazo).toLocaleDateString('pt-BR');
                            } catch {
                              return 'Data inválida';
                            }
                          }
                          return 'Data inválida';
                        })()}
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
