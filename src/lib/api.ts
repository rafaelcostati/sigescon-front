import axios from 'axios';

/**
 * Instância do Axios para chamadas de autenticação (login, etc.).
 * Não precisa de token de autorização.
 */
export const authApi = axios.create({
    baseURL: import.meta.env.VITE_AUTH_API_URL,
});

/**
 * Instância do Axios para chamadas à API que exigem autenticação.
 */
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

/**
 * Interceptor para adicionar o token JWT em todas as requisições
 * da instância `api`.
 */
api.interceptors.request.use(async (config) => {
    // Simula um pequeno atraso para garantir que o token esteja disponível
    await new Promise((resolve) => setTimeout(resolve, 500));

    const token = localStorage.getItem('authToken'); // Ou de onde você armazena o token

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
