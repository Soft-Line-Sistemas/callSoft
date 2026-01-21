import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { metricsApi } from '@/services/metrics.service';
import type { TicketMetricsFilters, TicketMetricsResult } from '@/types/metrics.types';

export const useTicketMetrics = (filters: TicketMetricsFilters = {}) => {
  return useQuery<TicketMetricsResult>({
    queryKey: ['metrics', 'tickets', filters],
    queryFn: () => metricsApi.getTicketMetrics(filters),
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData,
  });
};

