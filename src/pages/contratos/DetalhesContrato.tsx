import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  User,
  Building,
  FileText,
  DollarSign,
  Clock,
  Edit,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getContratoDetalhado,
  getPendenciasByContratoId,
  type ContratoDetalhado
} from "@/lib/api";
import { toast } from "sonner";
import { ContratoArquivos } from "@/components/ContratoArquivos";


type Pendencia = {
  id: number;
  titulo: string;
  descricao: string;
  status_id: number;
  status_nome: string;
  data_criacao: string;
  prazo_entrega: string;
  em_atraso: boolean;
  dias_em_atraso?: number;
  urgencia?: string;
};

export default function DetalhesContrato() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { perfilAtivo } = useAuth();

  const [contrato, setContrato] = useState<ContratoDetalhado | null>(null);
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);
  const [loading, setLoading] = useState(true);

  const podeEditar = perfilAtivo?.nome === "Administrador" || perfilAtivo?.nome === "Gestor";

  useEffect(() => {
    const fetchDetalhes = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Carregar detalhes do contrato
        const contratoResponse = await getContratoDetalhado(parseInt(id));
        setContrato(contratoResponse);


        // Carregar pendências
        try {
          const pendenciasResponse = await getPendenciasByContratoId(parseInt(id));
          if (Array.isArray(pendenciasResponse)) {
            setPendencias(pendenciasResponse as unknown as Pendencia[]);
          } else {
            setPendencias([]);
          }
        } catch (error) {
          console.log("Nenhuma pendência encontrada");
          setPendencias([]);
        }


      } catch (error) {
        toast.error("Erro ao carregar detalhes do contrato");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetalhes();
  }, [id]);

  const formatCurrency = (value: number | null) => {
    if (!value) return "Não informado";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };


  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ativo': return 'bg-green-500';
      case 'vencido': return 'bg-red-500';
      case 'suspenso': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };


  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Contrato não encontrado</h2>
          <Button onClick={() => navigate('/contratos')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Contratos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/contratos')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Contrato {contrato.nr_contrato}</h1>
            <p className="text-gray-600 mt-1">{contrato.objeto}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(contrato.status_nome || '')} text-white`}>
            {contrato.status_nome}
          </Badge>
          {podeEditar && (
            <Button onClick={() => navigate(`/contratos/editar/${contrato.id}`)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-600">Contratado:</span>
                    <p className="font-medium">{contrato.contratado_nome || "Não informado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-600">Modalidade:</span>
                    <p className="font-medium">{contrato.modalidade_nome || "Não informado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-600">Data de Início:</span>
                    <p className="font-medium">{formatDate(contrato.data_inicio)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-600">Data de Fim:</span>
                    <p className="font-medium">{formatDate(contrato.data_fim)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-600">Gestor:</span>
                    <p className="font-medium">{contrato.gestor_nome || "Não informado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-600">Fiscal:</span>
                    <p className="font-medium">{contrato.fiscal_nome || "Não informado"}</p>
                  </div>
                </div>
                {contrato.fiscal_substituto_nome && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-sm font-medium text-gray-600">Fiscal Substituto:</span>
                      <p className="font-medium">{contrato.fiscal_substituto_nome}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Valores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-600">Valor Anual:</span>
                    <p className="font-medium text-green-600">{formatCurrency(contrato.valor_anual)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-600">Valor Global:</span>
                    <p className="font-medium text-green-600">{formatCurrency(contrato.valor_global)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Gerenciamento de Arquivos e Relatórios */}
        <div className="space-y-6">
          <Tabs defaultValue="arquivos" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="arquivos">📁 Arquivos</TabsTrigger>
              <TabsTrigger value="pendencias">⚠️ Pendências</TabsTrigger>
            </TabsList>

            <TabsContent value="arquivos" className="space-y-4">
              <ContratoArquivos contratoId={parseInt(id!)} />
            </TabsContent>

            <TabsContent value="pendencias" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pendências ({pendencias.length})</CardTitle>
                  <CardDescription>Pendências relacionadas ao contrato</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendencias.length > 0 ? (
                    <div className="space-y-3">
                      {pendencias.map((pendencia) => (
                        <div key={pendencia.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{pendencia.titulo}</h4>
                            <div className="flex gap-1">
                              <Badge className={`${pendencia.em_atraso ? 'bg-red-500' : 'bg-green-500'} text-white`}>
                                {pendencia.status_nome}
                              </Badge>
                              {pendencia.em_atraso && pendencia.dias_em_atraso && (
                                <Badge className="bg-red-600 text-white">
                                  {pendencia.dias_em_atraso} dias atraso
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{pendencia.descricao}</p>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Criada em: {formatDate(pendencia.data_criacao)}</span>
                            <span>Prazo: {formatDate(pendencia.prazo_entrega)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Nenhuma pendência encontrada</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
}
