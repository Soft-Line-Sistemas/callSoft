import { describe, expect, it, vi } from 'vitest';
import { authApi } from '../auth.service';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('authApi', () => {
  it('login posts credentials and returns payload', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          token: 'jwt-token',
          user: { id: 'u1', name: 'Test User', email: 'test@example.com', role: 'admin', permissions: [], tenantId: 't1', createdAt: '' },
        },
      },
    };

    vi.mocked(api.post).mockResolvedValue(mockResponse as any);

    const result = await authApi.login({ email: 'test@example.com', password: 'secret', tenantId: 't1' });

    expect(api.post).toHaveBeenCalledWith('/api/v1/auth/login', {
      email: 'test@example.com',
      password: 'secret',
      tenantId: 't1',
    });
    expect(result).toEqual(mockResponse.data.data);
  });
});
