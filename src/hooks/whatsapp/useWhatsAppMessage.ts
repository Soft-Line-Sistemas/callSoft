import { useQuery } from '@tanstack/react-query';
import { whatsappApi } from '@/services/whatsapp.service';
import type { WhatsAppMessage } from '@/types/whatsapp.types';

export const useWhatsAppMessage = (id: string) => {
  return useQuery<WhatsAppMessage>({
    queryKey: ['whatsapp', 'messages', id],
    queryFn: () => whatsappApi.getMessageById(id),
    enabled: Boolean(id),
    staleTime: 1000 * 30,
  });
};

