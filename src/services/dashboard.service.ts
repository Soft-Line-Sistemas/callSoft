import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api.types';
import type {
  DashboardExportParams,
  DashboardMetrics,
  DashboardSummaryParams,
} from '@/types/dashboard.types';

export const dashboardApi = {
  /**
   * Fetch dashboard summary metrics (cotacoes, fornecedores, and period comparison when enabled).
   * @param params Period and optional filters.
   * @returns Dashboard metrics payload.
   */
  getSummary: async (params: DashboardSummaryParams): Promise<DashboardMetrics> => {
    const response = await api.get<ApiResponse<DashboardMetrics>>('/api/v1/dashboard/summary', {
      params,
    });
    return response.data.data!;
  },

  /**
   * Export dashboard report in CSV, Excel or PDF format.
   * @param params Export format and filtering parameters.
   * @returns Blob with the exported file content.
   */
  exportReport: async (params: DashboardExportParams): Promise<Blob> => {
    const response = await api.get('/api/v1/dashboard/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
