import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/services';
import { toast } from '@/lib/toast';
import type { RegisterRequest } from '@/types/auth.types';

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success('Cadastro realizado com sucesso.');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erro ao realizar cadastro.';
      toast.error(message);
    },
  });
};
