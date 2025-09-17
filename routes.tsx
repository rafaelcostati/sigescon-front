import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/_layouts/app';
import { AuthLayout } from '@/_layouts/auth';

// Páginas
import Page from '@/dashboard/page';
import { ContratosDataTable } from '@/pages/contratos/Contratos';
import { NovoContrato } from '@/pages/contratos/NovoContrato';
import { EditarContrato } from '@/pages/contratos/EditarContrato';
import UserCard from '@/pages/usuarios/Usuario';
import { NovoUsuario } from '@/pages/usuarios/CadastrarUsuario';
import { NotFound } from '@/NotFound';
import { SignIn } from '@/pages/auth/SignIn';
import PrivateRoute from '@/utils/PrivateRoute';
import Contratados from '@/pages/fornecedor/Contratado';
import Modalidades from '@/pages/modalidades/Modalidade';

export const router = createBrowserRouter([
  // Rotas públicas
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

  // Rotas privadas
  {
    element: <AppLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/home',
        element: <PrivateRoute><Page /></PrivateRoute>,
      },
      {
        path: '/dashboard',
        element: <PrivateRoute><Page /></PrivateRoute>,
      },
      {
        path: '/contratos',
        element: <PrivateRoute><ContratosDataTable /></PrivateRoute>,
      },
      {
        path: '/novocontrato',
        element: <PrivateRoute><NovoContrato /></PrivateRoute>,
      },
      {
        path: '/contratos/editar/:id',
        element: <PrivateRoute><EditarContrato /></PrivateRoute>,
      },
      {
        path: '/contratado',
        element: <PrivateRoute><Contratados /></PrivateRoute>,
      },
      {
        path: '/modalidades',
        element: <PrivateRoute><Modalidades /></PrivateRoute>,
      },
      {
        path: '/usuarios',
        element: <PrivateRoute><UserCard /></PrivateRoute>,
      },
      {
        path: '/cadastrarusuario',
        element: <PrivateRoute><NovoUsuario /></PrivateRoute>,
      },
    ],
  },
]);
