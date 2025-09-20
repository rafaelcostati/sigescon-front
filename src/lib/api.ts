import { z } from "zod";
import { jwtDecode } from "jwt-decode";

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

// Tipos para gestão de perfis

export type UsuarioPerfil = {
    usuario_id: number;
    perfil_id: number;
    perfil_nome: string;
    data_concessao: string;
};

export type UsuarioPerfilGrantRequest = {
    perfil_ids: number[];
};

export type UsuarioComPerfis = {
    id: number;
    nome: string;
    email: string;
    matricula: string;
    ativo: boolean;
    perfis: string[];
    perfil_ids: number[];
    perfis_texto: string;
};

// Tipos para autenticação e múltiplos perfis baseados na API real
export type LoginCredentials = { email: string; password: string };

// Tipos baseados na documentação da API
export type PerfilAtivo = {
    id: number;
    nome: string;
    pode_ser_selecionado?: boolean;
    descricao?: string | null;
};

export type ContextoSessao = {
    usuario_id: number;
    perfil_ativo_id: number;
    perfil_ativo_nome: string;
    perfis_disponiveis: PerfilAtivo[];
    pode_alternar?: boolean;
    sessao_id: string;
    data_ultima_alternancia?: string | null;
};

export type LoginResponse = {
    access_token: string;
    token_type: string;
    contexto_sessao: ContextoSessao;
    requer_selecao_perfil?: boolean;
    mensagem?: string | null;
};

export type AlternarPerfilRequest = {
    novo_perfil_id: number;
    justificativa?: string | null;
};

// Para compatibilidade com o código existente
export type Perfil = {
    id: number;
    nome: "Administrador" | "Gestor" | "Fiscal";
    concedido_em?: string;
};

export type AlternarPerfilPayload = AlternarPerfilRequest;
export type AlternarPerfilResponse = ContextoSessao;

export type User = {
    id: number;
    nome: string;
    email: string;
    perfil_nome: string;
    matricula?: string;
};
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
    console.log('🔍 Processando resposta:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type')
    });
    
    if (!response.ok) {
        let errorData;
        try {
            const errorText = await response.text();
            console.log('❌ Texto do erro:', errorText);
            errorData = errorText ? JSON.parse(errorText) : { message: response.statusText };
        } catch (parseError) {
            console.error('❌ Erro ao fazer parse do erro:', parseError);
            errorData = { message: response.statusText };
        }
        
        console.error('❌ Erro da API:', errorData);
        throw new Error(errorData.message || errorData.detail || `Erro na requisição: ${response.status}`);
    }
    
    const text = await response.text();
    console.log('📄 Texto da resposta (primeiros 200 chars):', text.substring(0, 200));
    
    if (!text) {
        console.log('📄 Resposta vazia, retornando objeto vazio');
        return {} as T;
    }
    
    try {
        const parsed = JSON.parse(text);
        console.log('✅ JSON parseado com sucesso');
        return parsed;
    } catch (parseError) {
        console.error('❌ Erro ao fazer parse do JSON:', parseError);
        console.error('❌ Texto que causou erro:', text);
        throw new Error('Resposta da API não é um JSON válido');
    }
}

