import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api.types';
import type { HealthCheckResponse, HealthMetrics, LivenessResponse } from '@/types/health.types';

export const healthApi = {
  check: async (): Promise<HealthCheckResponse> => {
    const response = await api.get<ApiResponse<HealthCheckResponse>>('/health');
    return response.data.data!;
  },

  liveness: async (): Promise<LivenessResponse> => {
    const response = await api.get<LivenessResponse>('/health/liveness');
    return response.data;
  },

  metrics: async (): Promise<HealthMetrics> => {
    const response = await api.get<ApiResponse<HealthMetrics>>('/health/metrics');
    return response.data.data!;
  },
};
