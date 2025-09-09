import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/_layouts/app';
import { AuthLayout } from '@/_layouts/auth';

// Páginas
import Page from '@/dashboard/page';
import { ContratosDataTable } from '@/pages/contratos/Contratos';
import NovoContrato from '@/pages/contratos/NovoContrato';
import UserCard from '@/pages/usuarios/usuarios';
import { NovoUsuario } from '@/pages/usuarios/NovoUsuario';
import { NotFound } from '@/NotFound';
import { SignIn } from '@/pages/auth/SignIn';
import PrivateRoute from '@/utils/PrivateRoute';

// Stubs temporários
const FornecedoresPage = () => <div>📦 Página de Fornecedores</div>;
const ProcessosPage = () => <div>⚖️ Página de Processos</div>;

export const router = createBrowserRouter([
  // Grupo 1: Rotas de Autenticação (públicas)
  {
    // Não há 'path' aqui, pois este é um agrupamento de layout
    element: <AuthLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/', // A rota raiz agora aponta para o SignIn
        element: <SignIn />,
      },
      {
        path: '/login', // Mantém /login como uma rota alternativa para SignIn, se desejar
        element: <SignIn />,
      },
    ],
  },
  // Grupo 2: Rotas do Aplicativo (protegidas pelo PrivateRoute)
  {
    // Não há 'path' aqui, pois este é um agrupamento de layout
    element: <AppLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/home', // Rota principal para Administrador
        element: <PrivateRoute allowedProfiles={['Administrador']}><Page /></PrivateRoute>,
      },
      {
        path: '/homegestor', // Rota para Gestor
        element: <PrivateRoute allowedProfiles={['Gestor']}><Page /></PrivateRoute>, // Assumindo que Gestor também usa a Page
      },
      {
        path: '/homefiscal', // Rota para Fiscal
        element: <PrivateRoute allowedProfiles={['Fiscal']}><Page /></PrivateRoute>, // Assumindo que Fiscal também usa a Page
      },
      {
        path: '/contratos',
        element: <PrivateRoute allowedProfiles={['Administrador']}><ContratosDataTable /></PrivateRoute>,
      },
      {
        path: '/novocontrato',
        element: <PrivateRoute allowedProfiles={['Administrador', 'Gestor']}><NovoContrato /></PrivateRoute>, // Exemplo: Nova rota para Gestor também
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
    ],
  },
]);