import { api } from '@/lib/api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  FirstLoginRequest,
  FirstLoginResponse,
  PasswordResetRequestRequest,
  PasswordResetConfirmRequest,
} from '@/types/auth.types';
import type { ApiResponse } from '@/types/api.types';

export const authApi = {
  /**
   * Authenticate user credentials and return JWT + user data.
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/api/v1/auth/login', data);
    return response.data.data!;
  },

  /**
   * Register a new user in the tenant.
   */
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/api/v1/auth/register', data);
    return response.data.data!;
  },

  /**
   * First login using legacy credentials (softlineinfo only).
   */
  firstLogin: async (data: FirstLoginRequest): Promise<FirstLoginResponse> => {
    const response = await api.post<ApiResponse<FirstLoginResponse>>('/api/v1/auth/first-login', data);
    return response.data.data!;
  },

  /**
   * Fetch the currently authenticated user.
   */
  me: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/api/v1/auth/me');
    return response.data.data!;
  },

  /**
   * Invalidate the active user session.
   */
  logout: async (): Promise<void> => {
    await api.post('/api/v1/auth/logout');
  },

  /**
   * Request a password reset email.
   */
  requestPasswordReset: async (data: PasswordResetRequestRequest): Promise<void> => {
    await api.post('/api/v1/auth/password-reset/request', data);
  },

  /**
   * Confirm password reset with provided token.
   */
  confirmPasswordReset: async (data: PasswordResetConfirmRequest): Promise<void> => {
    await api.post('/api/v1/auth/password-reset/confirm', data);
  },
};
