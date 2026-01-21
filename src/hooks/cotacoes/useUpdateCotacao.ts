import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cotacoesApi } from '@/services/cotacoes.service';
import type { Cotacao, UpdateCotacaoRequest } from '@/types/cotacao.types';

interface UpdateCotacaoVariables {
  id: string;
  data: UpdateCotacaoRequest;
  ticketId?: string;
}

export const useUpdateCotacao = () => {
  const queryClient = useQueryClient();

  return useMutation<Cotacao, Error, UpdateCotacaoVariables>({
    mutationFn: ({ id, data }) => cotacoesApi.update(id, data),
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

