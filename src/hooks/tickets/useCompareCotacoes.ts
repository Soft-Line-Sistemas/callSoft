import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '@/services/tickets.service';
import type { Cotacao } from '@/types/cotacao.types';
import type { CompareCotacoesParams } from '@/types/ticket.types';

interface UseCompareCotacoesOptions {
  enabled?: boolean;
}

// Compare cotacoes for a ticket, optionally applying backend sorting rules.
export const useCompareCotacoes = (
  ticketId?: string,
  params?: CompareCotacoesParams,
  options?: UseCompareCotacoesOptions
) => {
  return useQuery<Cotacao[]>({
    queryKey: ['tickets', ticketId, 'cotacoes', 'compare', params ?? null],
    queryFn: () => ticketsApi.compareCotacoes(ticketId!, params ?? {}),
    enabled: options?.enabled ?? Boolean(ticketId),
    staleTime: 1000 * 60,
  });
};
