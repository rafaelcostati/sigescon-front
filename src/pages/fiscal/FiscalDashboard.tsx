import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  IconClipboardList,
  IconFileText,
  IconAlertTriangle,
  IconUpload,
  IconRefresh,
} from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getDashboardFiscalCompleto,
  type DashboardFiscalCompletoResponse
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
            Gerencie suas fiscalizações e envie relatórios
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
          <IconRefresh className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: Meus Contratos */}
        <Card className="border-green-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => navigate("/contratos")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-green-700">Meus Contratos</CardTitle>
            <IconFileText className="h-6 w-6 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800">{contadores.contratos_ativos || 0}</div>
            <p className="text-sm text-green-600 mt-2">
              Contratos sob fiscalização
            </p>
            <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
              Ver Contratos
            </Button>
          </CardContent>
        </Card>

        {/* Card: Enviar Relatório */}
        <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => navigate("/enviar-relatorio")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-blue-700">Enviar Relatórios</CardTitle>
            <IconUpload className="h-6 w-6 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">{contadores.minhas_pendencias || 0}</div>
            <p className="text-sm text-blue-600 mt-2">
              Pendências aguardando relatório
            </p>
            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
              Enviar Relatório
            </Button>
          </CardContent>
        </Card>

        {/* Card: Pendências em Atraso */}
        <Card className="border-red-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-red-700">Pendências em Atraso</CardTitle>
            <IconAlertTriangle className="h-6 w-6 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-800">{contadores.pendencias_em_atraso || 0}</div>
            <p className="text-sm text-red-600 mt-2">
              Requerem ação urgente
            </p>
            {(contadores.pendencias_em_atraso || 0) > 0 && (
              <Badge className="mt-2 bg-red-100 text-red-800 text-xs">AÇÃO NECESSÁRIA</Badge>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
