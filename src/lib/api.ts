import { z } from "zod";

// --- CONFIGURAÇÃO DA API ---
const API_URL = import.meta.env.VITE_API_URL;
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL;

if (!API_URL || !AUTH_API_URL) {
    throw new Error("As variáveis de ambiente VITE_API_URL e VITE_AUTH_API_URL devem ser definidas.");
}

// --- GERENCIADOR DE TOKEN ---
const tokenManager = {
    getToken: (): string | null => localStorage.getItem('authToken'),
    getTokenData: (): { token: string | null; type: string | null } => ({
        token: localStorage.getItem('authToken'),
        type: localStorage.getItem('authTokenType') || 'Bearer',
    }),
    saveToken: (token: string, type: string = 'Bearer'): void => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('authTokenType', type);
    },
    removeToken: (): void => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authTokenType');
    },
};

// --- SCHEMAS E TIPOS ---
// Mantido do seu código original para consistência
export const contratoSchema = z.object({
    id: z.number(), nr_contrato: z.string(), objeto: z.string(), valor_anual: z.coerce.number(),
    valor_global: z.coerce.number(), base_legal: z.string(), data_inicio: z.coerce.date(),
    data_fim: z.coerce.date(), termos_contratuais: z.string(), contratado_id: z.number(),
    modalidade_id: z.number(), status_id: z.number(), gestor_id: z.number(), fiscal_id: z.number(),
    fiscal_substituto_id: z.number().nullable(), pae: z.string(), doe: z.string(),
    data_doe: z.coerce.date(), documento: z.string().nullable(), created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
    contratado: z.object({ id: z.number(), nome: z.string(), cnpj: z.string() }).optional(),
    status: z.object({ id: z.number(), nome: z.string() }).optional(),
});
export type Contrato = z.infer<typeof contratoSchema>;
export type Modalidade = { id: number; nome: string; };
export type Status = { id: number; nome: string; };
export type Usuario = { id: number; nome: string; perfil: string; };

// Tipos para autenticação
export type LoginCredentials = { email: string; password: string };
export type LoginResponse = {
    access_token: string;
    token_type: string;
    contexto_sessao: {
        usuario_id: number;
        perfil_ativo_id: number;
        perfil_ativo_nome: string;
        perfis_disponiveis: { id: number; nome: string; }[];
        sessao_id: string;
    };
};
type ContextoSessao = LoginResponse['contexto_sessao'];

export type User = {
    id: number;
    nome: string;
    email: string;
    perfil_nome: string;
    matricula?: string;
};
export type Perfil = { id: number; nome: string; };
export type UserApiResponse = {
    data: User[];
    total_items: number;
    total_pages: number;
    current_page: number;
    per_page: number;
};
export type NewUserPayload = {
    nome: string;
    email: string;
    senha: string;
    perfil_id: number;
    cpf: string;
    matricula?: string;
};

export type UserDetail = {
    id: number;
    nome: string;
    email: string;
    cpf: string;
    matricula?: string;
    perfil_id: number;
};
export type EditUserPayload = Partial<{
    nome: string;
    email: string;
    senha: string;
    perfil_id: number;
    cpf: string;
    matricula: string;
}>;

export type Contratado = {
    id: number;
    nome: string;
    email: string;
    cnpj?: string | null;
    cpf?: string | null;
    telefone?: string | null;
};

export type ContratadoApiResponse = {
    data: Contratado[];
    total_items: number;
    total_pages: number;
    current_page: number;
    per_page: number;
};

export type NewContratadoPayload = {
    nome: string;
    email: string;
    cpf?: string | null;
    cnpj?: string | null;
    telefone?: string | null;
};

export type EditContratadoPayload = Partial<NewContratadoPayload>;


// --- FUNÇÕES AUXILIARES ---
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Erro na requisição: ${response.status}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
}

