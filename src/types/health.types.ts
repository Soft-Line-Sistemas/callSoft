export type HealthStatus = 'healthy' | 'unhealthy' | 'degraded';

export type ServiceStatus = 'up' | 'down';

export type WhatsappServiceStatus = 'up' | 'down' | 'disabled';

export interface HealthServices {
  database: ServiceStatus;
  whatsapp?: WhatsappServiceStatus;
  disk?: ServiceStatus;
}

export interface HealthDiskDetails {
  available: number;
  total: number;
  percentageUsed: number;
}

export interface HealthDetails {
  database?: string;
  whatsapp?: string;
  disk?: HealthDiskDetails;
}

export interface HealthCheckResponse {
  status: HealthStatus;
  timestamp: string;
  services: HealthServices;
  version: string;
  uptime: number;
  details?: HealthDetails;
}

export interface NodeMemoryUsage {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers?: number;
}

export interface NodeCpuUsage {
  user: number;
  system: number;
}

export interface LivenessResponse {
  alive: boolean;
  timestamp: string;
  uptime: number;
  memory: NodeMemoryUsage;
  pid: number;
  reason?: string;
}

export interface TechnicalMetricsSnapshot {
  averageResponseTime: number;
  failuresPerMinute: number;
  totalRequests: number;
  totalFailures: number;
  whatsappConnectionStatus: string;
}

export interface HealthMetrics {
  timestamp: string;
  uptime: number;
  memory: NodeMemoryUsage;
  cpu: NodeCpuUsage;
  pid: number;
  version: string;
  nodeVersion: string;
  platform: string;
  arch: string;
  technical: TechnicalMetricsSnapshot;
}

