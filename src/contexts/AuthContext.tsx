import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
// Importa as funções da nossa nova api.ts.
import { 
  login as apiLogin, 
  logout as apiLogout, 
  getCurrentContext,
  getCurrentUserInfo,
  alternarPerfil as apiAlternarPerfil,
  type LoginCredentials,
  type ContextoSessao,
  type AlternarPerfilPayload
} from "@/lib/api"; 

// Tipos para compatibilidade
type UserData = {
  id: number;
  nome: string;
  email: string;
  perfil_ativo: {
    id: number;
    nome: "Administrador" | "Gestor" | "Fiscal";
  };
  perfis_disponiveis: {
    id: number;
    nome: "Administrador" | "Gestor" | "Fiscal";
  }[];
};

type AuthContextType = {
  user: UserData | null;
  contextoSessao: ContextoSessao | null;
  perfilAtivo: {
    id: number;
    nome: "Administrador" | "Gestor" | "Fiscal";
  } | null;
  perfisDisponiveis: {
    id: number;
    nome: "Administrador" | "Gestor" | "Fiscal";
  }[];
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  alternarPerfil: (novoPerfilId: number) => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  contextoSessao: null,
  perfilAtivo: null,
  perfisDisponiveis: [],
  loading: true,
  login: async () => {},
  logout: () => {},
  alternarPerfil: async () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [contextoSessao, setContextoSessao] = useState<ContextoSessao | null>(null);
  const [perfilAtivo, setPerfilAtivo] = useState<{
    id: number;
    nome: "Administrador" | "Gestor" | "Fiscal";
  } | null>(null);
  const [perfisDisponiveis, setPerfisDisponiveis] = useState<{
    id: number;
    nome: "Administrador" | "Gestor" | "Fiscal";
  }[]>([]);
  const [loading, setLoading] = useState(true);

  // Efeito para inicializar a autenticação ao carregar a aplicação
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 Inicializando autenticação...');
      
      try {
        // Verifica se há token antes de tentar buscar o contexto
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.info("⚠️ Nenhum token encontrado. Usuário não autenticado.");
          clearAuthState();
          return;
        }

        console.log('🔑 Token encontrado, buscando contexto...');
        // A função getCurrentContext() de api.ts já usa o token do localStorage
        const contexto = await getCurrentContext();
        console.log("✅ Contexto carregado:", contexto);
        
        setContextoSessao(contexto);
        
        // Tenta buscar informações do usuário
        let userInfo;
        try {
          userInfo = await getCurrentUserInfo();
          console.log('✅ Dados do usuário carregados:', userInfo);
        } catch (userError) {
          console.warn("⚠️ Não foi possível carregar dados do usuário, usando dados básicos");
          userInfo = {
            id: contexto.usuario_id,
            nome: "Usuário",
            email: "usuario@exemplo.com"
          };
        }
        
        // Adapta dados do contexto para o formato UserData
        const userData: UserData = {
          id: contexto.usuario_id,
          nome: userInfo.nome,
          email: userInfo.email,
          perfil_ativo: {
            id: contexto.perfil_ativo_id,
            nome: contexto.perfil_ativo_nome as "Administrador" | "Gestor" | "Fiscal"
          },
          perfis_disponiveis: (contexto.perfis_disponiveis || []).map(p => ({
            id: p.id,
            nome: p.nome as "Administrador" | "Gestor" | "Fiscal"
          }))
        };
        
        console.log('👤 Dados do usuário criados:', userData);
        
        setUser(userData);
        setPerfilAtivo(userData.perfil_ativo);
        setPerfisDisponiveis(userData.perfis_disponiveis);
        
        console.log('✅ Autenticação inicializada com sucesso');
      } catch (error) {
        // Se a busca pelo contexto falhar, significa que não há sessão válida.
        console.error("❌ Erro ao inicializar autenticação:", error);
        clearAuthState();
        // Remove token inválido
        localStorage.removeItem('authToken');
        localStorage.removeItem('authTokenType');
      } finally {
        setLoading(false);
        console.log('🏁 Inicialização da autenticação finalizada');
      }
    };

    initializeAuth();
  }, []);

  // Função para limpar todos os estados de autenticação
  const clearAuthState = () => {
    console.log('🧹 Limpando estados de autenticação...');
    setUser(null);
    setContextoSessao(null);
    setPerfilAtivo(null);
    setPerfisDisponiveis([]);
    console.log('✅ Estados de autenticação limpos');
  };

  // Função de login que utiliza a apiLogin de api.ts
  const login = async (username: string, password: string) => {
    console.log('🚀 Iniciando processo de login...');
    setLoading(true);
    
    try {
      const credentials: LoginCredentials = { email: username, password };
      const loginResponse = await apiLogin(credentials);
      
      console.log("✅ Resposta do login recebida:", {
        access_token: loginResponse.access_token ? '***TOKEN***' : 'undefined',
        token_type: loginResponse.token_type,
        contexto_sessao: loginResponse.contexto_sessao,
        requer_selecao_perfil: loginResponse.requer_selecao_perfil
      });
      
      // A API retorna apenas contexto_sessao, não user
      if (loginResponse.contexto_sessao) {
        console.log('🔄 Adaptando dados do contexto para formato UserData...');
        
        // Buscar dados reais do usuário
        let userInfo;
        try {
          userInfo = await getCurrentUserInfo();
        } catch (error) {
          console.warn('⚠️ Usando dados básicos do usuário');
          userInfo = {
            id: loginResponse.contexto_sessao.usuario_id,
            nome: "Usuário",
            email: credentials.email
          };
        }
        
        const userData: UserData = {
          id: loginResponse.contexto_sessao.usuario_id,
          nome: userInfo.nome,
          email: userInfo.email,
          perfil_ativo: {
            id: loginResponse.contexto_sessao.perfil_ativo_id,
            nome: loginResponse.contexto_sessao.perfil_ativo_nome as "Administrador" | "Gestor" | "Fiscal"
          },
          perfis_disponiveis: (loginResponse.contexto_sessao.perfis_disponiveis || []).map(p => ({
            id: p.id,
            nome: p.nome as "Administrador" | "Gestor" | "Fiscal"
          }))
        };
        
        console.log('👤 UserData criado:', userData);
        
        setUser(userData);
        setContextoSessao(loginResponse.contexto_sessao);
        setPerfilAtivo(userData.perfil_ativo);
        setPerfisDisponiveis(userData.perfis_disponiveis);
        
        console.log('✅ Estados do AuthContext atualizados com sucesso');
      } else {
        console.error('❌ Resposta de login não contém contexto_sessao');
        throw new Error("Formato de resposta de login inválido - contexto_sessao ausente");
      }

    } catch (err: any) {
      console.error("❌ Erro no processo de login:", err);
      clearAuthState();
      // Propaga o erro para que a UI de login possa exibi-lo
      throw err;
    } finally {
      setLoading(false);
      console.log('🏁 Processo de login finalizado');
    }
  };

  // Função de logout que utiliza a apiLogout de api.ts
  const logout = async () => {
    // Limpa o estado do usuário imediatamente para evitar redirecionamentos
    clearAuthState();
    
    try {
      // apiLogout já lida com a chamada à API e a remoção do token
      await apiLogout();
    } catch (error) {
      console.error("Erro ao fazer logout na API:", error);
      // Mesmo com erro na API, mantém o logout local
    }
  };

  // Função para alternar perfil sem logout
  const alternarPerfil = async (novoPerfilId: number) => {
    console.log('🚀 Iniciando alternância de perfil para ID:', novoPerfilId);
    
    try {
      const payload: AlternarPerfilPayload = { novo_perfil_id: novoPerfilId };
      console.log('📡 Payload da alternância:', payload);
      
      const response = await apiAlternarPerfil(payload);
      console.log('✅ Resposta da alternância recebida:', response);
      
      // A resposta é um ContextoSessao completo
      setContextoSessao(response);
      
      // Cria novo perfil ativo baseado na resposta
      const novoPerfilAtivo = {
        id: response.perfil_ativo_id,
        nome: response.perfil_ativo_nome as "Administrador" | "Gestor" | "Fiscal"
      };
      
      setPerfilAtivo(novoPerfilAtivo);
      
      // Atualiza também no objeto user
      if (user) {
        const updatedUser = {
          ...user,
          perfil_ativo: novoPerfilAtivo
        };
        console.log('👤 User atualizado:', updatedUser);
        setUser(updatedUser);
      }
      
      console.log('✅ Perfil alternado com sucesso para:', novoPerfilAtivo.nome);
      toast.success(`Perfil alterado para ${novoPerfilAtivo.nome}`);
    } catch (error: any) {
      console.error("❌ Erro ao alternar perfil:", error);
      toast.error("Erro ao alternar perfil. Tente novamente.");
      throw error;
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user,
      contextoSessao,
      perfilAtivo,
      perfisDisponiveis,
      loading, 
      login, 
      logout,
      alternarPerfil,
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

