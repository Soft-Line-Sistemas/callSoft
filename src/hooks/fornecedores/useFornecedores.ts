import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fornecedoresApi } from '@/services/fornecedores.service';
import type { PaginatedResponse } from '@/types/api.types';
import type { Fornecedor, FornecedorListFilters } from '@/types/fornecedor.types';

export const useFornecedores = (filters: FornecedorListFilters = {}) => {
  return useQuery<PaginatedResponse<Fornecedor>>({
    queryKey: ['fornecedores', filters],
    queryFn: () => fornecedoresApi.list(filters),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });
};

