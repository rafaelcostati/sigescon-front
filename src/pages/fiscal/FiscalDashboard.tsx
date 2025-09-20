import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  IconClipboardList,
  IconFileText,
  IconAlertTriangle,
  IconReportAnalytics,
  IconClock,
  IconRefresh,
} from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  getDashboardFiscalCompleto,
  type DashboardFiscalCompletoResponse,
  type PendenciaFiscalCompleta
} from "@/lib/api";

export function FiscalDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardFiscalCompletoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      console.log("🔍 Carregando dashboard completo do fiscal...");
      const data = await getDashboardFiscalCompleto();
      setDashboardData(data);
      console.log("✅ Dashboard fiscal carregado:", data);
    } catch (error) {
      console.error("❌ Erro ao carregar dashboard fiscal:", error);
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

  const { contadores, minhas_pendencias } = dashboardData;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Dashboard Fiscal</h1>
          <p className="text-green-600 mt-1">
            Acompanhe suas atividades de fiscalização e pendências
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDashboardData} variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
            <IconRefresh className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button 
            onClick={() => navigate("/relatorios")}
            className="bg-green-600 hover:bg-green-700"
          >
            <IconReportAnalytics className="mr-2 h-4 w-4" />
            Relatórios
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Minhas Pendências</CardTitle>
            <IconAlertTriangle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{contadores.minhas_pendencias}</div>
            <p className="text-xs text-green-600">
              Pendências atribuídas
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Pendências em Atraso</CardTitle>
            <IconClock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{contadores.pendencias_em_atraso}</div>
            <p className="text-xs text-red-600">
              Requerem ação urgente
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Relatórios Enviados</CardTitle>
            <IconReportAnalytics className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{contadores.relatorios_enviados_mes}</div>
            <p className="text-xs text-blue-600">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Contratos Ativos</CardTitle>
            <IconFileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{contadores.contratos_ativos}</div>
            <p className="text-xs text-purple-600">
              Sob fiscalização
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Minhas Pendências */}
      <Card className="border-green-200 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <IconAlertTriangle className="h-5 w-5 text-green-600" />
                Minhas Pendências
              </CardTitle>
              <CardDescription>
                Pendências atribuídas a você
              </CardDescription>
            </div>
            <Button 
              onClick={() => navigate('/pendencias')} 
              variant="outline" 
              size="sm"
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              Ver Todas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {minhas_pendencias.length > 0 ? (
              minhas_pendencias.slice(0, 3).map((pendencia) => (
                <div
                  key={pendencia.pendencia_id}
                  className="flex items-center justify-between p-4 border border-green-100 rounded-lg hover:bg-green-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/contratos/${pendencia.contrato_id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-green-800">{pendencia.pendencia_titulo}</h4>
                      <Badge className={pendencia.em_atraso ? "bg-red-500 text-white" : "bg-yellow-500 text-white"}>
                        {pendencia.em_atraso ? "Em Atraso" : "Pendente"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{pendencia.pendencia_descricao}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Contrato: {pendencia.contrato_numero}</span>
                      <span>Prazo: {new Date(pendencia.prazo_entrega).toLocaleDateString('pt-BR')}</span>
                      <span className={pendencia.em_atraso ? "text-red-600 font-medium" : ""}>
                        {pendencia.dias_restantes < 0 
                          ? `${Math.abs(pendencia.dias_restantes)} dias em atraso` 
                          : `${pendencia.dias_restantes} dias restantes`
                        }
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                    Ver Detalhes
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <IconAlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma pendência encontrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card className="border-green-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-green-800">Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso rápido às principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 border-green-200 text-green-700 hover:bg-green-50"
              onClick={() => navigate("/contratos")}
            >
              <IconFileText className="h-6 w-6" />
              <span>Ver Contratos</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 border-green-200 text-green-700 hover:bg-green-50"
              onClick={() => navigate("/pendencias")}
            >
              <IconAlertTriangle className="h-6 w-6" />
              <span>Minhas Pendências</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 border-green-200 text-green-700 hover:bg-green-50"
              onClick={() => navigate("/pendencias-vencidas")}
            >
              <IconClock className="h-6 w-6" />
              <span>Pendências Vencidas</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 border-green-200 text-green-700 hover:bg-green-50"
              onClick={() => navigate("/fiscalizacao")}
            >
              <IconClipboardList className="h-6 w-6" />
              <span>Fiscalização</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
