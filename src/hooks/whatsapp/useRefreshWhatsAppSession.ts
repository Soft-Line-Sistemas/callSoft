import { useMutation, useQueryClient } from '@tanstack/react-query';
import { whatsappApi } from '@/services/whatsapp.service';
import type { QRCodeResponse } from '@/types/whatsapp.types';

export const useRefreshWhatsAppSession = () => {
  const queryClient = useQueryClient();

  return useMutation<QRCodeResponse, Error>({
    mutationFn: () => whatsappApi.getQrStatus({ refresh: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'qr'] });
    },
  });
};

