import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  IconFile,
  IconDownload,
  IconTrash,
  IconRefresh,
  IconFileText,
  IconPhoto,
  IconFileSpreadsheet,
  IconCalendar,
  IconUser,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  getArquivosByContratoId,
  downloadArquivoContrato,
  deleteArquivoContrato,
  getRelatoriosAprovadosByContratoId
} from "@/lib/api";

interface ContratoArquivosProps {
  contratoId: number;
  className?: string;
}

type ArquivoContrato = {
  id: number;
  nome: string;
  tipo: string;
  tamanho: number;
  data_upload: string;
  uploadado_por_nome?: string;
  categoria: 'contratual' | 'relatorio';
};

export function ContratoArquivos({ contratoId, className }: ContratoArquivosProps) {
  const { perfilAtivo } = useAuth();
  const [arquivosContratuais, setArquivosContratuais] = useState<ArquivoContrato[]>([]);
  const [arquivosRelatorios, setArquivosRelatorios] = useState<ArquivoContrato[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    arquivo: ArquivoContrato | null;
  }>({ open: false, arquivo: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Verificar se o usuário pode excluir arquivos (apenas admin)
  const canDelete = perfilAtivo?.nome === 'Administrador';

  // Carregar arquivos contratuais (apenas arquivos do contrato, não relatórios)
  const loadArquivosContratuais = async () => {
    try {
      console.log("🔍 Carregando arquivos contratuais do contrato:", contratoId);
      const response = await getArquivosByContratoId(contratoId);

      // Filtrar apenas arquivos contratuais (não relatórios)
      const arquivosFormatados: ArquivoContrato[] = response.arquivos.map(arquivo => ({
        id: arquivo.id,
        nome: arquivo.nome_arquivo || `Arquivo_${arquivo.id}`,
        tipo: arquivo.tipo_arquivo || getFileExtension(arquivo.nome_arquivo || ''),
        tamanho: arquivo.tamanho_bytes || 0,
        data_upload: arquivo.created_at,
        uploadado_por_nome: 'Administrador', // Arquivos contratuais são sempre do admin
        categoria: 'contratual' as const
      }));

      setArquivosContratuais(arquivosFormatados);
      console.log("✅ Arquivos contratuais carregados:", arquivosFormatados);
    } catch (error) {
      console.error("❌ Erro ao carregar arquivos contratuais:", error);
      setArquivosContratuais([]);
    }
  };

  // Carregar relatórios aprovados (apenas com pendências concluídas)
  const loadRelatoriosAprovados = async () => {
    try {
      console.log("🔍 Carregando relatórios aprovados do contrato:", contratoId);
      const response = await getRelatoriosAprovadosByContratoId(contratoId);

      // Mapear relatórios aprovados para o formato esperado
      const relatoriosFormatados = response.data.map((relatorio: any) => ({
        id: relatorio.arquivo_id || relatorio.id, // Usar arquivo_id para download
        nome: relatorio.nome_arquivo || `Relatório_${relatorio.id}.pdf`,
        tipo: getFileExtension(relatorio.nome_arquivo || 'pdf'),
        tamanho: 0, // Tamanho não disponível na resposta atual
        data_upload: relatorio.created_at,
        uploadado_por_nome: relatorio.enviado_por || 'Fiscal',
        categoria: 'relatorio' as const
      }));

      setArquivosRelatorios(relatoriosFormatados);
      console.log("✅ Relatórios carregados:", relatoriosFormatados);
    } catch (error) {
      console.error("❌ Erro ao carregar relatórios:", error);
      setArquivosRelatorios([]);
    }
  };

  // Carregar todos os dados
  const loadArquivos = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadArquivosContratuais(),
        loadRelatoriosAprovados()
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArquivos();
  }, [contratoId]);


  // Função para obter extensão do arquivo
  const getFileExtension = (nomeArquivo: string): string => {
    const parts = nomeArquivo.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  };

  // Função para obter ícone do arquivo
  const getFileIcon = (tipo: string, tamanho: number = 20) => {
    const iconProps = { size: tamanho, className: "text-gray-600" };

    switch (tipo.toLowerCase()) {
      case 'pdf':
        return <IconFileText {...iconProps} className="text-red-600" />;
      case 'doc':
      case 'docx':
        return <IconFileText {...iconProps} className="text-blue-600" />;
      case 'xls':
      case 'xlsx':
        return <IconFileSpreadsheet {...iconProps} className="text-green-600" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <IconPhoto {...iconProps} className="text-purple-600" />;
      default:
        return <IconFile {...iconProps} />;
    }
  };


  // Função para formatar data
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para download de arquivo
  const handleDownload = async (arquivo: ArquivoContrato) => {
    try {
      console.log("📥 Fazendo download do arquivo:", {
        nome: arquivo.nome,
        id: arquivo.id,
        categoria: arquivo.categoria,
        contratoId
      });
      
      toast.loading("Preparando download...", { id: `download-${arquivo.id}` });

      const blob = await downloadArquivoContrato(contratoId, arquivo.id);

      // Criar URL temporária para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = arquivo.nome;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Download realizado com sucesso!", { id: `download-${arquivo.id}` });
    } catch (error: any) {
      console.error("❌ Erro no download:", error);
      toast.error("Erro ao fazer download do arquivo", { id: `download-${arquivo.id}` });
    }
  };

  // Função para excluir arquivo
  const handleDelete = async (arquivo: ArquivoContrato) => {
    setIsDeleting(true);
    try {
      console.log("🗑️ Excluindo arquivo:", arquivo.nome);
      await deleteArquivoContrato(contratoId, arquivo.id);

      // Remover arquivo da lista apropriada
      if (arquivo.categoria === 'contratual') {
        setArquivosContratuais(prev => prev.filter(a => a.id !== arquivo.id));
      } else {
        setArquivosRelatorios(prev => prev.filter(a => a.id !== arquivo.id));
      }

      toast.success("Arquivo excluído com sucesso!");
      setDeleteDialog({ open: false, arquivo: null });
    } catch (error: any) {
      console.error("❌ Erro ao excluir arquivo:", error);

      // Tratamento específico para diferentes tipos de erro
      if (error.message?.includes("Arquivos de relatórios fiscais não podem ser excluídos")) {
        toast.error(
          "Arquivos de relatórios fiscais não podem ser excluídos pois estão vinculados a pendências.",
          { duration: 6000 }
        );
      } else if (error.message?.includes("vinculado a") && error.message?.includes("relatório")) {
        toast.error(
          "Este arquivo contratual não pode ser excluído porque está sendo usado por relatórios fiscais. " +
          "Remova ou substitua os relatórios primeiro.",
          { duration: 6000 }
        );
      } else {
        toast.error("Erro ao excluir arquivo");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFile className="w-5 h-5" />
            Arquivos do Contrato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Arquivos Contratuais */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconFileText className="w-5 h-5 text-blue-600" />
                Arquivos Contratuais
                <Badge variant="secondary">{arquivosContratuais.length}</Badge>
              </CardTitle>
              <CardDescription>
                Documentos oficiais do contrato (edital, contrato assinado, aditivos, etc.)
              </CardDescription>
            </div>
            <Button onClick={loadArquivos} variant="outline" size="sm">
              <IconRefresh className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {arquivosContratuais.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <IconFileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhum arquivo contratual encontrado</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Data Upload</TableHead>
                    <TableHead>Enviado por</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arquivosContratuais.map((arquivo) => (
                    <TableRow key={arquivo.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getFileIcon(arquivo.tipo)}
                          <div>
                            <p className="font-medium">{arquivo.nome}</p>
                            <Badge variant="outline" className="text-xs">
                              Contratual
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <IconCalendar className="w-3 h-3" />
                          {formatDate(arquivo.data_upload)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <IconUser className="w-3 h-3" />
                          {arquivo.uploadado_por_nome || 'Sistema'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(arquivo)}
                          >
                            <IconDownload className="w-4 h-4" />
                          </Button>
                          {canDelete && arquivo.categoria === 'contratual' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteDialog({ open: true, arquivo })}
                              className="text-red-600 hover:text-red-700"
                              title="Excluir arquivo contratual"
                            >
                              <IconTrash className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Arquivos de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFile className="w-5 h-5 text-green-600" />
            Arquivos de Relatórios
            <Badge variant="secondary">{arquivosRelatorios.length}</Badge>
          </CardTitle>
          <CardDescription>
            Relatórios de fiscalização aprovados pelo administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          {arquivosRelatorios.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <IconFile className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhum relatório aprovado encontrado</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Relatório</TableHead>
                    <TableHead>Data Envio</TableHead>
                    <TableHead>Fiscal</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arquivosRelatorios.map((arquivo) => (
                    <TableRow key={arquivo.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getFileIcon(arquivo.tipo)}
                          <div>
                            <p className="font-medium">{arquivo.nome}</p>
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              Relatório
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <IconCalendar className="w-3 h-3" />
                          {formatDate(arquivo.data_upload)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <IconUser className="w-3 h-3" />
                          {arquivo.uploadado_por_nome || 'Fiscal'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(arquivo)}
                          >
                            <IconDownload className="w-4 h-4" />
                          </Button>
                          {canDelete && arquivo.categoria === 'contratual' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteDialog({ open: true, arquivo })}
                              className="text-red-600 hover:text-red-700"
                              title="Excluir arquivo contratual"
                            >
                              <IconTrash className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, arquivo: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <IconAlertTriangle className="w-5 h-5 text-red-600" />
              Excluir Arquivo?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O arquivo será permanentemente removido do contrato.
              {deleteDialog.arquivo && (
                <>
                  <br /><br />
                  <strong>Arquivo:</strong> {deleteDialog.arquivo.nome}
                  <br />
                  <strong>Tipo:</strong> {deleteDialog.arquivo.categoria === 'contratual' ? 'Contratual' : 'Relatório'}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog.arquivo) {
                  handleDelete(deleteDialog.arquivo);
                }
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Excluindo...
                </>
              ) : (
                <>
                  <IconTrash className="w-4 h-4 mr-2" />
                  Excluir Arquivo
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}