import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api.types';

export interface RoleSummary {
  id: string;
  name: string;
  permissions: string[];
}

export const rolesApi = {
  list: async (): Promise<RoleSummary[]> => {
    const response = await api.get<ApiResponse<RoleSummary[]>>('/api/v1/roles');
    return response.data.data ?? [];
  },
  listPermissions: async (): Promise<string[]> => {
    const response = await api.get<ApiResponse<string[]>>('/api/v1/roles/permissions');
    return response.data.data ?? [];
  },
  create: async (payload: { name: string; permissions?: string[] }): Promise<RoleSummary> => {
    const response = await api.post<ApiResponse<RoleSummary>>('/api/v1/roles', payload);
    return response.data.data!;
  },
  update: async (roleId: string, payload: { name?: string; permissions?: string[] }): Promise<RoleSummary> => {
    const response = await api.put<ApiResponse<RoleSummary>>(`/api/v1/roles/${roleId}`, payload);
    return response.data.data!;
  },
  remove: async (roleId: string): Promise<{ id: string }> => {
    const response = await api.delete<ApiResponse<{ id: string }>>(`/api/v1/roles/${roleId}`);
    return response.data.data!;
  },
};
