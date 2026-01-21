import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '@/services/tickets.service';
import type { Ticket } from '@/types/ticket.types';

// Retrieve ticket details by id and cache results independently per ticket.
export const useTicket = (id?: string) => {
  return useQuery<Ticket>({
    queryKey: ['tickets', id],
    queryFn: () => ticketsApi.getById(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
  });
};
