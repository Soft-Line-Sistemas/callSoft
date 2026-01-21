import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cotacoesApi } from '@/services/cotacoes.service';
import type { ChangeCotacaoStatusRequest, Cotacao } from '@/types/cotacao.types';

interface ChangeCotacaoStatusVariables {
  id: string;
  data: ChangeCotacaoStatusRequest;
  ticketId?: string;
}

export const useChangeCotacaoStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<Cotacao, Error, ChangeCotacaoStatusVariables>({
    mutationFn: ({ id, data }) => cotacoesApi.changeStatus(id, data),
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

