import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  FileText, 
  Building2, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Eye,
  Settings,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data - substituir por dados reais da API
const mockStats = {
  totalContratos: 156,
  contratosAtivos: 89,
  contratosVencendo: 12,
  valorTotal: 15420000,
  pendenciasAbertas: 23,
  relatoriosPendentes: 8,
  totalUsuarios: 45,
  totalContratados: 78,
  fiscalizacoesRealizadas: 134
};

const mockContratosRecentes = [
  {
    id: 1,
    numero: "001/2024",
    objeto: "Prestação de serviços de limpeza",
    contratado: "Empresa Limpeza Ltda",
    valor: 120000,
    dataInicio: "2024-01-15",
    dataFim: "2024-12-15",
    status: "Ativo",
    progresso: 65,
    gestor: "João Silva",
    fiscal: "Maria Santos"
  },
  {
    id: 2,
    numero: "002/2024",
    objeto: "Fornecimento de material de escritório",
    contratado: "Papelaria Central",
    valor: 85000,
    dataInicio: "2024-02-01",
    dataFim: "2024-07-31",
    status: "Vencendo",
    progresso: 90,
    gestor: "Ana Costa",
    fiscal: "Pedro Lima"
  },
  {
    id: 3,
    numero: "003/2024",
    objeto: "Manutenção de equipamentos",
    contratado: "TechService",
    valor: 200000,
    dataInicio: "2024-03-01",
    dataFim: "2025-02-28",
    status: "Ativo",
    progresso: 25,
    gestor: "Carlos Mendes",
    fiscal: "Lucia Oliveira"
  }
];

const mockPendenciasUrgentes = [
  {
    id: 1,
    contrato: "001/2024",
    descricao: "Relatório mensal de janeiro pendente",
    prazo: "2024-02-15",
    status: "Urgente",
    fiscal: "Maria Santos"
  },
  {
    id: 2,
    contrato: "002/2024",
    descricao: "Documentação de renovação",
    prazo: "2024-03-01",
    status: "Atrasado",
    fiscal: "Pedro Lima"
  }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-500';
      case 'Vencendo': return 'bg-yellow-500';
      case 'Vencido': return 'bg-red-500';
      case 'Urgente': return 'bg-red-500';
      case 'Atrasado': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="mt-1">Visão geral completa do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/configuracoes')} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
          <Button onClick={() => navigate('/relatorios')} className="bg-red-600 hover:bg-red-700">
            <BarChart3 className="w-4 h-4 mr-2" />
            Relatórios
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Contratos */}
        <Card className="border-red-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Total de Contratos</CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{mockStats.totalContratos}</div>
            <p className="text-xs text-red-600 mt-1">+12% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        {/* Contratos Ativos */}
        <Card className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Contratos Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{mockStats.contratosAtivos}</div>
            <p className="text-xs text-green-600 mt-1">{((mockStats.contratosAtivos / mockStats.totalContratos) * 100).toFixed(1)}% do total</p>
          </CardContent>
        </Card>

        {/* Contratos Vencendo */}
        <Card className="border-yellow-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Vencendo em 30 dias</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{mockStats.contratosVencendo}</div>
            <p className="text-xs text-yellow-600 mt-1">Requer atenção urgente</p>
          </CardContent>
        </Card>

        {/* Valor Total */}
        <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{formatCurrency(mockStats.valorTotal)}</div>
            <p className="text-xs text-blue-600 mt-1">Contratos ativos</p>
          </CardContent>
        </Card>

        {/* Pendências Abertas */}
        <Card className="border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Pendências Abertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{mockStats.pendenciasAbertas}</div>
            <p className="text-xs text-orange-600 mt-1">Aguardando resolução</p>
          </CardContent>
        </Card>

        {/* Total de Usuários */}
        <Card className="border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{mockStats.totalUsuarios}</div>
            <p className="text-xs text-purple-600 mt-1">Usuários ativos no sistema</p>
          </CardContent>
        </Card>

        {/* Total de Contratados */}
        <Card className="border-indigo-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700">Total de Contratados</CardTitle>
            <Building2 className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-800">{mockStats.totalContratados}</div>
            <p className="text-xs text-indigo-600 mt-1">Empresas cadastradas</p>
          </CardContent>
        </Card>

        {/* Fiscalizações Realizadas */}
        <Card className="border-teal-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">Fiscalizações</CardTitle>
            <CheckCircle className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-800">{mockStats.fiscalizacoesRealizadas}</div>
            <p className="text-xs text-teal-600 mt-1">Realizadas este ano</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Contratos Recentes e Pendências */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contratos Recentes */}
        <Card className="border-red-200 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-red-800">Contratos Recentes</CardTitle>
                <CardDescription>Últimos contratos cadastrados</CardDescription>
              </div>
              <Button 
                onClick={() => navigate('/contratos')} 
                variant="outline" 
                size="sm"
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                Ver Todos
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockContratosRecentes.map((contrato) => (
              <div key={contrato.id} className="border border-red-100 rounded-lg p-4 hover:bg-red-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-red-800">{contrato.numero}</h4>
                    <p className="text-sm text-gray-600 truncate">{contrato.objeto}</p>
                  </div>
                  <Badge className={`${getStatusColor(contrato.status)} text-white`}>
                    {contrato.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Contratado:</span>
                    <span className="font-medium">{contrato.contratado}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valor:</span>
                    <span className="font-medium">{formatCurrency(contrato.valor)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Gestor:</span>
                    <span className="font-medium">{contrato.gestor}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fiscal:</span>
                    <span className="font-medium">{contrato.fiscal}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progresso:</span>
                      <span className="font-medium">{contrato.progresso}%</span>
                    </div>
                    <Progress value={contrato.progresso} className="h-2" />
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
            ))}
          </CardContent>
        </Card>

        {/* Pendências Urgentes */}
        <Card className="border-orange-200 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-orange-800">Pendências Urgentes</CardTitle>
                <CardDescription>Itens que requerem atenção imediata</CardDescription>
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
            {mockPendenciasUrgentes.map((pendencia) => (
              <div key={pendencia.id} className="border border-orange-100 rounded-lg p-4 hover:bg-orange-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-orange-800">Contrato {pendencia.contrato}</h4>
                    <p className="text-sm text-gray-600">{pendencia.descricao}</p>
                  </div>
                  <Badge className={`${getStatusColor(pendencia.status)} text-white`}>
                    {pendencia.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Prazo:</span>
                    <span className="font-medium">{new Date(pendencia.prazo).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fiscal:</span>
                    <span className="font-medium">{pendencia.fiscal}</span>
                  </div>
                </div>
              </div>
            ))}
            
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
                  onClick={() => navigate('/pendencias')} 
                  variant="outline" 
                  size="sm"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Pendências
                </Button>
                <Button 
                  onClick={() => navigate('/fiscalizacao')} 
                  variant="outline" 
                  size="sm"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Fiscalização
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
