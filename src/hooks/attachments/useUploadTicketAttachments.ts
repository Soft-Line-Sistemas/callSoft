import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentsApi } from '@/services/attachments.service';
import type { Attachment } from '@/types/attachment.types';

export interface UploadTicketAttachmentsParams {
  ticketId: string;
  files: File[];
}

export const useUploadTicketAttachments = () => {
  const queryClient = useQueryClient();

  return useMutation<Attachment[], Error, UploadTicketAttachmentsParams>({
    mutationFn: ({ ticketId, files }) => attachmentsApi.upload(ticketId, files),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tickets', variables.ticketId, 'attachments'],
      });
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.ticketId] });
    },
  });
};

