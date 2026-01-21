import { useQuery } from '@tanstack/react-query';
import { cotacoesApi } from '@/services/cotacoes.service';
import type { TrackingEvent } from '@/types/cotacao.types';

export const useCotacaoTracking = (cotacaoId?: string, options?: { enabled?: boolean }) => {
  return useQuery<TrackingEvent[]>({
    queryKey: ['cotacoes', cotacaoId, 'tracking'],
    queryFn: () => cotacoesApi.listTrackingEvents(cotacaoId!),
    enabled: options?.enabled ?? Boolean(cotacaoId),
    staleTime: 1000 * 30,
  });
};

