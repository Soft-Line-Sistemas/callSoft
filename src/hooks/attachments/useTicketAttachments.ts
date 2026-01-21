import { useQuery } from '@tanstack/react-query';
import { attachmentsApi } from '@/services/attachments.service';
import type { Attachment } from '@/types/attachment.types';

export const useTicketAttachments = (ticketId?: string) => {
  return useQuery<Attachment[]>({
    queryKey: ['tickets', ticketId, 'attachments'],
    queryFn: () => attachmentsApi.list(ticketId!),
    enabled: Boolean(ticketId),
    staleTime: 1000 * 60,
  });
};

