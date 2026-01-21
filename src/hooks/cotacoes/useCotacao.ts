import { useQuery } from '@tanstack/react-query';
import { cotacoesApi } from '@/services/cotacoes.service';
import type { Cotacao } from '@/types/cotacao.types';

export const useCotacao = (id?: string) => {
  return useQuery<Cotacao>({
    queryKey: ['cotacoes', id],
    queryFn: () => cotacoesApi.getById(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
  });
};

