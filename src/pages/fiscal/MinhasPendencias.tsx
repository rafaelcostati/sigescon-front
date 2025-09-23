import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  IconClipboardList,
  IconFileText,
  IconAlertTriangle,
  IconClock,
  IconRefresh,
  IconUpload,
  IconEye,
  IconCalendar,
  IconUser,
  IconCheck,
  IconHourglass,
  IconX,
} from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RelatorioUploadModal } from "@/components/RelatorioUploadModal";
import {
  getDashboardFiscalPendenciasCompleto,
  type DashboardFiscalPendenciasCompletoResponse,
  type PendenciaFiscalCompleta
} from "@/services/api";

export function MinhasPendencias() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardFiscalPendenciasCompletoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("pendentes");

  // Carregar dados das pendências
  const loadPendenciasData = async () => {
    setIsLoading(true);
    try {
      console.log("🔍 Carregando pendências do fiscal...");
      const data = await getDashboardFiscalPendenciasCompleto();
      setDashboardData(data);
      console.log("✅ Pendências do fiscal carregadas:", data);
    } catch (error) {
      console.error("❌ Erro ao carregar pendências:", error);
      toast.error("Erro ao carregar pendências");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPendenciasData();
  }, []);


  // Filtrar pendências por status
  const getPendenciasByStatus = (status: string) => {
    if (!dashboardData?.minhas_pendencias) return [];

    switch (status) {
      case "pendentes":
        return dashboardData.minhas_pendencias.filter(p =>
          p.status_pendencia.toLowerCase() === "pendente"
        );
      case "aguardando":
        return dashboardData.minhas_pendencias.filter(p =>
          p.status_pendencia.toLowerCase().includes("aguardando")
        );
      case "concluidas":
        return dashboardData.minhas_pendencias.filter(p =>
          p.status_pendencia.toLowerCase() === "concluida" || p.status_pendencia.toLowerCase() === "concluída"
        );
      default:
        return dashboardData.minhas_pendencias;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
          <h3 className="text-lg font-medium text-gray-600 mb-2">Erro ao carregar pendências</h3>
          <Button onClick={loadPendenciasData} variant="outline">
            <IconRefresh className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const { contadores, minhas_pendencias } = dashboardData;

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Minhas Pendências</h1>
          <p className="text-green-600 mt-1">Acompanhe suas tarefas de fiscalização</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadPendenciasData} variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
            <IconRefresh className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Voltar ao Dashboard
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-red-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">🚨 Pendentes</CardTitle>
            <IconAlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{contadores.pendencias_pendentes}</div>
            <p className="text-xs text-red-600 mt-1">Requerem ação</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">⏳ Aguardando Análise</CardTitle>
            <IconHourglass className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">{contadores.pendencias_aguardando_analise}</div>
            <p className="text-xs text-amber-600 mt-1">Relatórios enviados</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">✅ Concluídas</CardTitle>
            <IconCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{contadores.pendencias_concluidas}</div>
            <p className="text-xs text-green-600 mt-1">Finalizadas</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">📊 Total</CardTitle>
            <IconClipboardList className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{minhas_pendencias.length}</div>
            <p className="text-xs text-orange-600 mt-1">Todas as pendências</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pendências */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconClipboardList className="w-5 h-5" />
            Lista de Pendências
          </CardTitle>
          <CardDescription>
            Organize suas pendências por status para melhor acompanhamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="todas">Todas ({minhas_pendencias.length})</TabsTrigger>
              <TabsTrigger value="pendentes" className="text-red-700">
                Pendentes ({getPendenciasByStatus("pendentes").length})
              </TabsTrigger>
              <TabsTrigger value="aguardando" className="text-amber-700">
                Aguardando ({getPendenciasByStatus("aguardando").length})
              </TabsTrigger>
              <TabsTrigger value="concluidas" className="text-green-700">
                Concluídas ({getPendenciasByStatus("concluidas").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="todas" className="mt-6">
              <PendenciasList pendencias={minhas_pendencias} />
            </TabsContent>

            <TabsContent value="pendentes" className="mt-6">
              <PendenciasList pendencias={getPendenciasByStatus("pendentes")} />
            </TabsContent>

            <TabsContent value="aguardando" className="mt-6">
              <PendenciasList pendencias={getPendenciasByStatus("aguardando")} />
            </TabsContent>

            <TabsContent value="concluidas" className="mt-6">
              <PendenciasList pendencias={getPendenciasByStatus("concluidas")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para renderizar lista de pendências
function PendenciasList({ pendencias }: { pendencias: PendenciaFiscalCompleta[] }) {
  const navigate = useNavigate();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedPendencia, setSelectedPendencia] = useState<PendenciaFiscalCompleta | null>(null);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pendente":
        return "bg-red-100 text-red-800 border-red-200";
      case "aguardando_analise":
      case "aguardando análise":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "concluida":
      case "concluída":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelada":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pendente":
        return <IconAlertTriangle className="w-4 h-4" />;
      case "aguardando_analise":
      case "aguardando análise":
        return <IconHourglass className="w-4 h-4" />;
      case "concluida":
      case "concluída":
        return <IconCheck className="w-4 h-4" />;
      case "cancelada":
        return <IconX className="w-4 h-4" />;
      default:
        return <IconClock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isVencida = (dataVencimento: string) => {
    return new Date(dataVencimento) < new Date();
  };

  if (pendencias.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <IconClipboardList className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Nenhuma pendência encontrada nesta categoria</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendencias.map((pendencia) => (
        <Card key={pendencia.pendencia_id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-lg">{pendencia.pendencia_titulo}</h4>
                  <Badge className={`${getStatusColor(pendencia.status_pendencia)} border text-xs`}>
                    {getStatusIcon(pendencia.status_pendencia)}
                    <span className="ml-1">{pendencia.status_pendencia}</span>
                  </Badge>
                  {isVencida(pendencia.data_vencimento) && pendencia.status_pendencia.toLowerCase() === "pendente" && (
                    <Badge className="bg-red-500 text-white text-xs animate-pulse">
                      VENCIDA
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 mb-2">{pendencia.pendencia_descricao}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <IconFileText className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Contrato:</span>
                      <span>{pendencia.contrato_numero}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <IconUser className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Criado por:</span>
                      <span>{pendencia.criado_por_nome}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <IconCalendar className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">Criação:</span>
                      <span>{formatDate(pendencia.data_criacao)}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <IconClock className={`w-4 h-4 ${isVencida(pendencia.data_vencimento) ? 'text-red-600' : 'text-orange-600'}`} />
                      <span className="font-medium">Vencimento:</span>
                      <span className={isVencida(pendencia.data_vencimento) ? 'text-red-600 font-semibold' : ''}>
                        {formatDate(pendencia.data_vencimento)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <Button
                  onClick={() => navigate(`/contratos/${pendencia.contrato_id}`)}
                  size="sm"
                  variant="outline"
                >
                  <IconEye className="w-4 h-4 mr-1" />
                  Ver Contrato
                </Button>

                {pendencia.status_pendencia.toLowerCase() === "pendente" && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setSelectedPendencia(pendencia);
                      setUploadModalOpen(true);
                    }}
                  >
                    <IconUpload className="w-4 h-4 mr-1" />
                    Enviar Relatório
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Modal de Upload de Relatório */}
      {selectedPendencia && (
        <RelatorioUploadModal
          open={uploadModalOpen}
          onOpenChange={setUploadModalOpen}
          contratoId={selectedPendencia.contrato_id}
          pendenciaId={selectedPendencia.pendencia_id}
          pendenciaTitulo={selectedPendencia.pendencia_titulo}
          onSuccess={() => {
            toast.success("Relatório enviado! A pendência será atualizada.");
            // Aqui poderia recarregar os dados
          }}
        />
      )}
    </div>
  );
}

export default MinhasPendencias;