import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload } from "lucide-react";
import { submitRelatorio, type Pendencia } from "@/lib/api";

// Tipo local para o payload
type SubmitRelatorioPayload = {
    observacoes_fiscal: string;
    mes_competencia: string;
    pendencia_id: number;
    arquivo: File;
};

const relatorioSchema = z.object({
    observacoes_fiscal: z.string().min(10, "Observações devem ter pelo menos 10 caracteres"),
    mes_competencia: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato deve ser YYYY-MM-DD"),
    pendencia_id: z.number().min(1, "Selecione uma pendência"),
    arquivo: z.instanceof(File, { message: "Selecione um arquivo" })
        .refine((file) => file.size <= 100 * 1024 * 1024, "Arquivo deve ter no máximo 100MB")
        .refine(
            (file) => ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"].includes(file.type),
            "Apenas arquivos PDF, DOC, DOCX, JPG ou PNG são permitidos"
        ),
});

type RelatorioFormData = z.infer<typeof relatorioSchema>;

interface EnviarRelatorioProps {
    contratoId: number;
    contratoNumero: string;
    pendencias: Pendencia[];
    onRelatorioEnviado?: () => void;
    children?: React.ReactNode;
}

export function EnviarRelatorio({
    contratoId,
    contratoNumero,
    pendencias,
    onRelatorioEnviado,
    children
}: EnviarRelatorioProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<RelatorioFormData>({
        resolver: zodResolver(relatorioSchema),
        defaultValues: {
            observacoes_fiscal: "",
            mes_competencia: new Date().toISOString().slice(0, 10), // YYYY-MM-DD atual
            pendencia_id: 0,
        },
    });

    // Filtrar apenas pendências pendentes (não concluídas/canceladas)
    // Como não temos o nome do status, vamos assumir que todas as pendências retornadas são válidas
    const pendenciasPendentes = pendencias.filter(p => p.status_pendencia_id !== undefined);

    const onSubmit = async (data: RelatorioFormData) => {
        setIsSubmitting(true);
        const toastId = toast.loading("Enviando relatório...");

        try {
            const payload: SubmitRelatorioPayload = {
                observacoes_fiscal: data.observacoes_fiscal,
                mes_competencia: data.mes_competencia,
                pendencia_id: data.pendencia_id,
                arquivo: data.arquivo,
            };

            console.log("📄 Enviando relatório:", {
                contratoId,
                payload: {
                    observacoes_fiscal: payload.observacoes_fiscal,
                    mes_competencia: payload.mes_competencia,
                    pendencia_id: payload.pendencia_id,
                    arquivo_nome: payload.arquivo.name,
                    arquivo_tamanho: payload.arquivo.size,
                    arquivo_tipo: payload.arquivo.type
                }
            });
            
            const result = await submitRelatorio(contratoId, payload);
            console.log("✅ Relatório enviado com sucesso:", result);

            toast.success("Relatório enviado com sucesso!", {
                id: toastId,
                description: `Relatório para o contrato ${contratoNumero} foi enviado para análise.`
            });

            form.reset();
            setIsOpen(false);
            onRelatorioEnviado?.();
            
        } catch (error) {
            console.error("❌ Erro ao enviar relatório:", error);
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            
            toast.error("Falha ao enviar relatório", {
                id: toastId,
                description: errorMessage
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            form.setValue("arquivo", file);
            form.clearErrors("arquivo");
        }
    };

    // Se não há pendências pendentes, não mostrar o botão
    if (pendenciasPendentes.length === 0) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Enviar Relatório
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Enviar Relatório Fiscal
                    </DialogTitle>
                    <DialogDescription>
                        Envie um relatório fiscal para o contrato <strong>{contratoNumero}</strong>.
                        O relatório será analisado pela equipe de gestão.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="pendencia_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pendência *</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(parseInt(value))}
                                        value={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione a pendência que está respondendo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {pendenciasPendentes.map((pendencia) => (
                                                <SelectItem key={pendencia.id} value={pendencia.id.toString()}>
                                                    {pendencia.descricao} - Prazo: {new Date(pendencia.data_prazo).toLocaleDateString('pt-BR')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="mes_competencia"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Data de Competência *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            placeholder="YYYY-MM-DD"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="observacoes_fiscal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Observações do Fiscal *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descreva suas observações sobre o contrato, principais pontos de atenção e conclusões..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="arquivo"
                            render={({ field: { value } }) => (
                                <FormItem>
                                    <FormLabel>Arquivo do Relatório *</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                onChange={handleFileChange}
                                            />
                                            <Upload className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground">
                                        Formatos aceitos: PDF, DOC, DOCX, JPG, PNG. Máximo: 100MB
                                    </p>
                                    {value && (
                                        <p className="text-sm text-green-600">
                                            Arquivo selecionado: {value.name} ({(value.size / 1024 / 1024).toFixed(2)} MB)
                                        </p>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Enviando..." : "Enviar Relatório"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
