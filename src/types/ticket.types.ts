import { PaginationParams } from './api.types';
import { Cotacao } from './cotacao.types';

/**
 * Ticket Status Enum
 */
export enum TicketStatus {
  ABERTO = 'ABERTO',
  PENDENTE_ATENDIMENTO = 'PENDENTE_ATENDIMENTO',
  EM_ATENDIMENTO = 'EM_ATENDIMENTO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
}

/**
 * Ticket Origin Enum
 */
export enum TicketOrigem {
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
  TELEFONE = 'TELEFONE',
  WEB = 'WEB',
}

/**
 * Ticket
 * Represents a support/service ticket in the system
 */
export interface Ticket {
  id: string;
  nome: string;
  telefone: string;
  descricaoSolicitacao: string;
  origem: TicketOrigem;
  destino?: string;
  status: TicketStatus;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  cotacoes?: Cotacao[];
}

/**
 * Create Public Ticket Request
 * Used for creating tickets without authentication
 */
export interface CreatePublicTicketRequest {
  nome: string;
  telefone: string;
  descricaoSolicitacao: string;
  origem: TicketOrigem;
  destino?: string;
}

/**
 * Ticket List Filters
 * Parameters for filtering ticket lists
 */
export interface TicketListFilters extends PaginationParams {
  status?: TicketStatus;
  text?: string;
}

/**
 * Transition Ticket Status Request
 * Used to change the status of a ticket
 */
export interface TransitionTicketStatusRequest {
  status: TicketStatus;
  observacao?: string;
}

/**
 * Compare Cotacoes Parameters
 * Parameters for sorting cotacao comparisons
 */
export interface CompareCotacoesParams {
  sortBy?: 'valorTotal' | 'prazoEntrega' | 'desempenhoFornecedor';
}
