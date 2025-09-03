import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '@/_layouts/app'
// Páginas
import Page from '@/dashboard/page' // Dashboard
import { ContratosDataTable } from '@/pages/contratos/Contratos'

// Crie stubs temporários (até você implementar as páginas reais)
const FornecedoresPage = () => <div>📦 Página de Fornecedores</div>
const ProcessosPage = () => <div>⚖️ Página de Processos</div>
const UsuariosPage = () => <div>👤 Página de Usuários</div>

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true, // rota inicial: "/"
        element: <Page />, // Dashboard
      },
      {
        path: '/dashboard',
        element: <Page />, // Também acessível em "/dashboard"
      },
      {
        path: '/contratos',
        element: <ContratosDataTable />,
      },
      {
        path: '/fornecedores',
        element: <FornecedoresPage />,
      },
      {
        path: '/processos',
        element: <ProcessosPage />,
      },
      {
        path: '/usuarios',
        element: <UsuariosPage />,
      },
    ],
  },
])
