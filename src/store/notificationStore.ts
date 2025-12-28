import { create } from 'zustand';
import { notificationsApi } from '@/services/notifications.service';
import { getAuthToken } from '@/lib/auth';
import type {
  NotificationCategory,
  NotificationType,
  NotificationItem,
  NotificationPreferences,
} from '@/types/notification.types';

export type { NotificationCategory, NotificationType };

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  read: boolean;
  timestamp: Date;
  showToast?: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  hasLoaded: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  loadPreferences: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  hideToast: (id: string) => void;
  clearAll: () => Promise<void>;
  togglePreference: (category: NotificationCategory) => Promise<void>;
}

const defaultPreferences: NotificationPreferences = {
  users: true,
  system: true,
  security: true,
  financial: true,
  tickets: true,
};

const mapNotification = (item: NotificationItem): Notification => ({
  id: item.id,
  title: item.title,
  message: item.message,
  type: item.type,
  category: item.category,
  read: item.read,
  timestamp: new Date(item.createdAt),
  showToast: false,
});

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  preferences: defaultPreferences,
  hasLoaded: false,
  isLoading: false,
  initialize: async () => {
    const { hasLoaded, isLoading } = get();
    if (hasLoaded || isLoading) return;
    if (!getAuthToken()) {
      set({ hasLoaded: true });
      return;
    }
    set({ isLoading: true });
    try {
      await Promise.all([get().loadPreferences(), get().loadNotifications()]);
      set({ hasLoaded: true });
    } finally {
      set({ isLoading: false });
    }
  },
  loadNotifications: async () => {
    if (!getAuthToken()) {
      return;
    }
    try {
      const data = await notificationsApi.list({ page: 1, pageSize: 50 });
      set({
        notifications: data.items.map(mapNotification),
        unreadCount: data.unreadCount,
      });
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  },
  loadPreferences: async () => {
    if (!getAuthToken()) {
      return;
    }
    try {
      const preferences = await notificationsApi.getPreferences();
      set({ preferences });
    } catch (error) {
      console.error('Failed to load notification preferences', error);
    }
  },
  addNotification: async (data) => {
    const { preferences } = get();
    if (!preferences[data.category]) {
      return;
    }
    try {
      if (getAuthToken()) {
        const created = await notificationsApi.create({
          category: data.category,
          type: data.type,
          title: data.title,
          message: data.message,
        });
        set((state) => ({
          notifications: [
            { ...mapNotification(created), showToast: true },
            ...state.notifications,
          ],
          unreadCount: state.unreadCount + 1,
        }));
        return;
      }
      set((state) => ({
        notifications: [
          {
            id: Math.random().toString(36).substring(7),
            ...data,
            read: false,
            timestamp: new Date(),
            showToast: true,
          },
          ...state.notifications,
        ],
        unreadCount: state.unreadCount + 1,
      }));
    } catch (error) {
      console.error('Failed to create notification', error);
      set((state) => ({
        notifications: [
          {
            id: Math.random().toString(36).substring(7),
            ...data,
            read: false,
            timestamp: new Date(),
            showToast: true,
          },
          ...state.notifications,
        ],
        unreadCount: state.unreadCount + 1,
      }));
    }
  },
  markAsRead: async (id) => {
    try {
      if (getAuthToken()) {
        await notificationsApi.markAsRead(id);
      }
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    });
  },
  markAllAsRead: async () => {
    try {
      if (getAuthToken()) {
        await notificationsApi.markAllAsRead();
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },
  removeNotification: async (id) => {
    try {
      if (getAuthToken()) {
        await notificationsApi.remove(id);
      }
    } catch (error) {
      console.error('Failed to remove notification', error);
    }
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id);
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    });
  },
  hideToast: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, showToast: false } : n
      ),
    })),
  clearAll: async () => {
    try {
      if (getAuthToken()) {
        await notificationsApi.clear();
      }
    } catch (error) {
      console.error('Failed to clear notifications', error);
    }
    set({ notifications: [], unreadCount: 0 });
  },
  togglePreference: async (category) => {
    const { preferences } = get();
    const next = !preferences[category];
    try {
      if (getAuthToken()) {
        const updated = await notificationsApi.setPreference(category, next);
        set({ preferences: updated });
      }
    } catch (error) {
      console.error('Failed to update notification preference', error);
    }
  },
}));
