import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "@/lib/api";
import logo from "@/assets/logo.svg";
import { LockKeyhole, LucideUser } from "lucide-react";
import axios from 'axios';

const signInFormSchema = z.object({
    username: z.string().email("E-mail inválido"),
    password: z.string().min(1, "Senha é obrigatória"),
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

    const handleLogin = async ({ username, password }: SignInForm) => {
        try {
            setError(""); // Limpar erro anterior
            
            console.log("Iniciando processo de login...");
            
            // 1. Fazer login e obter token
            const params = new URLSearchParams();
            params.append('grant_type', 'password');
            params.append('username', username);
            params.append('password', password);

            const response = await authApi.post("/auth/login", params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const { access_token, token_type } = response.data;

            if (!access_token) {
                throw new Error("Token não recebido da API");
            }

            console.log("Token recebido com sucesso");

            // 2. Configurar o header de autorização
            authApi.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            // 3. Buscar dados do usuário
            console.log("Buscando dados do usuário...");
            const userResponse = await authApi.get("/api/v1/usuarios/me");
            const userData = userResponse.data;
            
            console.log("Dados do usuário:", userData);

            // 4. Salvar informações no localStorage
            localStorage.setItem("token", access_token);
            localStorage.setItem("token_type", token_type || "Bearer");
            localStorage.setItem("user", JSON.stringify(userData));

            console.log("Informações salvas no localStorage:");
            console.log("- Token:", access_token.substring(0, 20) + "...");
            console.log("- Usuário:", userData.nome);

            console.log("Login completo! Redirecionando para /home...");

            // 5. Redirecionar para home
            navigate("/home", { replace: true });

        } catch (err) {
            console.error("Erro na autenticação:", err);
            
            // Limpar dados em caso de erro
            localStorage.removeItem("token");
            localStorage.removeItem("token_type");
            localStorage.removeItem("user");
            delete authApi.defaults.headers.common['Authorization'];
            
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    console.error("Detalhes do erro da API:", err.response.data);
                    
                    switch (err.response.status) {
                        case 401:
                            setError("Credenciais inválidas. Verifique seu e-mail e senha.");
                            break;
                        case 422:
                            setError("Dados de login inválidos. Verifique os campos.");
                            break;
                        case 500:
                            setError("Erro interno do servidor. Tente novamente mais tarde.");
                            break;
                        default:
                            setError("Erro na autenticação. Tente novamente.");
                    }
                } else if (err.request) {
                    setError("Erro de conexão. Verifique sua internet e tente novamente.");
                } else {
                    setError("Erro inesperado. Tente novamente.");
                }
            } else {
                setError("Ocorreu um erro inesperado. Tente novamente mais tarde.");
            }
        }
    };

    return (
        <div className="space-y-6 rounded-2xl border border-slate-700 bg-slate-950/60 p-8 backdrop-blur-md">
            <div className=" -mx-8 -mt-8 mb-6 rounded-t-xl bg-teal-700/80 py-3 text-center">
                <h1 className="text-lg font-semibold tracking-wide text-slate-50">
                    LOGIN
                </h1>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
                <img className="h-16 w-16" src={logo} alt="Logo" />
                <p className="text-sm text-slate-300">
                    SIGESCON - Sistema de Gestão de Contratos
                </p>
            </div>
            
            <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-300">
                        E-mail
                    </Label>
                    <div className="relative">
                        <LucideUser className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-teal-400" />
                        <Input
                            id="username"
                            className="border-b-2 border-teal-500 bg-transparent pl-10 text-slate-100 placeholder:text-slate-400 focus:border-teal-400 focus-visible:ring-0"
                            placeholder="seu@email.com"
                            type="email"
                            {...register("username")} 
                        />
                    </div>
                    {errors.username && (
                        <p className="text-sm text-red-400">{errors.username.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">
                        Senha
                    </Label>
                    <div className="relative">
                        <LockKeyhole className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-teal-400" />
                        <Input
                            id="password"
                            className="border-b-2 border-teal-500 bg-transparent pl-10 text-slate-100 placeholder:text-slate-400 focus:border-teal-400 focus-visible:ring-0"
                            placeholder="Sua senha"
                            type="password"
                            {...register("password")}
                        />
                    </div>
                    {errors.password && (
                        <p className="text-sm text-red-400">{errors.password.message}</p>
                    )}
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 font-semibold text-white shadow-md hover:from-teal-700 hover:to-teal-800"
                    type="submit"
                >
                    {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>
            </form>
        </div>
    );
}