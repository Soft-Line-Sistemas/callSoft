import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api.types';

export interface UsuarioResponse {
  codUsu: number;
  login: string;
  email?: string | null;
  inativo?: string | null;
}

export const usuariosApi = {
  list: async (): Promise<UsuarioResponse[]> => {
    const response = await api.get<ApiResponse<UsuarioResponse[]>>('/api/v1/usuarios');
    return response.data.data ?? [];
  },
};
