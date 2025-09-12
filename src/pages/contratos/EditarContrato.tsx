import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, SquareX, Upload, Trash2 } from "lucide-react";
import { Button } from '@/components/ui/button';

// Schema de validação Zod para os dados do formulário
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

interface ExistingFile {
    id: number;
    nome_arquivo: string;
}

export function EditarContrato() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fileWasDeleted, setFileWasDeleted] = useState(false);

    // Estados para os dropdowns
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
                const token = localStorage.getItem("token") || "";
                const headers = { Authorization: `Bearer ${token}` };

                const [c, m, s, u] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/contratados`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL}/modalidades`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL}/status`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL}/usuarios`, { headers }),
                ]);
                setContratados(await c.json());
                setModalidades(await m.json());
                setStatusList(await s.json());
                setUsuarios(await u.json());

                const contractRes = await fetch(`${import.meta.env.VITE_API_URL}/contratos/${id}`, { headers });
                if (!contractRes.ok) throw new Error("Contrato não encontrado.");
                const contractData = await contractRes.json();

                // Lógica de formatação de dados mais robusta para preencher o formulário
                const formattedData = {
                    ...contractData,
                    // Garante que todos os IDs sejam strings para compatibilidade com o <select>
                    contratado_id: String(contractData.contratado_id || ""),
                    modalidade_id: String(contractData.modalidade_id || ""),
                    status_id: String(contractData.status_id || ""),
                    gestor_id: String(contractData.gestor_id || ""),
                    fiscal_id: String(contractData.fiscal_id || ""),
                    fiscal_substituto_id: String(contractData.fiscal_substituto_id || ""),

                    // Garante que o valor da data seja sempre uma string 'YYYY-MM-DD' ou ''
                    data_inicio: contractData.data_inicio ? new Date(contractData.data_inicio).toISOString().split('T')[0] : '',
                    data_fim: contractData.data_fim ? new Date(contractData.data_fim).toISOString().split('T')[0] : '',
                    data_doe: contractData.data_doe ? new Date(contractData.data_doe).toISOString().split('T')[0] : '',
                };

                reset(formattedData);

                const filesRes = await fetch(`${import.meta.env.VITE_API_URL}/contratos/${id}/arquivos`, { headers });
                if (!filesRes.ok) throw new Error("Não foi possível carregar os arquivos.");
                setExistingFiles(await filesRes.json());

            } catch (err) {
                console.error("Erro ao carregar dados:", err);
                alert("Falha ao carregar os dados do contrato.");
                navigate("/contratos");
            } finally {
                setIsLoading(false);
            }
        }
        loadContractData();
    }, [id, navigate, reset]);

    async function onSubmit(data: ContractFormData) {
        const hasFormChanges = Object.keys(dirtyFields).length > 0;
        const hasNewFiles = newFiles.length > 0;

        if (!hasFormChanges && !hasNewFiles && !fileWasDeleted) {
            alert("Nenhuma alteração foi realizada para salvar.");
            return;
        }

        try {
            const formData = new FormData();

            Object.keys(data).forEach(keyStr => {
                const key = keyStr as keyof ContractFormData;
                if (dirtyFields[key]) {
                    formData.append(key, String(data[key] ?? ""));
                }
            });

            newFiles.forEach(file => {
                formData.append("documentos_contrato", file);
            });

            const res = await fetch(`${import.meta.env.VITE_API_URL}/contratos/${id}`, {
                method: "PATCH",
                body: formData,
                headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Falha ao atualizar o contrato");
            }

            let successMessage = "Contrato atualizado com sucesso!";
            if (!hasFormChanges && !hasNewFiles && fileWasDeleted) {
                successMessage = "Arquivo removido com sucesso!";
            } else if (!hasFormChanges && hasNewFiles) {
                successMessage = "Novos arquivos adicionados com sucesso!";
            }

            alert(successMessage);
            navigate("/contratos");
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Erro ao atualizar contrato");
        }
    }

    const handleDeleteExistingFile = async (fileId: number) => {
        if (!window.confirm("Tem certeza que deseja excluir este arquivo?")) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/arquivos/${fileId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
            });

            if (res.status === 204) {
                setExistingFiles(prev => prev.filter(file => file.id !== fileId));
                setFileWasDeleted(true);
            } else {
                const errorText = await res.text();
                throw new Error(errorText || "Falha ao excluir o arquivo.");
            }
        } catch (err: any) {
            console.error("Erro ao deletar arquivo:", err);
            alert(err.message);
        }
    };

    const handleCancel = () => {
        const hasChanges = isDirty || newFiles.length > 0 || fileWasDeleted;
        if (hasChanges) {
            if (window.confirm("Você possui alterações não salvas. Deseja realmente cancelar e descartá-las?")) {
                navigate('/contratos');
            }
        } else {
            navigate('/contratos');
        }
    };

    // A versão corrigida e mais segura
const handleAddNewFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Se não houver arquivos, interrompe a função imediatamente.
    if (!e.target.files) {
        return;
    }
    
    // 2. Agora o TypeScript sabe que e.target.files não é nulo.
    const filesToAdd = Array.from(e.target.files);
    setNewFiles(prev => [...prev, ...filesToAdd]);
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

                {/* Número do contrato */}
                <div className="col-span-1">
                    <label className="font-medium">Número do contrato</label>
                    <input type="text" {...register("nr_contrato")} className="mt-1 border rounded-lg p-2 w-full" />
                    {errors.nr_contrato && <p className="text-red-500 text-sm">{errors.nr_contrato.message}</p>}
                </div>
                {/* Número do PAE */}
                <div className="col-span-1">
                    <label className="font-medium">PAE</label>
                    <input type="text" {...register("pae")} className="mt-1 border rounded-lg p-2 w-full" />
                </div>
                {/* Número do DOE */}
                <div className="col-span-1">
                    <label className="font-medium">DOE</label>
                    <input type="text" {...register("doe")} className="mt-1 border rounded-lg p-2 w-full" />
                </div>
                {/* Data do DOE */}
                <div className="col-span-1">
                    <label className="font-medium">Data DOE</label>
                    <input type="date" {...register("data_doe")} className="mt-1 border rounded-lg p-2 w-full" />
                </div>

                {/* Objeto */}
                <div className="col-span-1 md:col-span-2 lg:col-span-4">
                    <label className="font-medium">Objeto</label>
                    <textarea {...register("objeto")} className="mt-1 border rounded-lg p-2 w-full h-20" />
                    {errors.objeto && <p className="text-red-500 text-sm">{errors.objeto.message}</p>}
                </div>

                {/* Contratado */}
                <div className="md:col-span-1 lg:col-span-2">
                    <label className="font-medium">Contratado</label>
                    <select {...register("contratado_id")} className="mt-1 border rounded-lg p-2 w-full">
                        <option value="">Selecione</option>
                        {contratados.map((c) => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                    </select>
                </div>

                {/* Gestor do Contrato */}
                <div className="md:col-span-1 lg:col-span-2">
                    <label className="font-medium">Gestor</label>
                    <select {...register("gestor_id")} className="mt-1 border rounded-lg p-2 w-full">
                        <option value="">Selecione</option>
                        {usuarios.map((u) => (
                            <option key={u.id} value={u.id}>{u.nome}</option>
                        ))}
                    </select>
                </div>

                {/* Fiscal do Contrato */}
                <div className="md:col-span-1 lg:col-span-2">
                    <label className="font-medium">Fiscal</label>
                    <select {...register("fiscal_id")} className="mt-1 border rounded-lg p-2 w-full">
                        <option value="">Selecione</option>
                        {usuarios.map((u) => (
                            <option key={u.id} value={u.id}>{u.nome}</option>
                        ))}
                    </select>
                </div>

                {/* Fiscal substituto (opcional) */}
                <div className="md:col-span-1 lg:col-span-2">
                    <label className="font-medium">Fiscal Substituto</label>
                    <select {...register("fiscal_substituto_id")} className="mt-1 border rounded-lg p-2 w-full">
                        <option value="">Selecione</option>
                        {usuarios.map((u) => (
                            <option key={u.id} value={u.id}>{u.nome}</option>
                        ))}
                    </select>
                </div>

                {/* Datas */}
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

                {/* Modalidade */}
                <div>
                    <label className="font-medium">Modalidade</label>
                    <select {...register("modalidade_id")} className="mt-1 border rounded-lg p-2 w-full">
                        <option value="">Selecione</option>
                        {modalidades.map((m) => (
                            <option key={m.id} value={m.id}>{m.nome}</option>
                        ))}
                    </select>
                </div>

                {/* Status */}
                <div>
                    <label className="font-medium">Status</label>
                    <select {...register("status_id")} className="mt-1 border rounded-lg p-2 w-full">
                        <option value="">Selecione</option>
                        {statusList.map((s) => (
                            <option key={s.id} value={s.id}>{s.nome}</option>
                        ))}
                    </select>
                </div>

                {/* Campos opcionais */}
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

                {/* Seção para gerenciar arquivos existentes */}
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

                {/* Seção para adicionar NOVOS arquivos */}
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
                            <Upload size={18} /> Adicionar Arquivo(s)
                            <input type="file" multiple className="hidden" onChange={handleAddNewFiles} />
                        </label>
                    </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-4 justify-center col-span-4 mt-4">
                    <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow">
                        <Save className="h-5 w-5" /> Salvar Alterações
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleCancel}>
                        <SquareX className="h-5 w-5" /> Cancelar
                    </Button>
                </div>
            </form>
        </div>
    );
}