import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  IconFileText,
  IconBuilding,
  IconAlertTriangle,
  IconReportAnalytics,
  IconTrendingUp,
  IconUsers,
  IconPlus,
  IconEye,
} from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePermissions } from "@/hooks/usePermissions";

interface DashboardStats {
  totalContratos: number;
  contratosAtivos: number;
  contratosVencendo: number;
  valorTotalContratos: number;
  pendenciasAbertas: number;
  contratadosAtivos: number;
}

interface ContratoRecente {
  id: number;
  numero: string;
  objeto: string;
  contratado: string;
  valor: number;
  status: string;
  dataInicio: string;
  dataFim: string;
}

export function GestorDashboard() {
  const navigate = useNavigate();
  const { canCreateContract, canEditContract, canViewReports } = usePermissions();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalContratos: 0,
    contratosAtivos: 0,
    contratosVencendo: 0,
    valorTotalContratos: 0,
    pendenciasAbertas: 0,
    contratadosAtivos: 0,
  });
  
  const [contratosRecentes, setContratosRecentes] = useState<ContratoRecente[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Simula carregamento de dados - substituir por chamadas reais à API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalContratos: 127,
          contratosAtivos: 89,
          contratosVencendo: 8,
          valorTotalContratos: 15750000,
          pendenciasAbertas: 23,
          contratadosAtivos: 45,
        });

        setContratosRecentes([
          {
            id: 1,
            numero: "CT-2024-001",
            objeto: "Prestação de serviços de limpeza",
            contratado: "Empresa Limpeza Total Ltda",
            valor: 250000,
            status: "Ativo",
            dataInicio: "2024-01-15",
            dataFim: "2024-12-15"
          },
          {
            id: 2,
            numero: "CT-2024-002",
            objeto: "Fornecimento de material de escritório",
            contratado: "Papelaria Central S/A",
            valor: 75000,
            status: "Em Execução",
            dataInicio: "2024-01-10",
            dataFim: "2024-06-10"
          },
          {
            id: 3,
            numero: "CT-2024-003",
            objeto: "Manutenção de equipamentos de TI",
            contratado: "TechSolution Informática",
            valor: 180000,
            status: "Vencendo",
            dataInicio: "2023-12-01",
            dataFim: "2024-02-01"
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800";
      case "Em Execução":
        return "bg-blue-100 text-blue-800";
      case "Vencendo":
        return "bg-yellow-100 text-yellow-800";
      case "Vencido":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getContractProgress = (dataInicio: string, dataFim: string) => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const hoje = new Date();
    
    const totalDias = fim.getTime() - inicio.getTime();
    const diasDecorridos = hoje.getTime() - inicio.getTime();
    
    const progresso = Math.max(0, Math.min(100, (diasDecorridos / totalDias) * 100));
    return Math.round(progresso);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Gestor</h1>
          <p className="text-gray-600 mt-1">
            Gerencie contratos, contratados e acompanhe o desempenho
          </p>
        </div>
        <div className="flex gap-2">
          {canCreateContract() && (
            <Button 
              onClick={() => navigate("/novocontrato")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <IconPlus className="mr-2 h-4 w-4" />
              Novo Contrato
            </Button>
          )}
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contratos</CardTitle>
            <IconFileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalContratos}</div>
            <p className="text-xs text-muted-foreground">
              Todos os contratos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.contratosAtivos}</div>
            <p className="text-xs text-muted-foreground">
              Em execução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencendo</CardTitle>
            <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.contratosVencendo}</div>
            <p className="text-xs text-muted-foreground">
              Próximos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <IconReportAnalytics className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-600">
              {formatCurrency(stats.valorTotalContratos)}
            </div>
            <p className="text-xs text-muted-foreground">
              Contratos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendências</CardTitle>
            <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.pendenciasAbertas}</div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratados</CardTitle>
            <IconBuilding className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats.contratadosAtivos}</div>
            <p className="text-xs text-muted-foreground">
              Ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contratos Recentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconFileText className="h-5 w-5 text-blue-500" />
                Contratos Recentes
              </CardTitle>
              <CardDescription>
                Últimos contratos criados ou modificados
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate("/contratos")}>
              <IconEye className="mr-2 h-4 w-4" />
              Ver Todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contratosRecentes.map((contrato) => {
              const progresso = getContractProgress(contrato.dataInicio, contrato.dataFim);
              return (
                <div
                  key={contrato.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/contratos/editar/${contrato.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{contrato.numero}</h4>
                      <Badge className={getStatusColor(contrato.status)}>
                        {contrato.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{contrato.objeto}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Contratado: {contrato.contratado}</span>
                      <span>Valor: {formatCurrency(contrato.valor)}</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">Progresso:</span>
                        <span className="text-xs font-medium">{progresso}%</span>
                      </div>
                      <Progress value={progresso} className="h-2" />
                    </div>
                  </div>
                  {canEditContract() && (
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate("/contratos")}
              >
                <IconFileText className="h-6 w-6" />
                <span>Contratos</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate("/contratado")}
              >
                <IconBuilding className="h-6 w-6" />
                <span>Contratados</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate("/pendencias")}
              >
                <IconAlertTriangle className="h-6 w-6" />
                <span>Pendências</span>
              </Button>
              
              {canViewReports() && (
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2"
                  onClick={() => navigate("/relatorios")}
                >
                  <IconReportAnalytics className="h-6 w-6" />
                  <span>Relatórios</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas e Notificações</CardTitle>
            <CardDescription>
              Itens que requerem sua atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <IconAlertTriangle className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    8 contratos vencendo em 30 dias
                  </p>
                  <p className="text-xs text-yellow-600">
                    Revisar prazos e renovações
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <IconUsers className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">
                    23 pendências abertas
                  </p>
                  <p className="text-xs text-red-600">
                    Requerem resolução urgente
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <IconReportAnalytics className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">
                    Relatório mensal disponível
                  </p>
                  <p className="text-xs text-blue-600">
                    Dados de janeiro de 2024
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
