import { describe, expect, it, vi } from 'vitest';
import { whatsappApi } from '../whatsapp.service';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('whatsappApi', () => {
  it('listMessages maps notifications to WhatsAppMessage', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          page: 1,
          pageSize: 10,
          total: 1,
          items: [
            {
              id: 'n1',
              recipient: '5511999999999',
              message: 'Hello',
              status: 'SENT',
              provider: 'whatsapp-web.js',
              providerRef: 'ref',
              error: null,
              createdAt: '2025-01-01T00:00:00.000Z',
              sentAt: '2025-01-01T00:01:00.000Z',
            },
          ],
        },
      },
    };

    vi.mocked(api.get).mockResolvedValue(mockResponse as any);

    const result = await whatsappApi.listMessages({ page: 1, pageSize: 10 });

    expect(api.get).toHaveBeenCalledWith('/api/v1/whatsapp/messages', {
      params: { page: 1, pageSize: 10, channel: 'WHATSAPP' },
    });

    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.pages).toBe(1);
    expect(result.items[0]).toMatchObject({
      id: 'n1',
      to: '5511999999999',
      message: 'Hello',
      status: 'SENT',
    });
  });
});

