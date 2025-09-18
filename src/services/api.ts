
import { z } from "zod";

// Reutilize seu schema Zod, mas exporte-o de um local central se for usado em outros lugares.
export const contratoSchema = z.object({
    id: z.number(),
    nr_contrato: z.string(),
    objeto: z.string(),
    valor_anual: z.number(),
    valor_global: z.number(),
    base_legal: z.string(),
    data_inicio: z.string(),
    data_fim: z.string(),
    termos_contratuais: z.string(),
    contratado_id: z.number(),
    modalidade_id: z.number(),
    status_id: z.number(),
    gestor_id: z.number(),
    fiscal_id: z.number(),
    fiscal_substituto_id: z.number().nullable(),
    pae: z.string(),
    doe: z.string(),
    data_doe: z.string(),
    documento: z.string().nullable(), // O documento pode não estar sempre presente
    created_at: z.string(),
    updated_at: z.string(),
    // Adicione os objetos aninhados se a API os retornar para facilitar o acesso
    contratado: z.object({ id: z.number(), nome: z.string(), cnpj: z.string() }).optional(),
    status: z.object({ id: z.number(), nome: z.string() }).optional(),
});

export type Contrato = z.infer<typeof contratoSchema>;

// Tipos para os dados dos dropdowns
export type Contratado = { id: number; nome: string; cnpj: string; };
export type Modalidade = { id: number; nome: string; };
export type Status = { id: number; nome: string; };
export type Usuario = { id: number; nome: string; perfil: string; };


const API_BASE_URL = "http://10.96.0.67/v1/"; // <-- SUBSTITUA PELA URL REAL DA SUA API

// Função auxiliar para tratar as respostas
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Ocorreu um erro na requisição.");
    }
    return response.json();
}

// ============================================================================
// FUNÇÕES DA API DE CONTRATOS
// ============================================================================

/**
 * Busca a lista de contratos, com filtros opcionais.
 * GET /contratos
 */
export async function getContratos(params?: { gestor_id?: number; fiscal_id?: number }): Promise<Contrato[]> {
    const url = new URL(`${API_BASE_URL}/contratos`);
    if (params?.gestor_id) url.searchParams.append('gestor_id', String(params.gestor_id));
    if (params?.fiscal_id) url.searchParams.append('fiscal_id', String(params.fiscal_id));

    const response = await fetch(url.toString());
    return handleResponse<Contrato[]>(response);
}

/**
 * Busca os detalhes de um único contrato.
 * GET /contratos/<id>
 */
export async function getContratoById(id: number): Promise<Contrato> {
    const response = await fetch(`${API_BASE_URL}/contratos/${id}`);
    return handleResponse<Contrato>(response);
}

/**
 * Cria um novo contrato.
 * POST /contratos
 */
export async function createContrato(formData: FormData): Promise<Contrato> {
    const response = await fetch(`${API_BASE_URL}/contratos`, {
        method: 'POST',
        body: formData, // O Content-Type é definido automaticamente pelo navegador para multipart/form-data
    });
    return handleResponse<Contrato>(response);
}

/**
 * Atualiza um contrato existente. (Assumindo que a rota é PUT /contratos/<id>)
 * A API não especifica, mas esta é a convenção REST.
 */
export async function updateContrato(id: number, formData: FormData): Promise<Contrato> {
    // A API para edição pode usar PUT ou POST com _method=PUT em FormData. Verifique a documentação.
    // Usaremos PUT como exemplo.
    const response = await fetch(`${API_BASE_URL}/contratos/${id}`, {
        method: 'PUT',
        body: formData,
    });
    return handleResponse<Contrato>(response);
}


// ============================================================================
// FUNÇÕES PARA OBTER DADOS PARA FORMULÁRIOS
// ============================================================================

export async function getContratados(): Promise<Contratado[]> {
    const response = await fetch(`${API_BASE_URL}/contratados`);
    return handleResponse<Contratado[]>(response);
}

export async function getModalidades(): Promise<Modalidade[]> {
    const response = await fetch(`${API_BASE_URL}/modalidades`);
    return handleResponse<Modalidade[]>(response);
}

export async function getStatus(): Promise<Status[]> {
    const response = await fetch(`${API_BASE_URL}/status`);
    return handleResponse<Status[]>(response);
}

export async function getUsuarios(): Promise<Usuario[]> {
    const response = await fetch(`${API_BASE_URL}/usuarios`);
    return handleResponse<Usuario[]>(response);
}