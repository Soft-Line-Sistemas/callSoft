import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWhatsAppMessages } from '../useWhatsAppMessages';
import { whatsappApi } from '@/services/whatsapp.service';

vi.mock('@/services/whatsapp.service', () => ({
  whatsappApi: {
    listMessages: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: any) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useWhatsAppMessages', () => {
  it('fetches WhatsApp messages', async () => {
    const mockData = {
      items: [
        { id: 'n1', to: '5511999999999', message: 'Hello', status: 'SENT', createdAt: '2025-01-01T00:00:00.000Z' },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      pages: 1,
    };

    vi.mocked(whatsappApi.listMessages).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useWhatsAppMessages({ page: 1, pageSize: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });
});
