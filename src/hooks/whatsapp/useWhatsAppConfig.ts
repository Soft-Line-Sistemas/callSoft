import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { whatsappConfigApi } from '@/services/whatsapp-config.service';
import type { WhatsappBotConfig } from '@/types/whatsapp-config.types';

export const useWhatsAppConfig = () => {
  return useQuery<WhatsappBotConfig>({
    queryKey: ['whatsapp', 'config'],
    queryFn: () => whatsappConfigApi.getConfig(),
    staleTime: 1000 * 30,
  });
};

export const useUpdateWhatsAppConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: WhatsappBotConfig) => whatsappConfigApi.updateConfig(config),
    onSuccess: (data) => {
      queryClient.setQueryData(['whatsapp', 'config'], data);
    },
  });
};
