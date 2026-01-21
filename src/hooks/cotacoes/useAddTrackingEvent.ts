import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cotacoesApi } from '@/services/cotacoes.service';
import type { AddTrackingEventRequest, TrackingEvent } from '@/types/cotacao.types';

interface AddTrackingEventVariables {
  id: string;
  data: AddTrackingEventRequest;
}

export const useAddTrackingEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<TrackingEvent, Error, AddTrackingEventVariables>({
    mutationFn: ({ id, data }) => cotacoesApi.addTrackingEvent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cotacoes', variables.id, 'tracking'] });
    },
  });
};

