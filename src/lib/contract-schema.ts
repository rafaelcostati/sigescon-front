import { z } from "zod";

export const newContractSchema = z.object({
  nr_contrato: z.string().min(1, { message: "O número do contrato é obrigatório." }),
  objeto: z.string().min(10, { message: "O objeto do contrato deve ter pelo menos 10 caracteres." }),
  valor_anual: z.preprocess(
    (a) => (a !== "" && a !== null && a !== undefined ? Number(a) : undefined),
    z.number().positive({ message: "O valor anual deve ser positivo." })
  ),
  valor_global: z.preprocess(
    (a) => (a !== "" && a !== null && a !== undefined ? Number(a) : undefined),
    z.number().positive({ message: "O valor global deve ser positivo." })
  ),
  base_legal: z.string().min(1, { message: "A base legal é obrigatória." }),

  // Datas
  data_inicio: z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date().refine((d) => !isNaN(d.getTime()), {
      message: "A data de início é obrigatória e deve ser válida.",
    })
  ),
  data_fim: z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date().refine((d) => !isNaN(d.getTime()), {
      message: "A data de fim é obrigatória e deve ser válida.",
    })
  ),

  termos_contratuais: z.string().optional(),

  // Selects -> sempre chegam como string, então coerce
  contratado_id: z.coerce.number().positive({ message: "Selecione o contratado." }),
  modalidade_id: z.coerce.number().positive({ message: "Selecione a modalidade." }),
  status_id: z.coerce.number().positive({ message: "Selecione o status." }),
  gestor_id: z.coerce.number().positive({ message: "Selecione o gestor." }),
  fiscal_id: z.coerce.number().positive({ message: "Selecione o fiscal." }),
  fiscal_substituto_id: z.coerce.number().nullable().optional(),

  // Regex do PAE
  pae: z.string().regex(/^\d{5}\.\d{6}\/\d{4}-\d{2}$/, { message: "Formato de PAE inválido." }),

  // DOE
  doe: z.string().optional(),
  data_doe: z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date().nullable().optional()
  ),

  // Arquivo
  documento: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, "O arquivo não pode ter mais de 5MB.")
    .refine((file) => !file || file.type === "application/pdf", "Somente arquivos PDF são aceitos."),
});

export type NewContractFormData = z.infer<typeof newContractSchema>;
