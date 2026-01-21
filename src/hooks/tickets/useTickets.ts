import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ticketsApi } from '@/services/tickets.service';
import type { PaginatedResponse } from '@/types/api.types';
import type { Ticket, TicketListFilters } from '@/types/ticket.types';

// Fetches tickets with pagination/filter support and caches per filter combination.
export const useTickets = (filters: TicketListFilters = {}) => {
  return useQuery<PaginatedResponse<Ticket>>({
    queryKey: ['tickets', filters],
    queryFn: () => ticketsApi.list(filters),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });
};
