import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/services';
import { setAuthToken } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/store/authStore';
import type { LoginRequest } from '@/types/auth.types';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      setAuthToken(data.token);
      setAuth(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success('Login realizado com sucesso.');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erro ao realizar login.';
      toast.error(message);
    },
  });
};
