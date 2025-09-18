import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, SquareX, Upload, Trash2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import React from 'react';
import { toast } from 'sonner';

// Schema de validação Zod ajustado para a nova API
const contractSchema = z.object({
    nr_contrato: z.string().min(1, "Número do contrato é obrigatório"),
    objeto: z.string().min(1, "Objeto é obrigatório"),
    data_inicio: z.string().min(1, "Data de início é obrigatória"),
    data_fim: z.string().min(1, "Data de fim é obrigatória"),
    contratado_id: z.string().min(1, "Contratado é obrigatório"),
    modalidade_id: z.string().min(1, "Modalidade é obrigatória"),
    status_id: z.string().min(1, "Status é obrigatório"),
    gestor_id: z.string().min(1, "Gestor é obrigatório"),
    fiscal_id: z.string().min(1, "Fiscal é obrigatório"),
    fiscal_substituto_id: z.string().optional(),
    valor_anual: z.string().optional(),
    valor_global: z.string().optional(),
    base_legal: z.string().optional(),
    termos_contratuais: z.string().optional(),
    pae: z.string().optional(),
    doe: z.string().optional(),
    data_doe: z.string().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

// Constantes para arquivo
const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet'
];

const ACCEPT_STRING = ALLOWED_FILE_TYPES.join(',');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB em bytes

export function NovoContrato() {
    const navigate = useNavigate();
    // ALTERADO: Agora apenas um arquivo único
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Estados para os dropdowns
    const [contratados, setContratados] = useState<any[]>([]);
    const [modalidades, setModalidades] = useState<any[]>([]);
    const [statusList, setStatusList] = useState<any[]>([]);
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ContractFormData>({
        resolver: zodResolver(contractSchema),
    });

    // Carregar opções iniciais
    useEffect(() => {
        async function fetchData() {
            try {
                // Verificar diferentes possíveis chaves do token no localStorage
                const token = localStorage.getItem("authToken") || 
                             localStorage.getItem("token") || 
                             localStorage.getItem("access_token") || "";
                
                if (!token) {
                    toast.error("Token de autenticação não encontrado. Faça login novamente.");
                    navigate("/login");
                    return;
                }

                const headers = { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                };

                console.log("Fazendo requisições com token:", token.substring(0, 20) + "...");

                const [c, m, s, u] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/contratados`, { 
                        method: 'GET',
                        headers 
                    }),
                    fetch(`${import.meta.env.VITE_API_URL}/modalidades`, { 
                        method: 'GET',
                        headers 
                    }),
                    fetch(`${import.meta.env.VITE_API_URL}/status`, { 
                        method: 'GET',
                        headers 
                    }),
                    fetch(`${import.meta.env.VITE_API_URL}/usuarios`, { 
                        method: 'GET',
                        headers 
                    }),
                ]);

                // Verificar se alguma resposta falhou
                if (!c.ok) {
                    console.error("Erro ao carregar contratados:", c.status, c.statusText);
                    if (c.status === 401) {
                        toast.error("Sessão expirada. Faça login novamente.");
                        navigate("/login");
                        return;
                    }
                }
                if (!m.ok) {
                    console.error("Erro ao carregar modalidades:", m.status, m.statusText);
                    if (m.status === 401) {
                        toast.error("Sessão expirada. Faça login novamente.");
                        navigate("/login");
                        return;
                    }
                }
                if (!s.ok) {
                    console.error("Erro ao carregar status:", s.status, s.statusText);
                    if (s.status === 401) {
                        toast.error("Sessão expirada. Faça login novamente.");
                        navigate("/login");
                        return;
                    }
                }
                if (!u.ok) {
                    console.error("Erro ao carregar usuários:", u.status, u.statusText);
                    if (u.status === 401) {
                        toast.error("Sessão expirada. Faça login novamente.");
                        navigate("/login");
                        return;
                    }
                }

                const contratadosData = c.ok ? await c.json() : [];
                const modalidadesData = m.ok ? await m.json() : [];
                const statusData = s.ok ? await s.json() : [];
                const usuariosData = u.ok ? await u.json() : [];

                setContratados(Array.isArray(contratadosData) ? contratadosData : contratadosData.data || []);
                setModalidades(Array.isArray(modalidadesData) ? modalidadesData : modalidadesData.data || []);
                setStatusList(Array.isArray(statusData) ? statusData : statusData.data || []);
                setUsuarios(Array.isArray(usuariosData) ? usuariosData : usuariosData.data || []);

                console.log("Dados carregados:", {
                    contratados: contratadosData,
                    modalidades: modalidadesData,
                    status: statusData,
                    usuarios: usuariosData
                });

            } catch (err) {
                console.error("Erro ao carregar opções:", err);
                toast.error("Erro ao carregar dados iniciais: " + (err as Error).message);
            }
        }
        fetchData();
    }, [navigate]);

    async function onSubmit(data: ContractFormData) {
        setIsSubmitting(true);
        const toastId = toast.loading("Criando contrato...");

        try {
            // Verificar diferentes possíveis chaves do token no localStorage
            const token = localStorage.getItem("authToken") || 
                         localStorage.getItem("token") || 
                         localStorage.getItem("access_token") || "";
            
            if (!token) {
                throw new Error("Token de autenticação não encontrado. Faça login novamente.");
            }

            // Verificar tamanho do arquivo novamente antes do upload
            if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
                throw new Error(`Arquivo muito grande (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB). Máximo permitido: 10 MB`);
            }

            const formData = new FormData();

            // Adicionar todos os campos do formulário
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    // Converter valores numéricos para os campos apropriados
                    if (['contratado_id', 'modalidade_id', 'status_id', 'gestor_id', 'fiscal_id', 'fiscal_substituto_id'].includes(key)) {
                        formData.append(key, value as string);
                    } else if (['valor_anual', 'valor_global'].includes(key)) {
                        // Converter para número se não estiver vazio
                        const numValue = parseFloat(value as string);
                        if (!isNaN(numValue)) {
                            formData.append(key, numValue.toString());
                        }
                    } else {
                        formData.append(key, value as string);
                    }
                }
            });

            // Adicionar arquivo único se selecionado
            if (selectedFile) {
                console.log("Adicionando arquivo ao FormData:", {
                    name: selectedFile.name,
                    size: selectedFile.size,
                    type: selectedFile.type
                });
                formData.append("documento_contrato", selectedFile);
            }

            console.log("Enviando FormData com token:", token.substring(0, 20) + "...");
            
            // Log dos dados que estão sendo enviados (sem o arquivo)
            const formDataEntries: any = {};
            formData.forEach((value, key) => {
                if (key !== "documento_contrato") {
                    formDataEntries[key] = value;
                } else {
                    formDataEntries[key] = `[FILE: ${selectedFile?.name}]`;
                }
            });
            console.log("Dados do formulário:", formDataEntries);

            // Criar um controller para poder cancelar a requisição se necessário
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutos

            const response = await fetch(`${import.meta.env.VITE_API_URL}/contratos`, {
                method: "POST",
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Não definir Content-Type para FormData - o browser define automaticamente
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            console.log("Resposta da API:", response.status, response.statusText);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Sessão expirada. Faça login novamente.");
                } else if (response.status === 413) {
                    throw new Error("Arquivo muito grande. Reduza o tamanho do arquivo e tente novamente.");
                } else if (response.status === 422) {
                    const errorData = await response.json().catch(() => ({ message: "Dados inválidos" }));
                    throw new Error(`Dados inválidos: ${errorData.message || errorData.detail || "Verifique os campos obrigatórios"}`);
                } else if (response.status >= 500) {
                    throw new Error("Erro interno do servidor. Tente novamente em alguns minutos.");
                }
                
                const errorData = await response.json().catch(() => ({ message: "Erro desconhecido" }));
                throw new Error(errorData.message || errorData.detail || `Erro ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log("Contrato criado com sucesso:", result);
            
            toast.success("Contrato criado com sucesso!", { id: toastId });
            navigate("/contratos");

        } catch (err: any) {
            console.error("Erro ao criar contrato:", err);
            
            // Tratamento específico para diferentes tipos de erro
            if (err.name === 'AbortError') {
                toast.error("Timeout: A requisição demorou muito para ser processada. Tente novamente.", { id: toastId });
            } else if (err.message.includes("Sessão expirada") || err.message.includes("Token")) {
                toast.error(err.message, { id: toastId });
                setTimeout(() => navigate("/login"), 2000);
            } else if (err.message.includes("Failed to fetch") || err.message.includes("ERR_CONNECTION_RESET")) {
                toast.error("Erro de conexão. Verifique sua internet e tente novamente.", { id: toastId });
            } else {
                toast.error(err.message || "Erro ao criar contrato", { id: toastId });
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    // Função para manipular seleção de arquivo único
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        console.log("Arquivos selecionados:", files);
        
        if (files && files.length > 0) {
            const file = files[0];
            console.log("Arquivo selecionado:", {
                name: file.name,
                type: file.type,
                size: file.size,
                sizeInMB: (file.size / 1024 / 1024).toFixed(2) + " MB"
            });
            
            // Verificar o tamanho do arquivo
            if (file.size > MAX_FILE_SIZE) {
                const sizeMB = (file.size / 1024 / 1024).toFixed(2);
                toast.error(`Arquivo muito grande (${sizeMB} MB). Tamanho máximo permitido: 10 MB`);
                event.target.value = '';
                setSelectedFile(null);
                return;
            }
            
            // Verificar se o tipo de arquivo é permitido
            if (ALLOWED_FILE_TYPES.includes(file.type)) {
                setSelectedFile(file);
                console.log("Arquivo aceito e definido no state");
                toast.success(`Arquivo "${file.name}" selecionado com sucesso!`);
            } else {
                console.log("Tipo de arquivo não permitido:", file.type);
                toast.error(`Tipo de arquivo não permitido: ${file.type}. Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, TXT, ODT, ODS`);
                event.target.value = '';
                setSelectedFile(null);
            }
        } else {
            console.log("Nenhum arquivo selecionado");
        }
    };

    const handleRemoveFile = () => {
        console.log("Removendo arquivo:", selectedFile?.name);
        setSelectedFile(null);
        
        // Encontrar e limpar o input file de forma mais robusta
        const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
        fileInputs.forEach(input => {
            input.value = '';
        });
        
        toast.info("Arquivo removido");
    };

    return (
        <div className="w-full mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Novo Contrato</h1>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white shadow-md rounded-2xl p-6"
            >
                {/* Número do contrato */}
                <div className="col-span-1">
                    <label className="font-medium">Número do contrato *</label>
                    <input 
                        type="text" 
                        placeholder="Ex: PGE Nº 99/2025" 
                        {...register("nr_contrato")} 
                        className="mt-1 border rounded-lg p-2 w-full" 
                    />
                    {errors.nr_contrato && <p className="text-red-500 text-sm">{errors.nr_contrato.message}</p>}
                </div>

                {/* Número do PAE */}
                <div className="col-span-1">
                    <label className="font-medium">PAE</label>
                    <input 
                        type="text" 
                        placeholder="Ex: PAE nº 2025/123456" 
                        {...register("pae")} 
                        className="mt-1 border rounded-lg p-2 w-full" 
                    />
                </div>

                {/* Número do DOE */}
                <div className="col-span-1">
                    <label className="font-medium">DOE</label>
                    <input 
                        type="text" 
                        {...register("doe")} 
                        className="mt-1 border rounded-lg p-2 w-full" 
                    />
                </div>

                {/* Data do DOE */}
                <div className="col-span-1">
                    <label className="font-medium">Data DOE</label>
                    <input 
                        type="date" 
                        {...register("data_doe")} 
                        className="mt-1 border rounded-lg p-2 w-full" 
                    />
                </div>

                {/* Objeto */}
                <div className="col-span-1 md:col-span-2 lg:col-span-4">
                    <label className="font-medium">Objeto *</label>
                    <textarea 
                        {...register("objeto")} 
                        className="mt-1 border rounded-lg p-2 w-full h-20" 
                        placeholder="Descreva o objeto do contrato..."
                    />
                    {errors.objeto && <p className="text-red-500 text-sm">{errors.objeto.message}</p>}
                </div>

                {/* Contratado */}
                <div className="md:col-span-1 lg:col-span-2">
                    <label className="font-medium">Contratado *</label>
                    <select {...register("contratado_id")} className="mt-1 border rounded-lg p-2 w-full">
                        <option value="">Selecione um contratado</option>
                        {contratados.map((c) => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                    </select>
                    {errors.contratado_id && <p className="text-red-500 text-sm">{errors.contratado_id.message}</p>}
                </div>

                {/* Gestor do Contrato */}
                <div className="md:col-span-1 lg:col-span-2">
                    <label className="font-medium">Gestor *</label>
                    <select {...register("gestor_id")} className="mt-1 border rounded-lg p-2 w-full">
                        <option value="">Selecione um gestor</option>
                        {usuarios.map((u) => (
                            <option key={u.id} value={u.id}>{u.nome}</option>
                        ))}
                    </select>
                    {errors.gestor_id && <p className="text-red-500 text-sm">{errors.gestor_id.message}</p>}
                </div>

                {/* Fiscal do Contrato */}
                <div className="md:col-span-1 lg:col-span-2">
                    <label className="font-medium">Fiscal *</label>
                    <select {...register("fiscal_id")} className="mt-1 border rounded-lg p-2 w-full">
                        <option value="">Selecione um fiscal</option>
                        {usuarios.map((u) => (
                            <option key={u.id} value={u.id}>{u.nome}</option>
                        ))}
                    </select>
                    {errors.fiscal_id && <p className="text-red-500 text-sm">{errors.fiscal_id.message}</p>}
                </div>

                {/* Fiscal substituto (opcional) */}
                <div className="md:col-span-1 lg:col-span-2">
                    <label className="font-medium">Fiscal Substituto</label>
                    <select {...register("fiscal_substituto_id")} className="mt-1 border rounded-lg p-2 w-full">
                        <option value="">Selecione um fiscal substituto</option>
                        {usuarios.map((u) => (
                            <option key={u.id} value={u.id}>{u.nome}</option>
                        ))}
                    </select>
                </div>

                {/* Datas */}
                <div>
                    <label className="font-medium">Data Início *</label>
                    <input 
                        type="date" 
                        {...register("data_inicio")} 
                        className="mt-1 border rounded-lg p-2 w-full" 
                    />
                    {errors.data_inicio && <p className="text-red-500 text-sm">{errors.data_inicio.message}</p>}
                </div>
                <div>
                    <label className="font-medium">Data Fim *</label>
                    <input 
                        type="date" 
                        {...register("data_fim")} 
                        className="mt-1 border rounded-lg p-2 w-full" 
                    />
                    {errors.data_fim && <p className="text-red-500 text-sm">{errors.data_fim.message}</p>}
                </div>

                {/* Modalidade */}
                <div>
                    <label className="font-medium">Modalidade *</label>
                    <select {...register("modalidade_id")} className="mt-1 border rounded-lg p-2 w-full">
                        <option value="">Selecione uma modalidade</option>
                        {modalidades.map((m) => (
                            <option key={m.id} value={m.id}>{m.nome}</option>
                        ))}
                    </select>
                    {errors.modalidade_id && <p className="text-red-500 text-sm">{errors.modalidade_id.message}</p>}
                </div>

                {/* Status */}
                <div>
                    <label className="font-medium">Status *</label>
                    <select {...register("status_id")} className="mt-1 border rounded-lg p-2 w-full">
                        <option value="">Selecione um status</option>
                        {statusList.map((s) => (
                            <option key={s.id} value={s.id}>{s.nome}</option>
                        ))}
                    </select>
                    {errors.status_id && <p className="text-red-500 text-sm">{errors.status_id.message}</p>}
                </div>

                {/* Campos opcionais */}
                <div>
                    <label className="font-medium">Valor Anual</label>
                    <input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00"
                        {...register("valor_anual")} 
                        className="mt-1 border rounded-lg p-2 w-full" 
                    />
                </div>
                <div>
                    <label className="font-medium">Valor Global</label>
                    <input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00"
                        {...register("valor_global")} 
                        className="mt-1 border rounded-lg p-2 w-full" 
                    />
                </div>
                <div className="md:col-span-1 lg:col-span-2">
                    <label className="font-medium">Base Legal</label>
                    <input 
                        type="text" 
                        {...register("base_legal")} 
                        className="mt-1 border rounded-lg p-2 w-full" 
                        placeholder="Ex: Lei nº 8.666/93"
                    />
                </div>
                <div className="lg:col-span-4">
                    <label className="font-medium">Termos Contratuais</label>
                    <textarea 
                        {...register("termos_contratuais")} 
                        className="mt-1 border rounded-lg p-2 w-full h-20" 
                        placeholder="Descreva os termos contratuais..."
                    />
                </div>

                {/* Interface de upload para arquivo único */}
                <div className="lg:col-span-4">
                    <label className="block font-medium mb-2">Documento do Contrato</label>
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        {selectedFile ? (
                            <div className="mb-4 p-4 bg-white rounded-lg border">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <p className="text-sm font-medium text-gray-700">Arquivo selecionado</p>
                                        </div>
                                        <p className="text-sm text-gray-900 font-medium truncate pr-2" title={selectedFile.name}>
                                            {selectedFile.name}
                                        </p>
                                        <div className="flex gap-4 mt-1">
                                            <p className="text-xs text-gray-500">
                                                Tamanho: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Tipo: {selectedFile.type || 'Desconhecido'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveFile}
                                        className="ml-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                        aria-label={`Remover ${selectedFile.name}`}
                                        title="Remover arquivo"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 mb-1">Nenhum arquivo selecionado</p>
                                <p className="text-xs text-gray-500">Clique no botão abaixo para selecionar</p>
                            </div>
                        )}

                        <div className="mt-4">
                            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 w-full transition-colors">
                                <Upload size={18} />
                                {selectedFile ? "Alterar Arquivo" : "Selecionar Arquivo"}
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept={ACCEPT_STRING}
                                />
                            </label>
                            <div className="mt-2 text-center">
                                <p className="text-xs text-gray-500">
                                    Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, TXT, ODT, ODS
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Tamanho máximo: 10MB
                                </p>
                                {selectedFile && (
                                    <p className="text-xs text-blue-600 mt-1">
                                        ✓ Arquivo válido - Pronto para upload
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botões */}
                <div className="flex gap-4 justify-center col-span-4 mt-6">
                    <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg shadow flex items-center gap-2"
                        disabled={isSubmitting}
                    >
                        <Save className="h-5 w-5" />
                        {isSubmitting ? "Salvando..." : "Salvar Contrato"}
                    </Button>
                    <Button 
                        type="button"
                        variant="destructive" 
                        onClick={() => navigate('/contratos')}
                        className="px-8 py-3"
                        disabled={isSubmitting}
                    >
                        <SquareX className="h-5 w-5" />
                        Cancelar
                    </Button>
                </div>
            </form>
        </div>
    );
}