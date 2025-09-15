import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, SquareX, Upload, Trash2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import React from 'react';
import { toast } from 'sonner';

// Schema de validação Zod (inalterado)
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

// NOVO: Constante com os tipos de arquivo permitidos (MIME types)
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

// NOVO: String para o atributo 'accept' do input
const ACCEPT_STRING = ALLOWED_FILE_TYPES.join(',');

export function NovoContrato() {
    const navigate = useNavigate();
    const [files, setFiles] = useState<File[]>([]);

    // estados para os dropdowns
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
    

    // carregar opções iniciais (inalterado)
    useEffect(() => {
        async function fetchData() {
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
            } catch (err) {
                console.error("Erro ao carregar opções:", err);
            }
        }
        fetchData();
    }, []);

    async function onSubmit(data: ContractFormData) {
        setIsSubmitting(true);
        const toastId = toast.loading("Criando contrato...");

        try {
            const formData = new FormData();

            Object.entries(data).forEach(([key, value]) => {
                if (value) {
                    formData.append(key, value as string);
                }
            });

            if (files.length > 0) {
                files.forEach(file => {
                    formData.append("documentos_contrato", file);
                });
            }

            const res = await fetch(`${import.meta.env.VITE_API_URL}/contratos`, {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Falha ao salvar o contrato");
            }

            await res.json();
            toast.success("Contrato criado com sucesso!", { id: toastId });
            navigate("/contratos");

        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Erro ao criar contrato", { id: toastId });

        } finally {
            // Garante que o estado de 'submitting' seja resetado
            setIsSubmitting(false);
        }
    }

    // ALTERADO: Função para manipular a lista de arquivos com validação
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const allSelectedFiles = Array.from(event.target.files);

            // Filtra apenas os arquivos com tipo permitido
            const validFiles = allSelectedFiles.filter(file => ALLOWED_FILE_TYPES.includes(file.type));

            // Informa o usuário sobre arquivos inválidos (opcional, mas recomendado)
            const invalidFiles = allSelectedFiles.filter(file => !ALLOWED_FILE_TYPES.includes(file.type));
            if (invalidFiles.length > 0) {
                const invalidNames = invalidFiles.map(f => f.name).join(', ');
                alert(`Os seguintes arquivos têm um formato não permitido e não foram adicionados: ${invalidNames}`);
            }

            // Adiciona apenas os arquivos válidos ao estado
            if (validFiles.length > 0) {
                setFiles(prevFiles => [...prevFiles, ...validFiles]);
            }

            // Limpa o valor do input para permitir selecionar o mesmo arquivo novamente
            event.target.value = '';
        }
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };


    return (
        <div className="w-full mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Novo Contrato</h1>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white shadow-md rounded-2xl p-6"
            >
                {/* ... (resto do seu formulário inalterado) */}
                {/* Número do contrato */}
                <div className="col-span-1">
                    <label className="font-medium">Número do contrato</label>
                    <input type="text" placeholder="Ex: PGE Nº 99/2025" {...register("nr_contrato")} className="mt-1 border rounded-lg p-2 w-full" />
                    {errors.nr_contrato && <p className="text-red-500 text-sm">{errors.nr_contrato.message}</p>}
                </div>
                {/* Número do PAE */}
                <div className="col-span-1">
                    <label className="font-medium">PAE</label>
                    <input type="text" placeholder="Ex: PAE nº 2025/123456" {...register("pae")} className="mt-1 border rounded-lg p-2 w-full" />
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

                {/* Gestor do Contrato*/}
                <div className="md:col-span-1 lg:col-span-2">
                    <label className="font-medium">Gestor</label>
                    <select {...register("gestor_id")} className="mt-1 border rounded-lg p-2 w-full">
                        <option value="">Selecione</option>
                        {usuarios.map((u) => (
                            <option key={u.id} value={u.id}>{u.nome}</option>
                        ))}
                    </select>
                </div>

                {/* Fiscal do Contrato*/}
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

                {/* Interface de upload */}
                <div className="lg:col-span-4">
                    <label className="font-medium">Documentos do Contrato</label>
                    <div className="mt-2 p-4 border-2 border-dashed rounded-lg">
                        {files.length > 0 && (
                            <ul className="mb-4 space-y-2">
                                {files.map((file, index) => (
                                    <li key={index} className="flex justify-between items-center text-sm bg-gray-100 p-2 rounded">
                                        <span className="truncate pr-2">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFile(index)}
                                            className="text-red-500 hover:text-red-700"
                                            aria-label={`Remover ${file.name}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 w-full">
                            <Upload size={18} />
                            Adicionar Arquivo(s)
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                                // ALTERADO: Adiciona o atributo 'accept' para filtrar na janela de seleção
                                accept={ACCEPT_STRING}
                            />
                        </label>
                    </div>
                </div>

                {/* Botões */}
                <div className="flex gap-4 justify-center col-span-4 mt-4">
                    {/* **BOTÃO SALVAR ATUALIZADO** */}
                    <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow flex items-center gap-2"
                        disabled={isSubmitting}
                    >
                        <Save className="h-5 w-5" />
                        {isSubmitting ? "Salvando..." : "Salvar"}
                    </Button>
                    <Button variant="destructive" onClick={() => navigate('/contratos')}>
                        <SquareX className="h-5 w-5" />
                        Cancelar
                    </Button>
                </div>
            </form>
        </div>
    );
}