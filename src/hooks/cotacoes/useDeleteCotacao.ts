import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cotacoesApi } from '@/services/cotacoes.service';

interface DeleteCotacaoVariables {
  id: string;
  ticketId?: string;
}

export const useDeleteCotacao = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteCotacaoVariables>({
    mutationFn: ({ id }) => cotacoesApi.delete(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cotacoes'] });

      if (variables.ticketId) {
        queryClient.invalidateQueries({ queryKey: ['tickets', variables.ticketId, 'cotacoes'] });
        queryClient.invalidateQueries({ queryKey: ['tickets', variables.ticketId, 'cotacoes', 'compare'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
      }
    },
  });
};