async function api<T>(endpoint: string, options?: RequestInit, useAuthUrl: boolean = false): Promise<T> {
    const baseUrl = useAuthUrl ? AUTH_API_URL : API_URL;
    const { token, type } = tokenManager.getTokenData();
    const headers = new Headers(options?.headers);
    
    headers.set('Accept', 'application/json');
    if (token) {
        headers.set('Authorization', `${type} ${token}`);
    }
    if (!(options?.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${baseUrl}${endpoint}`, { ...options, headers });
    return handleResponse<T>(response);
}

// ============================================================================
// FUNÇÕES DE AUTENTICAÇÃO
// ============================================================================
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
    const params = new URLSearchParams({
        grant_type: 'password',
        username: credentials.email,
        password: credentials.password,
    });
    // O endpoint de login usa a URL de autenticação
    const response = await fetch(`${AUTH_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
    });
    const data = await handleResponse<LoginResponse>(response);
    if (data.access_token) {
        tokenManager.saveToken(data.access_token, data.token_type);
    }
    return data;
}

export async function logout(): Promise<void> {
    try {
        await api('/auth/logout', { method: 'POST' }, true);
    } catch (error) {
        console.warn("A chamada para o endpoint de logout falhou, mas o logout local prosseguirá.", error);
    } finally {
        tokenManager.removeToken();
    }
}

export async function getCurrentContext(): Promise<ContextoSessao> {
    // Este endpoint deve estar na URL de autenticação
    return api<ContextoSessao>('/auth/contexto', {}, true);
}


export function getUsers(params: { page?: number; per_page?: number; nome?: string }): Promise<UserApiResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.per_page) searchParams.set('per_page', String(params.per_page));
    if (params.nome) searchParams.set('nome', params.nome);
    
    return api<UserApiResponse>(`/usuarios/?${searchParams.toString()}`);
}

/**
 * Busca a lista de perfis disponíveis.
 */
export function getPerfis(): Promise<Perfil[]> {
    return api<Perfil[]>('/perfis/');
}

/**
 * Cria um novo usuário.
 */
export function createUser(userData: NewUserPayload): Promise<User> {
    return api<User>('/usuarios', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
}

/**
 * Deleta um usuário pelo ID.
 */
export function deleteUser(userId: number): Promise<void> {
    return api<void>(`/usuarios/${userId}`, {
        method: 'DELETE',
    });
}

export function getUserById(userId: number): Promise<UserDetail> {
    return api<UserDetail>(`/usuarios/${userId}`);
}
export function updateUser(userId: number, userData: EditUserPayload): Promise<User> {
    return api<User>(`/usuarios/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(userData),
    });
}

export function getContratados(params: { page: number; per_page: number; nome?: string }): Promise<ContratadoApiResponse> {
    const url = new URL(`${API_URL}/contratados/`);
    url.searchParams.append('page', String(params.page));
    url.searchParams.append('per_page', String(params.per_page));
    if (params.nome) {
        url.searchParams.append('nome', params.nome);
    }
    const endpoint = `/contratados/${url.search}`;
    return api<ContratadoApiResponse>(endpoint);
}

/**
 * Busca os detalhes de um único contratado.
 * GET /contratados/{id}
 */
export function getContratadoById(id: number): Promise<Contratado> {
    return api<Contratado>(`/contratados/${id}`);
}

/**
 * Cria um novo contratado.
 * POST /contratados
 */
export function createContratado(payload: NewContratadoPayload): Promise<Contratado> {
    return api<Contratado>('/contratados', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

/**
 * Atualiza um contratado existente.
 * PATCH /contratados/{id}
 */
export function updateContratado(id: number, payload: EditContratadoPayload): Promise<Contratado> {
    return api<Contratado>(`/contratados/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
}

/**
 * Deleta um contratado.
 * DELETE /contratados/{id}
 */
export function deleteContratado(id: number): Promise<void> {
    return api<void>(`/contratados/${id}`, {
        method: 'DELETE',
    });
}



// ============================================================================
// FUNÇÕES DA API DE CONTRATOS (CRUD)
// ============================================================================
export function getContratos(params?: { gestor_id?: number; fiscal_id?: number }): Promise<Contrato[]> {
    const searchParams = new URLSearchParams();
    if (params?.gestor_id) searchParams.set('gestor_id', String(params.gestor_id));
    if (params?.fiscal_id) searchParams.set('fiscal_id', String(params.fiscal_id));
    return api<Contrato[]>(`/contratos?${searchParams.toString()}`);
}

export function getContratoById(id: number): Promise<Contrato> {
    return api<Contrato>(`/contratos/${id}`);
}

export function createContrato(formData: FormData): Promise<Contrato> {
    return api<Contrato>('/contratos', {
        method: 'POST',
        body: formData,
    });
}

export function updateContrato(
    id: number,
    formData: FormData
): Promise<Contrato> {
    formData.append('_method', 'PUT');
    return api<Contrato>(`/contratos/${id}`, {
        method: 'POST',
        body: formData,
    });
}

export function deleteContrato(id: number): Promise<void> {
    return api<void>(`/contratos/${id}`, {
        method: 'DELETE',
    });
}

// ============================================================================
// FUNÇÕES PARA OBTER DADOS PARA FORMULÁRIOS - Nenhuma alteração necessária
// ============================================================================



export function getModalidades(): Promise<Modalidade[]> {
    return api<Modalidade[]>('/modalidades');
}

export function getStatus(): Promise<Status[]> {
    return api<Status[]>('/status');
}

export function getUsuarios(): Promise<Usuario[]> {
    return api<Usuario[]>('/usuarios');
}
