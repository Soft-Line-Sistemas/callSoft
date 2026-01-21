import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { cotacoesApi } from '@/services/cotacoes.service';
import type { PaginatedResponse } from '@/types/api.types';
import type { Cotacao, CotacaoListFilters } from '@/types/cotacao.types';

export const useCotacoes = (filters: CotacaoListFilters = {}) => {
  return useQuery<PaginatedResponse<Cotacao>>({
    queryKey: ['cotacoes', filters],
    queryFn: () => cotacoesApi.list(filters),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });
};

