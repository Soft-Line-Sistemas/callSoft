import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { Kanban, KanbanListItem } from '@/types/kanban.types';

export interface KanbanListFilters {
  tipo?: string;
  referenciaId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface MoveTaskRequest {
  colunaId: string;
}

export const kanbanApi = {
  /**
   * Fetch a paginated kanban list with optional filters.
   * @param filters Pagination and filtering parameters.
   * @returns Paginated response containing kanbans and metadata.
   */
  list: async (filters: KanbanListFilters = {}): Promise<PaginatedResponse<KanbanListItem>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<KanbanListItem>>>(
      '/api/v1/kanban',
      { params: filters }
    );
    return response.data.data!;
  },

  /**
   * Retrieve kanban details by identifier.
   * @param id Kanban ID to fetch.
   * @returns Kanban payload with colunas and tarefas included.
   */
  getById: async (id: string): Promise<Kanban> => {
    const response = await api.get<ApiResponse<Kanban>>(`/api/v1/kanban/${id}`);
    return response.data.data!;
  },

  /**
   * Move a task to a different column.
   * @param taskId Task ID to move.
   * @param data Payload with the new column ID.
   * @returns Success response.
   */
  moveTask: async (taskId: string, data: MoveTaskRequest): Promise<{ success: boolean }> => {
    const response = await api.patch<ApiResponse<{ success: boolean }>>(
      `/api/v1/task/${taskId}/mover`,
      data
    );
    return response.data.data!;
  },
};
