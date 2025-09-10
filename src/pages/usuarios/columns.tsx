"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserEditar } from '@/pages/usuarios/EditarUsuario' // Mantenha seu componente de edição

// Importe o tipo User do seu componente principal
export type User = {
    id: number;
    nome: string;
    email: string;
    perfil: string;
    cpf: string;
    matricula?: string;
};

// Função para formatar o CPF (você pode movê-la para um arquivo de 'utils')
const formatCPF = (cpf: string): string => {
    if (!cpf) return "";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};


export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "nome",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nome
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "email",
        header: "E-mail",
    },
    {
        accessorKey: "cpf",
        header: "CPF",
        cell: ({ row }) => formatCPF(row.getValue("cpf")),
    },
    {
        accessorKey: "matricula",
        header: "Matrícula",
    },
    {
        accessorKey: "perfil",
        header: "Perfil",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original

            return (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(user.email)}
                            >
                                Copiar e-mail
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {/* O componente de edição precisa ser renderizado aqui */}
                            <div onClick={(e) => e.stopPropagation()}>
                               <UserEditar user={user} />
                            </div>
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-500"
                                // TODO: Implementar a lógica de exclusão
                                onClick={() => console.log("Excluir usuário:", user)}
                            >
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    },
]