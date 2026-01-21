import { useMutation, useQueryClient } from '@tanstack/react-query';
import { whatsappApi } from '@/services/whatsapp.service';

export const useDisconnectWhatsApp = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error>({
    mutationFn: () => whatsappApi.disconnect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'qr'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['health'] });
    },
  });
};
