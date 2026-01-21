import { useMutation, useQueryClient } from '@tanstack/react-query';
import { whatsappApi } from '@/services/whatsapp.service';
import type { SendWhatsAppMessageRequest, SendWhatsAppMessageResult } from '@/types/whatsapp.types';

export const useSendWhatsAppMessage = () => {
  const queryClient = useQueryClient();

  return useMutation<SendWhatsAppMessageResult[], Error, SendWhatsAppMessageRequest>({
    mutationFn: (payload) => whatsappApi.sendMessage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'messages'] });
    },
  });
};

