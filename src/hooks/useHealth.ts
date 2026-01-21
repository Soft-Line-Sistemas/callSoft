import { useQuery } from '@tanstack/react-query';
import { healthApi } from '@/services';
import type { HealthCheckResponse, HealthMetrics, LivenessResponse } from '@/types/health.types';

// React Query hooks for backend health endpoints.
export const useHealth = (options?: { enabled?: boolean; refetchInterval?: number }) => {
  return useQuery<HealthCheckResponse>({
    queryKey: ['health'],
    queryFn: healthApi.check,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval ?? 30000,
    retry: 3,
    retryDelay: 1000,
    staleTime: 10000,
  });
};

export const useHealthLiveness = (options?: { enabled?: boolean }) => {
  return useQuery<LivenessResponse>({
    queryKey: ['health', 'liveness'],
    queryFn: healthApi.liveness,
    enabled: options?.enabled ?? true,
    refetchInterval: 60000,
    retry: 2,
  });
};

export const useHealthMetrics = (options?: { enabled?: boolean }) => {
  return useQuery<HealthMetrics>({
    queryKey: ['health', 'metrics'],
    queryFn: healthApi.metrics,
    enabled: options?.enabled ?? false,
    refetchInterval: 5000,
  });
};
