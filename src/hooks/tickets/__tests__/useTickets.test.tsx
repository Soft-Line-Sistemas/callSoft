import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTickets } from '../useTickets';
import { ticketsApi } from '@/services/tickets.service';

vi.mock('@/services/tickets.service', () => ({
  ticketsApi: {
    list: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: any) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useTickets', () => {
  it('fetches tickets', async () => {
    const mockData = {
      items: [{ id: '1', nome: 'Test', telefone: '', descricaoSolicitacao: '', origem: 'WEB', status: 'ABERTO', tenantId: '', createdAt: '', updatedAt: '' }],
      total: 1,
      page: 1,
      pageSize: 10,
      pages: 1,
    };

    vi.mocked(ticketsApi.list).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useTickets({ page: 1, pageSize: 10 }), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });
});
