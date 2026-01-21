import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cotacoesApi } from '@/services/cotacoes.service';
import type { Cotacao } from '@/types/cotacao.types';

interface ConfirmReceiptVariables {
  id: string;
  ticketId?: string;
}

export const useConfirmReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation<Cotacao, Error, ConfirmReceiptVariables>({
    mutationFn: ({ id }) => cotacoesApi.confirmReceipt(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cotacoes'] });
      queryClient.invalidateQueries({ queryKey: ['cotacoes', variables.id] });

      if (variables.ticketId) {
        queryClient.invalidateQueries({ queryKey: ['tickets', variables.ticketId, 'cotacoes'] });
        queryClient.invalidateQueries({ queryKey: ['tickets', variables.ticketId, 'cotacoes', 'compare'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
      }
    },
  });
};

