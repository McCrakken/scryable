// apps/mobile/features/stores/api/index.ts
import { useQuery } from '@tanstack/react-query';
import { getStore, getStoreItems, getStores } from '@/lib/api';

export const storeKeys = {
  all: ['stores'] as const,
  lists: () => [...storeKeys.all, 'list'] as const,
  detail: (id: string) => [...storeKeys.all, 'detail', id] as const,
  items: (id: string) => [...storeKeys.detail(id), 'items'] as const,
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

/** The store's items that are still for sale. */
export function useStoreItems(storeId: string) {
  return useQuery({
    queryKey: storeKeys.items(storeId),
    queryFn: ({ signal }) => getStoreItems(storeId, signal),
    select: (items) => items.filter((item) => !item.isSold),
  });
}
