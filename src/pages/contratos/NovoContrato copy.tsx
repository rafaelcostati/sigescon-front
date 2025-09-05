"use client"

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { SquareX, Upload, FileText } from "lucide-react";

const contractSchema = z.object({
  nr_contrato: z.string().min(3, "Número do contrato obrigatório"),
  objeto: z.string().min(3, "Objeto obrigatório"),
  valor_anual: z
    .number()
    .refine((val) => !isNaN(val), {
      message: "Valor anual deve ser um número",
    })
    .nonnegative("Valor deve ser positivo"),
  valor_global: z
    .number()
    .refine((val) => !isNaN(val), {
      message: "Valor global deve ser um número",
    })
    .nonnegative("Valor deve ser positivo"),
  base_legal: z.string().optional(),
  data_inicio: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: "Data inicial inválida",
  }),
  data_fim: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: "Data final inválida",
  }),
  termos_contratuais: z.string().optional(),
  contratado_id: z.number().optional(),
  modalidade_id: z.number().optional(),
  status_id: z.number().optional(),
  gestor_id: z.number().optional(),
  fiscal_id: z.number().optional(),
  fiscal_substituto_id: z.number().nullable().optional(),
  pae: z.string().optional(),
  doe: z.string().optional(),
  data_doe: z.string().optional(),
  documento: z.string().optional(),
});

export type ContractFormData = z.infer<typeof contractSchema>;

const DEFAULT_CONTRACT = {
  id: 14,
  nr_contrato: "CT-2025/014",
  objeto: "Serviços de agenciamento de viagens e passagens aéreas.",
  valor_anual: 550000.0,
  valor_global: 1100000.0,
  base_legal: "Lei nº 14.133/2021",
  data_inicio: "2025-04-01",
  data_fim: "2027-03-31",
  termos_contratuais:
    "Gestão e emissão de passagens aéreas e rodoviárias nacionais e internacionais.",
  contratado_id: 188,
  modalidade_id: 1,
  status_id: 3,
  gestor_id: 25,
  fiscal_id: 64,
  fiscal_substituto_id: null,
  pae: "87654.321098/2024-10",
  doe: "Nº 35400",
  data_doe: "2025-03-20",
  documento: "/docs/contratos/CT_2025_014.pdf",
  created_at: "2025-03-10T10:15:00Z",
  updated_at: "2025-03-10T10:15:00Z",
};

function toInputDate(dateString?: string) {
  if (!dateString) return "";
  try {
    return format(new Date(dateString), "yyyy-MM-dd");
  } catch {
    return dateString || "";
  }
}

