import { create } from 'zustand';
import type { User } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token?: string) => void;
  setToken: (token: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => set({ user, token: token ?? null, isAuthenticated: true }),
  setToken: (token) => set({ token, isAuthenticated: !!token }),
  clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
}));
