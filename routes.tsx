import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/_layouts/app';
import { AuthLayout } from '@/_layouts/auth';

// Páginas
import Page from '@/dashboard/page';
import { ContratosDataTable } from '@/pages/contratos/Contratos';
import { NovoContrato } from '@/pages/contratos/NovoContrato';
import  UserCard   from '@/pages/usuarios/Usuario';
import { NovoUsuario } from '@/pages/usuarios/CadastrarUsuario';
import { NotFound } from '@/NotFound';
import { SignIn } from '@/pages/auth/SignIn';
import PrivateRoute from '@/utils/PrivateRoute';
import Contratados from '@/pages/fornecedor/Contratado';
import Modalidades from '@/pages/modalidades/Modalidade';
import { EditarContrato }  from '@/pages/contratos/EditarContrato';


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
        element: <PrivateRoute><Page /></PrivateRoute>, // Removido allowedProfiles
      },     
      
      {
        path: '/contratos',
        element: <PrivateRoute><ContratosDataTable /></PrivateRoute>, // Removido allowedProfiles
      },
      {
        path: '/novocontrato',
        element: <PrivateRoute><NovoContrato /></PrivateRoute>, // Removido allowedProfiles
      },
      {
        path: '/contratos/editar/:id',
        element: <PrivateRoute><EditarContrato /></PrivateRoute>, // Removido allowedProfiles
      },
      {
        path: '/contratado',
        element: <PrivateRoute><Contratados /></PrivateRoute>, // Removido allowedProfiles
      },
      {
        path: '/modalidades',
        element: <PrivateRoute><Modalidades /></PrivateRoute>, // Removido allowedProfiles
      },
      {
        path: '/cadastrarusuario',
        element: <PrivateRoute><NovoUsuario /></PrivateRoute>, // Removido allowedProfiles
      },
      {
        path: '/usuarios',
        element: <PrivateRoute><UserCard /></PrivateRoute>, // Removido allowedProfiles
      },
      {
        path: '/dashboard',
        element: <PrivateRoute><Page /></PrivateRoute>, // Removido allowedProfiles
      },
    ],
  },
]);