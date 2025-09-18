import { useEffect, useState, useCallback } from "react";
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from 'react-hook-form';

// --- Imports de UI ---
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, LoaderCircle, CirclePlus, Pencil } from "lucide-react";

// --- Imports da nossa API centralizada ---
import {
    getModalidades,
    createModalidade,
    updateModalidade,
    deleteModalidade,
    type Modalidade,
} from "@/lib/api";

//================================================================================
// SECTION: TIPOS E SCHEMAS
//================================================================================

const modalidadeSchema = z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
});
type ModalidadeForm = z.infer<typeof modalidadeSchema>;

//================================================================================
// SECTION: COMPONENTES FILHOS (REFATORADOS)
//================================================================================

function NovaModalidade({ onModalidadeAdded }: { onModalidadeAdded: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ModalidadeForm>({
        resolver: zodResolver(modalidadeSchema),
    });

    async function handleCreate(data: ModalidadeForm) {
        try {
            await createModalidade(data);
            toast.success('Modalidade cadastrada com sucesso.');
            setIsOpen(false);
            reset();
            onModalidadeAdded();
        } catch (error: any) {
            toast.error(error.message || 'Erro ao cadastrar modalidade.');
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="default">
                    <CirclePlus className="h-4 w-4" />
                    <span className="hidden lg:inline ml-2">Nova Modalidade</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit(handleCreate)}>
                    <DialogHeader>
                        <DialogTitle>Nova Modalidade</DialogTitle>
                        <DialogDescription>Preencha o nome para cadastrar.</DialogDescription>
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
                            {isSubmitting ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditarModalidade({ modalidade, onModalidadeUpdated }: { modalidade: Modalidade, onModalidadeUpdated: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ModalidadeForm>({
        resolver: zodResolver(modalidadeSchema),
        defaultValues: { nome: modalidade.nome }
    });

    useEffect(() => {
        if (isOpen) {
            reset({ nome: modalidade.nome });
        }
    }, [isOpen, modalidade, reset]);

    async function handleUpdate(data: ModalidadeForm) {
        if (data.nome === modalidade.nome) {
            toast.info("Nenhuma alteração foi feita.");
            setIsOpen(false);
            return;
        }

        try {
            await updateModalidade(modalidade.id, data);
            toast.success('Modalidade atualizada com sucesso!');
            setIsOpen(false);
            onModalidadeUpdated();
        } catch (error: any) {
            toast.error(error.message || 'Erro ao atualizar.');
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="p-2 h-8 w-8">
                    <Pencil className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit(handleUpdate)}>
                    <DialogHeader>
                        <DialogTitle>Editar Modalidade</DialogTitle>
                        <DialogDescription>Altere o nome da modalidade.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nome-edit" className="text-right">Nome</Label>
                            <div className="col-span-3">
                                <Input id="nome-edit" {...register('nome')} />
                                {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button disabled={isSubmitting} type="submit">
                            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ExcluirModalidadeDialog({ modalidade, onModalidadeDeleted }: { modalidade: Modalidade, onModalidadeDeleted: () => void }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteModalidade(modalidade.id);
            toast.success(`Modalidade "${modalidade.nome}" excluída com sucesso.`);
            onModalidadeDeleted();
        } catch (error: any) {
            toast.error(error.message || 'Falha ao excluir modalidade.');
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
                        Esta ação irá excluir a modalidade <span className="font-bold">{modalidade.nome}</span> e não pode ser desfeita.
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

function ModalidadeMobileCard({ modalidade, onModalidadeUpdated, onModalidadeDeleted }: { modalidade: Modalidade, onModalidadeUpdated: () => void, onModalidadeDeleted: () => void }) {
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{modalidade.nome}</CardTitle>
                        <CardDescription>ID: {modalidade.id}</CardDescription>
                    </div>
                    <Badge variant="secondary">Modalidade</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 pt-2">
                    <EditarModalidade modalidade={modalidade} onModalidadeUpdated={onModalidadeUpdated} />
                    <ExcluirModalidadeDialog modalidade={modalidade} onModalidadeDeleted={onModalidadeDeleted} />
                </div>
            </CardContent>
        </Card>
    );
}


//================================================================================
// SECTION: COMPONENTE PRINCIPAL (LISTAGEM)
//================================================================================

export default function ModalidadesDataTable() {
    const [modalidades, setModalidades] = useState<Modalidade[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchModalidades = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getModalidades();
            setModalidades(data);
        } catch (error: any) {
            toast.error(error.message || "Não foi possível carregar as modalidades.");
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
            <div className="flex items-center justify-between py-4">
                <h1 className="text-2xl font-bold">Gerenciar Modalidades</h1>
                <NovaModalidade onModalidadeAdded={fetchModalidades} />
            </div>

            {modalidades.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500">Nenhuma modalidade encontrada.</p>
                </div>
            ) : (
                <>
                    <div className="hidden md:block rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-semibold">Nome</TableHead>
                                    <TableHead className="font-semibold text-end pr-8">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {modalidades.map((modalidade, index) => (
                                    <TableRow key={modalidade.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                        <TableCell className="font-medium">{modalidade.nome}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-2">
                                                <EditarModalidade modalidade={modalidade} onModalidadeUpdated={fetchModalidades} />
                                                <ExcluirModalidadeDialog modalidade={modalidade} onModalidadeDeleted={fetchModalidades} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="md:hidden space-y-4">
                        {modalidades.map((modalidade) => (
                            <ModalidadeMobileCard
                                key={modalidade.id}
                                modalidade={modalidade}
                                onModalidadeUpdated={fetchModalidades}
                                onModalidadeDeleted={fetchModalidades}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

