'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import {
  useDownloadTicketAttachment,
  useTicketAttachments,
  useUploadTicketAttachments,
} from '@/hooks/attachments';
import { toast } from '@/lib/toast';
import { Download, Paperclip, RefreshCcw, Upload } from 'lucide-react';

const MAX_FILES = 10;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
};

export const TicketAttachmentsCard = ({ ticketId }: { ticketId: string }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [inputResetKey, setInputResetKey] = useState(0);

  const {
    data: attachments,
    isLoading,
    error,
    refetch,
  } = useTicketAttachments(ticketId);

  const uploadMutation = useUploadTicketAttachments();
  const downloadMutation = useDownloadTicketAttachment();

  const errorMessage = error instanceof Error ? error.message : 'Tente novamente.';

  const selectedFilesSummary = useMemo(() => {
    const totalBytes = selectedFiles.reduce((acc, file) => acc + file.size, 0);
    return { count: selectedFiles.length, totalBytes };
  }, [selectedFiles]);

  const handleFileSelection = (files: FileList | null) => {
    if (!files) {
      setSelectedFiles([]);
      return;
    }

    let nextFiles = Array.from(files);

    if (nextFiles.length > MAX_FILES) {
      toast.error(`Selecione no máximo ${MAX_FILES} arquivos por vez.`);
      nextFiles = nextFiles.slice(0, MAX_FILES);
    }

    const oversized = nextFiles.find((file) => file.size > MAX_FILE_SIZE_BYTES);
    if (oversized) {
      toast.error(`Arquivo muito grande: "${oversized.name}". Máximo: 10MB.`);
      nextFiles = nextFiles.filter((file) => file.size <= MAX_FILE_SIZE_BYTES);
    }

    setSelectedFiles(nextFiles);
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      toast.error('Selecione ao menos um arquivo.');
      return;
    }

    uploadMutation.mutate(
      { ticketId, files: selectedFiles },
      {
        onSuccess: (uploaded) => {
          toast.success(`${uploaded.length} anexo(s) enviado(s) com sucesso.`);
          setSelectedFiles([]);
          setInputResetKey((prev) => prev + 1);
        },
        onError: () => toast.error('Não foi possível enviar os anexos.'),
      }
    );
  };

  return (
    <Card variant="glass">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Paperclip className="h-5 w-5 text-slate-400" />
            <CardTitle className="text-white">Anexos</CardTitle>
          </div>

          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Atualizar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full space-y-2">
              <p className="text-sm text-slate-300">Enviar novos arquivos (Img, Vídeo, Doc, Txt - Máx 10MB)</p>
              <Input
                key={inputResetKey}
                type="file"
                multiple
                accept="image/*,video/*,application/pdf,text/plain,.csv,.doc,.docx,.xls,.xlsx"
                onChange={(event) => handleFileSelection(event.target.files)}
              />
              {selectedFilesSummary.count > 0 && (
                <p className="text-xs text-slate-400">
                  {selectedFilesSummary.count} arquivo(s) selecionado(s) •{' '}
                  {formatBytes(selectedFilesSummary.totalBytes)}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFiles([]);
                  setInputResetKey((prev) => prev + 1);
                }}
                disabled={selectedFiles.length === 0 || uploadMutation.isPending}
              >
                Limpar
              </Button>
              <Button
                variant="gradient"
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploadMutation.isPending}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadMutation.isPending ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-14 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-100">
            <p className="font-semibold">Não foi possível carregar os anexos.</p>
            <p className="text-red-200">{errorMessage}</p>
            <Button
              variant="link"
              className="mt-2 text-red-200"
              onClick={() => refetch()}
            >
              Tentar novamente
            </Button>
          </div>
        ) : !attachments || attachments.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum anexo disponível.</p>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="rounded-xl border border-white/5 bg-white/5 p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{attachment.originalName}</p>
                  <p className="text-xs text-slate-400">
                    {formatBytes(attachment.size)} •{' '}
                    {new Date(attachment.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadMutation.mutate(
                        {
                          ticketId,
                          attachmentId: attachment.id,
                          filename: attachment.originalName,
                        },
                        {
                          onError: () =>
                            toast.error('Não foi possível baixar o anexo.'),
                        }
                      )
                    }
                    disabled={downloadMutation.isPending}
                  >
                    <Download className="mr-2 h-4 w-4" /> Baixar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

