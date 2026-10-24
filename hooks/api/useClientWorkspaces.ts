import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { getClientWorkspaces } from '@/lib/api/client-workspaces';
import type { QueryOptions } from '@/lib/api/global-types';

export function useClientWorkspaces(options?: QueryOptions) {
  const userId = useAppSelector((state) => state.auth.userId);

  return useQuery({
    queryKey: ['client-workspaces', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID not found');
      return getClientWorkspaces(userId);
    },
    enabled: !!userId && options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    ...options,
  });
}