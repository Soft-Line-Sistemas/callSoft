import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api.types';
import type {
  NotificationItem,
  NotificationListResponse,
  NotificationPreferences,
  NotificationType,
  NotificationCategory,
} from '@/types/notification.types';

export interface CreateNotificationRequest {
  category: NotificationCategory;
  type: NotificationType;
  title: string;
  message: string;
}

export const notificationsApi = {
  list: async (params: { page?: number; pageSize?: number; unreadOnly?: boolean } = {}) => {
    const response = await api.get<ApiResponse<NotificationListResponse>>('/api/v1/notifications', {
      params,
    });
    return response.data.data!;
  },

  create: async (payload: CreateNotificationRequest): Promise<NotificationItem> => {
    const response = await api.post<ApiResponse<NotificationItem>>('/api/v1/notifications', payload);
    return response.data.data!;
  },

  markAsRead: async (id: string) => {
    await api.patch<ApiResponse<{ id: string; read: boolean }>>(`/api/v1/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    await api.patch<ApiResponse<{ success: boolean }>>('/api/v1/notifications/read-all');
  },

  remove: async (id: string) => {
    await api.delete<ApiResponse<{ id: string }>>(`/api/v1/notifications/${id}`);
  },

  clear: async () => {
    await api.delete<ApiResponse<{ success: boolean }>>('/api/v1/notifications');
  },

  getPreferences: async (): Promise<NotificationPreferences> => {
    const response = await api.get<ApiResponse<NotificationPreferences>>(
      '/api/v1/notifications/preferences'
    );
    return response.data.data!;
  },

  updatePreferences: async (preferences: NotificationPreferences): Promise<NotificationPreferences> => {
    const response = await api.put<ApiResponse<NotificationPreferences>>(
      '/api/v1/notifications/preferences',
      preferences
    );
    return response.data.data!;
  },

  setPreference: async (
    category: NotificationCategory,
    enabled: boolean
  ): Promise<NotificationPreferences> => {
    const response = await api.patch<ApiResponse<NotificationPreferences>>(
      `/api/v1/notifications/preferences/${category}`,
      { enabled }
    );
    return response.data.data!;
  },
};
