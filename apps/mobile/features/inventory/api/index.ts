// apps/mobile/features/inventory/api/index.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { InventoryItem } from '@scryable/shared';
import { getItem } from '@/lib/api';
import { findCachedSearchItem } from '@/features/search/api';

export const itemKeys = {
  all: ['items'] as const,
  detail: (storeId: string, itemId: string) => [...itemKeys.all, storeId, itemId] as const,
};

/** Shows the copy from search results immediately, then refreshes it from the item endpoint. */
export function useItem(storeId: string, itemId: string) {
  const queryClient = useQueryClient();
  return useQuery<InventoryItem>({
    queryKey: itemKeys.detail(storeId, itemId),
    queryFn: ({ signal }) => getItem(storeId, itemId, signal),
    placeholderData: () => findCachedSearchItem(queryClient, itemId),
  });
}
