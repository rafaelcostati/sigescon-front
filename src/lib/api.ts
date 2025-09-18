

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

async function apiBlob(endpoint: string, options?: RequestInit, useAuthUrl: boolean = false): Promise<Blob> {
    const baseUrl = useAuthUrl ? AUTH_API_URL : API_URL;
    const { token, type } = tokenManager.getTokenData();
    const headers = new Headers(options?.headers);

    if (token) {
        headers.set('Authorization', `${type} ${token}`);
    }

    const response = await fetch(`${baseUrl}${endpoint}`, { ...options, headers });

    if (!response.ok) {
        throw new Error(`Erro no download: ${response.statusText}`);
    }
    return response.blob();
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
// --- Tipos para Contratos e entidades relacionadas ---
export type Arquivo = { id: number; nome_arquivo: string; data_upload?: string; };
export type Relatorio = { id: number; descricao: string; data_envio: string; };
export type Pendencia = { id: number; contrato_id: number; descricao: string; data_prazo: string; status_pendencia_id: number; criado_por_usuario_id: number; status_nome?: string; criado_por_nome?: string; };
export type Contrato = { id: number; nr_contrato: string; objeto: string; valor_anual: number | null; valor_global: number | null; data_inicio: string; data_fim: string; contratado_id: number; modalidade_id: number; status_id: number; gestor_id: number; fiscal_id: number; fiscal_substituto_id: number | null; pae: string | null; doe: string | null; data_doe: string | null; modalidade_nome?: string; contratado_nome?: string; status_nome?: string; };
export type ContratoDetalhado = Contrato & { arquivos?: Arquivo[]; relatorios?: Relatorio[]; pendencias?: Pendencia[]; contratado?: Contratado; };
export type ContratosApiResponse = { data: Contrato[]; total_items: number; total_pages: number; current_page: number; per_page: number; };
export type NewPendenciaPayload = { descricao: string; data_prazo: string; status_pendencia_id: number; };

export function getContratos(filters: Record<string, any>): Promise<ContratosApiResponse> {
    const params = new URLSearchParams();
    for (const key in filters) {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
            params.append(key, String(filters[key]));
        }
    }
    return api<ContratosApiResponse>(`/contratos?${params.toString()}`);
}
export function deleteContrato(id: number): Promise<void> { return api<void>(`/contratos/${id}`, { method: 'DELETE' }); }
export function getContratoDetalhado(id: number): Promise<ContratoDetalhado> { return api<ContratoDetalhado>(`/contratos/${id}`); }
export function getPendenciasByContratoId(contratoId: number): Promise<{ data: Pendencia[] }> { return api<{ data: Pendencia[] }>(`/contratos/${contratoId}/pendencias/`); }
export function getRelatoriosByContratoId(contratoId: number): Promise<{ data: Relatorio[] }> { return api<{ data: Relatorio[] }>(`/contratos/${contratoId}/relatorios/`); }
export function createPendencia(contratoId: number, payload: NewPendenciaPayload): Promise<Pendencia> { return api<Pendencia>(`/contratos/${contratoId}/pendencias/`, { method: 'POST', body: JSON.stringify(payload) }); }
export function downloadArquivo(arquivoId: number): Promise<Blob> { return apiBlob(`/arquivos/${arquivoId}/download`); }
// --- Tipos para Modalidades ---
export type Modalidade = {
    id: number;
    nome: string;
};

export type NewModalidadePayload = {
    nome: string;
};

/**
 * Busca a lista de todas as modalidades.
 * GET /modalidades
 */
export function getModalidades(): Promise<Modalidade[]> {
    return api<Modalidade[]>('/modalidades');
}

/**
 * Cria uma nova modalidade.
 * POST /modalidades
 */
export function createModalidade(payload: NewModalidadePayload): Promise<Modalidade> {
    return api<Modalidade>('/modalidades', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

/**
 * Atualiza uma modalidade existente.
 * PATCH /modalidades/{id}
 */
export function updateModalidade(id: number, payload: NewModalidadePayload): Promise<Modalidade> {
    return api<Modalidade>(`/modalidades/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
}

/**
 * Deleta uma modalidade.
 * DELETE /modalidades/{id}
 */
export function deleteModalidade(id: number): Promise<void> {
    return api<void>(`/modalidades/${id}`, {
        method: 'DELETE',
    });
}

// ============================================================================
// FUNÇÕES PARA OBTER DADOS PARA FORMULÁRIOS - Nenhuma alteração necessária
// ============================================================================





export function getStatus(): Promise<Status[]> {
    return api<Status[]>('/status');
}

export function getUsuarios(p0: { per_page: number; }): Promise<Usuario[]> {
    return api<Usuario[]>('/usuarios');
}
