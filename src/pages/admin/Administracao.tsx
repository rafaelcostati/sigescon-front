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
} from "@tabler/icons-react";
import { getPendenciasIntervaloDias, updatePendenciasIntervaloDias } from "@/lib/api";

export default function Administracao() {
    const [intervaloDias, setIntervaloDias] = useState<number>(60);
    const [intervaloDiasOriginal, setIntervaloDiasOriginal] = useState<number>(60);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Carregar configuração atual
    useEffect(() => {
        carregarConfiguracao();
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

    const temAlteracoes = intervaloDias !== intervaloDiasOriginal;

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
