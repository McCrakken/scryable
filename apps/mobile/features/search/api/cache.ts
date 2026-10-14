// apps/mobile/features/search/api/cache.ts
import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { InventoryItem, PaginatedResponse } from '@scryable/shared';
import { searchKeys } from './keys';

/** Looks up an item already loaded by any cached search, e.g. to show a detail screen instantly. */
export function findCachedSearchItem(queryClient: QueryClient, itemId: string) {
  const results = queryClient.getQueriesData<InfiniteData<PaginatedResponse<InventoryItem>>>({
    queryKey: searchKeys.lists(),
  });
  for (const [, data] of results) {
    for (const page of data?.pages ?? []) {
      const item = page.data.find((i) => i.id === itemId);
      if (item) return item;
    }
  }
  return undefined;
}
