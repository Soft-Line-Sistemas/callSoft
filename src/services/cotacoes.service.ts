import { api } from '@/lib/api';
import type {
  AddTrackingEventRequest,
  ChangeCotacaoStatusRequest,
  Cotacao,
  CotacaoListFilters,
  TrackingEvent,
  UpdateCotacaoRequest,
  CreateCotacaoRequest,
} from '@/types/cotacao.types';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const cotacoesApi = {
  /**
   * Create cotacao.
   */
  create: async (data: CreateCotacaoRequest): Promise<Cotacao> => {
    const response = await api.post<ApiResponse<Cotacao>>('/api/v1/cotacoes', data);
    return response.data.data!;
  },

  /**
   * List cotacoes with optional filters.
   */
  list: async (filters: CotacaoListFilters = {}): Promise<PaginatedResponse<Cotacao>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Cotacao>>>('/api/v1/cotacoes', {
      params: filters,
    });
    return response.data.data!;
  },

  /**
   * Get cotacao by ID.
   */
  getById: async (id: string): Promise<Cotacao> => {
    const response = await api.get<ApiResponse<Cotacao>>(`/api/v1/cotacoes/${id}`);
    return response.data.data!;
  },

  /**
   * Update cotacao (only allowed for RASCUNHO).
   */
  update: async (id: string, data: UpdateCotacaoRequest): Promise<Cotacao> => {
    const response = await api.put<ApiResponse<Cotacao>>(`/api/v1/cotacoes/${id}`, data);
    return response.data.data!;
  },

  /**
   * Delete cotacao (only allowed for RASCUNHO).
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/cotacoes/${id}`);
  },

  /**
   * Change cotacao status.
   */
  changeStatus: async (id: string, data: ChangeCotacaoStatusRequest): Promise<Cotacao> => {
    const response = await api.post<ApiResponse<Cotacao>>(`/api/v1/cotacoes/${id}/status`, data);
    return response.data.data!;
  },

  /**
   * Add a tracking event.
   */
  addTrackingEvent: async (id: string, data: AddTrackingEventRequest): Promise<TrackingEvent> => {
    const response = await api.post<ApiResponse<TrackingEvent>>(
      `/api/v1/cotacoes/${id}/tracking`,
      data
    );
    return response.data.data!;
  },

  /**
   * List tracking events.
   */
  listTrackingEvents: async (id: string): Promise<TrackingEvent[]> => {
    const response = await api.get<ApiResponse<TrackingEvent[]>>(`/api/v1/cotacoes/${id}/tracking`);
    return response.data.data!;
  },

  /**
   * Confirm receipt for a cotacao.
   */
  confirmReceipt: async (id: string): Promise<Cotacao> => {
    const response = await api.post<ApiResponse<Cotacao>>(`/api/v1/cotacoes/${id}/confirm-receipt`);
    return response.data.data!;
  },
};

