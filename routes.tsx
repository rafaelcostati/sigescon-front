import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/_layouts/app';
import { AuthLayout } from '@/_layouts/auth';

// Páginas
import Page from '@/dashboard/page';
import { ContratosDataTable } from '@/pages/contratos/Contratos';
import { NovoContrato } from '@/pages/contratos/NovoContrato';
import { EditarContrato } from '@/pages/contratos/EditarContrato';
import DetalhesContrato from '@/pages/contratos/DetalhesContrato';
import UserCard from '@/pages/usuarios/Usuario';
import { NovoUsuario } from '@/pages/usuarios/CadastrarUsuario';
import { NotFound } from '@/NotFound';
import { SignIn } from '@/pages/auth/SignIn';
import ProtectedRoute from '@/components/ProtectedRoute';
import Contratados from '@/pages/fornecedor/Contratado';
import Modalidades from '@/pages/modalidades/Modalidade';
import { FiscalDashboard } from '@/pages/fiscal/FiscalDashboard';
import { GestorDashboard } from '@/pages/gestor/GestorDashboard';
import Relatorios from '@/pages/relatorios/Relatorios';
import Fiscalizacao from '@/pages/fiscalizacao/Fiscalizacao';
import Pendencias from '@/pages/pendencias/Pendencias';

// Componente para dashboard dinâmico baseado no perfil
import DashboardRouter from '@/components/DashboardRouter';

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
        element: <ProtectedRoute><DashboardRouter /></ProtectedRoute>,
      },
      {
        path: '/dashboard',
        element: <ProtectedRoute><DashboardRouter /></ProtectedRoute>,
      },
      {
        path: '/dashboard/admin',
        element: <ProtectedRoute requiredProfiles={['Administrador']}><Page /></ProtectedRoute>,
      },
      {
        path: '/dashboard/gestor',
        element: <ProtectedRoute requiredProfiles={['Administrador', 'Gestor']}><GestorDashboard /></ProtectedRoute>,
      },
      {
        path: '/dashboard/fiscal',
        element: <ProtectedRoute requiredProfiles={['Administrador', 'Fiscal']}><FiscalDashboard /></ProtectedRoute>,
      },
      {
        path: '/contratos',
        element: <ProtectedRoute requiredProfiles={['Administrador', 'Gestor', 'Fiscal']}><ContratosDataTable /></ProtectedRoute>,
      },
      {
        path: '/novocontrato',
        element: <ProtectedRoute requiredProfiles={['Administrador', 'Gestor']}><NovoContrato /></ProtectedRoute>,
      },
      {
        path: '/contratos/editar/:id',
        element: <ProtectedRoute requiredProfiles={['Administrador', 'Gestor']}><EditarContrato /></ProtectedRoute>,
      },
      {
        path: '/contratos/:id',
        element: <ProtectedRoute requiredProfiles={['Administrador', 'Gestor', 'Fiscal']}><DetalhesContrato /></ProtectedRoute>,
      },
      {
        path: '/contratado',
        element: <ProtectedRoute requiredProfiles={['Administrador', 'Gestor', 'Fiscal']}><Contratados /></ProtectedRoute>,
      },
      {
        path: '/modalidades',
        element: <ProtectedRoute requiredProfiles={['Administrador', 'Gestor']}><Modalidades /></ProtectedRoute>,
      },
      {
        path: '/usuarios',
        element: <ProtectedRoute requiredProfiles={['Administrador']}><UserCard /></ProtectedRoute>,
      },
      {
        path: '/cadastrarusuario',
        element: <ProtectedRoute requiredProfiles={['Administrador']}><NovoUsuario /></ProtectedRoute>,
      },
      {
        path: '/pendencias',
        element: <ProtectedRoute requiredProfiles={['Administrador', 'Gestor', 'Fiscal']}><Pendencias /></ProtectedRoute>,
      },
      {
        path: '/fiscalizacao',
        element: <ProtectedRoute requiredProfiles={['Administrador', 'Fiscal']}><Fiscalizacao /></ProtectedRoute>,
      },
      {
        path: '/relatorios',
        element: <ProtectedRoute requiredProfiles={['Administrador', 'Gestor', 'Fiscal']}><Relatorios /></ProtectedRoute>,
      },
      {
        path: '/configuracoes',
        element: <ProtectedRoute requiredProfiles={['Administrador']}><div>Página de Configurações</div></ProtectedRoute>,
      },
    ],
  },
]);
