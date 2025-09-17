import { Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

interface PrivateRouteProps {
  children: React.ReactNode;
}

// Usamos React.memo para evitar que o componente execute a lógica novamente
// se ele for re-renderizado por um componente pai sem que suas props mudem.
const PrivateRoute: React.FC<PrivateRouteProps> = React.memo(({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          // Não há necessidade de log aqui, o redirecionamento é suficiente
          setIsAuthenticated(false);
          return;
        }

        // Configura o header de autorização para a chamada de verificação
        authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Valida o token buscando os dados do usuário
        // Usar '/usuarios/me' é uma ótima prática de validação
        await authApi.get('/api/v1/usuarios/me');
        
        // Se a chamada acima for bem-sucedida, o token é válido
        setIsAuthenticated(true);

      } catch (error: any) {
        console.error('Falha na validação do token:', error.response?.data?.detail || error.message);
        toast.error("Sessão inválida ou expirada", {
          description: "Por favor, faça o login novamente.",
        });
        
        // Limpa qualquer dado de autenticação inválido
        localStorage.removeItem('token');
        delete authApi.defaults.headers.common['Authorization'];
        
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
    // O array de dependências vazio [] garante que esta verificação rode apenas uma vez,
    // quando o componente é montado.
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-3 text-gray-700">Verificando acesso...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redireciona para a página de login se a autenticação falhar
    return <Navigate to="/login" replace />;
  }

  // Se a autenticação for bem-sucedida, renderiza o conteúdo protegido
  return <>{children}</>;
});

export default PrivateRoute;