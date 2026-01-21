import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '@/services/tickets.service';
import type { Ticket, TransitionTicketStatusRequest } from '@/types/ticket.types';

interface UpdateTicketStatusVariables {
  id: string;
  data: TransitionTicketStatusRequest;
}

// Mutation hook for transitioning ticket status with cache invalidation for list and detail queries.
export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<Ticket, Error, UpdateTicketStatusVariables>({
    mutationFn: ({ id, data }) => ticketsApi.transitionStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.id, 'cotacoes'] });
    },
  });
};
