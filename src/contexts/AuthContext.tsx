import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
// Importa as funções da nossa nova api.ts.
// É necessário adicionar a função 'getCurrentContext' em sua api.ts.
import { 
  login as apiLogin, 
  logout as apiLogout, 
  getCurrentContext,
  type LoginCredentials,
  type LoginResponse // Importa os tipos da API para manter consistência
 // Importa os tipos da API para manter consistência
} from "@/lib/api"; 


// O tipo ContextoSessao é derivado da resposta do login
type ContextoSessao = LoginResponse['contexto_sessao'];

type AuthContextType = {
  user: ContextoSessao | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ContextoSessao | null>(null);
  const [loading, setLoading] = useState(true);

  // Efeito para inicializar a autenticação ao carregar a aplicação
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Verifica se há token antes de tentar buscar o contexto
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.info("Nenhum token encontrado. Usuário não autenticado.");
          setUser(null);
          return;
        }

        // A função getCurrentContext() de api.ts já usa o token do localStorage
        const contexto = await getCurrentContext();
        setUser(contexto);
      } catch (error) {
        // Se a busca pelo contexto falhar, significa que não há sessão válida.
        console.info("Nenhuma sessão ativa encontrada.");
        setUser(null); // Garante que o estado de usuário esteja limpo
        // Remove token inválido
        localStorage.removeItem('authToken');
        localStorage.removeItem('authTokenType');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Função de login que utiliza a apiLogin de api.ts
  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const credentials: LoginCredentials = { email: username, password };
      const loginResponse = await apiLogin(credentials);
      
      setUser(loginResponse.contexto_sessao);

    } catch (err: any) {
      setUser(null); 
      console.error("Erro no login:", err);
      // Propaga o erro para que a UI de login possa exibi-lo
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Função de logout que utiliza a apiLogout de api.ts
  const logout = async () => {
    // Limpa o estado do usuário imediatamente para evitar redirecionamentos
    setUser(null);
    
    try {
      // apiLogout já lida com a chamada à API e a remoção do token
      await apiLogout();
    } catch (error) {
      console.error("Erro ao fazer logout na API:", error);
      // Mesmo com erro na API, mantém o logout local
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

