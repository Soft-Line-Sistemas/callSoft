import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTicketMetrics } from '../useTicketMetrics';
import { metricsApi } from '@/services/metrics.service';

vi.mock('@/services/metrics.service', () => ({
  metricsApi: {
    getTicketMetrics: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: any) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useTicketMetrics', () => {
  it('fetches ticket metrics', async () => {
    const mockData = {
      statusCounts: {
        SOLICITADO: 1,
        PENDENTE_ATENDIMENTO: 0,
        EM_ATENDIMENTO: 0,
        CONCLUIDO: 0,
        CANCELADO: 0,
      },
      volumeByDate: [{ date: '2025-01-01', total: 1 }],
      averageTimeToFirstAttendanceMinutes: 10,
      averageTimeInStatusMinutes: {
        SOLICITADO: 5,
        PENDENTE_ATENDIMENTO: 0,
        EM_ATENDIMENTO: 0,
        CONCLUIDO: 0,
        CANCELADO: 0,
      },
      technical: { averageResponseTimeMs: 123, failuresPerMinute: 0 },
    };

    vi.mocked(metricsApi.getTicketMetrics).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useTicketMetrics({}), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });
});
