import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '@/services/tickets.service';
import type { Cotacao } from '@/types/cotacao.types';

// Fetch all cotacoes linked to a ticket.
export const useTicketCotacoes = (ticketId?: string) => {
  return useQuery<Cotacao[]>({
    queryKey: ['tickets', ticketId, 'cotacoes'],
    queryFn: () => ticketsApi.getCotacoes(ticketId!),
    enabled: Boolean(ticketId),
    staleTime: 1000 * 60,
  });
};
