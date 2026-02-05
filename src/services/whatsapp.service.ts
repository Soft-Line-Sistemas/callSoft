import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type {
  QRCodeResponse,
  SendWhatsAppMessageRequest,
  SendWhatsAppMessageResult,
  WhatsAppMessage,
  WhatsAppMessageListFilters,
  WhatsAppMessageStatus,
} from '@/types/whatsapp.types';

type BackendNotificationStatus = WhatsAppMessageStatus;

interface BackendNotification {
  id: string;
  recipient: string;
  message: string;
  status: BackendNotificationStatus;
  provider?: string;
  providerRef?: string | null;
  error?: string | null;
  metadata?: unknown;
  createdAt: string;
  sentAt?: string | null;
}

interface BackendPaginatedNotifications {
  items: BackendNotification[];
  total: number;
  page: number;
  pageSize: number;
}

const mapNotificationToMessage = (notification: BackendNotification): WhatsAppMessage => ({
  id: notification.id,
  to: notification.recipient,
  message: notification.message,
  status: notification.status,
  provider: notification.provider,
  providerRef: notification.providerRef ?? null,
  sentAt: notification.sentAt ?? null,
  error: notification.error ?? null,
  metadata: notification.metadata,
  createdAt: notification.createdAt,
});

export const whatsappApi = {
  /**
   * Retrieve WhatsApp QR readiness and availability for the shared instance.
   * This endpoint is public and not wrapped in the standard ApiResponse envelope.
   */
  getQrStatus: async (params: { refresh?: boolean } = {}): Promise<QRCodeResponse> => {
    const response = await api.get<QRCodeResponse>('/api/v1/whatsapp/qr', {
      params: {
        ...(params.refresh ? { refresh: '1' } : {}),
        _ts: Date.now(),
      },
    });
    return response.data;
  },

  /**
   * Enqueue WhatsApp message sending (returns an array, one per recipient).
   */
  sendMessage: async (
    data: SendWhatsAppMessageRequest
  ): Promise<SendWhatsAppMessageResult[]> => {
    const response = await api.post<ApiResponse<SendWhatsAppMessageResult[]>>(
      '/api/v1/whatsapp/messages',
      data
    );
    return response.data.data!;
  },

  /**
   * List sent/queued WhatsApp notifications (paginated).
   */
  listMessages: async (
    filters: WhatsAppMessageListFilters = {}
  ): Promise<PaginatedResponse<WhatsAppMessage>> => {
    const response = await api.get<ApiResponse<BackendPaginatedNotifications>>(
      '/api/v1/whatsapp/messages',
      {
        params: {
          ...filters,
          channel: 'WHATSAPP',
        },
      }
    );

    const data = response.data.data!;

    return {
      items: data.items.map(mapNotificationToMessage),
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
      pages: data.pageSize > 0 ? Math.ceil(data.total / data.pageSize) : 0,
    };
  },

  /**
   * Fetch a single WhatsApp message by notification id.
   */
  getMessageById: async (id: string): Promise<WhatsAppMessage> => {
    const response = await api.get<ApiResponse<BackendNotification>>(
      `/api/v1/whatsapp/messages/${id}`
    );
    return mapNotificationToMessage(response.data.data!);
  },

  /**
   * Disconnect WhatsApp session and clear cache.
   */
  disconnect: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>(
      '/api/v1/whatsapp/disconnect'
    );
    return response.data;
  },
};
