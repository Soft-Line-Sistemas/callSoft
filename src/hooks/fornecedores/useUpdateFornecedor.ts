import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fornecedoresApi } from '@/services/fornecedores.service';
import type { Fornecedor, UpdateFornecedorRequest } from '@/types/fornecedor.types';

interface UpdateFornecedorVariables {
  id: string;
  data: UpdateFornecedorRequest;
}

export const useUpdateFornecedor = () => {
  const queryClient = useQueryClient();

  return useMutation<Fornecedor, Error, UpdateFornecedorVariables>({
    mutationFn: ({ id, data }) => fornecedoresApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
      queryClient.invalidateQueries({ queryKey: ['fornecedores', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['fornecedores', variables.id, 'stats'] });
    },
  });
};

