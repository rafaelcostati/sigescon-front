import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Ícones e Logo
import { LockKeyhole, User, AlertCircle } from "lucide-react";
import logo from "@/assets/logo.svg";

// Schema simplificado, sem o campo de perfil
const signInFormSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type SignInForm = z.infer<typeof signInFormSchema>;

export function SignIn() {
  const navigate = useNavigate();
  const { user, login, loading: authLoading } = useAuth(); // 'login' aqui é do seu AuthContext
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInFormSchema),
  });

  // Redireciona se o usuário já estiver logado
  useEffect(() => {
    if (!authLoading && user && user.usuario_id) {
      console.log("Usuário autenticado detectado, redirecionando para /home");
      navigate("/home", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Função para lidar com o submit do formulário, agora sem o perfil
  const onSubmit = async ({ email, password }: SignInForm) => {
    setError("");
    try {
      // Chama a função 'login' do seu AuthContext com apenas email e senha
      await login(email, password);
      // O redirecionamento ocorre no useEffect acima
    } catch (err: any)      {
      console.error("Erro no login:", err);
      setError(err.message || "E-mail ou senha inválidos. Tente novamente.");
    }
  };

  // Tela de loading inicial
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-700">Verificando autenticação...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-6">
            <img src={logo} alt="Logo" className="mx-auto h-12 w-12" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Login</h2>
            <p className="mt-2 text-sm text-gray-600"><span className="font-medium">Sistema de Gestão de Contratos</span></p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  className="pl-10"
                  {...register("email")}
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            {/* Campo Senha */}
            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="mt-1 relative">
                <LockKeyhole className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  {...register("password")}
                  disabled={isSubmitting}
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {/* Exibição de erro */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Botão de submit */}
            <div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

