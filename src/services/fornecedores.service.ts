import { api } from '@/lib/api';
import type {
  ChangeFornecedorStatusRequest,
  CreateFornecedorRequest,
  Fornecedor,
  FornecedorListFilters,
  FornecedorStats,
  UpdateFornecedorRequest,
} from '@/types/fornecedor.types';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const fornecedoresApi = {
  /**
   * Create a new fornecedor.
   * @param data Supplier payload.
   * @returns Created fornecedor.
   */
  create: async (data: CreateFornecedorRequest): Promise<Fornecedor> => {
    const response = await api.post<ApiResponse<Fornecedor>>('/api/v1/fornecedores', data);
    return response.data.data!;
  },

  /**
   * List fornecedores with pagination and optional filters.
   * @param filters Pagination, status and search filters.
   * @returns Paginated fornecedores list.
   */
  list: async (
    filters: FornecedorListFilters = {}
  ): Promise<PaginatedResponse<Fornecedor>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Fornecedor>>>(
      '/api/v1/fornecedores',
      { params: filters }
    );
    return response.data.data!;
  },

  /**
   * Fetch a fornecedor by its identifier.
   * @param id Fornecedor ID.
   * @returns Fornecedor details.
   */
  getById: async (id: string): Promise<Fornecedor> => {
    const response = await api.get<ApiResponse<Fornecedor>>(`/api/v1/fornecedores/${id}`);
    return response.data.data!;
  },

  /**
   * Fetch stats for a fornecedor.
   * @param id Fornecedor ID.
   * @returns Fornecedor statistics and summary.
   */
  getStats: async (id: string): Promise<FornecedorStats> => {
    const response = await api.get<ApiResponse<FornecedorStats>>(
      `/api/v1/fornecedores/${id}/stats`
    );
    return response.data.data!;
  },

  /**
   * Update a fornecedor using partial payload.
   * @param id Fornecedor ID.
   * @param data Partial fornecedor update payload.
   * @returns Updated fornecedor.
   */
  update: async (id: string, data: UpdateFornecedorRequest): Promise<Fornecedor> => {
    const response = await api.patch<ApiResponse<Fornecedor>>(
      `/api/v1/fornecedores/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Change fornecedor status (activate/deactivate).
   * @param id Fornecedor ID.
   * @param data Status payload.
   * @returns Updated fornecedor.
   */
  changeStatus: async (
    id: string,
    data: ChangeFornecedorStatusRequest
  ): Promise<Fornecedor> => {
    const response = await api.post<ApiResponse<Fornecedor>>(
      `/api/v1/fornecedores/${id}/status`,
      data
    );
    return response.data.data!;
  },
};

