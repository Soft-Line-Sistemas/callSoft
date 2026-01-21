import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api.types';

export interface CreateEmpresaRequest {
  nomeFantasia: string;
  razaoSocial: string;
  cnpj?: string;
  inscEstadual?: string;
  im?: string;
  cep?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  telefoneSec?: string;
  cabecalho?: string;
  observacao?: string;
}

export interface EmpresaResponse {
  codEmp: number;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj?: string | null;
  inscEstadual?: string | null;
  im?: string | null;
  cep?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  telefone?: string | null;
  telefoneSec?: string | null;
  cabecalho?: string | null;
  observacao?: string | null;
  ativo: boolean;
}

export interface EmpresaContactsResponse {
  empresa: {
    codEmp: number;
    nomeFantasia?: string | null;
    razaoSocial?: string | null;
  };
  contatos: Array<{
    contatoWpp: string;
    lastTicketId: string;
    lastStatus: string;
    lastUpdatedAt: string;
    ticketCount: number;
  }>;
}

export const empresasApi = {
  list: async (params?: { search?: string }): Promise<EmpresaResponse[]> => {
    const response = await api.get<ApiResponse<EmpresaResponse[]>>('/api/v1/empresas', {
      params,
    });
    return response.data.data ?? [];
  },
  getById: async (codEmp: number): Promise<EmpresaResponse> => {
    const response = await api.get<ApiResponse<EmpresaResponse>>(`/api/v1/empresas/${codEmp}`);
    return response.data.data!;
  },
  listContacts: async (codEmp: number): Promise<EmpresaContactsResponse> => {
    const response = await api.get<ApiResponse<EmpresaContactsResponse>>(
      `/api/v1/empresas/${codEmp}/contatos`,
    );
    return response.data.data!;
  },
  create: async (payload: CreateEmpresaRequest): Promise<EmpresaResponse> => {
    const response = await api.post<ApiResponse<EmpresaResponse>>('/api/v1/empresas', payload);
    return response.data.data!;
  },
  update: async (codEmp: number, payload: CreateEmpresaRequest): Promise<EmpresaResponse> => {
    const response = await api.put<ApiResponse<EmpresaResponse>>(`/api/v1/empresas/${codEmp}`, payload);
    return response.data.data!;
  },
};
