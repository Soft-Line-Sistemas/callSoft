export type NotificationCategory = 'users' | 'system' | 'security' | 'financial' | 'tickets';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  total: number;
  page: number;
  pageSize: number;
  unreadCount: number;
}

export type NotificationPreferences = Record<NotificationCategory, boolean>;
