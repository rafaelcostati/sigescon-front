import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/axios";
import logo from "@/assets/logo.svg";
import { LockKeyhole, LucideUser } from "lucide-react";

const signInFormSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

type SignInForm = z.infer<typeof signInFormSchema>;

export function SignIn() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInFormSchema),
  });

  const handleLogin = async (form: SignInForm) => {
    try {
      const response = await api.post("/auth/login", {
        email: form.email,
        senha: form.senha,
      });
      const { token, perfil } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userProfile", JSON.stringify(perfil));

      // ... (lógica de redirecionamento continua a mesma)
      switch (perfil) {
        case "Administrador":
          navigate("/home", { replace: true });
          break;
        case "Gestor":
          navigate("/homegestor", { replace: true });
          break;
        case "Fiscal":
          navigate("/homefiscal", { replace: true });
          break;        
        default:
          navigate("/", { replace: true });
          break;
      }
    } catch (err) {
      console.error("Erro na autenticação:", err);
      setError(
        "Credenciais inválidas. Por favor, verifique seu e-mail e senha."
      );
    }
  };

  return (
    /* Card com efeito de vidro e cores ajustadas */
    <div className="space-y-6 rounded-2xl border border-slate-700 bg-slate-950/60 p-8 backdrop-blur-md">
      {/* Cabeçalho do card */}
      <div className=" -mx-8 -mt-8 mb-6 rounded-t-xl bg-teal-700/80 py-3 text-center">
        <h1 className="text-lg font-semibold tracking-wide text-slate-50">
          LOGIN
        </h1>
      </div>

      {/* Logo e título */}
      <div className="flex flex-col items-center gap-2 text-center">
        <img className="h-16 w-16" src={logo} alt="Logo" />
        <p className="text-sm text-slate-300">
          SIGESCON - Sistema de Gestão de Contratos
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-300">
            E-mail
          </Label>
          <div className="relative">
            <LucideUser className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-teal-400" />
            <Input
              id="email"
              className="border-b-2 border-teal-500 bg-transparent pl-10 text-slate-100 placeholder:text-slate-400 focus:border-teal-400 focus-visible:ring-0"
              placeholder="seu@email.com"
              type="email"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="senha" className="text-slate-300">
            Senha
          </Label>
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-teal-400" />
            <Input
              id="senha"
              className="border-b-2 border-teal-500 bg-transparent pl-10 text-slate-100 placeholder:text-slate-400 focus:border-teal-400 focus-visible:ring-0"
              placeholder="Sua senha"
              type="password"
              {...register("senha")}
            />
          </div>
          {errors.senha && (
            <p className="text-sm text-red-400">{errors.senha.message}</p>
          )}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        

        <Button
          disabled={isSubmitting}
          className="w-full rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 font-semibold text-white shadow-md hover:from-teal-700 hover:to-teal-800"
          type="submit"
        >
          Entrar
        </Button>
      </form>
    </div>
  );
}