export default function NovoContrato() {
  const navigate = useNavigate();

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      nr_contrato: DEFAULT_CONTRACT.nr_contrato,
      objeto: DEFAULT_CONTRACT.objeto,
      valor_anual: DEFAULT_CONTRACT.valor_anual,
      valor_global: DEFAULT_CONTRACT.valor_global,
      base_legal: DEFAULT_CONTRACT.base_legal,
      data_inicio: toInputDate(DEFAULT_CONTRACT.data_inicio),
      data_fim: toInputDate(DEFAULT_CONTRACT.data_fim),
      termos_contratuais: DEFAULT_CONTRACT.termos_contratuais,
      contratado_id: DEFAULT_CONTRACT.contratado_id,
      modalidade_id: DEFAULT_CONTRACT.modalidade_id,
      status_id: DEFAULT_CONTRACT.status_id,
      gestor_id: DEFAULT_CONTRACT.gestor_id,
      fiscal_id: DEFAULT_CONTRACT.fiscal_id,
      fiscal_substituto_id: DEFAULT_CONTRACT.fiscal_substituto_id,
      pae: DEFAULT_CONTRACT.pae,
      doe: DEFAULT_CONTRACT.doe,
      data_doe: toInputDate(DEFAULT_CONTRACT.data_doe),
      documento: DEFAULT_CONTRACT.documento,
    } as any,
  });

  const { setValue, watch } = form;

  // File state for preview & control
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    DEFAULT_CONTRACT.documento || null
  );

  // keep form.documento in sync with previewUrl (we store blob/url string in form)
  useEffect(() => {
    if (previewUrl) setValue("documento", previewUrl);
    else setValue("documento", "");
  }, [previewUrl, setValue]);

  // Clean up blob urls on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // handle file input change
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // revoke previous blob
    if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);

    const tmpUrl = URL.createObjectURL(file);
    setFileObj(file);
    setPreviewUrl(tmpUrl);
  }

  function removeFile() {
    if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setFileObj(null);
    setPreviewUrl("");
    const input = document.getElementById("documento-file") as HTMLInputElement | null;
    if (input) input.value = "";
  }

  async function onSubmit(data: ContractFormData) {
    const payload = {
      ...data,
      valor_anual: Number(data.valor_anual),
      valor_global: Number(data.valor_global),
    } as any;

    try {
      const res = await fetch("/api/contratos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Falha ao salvar o contrato");

      const json = await res.json();
      console.log("Contrato criado:", json);
      alert("Contrato criado com sucesso!");
      navigate("/contratos");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erro ao criar contrato");
    }
  }

  const documentoValue = watch("documento");

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Novo Contrato</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="nr_contrato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do contrato</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: CT-2025/014" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pae"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PAE</FormLabel>
                  <FormControl>
                    <Input placeholder="87654.321098/2024-10" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="objeto"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Objeto</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valor_anual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor anual (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valor_global"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor global (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="base_legal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base legal</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="doe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DOE</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_doe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data DOE</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_inicio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data início</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_fim"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data fim</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="termos_contratuais"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Termos contratuais</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="modalidade_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modalidade</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    defaultValue={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a modalidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Pregão</SelectItem>
                      <SelectItem value="2">Concorrência</SelectItem>
                      <SelectItem value="3">Dispensa</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    defaultValue={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Rascunho</SelectItem>
                      <SelectItem value="2">Em análise</SelectItem>
                      <SelectItem value="3">Ativo</SelectItem>
                      <SelectItem value="4">Encerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gestor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gestor (id)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fiscal_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fiscal (id)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* File upload field - estilizado, preview e botão limpar */}
            <FormField
              control={form.control}
              name="documento"
              render={() => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Documento</FormLabel>
                  <FormControl>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <label
                        htmlFor="documento-file"
                        className="flex-1 cursor-pointer rounded-md border-2 border-dashed border-muted p-4 text-center hover:border-primary transition"
                      >
                        <input
                          id="documento-file"
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          aria-label="Selecione o documento do contrato"
                        />

                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-6 w-6" />
                          <div className="text-sm">Arraste aqui ou clique para selecionar um arquivo</div>
                          <div className="text-xs text-muted-foreground">PDF, PNG, JPG (máx. recomendado 10MB)</div>
                        </div>
                      </label>

                      <div className="flex flex-col items-start gap-2">
                        {previewUrl ? (
                          <div className="flex items-center gap-3">
                            {fileObj && fileObj.type.startsWith("image") ? (
                              <img
                                src={previewUrl}
                                alt="preview"
                                className="h-20 w-28 object-cover rounded-md border"
                              />
                            ) : (
                              <div className="flex items-center gap-2 px-3 py-2 rounded-md border">
                                <FileText />
                                <div className="text-sm max-w-xs truncate">{fileObj ? fileObj.name : documentoValue}</div>
                              </div>
                            )}

                            <div className="flex flex-col">
                              <a
                                href={previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm underline"
                              >
                                Visualizar
                              </a>
                              <Button size="sm" variant="ghost" onClick={removeFile}>
                                Limpar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Nenhum arquivo selecionado</div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => document.getElementById("documento-file")?.click()}
                          >
                            Selecionar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => removeFile()}>
                            Remover
                          </Button>
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center gap-3 justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Salvando..." : "Salvar contrato"}
            </Button>

            <Button type="button" variant="destructive" onClick={() => navigate("/contratos")}>
              <SquareX className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
