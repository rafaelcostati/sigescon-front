import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '@/_layouts/app'
import { AuthLayout } from '@/_layouts/auth'

// Páginas
import Page from '@/dashboard/page'
import { ContratosDataTable } from '@/pages/contratos/Contratos'
import NovoContrato from '@/pages/contratos/NovoContrato'
import UserCard from '@/pages/usuarios/usuarios'
import { NovoUsuario } from '@/pages/usuarios/NovoUsuario'
import { NotFound } from '@/NotFound'
import { SignIn } from '@/pages/auth/SignIn'

// Stubs temporários
const FornecedoresPage = () => <div>📦 Página de Fornecedores</div>
const ProcessosPage = () => <div>⚖️ Página de Processos</div>

export const router = createBrowserRouter([
  {
    path: '/', // rota inicial → auth
    element: <AuthLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true, // quando acessar "/" → login
        element: <SignIn />,
      },
      {
        path: 'login',
        element: <SignIn />,
      },
    ],
  },
  {
    path: '/', // rotas da aplicação
    element: <AppLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: 'dashboard',
        element: <Page />,
      },
      {
        path: 'contratos',
        element: <ContratosDataTable />,
      },
      {
        path: 'novocontrato',
        element: <NovoContrato />,
      },
      {
        path: 'fornecedores',
        element: <FornecedoresPage />,
      },
      {
        path: 'processos',
        element: <ProcessosPage />,
      },
      {
        path: 'cadastrarusuario',
        element: <NovoUsuario />,
      },
      {
        path: 'usuarios',
        element: <UserCard />,
      },
    ],
  },
])
