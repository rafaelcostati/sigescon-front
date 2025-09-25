import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, SquareX, Upload, Trash2, ChevronDown, Search, X } from "lucide-react";
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
    valor_anual: z.string().optional().refine(
        (val) => !val || val === "" || parseFloat(val) >= 0,
        "Valor anual não pode ser negativo"
    ),
    valor_global: z.string().optional().refine(
        (val) => !val || val === "" || parseFloat(val) >= 0,
        "Valor global não pode ser negativo"
    ),
    base_legal: z.string().optional(),
    termos_contratuais: z.string().optional(),
    pae: z.string().optional(),
    doe: z.string().optional(),
    data_doe: z.string().optional(),
    garantia: z.string().optional(),
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
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB por arquivo
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total

// Componente SearchableSelect
interface SearchableSelectProps {
    options: Array<{ id: number | string; nome: string }>;
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
}

function SearchableSelect({ options, value, onValueChange, placeholder }: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOptions, setFilteredOptions] = useState(options);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const filtered = options.filter(option =>
            option.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredOptions(filtered);
    }, [searchTerm, options]);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const selectedOption = options.find(option => option.id.toString() === value);

    const handleSelect = (optionValue: string) => {
        onValueChange(optionValue);
        setIsOpen(false);
        setSearchTerm("");
    };

    const clearSearch = () => {
        setSearchTerm("");
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Display button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-left bg-white border border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors hover:border-blue-400"
            >
                <span className={`block truncate ${!selectedOption ? 'text-gray-500' : 'text-blue-900'}`}>
                    {selectedOption ? selectedOption.nome : placeholder}
                </span>
                <ChevronDown className={`h-4 w-4 text-blue-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-blue-200 rounded-lg shadow-xl">
                    {/* Search input */}
                    <div className="p-3 border-b border-blue-100 bg-blue-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar..."
                                className="w-full pl-9 pr-8 py-2 text-sm border border-blue-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
                                autoFocus
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Options list - altura exata para 10 linhas (40px cada = 400px) */}
                    <div className="h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleSelect(option.id.toString())}
                                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors border-b border-blue-50 last:border-b-0 ${
                                        value === option.id.toString()
                                            ? 'bg-blue-100 text-blue-900 font-medium'
                                            : 'text-gray-700 hover:text-blue-900'
                                    }`}
                                >
                                    {option.nome}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-sm text-gray-500">
                                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                Nenhum item encontrado
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export function NovoContrato() {
    const navigate = useNavigate();
    // ALTERADO: Volta para múltiplos arquivos
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // Estados para os dropdowns
    const [contratados, setContratados] = useState<any[]>([]);
    const [modalidades, setModalidades] = useState<any[]>([]);
    const [statusList, setStatusList] = useState<any[]>([]);
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Estados para controlar os valores dos selects customizados
    const [selectedContratado, setSelectedContratado] = useState("");
    const [selectedGestor, setSelectedGestor] = useState("");
    const [selectedFiscal, setSelectedFiscal] = useState("");
    const [selectedFiscalSubstituto, setSelectedFiscalSubstituto] = useState("");
    const [selectedModalidade, setSelectedModalidade] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    const {
        register,
        handleSubmit,
        setValue,
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
                    fetch(`${import.meta.env.VITE_API_URL}/contratados?page=1&per_page=100`, {
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
                    fetch(`${import.meta.env.VITE_API_URL}/usuarios?page=1&per_page=100`, {
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

                // Filtrar apenas itens ativos (não excluídos)
                const contratadosArray = Array.isArray(contratadosData) ? contratadosData : contratadosData.data || [];
                const modalidadesArray = Array.isArray(modalidadesData) ? modalidadesData : modalidadesData.data || [];
                const statusArray = Array.isArray(statusData) ? statusData : statusData.data || [];
                const usuariosArray = Array.isArray(usuariosData) ? usuariosData : usuariosData.data || [];

                setContratados(contratadosArray.filter((item: any) => item.ativo !== false && item.data_exclusao == null));
                setModalidades(modalidadesArray.filter((item: any) => item.ativo !== false && item.data_exclusao == null));
                setStatusList(statusArray.filter((item: any) => item.ativo !== false && item.data_exclusao == null));
                setUsuarios(usuariosArray.filter((item: any) => item.ativo !== false && item.data_exclusao == null));

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

            // Verificar tamanho total dos arquivos antes do upload
            const totalSize = getTotalFileSize(selectedFiles);
            if (totalSize > MAX_TOTAL_SIZE) {
                throw new Error(`Tamanho total dos arquivos excede o limite de 50MB (atual: ${(totalSize / 1024 / 1024).toFixed(2)} MB)`);
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

            // Adicionar múltiplos arquivos se selecionados
            if (selectedFiles.length > 0) {
                console.log("Adicionando arquivos ao FormData:", selectedFiles.map(f => ({
                    name: f.name,
                    size: f.size,
                    type: f.type
                })));
                
                selectedFiles.forEach(file => {
                    formData.append("documento_contrato", file);
                });
            }

            console.log("Enviando FormData com token:", token.substring(0, 20) + "...");
            
            // Log dos dados que estão sendo enviados
            const formDataEntries: any = {};
            formData.forEach((value, key) => {
                if (key === "documento_contrato") {
                    if (!formDataEntries[key]) formDataEntries[key] = [];
                    formDataEntries[key].push(`[FILE: ${(value as File).name}]`);
                } else {
                    formDataEntries[key] = value;
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

    // Função para calcular tamanho total dos arquivos
    const getTotalFileSize = (files: File[]) => {
        return files.reduce((total, file) => total + file.size, 0);
    };

    // Função para manipular seleção de múltiplos arquivos
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        console.log("Arquivos selecionados:", files);
        
        if (files && files.length > 0) {
            const newFiles = Array.from(files);
            const invalidFiles: string[] = [];
            const largeFiles: string[] = [];
            const validFiles: File[] = [];

            newFiles.forEach(file => {
                console.log("Processando arquivo:", {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    sizeInMB: (file.size / 1024 / 1024).toFixed(2) + " MB"
                });

                // Verificar tamanho individual do arquivo
                if (file.size > MAX_FILE_SIZE) {
                    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
                    largeFiles.push(`${file.name} (${sizeMB} MB)`);
                    return;
                }

                // Verificar tipo de arquivo
                if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                    invalidFiles.push(file.name);
                    return;
                }

                validFiles.push(file);
            });

            // Verificar tamanho total com arquivos existentes + novos arquivos válidos
            const currentTotalSize = getTotalFileSize(selectedFiles);
            const newTotalSize = currentTotalSize + getTotalFileSize(validFiles);

            if (newTotalSize > MAX_TOTAL_SIZE) {
                const totalMB = (newTotalSize / 1024 / 1024).toFixed(2);
                toast.error(`Tamanho total excede o limite de 50MB (atual: ${totalMB} MB). Remova alguns arquivos.`);
                event.target.value = '';
                return;
            }

            // Mostrar mensagens de erro para arquivos inválidos
            if (invalidFiles.length > 0) {
                toast.error(`Tipos de arquivo não permitidos: ${invalidFiles.join(', ')}`);
            }
            if (largeFiles.length > 0) {
                toast.error(`Arquivos muito grandes (máx. 10MB cada): ${largeFiles.join(', ')}`);
            }

            // Adicionar arquivos válidos
            if (validFiles.length > 0) {
                setSelectedFiles(prev => [...prev, ...validFiles]);
                toast.success(`${validFiles.length} arquivo(s) adicionado(s) com sucesso!`);
                console.log("Arquivos válidos adicionados:", validFiles.map(f => f.name));
            }

            // Limpar input
            event.target.value = '';
        }
    };

    const handleRemoveFile = (indexToRemove: number) => {
        const fileToRemove = selectedFiles[indexToRemove];
        console.log("Removendo arquivo:", fileToRemove?.name);
        
        setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
        toast.info(`Arquivo "${fileToRemove?.name}" removido`);
    };

    const handleClearAllFiles = () => {
        console.log("Removendo todos os arquivos");
        setSelectedFiles([]);
        toast.info("Todos os arquivos foram removidos");
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

                {/* Garantia */}
                <div className="col-span-1">
                    <label className="font-medium">Garantia</label>
                    <input
                        type="date"
                        {...register("garantia")}
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

                {/* Campos ocultos para react-hook-form */}
                <input {...register("contratado_id")} type="hidden" />
                <input {...register("gestor_id")} type="hidden" />
                <input {...register("fiscal_id")} type="hidden" />
                <input {...register("fiscal_substituto_id")} type="hidden" />
                <input {...register("modalidade_id")} type="hidden" />
                <input {...register("status_id")} type="hidden" />

                {/* Contratado */}
                <div className="md:col-span-1 lg:col-span-2">
                    <label className="font-medium">Contratado *</label>
                    <div className="mt-1">
                        <SearchableSelect
                            options={contratados}
                            value={selectedContratado}
                            onValueChange={(value) => {
                                setSelectedContratado(value);
                                setValue("contratado_id", value);
                            }}
                            placeholder="Selecione um contratado"
                        />
                    </div>
                    {errors.contratado_id && <p className="text-red-500 text-sm">{errors.contratado_id.message}</p>}
                </div>

                {/* Gestor do Contrato */}
                <div className="md:col-span-1 lg:col-span-2">
                    <label className="font-medium">Gestor *</label>
                    <div className="mt-1">
                        <SearchableSelect
                            options={usuarios}
                            value={selectedGestor}
                            onValueChange={(value) => {
                                setSelectedGestor(value);
                                setValue("gestor_id", value);
                            }}
                            placeholder="Selecione um gestor"
                        />
                    </div>
                    {errors.gestor_id && <p className="text-red-500 text-sm">{errors.gestor_id.message}</p>}
                </div>

                {/* Fiscal do Contrato */}
                <div className="md:col-span-1 lg:col-span-2">
                    <label className="font-medium">Fiscal *</label>
                    <div className="mt-1">
                        <SearchableSelect
                            options={usuarios}
                            value={selectedFiscal}
                            onValueChange={(value) => {
                                setSelectedFiscal(value);
                                setValue("fiscal_id", value);
                            }}
                            placeholder="Selecione um fiscal"
                        />
                    </div>
                    {errors.fiscal_id && <p className="text-red-500 text-sm">{errors.fiscal_id.message}</p>}
                </div>

                {/* Fiscal substituto (opcional) */}
                <div className="md:col-span-1 lg:col-span-2">
                    <label className="font-medium">Fiscal Substituto</label>
                    <div className="mt-1">
                        <SearchableSelect
                            options={usuarios}
                            value={selectedFiscalSubstituto}
                            onValueChange={(value) => {
                                setSelectedFiscalSubstituto(value);
                                setValue("fiscal_substituto_id", value);
                            }}
                            placeholder="Selecione um fiscal substituto"
                        />
                    </div>
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
                    <div className="mt-1">
                        <SearchableSelect
                            options={modalidades}
                            value={selectedModalidade}
                            onValueChange={(value) => {
                                setSelectedModalidade(value);
                                setValue("modalidade_id", value);
                            }}
                            placeholder="Selecione uma modalidade"
                        />
                    </div>
                    {errors.modalidade_id && <p className="text-red-500 text-sm">{errors.modalidade_id.message}</p>}
                </div>

                {/* Status */}
                <div>
                    <label className="font-medium">Status *</label>
                    <div className="mt-1">
                        <SearchableSelect
                            options={statusList}
                            value={selectedStatus}
                            onValueChange={(value) => {
                                setSelectedStatus(value);
                                setValue("status_id", value);
                            }}
                            placeholder="Selecione um status"
                        />
                    </div>
                    {errors.status_id && <p className="text-red-500 text-sm">{errors.status_id.message}</p>}
                </div>

                {/* Campos opcionais */}
                <div>
                    <label className="font-medium">Valor Anual</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
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
                        min="0"
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

                {/* Interface de upload para múltiplos arquivos */}
                <div className="lg:col-span-4">
                    <label className="block font-medium mb-2">Documentos do Contrato</label>
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        {selectedFiles.length > 0 ? (
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-medium text-gray-700">
                                        Arquivos selecionados ({selectedFiles.length})
                                    </h4>
                                    <div className="flex gap-2">
                                        <span className="text-xs text-gray-500">
                                            Total: {(getTotalFileSize(selectedFiles) / 1024 / 1024).toFixed(2)} MB / 50 MB
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleClearAllFiles}
                                            className="text-xs text-red-500 hover:text-red-700 underline"
                                        >
                                            Remover todos
                                        </button>
                                    </div>
                                </div>
                                <div className="max-h-40 overflow-y-auto space-y-2">
                                    {selectedFiles.map((file, index) => (
                                        <div key={`${file.name}-${index}`} className="p-3 bg-white rounded-lg border flex justify-between items-center">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                                    <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                                                        {file.name}
                                                    </p>
                                                </div>
                                                <div className="flex gap-4 text-xs text-gray-500">
                                                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                    <span>{file.type || 'Tipo desconhecido'}</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile(index)}
                                                className="ml-3 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded flex-shrink-0"
                                                aria-label={`Remover ${file.name}`}
                                                title="Remover arquivo"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 mb-1">Nenhum arquivo selecionado</p>
                                <p className="text-xs text-gray-500">Selecione um ou múltiplos arquivos</p>
                            </div>
                        )}

                        <div className="mt-4">
                            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 w-full transition-colors">
                                <Upload size={18} />
                                {selectedFiles.length > 0 ? "Adicionar Mais Arquivos" : "Selecionar Arquivos"}
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept={ACCEPT_STRING}
                                />
                            </label>
                            <div className="mt-3 text-center">
                                <p className="text-xs text-gray-500">
                                    Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, TXT, ODT, ODS
                                </p>
                                <div className="flex justify-center gap-4 mt-1 text-xs text-gray-400">
                                    <span>Máx. 10MB por arquivo</span>
                                    <span>•</span>
                                    <span>Total máximo: 50MB</span>
                                </div>
                                {selectedFiles.length > 0 && (
                                    <div className="mt-2 text-xs">
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div 
                                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                                                style={{ width: `${Math.min((getTotalFileSize(selectedFiles) / MAX_TOTAL_SIZE) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-green-600 mt-1">
                                            ✓ {selectedFiles.length} arquivo(s) pronto(s) para upload
                                        </p>
                                    </div>
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