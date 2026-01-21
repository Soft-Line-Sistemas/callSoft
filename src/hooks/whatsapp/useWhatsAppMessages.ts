import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { whatsappApi } from '@/services/whatsapp.service';
import type { PaginatedResponse } from '@/types/api.types';
import type { WhatsAppMessage, WhatsAppMessageListFilters } from '@/types/whatsapp.types';

export const useWhatsAppMessages = (filters: WhatsAppMessageListFilters = {}) => {
  return useQuery<PaginatedResponse<WhatsAppMessage>>({
    queryKey: ['whatsapp', 'messages', filters],
    queryFn: () => whatsappApi.listMessages(filters),
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData,
  });
};

