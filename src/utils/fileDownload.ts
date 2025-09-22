import { toast } from "sonner";
import { downloadArquivoContrato } from "@/lib/api";

/**
 * Utilitário para download seguro de arquivos de contratos
 */
export class FileDownloadUtil {

  /**
   * Faz download de um arquivo de contrato
   */
  static async downloadContractFile(
    contratoId: number,
    arquivoId: number,
    fileName: string,
    showToasts: boolean = true
  ): Promise<boolean> {
    try {
      if (showToasts) {
        toast.loading("Preparando download...", { id: `download-${arquivoId}` });
      }

      console.log("📥 Iniciando download:", { contratoId, arquivoId, fileName });

      const blob = await downloadArquivoContrato(contratoId, arquivoId);

      // Criar URL temporária para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;

      // Adicionar ao DOM temporariamente
      document.body.appendChild(link);
      link.click();

      // Limpeza
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      if (showToasts) {
        toast.success("Download concluído!", { id: `download-${arquivoId}` });
      }

      console.log("✅ Download concluído com sucesso");
      return true;

    } catch (error: any) {
      console.error("❌ Erro no download:", error);

      if (showToasts) {
        toast.error(
          error.message || "Erro ao fazer download do arquivo",
          { id: `download-${arquivoId}` }
        );
      }

      return false;
    }
  }

  /**
   * Faz download múltiplo de arquivos (em sequência para evitar sobrecarga)
   */
  static async downloadMultipleFiles(
    contratoId: number,
    arquivos: Array<{ id: number; nome: string }>,
    delay: number = 1000
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    toast.loading(`Iniciando download de ${arquivos.length} arquivos...`, {
      id: 'bulk-download'
    });

    for (const arquivo of arquivos) {
      const result = await this.downloadContractFile(
        contratoId,
        arquivo.id,
        arquivo.nome,
        false // Não mostrar toast individual
      );

      if (result) {
        success++;
      } else {
        failed++;
      }

      // Aguardar entre downloads para não sobrecarregar
      if (delay > 0 && arquivo !== arquivos[arquivos.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Toast final com resultado
    if (failed === 0) {
      toast.success(`${success} arquivos baixados com sucesso!`, {
        id: 'bulk-download'
      });
    } else if (success === 0) {
      toast.error(`Falha ao baixar todos os ${failed} arquivos`, {
        id: 'bulk-download'
      });
    } else {
      toast.warning(`${success} arquivos baixados, ${failed} falharam`, {
        id: 'bulk-download'
      });
    }

    return { success, failed };
  }

  /**
   * Formatar tamanho de arquivo em formato legível
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Obter extensão de arquivo a partir do nome
   */
  static getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * Verificar se o tipo de arquivo é suportado para visualização
   */
  static isViewableFile(fileName: string): boolean {
    const extension = this.getFileExtension(fileName);
    const viewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt'];
    return viewableExtensions.includes(extension);
  }

  /**
   * Verificar se o arquivo é uma imagem
   */
  static isImageFile(fileName: string): boolean {
    const extension = this.getFileExtension(fileName);
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    return imageExtensions.includes(extension);
  }

  /**
   * Verificar se o arquivo é um documento
   */
  static isDocumentFile(fileName: string): boolean {
    const extension = this.getFileExtension(fileName);
    const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
    return documentExtensions.includes(extension);
  }

  /**
   * Obter cor temática baseada no tipo de arquivo
   */
  static getFileTypeColor(fileName: string): string {
    const extension = this.getFileExtension(fileName);

    switch (extension) {
      case 'pdf':
        return 'text-red-600';
      case 'doc':
      case 'docx':
        return 'text-blue-600';
      case 'xls':
      case 'xlsx':
        return 'text-green-600';
      case 'ppt':
      case 'pptx':
        return 'text-orange-600';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'text-purple-600';
      case 'txt':
        return 'text-gray-600';
      default:
        return 'text-gray-500';
    }
  }

  /**
   * Validar arquivo antes do upload
   */
  static validateFile(
    file: File,
    maxSize: number = 10 * 1024 * 1024, // 10MB por padrão
    allowedTypes: string[] = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png']
  ): { valid: boolean; error?: string } {

    // Verificar tamanho
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${this.formatFileSize(maxSize)}`
      };
    }

    // Verificar tipo
    const extension = this.getFileExtension(file.name);
    if (!allowedTypes.includes(extension)) {
      return {
        valid: false,
        error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ').toUpperCase()}`
      };
    }

    return { valid: true };
  }
}