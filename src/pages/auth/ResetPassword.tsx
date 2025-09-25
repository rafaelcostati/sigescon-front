import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { validateResetToken, resetPassword } from "@/lib/api";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Ícones e Logo
import { LockKeyhole, AlertCircle, CheckCircle } from "lucide-react";
import logo from "@/assets/logo.svg";

// Schema para o formulário de reset de senha
const resetPasswordSchema = z.object({
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme sua senha"),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  }
);

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [tokenStatus, setTokenStatus] = useState<"validating" | "valid" | "invalid" | "expired">("validating");
  const [userEmail, setUserEmail] = useState<string>("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Validar token ao carregar a página
  useEffect(() => {
    if (!token) {
      setTokenStatus("invalid");
      return;
    }

    const validateToken = async () => {
      try {
        const response = await validateResetToken({ token });
        if (response.valid) {
          setTokenStatus("valid");
          setUserEmail(response.user_email || "");
        } else {
          setTokenStatus("expired");
        }
      } catch (err: any) {
        console.error("Erro ao validar token:", err);
        setTokenStatus("invalid");
      }
    };

    validateToken();
  }, [token]);

  // Função para processar o reset de senha
  const onSubmit = async ({ password }: ResetPasswordForm) => {
    if (!token) return;

    setError("");
    try {
      const response = await resetPassword({
        token,
        new_password: password,
      });

      if (response.success) {
        setResetSuccess(true);
        toast.success("Senha alterada com sucesso! Você pode fazer login agora.");
        setTimeout(() => navigate("/login"), 3000);
      }
    } catch (err: any) {
      console.error("Erro ao resetar senha:", err);
      setError(err.message || "Erro ao resetar senha. Tente novamente.");
    }
  };

  // Tela de loading
  if (tokenStatus === "validating") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="w-full max-w-md p-8">
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
              <img
                src={logo}
                alt="Logo PGE-PA"
                className="relative mx-auto h-16 w-16 drop-shadow-lg"
              />
            </div>
            <div className="space-y-3">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-spin mx-auto"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-xl font-semibold text-gray-700 animate-pulse">Validando token</p>
              <p className="text-sm text-gray-500">Aguarde um momento...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tela de token inválido ou expirado
  if (tokenStatus === "invalid" || tokenStatus === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="w-full max-w-md p-8">
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <img
                src={logo}
                alt="Logo PGE-PA"
                className="mx-auto h-16 w-16 drop-shadow-lg"
              />
            </div>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {tokenStatus === "invalid" ? "Link Inválido" : "Link Expirado"}
              </h1>
              <p className="text-gray-600">
                {tokenStatus === "invalid"
                  ? "O link de reset de senha é inválido ou malformado."
                  : "Este link de reset de senha expirou. Solicite um novo link."
                }
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/login")}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Voltar ao Login
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="w-full"
              >
                Solicitar Novo Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tela de sucesso
  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="w-full max-w-md p-8">
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <img
                src={logo}
                alt="Logo PGE-PA"
                className="mx-auto h-16 w-16 drop-shadow-lg"
              />
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-green-800">
                Senha Alterada!
              </h1>
              <p className="text-gray-600">
                Sua senha foi alterada com sucesso. Você será redirecionado para a página de login.
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/login")}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Fazer Login Agora
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulário de reset de senha
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
              <img
                src={logo}
                alt="Logo PGE-PA"
                className="relative mx-auto h-16 w-16 drop-shadow-lg"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Nova Senha
              </h1>
              <p className="text-sm text-gray-600">
                {userEmail && `Para: ${userEmail}`}
              </p>
              <p className="text-sm text-gray-500">
                Crie uma senha segura para sua conta
              </p>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo Nova Senha */}
            <div className="group">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700 mb-2 block">
                Nova Senha
              </Label>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-12 h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-gray-50/50 hover:bg-white"
                  {...register("password")}
                  disabled={isSubmitting}
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center animate-slideIn">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Campo Confirmar Senha */}
            <div className="group">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 mb-2 block">
                Confirmar Nova Senha
              </Label>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-12 h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-gray-50/50 hover:bg-white"
                  {...register("confirmPassword")}
                  disabled={isSubmitting}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center animate-slideIn">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Exibição de erro */}
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50/50 animate-slideIn">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700 font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Botões */}
            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="w-5 h-5 border-2 border-white/30 rounded-full animate-spin"></div>
                      <div className="absolute top-0 left-0 w-5 h-5 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
                    </div>
                    <span className="ml-3">Alterando Senha...</span>
                  </div>
                ) : (
                  "Alterar Senha"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/login")}
                className="w-full h-12 border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-colors"
                disabled={isSubmitting}
              >
                Voltar ao Login
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Sistema de Gestão de Contratos - SIGESCON
          </p>
        </div>
      </div>

      {/* Animações customizadas */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-slideIn { animation: slideIn 0.3s ease-out; }
        `
      }} />
    </div>
  );
}