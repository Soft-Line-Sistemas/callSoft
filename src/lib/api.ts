import axios from "axios";
import { clearAuthToken } from "./auth";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:64231";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      const status = error?.response?.status;
      const code = error?.response?.data?.error?.code;
      const pathname = window.location?.pathname ?? "";

      if ((status === 401 || code === "AUTH_001") && !pathname.startsWith("/login") && !pathname.startsWith("/password-reset")) {
        clearAuthToken();
        window.location.replace("/login?expired=true");
      }
    }

    return Promise.reject(error);
  }
);

export type TicketStatus =
  | "SOLICITADO"
  | "PENDENTE_ATENDIMENTO"
  | "EM_ATENDIMENTO"
  | "CONCLUIDO"
  | "CANCELADO";

export interface TicketMetrics {
  statusCounts: Record<TicketStatus, number>;
  volumeByDate: Array<{
    date: string;
    total: number;
  }>;
  averageTimeToFirstAttendanceMinutes: number | null;
  averageTimeInStatusMinutes: Record<TicketStatus, number>;
  technical: {
    averageResponseTimeMs: number | null;
    failuresPerMinute: number;
  };
}

export interface CreateTicketRequest {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  subject: string;
  description: string;
  priority?: "BAIXA" | "MEDIA" | "ALTA" | "URGENTE";
  category?: string;
}

export interface Ticket {
  id: string;
  pedido: number;
  contatoWpp: string;
  solicitacao: string;
  status: TicketStatus;
  horaProposta: string | null;
  empresa?: string | null;
  responsavel?: string | null;
  prioridade?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketListResponse {
  success: boolean;
  data: {
    items: Ticket[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface StatusTransitionRequest {
  status: TicketStatus;
  observacao?: string;
  motivo?: string;
  responsavel?: string;
  horaProposta?: string | null;
}

// --- Novos Schemas ---

export interface ItemCotacao {
  codigoPeca?: string;
  descricao: string;
  quantidade: number;
  unidade?: string;
  precoUnitario?: number;
  descontoItem?: number;
  descontoTipo?: "PERCENTUAL" | "VALOR_ABSOLUTO";
}

export interface CreateCotacaoRequest {
  ticketId: string;
  fornecedorId?: string;
  empresaId?: number;
  itens: ItemCotacao[];
  descontoGlobal?: number;
  descontoTipo?: "PERCENTUAL" | "VALOR_ABSOLUTO";
  prazoEntregaDias?: number;
  dataExpiracao?: string;
  observacoes?: string;
}

export interface Cotacao {
  id: string;
  numero: number;
  ticketId: string;
  fornecedor: {
    id: string;
    nome: string;
    pais: string;
  };
  status: "RASCUNHO" | "ENVIADA" | "RESPONDIDA" | "APROVADA" | "REJEITADA" | "EXPIRADA" | "CANCELADA";
  valorTotal?: number | null;
  itens: ItemCotacao[];
  dataPrevistaEntrega?: string | null;
  createdAt: string;
}

export interface CreateFornecedorRequest {
  nome: string;
  razaoSocial?: string;
  cnpj?: string;
  pais: string;
  cidade?: string;
  estado?: string;
  endereco?: string;
  cep?: string;
  email: string;
  telefone?: string;
  contato?: string;
  observacoes?: string;
  especialidades?: string[];
}

export interface Fornecedor {
  id: string;
  nome: string;
  razaoSocial?: string;
  cnpj?: string;
  pais?: string;
  cidade?: string;
  estado?: string;
  endereco?: string;
  cep?: string;
  email?: string;
  telefone?: string;
  contato?: string;
  observacoes?: string;
  especialidades?: string[];
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FornecedorStats {
  fornecedor: Fornecedor;
  stats: {
    totalCotacoes: number;
    cotacoesAprovadas: number;
    cotacoesPendentes: number;
    taxaAprovacao: number;
    valorTotalCotacoes: number;
    tempoMedioResposta: number | null;
    ultimaCotacao: string | null;
  };
}

export interface UpdateFornecedorRequest {
  nome?: string;
  razaoSocial?: string;
  cnpj?: string;
  pais?: string;
  cidade?: string;
  estado?: string;
  endereco?: string;
  cep?: string;
  email?: string;
  telefone?: string;
  contato?: string;
  observacoes?: string;
  especialidades?: string[];
}

export interface FornecedorListResponse {
  success: boolean;
  data: {
    items: Fornecedor[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CotacaoListResponse {
  success: boolean;
  data: {
    items: Cotacao[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
