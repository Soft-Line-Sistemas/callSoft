import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api.types';
import type { TicketMetricsFilters, TicketMetricsResult } from '@/types/metrics.types';

export const metricsApi = {
  /**
   * Get ticket metrics (authenticated).
   */
  getTicketMetrics: async (filters: TicketMetricsFilters = {}): Promise<TicketMetricsResult> => {
    const response = await api.get<ApiResponse<TicketMetricsResult>>('/api/v1/metrics/tickets', {
      params: filters,
    });
    return response.data.data!;
  },
};

