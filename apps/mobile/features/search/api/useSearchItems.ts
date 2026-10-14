// apps/mobile/features/search/api/useSearchItems.ts
import { keepPreviousData, skipToken, useInfiniteQuery } from '@tanstack/react-query';
import { searchItems } from '@/lib/api';
import { searchKeys, type SearchFilters } from './keys';

export const SEARCH_PAGE_SIZE = 20;

/**
 * Paginated global search. Pass `null` to stay idle until the user submits a search.
 * Previous results stay on screen while a new search loads (`isPlaceholderData`).
 */
export function useSearchItems(filters: SearchFilters | null) {
  return useInfiniteQuery({
    queryKey: searchKeys.list(filters ?? {}),
    queryFn: filters
      ? ({ pageParam, signal }) =>
          searchItems({ ...filters, page: pageParam, limit: SEARCH_PAGE_SIZE }, signal)
      : skipToken,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    placeholderData: keepPreviousData,
  });
}
