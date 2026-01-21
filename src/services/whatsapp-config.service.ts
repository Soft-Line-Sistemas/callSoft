import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api.types';
import type { WhatsappBotConfig } from '@/types/whatsapp-config.types';

export const whatsappConfigApi = {
  getConfig: async (): Promise<WhatsappBotConfig> => {
    const response = await api.get<ApiResponse<WhatsappBotConfig>>('/api/v1/whatsapp/config');
    return response.data.data!;
  },

  updateConfig: async (config: WhatsappBotConfig): Promise<WhatsappBotConfig> => {
    const response = await api.put<ApiResponse<WhatsappBotConfig>>('/api/v1/whatsapp/config', config);
    return response.data.data!;
  },
};
