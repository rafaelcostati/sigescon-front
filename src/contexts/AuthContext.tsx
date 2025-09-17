import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi } from "@/lib/api";


type ContextoSessao = any; // ajuste conforme o retorno real da API

type AuthContextType = {
  user: ContextoSessao | null;
  loading: boolean;
  login: (username: string, password: string, perfil?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ContextoSessao | null>(null);
  const [loading, setLoading] = useState(true);

  // Inicializa contexto a partir do localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const token_type = localStorage.getItem("token_type");
    const contexto = localStorage.getItem("contexto");

    if (token && contexto) {
      authApi.defaults.headers.common["Authorization"] = `${token_type || "Bearer"} ${token}`;
      setUser(JSON.parse(contexto));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string, perfil?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("grant_type", "password");
      params.append("username", username);
      params.append("password", password);

      const query = perfil ? `?perfil_inicial_id=${perfil}` : "";

      const response = await authApi.post(`/auth/login${query}`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token, token_type } = response.data;
      if (!access_token) throw new Error("Token não recebido da API");

      authApi.defaults.headers.common["Authorization"] = `${token_type || "Bearer"} ${access_token}`;

      const contextoResponse = await authApi.get("/auth/contexto");

      localStorage.setItem("token", access_token);
      localStorage.setItem("token_type", token_type || "Bearer");
      localStorage.setItem("contexto", JSON.stringify(contextoResponse.data));

      setUser(contextoResponse.data);
    } catch (err: any) {
      logout();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("contexto");
    delete authApi.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
