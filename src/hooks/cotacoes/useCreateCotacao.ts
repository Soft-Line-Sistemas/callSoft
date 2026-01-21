import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cotacoesApi } from '@/services/cotacoes.service';
import type { Cotacao, CreateCotacaoRequest } from '@/types/cotacao.types';

export const useCreateCotacao = () => {
  const queryClient = useQueryClient();

  return useMutation<Cotacao, Error, CreateCotacaoRequest>({
    mutationFn: (payload) => cotacoesApi.create(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cotacoes'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.ticketId, 'cotacoes'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.ticketId, 'cotacoes', 'compare'] });
    },
  });
};

