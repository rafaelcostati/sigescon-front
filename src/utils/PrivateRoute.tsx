import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('Token não encontrado');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Configurar o header de autorização
        authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Tentar buscar dados do usuário atual para validar o token
        const response = await authApi.get('/api/v1/usuarios/me');
        const userData = response.data;
        
        console.log('Usuário autenticado:', userData.nome);
        
        setIsAuthenticated(true);

      } catch (error) {
        console.error('Erro na autenticação:', error);
        
        // Limpar dados de autenticação inválidos
        localStorage.removeItem('token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('user');
        delete authApi.defaults.headers.common['Authorization'];
        
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-2 text-slate-600">Verificando autenticação...</span>
      </div>
    );
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated) {
    console.log('Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  console.log('Acesso autorizado');
  return <>{children}</>;
}