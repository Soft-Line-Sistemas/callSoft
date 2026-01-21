export type TicketMetricsStatus =
  | 'SOLICITADO'
  | 'PENDENTE_ATENDIMENTO'
  | 'EM_ATENDIMENTO'
  | 'CONCLUIDO'
  | 'CANCELADO';

export type MetricsStatusCounts = Record<TicketMetricsStatus, number>;

export interface VolumeByDate {
  date: string;
  total: number;
}

export interface TicketMetricsFilters {
  from?: string;
  to?: string;
  status?: TicketMetricsStatus;
}

export interface TechnicalMetrics {
  averageResponseTimeMs: number | null;
  failuresPerMinute: number;
}

export interface TicketMetricsResult {
  statusCounts: MetricsStatusCounts;
  volumeByDate: VolumeByDate[];
  averageTimeToFirstAttendanceMinutes: number | null;
  averageTimeInStatusMinutes: MetricsStatusCounts;
  technical: TechnicalMetrics;
}

