import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook para gerenciar permissões baseadas no perfil do usuário
 */
export const usePermissions = () => {
  const { perfilAtivo } = useAuth();

  // Verifica se o usuário tem um perfil específico
  const hasProfile = (profileName: string) => {
    return perfilAtivo?.nome === profileName;
  };

  // Verifica se o usuário tem um dos perfis especificados
  const hasAnyProfile = (profileNames: string[]) => {
    return perfilAtivo ? profileNames.includes(perfilAtivo.nome) : false;
  };

  // Permissões específicas por funcionalidade
  const permissions = {
    // Gestão de usuários
    canCreateUser: () => hasProfile("Administrador"),
    canEditUser: () => hasProfile("Administrador"),
    canDeleteUser: () => hasProfile("Administrador"),
    canViewUsers: () => hasProfile("Administrador"),

    // Gestão de contratos
    canCreateContract: () => hasAnyProfile(["Administrador", "Gestor"]),
    canEditContract: () => hasAnyProfile(["Administrador", "Gestor"]),
    canDeleteContract: () => hasProfile("Administrador"),
    canViewContracts: () => hasAnyProfile(["Administrador", "Gestor", "Fiscal"]),

    // Gestão de modalidades
    canCreateModality: () => hasProfile("Administrador"),
    canEditModality: () => hasProfile("Administrador"),
    canDeleteModality: () => hasProfile("Administrador"),
    canViewModalities: () => hasAnyProfile(["Administrador", "Gestor"]),

    // Gestão de contratados
    canCreateContractor: () => hasAnyProfile(["Administrador", "Gestor"]),
    canEditContractor: () => hasAnyProfile(["Administrador", "Gestor"]),
    canDeleteContractor: () => hasProfile("Administrador"),
    canViewContractors: () => hasAnyProfile(["Administrador", "Gestor", "Fiscal"]),

    // Gestão de pendências
    canCreatePendency: () => hasAnyProfile(["Administrador", "Gestor", "Fiscal"]),
    canEditPendency: () => hasAnyProfile(["Administrador", "Gestor", "Fiscal"]),
    canDeletePendency: () => hasAnyProfile(["Administrador", "Gestor"]),
    canViewPendencies: () => hasAnyProfile(["Administrador", "Gestor", "Fiscal"]),

    // Fiscalização
    canSubmitReports: () => hasAnyProfile(["Administrador", "Fiscal"]),
    canViewFiscalization: () => hasAnyProfile(["Administrador", "Fiscal"]),
    canApproveFiscalization: () => hasAnyProfile(["Administrador", "Gestor"]),

    // Relatórios
    canViewReports: () => hasAnyProfile(["Administrador", "Gestor", "Fiscal"]),
    canExportReports: () => hasAnyProfile(["Administrador", "Gestor"]),
    canViewAdvancedReports: () => hasProfile("Administrador"),

    // Configurações do sistema
    canAccessSettings: () => hasProfile("Administrador"),
    canManageProfiles: () => hasProfile("Administrador"),
    canViewSystemLogs: () => hasProfile("Administrador"),
  };

  return {
    perfilAtivo,
    hasProfile,
    hasAnyProfile,
    ...permissions,
  };
};

export default usePermissions;
