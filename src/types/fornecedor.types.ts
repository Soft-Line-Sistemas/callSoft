import { PaginationParams } from './api.types';

/**
 * Fornecedor
 * Represents a supplier in the system
 */
export interface Fornecedor {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco?: string;
  observacoes?: string;
  ativo: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Fornecedor Request
 */
export interface CreateFornecedorRequest {
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco?: string;
  observacoes?: string;
}

/**
 * Update Fornecedor Request
 */
export interface UpdateFornecedorRequest {
  telefone?: string;
  observacoes?: string;
}

/**
 * Change Fornecedor Status Request
 */
export interface ChangeFornecedorStatusRequest {
  ativo: boolean;
}

/**
 * Fornecedor Stats
 * Statistics for a specific supplier
 */
export interface FornecedorStats {
  fornecedor: Fornecedor;
  stats: {
    totalCotacoes: number;
    cotacoesAprovadas: number;
    cotacoesPendentes: number;
    taxaAprovacao: number;
    valorMedioCotacoes: number;
    ultimaCotacao?: string;
  };
}

/**
 * Fornecedor List Filters
 * Parameters for filtering fornecedor lists
 */
export interface FornecedorListFilters extends PaginationParams {
  ativo?: boolean;
  search?: string;
}
