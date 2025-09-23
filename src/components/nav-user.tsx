"use client"

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  IconDotsVertical,
  IconLogout,
  IconKey,
  IconUserCheck,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getUserProfile,
  changeUserPassword,
  getCurrentUserId,
  type UserProfile,
  type ChangePasswordPayload
} from "@/lib/api"

export function NavUser() {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const { logout: authLogout, user, perfilAtivo, perfisDisponiveis, alternarPerfil } = useAuth();
  
  // Estados
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isChangingProfile, setIsChangingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    senha_antiga: "",
    nova_senha: "",
    confirmar_senha: ""
  });

  // Carrega o perfil do usuário
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Se temos dados do user do AuthContext, usa eles
        if (user) {
          const profile: UserProfile = {
            id: user.id,
            nome: user.nome,
            email: user.email,
            matricula: "", // Pode ser buscado de outro endpoint se necessário
            ativo: true,
            perfis: perfisDisponiveis.map(p => p.nome),
            perfil_ids: perfisDisponiveis.map(p => p.id),
            perfis_texto: perfisDisponiveis.map(p => p.nome).join(", ")
          };
          setUserProfile(profile);
          setIsLoading(false);
          return;
        }

        const userId = getCurrentUserId();
        if (!userId) {
          toast.error("Sessão inválida. Faça login novamente.");
          navigate("/login");
          return;
        }

        const profile = await getUserProfile(userId);
        setUserProfile(profile);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        toast.error("Erro ao carregar dados do usuário");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [navigate, user, perfisDisponiveis]);

  // Função para fazer logout
  const handleLogout = async () => {
    try {
      await authLogout();
      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    } catch (error) {
      console.error("Erro no logout:", error);
      // Mesmo com erro, redireciona para login
      navigate("/login");
    }
  };

  // Função para alternar perfil
  const handleProfileChange = async (novoPerfilId: string) => {
    if (isChangingProfile) return;
    
    const perfilId = parseInt(novoPerfilId, 10);
    if (perfilId === perfilAtivo?.id) return;

    setIsChangingProfile(true);
    try {
      await alternarPerfil(perfilId);
      // O toast já é mostrado no AuthContext
    } catch (error) {
      console.error("Erro ao alternar perfil:", error);
    } finally {
      setIsChangingProfile(false);
    }
  };

  // Função para obter cor do perfil
  const getProfileColor = (perfil: string) => {
    switch (perfil) {
      case "Administrador":
        return "bg-red-100 text-red-800";
      case "Gestor":
        return "bg-blue-100 text-blue-800";
      case "Fiscal":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Função para obter ícone do perfil
  const getProfileIcon = () => {
    // Retorna o mesmo ícone para todos por enquanto
    return <IconUserCheck size={12} />;
  };

  // Função para alterar senha
  const handleChangePassword = async () => {
    if (passwordForm.nova_senha !== passwordForm.confirmar_senha) {
      toast.error("A nova senha e a confirmação não coincidem");
      return;
    }

    if (passwordForm.nova_senha.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsChangingPassword(true);
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        toast.error("Sessão inválida");
        return;
      }

      console.log("Tentando alterar senha para usuário ID:", userId);
      
      const payload: ChangePasswordPayload = {
        senha_antiga: passwordForm.senha_antiga,
        nova_senha: passwordForm.nova_senha
      };

      console.log("Payload para alteração de senha:", { ...payload, senha_antiga: "***", nova_senha: "***" });

      const result = await changeUserPassword(userId, payload);
      console.log("Resultado da alteração de senha:", result);
      
      toast.success("Senha alterada com sucesso!");
      setIsChangePasswordOpen(false);
      setPasswordForm({ senha_antiga: "", nova_senha: "", confirmar_senha: "" });
    } catch (error: any) {
      console.error("Erro detalhado ao alterar senha:", error);
      console.error("Status do erro:", error.status);
      console.error("Mensagem do erro:", error.message);
      
      if (error.message?.includes('405')) {
        toast.error("Método não permitido. Verifique a configuração da API.");
      } else if (error.message?.includes('401')) {
        toast.error("Senha atual incorreta.");
      } else if (error.message?.includes('403')) {
        toast.error("Não autorizado a alterar a senha.");
      } else {
        toast.error(error.message || "Erro ao alterar senha");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Gera as iniciais do usuário
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!userProfile || !user || !perfilAtivo) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-blue-100 text-blue-800">
                  {getUserInitials(userProfile.nome)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userProfile.nome}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {userProfile.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-80 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-2 py-3 text-left text-sm">
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-blue-100 text-blue-800">
                    {getUserInitials(userProfile.nome)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-base">{userProfile.nome}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {userProfile.email}
                  </span>
                  {userProfile.matricula && (
                    <span className="text-muted-foreground truncate text-xs">
                      Matrícula: {userProfile.matricula}
                    </span>
                  )}
                  
                  {/* Perfil Ativo */}
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Perfil ativo:</span>
                      <Badge className={`text-xs ${getProfileColor(perfilAtivo.nome)} border`}>
                        {getProfileIcon()}
                        <span className="ml-1">{perfilAtivo.nome}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Seletor de Perfil */}
                  {perfisDisponiveis.length > 1 && (
                    <div className="mt-3 p-2 bg-gray-50 rounded-md">
                      <label className="text-xs text-muted-foreground mb-2 block font-medium">
                        💼 Alternar perfil:
                      </label>
                      <Select
                        value={perfilAtivo.id.toString()}
                        onValueChange={handleProfileChange}
                        disabled={isChangingProfile}
                      >
                        <SelectTrigger className="h-9 text-xs bg-white border-gray-200 hover:border-gray-300 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              perfilAtivo.nome === 'Administrador' ? 'bg-red-500' :
                              perfilAtivo.nome === 'Gestor' ? 'bg-blue-500' : 'bg-green-500'
                            }`} />
                            <SelectValue />
                          </div>
                          {isChangingProfile && (
                            <div className="ml-2 h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                          )}
                        </SelectTrigger>
                        <SelectContent className="min-w-[200px]">
                          {perfisDisponiveis.map((perfil) => (
                            <SelectItem key={perfil.id} value={perfil.id.toString()} className="cursor-pointer">
                              <div className="flex items-center gap-2 w-full">
                                <div className={`w-2 h-2 rounded-full ${
                                  perfil.nome === 'Administrador' ? 'bg-red-500' :
                                  perfil.nome === 'Gestor' ? 'bg-blue-500' : 'bg-green-500'
                                }`} />
                                {getProfileIcon()}
                                <span className="flex-1">{perfil.nome}</span>
                                {perfil.id === perfilAtivo.id && (
                                  <Badge variant="secondary" className="text-xs ml-auto">
                                    Ativo
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Você tem {perfisDisponiveis.length} perfis disponíveis
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setIsChangePasswordOpen(true);
                }}
              >
                <IconKey className="mr-2 h-4 w-4" />
                Alterar Senha
              </DropdownMenuItem>

              <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Alterar Senha</DialogTitle>
                    <DialogDescription>
                      Digite sua senha atual e a nova senha desejada.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="senha_antiga">Senha Atual</Label>
                      <Input
                        id="senha_antiga"
                        type="password"
                        value={passwordForm.senha_antiga}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, senha_antiga: e.target.value }))}
                        placeholder="Digite sua senha atual"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nova_senha">Nova Senha</Label>
                      <Input
                        id="nova_senha"
                        type="password"
                        value={passwordForm.nova_senha}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, nova_senha: e.target.value }))}
                        placeholder="Digite a nova senha (min. 6 caracteres)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmar_senha">Confirmar Nova Senha</Label>
                      <Input
                        id="confirmar_senha"
                        type="password"
                        value={passwordForm.confirmar_senha}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmar_senha: e.target.value }))}
                        placeholder="Confirme a nova senha"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsChangePasswordOpen(false);
                        setPasswordForm({ senha_antiga: "", nova_senha: "", confirmar_senha: "" });
                      }}
                      disabled={isChangingPassword}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleChangePassword}
                      disabled={isChangingPassword || !passwordForm.senha_antiga || !passwordForm.nova_senha || !passwordForm.confirmar_senha}
                    >
                      {isChangingPassword ? "Alterando..." : "Alterar Senha"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <IconLogout className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
