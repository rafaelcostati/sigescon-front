import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // 1. Importar useParams
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, SquareX } from "lucide-react";
import { Button } from '@/components/ui/button';

// Schema de validação (geralmente o mesmo para criar e editar)
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

// Renomeado para EditarContrato
export function EditarContrato() {
    const { id } = useParams<{ id: string }>(); // 2. Obter o ID do contrato da URL
    const navigate = useNavigate();

    // Estados para dropdowns e carregamento
    const [contratados, setContratados] = useState<any[]>([]);
    const [modalidades, setModalidades] = useState<any[]>([]);
    const [statusList, setStatusList] = useState<any[]>([]);
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Estado de carregamento

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset, // 3. Obter a função 'reset' do useForm
    } = useForm<ContractFormData>({
        resolver: zodResolver(contractSchema),
    });

    // 4. Carregar dados iniciais (dropdowns E dados do contrato)
    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
                const token = localStorage.getItem("token") || "";
                const headers = { Authorization: `Bearer ${token}` };
                const apiUrl = import.meta.env.VITE_API_URL;

                const [c, m, s, u, contratoRes] = await Promise.all([
                    fetch(`${apiUrl}/contratados`, { headers }),
                    fetch(`${apiUrl}/modalidades`, { headers }),
                    fetch(`${apiUrl}/status`, { headers }),
                    fetch(`${apiUrl}/usuarios`, { headers }),
                    fetch(`${apiUrl}/contratos/${id}`, { headers }), // Busca o contrato atual
                ]);

                setContratados(await c.json());
                setModalidades(await m.json());
                setStatusList(await s.json());
                setUsuarios(await u.json());

                const contratoData = await contratoRes.json();
                
                // Formata os dados para preencher o formulário
                const formattedData = {
                    ...contratoData,
                    data_inicio: contratoData.data_inicio ? new Date(contratoData.data_inicio).toISOString().split('T')[0] : '',
                    data_fim: contratoData.data_fim ? new Date(contratoData.data_fim).toISOString().split('T')[0] : '',
                    data_doe: contratoData.data_doe ? new Date(contratoData.data_doe).toISOString().split('T')[0] : '',
                    // Converte IDs numéricos para string para popular os selects
                    contratado_id: String(contratoData.contratado_id),
                    modalidade_id: String(contratoData.modalidade_id),
                    status_id: String(contratoData.status_id),
                    gestor_id: String(contratoData.gestor_id),
                    fiscal_id: String(contratoData.fiscal_id),
                    fiscal_substituto_id: String(contratoData.fiscal_substituto_id || ''),
                };

                reset(formattedData); // Popula o formulário com os dados do contrato

            } catch (err) {
                console.error("Erro ao carregar dados:", err);
                alert("Erro ao carregar os dados para edição.");
            } finally {
                setIsLoading(false);
            }
        }
        if (id) fetchData();
    }, [id, reset]);

    // 5. Função de submissão ajustada para PATCH e JSON
    async function onSubmit(data: ContractFormData) {
        try {
            // Cria um objeto limpo apenas com os valores preenchidos
            const payload: any = {};
            for (const key in data) {
                const typedKey = key as keyof ContractFormData;
                if (data[typedKey] !== null && data[typedKey] !== '' && data[typedKey] !== undefined) {
                    payload[typedKey] = data[typedKey];
                }
            }
            
            const res = await fetch(`${import.meta.env.VITE_API_URL}/contratos/${id}`, {
                method: "PATCH", // Método PATCH
                body: JSON.stringify(payload), // Corpo como JSON
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                    'Content-Type': 'application/json', // Header de conteúdo
                },
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Falha ao atualizar o contrato");
            }

            alert("Contrato atualizado com sucesso!");
            navigate("/contratos");

        } catch (err: any) {
            console.error(err);
            alert(err.message || "Erro ao atualizar contrato");
        }
    }

    if (isLoading) {
        return <div className="p-6 text-center">Carregando dados do contrato...</div>
    }

    return (
        <div className="w-full mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Editar Contrato</h1>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white shadow-md rounded-2xl p-6"
            >
                {/* O restante do formulário é idêntico ao de NovoContrato */}
              {/* Note que a parte de upload de arquivo foi removida, */}
              {/* pois a API PATCH espera JSON e não lida com arquivos. */}
              {/* Uma API de edição com upload geralmente requer um endpoint separado. */}

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

                {/* Botão */}
                <div className="flex gap-4 justify-center col-span-4 mt-4">
                    <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow"
                    >
                        <Save className="h-5 w-5" />
                        Salvar Alterações
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