async function api<T>(endpoint: string, options?: RequestInit, useAuthUrl: boolean = false): Promise<T> {
    const baseUrl = useAuthUrl ? AUTH_API_URL : API_URL;
    const { token, type } = tokenManager.getTokenData();
    const headers = new Headers(options?.headers);
    
    headers.set('Accept', 'application/json');
    if (token) {
        headers.set('Authorization', `${type} ${token}`);
        console.log('🔑 Token presente na requisição');
    } else {
        console.log('⚠️ Nenhum token encontrado para a requisição');
    }
    
    if (!(options?.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const fullUrl = `${baseUrl}${endpoint}`;
    console.log('📡 Fazendo requisição para:', fullUrl);
    console.log('📡 Método:', options?.method || 'GET');
    console.log('📡 Headers:', Object.fromEntries(headers.entries()));
    
    if (options?.body && typeof options.body === 'string') {
        console.log('📡 Body:', options.body);
    }

    try {
        const response = await fetch(fullUrl, { ...options, headers });
        console.log('📥 Status da resposta:', response.status);
        
        if (!response.ok) {
            console.error('❌ Resposta não OK:', {
                status: response.status,
                statusText: response.statusText,
                url: fullUrl
            });
        }
        
        return handleResponse<T>(response);
    } catch (error) {
        console.error('❌ Erro na requisição:', {
            url: fullUrl,
            error: error
        });
        throw error;
    }
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
    console.log('🔐 Iniciando login para:', credentials.email);
    
    const params = new URLSearchParams({
        grant_type: 'password',
        username: credentials.email,
        password: credentials.password,
    });
    
    console.log('📡 Enviando requisição para:', `${AUTH_API_URL}/auth/login`);
    
    try {
        const response = await fetch(`${AUTH_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: params,
        });
        
        console.log('📥 Status da resposta:', response.status);
        console.log('📥 Headers da resposta:', Object.fromEntries(response.headers.entries()));
        
        const data = await handleResponse<LoginResponse>(response);
        console.log('✅ Dados do login recebidos:', {
            access_token: data.access_token ? '***TOKEN***' : 'undefined',
            token_type: data.token_type,
            contexto_sessao: data.contexto_sessao,
            requer_selecao_perfil: data.requer_selecao_perfil
        });
        
        if (data.access_token) {
            tokenManager.saveToken(data.access_token, data.token_type);
            console.log('💾 Token salvo no localStorage');
        }
        
        return data;
    } catch (error) {
        console.error('❌ Erro no login:', error);
        throw error;
    }
}

export async function logout(): Promise<void> {
    try {
        // A rota de logout está em /auth/logout na URL de autenticação
        await api('/auth/logout', { method: 'POST' }, true);
    } catch (error) {
        console.warn("A chamada para o endpoint de logout falhou, mas o logout local prosseguirá.", error);
    } finally {
        tokenManager.removeToken();
    }
}

export async function getCurrentContext(): Promise<ContextoSessao> {
    console.log('🔍 Buscando contexto atual da sessão');
    
    try {
        const response = await api<ContextoSessao>('/auth/contexto', {}, true);
        console.log('✅ Contexto obtido:', response);
        return response;
    } catch (error) {
        console.error('❌ Erro ao buscar contexto:', error);
        throw error;
    }
}

/**
 * Busca dados básicos do usuário logado
 * GET /usuarios/me
 */
export async function getCurrentUserInfo(): Promise<{ id: number; nome: string; email: string; matricula?: string }> {
    console.log('🔍 Buscando dados do usuário logado');
    
    try {
        const response = await api<{ id: number; nome: string; email: string; matricula?: string }>('/usuarios/me');
        console.log('✅ Dados do usuário obtidos:', response);
        return response;
    } catch (error) {
        console.error('❌ Erro ao buscar dados do usuário:', error);
        throw error;
    }
}

/**
 * Alterna o perfil ativo do usuário sem fazer logout
 * POST /auth/alternar-perfil
 */
export async function alternarPerfil(payload: AlternarPerfilPayload): Promise<AlternarPerfilResponse> {
    console.log('🔄 Alternando perfil para ID:', payload.novo_perfil_id);
    console.log('📡 Payload:', payload);
    
    try {
        const response = await api<AlternarPerfilResponse>('/auth/alternar-perfil', {
            method: 'POST',
            body: JSON.stringify(payload),
        }, true);
        
        console.log('✅ Perfil alternado com sucesso:', response);
        return response;
    } catch (error) {
        console.error('❌ Erro ao alternar perfil:', error);
        throw error;
    }
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
export const arquivoSchema = z.object({ id: z.number(), nome_arquivo: z.string(), data_upload: z.string().optional() });
export type Arquivo = z.infer<typeof arquivoSchema>;
export const relatorioSchema = z.object({ id: z.number(), descricao: z.string(), data_envio: z.string() });
export type Relatorio = z.infer<typeof relatorioSchema>;
export const pendenciaSchema = z.object({ id: z.number(), contrato_id: z.number(), descricao: z.string(), data_prazo: z.string(), status_pendencia_id: z.number(), criado_por_usuario_id: z.number(), status_nome: z.string().optional(), criado_por_nome: z.string().optional() });

export type Contrato = { id: number; nr_contrato: string; objeto: string; valor_anual: number | null; valor_global: number | null; data_inicio: string; data_fim: string; contratado_id: number; modalidade_id: number; status_id: number; gestor_id: number; fiscal_id: number; fiscal_substituto_id: number | null; pae: string | null; doe: string | null; data_doe: string | null; modalidade_nome?: string; contratado_nome?: string; status_nome?: string; };
export type ContratoDetalhado = Contrato & { arquivos?: Arquivo[]; relatorios?: Relatorio[]; pendencias?: Pendencia[]; contratado?: { nome: string; cnpj: string; cpf: string; }; };
export type ContratosApiResponse = { data: Contrato[]; total_items: number; total_pages: number; current_page: number; per_page: number; };


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

export function getRelatoriosByContratoId(contratoId: number): Promise<{ data: Relatorio[] }> { return api<{ data: Relatorio[] }>(`/contratos/${contratoId}/relatorios/`); }

// Tipos para envio de relatórios
export type SubmitRelatorioPayload = {
    observacoes_fiscal: string;
    mes_competencia: string; // formato: "YYYY-MM"
    pendencia_id: number;
    arquivo: File;
};

export type RelatorioResponse = {
    id: number;
    mes_competencia: string;
    observacoes_fiscal: string;
    pendencia_id: number;
    contrato_id: number;
    fiscal_usuario_id: number;
    arquivo_id: number;
    status_id: number;
    created_at: string;
    updated_at: string;
    enviado_por: string;
    status_relatorio: string;
    nome_arquivo: string;
};

// Tipos para status de relatórios
export type StatusRelatorio = {
    id: number;
    nome: string;
    descricao?: string;
};

// Tipos para análise de relatórios (conforme API)
export type AnalisarRelatorioPayload = {
    aprovador_usuario_id: number;
    status_id: number;
    observacoes_aprovador?: string;
};

export type RelatorioDetalhado = RelatorioResponse & {
    contrato_numero?: string;
    fiscal_nome?: string;
    pendencia_descricao?: string;
};

// Função para enviar relatório fiscal
export async function submitRelatorio(contratoId: number, payload: SubmitRelatorioPayload): Promise<RelatorioResponse> {
    const formData = new FormData();
    formData.append('observacoes_fiscal', payload.observacoes_fiscal);
    formData.append('mes_competencia', payload.mes_competencia);
    formData.append('pendencia_id', payload.pendencia_id.toString());
    formData.append('arquivo', payload.arquivo);
    
    console.log(`📄 Enviando relatório para contrato ${contratoId}:`, {
        observacoes_fiscal: payload.observacoes_fiscal,
        mes_competencia: payload.mes_competencia,
        pendencia_id: payload.pendencia_id,
        arquivo_nome: payload.arquivo.name,
        arquivo_tamanho: payload.arquivo.size
    });
    
    return api<RelatorioResponse>(`/contratos/${contratoId}/relatorios/`, {
        method: 'POST',
        body: formData,
        // Não definir Content-Type para FormData - o browser define automaticamente
        headers: {}
    });
}

// FUNÇÃO REMOVIDA: getAllRelatorios - endpoint /relatorios não existe na API
// Use getDashboardAdminRelatoriosPendentes() + getRelatoriosByContratoId() para obter relatórios

// Função para buscar status de relatórios
export async function getStatusRelatorios(): Promise<StatusRelatorio[]> {
    return api<StatusRelatorio[]>('/statusrelatorio/');
}

// Função para analisar relatório (conforme API)
export async function analisarRelatorio(contratoId: number, relatorioId: number, payload: AnalisarRelatorioPayload): Promise<RelatorioResponse> {
    console.log(`📊 Analisando relatório ${relatorioId} do contrato ${contratoId}:`, payload);
    
    return api<RelatorioResponse>(`/contratos/${contratoId}/relatorios/${relatorioId}/analise`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

// Função para obter detalhes de um relatório
export async function getRelatorioDetalhes(contratoId: number, relatorioId: number): Promise<RelatorioDetalhado> {
    return api<RelatorioDetalhado>(`/contratos/${contratoId}/relatorios/${relatorioId}`);
}

export function downloadArquivoContrato(contratoId: number, arquivoId: number): Promise<Blob> {
    return apiBlob(`/contratos/${contratoId}/arquivos/${arquivoId}/download`);
}

export type StatusPendencia = {
    id: number;
    nome: string;
};

export type Pendencia = {
    descricao: string;
    data_prazo: string; // formato: "2019-08-24"
    status_pendencia_id: number;
    criado_por_usuario_id: number;
    id: number;
    contrato_id: number;
    created_at: string; // formato ISO: "2019-08-24T14:15:22Z"
    updated_at: string; // formato ISO: "2019-08-24T14:15:22Z"
    status_nome: string | null;
    criado_por_nome: string | null;
};

export type NewPendenciaPayload = {
    descricao: string;
    data_prazo: string; // formato: "YYYY-MM-DD"
    status_pendencia_id: number;
    criado_por_usuario_id: number;
};

export type EditPendenciaPayload = Partial<{
    descricao: string;
    data_prazo: string;
    status_pendencia_id: number;
}>;

export type PendenciasApiResponse = {
    data: Pendencia[];
    total_items?: number;
    total_pages?: number;
    current_page?: number;
    per_page?: number;
};

// --- FUNÇÕES PARA PENDÊNCIAS ---

/**
 * Busca todas as pendências de um contrato
 * GET /contratos/{contrato_id}/pendencias/
 */
export function getPendenciasByContratoId(contratoId: number): Promise<Pendencia[]> {
    return api<Pendencia[]>(`/contratos/${contratoId}/pendencias/`);
}

/**
 * Cria uma nova pendência para um contrato
 * POST /contratos/{contrato_id}/pendencias/
 */
export function createPendencia(contratoId: number, payload: NewPendenciaPayload): Promise<Pendencia> {
    return api<Pendencia>(`/contratos/${contratoId}/pendencias/`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

/**
 * Atualiza uma pendência existente
 * PATCH /contratos/{contrato_id}/pendencias/{pendencia_id}
 */
export function updatePendencia(
    contratoId: number, 
    pendenciaId: number, 
    payload: EditPendenciaPayload
): Promise<Pendencia> {
    return api<Pendencia>(`/contratos/${contratoId}/pendencias/${pendenciaId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
}

/**
 * Deleta uma pendência
 * DELETE /contratos/{contrato_id}/pendencias/{pendencia_id}
 */
export function deletePendencia(contratoId: number, pendenciaId: number): Promise<void> {
    return api<void>(`/contratos/${contratoId}/pendencias/${pendenciaId}`, {
        method: 'DELETE',
    });
}

/**
 * Busca todos os status de pendências disponíveis
 * GET /status-pendencias (assumindo que existe este endpoint)
 */
export function getStatusPendencias(): Promise<StatusPendencia[]> {
    return api<StatusPendencia[]>('/status-pendencias');
}
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

export function getUsuarios(): Promise<Usuario[]> {
    return api<Usuario[]>('/usuarios');
}

// ============================================================================
// Perfil do usuário logado
// ============================================================================

export type UserProfile = {
    id: number;
    nome: string;
    email: string;
    matricula: string;
    ativo: boolean;
    perfis: string[];
    perfil_ids: number[];
    perfis_texto: string;
};

export type ChangePasswordPayload = {
    senha_antiga: string;
    nova_senha: string;
};

/**
 * Busca o perfil completo do usuário logado
 * GET /usuarios/{user_id}/perfis/completo
 */
export function getUserProfile(userId: number): Promise<UserProfile> {
    return api<UserProfile>(`/usuarios/${userId}/perfis/completo`);
}

/**
 * Altera a senha do usuário logado
 * Tenta diferentes métodos HTTP conforme a API aceitar
 */
export async function changeUserPassword(userId: number, payload: ChangePasswordPayload): Promise<string> {
    // Primeiro tenta com PUT (mais comum para alterações)
    try {
        return await api<string>(`/usuarios/${userId}/alterar-senha`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    } catch (error: any) {
        // Se PUT não funcionar, tenta PATCH
        if (error.message?.includes('405') || error.message?.includes('Method Not Allowed')) {
            try {
                return await api<string>(`/usuarios/${userId}/alterar-senha`, {
                    method: 'PATCH',
                    body: JSON.stringify(payload),
                });
            } catch (patchError: any) {
                // Se PATCH também não funcionar, tenta POST
                if (patchError.message?.includes('405') || patchError.message?.includes('Method Not Allowed')) {
                    return await api<string>(`/usuarios/${userId}/alterar-senha`, {
                        method: 'POST',
                        body: JSON.stringify(payload),
                    });
                }
                throw patchError;
            }
        }
        throw error;
    }
}

/**
 * Utilitário para obter o ID do usuário atual do token JWT
 */
export function getCurrentUserId(): number | null {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) return null;
        const decoded: { sub: string } = jwtDecode(token);
        return parseInt(decoded.sub, 10);
    } catch (error) {
        console.error("Failed to decode token:", error);
        return null;
    }
}

// ============================================================================
// FUNÇÕES PARA CONTRATOS - CRUD COMPLETO
// ============================================================================

export type NewContratoPayload = {
    nr_contrato: string;
    objeto: string;
    data_inicio: string;
    data_fim: string;
    contratado_id: number;
    modalidade_id: number;
    status_id: number;
    gestor_id: number;
    fiscal_id: number;
    fiscal_substituto_id?: number;
    valor_anual?: number;
    valor_global?: number;
    base_legal?: string;
    termos_contratuais?: string;
    pae?: string;
    doe?: string;
    data_doe?: string;
};

export type EditContratoPayload = Partial<NewContratoPayload>;

/**
 * Cria um novo contrato com dados de formulário e arquivo opcional
 * POST /contratos
 */
export function createContrato(formData: FormData): Promise<Contrato> {
    return api<Contrato>('/contratos', {
        method: 'POST',
        body: formData,
    });
}

/**
 * Atualiza um contrato existente com dados de formulário e arquivo opcional
 * PATCH /contratos/{contrato_id}
 */
export function updateContrato(contratoId: number, formData: FormData): Promise<Contrato> {
    return api<Contrato>(`/contratos/${contratoId}`, {
        method: 'PATCH',
        body: formData,
    });
}

/**
 * Busca arquivos de um contrato específico
 * GET /contratos/{contrato_id}/arquivos
 */
// Tipo para resposta da API de arquivos
export type ArquivosResponse = {
    arquivos: {
        id: number;
        nome_arquivo: string;
        tipo_arquivo: string;
        tamanho_bytes: number;
        contrato_id: number;
        created_at: string;
    }[];
    total_arquivos: number;
    contrato_id: number;
};

export async function getArquivosByContratoId(contratoId: number): Promise<ArquivosResponse> {
    // Alguns backends exigem barra final; além disso, trate 404 como "sem arquivos"
    try {
        return await api<ArquivosResponse>(`/contratos/${contratoId}/arquivos/`);
    } catch (err: any) {
        if (typeof err?.message === 'string' && err.message.toLowerCase().includes('not found')) {
            return {
                arquivos: [],
                total_arquivos: 0,
                contrato_id: contratoId
            };
        }
        throw err;
    }
}

/**
 * Deleta um arquivo específico
 * DELETE /arquivos/{arquivo_id}
 */
export function deleteArquivoContrato(contratoId: number, arquivoId: number): Promise<void> {
    return api<void>(`/contratos/${contratoId}/arquivos/${arquivoId}`, {
        method: 'DELETE',
    });
}

// --- FUNÇÕES PARA GESTÃO DE PERFIS ---

/**
 * Busca todos os perfis disponíveis no sistema
 * GET /perfis
 */
export function getAllPerfis(): Promise<Perfil[]> {
    return api<Perfil[]>('/perfis/');
}

/**
 * Busca todos os perfis de um usuário específico
 * GET /usuarios/{usuario_id}/perfis
 */
export function getUserPerfis(usuarioId: number): Promise<UsuarioPerfil[]> {
    return api<UsuarioPerfil[]>(`/usuarios/${usuarioId}/perfis`);
}

/**
 * Busca informações completas de um usuário incluindo todos os perfis
 * GET /usuarios/{usuario_id}/perfis/completo
 */
export function getUserCompleteInfo(usuarioId: number): Promise<UsuarioComPerfis> {
    return api<UsuarioComPerfis>(`/usuarios/${usuarioId}/perfis/completo`);
}

/**
 * Concede múltiplos perfis a um usuário
 * POST /usuarios/{usuario_id}/perfis/conceder
 */
export function grantProfilesToUser(usuarioId: number, request: UsuarioPerfilGrantRequest): Promise<UsuarioPerfil[]> {
    return api<UsuarioPerfil[]>(`/usuarios/${usuarioId}/perfis/conceder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
    });
}

/**
 * Revoga múltiplos perfis de um usuário
 * POST /usuarios/{usuario_id}/perfis/revogar
 */
export function revokeProfilesFromUser(usuarioId: number, request: UsuarioPerfilGrantRequest): Promise<void> {
    return api<void>(`/usuarios/${usuarioId}/perfis/revogar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
    });
}

/**
 * Cria um usuário básico sem perfil (para posterior concessão de perfis)
 * POST /usuarios
 */
export function createUserWithoutProfile(userData: Omit<NewUserPayload, 'perfil_id'>): Promise<User> {
    return api<User>('/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
}

// Tipo para criação de usuário sem perfil_id obrigatório
export type CreateUserPayload = {
    nome: string;
    email: string;
    senha: string;
    cpf: string;
    matricula?: string;
};

// --- TIPOS PARA GESTÃO DE PENDÊNCIAS VENCIDAS ---

/**
 * Tipos para pendências vencidas do dashboard administrativo
 */
export type PendenciaVencida = {
    pendencia_id: number;
    titulo: string;
    descricao: string;
    data_criacao: string;
    prazo_entrega: string;
    dias_em_atraso: number;
    urgencia: "CRÍTICA" | "ALTA" | "MÉDIA";
    contrato_id: number;
    contrato_numero: string;
    contrato_objeto: string;
    fiscal_nome: string;
    gestor_nome: string;
};

export type DashboardAdminPendenciasVencidasResponseOld = {
    pendencias_vencidas: PendenciaVencida[];
    total_pendencias_vencidas: number;
    contratos_afetados: number;
    pendencias_criticas: number;    // > 30 dias
    pendencias_altas: number;       // 15-30 dias  
    pendencias_medias: number;      // 1-14 dias
};

/**
 * Tipos para pendências do fiscal
 */
export type PendenciaFiscal = {
    contrato_id: number;
    contrato_numero: string;
    contrato_objeto: string;
    pendencia_id: number;
    pendencia_titulo: string;
    pendencia_descricao: string;
    data_criacao: string;
    prazo_entrega: string;
    dias_restantes: number;  // Negativo = vencida
    em_atraso: boolean;      // Identifica vencidas
};

export type DashboardFiscalPendenciasResponse = {
    pendencias: PendenciaFiscal[];
    total_pendencias: number;
    pendencias_em_atraso: number;      // Contador de vencidas
    pendencias_proximas_vencimento: number;
};

// --- FUNÇÕES API PARA PENDÊNCIAS VENCIDAS ---

/**
 * Busca pendências vencidas para o dashboard administrativo
 * GET /api/v1/dashboard/admin/pendencias-vencidas
 */
export async function getDashboardAdminPendenciasVencidas(): Promise<DashboardAdminPendenciasVencidasResponseOld> {
    console.log("🔍 Buscando pendências vencidas do dashboard administrativo...");
    
    try {
        const response = await api<DashboardAdminPendenciasVencidasResponseOld>('/dashboard/admin/pendencias-vencidas');
        
        console.log("✅ Pendências vencidas carregadas:", {
            total: response.total_pendencias_vencidas,
            criticas: response.pendencias_criticas,
            altas: response.pendencias_altas,
            medias: response.pendencias_medias,
            contratos_afetados: response.contratos_afetados
        });
        
        return response;
    } catch (error) {
        console.error("❌ Erro ao buscar pendências vencidas:", error);
        throw error;
    }
}

/**
 * Busca pendências do fiscal (incluindo vencidas)
 * GET /api/v1/dashboard/fiscal/minhas-pendencias
 */
export async function getDashboardFiscalPendencias(): Promise<DashboardFiscalPendenciasResponse> {
    console.log("🔍 Buscando pendências do fiscal...");
    
    try {
        const response = await api<DashboardFiscalPendenciasResponse>('/dashboard/fiscal/minhas-pendencias');
        
        console.log("✅ Pendências do fiscal carregadas:", {
            total: response.total_pendencias,
            em_atraso: response.pendencias_em_atraso,
            proximas_vencimento: response.pendencias_proximas_vencimento
        });
        
        return response;
    } catch (error) {
        console.error("❌ Erro ao buscar pendências do fiscal:", error);
        throw error;
    }
}

// --- TIPOS PARA NOVOS DASHBOARDS DA API ---

/**
 * Tipos para contratos com relatórios pendentes
 */
export type ContratoComRelatoriosPendentes = {
    id: number;
    nr_contrato: string;
    objeto: string;
    data_inicio: string;
    data_fim: string;
    contratado_nome: string;
    gestor_nome: string;
    fiscal_nome: string;
    status_nome: string;
    relatorios_pendentes_count: number;
    ultimo_relatorio_data: string;
    ultimo_relatorio_fiscal: string;
};

export type DashboardAdminRelatoriosPendentesResponse = {
    contratos: ContratoComRelatoriosPendentes[];
    total_contratos: number;
    total_relatorios_pendentes: number;
};

/**
 * Tipos para contratos com pendências
 */
export type ContratoComPendencias = {
    id: number;
    nr_contrato: string;
    objeto: string;
    data_inicio: string;
    data_fim: string;
    contratado_nome: string;
    gestor_nome: string;
    fiscal_nome: string;
    status_nome: string;
    pendencias_count: number;
    pendencias_em_atraso: number;
    ultima_pendencia_data: string;
};

export type DashboardAdminPendenciasResponse = {
    contratos: ContratoComPendencias[];
    total_contratos: number;
    total_pendencias: number;
};

/**
 * Tipos para dashboard completo do administrador
 */
export type DashboardContadores = {
    relatorios_para_analise: number;
    contratos_com_pendencias: number;
    usuarios_ativos: number;
    contratos_ativos: number;
    minhas_pendencias: number;
    pendencias_em_atraso: number;
    relatorios_enviados_mes: number;
    contratos_sob_gestao: number;
    relatorios_equipe_pendentes: number;
};

export type DashboardAdminCompletoResponse = {
    contadores: DashboardContadores;
    contratos_com_relatorios_pendentes: ContratoComRelatoriosPendentes[];
    contratos_com_pendencias: ContratoComPendencias[];
};

/**
 * Tipos para pendências do fiscal (atualizado)
 */
export type PendenciaFiscalCompleta = {
    contrato_id: number;
    contrato_numero: string;
    contrato_objeto: string;
    pendencia_id: number;
    pendencia_titulo: string;
    pendencia_descricao: string;
    data_criacao: string;
    prazo_entrega: string;
    dias_restantes: number;
    em_atraso: boolean;
};

export type DashboardFiscalPendenciasCompletoResponse = {
    pendencias: PendenciaFiscalCompleta[];
    total_pendencias: number;
    pendencias_em_atraso: number;
    pendencias_proximas_vencimento: number;
};

export type DashboardFiscalCompletoResponse = {
    contadores: DashboardContadores;
    minhas_pendencias: PendenciaFiscalCompleta[];
};

/**
 * Tipos para resumo de atividades por perfil
 */
export type ResumoAtividadesAdmin = {
    perfil: "Administrador";
    relatorios_para_analisar: number;
    contratos_com_pendencias: number;
    acao_necessaria: boolean;
};

export type ResumoAtividadesFiscal = {
    perfil: "Fiscal";
    total_pendencias: number;
    pendencias_em_atraso: number;
    pendencias_proximas_vencimento: number;
    acao_necessaria: boolean;
};

export type ResumoAtividadesGestor = {
    perfil: "Gestor";
    contratos_sob_gestao: number;
    relatorios_equipe_pendentes: number;
    acao_necessaria: boolean;
};

export type ResumoAtividades = ResumoAtividadesAdmin | ResumoAtividadesFiscal | ResumoAtividadesGestor;

/**
 * Tipos para pendências vencidas (atualizado)
 */
export type PendenciaVencidaCompleta = {
    pendencia_id: number;
    titulo: string;
    descricao: string;
    data_criacao: string;
    prazo_entrega: string;
    dias_em_atraso: number;
    contrato_id: number;
    contrato_numero: string;
    contrato_objeto: string;
    fiscal_nome: string;
    gestor_nome: string;
    urgencia: "CRÍTICA" | "ALTA" | "MÉDIA";
};

export type DashboardAdminPendenciasVencidasResponse = {
    pendencias_vencidas: PendenciaVencidaCompleta[];
    total_pendencias_vencidas: number;
    contratos_afetados: number;
    pendencias_criticas: number;
    pendencias_altas: number;
    pendencias_medias: number;
};

// --- FUNÇÕES API PARA NOVOS DASHBOARDS ---

/**
 * Busca contratos com relatórios pendentes (Admin)
 * GET /api/v1/dashboard/admin/contratos-com-relatorios-pendentes
 */
export async function getDashboardAdminRelatoriosPendentes(): Promise<DashboardAdminRelatoriosPendentesResponse> {
    console.log("🔍 Buscando contratos com relatórios pendentes...");
    
    try {
        const response = await api<DashboardAdminRelatoriosPendentesResponse>('/dashboard/admin/contratos-com-relatorios-pendentes');
        
        console.log("✅ Contratos com relatórios pendentes carregados:", {
            total_contratos: response.total_contratos,
            total_relatorios_pendentes: response.total_relatorios_pendentes
        });
        
        return response;
    } catch (error) {
        console.error("❌ Erro ao buscar contratos com relatórios pendentes:", error);
        throw error;
    }
}

/**
 * Busca contratos com pendências (Admin)
 * GET /api/v1/dashboard/admin/contratos-com-pendencias
 */
export async function getDashboardAdminPendencias(): Promise<DashboardAdminPendenciasResponse> {
    console.log("🔍 Buscando contratos com pendências...");
    
    try {
        const response = await api<DashboardAdminPendenciasResponse>('/dashboard/admin/contratos-com-pendencias');
        
        console.log("✅ Contratos com pendências carregados:", {
            total_contratos: response.total_contratos,
            total_pendencias: response.total_pendencias
        });
        
        return response;
    } catch (error) {
        console.error("❌ Erro ao buscar contratos com pendências:", error);
        throw error;
    }
}

/**
 * Busca dashboard completo do administrador
 * GET /api/v1/dashboard/admin/completo
 */
export async function getDashboardAdminCompleto(): Promise<DashboardAdminCompletoResponse> {
    console.log("🔍 Buscando dashboard completo do administrador...");
    
    try {
        const response = await api<DashboardAdminCompletoResponse>('/dashboard/admin/completo');
        
        console.log("✅ Dashboard completo do administrador carregado:", {
            contadores: response.contadores,
            contratos_com_relatorios: response.contratos_com_relatorios_pendentes.length,
            contratos_com_pendencias: response.contratos_com_pendencias.length
        });
        
        return response;
    } catch (error) {
        console.error("❌ Erro ao buscar dashboard completo do administrador:", error);
        throw error;
    }
}

/**
 * Busca pendências do fiscal (atualizada)
 * GET /api/v1/dashboard/fiscal/minhas-pendencias
 */
export async function getDashboardFiscalPendenciasCompleto(): Promise<DashboardFiscalPendenciasCompletoResponse> {
    console.log("🔍 Buscando pendências completas do fiscal...");
    
    try {
        const response = await api<DashboardFiscalPendenciasCompletoResponse>('/dashboard/fiscal/minhas-pendencias');
        
        console.log("✅ Pendências completas do fiscal carregadas:", {
            total_pendencias: response.total_pendencias,
            pendencias_em_atraso: response.pendencias_em_atraso,
            pendencias_proximas_vencimento: response.pendencias_proximas_vencimento
        });
        
        return response;
    } catch (error) {
        console.error("❌ Erro ao buscar pendências completas do fiscal:", error);
        throw error;
    }
}

/**
 * Busca dashboard completo do fiscal
 * GET /api/v1/dashboard/fiscal/completo
 */
export async function getDashboardFiscalCompleto(): Promise<DashboardFiscalCompletoResponse> {
    console.log("🔍 Buscando dashboard completo do fiscal...");
    
    try {
        const response = await api<DashboardFiscalCompletoResponse>('/dashboard/fiscal/completo');
        
        console.log("✅ Dashboard completo do fiscal carregado:", {
            contadores: response.contadores,
            minhas_pendencias: response.minhas_pendencias.length
        });
        
        return response;
    } catch (error) {
        console.error("❌ Erro ao buscar dashboard completo do fiscal:", error);
        throw error;
    }
}

/**
 * Busca contadores gerais do dashboard
 * GET /api/v1/dashboard/contadores
 */
export async function getDashboardContadores(): Promise<DashboardContadores> {
    console.log("🔍 Buscando contadores do dashboard...");
    
    try {
        const response = await api<DashboardContadores>('/dashboard/contadores');
        
        console.log("✅ Contadores do dashboard carregados:", response);
        
        return response;
    } catch (error) {
        console.error("❌ Erro ao buscar contadores do dashboard:", error);
        throw error;
    }
}

/**
 * Busca resumo de atividades por perfil
 * GET /api/v1/dashboard/resumo-atividades
 */
export async function getDashboardResumoAtividades(): Promise<ResumoAtividades> {
    console.log("🔍 Buscando resumo de atividades...");
    
    try {
        const response = await api<ResumoAtividades>('/dashboard/resumo-atividades');
        
        console.log("✅ Resumo de atividades carregado:", response);
        
        return response;
    } catch (error) {
        console.error("❌ Erro ao buscar resumo de atividades:", error);
        throw error;
    }
}

/**
 * Busca pendências vencidas do administrador (atualizada)
 * GET /api/v1/dashboard/admin/pendencias-vencidas
 */
export async function getDashboardAdminPendenciasVencidasCompleto(): Promise<DashboardAdminPendenciasVencidasResponse> {
    console.log("🔍 Buscando pendências vencidas completas do administrador...");
    
    try {
        const response = await api<DashboardAdminPendenciasVencidasResponse>('/dashboard/admin/pendencias-vencidas');
        
        console.log("✅ Pendências vencidas completas carregadas:", {
            total_pendencias_vencidas: response.total_pendencias_vencidas,
            contratos_afetados: response.contratos_afetados,
            pendencias_criticas: response.pendencias_criticas,
            pendencias_altas: response.pendencias_altas,
            pendencias_medias: response.pendencias_medias
        });
        
        return response;
    } catch (error) {
        console.error("❌ Erro ao buscar pendências vencidas completas:", error);
        throw error;
    }
}
