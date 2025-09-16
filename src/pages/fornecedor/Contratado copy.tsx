import { useEffect, useState, useCallback } from "react";
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

import { Trash2, LoaderCircle, CirclePlus, Pencil, X } from "lucide-react";

//================================================================================
// SECTION: TIPOS E SCHEMAS
//================================================================================

// --- Tipo para o contratado, conforme a API ---
export type Contratado = {
    id: number;
    nome: string;
    email: string;
    cnpj?: string | null;
    cpf?: string | null;
    telefone?: string | null;
};

// --- Funções de validação ---
function validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let sum = 0;
    for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    return true;
}

function validateCNPJ(cnpj: string): boolean {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    const digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;
    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;
    return true;
}


// --- Schema Zod para o formulário de novo contratado ---
const contratadoSchema = z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("E-mail inválido"),
    telefone: z.string().optional(),
    cpf: z.string()
        .transform((val) => val.replace(/\D/g, ''))
        .optional()
        .refine((val) => !val || val.length === 11, { message: "CPF deve conter 11 números" })
        .refine((val) => !val || validateCPF(val), { message: "CPF inválido" }),
    cnpj: z.string()
        .transform((val) => val.replace(/\D/g, ''))
        .optional()
        .refine((val) => !val || val.length === 14, { message: "CNPJ deve conter 14 números" })
        .refine((val) => !val || validateCNPJ(val), { message: "CNPJ inválido" }),
});

type ContratadoForm = z.infer<typeof contratadoSchema>;

//================================================================================
// SECTION: FUNÇÕES AUXILIARES DE MÁSCARA
//================================================================================

const applyMask = (value: string = '', mask: (v: string) => string) => mask(value);

const cpfMask = (value: string) => value
    .replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

const cnpjMask = (value: string) => value
    .replace(/\D/g, '').slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');

const phoneMask = (value: string) => value
    .replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');

//================================================================================
// SECTION: COMPONENTE DE EDIÇÃO
//================================================================================
interface ContratadoEditarProps {
    contratado: { id: number };
    onContratadoUpdated: () => void;
}

