import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { getAuthToken } from '@/lib/auth';
import type { User } from '@/types/auth.types';

export const useAuth = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const currentUser = useAuthStore((state) => state.user);
  const token = getAuthToken();
  const useApiProxy = process.env.NEXT_PUBLIC_USE_API_PROXY === '1';

  const query = useQuery<User, Error>({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    retry: false,
    staleTime: 1000 * 60 * 5,
    enabled: !!token || useApiProxy,
  });

  useEffect(() => {
    if (query.data) setAuth(query.data, token ?? (useApiProxy ? 'api-key-proxy' : undefined));
  }, [query.data, setAuth, token, useApiProxy]);

  useEffect(() => {
    if (query.isError) clearAuth();
  }, [clearAuth, query.isError]);

  return query;
};
