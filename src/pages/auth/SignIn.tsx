import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Ícones
import { LockKeyhole, LucideUser } from "lucide-react";
import logo from "@/assets/logo.svg";

const signInFormSchema = z.object({
  username: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
  profile: z.string().optional(),
});

type SignInForm = z.infer<typeof signInFormSchema>;

// Perfis fixos (IDs conhecidos)
const perfisFixos = [
  { id: "1", nome: "Administrador" },
  { id: "2", nome: "Gestor" },
  { id: "3", nome: "Fiscal" },
];

export function SignIn() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInFormSchema),
  });

  // Redireciona automaticamente se já estiver logado
  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async ({ username, password, profile }: SignInForm) => {
    setError("");
    try {
      await login(username, password, profile);
      navigate("/home", { replace: true });
    } catch (err: any) {
      console.error("Erro no login:", err);
      setError(
        err.response?.status === 401
          ? "Usuário ou senha inválidos"
          : "Erro na autenticação. Tente novamente."
      );
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md">
      {/* Logo e título */}
      <div className="text-center mb-6">
        <img src={logo} alt="Logo" className="mx-auto h-12 w-12" />
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">Login</h1>
        <p className="text-sm text-gray-600">
          Faça login no sistema <span className="font-medium">SIGESCON</span>
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Email</Label>
          <div className="relative">
            <LucideUser className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              id="username"
              type="email"
              placeholder="seuemail@exemplo.com"
              className="pl-10"
              {...register("username")}
            />
          </div>
          {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              {...register("password")}
            />
          </div>
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Perfil inicial (opcional)</Label>
          <Select onValueChange={(val) => setValue("profile", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um perfil (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {perfisFixos.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
