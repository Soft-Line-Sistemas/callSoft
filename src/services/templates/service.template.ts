/**
 * Service template - copy this file when creating a new module service.
 * Replace "example" identifiers, endpoints, and types with the target module.
 */
import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types';

interface ExampleEntity {
  id: string;
  name: string;
  createdAt: string;
}

interface ExampleFilters extends PaginationParams {
  search?: string;
  status?: string;
}

interface CreateExampleRequest {
  name: string;
}

interface UpdateExampleRequest {
  name?: string;
}

export const exampleApiTemplate = {
  list: async (
    filters: ExampleFilters = {}
  ): Promise<PaginatedResponse<ExampleEntity>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<ExampleEntity>>>(
      '/api/v1/examples',
      { params: filters }
    );
    return response.data.data!;
  },

  getById: async (id: string): Promise<ExampleEntity> => {
    const response = await api.get<ApiResponse<ExampleEntity>>(`/api/v1/examples/${id}`);
    return response.data.data!;
  },

  create: async (data: CreateExampleRequest): Promise<ExampleEntity> => {
    const response = await api.post<ApiResponse<ExampleEntity>>('/api/v1/examples', data);
    return response.data.data!;
  },

  update: async (id: string, data: UpdateExampleRequest): Promise<ExampleEntity> => {
    const response = await api.put<ApiResponse<ExampleEntity>>(
      `/api/v1/examples/${id}`,
      data
    );
    return response.data.data!;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/examples/${id}`);
  },
};

