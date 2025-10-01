import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    IconHistory,
    IconSearch,
    IconFilter,
    IconRefresh,
    IconChevronLeft,
    IconChevronRight,
    IconUser,
    IconCalendar,
    IconFileText,
    IconAlertCircle,
} from "@tabler/icons-react";
import {
    getAuditLogs,
    getAuditStatistics,
    type AuditLog,
    type AuditStatistics
} from "@/lib/api";

export default function LogsAuditoria() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [statistics, setStatistics] = useState<AuditStatistics | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const pageSize = 20;

    // Estados para os filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAction, setSelectedAction] = useState("");
    const [selectedEntity, setSelectedEntity] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    useEffect(() => {
        carregarLogs();
        carregarEstatisticas();
    }, [currentPage]);

    const carregarLogs = async () => {
        setIsLoading(true);
        try {
            const response = await getAuditLogs({
                pagina: currentPage,
                tamanho_pagina: pageSize,
                ordenar_por: 'data_hora',
                ordem: 'DESC',
                busca: searchTerm || undefined,
                acao: selectedAction || undefined,
                entidade: selectedEntity || undefined,
                data_inicio: dateFrom || undefined,
                data_fim: dateTo || undefined
            });

            setLogs(response.logs);
            setTotalPages(response.total_paginas);
            setTotalLogs(response.total);
            console.log("✅ Logs carregados:", response);
        } catch (error: any) {
            console.error("❌ Erro ao carregar logs:", error);
            toast.error(error.message || "Erro ao carregar logs de auditoria");
        } finally {
            setIsLoading(false);
        }
    };

    const carregarEstatisticas = async () => {
        setIsLoadingStats(true);
        try {
            const stats = await getAuditStatistics();
            setStatistics(stats);
            console.log("✅ Estatísticas carregadas:", stats);
        } catch (error: any) {
            console.error("❌ Erro ao carregar estatísticas:", error);
        } finally {
            setIsLoadingStats(false);
        }
    };

    const aplicarFiltros = () => {
        setCurrentPage(1);
        carregarLogs();
    };

    const limparFiltros = () => {
        setSearchTerm("");
        setSelectedAction("");
        setSelectedEntity("");
        setDateFrom("");
        setDateTo("");
        setCurrentPage(1);
        setTimeout(() => carregarLogs(), 100);
    };

    const getActionBadgeColor = (acao: string): string => {
        const colors: Record<string, string> = {
            'CRIAR': 'bg-green-100 text-green-800',
            'ATUALIZAR': 'bg-blue-100 text-blue-800',
            'DELETAR': 'bg-red-100 text-red-800',
            'APROVAR': 'bg-emerald-100 text-emerald-800',
            'REJEITAR': 'bg-orange-100 text-orange-800',
            'ENVIAR': 'bg-indigo-100 text-indigo-800',
            'CONCLUIR': 'bg-teal-100 text-teal-800',
            'CANCELAR': 'bg-gray-100 text-gray-800',
            'LOGIN': 'bg-purple-100 text-purple-800',
            'LOGOUT': 'bg-pink-100 text-pink-800',
            'ATUALIZAR_CONFIG': 'bg-yellow-100 text-yellow-800',
        };
        return colors[acao] || 'bg-gray-100 text-gray-800';
    };

    const getEntityIcon = (entidade: string) => {
        const icons: Record<string, React.ReactNode> = {
            'CONTRATO': <IconFileText className="h-4 w-4" />,
            'PENDENCIA': <IconAlertCircle className="h-4 w-4" />,
            'RELATORIO': <IconFileText className="h-4 w-4" />,
            'USUARIO': <IconUser className="h-4 w-4" />,
            'CONFIG': <IconFilter className="h-4 w-4" />,
        };
        return icons[entidade] || <IconFileText className="h-4 w-4" />;
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss");
        } catch {
            return dateString;
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <IconHistory className="h-8 w-8 text-blue-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Logs de Auditoria
                        </h1>
                        <p className="text-gray-600">
                            Histórico completo de ações no sistema
                        </p>
                    </div>
                </div>
                <Button
                    onClick={carregarLogs}
                    variant="outline"
                    disabled={isLoading}
                >
                    <IconRefresh className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Atualizar
                </Button>
            </div>

            {/* Estatísticas */}
            {!isLoadingStats && statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total de Logs</CardDescription>
                            <CardTitle className="text-3xl">{statistics.total_logs.toLocaleString()}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Últimas 24 Horas</CardDescription>
                            <CardTitle className="text-3xl">{statistics.logs_ultimas_24h.toLocaleString()}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Última Semana</CardDescription>
                            <CardTitle className="text-3xl">{statistics.logs_ultima_semana.toLocaleString()}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Usuários Ativos</CardDescription>
                            <CardTitle className="text-3xl">{statistics.logs_por_usuario.length}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            )}

            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IconFilter className="h-5 w-5" />
                        Filtros
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Busca por texto */}
                        <div className="space-y-2">
                            <Label htmlFor="search">Buscar na Descrição</Label>
                            <Input
                                id="search"
                                placeholder="Digite para buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                            />
                        </div>

                        {/* Filtro de Ação */}
                        <div className="space-y-2">
                            <Label htmlFor="action">Ação</Label>
                            <select
                                id="action"
                                className="w-full h-10 px-3 rounded-md border border-gray-300"
                                value={selectedAction}
                                onChange={(e) => setSelectedAction(e.target.value)}
                            >
                                <option value="">Todas as ações</option>
                                <option value="CRIAR">Criar</option>
                                <option value="ATUALIZAR">Atualizar</option>
                                <option value="DELETAR">Deletar</option>
                                <option value="APROVAR">Aprovar</option>
                                <option value="REJEITAR">Rejeitar</option>
                                <option value="ENVIAR">Enviar</option>
                                <option value="CONCLUIR">Concluir</option>
                                <option value="ATUALIZAR_CONFIG">Atualizar Config</option>
                            </select>
                        </div>

                        {/* Filtro de Entidade */}
                        <div className="space-y-2">
                            <Label htmlFor="entity">Entidade</Label>
                            <select
                                id="entity"
                                className="w-full h-10 px-3 rounded-md border border-gray-300"
                                value={selectedEntity}
                                onChange={(e) => setSelectedEntity(e.target.value)}
                            >
                                <option value="">Todas as entidades</option>
                                <option value="CONTRATO">Contrato</option>
                                <option value="PENDENCIA">Pendência</option>
                                <option value="RELATORIO">Relatório</option>
                                <option value="USUARIO">Usuário</option>
                                <option value="CONFIG">Configuração</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Data Início */}
                        <div className="space-y-2">
                            <Label htmlFor="dateFrom">Data Início</Label>
                            <Input
                                id="dateFrom"
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>

                        {/* Data Fim */}
                        <div className="space-y-2">
                            <Label htmlFor="dateTo">Data Fim</Label>
                            <Input
                                id="dateTo"
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-3 pt-2">
                        <Button onClick={aplicarFiltros} className="flex-1">
                            <IconSearch className="h-4 w-4 mr-2" />
                            Aplicar Filtros
                        </Button>
                        <Button onClick={limparFiltros} variant="outline">
                            <IconRefresh className="h-4 w-4 mr-2" />
                            Limpar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Logs */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            Resultados ({totalLogs.toLocaleString()} logs)
                        </CardTitle>
                        <div className="text-sm text-gray-600">
                            Página {currentPage} de {totalPages}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center p-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12">
                            <IconHistory className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">Nenhum log encontrado com os filtros aplicados</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            {/* Linha 1: Ação e Usuário */}
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getActionBadgeColor(log.acao)}`}>
                                                    {log.acao}
                                                </span>
                                                <div className="flex items-center gap-2 text-sm">
                                                    {getEntityIcon(log.entidade)}
                                                    <span className="font-medium">{log.entidade}</span>
                                                    {log.entidade_id && (
                                                        <span className="text-gray-500">#{log.entidade_id}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <IconUser className="h-4 w-4" />
                                                    <span>{log.usuario_nome}</span>
                                                    {log.perfil_usado && (
                                                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                                            {log.perfil_usado}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Linha 2: Descrição */}
                                            <p className="text-sm text-gray-700">{log.descricao}</p>

                                            {/* Linha 3: Detalhes técnicos (se houver) */}
                                            {(log.dados_anteriores || log.dados_novos) && (
                                                <details className="text-xs text-gray-600">
                                                    <summary className="cursor-pointer hover:text-gray-900">
                                                        Ver detalhes técnicos
                                                    </summary>
                                                    <div className="mt-2 p-3 bg-gray-50 rounded space-y-2">
                                                        {log.dados_anteriores && (
                                                            <div>
                                                                <strong>Antes:</strong>
                                                                <pre className="mt-1 overflow-x-auto">
                                                                    {JSON.stringify(log.dados_anteriores, null, 2)}
                                                                </pre>
                                                            </div>
                                                        )}
                                                        {log.dados_novos && (
                                                            <div>
                                                                <strong>Depois:</strong>
                                                                <pre className="mt-1 overflow-x-auto">
                                                                    {JSON.stringify(log.dados_novos, null, 2)}
                                                                </pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                </details>
                                            )}
                                        </div>

                                        {/* Data e Hora */}
                                        <div className="flex items-center gap-1 text-sm text-gray-500 whitespace-nowrap">
                                            <IconCalendar className="h-4 w-4" />
                                            <span>{formatDate(log.data_hora)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Paginação */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-6 border-t">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1 || isLoading}
                            >
                                <IconChevronLeft className="h-4 w-4 mr-2" />
                                Anterior
                            </Button>
                            <span className="text-sm text-gray-600">
                                Página {currentPage} de {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages || isLoading}
                            >
                                Próxima
                                <IconChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
