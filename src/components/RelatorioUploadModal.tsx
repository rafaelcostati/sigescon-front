import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  IconUpload,
  IconFile,
  IconX,
  IconCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import {
  submitRelatorio,
  type SubmitRelatorioPayload
} from "@/lib/api";

interface RelatorioUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contratoId: number;
  pendenciaId?: number;
  pendenciaTitulo?: string;
  onSuccess?: () => void;
}

export function RelatorioUploadModal({
  open,
  onOpenChange,
  contratoId,
  pendenciaId,
  pendenciaTitulo,
  onSuccess
}: RelatorioUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [observacoes, setObservacoes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tipos de arquivo aceitos
  const acceptedFileTypes = [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.png',
    '.jpg',
    '.jpeg'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamanho do arquivo
    if (file.size > maxFileSize) {
      toast.error("Arquivo muito grande. Tamanho máximo: 10MB");
      return;
    }

    // Validar tipo do arquivo
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFileTypes.includes(fileExtension)) {
      toast.error("Tipo de arquivo não suportado. Use: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG");
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      // Simular evento de seleção de arquivo
      if (file.size > maxFileSize) {
        toast.error("Arquivo muito grande. Tamanho máximo: 10MB");
        return;
      }

      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedFileTypes.includes(fileExtension)) {
        toast.error("Tipo de arquivo não suportado. Use: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG");
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Selecione um arquivo para enviar");
      return;
    }

    if (!pendenciaId) {
      toast.error("Erro: ID da pendência não encontrado");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Gerar mês de competência atual (formato YYYY-MM-DD)
      const now = new Date();
      const mesCompetencia = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

      const payload: SubmitRelatorioPayload = {
        arquivo: selectedFile,
        observacoes_fiscal: observacoes.trim() || "",
        mes_competencia: mesCompetencia,
        pendencia_id: pendenciaId!
      };

      console.log("📤 Enviando relatório:", {
        contratoId,
        filename: selectedFile.name,
        size: selectedFile.size,
        observacoes_fiscal: payload.observacoes_fiscal,
        mes_competencia: payload.mes_competencia,
        pendencia_id: payload.pendencia_id
      });

      const response = await submitRelatorio(contratoId, payload);

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log("✅ Relatório enviado com sucesso:", response);
      toast.success("Relatório enviado com sucesso!");

      // Aguardar um pouco para mostrar 100% de progresso
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
        onSuccess?.();
      }, 1000);

    } catch (error: any) {
      console.error("❌ Erro ao enviar relatório:", error);
      toast.error(error.message || "Erro ao enviar relatório. Tente novamente.");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setObservacoes("");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (isUploading) {
      toast.error("Upload em andamento. Aguarde a conclusão.");
      return;
    }
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconUpload className="w-5 h-5" />
            Enviar Relatório
          </DialogTitle>
          <DialogDescription>
            {pendenciaTitulo
              ? `Envie o relatório para: ${pendenciaTitulo}`
              : "Envie o relatório de fiscalização para este contrato"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Área de Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Arquivo do Relatório</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                selectedFile
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                ref={fileInputRef}
                type="file"
                id="file-upload"
                className="hidden"
                accept={acceptedFileTypes.join(',')}
                onChange={handleFileSelect}
                disabled={isUploading}
              />

              {selectedFile ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center text-green-600">
                    <IconCheck className="w-8 h-8" />
                  </div>
                  <div className="bg-white border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconFile className="w-5 h-5 text-blue-600" />
                        <div className="text-left">
                          <p className="font-medium text-sm">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeSelectedFile}
                        disabled={isUploading}
                      >
                        <IconX className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <IconUpload className="w-8 h-8 text-gray-400 mx-auto" />
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      Escolher Arquivo
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      ou arraste e solte aqui
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG (máx. 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              placeholder="Adicione observações ou detalhes sobre o relatório..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              disabled={isUploading}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              {observacoes.length}/500 caracteres
            </p>
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Enviando relatório...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Aviso sobre reenvio */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex gap-2">
              <IconAlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Sobre reenvios:</p>
                <p>Se você já enviou um relatório para esta pendência, este novo arquivo substituirá o anterior.</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <IconUpload className="w-4 h-4 mr-2" />
                Enviar Relatório
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}