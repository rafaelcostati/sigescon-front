/**
 * Utility function to redirect users to their respective dashboard based on profile
 * Uses the existing route structure with profile-specific dashboard routes
 * @param profileName - The name of the profile
 * @param navigate - React Router's navigate function
 */
export const redirectToProfileDashboard = (
  profileName: "Administrador" | "Gestor" | "Fiscal" | string,
  navigate: (path: string) => void
) => {
  console.log(`🔄 Redirecionando para dashboard do perfil: ${profileName}`);

  switch (profileName) {
    case "Administrador":
      navigate("/dashboard/admin");
      break;
    case "Gestor":
      navigate("/dashboard/gestor");
      break;
    case "Fiscal":
      navigate("/dashboard/fiscal");
      break;
    default:
      console.warn(`⚠️ Perfil não reconhecido: ${profileName}, redirecionando para dashboard dinâmico`);
      navigate("/dashboard");
      break;
  }
};

/**
 * Get the dashboard path for a given profile without navigating
 * @param profileName - The name of the profile
 * @returns The dashboard path for the profile
 */
export const getProfileDashboardPath = (
  profileName: "Administrador" | "Gestor" | "Fiscal" | string
): string => {
  switch (profileName) {
    case "Administrador":
      return "/dashboard/admin";
    case "Gestor":
      return "/dashboard/gestor";
    case "Fiscal":
      return "/dashboard/fiscal";
    default:
      return "/dashboard";
  }
};