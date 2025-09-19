import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import { FiscalDashboard } from "@/pages/fiscal/FiscalDashboard";
import { GestorDashboard } from "@/pages/gestor/GestorDashboard";

/**
 * Componente que renderiza o dashboard apropriado baseado no perfil ativo do usuário
 */
export default function DashboardRouter() {
  const { perfilAtivo } = useAuth();

  if (!perfilAtivo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Renderiza dashboard baseado no perfil ativo
  switch (perfilAtivo?.nome) {
    case "Administrador":
      return <AdminDashboard />;
    case "Gestor":
      return <GestorDashboard />;
    case "Fiscal":
      return <FiscalDashboard />;
    default:
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Perfil não reconhecido: {perfilAtivo?.nome || 'Nenhum'}
          </p>
        </div>
      );
  }
}
