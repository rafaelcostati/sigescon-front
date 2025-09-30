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
    IconFileText,
    IconUpload,
    IconTrash,
    IconDownload,
} from "@tabler/icons-react";
import { 
    getPendenciasIntervaloDias, 
    updatePendenciasIntervaloDias,
    getLembretesConfig,
    updateLembretesConfig,
    getModeloRelatorioInfo,
    uploadModeloRelatorio,
    removeModeloRelatorio,
    downloadModeloRelatorio,
    type ModeloRelatorioInfo
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

    // Estados para modelo de relatório
    const [modeloRelatorio, setModeloRelatorio] = useState<ModeloRelatorioInfo | null>(null);
    const [isLoadingModelo, setIsLoadingModelo] = useState(false);
    const [isUploadingModelo, setIsUploadingModelo] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Carregar configuração atual
    useEffect(() => {
        carregarConfiguracao();
        carregarConfiguracaoLembretes();
        carregarModeloRelatorio();
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

    // ==================== Funções de Modelo de Relatório ====================

    const carregarModeloRelatorio = async () => {
        setIsLoadingModelo(true);
        try {
            const modelo = await getModeloRelatorioInfo();
            setModeloRelatorio(modelo);
            console.log("✅ Modelo de relatório carregado:", modelo);
        } catch (error) {
            console.error("❌ Erro ao carregar modelo de relatório:", error);
        } finally {
            setIsLoadingModelo(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Valida extensão
            const allowedExtensions = ['pdf', 'doc', 'docx', 'odt'];
            const ext = file.name.split('.').pop()?.toLowerCase();
            
            if (!ext || !allowedExtensions.includes(ext)) {
                toast.error(`Tipo de arquivo não permitido. Use: ${allowedExtensions.join(', ').toUpperCase()}`);
                event.target.value = '';
                return;
            }
            
            // Valida tamanho (máx 10MB)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error("Arquivo muito grande. Máximo: 10MB");
                event.target.value = '';
                return;
            }
            
            setSelectedFile(file);
        }
    };

    const handleUploadModelo = async () => {
        if (!selectedFile) {
            toast.error("Selecione um arquivo primeiro");
            return;
        }

        setIsUploadingModelo(true);
        try {
            const response = await uploadModeloRelatorio(selectedFile);
            setModeloRelatorio(response.modelo);
            setSelectedFile(null);
            toast.success("Modelo de relatório atualizado com sucesso!");
            console.log("✅ Upload realizado:", response);
            
            // Limpa o input file
            const fileInput = document.getElementById('modelo-file-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (error: any) {
            console.error("❌ Erro ao fazer upload:", error);
            toast.error(error.message || "Erro ao fazer upload do modelo");
        } finally {
            setIsUploadingModelo(false);
        }
    };

    const handleRemoverModelo = async () => {
        if (!modeloRelatorio) return;

        if (!confirm("Deseja realmente remover o modelo de relatório? Esta ação não pode ser desfeita.")) {
            return;
        }

        setIsUploadingModelo(true);
        try {
            await removeModeloRelatorio();
            setModeloRelatorio(null);
            toast.success("Modelo de relatório removido com sucesso!");
            console.log("✅ Modelo removido");
        } catch (error: any) {
            console.error("❌ Erro ao remover modelo:", error);
            toast.error(error.message || "Erro ao remover modelo");
        } finally {
            setIsUploadingModelo(false);
        }
    };

    const handleDownloadModelo = async () => {
        try {
            await downloadModeloRelatorio();
            toast.success("Download iniciado!");
        } catch (error: any) {
            console.error("❌ Erro ao baixar modelo:", error);
            toast.error(error.message || "Erro ao baixar modelo");
        }
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

            {/* Card de Modelo de Relatório */}
            <Card className="border-purple-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
                    <div className="flex items-center gap-3">
                        <IconFileText className="h-6 w-6 text-purple-600" />
                        <div>
                            <CardTitle className="text-xl text-purple-900">
                                Modelo de Relatório
                            </CardTitle>
                            <CardDescription className="text-purple-700">
                                Configure um modelo padrão de relatório que ficará disponível para download em todos os contratos
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                    {/* Status do modelo atual */}
                    {isLoadingModelo ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                    ) : modeloRelatorio ? (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                    <IconFileText className="h-5 w-5 text-purple-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-medium text-purple-900">Modelo Ativo</p>
                                        <p className="text-sm text-purple-700 mt-1">{modeloRelatorio.nome_original}</p>
                                        <p className="text-xs text-purple-600 mt-1">
                                            Este modelo está disponível para download em todos os contratos
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDownloadModelo}
                                        className="border-purple-300 text-purple-700 hover:bg-purple-50"
                                    >
                                        <IconDownload className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRemoverModelo}
                                        disabled={isUploadingModelo}
                                        className="border-red-300 text-red-700 hover:bg-red-50"
                                    >
                                        <IconTrash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                            <IconInfoCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Nenhum modelo configurado</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Faça upload de um arquivo para configurar o modelo
                            </p>
                        </div>
                    )}

                    {/* Upload de novo modelo */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="modelo-file-input" className="text-base font-medium">
                                {modeloRelatorio ? "Substituir Modelo" : "Fazer Upload do Modelo"}
                            </Label>
                            <p className="text-xs text-gray-500 mt-1 mb-2">
                                Formatos aceitos: PDF, DOC, DOCX, ODT (Máximo: 10MB)
                            </p>
                            <Input
                                id="modelo-file-input"
                                type="file"
                                accept=".pdf,.doc,.docx,.odt"
                                onChange={handleFileSelect}
                                disabled={isUploadingModelo}
                                className="border-purple-300 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                        </div>

                        {selectedFile && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-900 font-medium">
                                    Arquivo selecionado:
                                </p>
                                <p className="text-sm text-blue-700">{selectedFile.name}</p>
                                <p className="text-xs text-blue-600 mt-1">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        )}

                        <Button
                            onClick={handleUploadModelo}
                            disabled={!selectedFile || isUploadingModelo}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            <IconUpload className="h-4 w-4 mr-2" />
                            {isUploadingModelo ? "Enviando..." : modeloRelatorio ? "Substituir Modelo" : "Enviar Modelo"}
                        </Button>
                    </div>

                    {/* Informações */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex gap-3">
                            <IconInfoCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-purple-800 space-y-2">
                                <p className="font-medium">Como funciona:</p>
                                <ul className="list-disc list-inside space-y-1 text-purple-700">
                                    <li>O modelo ficará disponível em todos os contratos para qualquer usuário baixar</li>
                                    <li>Aparecerá destacado na seção de arquivos dos contratos</li>
                                    <li>Substitui automaticamente o modelo anterior quando você faz um novo upload</li>
                                    <li>Fiscais podem usar este modelo para criar relatórios padronizados</li>
                                </ul>
                            </div>
                        </div>
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
