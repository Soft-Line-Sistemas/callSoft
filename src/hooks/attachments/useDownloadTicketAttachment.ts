import { useMutation } from '@tanstack/react-query';
import { attachmentsApi } from '@/services/attachments.service';
import { downloadBlob } from '@/lib/download';

export interface DownloadTicketAttachmentParams {
  ticketId: string;
  attachmentId: string;
  filename?: string;
}

export const useDownloadTicketAttachment = () => {
  return useMutation<Blob, Error, DownloadTicketAttachmentParams>({
    mutationFn: ({ ticketId, attachmentId }) => attachmentsApi.download(ticketId, attachmentId),
    onSuccess: (blob, params) => {
      downloadBlob(blob, params.filename ?? `attachment-${params.attachmentId}`);
    },
  });
};
