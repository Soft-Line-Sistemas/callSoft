import { PaginationParams } from './api.types';
import { Fornecedor } from './fornecedor.types';

/**
 * Cotacao Status Enum
 */
export enum CotacaoStatus {
  RASCUNHO = 'RASCUNHO',
  ENVIADA = 'ENVIADA',
  APROVADA = 'APROVADA',
  REJEITADA = 'REJEITADA',
  EM_TRANSITO = 'EM_TRANSITO',
  ENTREGUE = 'ENTREGUE',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA',
}

/**
 * Item Cotacao
 * Represents a single item in a quotation
 */
export interface ItemCotacao {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

/**
 * Cotacao
 * Represents a quotation for a ticket
 */
export interface Cotacao {
  id: string;
  ticketId: string;
  fornecedorId: string;
  fornecedor?: Fornecedor;
  valorTotal: number;
  prazoEntrega: string; // ISO 8601
  observacoes?: string;
  status: CotacaoStatus;
  itens: ItemCotacao[];
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Cotacao Request
 */
export interface CreateCotacaoRequest {
  ticketId: string;
  fornecedorId: string;
  valorTotal: number;
  prazoEntrega: string; // ISO 8601
  observacoes?: string;
  itens: ItemCotacao[];
}

/**
 * Update Cotacao Request
 * Only allowed for RASCUNHO status
 */
export interface UpdateCotacaoRequest {
  valorTotal?: number;
  observacoes?: string;
  itens?: ItemCotacao[];
}

/**
 * Change Cotacao Status Request
 */
export interface ChangeCotacaoStatusRequest {
  status: CotacaoStatus;
  observacao?: string;
}

/**
 * Tracking Event
 * Represents a tracking event for a cotacao
 */
export interface TrackingEvent {
  id: string;
  cotacaoId: string;
  evento: string;
  localizacao?: string;
  dataHora: string; // ISO 8601
  createdAt: string;
}

/**
 * Add Tracking Event Request
 */
export interface AddTrackingEventRequest {
  evento: string;
  localizacao?: string;
  dataHora: string; // ISO 8601
}

/**
 * Cotacao List Filters
 * Parameters for filtering cotacao lists
 */
export interface CotacaoListFilters extends PaginationParams {
  status?: CotacaoStatus;
  ticketId?: string;
  fornecedorId?: string;
}
