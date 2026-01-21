import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/services';
import { toast } from '@/lib/toast';
import type {
  PasswordResetConfirmRequest,
  PasswordResetRequestRequest,
} from '@/types/auth.types';

export const usePasswordReset = () => {
  const requestReset = useMutation({
    mutationFn: (data: PasswordResetRequestRequest) => authApi.requestPasswordReset(data),
    onSuccess: () => toast.success('Solicitação de redefinição enviada.'),
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erro ao solicitar redefinição de senha.';
      toast.error(message);
    },
  });

  const confirmReset = useMutation({
    mutationFn: (data: PasswordResetConfirmRequest) => authApi.confirmPasswordReset(data),
    onSuccess: () => toast.success('Senha redefinida com sucesso.'),
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erro ao redefinir senha.';
      toast.error(message);
    },
  });

  return { requestReset, confirmReset };
};
