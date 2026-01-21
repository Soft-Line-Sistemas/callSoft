import { describe, expect, it, vi } from 'vitest';
import { ticketsApi } from '../tickets.service';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ticketsApi', () => {
  it('list fetches tickets with filters', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          items: [{ id: '1', nome: 'Test', telefone: '', descricaoSolicitacao: '', origem: 'WEB', status: 'ABERTO', tenantId: '', createdAt: '', updatedAt: '' }],
          total: 1,
          page: 1,
          pageSize: 10,
          pages: 1,
        },
      },
    };

    vi.mocked(api.get).mockResolvedValue(mockResponse as any);

    const result = await ticketsApi.list({ page: 1, pageSize: 10 });

    expect(api.get).toHaveBeenCalledWith('/api/v1/tickets', { params: { page: 1, pageSize: 10 } });
    expect(result).toEqual(mockResponse.data.data);
  });
});

