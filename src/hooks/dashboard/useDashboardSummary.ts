import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard.service';
import type { DashboardMetrics, DashboardSummaryParams } from '@/types/dashboard.types';

export const useDashboardSummary = (params?: DashboardSummaryParams) => {
  return useQuery<DashboardMetrics>({
    queryKey: ['dashboard', 'summary', params],
    queryFn: () => dashboardApi.getSummary(params!),
    enabled: Boolean(params?.periodo),
    staleTime: 1000 * 60, // 1 minute
  });
};

