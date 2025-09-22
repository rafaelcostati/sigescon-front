
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

// Tipos para relatórios
export type RelatorioDetalhado = {
    id: number;
    descricao: string;
    data_envio: string;
    titulo?: string;
    observacoes?: string;
    observacoes_fiscal?: string;
    status_relatorio: string;
    fiscal_nome?: string;
    data_analise?: string;
    analisado_por_nome?: string;
    observacoes_analise?: string;
    arquivo_id?: number;
    arquivo_nome?: string;
    nome_arquivo?: string;
    contrato_id: number;
    contrato_numero: string;
    enviado_por?: string;
    mes_competencia?: string;
    created_at?: string;
    is_mock?: boolean;
};

export type StatusRelatorio = {
    id: number;
    nome: string;
};

// Tipos para pendências
export type PendenciaFiscalCompleta = {
    id: number;
    pendencia_id: number;
    descricao: string;
    pendencia_descricao: string;
    pendencia_titulo: string;
    data_prazo: string;
    data_vencimento: string;
    data_criacao: string;
    prazo_entrega: string;
    status_pendencia: string;
    criado_por_nome?: string;
    contrato_id: number;
    contrato_numero: string;
    contrato_objeto: string;
};

// Tipos para dashboard
export type DashboardContadores = {
    contratos_ativos: number;
    contratos_vencidos: number;
    relatorios_pendentes: number;
    relatorios_para_analise: number;
    minhas_pendencias?: number;
    pendencias_em_atraso?: number;
    pendencias_pendentes?: number;
    pendencias_aguardando_analise?: number;
    pendencias_concluidas?: number;
};

export type DashboardFiscalPendenciasCompletoResponse = {
    contadores: DashboardContadores;
    minhas_pendencias: PendenciaFiscalCompleta[];
};

export type DashboardAdminCompletoResponse = {
    contadores: DashboardContadores;
    contratos_com_relatorios_pendentes: any[];
    contratos_com_pendencias: any[];
};

// Tipo para análise de relatório
export type AnalisarRelatorioPayload = {
    observacoes_analise?: string;
    status_id: number;
};


const API_BASE_URL = "http://127.0.0.1:8000/api/v1/";

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
    const url = new URL(`${API_BASE_URL}contratos`);
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
    const response = await fetch(`${API_BASE_URL}contratos/${id}`);
    return handleResponse<Contrato>(response);
}

/**
 * Cria um novo contrato.
 * POST /contratos
 */
export async function createContrato(formData: FormData): Promise<Contrato> {
    const response = await fetch(`${API_BASE_URL}contratos`, {
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
    const response = await fetch(`${API_BASE_URL}contratos/${id}`, {
        method: 'PUT',
        body: formData,
    });
    return handleResponse<Contrato>(response);
}


// ============================================================================
// FUNÇÕES PARA OBTER DADOS PARA FORMULÁRIOS
// ============================================================================

export async function getContratados(): Promise<Contratado[]> {
    const response = await fetch(`${API_BASE_URL}contratados`);
    return handleResponse<Contratado[]>(response);
}

export async function getModalidades(): Promise<Modalidade[]> {
    const response = await fetch(`${API_BASE_URL}modalidades`);
    return handleResponse<Modalidade[]>(response);
}

export async function getStatus(): Promise<Status[]> {
    const response = await fetch(`${API_BASE_URL}status`);
    return handleResponse<Status[]>(response);
}

export async function getUsuarios(): Promise<Usuario[]> {
    const response = await fetch(`${API_BASE_URL}usuarios`);
    return handleResponse<Usuario[]>(response);
}

// ============================================================================
// FUNÇÕES PARA RELATÓRIOS E DASHBOARD
// ============================================================================

export async function getRelatoriosPendentesAnalise(): Promise<RelatorioDetalhado[]> {
    const response = await fetch(`${API_BASE_URL}relatorios/pendentes-analise`);
    return handleResponse<RelatorioDetalhado[]>(response);
}

export async function getStatusRelatorios(): Promise<StatusRelatorio[]> {
    const response = await fetch(`${API_BASE_URL}status-relatorios`);
    return handleResponse<StatusRelatorio[]>(response);
}

export async function getDashboardFiscalPendenciasCompleto(): Promise<DashboardFiscalPendenciasCompletoResponse> {
    const response = await fetch(`${API_BASE_URL}dashboard/fiscal/pendencias-completo`);
    return handleResponse<DashboardFiscalPendenciasCompletoResponse>(response);
}

export async function getDashboardAdminCompleto(): Promise<DashboardAdminCompletoResponse> {
    const response = await fetch(`${API_BASE_URL}dashboard/admin/completo`);
    return handleResponse<DashboardAdminCompletoResponse>(response);
}

export async function getDashboardFiscalCompleto(): Promise<DashboardFiscalPendenciasCompletoResponse> {
    const response = await fetch(`${API_BASE_URL}dashboard/fiscal/completo`);
    return handleResponse<DashboardFiscalPendenciasCompletoResponse>(response);
}

export async function analisarRelatorio(relatorioId: number, payload: AnalisarRelatorioPayload): Promise<void> {
    const response = await fetch(`${API_BASE_URL}relatorios/${relatorioId}/analisar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return handleResponse<void>(response);
}

export async function downloadArquivoContrato(contratoId: number, arquivoId: number): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}contratos/${contratoId}/arquivos/${arquivoId}/download`);
    if (!response.ok) {
        throw new Error('Erro ao fazer download do arquivo');
    }
    return response.blob();
}

export async function getRelatoriosByContratoId(contratoId: number): Promise<{ data: RelatorioDetalhado[] }> {
    const response = await fetch(`${API_BASE_URL}contratos/${contratoId}/relatorios`);
    const data = await handleResponse<RelatorioDetalhado[]>(response);
    return { data };
}