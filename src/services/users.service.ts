import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api.types';

export interface UserSummary {
  id: string;
  email: string;
  roles: string[];
}

export interface UserListResponse {
  items: UserSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export const usersApi = {
  list: async (params?: { page?: number; pageSize?: number; search?: string }): Promise<UserListResponse> => {
    const response = await api.get<ApiResponse<UserListResponse>>('/api/v1/users', {
      params,
    });
    return response.data.data ?? { items: [], total: 0, page: 1, pageSize: 20 };
  },
  updateRoles: async (userId: string, roleIds: string[]): Promise<{ userId: string; roleIds: string[] }> => {
    const response = await api.put<ApiResponse<{ userId: string; roleIds: string[] }>>(
      `/api/v1/users/${userId}/roles`,
      { roleIds },
    );
    return response.data.data!;
  },
};
