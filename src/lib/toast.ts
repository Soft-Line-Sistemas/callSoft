import { useNotificationStore } from '@/store/notificationStore';

/**
 * Toast utility for displaying temporary notifications
 * Uses the notification store but specifically for toast messages
 */
export const toast = {
  success: (message: string, title = 'Sucesso') => {
    useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'success',
      category: 'system',
      showToast: true,
    });
  },

  error: (message: string, title = 'Erro') => {
    useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'error',
      category: 'system',
      showToast: true,
    });
  },

  warning: (message: string, title = 'Atenção') => {
    useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'warning',
      category: 'system',
      showToast: true,
    });
  },

  info: (message: string, title = 'Informação') => {
    useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'info',
      category: 'system',
      showToast: true,
    });
  },
};
