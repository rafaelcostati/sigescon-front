import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/_layouts/app';
import { AuthLayout } from '@/_layouts/auth';

// Páginas
import Page from '@/dashboard/page';
import { ContratosDataTable } from '@/pages/contratos/Contratos';
import NovoContrato from '@/pages/contratos/NovoContrato';
import  UserCard   from '@/pages/usuarios/usuarios';
import { NovoUsuario } from '@/pages/usuarios/NovoUsuario';
import { NotFound } from '@/NotFound';
import { SignIn } from '@/pages/auth/SignIn';
import PrivateRoute from '@/utils/PrivateRoute';

// Stubs temporários
const FornecedoresPage = () => <div>📦 Página de Fornecedores</div>;
const ProcessosPage = () => <div>⚖️ Página de Processos</div>;

export const router = createBrowserRouter([

  {
    
    element: <AuthLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/', 
        element: <SignIn />,
      },
      {
        path: '/login', 
        element: <SignIn />,
      },
    ],
  },
  
  {
    element: <AppLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/home',
        element: <PrivateRoute allowedProfiles={['Administrador']}><Page /></PrivateRoute>,
      },     
      
      {
        path: '/contratos',
        element: <PrivateRoute allowedProfiles={['Administrador']}><ContratosDataTable /></PrivateRoute>,
      },
      {
        path: '/novocontrato',
        element: <PrivateRoute allowedProfiles={['Administrador']}><NovoContrato /></PrivateRoute>,
      },
      {
        path: '/fornecedores',
        element: <PrivateRoute allowedProfiles={['Administrador']}><FornecedoresPage /></PrivateRoute>,
      },
      {
        path: '/processos',
        element: <PrivateRoute allowedProfiles={['Administrador']}><ProcessosPage /></PrivateRoute>,
      },
      {
        path: '/cadastrarusuario',
        element: <PrivateRoute allowedProfiles={['Administrador']}><NovoUsuario /></PrivateRoute>,
      },
      {
        path: '/usuarios',
        element: <PrivateRoute allowedProfiles={['Administrador']}><UserCard /></PrivateRoute>,
      },
      {
        path: '/dashboard',
        element: <PrivateRoute allowedProfiles={['Administrador']}><Page /></PrivateRoute>,
      },
    ],
  },
]);