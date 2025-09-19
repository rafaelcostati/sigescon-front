import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  IconClipboardList,
  IconFileText,
  IconAlertTriangle,
  IconReportAnalytics,
  IconTrendingUp,
  IconClock,
} from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";

interface DashboardStats {
  contratosAtivos: number;
  pendenciasAbertas: number;
  relatoriosPendentes: number;
  fiscalizacoesRealizadas: number;
}

interface PendenciaUrgente {
  id: number;
  descricao: string;
  contrato: string;
  prazo: string;
  status: string;
}

export function FiscalDashboard() {
  const navigate = useNavigate();
  const { canViewFiscalization, canSubmitReports } = usePermissions();
  
  const [stats, setStats] = useState<DashboardStats>({
    contratosAtivos: 0,
    pendenciasAbertas: 0,
    relatoriosPendentes: 0,
    fiscalizacoesRealizadas: 0,
  });
  
  const [pendenciasUrgentes, setPendenciasUrgentes] = useState<PendenciaUrgente[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Simula carregamento de dados - substituir por chamadas reais à API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          contratosAtivos: 45,
          pendenciasAbertas: 12,
          relatoriosPendentes: 8,
          fiscalizacoesRealizadas: 23,
        });

        setPendenciasUrgentes([
          {
            id: 1,
            descricao: "Verificação de cumprimento de prazo",
            contrato: "CT-2024-001",
            prazo: "2024-01-25",
            status: "Urgente"
          },
          {
            id: 2,
            descricao: "Análise de documentação fiscal",
            contrato: "CT-2024-015",
            prazo: "2024-01-28",
            status: "Pendente"
          },
          {
            id: 3,
            descricao: "Relatório de execução mensal",
            contrato: "CT-2024-008",
            prazo: "2024-01-30",
            status: "Em Andamento"
          },
        ]);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        toast.error("Erro ao carregar dados do dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Urgente":
        return "bg-red-100 text-red-800";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800";
      case "Em Andamento":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDaysUntilDeadline = (prazo: string) => {
    const deadline = new Date(prazo);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Fiscal</h1>
          <p className="text-gray-600 mt-1">
            Acompanhe suas atividades de fiscalização e pendências
          </p>
        </div>
        <div className="flex gap-2">
          {canSubmitReports() && (
            <Button 
              onClick={() => navigate("/relatorios/novo")}
              className="bg-green-600 hover:bg-green-700"
            >
              <IconReportAnalytics className="mr-2 h-4 w-4" />
              Novo Relatório
            </Button>
          )}
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <IconFileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.contratosAtivos}</div>
            <p className="text-xs text-muted-foreground">
              Contratos sob fiscalização
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendências Abertas</CardTitle>
            <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendenciasAbertas}</div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relatórios Pendentes</CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.relatoriosPendentes}</div>
            <p className="text-xs text-muted-foreground">
              Para entrega
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fiscalizações Realizadas</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.fiscalizacoesRealizadas}</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pendências Urgentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconAlertTriangle className="h-5 w-5 text-red-500" />
            Pendências Urgentes
          </CardTitle>
          <CardDescription>
            Itens que requerem atenção imediata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendenciasUrgentes.map((pendencia) => {
              const daysLeft = getDaysUntilDeadline(pendencia.prazo);
              return (
                <div
                  key={pendencia.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/pendencias/${pendencia.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{pendencia.descricao}</h4>
                      <Badge className={getStatusColor(pendencia.status)}>
                        {pendencia.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Contrato: {pendencia.contrato}</span>
                      <span>Prazo: {new Date(pendencia.prazo).toLocaleDateString('pt-BR')}</span>
                      <span className={daysLeft <= 3 ? "text-red-600 font-medium" : ""}>
                        {daysLeft > 0 ? `${daysLeft} dias restantes` : "Vencido"}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso rápido às principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate("/contratos")}
            >
              <IconFileText className="h-6 w-6" />
              <span>Ver Contratos</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate("/pendencias")}
            >
              <IconAlertTriangle className="h-6 w-6" />
              <span>Gerenciar Pendências</span>
            </Button>
            
            {canViewFiscalization() && (
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate("/fiscalizacao")}
              >
                <IconClipboardList className="h-6 w-6" />
                <span>Fiscalização</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
