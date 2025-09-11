import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react"; // ícone para upload

// Schema de validação Zod
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

export function NovoContrato() {
  const navigate = useNavigate();
  const [fileObj, setFileObj] = useState<File | null>(null);

  // estados para os dropdowns
  const [contratados, setContratados] = useState<any[]>([]);
  const [modalidades, setModalidades] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
  });

  // carregar opções iniciais
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
    try {
      const formData = new FormData();

      // obrigatórios
      formData.append("nr_contrato", data.nr_contrato);
      formData.append("objeto", data.objeto);
      formData.append("data_inicio", data.data_inicio);
      formData.append("data_fim", data.data_fim);

      formData.append("contratado_id", data.contratado_id);
      formData.append("modalidade_id", data.modalidade_id);
      formData.append("status_id", data.status_id);
      formData.append("gestor_id", data.gestor_id);
      formData.append("fiscal_id", data.fiscal_id);

      // opcionais
      if (data.fiscal_substituto_id) formData.append("fiscal_substituto_id", data.fiscal_substituto_id);
      if (data.valor_anual) formData.append("valor_anual", data.valor_anual);
      if (data.valor_global) formData.append("valor_global", data.valor_global);
      if (data.base_legal) formData.append("base_legal", data.base_legal);
      if (data.termos_contratuais) formData.append("termos_contratuais", data.termos_contratuais);
      if (data.pae) formData.append("pae", data.pae);
      if (data.doe) formData.append("doe", data.doe);
      if (data.data_doe) formData.append("data_doe", data.data_doe);

      // arquivo
      if (fileObj) {
        formData.append("documento_contrato", fileObj);
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/contratos`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Falha ao salvar o contrato");
      }

      const json = await res.json();
      console.log("Contrato criado:", json);
      alert("Contrato criado com sucesso!");
      navigate("/contratos");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erro ao criar contrato");
    }
  }

  return (
    <div className="w-full mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Novo Contrato</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white shadow-md rounded-2xl p-6"
      >
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
        

        {/* Upload */}
        <div className="md:col-span-2">
          <label className="font-medium">Documento do contrato</label>
          <div className="mt-2 flex items-center gap-3">
            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Upload size={18} />
              {fileObj ? "Trocar arquivo" : "Selecionar arquivo"}
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFileObj(e.target.files?.[0] || null)}
              />
            </label>
            {fileObj && <span className="text-sm text-gray-600">{fileObj.name}</span>}
          </div>
        </div>

        {/* Botão */}
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
