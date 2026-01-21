import { useQuery } from '@tanstack/react-query';
import { fornecedoresApi } from '@/services/fornecedores.service';
import type { FornecedorStats } from '@/types/fornecedor.types';

export const useFornecedorStats = (id?: string) => {
  return useQuery<FornecedorStats>({
    queryKey: ['fornecedores', id, 'stats'],
    queryFn: () => fornecedoresApi.getStats(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
  });
};

