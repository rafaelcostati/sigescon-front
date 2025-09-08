import * as React from "react";
import { useEffect, useState } from "react";
import data from "@/pages/usuarios/data.json";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Edit2, Trash2, Power } from "lucide-react";

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

// ---- Colunas ----
// ---- Colunas ----
export const columns: ColumnDef<UserCardProps>[] = [
  {
    accessorKey: "nome",
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-2"
      >
        Nome
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            column.getIsSorted() === "asc" ? "rotate-180" : ""
          }`}
        />
      </button>
    ),
    cell: ({ row }) => (
      <div className="text-violet-800 font-semibold">{row.getValue("nome")}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "cpf",
    header: "CPF",
    cell: ({ row }) => <div>{formatCPF(row.getValue("cpf"))}</div>,
  },
  {
    accessorKey: "perfil",
    header: "Perfil",
    cell: ({ row }) => <div>{getPerfilDescription(row.getValue("perfil"))}</div>,
  },
  {
    accessorKey: "ativo",
    header: "Status",
    cell: ({ row }) => {
      const ativo = row.getValue("ativo") as boolean;
      return (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {ativo ? "Ativo" : "Inativo"}
        </span>
      );
    },
  },
  // 👉 Coluna de ação (botão editar)
  {
  id: "actions",
  header: "Ações",
  cell: ({ row }) => {
    const user = row.original; // objeto do usuário
    const ativo = user.ativo;

    return (
      <div className="flex gap-2">
        {/* Botão Editar */}
        <Button
          variant="outline"
          size="sm"
          className="p-1"
          onClick={() => console.log("Editar usuário:", user)}
        >
          <Edit2 className="w-4 h-4" />
        </Button>

        {/* Botão Excluir */}
        <Button
          variant="destructive"
          size="sm"
          className="p-1"
          onClick={() => console.log("Excluir usuário:", user)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        {/* Botão Ativar/Desativar */}
        <Button
          variant="outline"
          size="sm"
          className={`p-1 ${ativo ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
          onClick={() => console.log(`${ativo ? "Desativar" : "Ativar"} usuário:`, user)}
        >
          <Power className="w-4 h-4" />
        </Button>
      </div>
    );
  },
}
];


// ---- Componente ----
export default function UserCard() {
  const [users, setUsers] = useState<UserCardProps[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  useEffect(() => {
    // 🔹 Mapear o JSON para o formato da tabela
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
      ativo: true, // valor fixo para exibição
    }));

    setUsers(mappedUsers);
  }, []);

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  return (
    <div className="w-full mx-auto p-6">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar por nome..."
          value={(table.getColumn("nome")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("nome")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Colunas <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) =>
                    column.toggleVisibility(!!value)
                  }
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-start mt-3 mb-2">
        <Pagination className="bottom-0 dark:bg-transparent py-2 cursor-pointer">
          <PaginationContent>
            <PaginationPrevious onClick={() => table.previousPage()}>
              Página Anterior
            </PaginationPrevious>
            <PaginationItem>
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </PaginationItem>
            <PaginationNext onClick={() => table.nextPage()}>
              Próxima Página
            </PaginationNext>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
