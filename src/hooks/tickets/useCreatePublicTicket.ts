import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '@/services/tickets.service';
import type { CreatePublicTicketRequest, Ticket } from '@/types/ticket.types';

// Mutation hook for public ticket creation with cache invalidation on success.
export const useCreatePublicTicket = () => {
  const queryClient = useQueryClient();

  return useMutation<Ticket, Error, CreatePublicTicketRequest>({
    mutationFn: (payload) => ticketsApi.createPublic(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};
