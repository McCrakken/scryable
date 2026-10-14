// apps/mobile/features/stores/api/index.ts
import { useQuery } from '@tanstack/react-query';
import { getStore, getStores } from '@/lib/api';

export const storeKeys = {
  all: ['stores'] as const,
  lists: () => [...storeKeys.all, 'list'] as const,
  detail: (id: string) => [...storeKeys.all, 'detail', id] as const,
};

export function useStores() {
  return useQuery({
    queryKey: storeKeys.lists(),
    queryFn: ({ signal }) => getStores(signal),
  });
}

export function useStore(id: string) {
  return useQuery({
    queryKey: storeKeys.detail(id),
    queryFn: ({ signal }) => getStore(id, signal),
  });
}
