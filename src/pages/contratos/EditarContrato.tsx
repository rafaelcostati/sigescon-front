import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, SquareX, Upload, Trash2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    getContratoDetalhado,
    updateContrato,
    getArquivosByContratoId,
    deleteArquivo,
    getContratados,
    getModalidades,
    getStatus,
    getUsuarios,
    type Arquivo
} from '@/lib/api';

// Schema de validação (inalterado)
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

// Usando o tipo Arquivo da API
type ExistingFile = Arquivo;

export function EditarContrato() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fileWasDeleted, setFileWasDeleted] = useState(false);
    
    // **NOVO ESTADO** para controlar o envio do formulário
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estados para os dropdowns (inalterado)
    const [contratados, setContratados] = useState<any[]>([]);
    const [modalidades, setModalidades] = useState<any[]>([]);
    const [statusList, setStatusList] = useState<any[]>([]);
    const [usuarios, setUsuarios] = useState<any[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors, dirtyFields, isDirty },
        reset,
    } = useForm<ContractFormData>({
        resolver: zodResolver(contractSchema),
    });

    useEffect(() => {
        async function loadContractData() {
            setIsLoading(true);
            try {
                // Carrega dados dos dropdowns e contrato em paralelo usando as funções da API
                const [contratados, modalidades, statusList, usuarios, contractData] = await Promise.all([
                    getContratados({ page: 1, per_page: 10 }),
                    getModalidades(),
                    getStatus(),
                    getUsuarios(),
                    getContratoDetalhado(Number(id))
                ]);

                setContratados(contratados.data || contratados);
                setModalidades(modalidades);
                setStatusList(statusList);
                setUsuarios((usuarios as any)?.data || usuarios);
                
                // Constrói apenas os campos esperados pelo formulário, com os tipos corretos
                const formattedData: ContractFormData = {
                    nr_contrato: contractData.nr_contrato ?? "",
                    objeto: contractData.objeto ?? "",
                    data_inicio: contractData.data_inicio ? new Date(contractData.data_inicio).toISOString().split('T')[0] : "",
                    data_fim: contractData.data_fim ? new Date(contractData.data_fim).toISOString().split('T')[0] : "",
                    contratado_id: String(contractData.contratado_id ?? ""),
                    modalidade_id: String(contractData.modalidade_id ?? ""),
                    status_id: String(contractData.status_id ?? ""),
                    gestor_id: String(contractData.gestor_id ?? ""),
                    fiscal_id: String(contractData.fiscal_id ?? ""),
                    fiscal_substituto_id: contractData.fiscal_substituto_id != null ? String(contractData.fiscal_substituto_id) : undefined,
                    valor_anual: contractData.valor_anual != null ? String(contractData.valor_anual) : undefined,
                    valor_global: contractData.valor_global != null ? String(contractData.valor_global) : undefined,
                    // Alguns campos podem não estar tipados em Contrato; acessar com cast seguro
                    base_legal: (contractData as any)?.base_legal ?? undefined,
                    termos_contratuais: (contractData as any)?.termos_contratuais ?? undefined,
                    pae: contractData.pae ?? undefined,
                    doe: contractData.doe ?? undefined,
                    data_doe: contractData.data_doe ? new Date(contractData.data_doe).toISOString().split('T')[0] : undefined,
                };

                reset(formattedData as Partial<ContractFormData>);

                // Carrega arquivos do contrato
                const files = await getArquivosByContratoId(Number(id));
                setExistingFiles(files);

            } catch (err: any) {
                console.error("Erro ao carregar dados:", err);
                toast.error(err.message || "Falha ao carregar os dados do contrato.");
                navigate("/contratos");
            } finally {
                setIsLoading(false);
            }
        }
        loadContractData();
    }, [id, navigate, reset]);

    // **FUNÇÃO onSubmit ATUALIZADA PARA USAR A API**
    async function onSubmit(data: ContractFormData) {
        const hasFormChanges = Object.keys(dirtyFields).length > 0;
        const hasNewFiles = newFiles.length > 0;

        if (!hasFormChanges && !hasNewFiles && !fileWasDeleted) {
            toast.info("Nenhuma alteração foi realizada para salvar.");
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading("Salvando alterações...");

        try {
            const formData = new FormData();

            // Adiciona apenas os campos que foram modificados
            Object.keys(data).forEach(keyStr => {
                const key = keyStr as keyof ContractFormData;
                if (dirtyFields[key]) {
                    const value = data[key];
                    if (value !== undefined && value !== null && value !== '') {
                        formData.append(key, String(value));
                    }
                }
            });

            // Adiciona APENAS UM arquivo (substituição) conforme especificação do PATCH
            if (newFiles.length > 0) {
                const file = newFiles[0];
                formData.append("documento_contrato", file);
            }

            // Log dos dados enviados no FormData (sem conteúdo binário)
            const formDataEntries: any = {};
            formData.forEach((value, key) => {
                if (key === 'documento_contrato') {
                    if (!formDataEntries[key]) formDataEntries[key] = [];
                    formDataEntries[key].push(`[FILE: ${(value as File).name}]`);
                } else {
                    formDataEntries[key] = value;
                }
            });
            console.log('Editando contrato - FormData (obj):', formDataEntries);
            try { console.log('Editando contrato - FormData (json):', JSON.stringify(formDataEntries, null, 2)); } catch {}

            // Usa a função da API que já tem autenticação
            const updated = await updateContrato(Number(id), formData);
            console.log('Resposta do PATCH /contratos/{id}:', updated);

            let successMessage = "Contrato atualizado com sucesso!";
            if (!hasFormChanges && !hasNewFiles && fileWasDeleted) {
                successMessage = "Arquivo removido com sucesso!";
            } else if (!hasFormChanges && hasNewFiles) {
                successMessage = "Novos arquivos adicionados com sucesso!";
            }

            toast.success(successMessage, { id: toastId });
            // Recarrega detalhes e arquivos para refletir alterações antes de sair
            try {
                const refreshed = await getContratoDetalhado(Number(id));
                // Atualiza o formulário com os dados retornados pelo backend
                const refreshedFormatted: Partial<ContractFormData> = {
                    nr_contrato: refreshed.nr_contrato ?? '',
                    objeto: refreshed.objeto ?? '',
                    data_inicio: refreshed.data_inicio ? new Date(refreshed.data_inicio).toISOString().split('T')[0] : '',
                    data_fim: refreshed.data_fim ? new Date(refreshed.data_fim).toISOString().split('T')[0] : '',
                    contratado_id: String(refreshed.contratado_id ?? ''),
                    modalidade_id: String(refreshed.modalidade_id ?? ''),
                    status_id: String(refreshed.status_id ?? ''),
                    gestor_id: String(refreshed.gestor_id ?? ''),
                    fiscal_id: String(refreshed.fiscal_id ?? ''),
                    fiscal_substituto_id: refreshed.fiscal_substituto_id != null ? String(refreshed.fiscal_substituto_id) : undefined,
                    valor_anual: refreshed.valor_anual != null ? String(refreshed.valor_anual) : undefined,
                    valor_global: refreshed.valor_global != null ? String(refreshed.valor_global) : undefined,
                    base_legal: (refreshed as any)?.base_legal ?? undefined,
                    termos_contratuais: (refreshed as any)?.termos_contratuais ?? undefined,
                    pae: refreshed.pae ?? undefined,
                    doe: refreshed.doe ?? undefined,
                    data_doe: refreshed.data_doe ? new Date(refreshed.data_doe).toISOString().split('T')[0] : undefined,
                };
                reset(refreshedFormatted);
                const updatedFiles = await getArquivosByContratoId(Number(id));
                setExistingFiles(updatedFiles);
            } catch {}
            navigate("/contratos");
            
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Erro ao atualizar contrato", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    }

    // **FUNÇÃO handleDeleteExistingFile ATUALIZADA PARA USAR A API**
    const handleDeleteExistingFile = (fileId: number) => {
        const proceedWithDelete = async () => {
            const toastId = toast.loading("Excluindo arquivo...");
            try {
                // Usa a função da API que já tem autenticação
                await deleteArquivo(fileId);
                
                setExistingFiles(prev => prev.filter(file => file.id !== fileId));
                setFileWasDeleted(true);
                toast.success("Arquivo excluído com sucesso!", { id: toastId });
            } catch (err: any) {
                console.error("Erro ao deletar arquivo:", err);
                toast.error(err.message || "Falha ao excluir o arquivo.", { id: toastId });
            }
        };

        toast.warning("Tem certeza que deseja excluir este arquivo?", {
            action: {
                label: "Excluir",
                onClick: () => proceedWithDelete(),
            },
            cancel: {
                label: "Cancelar",
                onClick: () => {}
            },
            duration: 10000,
        });
    };

    const handleCancel = () => {
        const hasChanges = isDirty || newFiles.length > 0 || fileWasDeleted;
        if (hasChanges) {
            toast("Você possui alterações não salvas.", {
                description: "Deseja realmente sair e descartá-las?",
                action: {
                    label: "Sair e Descartar",
                    onClick: () => navigate('/contratos'),
                },
                cancel: {
                    label: "Continuar Editando",
                    onClick: () => {}
                }
            });
        } else {
            navigate('/contratos');
        }
    };
    
    // Funções de manipulação de novos arquivos (inalteradas)
    const handleAddNewFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const file = e.target.files[0];
        if (!file) return;
        // Para edição, apenas 1 arquivo é permitido (substituição)
        setNewFiles([file]);
        console.log('Arquivo selecionado para edição:', { name: file.name, size: file.size, type: file.type });
        // Limpa o valor do input para permitir selecionar o mesmo arquivo novamente e disparar onChange
        e.currentTarget.value = '';
    };

    const handleRemoveNewFile = (indexToRemove: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    };

    if (isLoading) {
        return <div className="p-6 text-center">Carregando dados do contrato...</div>;
    }

    return (
        <div className="w-full mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Editar Contrato</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white shadow-md rounded-2xl p-6">

                {/* --- CAMPOS DO FORMULÁRIO (inalterados) --- */}
                <div className="col-span-1">
                    <label className="font-medium">Número do contrato</label>
                    <input type="text" {...register("nr_contrato")} className="mt-1 border rounded-lg p-2 w-full" />
                    {errors.nr_contrato && <p className="text-red-500 text-sm">{errors.nr_contrato.message}</p>}
                </div>
                <div className="col-span-1">
                    <label className="font-medium">PAE</label>
                    <input type="text" {...register("pae")} className="mt-1 border rounded-lg p-2 w-full" />
                </div>
                <div className="col-span-1">
                    <label className="font-medium">DOE</label>
                    <input type="text" {...register("doe")} className="mt-1 border rounded-lg p-2 w-full" />
                </div>
                <div className="col-span-1">
                    <label className="font-medium">Data DOE</label>
                    <input type="date" {...register("data_doe")} className="mt-1 border rounded-lg p-2 w-full" />
                </div>
                <div className="col-span-1 md:col-span-2 lg:col-span-4">
                    <label className="font-medium">Objeto</label>
                    <textarea {...register("objeto")} className="mt-1 border rounded-lg p-2 w-full h-20" />
                    {errors.objeto && <p className="text-red-500 text-sm">{errors.objeto.message}</p>}
                </div>
                <div className="md:col-span-1 lg:col-span-2">
                    <label className="font-medium">Contratado</label>
                    <select {...register("contratado_id")} className="mt-1 border rounded-lg p-2 w-full">
                        <option value="">Selecione</option>
                        {contratados.map((c) => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-1 lg:col-span-2">
                    <label className="font-medium">Gestor</label>
                    <select {...register("gestor_id")} className="mt-1 border rounded-lg p-2 w-full">
                        <option value="">Selecione</option>
                        {usuarios.map((u) => (
                            <option key={u.id} value={u.id}>{u.nome}</option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-1 lg:col-span-2">
                    <label className="font-medium">Fiscal</label>
                    <select {...register("fiscal_id")} className="mt-1 border rounded-lg p-2 w-full">
                        <option value="">Selecione</option>
                        {usuarios.map((u) => (
                            <option key={u.id} value={u.id}>{u.nome}</option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-1 lg:col-span-2">
                    <label className="font-medium">Fiscal Substituto</label>
                    <select {...register("fiscal_substituto_id")} className="mt-1 border rounded-lg p-2 w-full">
                        <option value="">Selecione</option>
                        {usuarios.map((u) => (
                            <option key={u.id} value={u.id}>{u.nome}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="font-medium">Data Início</label>
                    <input type="date" {...register("data_inicio")} className="mt-1 border rounded-lg p-2 w-full" />
                    {errors.data_inicio && <p className="text-red-500 text-sm">{errors.data_inicio.message}</p>}
                </div>
                <div>
                    <label className="font-medium">Data Fim</label>
                    <input type="date" {...register("data_fim")} className="mt-1 border rounded-lg p-2 w-full" />
                    {errors.data_fim && <p className="text-red-500 text-sm">{errors.data_fim.message}</p>}
                </div>
                <div>
                    <label className="font-medium">Modalidade</label>
                    <select {...register("modalidade_id")} className="mt-1 border rounded-lg p-2 w-full">
                        <option value="">Selecione</option>
                        {modalidades.map((m) => (
                            <option key={m.id} value={m.id}>{m.nome}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="font-medium">Status</label>
                    <select {...register("status_id")} className="mt-1 border rounded-lg p-2 w-full">
                        <option value="">Selecione</option>
                        {statusList.map((s) => (
                            <option key={s.id} value={s.id}>{s.nome}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="font-medium">Valor Anual</label>
                    <input type="number" step="0.01" {...register("valor_anual")} className="mt-1 border rounded-lg p-2 w-full" />
                </div>
                <div>
                    <label className="font-medium">Valor Global</label>
                    <input type="number" step="0.01" {...register("valor_global")} className="mt-1 border rounded-lg p-2 w-full" />
                </div>
                <div className="md:col-span-1 lg:col-span-2">
                    <label className="font-medium">Base Legal</label>
                    <input type="text" {...register("base_legal")} className="mt-1 border rounded-lg p-2 w-full" />
                </div>
                <div className="lg:col-span-4">
                    <label className="font-medium">Termos Contratuais</label>
                    <textarea {...register("termos_contratuais")} className="mt-1 border rounded-lg p-2 w-full h-20" />
                </div>

                {/* --- GERENCIAMENTO DE ARQUIVOS (inalterado) --- */}
                <div className="lg:col-span-4">
                    <label className="font-medium">Documentos Atuais</label>
                    <div className="mt-2 p-4 border rounded-lg">
                        {existingFiles.length > 0 ? (
                            <ul className="space-y-2">
                                {existingFiles.map((file) => (
                                    <li key={file.id} className="flex justify-between items-center text-sm bg-gray-100 p-2 rounded">
                                        <span className="truncate pr-2">{file.nome_arquivo}</span>
                                        <button type="button" onClick={() => handleDeleteExistingFile(file.id)} className="text-red-500 hover:text-red-700" aria-label={`Excluir ${file.nome_arquivo}`}><Trash2 size={16} /></button>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-gray-500">Nenhum documento anexado.</p>}
                    </div>
                </div>
                <div className="lg:col-span-4">
                    <label className="font-medium">Adicionar Novos Documentos</label>
                    <div className="mt-2 p-4 border-2 border-dashed rounded-lg">
                        {newFiles.length > 0 && (
                            <ul className="mb-4 space-y-2">
                                {newFiles.map((file, index) => (
                                    <li key={index} className="flex justify-between items-center text-sm bg-gray-100 p-2 rounded">
                                        <span className="truncate pr-2">{file.name}</span>
                                        <button type="button" onClick={() => handleRemoveNewFile(index)} className="text-red-500 hover:text-red-700" aria-label={`Remover ${file.name}`}><Trash2 size={16} /></button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 w-full">
                            <Upload size={18} /> {newFiles.length > 0 ? "Substituir Arquivo" : "Adicionar Arquivo"}
                            <input type="file" className="hidden" onChange={handleAddNewFiles} />
                        </label>
                    </div>
                </div>

                {/* **BOTÕES DE AÇÃO ATUALIZADOS** */}
                <div className="flex gap-4 justify-center col-span-4 mt-4">
                    <Button 
                        type="submit" 
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow flex items-center gap-2"
                        disabled={isSubmitting}
                    >
                        <Save className="h-5 w-5" />
                        {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                    <Button 
                        type="button" 
                        variant="destructive" 
                        onClick={handleCancel}
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