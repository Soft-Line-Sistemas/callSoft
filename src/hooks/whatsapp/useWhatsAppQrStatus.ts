import { useQuery } from '@tanstack/react-query';
import { whatsappApi } from '@/services/whatsapp.service';
import type { QRCodeResponse } from '@/types/whatsapp.types';

export const useWhatsAppQrStatus = () => {
  return useQuery<QRCodeResponse>({
    queryKey: ['whatsapp', 'qr'],
    queryFn: () => whatsappApi.getQrStatus(),
    staleTime: 1000 * 5,
    refetchInterval: 1000 * 10,
  });
};