function EditarContratado({ contratado, onContratadoUpdated }: ContratadoEditarProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [originalContratadoData, setOriginalContratadoData] = useState<Partial<Contratado>>({});

    const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<ContratadoForm>({
        resolver: zodResolver(contratadoSchema),
    });

    useEffect(() => {
        if (!isDialogOpen) return;

        const loadContratadoData = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/contratados/${contratado.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Falha ao carregar dados para edição.');

                const data: Contratado = await response.json();
                setOriginalContratadoData(data);
                
                reset({
                    nome: data.nome ?? "",
                    email: data.email ?? "",
                    cpf: data.cpf ?? "",
                    cnpj: data.cnpj ?? "",
                    telefone: data.telefone ?? "",
                });

            } catch (error) {
                console.error("Erro ao carregar dados do contratado:", error);
                toast.error("Não foi possível carregar os dados.");
                setIsDialogOpen(false);
            }
        };

        loadContratadoData();
    }, [isDialogOpen, contratado.id, reset]);

   async function handleUpdate(data: ContratadoForm) {
    const payload: { [key: string]: string | null } = {};

    const numericFields: (keyof ContratadoForm)[] = ['cpf', 'cnpj', 'telefone'];

    for (const key in data) {
        const formKey = key as keyof ContratadoForm;
        const formValue = data[formKey] || "";
        const originalValue = originalContratadoData[formKey as keyof Contratado] || "";

        if (numericFields.includes(formKey)) {
            // Compara apenas números
            if (String(formValue).replace(/\D/g, '') !== String(originalValue).replace(/\D/g, '')) {
                payload[formKey] = formValue === "" ? null : formValue;
            }
        } else {
            // Compara como texto normal
            if (String(formValue).trim() !== String(originalValue).trim()) {
                payload[formKey] = formValue === "" ? null : formValue;
            }
        }
    }

    if (Object.keys(payload).length === 0) {
        toast.info("Nenhuma alteração foi feita.");
        setIsDialogOpen(false);
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/contratados/${contratado.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            toast.success('Contratado atualizado com sucesso!');
            setIsDialogOpen(false);
            onContratadoUpdated();
        } else {
            const result = await response.json();
            toast.error(result.error || 'Erro ao atualizar contratado.');
        }
    } catch (error) {
        console.error('Error:', error);
        toast.error('Ocorreu um erro no servidor. Tente novamente.');
    }
}


    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="p-2 rounded-lg">
                    <Pencil className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <form onSubmit={handleSubmit(handleUpdate)}>
                    <DialogHeader>
                        <DialogTitle>Editar Contratado</DialogTitle>
                        <DialogDescription>Altere apenas os campos necessários.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nome" className="text-right">Nome</Label>
                            <div className="col-span-3">
                                <Input id="nome" {...register('nome')} />
                                {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">E-mail</Label>
                            <div className="col-span-3">
                                <Input id="email" type="email" {...register('email')} />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cpf" className="text-right">CPF</Label>
                            <div className="col-span-3">
                                <Controller name="cpf" control={control} render={({ field }) => ( <Input id="cpf" value={applyMask(field.value || '', cpfMask)} onChange={field.onChange} /> )} />
                                {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cnpj" className="text-right">CNPJ</Label>
                            <div className="col-span-3">
                                <Controller name="cnpj" control={control} render={({ field }) => ( <Input id="cnpj" value={applyMask(field.value || '', cnpjMask)} onChange={field.onChange} /> )} />
                                {errors.cnpj && <p className="text-red-500 text-sm mt-1">{errors.cnpj.message}</p>}
                            </div>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="telefone" className="text-right">Telefone</Label>
                            <div className="col-span-3">
                                <Controller name="telefone" control={control} render={({ field }) => ( <Input id="telefone" value={applyMask(field.value || '', phoneMask)} onChange={field.onChange} /> )} />
                                {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone.message}</p>}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button disabled={isSubmitting} type="submit">
                            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

//================================================================================
// SECTION: COMPONENTE NOVO CONTRATADO (MODAL)
//================================================================================

function NovoContratado({ onContratadoAdded }: { onContratadoAdded: () => void }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<ContratadoForm>({
        resolver: zodResolver(contratadoSchema),
    });

    async function handleCriarContratado(data: ContratadoForm) {
        try {
            const payload = {
                ...data,
                cpf: data.cpf ? data.cpf.replace(/\D/g, '') : null,
                cnpj: data.cnpj ? data.cnpj.replace(/\D/g, '') : null,
            };

            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/contratados`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            if (response.status === 201) {
                toast.success('Contratado cadastrado com sucesso.');
                setIsDialogOpen(false);
                reset();
                onContratadoAdded();
            } else {
                const result = await response.json();
                toast.error(result.error || 'Cadastro inválido.');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Erro ao cadastrar contratado.');
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="default">
                    <CirclePlus className="h-4 w-4" />
                    <span className="hidden lg:inline ml-2">Novo Contratado</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <form onSubmit={handleSubmit(handleCriarContratado)}>
                    <DialogHeader>
                        <DialogTitle>Novo Contratado</DialogTitle>
                        <DialogDescription>
                            Preencha os campos para cadastrar uma nova empresa ou pessoa.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nome" className="text-right">Nome</Label>
                            <div className="col-span-3"><Input id="nome" {...register('nome')} />{errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">E-mail</Label>
                            <div className="col-span-3"><Input id="email" {...register('email')} />{errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cpf" className="text-right">CPF</Label>
                            <div className="col-span-3"><Controller name="cpf" control={control} render={({ field }) => (<Input id="cpf" {...field} onChange={e => field.onChange(applyMask(e.target.value, cpfMask))} placeholder="Opcional" />)} />{errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cnpj" className="text-right">CNPJ</Label>
                            <div className="col-span-3"><Controller name="cnpj" control={control} render={({ field }) => (<Input id="cnpj" {...field} onChange={e => field.onChange(applyMask(e.target.value, cnpjMask))} placeholder="Opcional" />)} />{errors.cnpj && <p className="text-red-500 text-sm mt-1">{errors.cnpj.message}</p>}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="telefone" className="text-right">Telefone</Label>
                            <div className="col-span-3"><Controller name="telefone" control={control} render={({ field }) => (<Input id="telefone" {...field} onChange={e => field.onChange(applyMask(e.target.value, phoneMask))} placeholder="Opcional" />)} />{errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone.message}</p>}</div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button disabled={isSubmitting} type="submit">
                            {isSubmitting ? 'Salvando...' : 'Salvar Contratado'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

//================================================================================
// SECTION: COMPONENTE DE EXCLUSÃO
//================================================================================

function ExcluirContratadoDialog({ contratado, onContratadoDeleted }: { contratado: Contratado, onContratadoDeleted: () => void }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/contratados/${contratado.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 204) {
                toast.success(`Contratado "${contratado.nome}" excluído com sucesso.`);
                onContratadoDeleted();
            } else if (response.status === 409) {
                const result = await response.json();
                const contractList = result.contratos.map((c: { nr_contrato: string }) => c.nr_contrato).join(', ');
                toast.error(result.error, {
                    description: `Vinculado aos contratos: ${contractList}`,
                    duration: 8000
                });
            }
            else {
                const result = await response.json();
                toast.error(result.error || 'Falha ao excluir contratado.');
            }
        } catch (error) {
            console.error('Erro ao excluir contratado:', error);
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
                        Esta ação irá excluir o contratado <span className="font-bold">{contratado.nome}</span>. Deseja continuar?
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
export default function Contratados() {
    const [contratados, setContratados] = useState<Contratado[]>([]);
    // ALTERADO: Renomeado de 'filter' para 'searchTerm' para clareza
    const [searchTerm, setSearchTerm] = useState(""); 
    const [loading, setLoading] = useState(true);

    // ALTERADO: Função agora usa useCallback e aceita um parâmetro de busca
    const fetchContratados = useCallback(async (searchQuery = "") => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Acesso não autorizado. Faça o login novamente.");
                setLoading(false);
                return;
            }

            // Constrói a URL dinamicamente
            const url = new URL(`${import.meta.env.VITE_API_URL}/contratados`);
            if (searchQuery) {
                // Adiciona o parâmetro de busca 'nome' se houver um termo de pesquisa
                url.searchParams.append('nome', searchQuery);
            }

            const response = await fetch(url.toString(), {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: Contratado[] = await response.json();
            setContratados(data);

        } catch (error) {
            console.error("Erro ao carregar contratados:", error);
            toast.error("Não foi possível carregar a lista de contratados.");
        } finally {
            setLoading(false);
        }
    }, []); // useCallback com dependência vazia, pois não depende de props ou state

    useEffect(() => {
        fetchContratados();
    }, [fetchContratados]);

    // NOVO: Função para lidar com a submissão do formulário de busca
    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Impede o recarregamento da página
        fetchContratados(searchTerm);
    };

    // NOVO: Função para limpar o filtro de busca
    const handleClearFilter = () => {
        setSearchTerm("");
        fetchContratados(""); // Busca a lista completa novamente
    };

    // REMOVIDO: A filtragem agora é feita no backend, então esta linha não é mais necessária.
    // const filteredContratados = contratados.filter(...);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoaderCircle className="w-8 h-8 animate-spin text-gray-500" />
                <p className="ml-2 text-gray-600">Carregando contratados...</p>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto p-6">
            <div className="flex items-center justify-between py-4 gap-4">
                {/* NOVO: Input e botões agora dentro de um formulário */}
                <form onSubmit={handleSearchSubmit} className="flex gap-2 items-center flex-grow">
                    <Input
                        placeholder="Filtrar por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button type="submit">Buscar</Button>
                    
                    {/* NOVO: Botão para remover o filtro */}
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
                <NovoContratado onContratadoAdded={() => fetchContratados()} />
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* ALTERADO: Mapeia 'contratados' diretamente, pois a API já retorna os dados filtrados */}
                {contratados.length > 0 ? (
                    contratados.map((contratado) => (
                        <div key={contratado.id} className="backdrop-blur-sm bg-white/40 dark:bg-gray-900/40 border border-white/30 dark:border-gray-700/50 rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1">
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1 truncate">{contratado.nome}</h2>
                                <p className="text-gray-500 dark:text-gray-300 text-sm lowercase truncate">{contratado.email}</p>
                                {contratado.cpf && <p className="text-gray-500 dark:text-gray-300 text-sm">CPF: {cpfMask(contratado.cpf)}</p>}
                                {contratado.cnpj && <p className="text-gray-500 dark:text-gray-300 text-sm">CNPJ: {cnpjMask(contratado.cnpj)}</p>}
                                {contratado.telefone && <p className="text-gray-500 dark:text-gray-300 text-sm">Telefone: {phoneMask(contratado.telefone)}</p>}
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex gap-2">
                                    <EditarContratado contratado={contratado} onContratadoUpdated={() => fetchContratados()} />
                                    <ExcluirContratadoDialog contratado={contratado} onContratadoDeleted={() => fetchContratados()} />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-500 dark:text-gray-300 py-10">Nenhum contratado encontrado.</p>
                )}
            </div>
        </div>
    );
}

