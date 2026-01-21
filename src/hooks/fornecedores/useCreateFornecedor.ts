import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fornecedoresApi } from '@/services/fornecedores.service';
import type { CreateFornecedorRequest, Fornecedor } from '@/types/fornecedor.types';

export const useCreateFornecedor = () => {
  const queryClient = useQueryClient();

  return useMutation<Fornecedor, Error, CreateFornecedorRequest>({
    mutationFn: (payload) => fornecedoresApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
    },
  });
};

