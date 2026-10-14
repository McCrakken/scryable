// apps/mobile/features/search/api/keys.ts
import type { SearchParams } from '@scryable/shared';

/** Search criteria that identify a result set. Pagination is handled by the infinite query. */
export type SearchFilters = Omit<SearchParams, 'page' | 'limit'>;

export const searchKeys = {
  all: ['search'] as const,
  lists: () => [...searchKeys.all, 'list'] as const,
  list: (filters: SearchFilters) => [...searchKeys.lists(), filters] as const,
};
