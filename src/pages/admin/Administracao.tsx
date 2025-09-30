import React, { useState, useEffect } from "react";
import { toast } from "sonner";
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
    IconSettings,
    IconCalendarTime,
    IconDeviceFloppy,
    IconReload,
    IconInfoCircle,
    IconBell,
} from "@tabler/icons-react";
import { 
    getPendenciasIntervaloDias, 
    updatePendenciasIntervaloDias,
    getLembretesConfig,
    updateLembretesConfig
} from "@/lib/api";

export default function Administracao() {
    const [intervaloDias, setIntervaloDias] = useState<number>(60);
    const [intervaloDiasOriginal, setIntervaloDiasOriginal] = useState<number>(60);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Estados para configurações de lembretes
    const [diasAntesInicio, setDiasAntesInicio] = useState<number>(30);
    const [diasAntesInicioOriginal, setDiasAntesInicioOriginal] = useState<number>(30);
    const [intervaloLembrete, setIntervaloLembrete] = useState<number>(5);
    const [intervaloLembreteOriginal, setIntervaloLembreteOriginal] = useState<number>(5);
    const [isLoadingLembretes, setIsLoadingLembretes] = useState(false);
    const [isSavingLembretes, setIsSavingLembretes] = useState(false);

    // Carregar configuração atual
    useEffect(() => {
        carregarConfiguracao();
        carregarConfiguracaoLembretes();
    }, []);

    const carregarConfiguracao = async () => {
        setIsLoading(true);
        try {
            const response = await getPendenciasIntervaloDias();
            setIntervaloDias(response.intervalo_dias);
            setIntervaloDiasOriginal(response.intervalo_dias);
            console.log("✅ Configuração carregada:", response);
        } catch (error) {
            console.error("❌ Erro ao carregar configuração:", error);
            toast.error("Erro ao carregar configurações do sistema");
        } finally {
            setIsLoading(false);
        }
    };

    const carregarConfiguracaoLembretes = async () => {
        setIsLoadingLembretes(true);
        try {
            const response = await getLembretesConfig();
            setDiasAntesInicio(response.dias_antes_vencimento_inicio);
            setDiasAntesInicioOriginal(response.dias_antes_vencimento_inicio);
            setIntervaloLembrete(response.intervalo_dias_lembrete);
            setIntervaloLembreteOriginal(response.intervalo_dias_lembrete);
            console.log("✅ Configurações de lembretes carregadas:", response);
        } catch (error) {
            console.error("❌ Erro ao carregar configurações de lembretes:", error);
            toast.error("Erro ao carregar configurações de lembretes");
        } finally {
            setIsLoadingLembretes(false);
        }
    };

    const salvarConfiguracao = async () => {
        // Validação
        if (intervaloDias < 1 || intervaloDias > 365) {
            toast.error("O intervalo deve estar entre 1 e 365 dias");
            return;
        }

        setIsSaving(true);
        try {
            await updatePendenciasIntervaloDias(intervaloDias);
            setIntervaloDiasOriginal(intervaloDias);
            toast.success("Configuração atualizada com sucesso!");
            console.log("✅ Configuração salva:", intervaloDias);
        } catch (error) {
            console.error("❌ Erro ao salvar configuração:", error);
            toast.error("Erro ao salvar configuração");
        } finally {
            setIsSaving(false);
        }
    };

    const resetarValor = () => {
        setIntervaloDias(intervaloDiasOriginal);
        toast.info("Valor restaurado para o último salvo");
    };

    const salvarConfiguracaoLembretes = async () => {
        // Validações
        if (diasAntesInicio < 1 || diasAntesInicio > 90) {
            toast.error("Os dias antes do vencimento devem estar entre 1 e 90");
            return;
        }

        if (intervaloLembrete < 1 || intervaloLembrete > 30) {
            toast.error("O intervalo entre lembretes deve estar entre 1 e 30 dias");
            return;
        }

        setIsSavingLembretes(true);
        try {
            await updateLembretesConfig(diasAntesInicio, intervaloLembrete);
            setDiasAntesInicioOriginal(diasAntesInicio);
            setIntervaloLembreteOriginal(intervaloLembrete);
            toast.success("Configurações de lembretes atualizadas com sucesso!");
            console.log("✅ Configurações de lembretes salvas:", { diasAntesInicio, intervaloLembrete });
        } catch (error) {
            console.error("❌ Erro ao salvar configurações de lembretes:", error);
            toast.error("Erro ao salvar configurações de lembretes");
        } finally {
            setIsSavingLembretes(false);
        }
    };

    const resetarValoresLembretes = () => {
        setDiasAntesInicio(diasAntesInicioOriginal);
        setIntervaloLembrete(intervaloLembreteOriginal);
        toast.info("Valores restaurados para os últimos salvos");
    };

    const temAlteracoes = intervaloDias !== intervaloDiasOriginal;
    const temAlteracoesLembretes = 
        diasAntesInicio !== diasAntesInicioOriginal || 
        intervaloLembrete !== intervaloLembreteOriginal;
    
    // Calcula quantos lembretes serão enviados
    const calcularNumeroLembretes = () => {
        if (diasAntesInicio <= 0 || intervaloLembrete <= 0) return 0;
        const lembretes = Math.floor(diasAntesInicio / intervaloLembrete) + 1; // +1 para o dia do vencimento
        return lembretes;
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <IconSettings className="h-8 w-8 text-blue-600" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Administração</h1>
                    <p className="text-gray-600">Configurações gerais do sistema</p>
                </div>
            </div>

            {/* Card de Configuração de Pendências Automáticas */}
            <Card className="border-blue-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                    <div className="flex items-center gap-3">
                        <IconCalendarTime className="h-6 w-6 text-blue-600" />
                        <div>
                            <CardTitle className="text-xl text-blue-900">
                                Pendências Automáticas
                            </CardTitle>
                            <CardDescription className="text-blue-700">
                                Configure o intervalo de dias para criação automática de pendências de relatórios fiscais
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                    {/* Explicação */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                        <IconInfoCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800 space-y-1">
                            <p className="font-medium">Como funciona:</p>
                            <p>
                                Ao criar pendências automáticas, o sistema calculará as datas baseado
                                na data de início e fim do contrato, criando uma pendência a cada{" "}
                                <strong>{intervaloDias} dias</strong>.
                            </p>
                            <p className="text-xs text-blue-700 mt-2">
                                Exemplo: Um contrato de 1 ano (365 dias) com intervalo de 60 dias
                                gerará 6 pendências automáticas.
                            </p>
                        </div>
                    </div>

                    {/* Campo de Configuração */}
                    <div className="space-y-3">
                        <Label htmlFor="intervaloDias" className="text-base font-medium">
                            Intervalo em Dias
                        </Label>
                        <div className="flex gap-3 items-end">
                            <div className="flex-1 max-w-xs">
                                <Input
                                    id="intervaloDias"
                                    type="number"
                                    min={1}
                                    max={365}
                                    value={intervaloDias}
                                    onChange={(e) => setIntervaloDias(Number(e.target.value))}
                                    disabled={isLoading}
                                    className="text-lg font-semibold border-blue-300 focus:border-blue-500 focus:ring-blue-500/20"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Mínimo: 1 dia • Máximo: 365 dias
                                </p>
                            </div>

                            {temAlteracoes && (
                                <Button
                                    variant="outline"
                                    onClick={resetarValor}
                                    disabled={isSaving}
                                    className="border-gray-300 hover:bg-gray-50"
                                >
                                    <IconReload className="h-4 w-4 mr-2" />
                                    Resetar
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-3 pt-4 border-t">
                        <Button
                            onClick={salvarConfiguracao}
                            disabled={!temAlteracoes || isSaving || isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <IconDeviceFloppy className="h-4 w-4 mr-2" />
                            {isSaving ? "Salvando..." : "Salvar Configuração"}
                        </Button>

                        {temAlteracoes && (
                            <p className="text-sm text-amber-600 flex items-center">
                                <IconInfoCircle className="h-4 w-4 mr-1" />
                                Alterações não salvas
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Card de Configuração de Lembretes */}
            <Card className="border-amber-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
                    <div className="flex items-center gap-3">
                        <IconBell className="h-6 w-6 text-amber-600" />
                        <div>
                            <CardTitle className="text-xl text-amber-900">
                                Lembretes de Pendências
                            </CardTitle>
                            <CardDescription className="text-amber-700">
                                Configure quando e com que frequência enviar lembretes por email aos fiscais sobre pendências próximas do vencimento
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                    {/* Explicação */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                        <IconInfoCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800 space-y-1">
                            <p className="font-medium">Como funciona:</p>
                            <p>
                                O sistema enviará emails de lembrete automaticamente começando{" "}
                                <strong>{diasAntesInicio} dias antes</strong> do vencimento da pendência,
                                e repetirá <strong>a cada {intervaloLembrete} dia(s)</strong> até o vencimento.
                            </p>
                            <p className="text-xs text-amber-700 mt-2">
                                Exemplo atual: Com {diasAntesInicio} dias antes e intervalo de {intervaloLembrete} dias,
                                serão enviados aproximadamente <strong>{calcularNumeroLembretes()} lembretes</strong> por pendência.
                            </p>
                        </div>
                    </div>

                    {/* Campos de Configuração */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Dias antes do vencimento */}
                        <div className="space-y-3">
                            <Label htmlFor="diasAntesInicio" className="text-base font-medium">
                                Início dos Lembretes
                            </Label>
                            <div className="flex-1">
                                <Input
                                    id="diasAntesInicio"
                                    type="number"
                                    min={1}
                                    max={90}
                                    value={diasAntesInicio}
                                    onChange={(e) => setDiasAntesInicio(Number(e.target.value))}
                                    disabled={isLoadingLembretes}
                                    className="text-lg font-semibold border-amber-300 focus:border-amber-500 focus:ring-amber-500/20"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Quantos dias antes do vencimento começar (1-90)
                                </p>
                            </div>
                        </div>

                        {/* Intervalo entre lembretes */}
                        <div className="space-y-3">
                            <Label htmlFor="intervaloLembrete" className="text-base font-medium">
                                Intervalo entre Lembretes
                            </Label>
                            <div className="flex-1">
                                <Input
                                    id="intervaloLembrete"
                                    type="number"
                                    min={1}
                                    max={30}
                                    value={intervaloLembrete}
                                    onChange={(e) => setIntervaloLembrete(Number(e.target.value))}
                                    disabled={isLoadingLembretes}
                                    className="text-lg font-semibold border-amber-300 focus:border-amber-500 focus:ring-amber-500/20"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    A cada quantos dias repetir o lembrete (1-30)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-3 pt-4 border-t">
                        <Button
                            onClick={salvarConfiguracaoLembretes}
                            disabled={!temAlteracoesLembretes || isSavingLembretes || isLoadingLembretes}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            <IconDeviceFloppy className="h-4 w-4 mr-2" />
                            {isSavingLembretes ? "Salvando..." : "Salvar Configuração"}
                        </Button>

                        {temAlteracoesLembretes && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={resetarValoresLembretes}
                                    disabled={isSavingLembretes}
                                    className="border-gray-300 hover:bg-gray-50"
                                >
                                    <IconReload className="h-4 w-4 mr-2" />
                                    Resetar
                                </Button>
                                <p className="text-sm text-amber-600 flex items-center">
                                    <IconInfoCircle className="h-4 w-4 mr-1" />
                                    Alterações não salvas
                                </p>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Card de Informações Adicionais */}
            <Card className="border-gray-200">
                <CardHeader>
                    <CardTitle className="text-lg">Informações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-700">
                    <div>
                        <p className="font-medium text-gray-900">📋 Nomenclatura Automática</p>
                        <p>
                            As pendências serão nomeadas sequencialmente: "1º Relatório Fiscal",
                            "2º Relatório Fiscal", etc.
                        </p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">📧 Notificações</p>
                        <p>
                            Ao criar pendências automáticas, o fiscal principal e o fiscal substituto
                            (se houver) receberão um email com a lista completa de pendências criadas.
                        </p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">⚙️ Aplicação</p>
                        <p>
                            Esta configuração será utilizada sempre que um administrador optar por
                            criar pendências automáticas ao visualizar um contrato.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
