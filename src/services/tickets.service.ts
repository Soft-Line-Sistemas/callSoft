import { api } from '@/lib/api';
import type {
  Ticket,
  CreatePublicTicketRequest,
  TicketListFilters,
  TransitionTicketStatusRequest,
  CompareCotacoesParams,
} from '@/types/ticket.types';
import type { Cotacao } from '@/types/cotacao.types';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const ticketsApi = {
  /**
   * Create a ticket from the public form (no authentication required).
   * @param data Payload with requester information and solicitation details.
   * @returns Created ticket enriched with backend metadata.
   */
  createPublic: async (data: CreatePublicTicketRequest): Promise<Ticket> => {
    const response = await api.post<ApiResponse<Ticket>>('/api/v1/tickets', data);
    return response.data.data!;
  },

  /**
   * Fetch a paginated ticket list with optional filters such as status and search text.
   * @param filters Pagination and filtering parameters.
   * @returns Paginated response containing tickets and metadata.
   */
  list: async (filters: TicketListFilters = {}): Promise<PaginatedResponse<Ticket>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Ticket>>>(
      '/api/v1/tickets',
      { params: filters }
    );
    return response.data.data!;
  },

  /**
   * Retrieve ticket details by identifier.
   * @param id Ticket ID to fetch.
   * @returns Ticket payload with optional cotacoes included.
   */
  getById: async (id: string): Promise<Ticket> => {
    const response = await api.get<ApiResponse<Ticket>>(`/api/v1/tickets/${id}`);
    return response.data.data!;
  },

  /**
   * List all cotacoes associated with a ticket.
   * @param id Ticket ID owner of the cotacoes.
   * @returns Array of cotacoes linked to the ticket.
   */
  getCotacoes: async (id: string): Promise<Cotacao[]> => {
    const response = await api.get<ApiResponse<Cotacao[]>>(`/api/v1/tickets/${id}/cotacoes`);
    return response.data.data!;
  },

  /**
   * Compare cotacoes for a ticket, optionally sorting by price, delivery or supplier performance.
   * @param id Ticket ID owner of the cotacoes.
   * @param params Sorting preferences.
   * @returns Ordered array of cotacoes prepared for comparison.
   */
  compareCotacoes: async (
    id: string,
    params: CompareCotacoesParams = {}
  ): Promise<Cotacao[]> => {
    const response = await api.get<ApiResponse<Cotacao[]>>(
      `/api/v1/tickets/${id}/cotacoes/compare`,
      { params }
    );
    return response.data.data!;
  },

  /**
   * Transition ticket status while persisting optional observations.
   * @param id Ticket ID to transition.
   * @param data Payload describing the new status.
   * @returns Ticket updated with the new status value.
   */
  transitionStatus: async (
    id: string,
    data: TransitionTicketStatusRequest
  ): Promise<Ticket> => {
    const response = await api.post<ApiResponse<Ticket>>(
      `/api/v1/tickets/${id}/status`,
      data
    );
    return response.data.data!;
  },

  /**
   * Export filtered tickets as CSV, returning the raw Blob to be consumed by download helpers.
   * @param filters Same filters accepted by list, plus enforced CSV format.
   * @returns Blob containing the CSV file.
   */
  exportCsv: async (filters: TicketListFilters = {}): Promise<Blob> => {
    const response = await api.get('/api/v1/tickets/export', {
      params: { ...filters, format: 'csv' },
      responseType: 'blob',
    });
    return response.data;
  },
};
