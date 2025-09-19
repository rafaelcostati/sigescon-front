import { useEffect, useState, useCallback } from "react";
import { toast } from 'sonner';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, LoaderCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { UserEditar } from '@/pages/usuarios/EditarUsuario';
import { CadastrarUsuarioSimples } from '@/pages/usuarios/CadastrarUsuarioSimples';
import { ConcederPerfis } from '@/pages/usuarios/ConcederPerfis';

// --- Importa as funções da nossa API centralizada ---
import {
    getUsers,
    deleteUser,
    type User,
} from "@/lib/api";





//================================================================================
// COMPONENTE DE EXCLUSÃO (REFATORADO)
//================================================================================
function ExcluirUsuarioDialog({ user, onUserDeleted }: { user: User, onUserDeleted: () => void }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteUser(user.id); // <-- USA A FUNÇÃO DA API
            toast.success(`Usuário "${user.nome}" excluído com sucesso.`);
            onUserDeleted();
        } catch (error: any) {
            console.error('Erro ao excluir usuário:', error);
            toast.error(error.message || 'Falha ao excluir usuário.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="p-2 h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação irá excluir o usuário <span className="font-bold">{user.nome}</span>. Deseja continuar?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                        {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

//================================================================================
// COMPONENTE CARD MÓVEL (sem alterações de lógica)
//================================================================================
function UserMobileCard({ user, onUserUpdated, onUserDeleted }: { user: User, onUserUpdated: () => void, onUserDeleted: () => void }) {
    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{user.nome}</CardTitle>
                        <CardDescription className="text-sm lowercase truncate">{user.email}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2 text-xs">
                        {user.perfil_nome} {/* <-- ATUALIZADO */}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {/* O CPF foi removido pois não é mais retornado pela API de listagem */}
                {user.matricula && (
                    <div className="text-sm text-muted-foreground">
                        <strong>Matrícula:</strong> {user.matricula}
                    </div>
                )}
                <div className="flex gap-2 pt-3">
                    {/* ATENÇÃO: O componente UserEditar pode precisar ser ajustado se ele depende do CPF vindo da listagem. */}
                    {/* É recomendado que UserEditar busque os dados completos do usuário pelo ID. */}
                    <UserEditar user={user} onUserUpdated={onUserUpdated} />
                    <ExcluirUsuarioDialog user={user} onUserDeleted={onUserDeleted} />
                </div>
            </CardContent>
        </Card>
    );
}

//================================================================================
// COMPONENTE PRINCIPAL (LISTAGEM - REFATORADO)
//================================================================================
export default function UserDataTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(10);

    const fetchUsers = useCallback(async (page = 1, limit = 10, search = "") => {
        setLoading(true);
        try {
            // <-- USA A FUNÇÃO DA API
            const result = await getUsers({ page, per_page: limit, nome: search });

            setUsers(result.data);
            setTotalPages(result.total_pages);
            setCurrentPage(result.current_page);
            setTotalItems(result.total_items);
            setPerPage(result.per_page);

        } catch (error: any) {
            console.error("Erro ao carregar usuários:", error);
            toast.error(error.message || "Não foi possível carregar a lista de usuários.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(1, 10, ""); // Carga inicial
    }, [fetchUsers]);

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setCurrentPage(1);
        fetchUsers(1, perPage, searchTerm);
    };

    const handleClearFilter = () => {
        setSearchTerm("");
        setCurrentPage(1);
        fetchUsers(1, perPage, "");
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            fetchUsers(newPage, perPage, searchTerm);
        }
    };

    const refreshCurrentPage = () => {
        fetchUsers(currentPage, perPage, searchTerm);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoaderCircle className="w-8 h-8 animate-spin text-gray-500" />
                <p className="ml-2 text-gray-600">Carregando usuários...</p>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto p-6">
            {/* Barra de Filtro e Ações */}
            <div className="flex items-center justify-between py-4 gap-4">
                <form onSubmit={handleSearchSubmit} className="flex gap-2 items-center flex-grow">
                    <Input
                        placeholder="Filtrar por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button type="submit">Buscar</Button>
                    {searchTerm && (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleClearFilter}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </form>
                <CadastrarUsuarioSimples onUsuarioCriado={refreshCurrentPage} />
            </div>

            {users.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-300">Nenhum usuário encontrado.</p>
                </div>
            ) : (
                <>
                    {/* DataTable para telas maiores */}
                    <div className="hidden md:block">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="font-semibold">Nome</TableHead>
                                        <TableHead className="font-semibold">Email</TableHead>
                                        <TableHead className="font-semibold hidden lg:table-cell">Matrícula</TableHead>
                                        <TableHead className="font-semibold text-center">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user, index) => (
                                        <TableRow
                                            key={user.id}
                                            className={`hover:bg-muted/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                                } dark:${index % 2 === 0 ? 'bg-gray-950' : 'bg-gray-900/50'}`}
                                        >
                                            <TableCell className="font-medium">{user.nome}</TableCell>
                                            <TableCell className="text-muted-foreground lowercase">{user.email}</TableCell>
                                            <TableCell className="hidden text-muted-foreground lg:table-cell">
                                                {user.matricula || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    <ConcederPerfis usuario={user} onPerfisUpdated={refreshCurrentPage} />
                                                    <UserEditar user={user} onUserUpdated={refreshCurrentPage} />
                                                    <ExcluirUsuarioDialog user={user} onUserDeleted={refreshCurrentPage} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Cards para telas menores */}
                    <div className="md:hidden space-y-4">
                        {users.map((user) => (
                            <UserMobileCard
                                key={user.id}
                                user={user}
                                onUserUpdated={refreshCurrentPage}
                                onUserDeleted={refreshCurrentPage}
                            />
                        ))}
                    </div>

                    {/* --- CONTROLES DE PAGINAÇÃO --- */}
                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="text-sm text-muted-foreground">
                            Total de {totalItems} usuário(s).
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                                Página {currentPage} de {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                            >
                                Próxima
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

