import { useQuery } from '@tanstack/react-query';
import { fornecedoresApi } from '@/services/fornecedores.service';
import type { Fornecedor } from '@/types/fornecedor.types';

export const useFornecedor = (id?: string) => {
  return useQuery<Fornecedor>({
    queryKey: ['fornecedores', id],
    queryFn: () => fornecedoresApi.getById(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
  });
};

