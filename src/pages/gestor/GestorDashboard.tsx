import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  IconFileText,
  IconBuilding,
  IconAlertTriangle,
  IconReportAnalytics,
  IconUsers,
  IconPlus,
  IconEye,
  IconRefresh,
} from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  getDashboardContadores,
  type DashboardContadores
} from "@/lib/api";

export function GestorDashboard() {
  const navigate = useNavigate();
  const [contadores, setContadores] = useState<DashboardContadores | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      console.log("🔍 Carregando contadores do dashboard gestor...");
      const data = await getDashboardContadores();
      setContadores(data);
      console.log("✅ Contadores carregados:", data);
    } catch (error) {
      console.error("❌ Erro ao carregar contadores:", error);
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

  if (!contadores) {
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
            <div className="text-2xl font-bold text-blue-800">{contadores.contratos_sob_gestao}</div>
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
            <div className="text-2xl font-bold text-orange-800">{contadores.relatorios_equipe_pendentes}</div>
            <p className="text-xs text-orange-600">
              Pendentes de revisão
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Contratos Ativos</CardTitle>
            <IconBuilding className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{contadores.contratos_ativos}</div>
            <p className="text-xs text-green-600">
              Em execução
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
            {contadores.relatorios_equipe_pendentes > 0 && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <IconReportAnalytics className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800">
                    {contadores.relatorios_equipe_pendentes} relatórios da equipe pendentes
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
            
            {contadores.contratos_sob_gestao > 0 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <IconFileText className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">
                    {contadores.contratos_sob_gestao} contratos sob sua gestão
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
            
            {contadores.contratos_ativos > 0 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <IconBuilding className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    {contadores.contratos_ativos} contratos ativos no sistema
                  </p>
                  <p className="text-xs text-green-600">
                    Contratos em execução
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
