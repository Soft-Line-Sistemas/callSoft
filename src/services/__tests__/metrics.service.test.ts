import { describe, expect, it, vi } from 'vitest';
import { metricsApi } from '../metrics.service';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('metricsApi', () => {
  it('getTicketMetrics fetches metrics with filters', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
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
        },
      },
    };

    vi.mocked(api.get).mockResolvedValue(mockResponse as any);

    const result = await metricsApi.getTicketMetrics({
      from: '2025-01-01T00:00:00.000Z',
      to: '2025-01-02T00:00:00.000Z',
    });

    expect(api.get).toHaveBeenCalledWith('/api/v1/metrics/tickets', {
      params: {
        from: '2025-01-01T00:00:00.000Z',
        to: '2025-01-02T00:00:00.000Z',
      },
    });
    expect(result).toEqual(mockResponse.data.data);
  });
});

