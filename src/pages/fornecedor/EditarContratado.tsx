import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { Pencil } from 'lucide-react';

//================================================================================
// SECTION: FUNÇÕES AUXILIARES E VALIDAÇÃO
//================================================================================

// --- Validação de CPF ---
function validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let sum = 0, remainder;
    for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder >= 10) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if (remainder >= 10) remainder = 0;
    return remainder === parseInt(cpf.substring(10, 11));
}

// --- Validação de CNPJ ---
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


const applyMask = (value: string | null | undefined = '', mask: (v: string) => string) => mask(value || '');

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
// SECTION: TIPOS E SCHEMA
//================================================================================

const editContratadoSchema = z.object({
    nome: z.string().min(1, "O nome é obrigatório").optional(),
    email: z.string().email("Formato de e-mail inválido").optional(),
    telefone: z.string().optional(),
    cpf: z.string().transform(val => val.replace(/\D/g, ''))
        .optional().refine(val => !val || val.length === 11, { message: "CPF deve conter 11 dígitos" })
        .refine(val => !val || validateCPF(val), { message: "CPF inválido" }),
    cnpj: z.string().transform(val => val.replace(/\D/g, ''))
        .optional().refine(val => !val || val.length === 14, { message: "CNPJ deve conter 14 dígitos" })
        .refine(val => !val || validateCNPJ(val), { message: "CNPJ inválido" }),
});

type EditContratadoForm = z.infer<typeof editContratadoSchema>;

interface ContratadoData {
    id: number;
    nome: string;
    email: string;
    cpf?: string | null;
    cnpj?: string | null;
    telefone?: string | null;
}

interface ContratadoEditarProps {
    contratado: { id: number };
    onContratadoUpdated: () => void;
}

//================================================================================
// SECTION: COMPONENTE
//================================================================================

export function EditarContratado({ contratado, onContratadoUpdated }: ContratadoEditarProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [originalContratadoData, setOriginalContratadoData] = useState<Partial<ContratadoData>>({});

    const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<EditContratadoForm>({
        resolver: zodResolver(editContratadoSchema),
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

                const data: ContratadoData = await response.json();
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

   
async function handleUpdate(data: EditContratadoForm) {
    const payload: { [key: string]: string | null | undefined } = {};

    // --- Limpa máscaras antes de comparar ---
    const newCpf = (data.cpf || "").replace(/\D/g, '');
    const newCnpj = (data.cnpj || "").replace(/\D/g, '');
    const newTelefone = (data.telefone || "").replace(/\D/g, '');
    const newNome = data.nome || "";
    const newEmail = data.email || "";

    const originalCpf = (originalContratadoData.cpf || "").replace(/\D/g, '');
    const originalCnpj = (originalContratadoData.cnpj || "").replace(/\D/g, '');
    const originalTelefone = (originalContratadoData.telefone || "").replace(/\D/g, '');
    const originalNome = originalContratadoData.nome || "";
    const originalEmail = originalContratadoData.email || "";

    console.log("DADOS ORIGINAIS:", originalContratadoData);
    console.log("DADOS DO FORMULÁRIO:", data);

    // --- Comparação campo a campo ---
    if (newNome !== originalNome) payload.nome = newNome || null;
    if (newEmail !== originalEmail) payload.email = newEmail || null;
    if (newCpf !== originalCpf) payload.cpf = newCpf || null;
    if (newCnpj !== originalCnpj) payload.cnpj = newCnpj || null;
    if (newTelefone !== originalTelefone) payload.telefone = newTelefone || null;

    console.log("PAYLOAD A SER ENVIADO:", payload);

    if (Object.keys(payload).length === 0) {
        toast.info("Nenhuma alteração foi feita.");
        setIsDialogOpen(false);
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/contratados/${contratado.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
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
                        <DialogDescription>
                            Altere apenas os campos necessários.
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
                                <Controller name="cpf" control={control} render={({ field }) => ( <Input id="cpf" value={applyMask(field.value, cpfMask)} onChange={field.onChange} /> )} />
                                {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cnpj" className="text-right">CNPJ</Label>
                            <div className="col-span-3">
                                <Controller name="cnpj" control={control} render={({ field }) => ( <Input id="cnpj" value={applyMask(field.value, cnpjMask)} onChange={field.onChange} /> )} />
                                {errors.cnpj && <p className="text-red-500 text-sm mt-1">{errors.cnpj.message}</p>}
                            </div>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="telefone" className="text-right">Telefone</Label>
                            <div className="col-span-3">
                                <Controller name="telefone" control={control} render={({ field }) => ( <Input id="telefone" value={applyMask(field.value, phoneMask)} onChange={field.onChange} /> )} />
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
