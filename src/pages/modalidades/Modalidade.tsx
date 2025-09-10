import { useEffect, useState, useCallback } from "react";
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// ALTERADO: Ícone 'Pencil' removido pois não será mais usado
import { Trash2, LoaderCircle, CirclePlus } from "lucide-react";

//================================================================================
// SECTION: TIPOS E SCHEMAS
//================================================================================

// --- Tipo para a Modalidade ---
export type Modalidade = {
    id: number;
    nome: string;
};

// --- Schema Zod para o formulário de modalidade ---
const modalidadeSchema = z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
});

type ModalidadeForm = z.infer<typeof modalidadeSchema>;


//================================================================================
// SECTION: COMPONENTE NOVA MODALIDADE (MODAL)
//================================================================================

function NovaModalidade({ onModalidadeAdded }: { onModalidadeAdded: () => void }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ModalidadeForm>({
        resolver: zodResolver(modalidadeSchema),
    });

    async function handleCriarModalidade(data: ModalidadeForm) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/modalidades`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data),
            });

            if (response.status === 201) {
                toast.success('Modalidade cadastrada com sucesso.');
                setIsDialogOpen(false);
                reset();
                onModalidadeAdded();
            } else {
                const result = await response.json();
                toast.error(result.error || 'Erro ao cadastrar modalidade.');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Ocorreu um erro no servidor. Tente novamente.');
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="default">
                    <CirclePlus className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Nova Modalidade</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit(handleCriarModalidade)}>
                    <DialogHeader>
                        <DialogTitle>Nova Modalidade</DialogTitle>
                        <DialogDescription>
                            Preencha o nome para cadastrar uma nova modalidade.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nome" className="text-right">Nome</Label>
                            <div className="col-span-3">
                                <Input id="nome" {...register('nome')} />
                                {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button disabled={isSubmitting} type="submit">
                            {isSubmitting ? 'Salvando...' : 'Salvar Modalidade'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

//================================================================================
// SECTION: COMPONENTES DE AÇÕES (APENAS EXCLUIR)
//================================================================================

// REMOVIDO: O componente 'EditarModalidade' foi completamente removido.

// --- Componente de Exclusão ---
function ExcluirModalidadeDialog({ modalidade, onModalidadeDeleted }: { modalidade: Modalidade, onModalidadeDeleted: () => void }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/modalidades/${modalidade.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 204) {
                toast.success(`Modalidade "${modalidade.nome}" excluída com sucesso.`);
                onModalidadeDeleted();
            } else {
                const result = await response.json();
                toast.error(result.error || 'Falha ao excluir modalidade.');
            }
        } catch (error) {
            console.error('Erro ao excluir modalidade:', error);
            toast.error('Ocorreu um erro de rede. Tente novamente.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="p-2 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação irá excluir a modalidade <span className="font-bold">{modalidade.nome}</span>. Esta ação não pode ser desfeita.
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
// SECTION: COMPONENTE PRINCIPAL (LISTAGEM)
//================================================================================
export default function Modalidades() {
    const [modalidades, setModalidades] = useState<Modalidade[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchModalidades = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Acesso não autorizado.");
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/modalidades`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Falha ao buscar modalidades.');
            
            const data: Modalidade[] = await response.json();
            setModalidades(data);
        } catch (error) {
            console.error("Erro ao carregar modalidades:", error);
            toast.error("Não foi possível carregar a lista de modalidades.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchModalidades();
    }, [fetchModalidades]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoaderCircle className="w-8 h-8 animate-spin text-gray-500" />
                <p className="ml-2 text-gray-600">Carregando modalidades...</p>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Gerenciar Modalidades</h1>
                <NovaModalidade onModalidadeAdded={fetchModalidades} />
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead className="text-right w-[100px]">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {modalidades.length > 0 ? (
                            modalidades.map((modalidade) => (
                                <TableRow key={modalidade.id}>
                                    <TableCell className="font-medium">{modalidade.nome}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            {/* ALTERADO: Apenas o botão de excluir é renderizado aqui */}
                                            <ExcluirModalidadeDialog modalidade={modalidade} onModalidadeDeleted={fetchModalidades} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center h-24">
                                    Nenhuma modalidade encontrada.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}