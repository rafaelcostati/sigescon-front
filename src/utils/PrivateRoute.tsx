import React from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';


interface PrivateRouteProps {
  children: ReactNode;
  allowedProfiles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedProfiles }) => {
  const token = localStorage.getItem('token');
  const userProfile = (() => {
    try {
      return JSON.parse(localStorage.getItem('userProfile') || 'null') as string | null;
    } catch (error) {
      console.error('Erro ao analisar o perfil do usuário:', error);
      return null;
    }
  })();

  if (!token || userProfile === null) {
    return <Navigate to="/" replace />;
  }

  if (allowedProfiles && !allowedProfiles.includes(userProfile)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
