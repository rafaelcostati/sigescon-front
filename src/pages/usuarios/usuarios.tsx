import { useEffect, useState } from "react";
import data from "@/pages/usuarios/data.json";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Power } from "lucide-react";
import { NovoUsuario } from '@/pages/usuarios/NovoUsuario';

// ---- Tipos ----
export type UserCardProps = {
    id: number;
    nome: string;
    email: string;
    perfil: string;
    ativo: boolean;
    cpf: string;
};

// ---- Helpers ----
function formatCPF(cpf: string): string {
    if (!cpf) return "";
    const numericCPF = cpf.replace(/\D/g, "");
    return numericCPF
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

const getPerfilDescription = (perfil?: string) => {
    if (!perfil) return "Desconhecido";
    const formattedPerfil = perfil.trim();

    switch (formattedPerfil) {
        case "Administrador":
            return "Administrador";
        case "Chefia":
        case "Coordenação":
            return "Coordenação";
        case "Procurador":
            return "Procurador";
        case "Assessor":
            return "Assessor";
        case "Estagiario":
        case "Externo":
            return "Externo";
        default:
            return `Desconhecido (${formattedPerfil})`;
    }
};

// ---- Componente ----
export default function UserCard() {
    const [users, setUsers] = useState<UserCardProps[]>([]);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        const mappedUsers: UserCardProps[] = (data as any[]).map((user) => ({
            id: user.id,
            nome: user.nome,
            email: user.email,
            cpf: user.cpf,
            perfil:
                user.perfil_id === 1
                    ? "Administrador"
                    : user.perfil_id === 2
                        ? "Coordenação"
                        : "Externo",
            ativo: true,
        }));

        setUsers(mappedUsers);
    }, []);

    const filteredUsers = users.filter((user) =>
        user.nome.toLowerCase().includes(filter.toLowerCase())
    );

    const toggleAtivo = (id: number) => {
        setUsers((prev) =>
            prev.map((user) =>
                user.id === id ? { ...user, ativo: !user.ativo } : user
            )
        );
    };

    return (
        <div className="w-full mx-auto p-6">
            {/* Filtro */}
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filtrar por nome..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="max-w-sm"
                />
            </div>

             <div className="flex items-center justify-end p-4">

                <NovoUsuario/>
               
            </div>       


            {/* Grid de Cards */}
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredUsers.length ? (
                    filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            className="backdrop-blur-sm bg-white/40 dark:bg-gray-900/40 border border-white/30 dark:border-gray-700/50 rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1"
                        >
                            {/* Informações */}
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                                    {user.nome}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-300 text-sm lowercase">
                                    {user.email}
                                </p>
                                <p className="text-gray-500 dark:text-gray-300 text-sm">
                                    CPF: {formatCPF(user.cpf)}
                                </p>
                                <p className="text-gray-500 dark:text-gray-300 text-sm">
                                    Perfil: {getPerfilDescription(user.perfil)}
                                </p>
                            </div>

                            {/* Status e Ações */}
                            <div className="flex items-center justify-between mt-auto">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-300 ${user.ativo
                                        ? "bg-green-100 text-green-700 dark:bg-green-200/30 dark:text-green-300"
                                        : "bg-red-100 text-red-700 dark:bg-red-200/30 dark:text-red-300"
                                        }`}
                                >
                                    {user.ativo ? "Ativo" : "Inativo"}
                                </span>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="p-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900 transition-colors"
                                        onClick={() => console.log("Editar usuário:", user)}
                                    >
                                        <Edit2 className={`w-5 h-5 text-violet-700 dark:text-violet-300`} />
                                    </Button>

                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                                        onClick={() => console.log("Excluir usuário:", user)}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`p-2 rounded-lg transition-colors duration-300 ${user.ativo
                                            ? "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800/40"
                                            : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-800/40"
                                            }`}
                                        onClick={() => toggleAtivo(user.id)}
                                    >
                                        <Power className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-500 dark:text-gray-300">
                        Nenhum resultado encontrado.
                    </p>
                )}
            </div>
        </div>
    );
}
