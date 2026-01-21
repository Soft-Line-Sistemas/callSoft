/**
 * Dashboard Period Enum
 */
export enum DashboardPeriodo {
  HOJE = 'hoje',
  SEMANA = 'semana',
  MES = 'mes',
  CUSTOMIZADO = 'customizado',
}

/**
 * Dashboard Summary Parameters (query string filters)
 */
export interface DashboardSummaryParams {
  periodo: DashboardPeriodo;
  from?: string; // ISO 8601 (only for CUSTOMIZADO)
  to?: string; // ISO 8601 (only for CUSTOMIZADO)
  fornecedorId?: string;
}

/**
 * Dashboard period metadata returned by the backend.
 */
export interface DashboardPeriodoInfo {
  from: string;
  to: string;
  label: string;
}

/**
 * Cotacoes metrics returned by the dashboard summary endpoint.
 */
export interface DashboardCotacaoMetrics {
  total: number;
  valorTotal: number;
  taxaAprovacao: number; // 0-100 (%)
  tempoMedioResposta: number | null; // hours
  pendentes: number;
  porStatus: Record<string, number>;
  alertas?: {
    pendentesMais48h: number;
  };
}

export interface DashboardTopFornecedor {
  fornecedor: {
    id: string;
    nome: string;
    pais: string;
  };
  quantidade?: number;
  valor?: number;
}

/**
 * Fornecedores metrics returned by the dashboard summary endpoint.
 */
export interface DashboardFornecedorMetrics {
  total: number;
  topPorVolume: DashboardTopFornecedor[];
  topPorValor: DashboardTopFornecedor[];
}

/**
 * Optional comparison payload between periods.
 */
export interface DashboardComparacaoPeriodos {
  periodoAnterior: {
    from: string;
    to: string;
  };
  variacao: {
    total: string;
    valorTotal: string;
    taxaAprovacao: string;
    tempoMedioResposta: string;
  };
}

/**
 * Dashboard Summary
 * Full response from `GET /api/v1/dashboard/summary`.
 */
export interface DashboardMetrics {
  periodo: DashboardPeriodoInfo;
  cotacoes: DashboardCotacaoMetrics;
  fornecedores: DashboardFornecedorMetrics;
  comparacao?: DashboardComparacaoPeriodos;
}

/**
 * Export Format Enum
 */
export enum ExportFormat {
  CSV = 'csv',
  XLSX = 'xlsx',
  PDF = 'pdf',
}

/**
 * Dashboard Export Parameters (query string filters)
 */
export interface DashboardExportParams {
  formato: ExportFormat;
  periodo: DashboardPeriodo;
  from?: string;
  to?: string;
  fornecedorId?: string;
}
