import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/services';
import { clearAuthToken } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/store/authStore';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuthToken();
      clearAuth();
      queryClient.clear();
      toast.info('Sessão encerrada.');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erro ao sair da conta.';
      toast.error(message);
    },
  });
};
