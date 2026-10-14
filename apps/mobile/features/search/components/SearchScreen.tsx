// apps/mobile/features/search/components/SearchScreen.tsx
import { useMemo, useRef, useState } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { hashKey } from '@tanstack/react-query';
import SlidersHorizontal from 'lucide-react-native/icons/sliders-horizontal';
import X from 'lucide-react-native/icons/x';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { useSearchItems, type SearchFilters } from '../api';
import { FilterSheet, type FilterValues } from './FilterSheet';
import { ItemCard, ItemCardSkeleton } from '@/components/ItemCard';

const FILTER_KEYS = ['platform', 'category', 'condition'] as const;
const SKELETON_COUNT = 4;

function toSearchFilters(query: string, filters: FilterValues): SearchFilters {
  const trimmed = query.trim();
  return { ...(trimmed ? { query: trimmed } : {}), ...filters };
}

export function SearchScreen() {
  const router = useRouter();
  const filterSheetRef = useRef<BottomSheetModal>(null);

  // Arriving from the home screen: `q` runs that search, `all` browses everything.
  const params = useLocalSearchParams<{ q?: string; all?: string }>();
  const [query, setQuery] = useState(params.q ?? '');
  const [stagedFilters, setStagedFilters] = useState<FilterValues>({});
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({});
  // The search that was actually submitted; null until the first search so nothing is fetched up front.
  const [submitted, setSubmitted] = useState<SearchFilters | null>(() =>
    params.q ? toSearchFilters(params.q, {}) : params.all ? {} : null,
  );
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  const {
    data,
    error,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isPlaceholderData,
    fetchStatus,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useSearchItems(submitted);

  const items = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);
  const isSearching = isFetching && !isFetchingNextPage;
  const isOffline = fetchStatus === 'paused';

  const handleSearch = (filters: FilterValues = appliedFilters) => {
    const next = toSearchFilters(query, filters);
    // Re-submitting the same search wouldn't change the query key, so refresh it explicitly.
    if (submitted && hashKey([next]) === hashKey([submitted])) {
      refetch();
    } else {
      setSubmitted(next);
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters(stagedFilters);
    filterSheetRef.current?.dismiss();
    handleSearch(stagedFilters);
  };

  const handleClearFilters = () => {
    const empty: FilterValues = {};
    setStagedFilters(empty);
    setAppliedFilters(empty);
  };

  const removeFilter = (key: keyof FilterValues) => {
    const updated = { ...appliedFilters, [key]: undefined };
    setStagedFilters(updated);
    setAppliedFilters(updated);
    handleSearch(updated);
  };

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage && !error) {
      fetchNextPage();
    }
  };

  const handlePullRefresh = async () => {
    setIsPullRefreshing(true);
    await refetch();
    setIsPullRefreshing(false);
  };

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  return (
    <View className="flex-1 bg-background px-4 pt-4">
      {/* Search bar + Filters button */}
      <View className="mb-2.5 flex-row gap-2.5">
        <Input
          className="h-12 flex-1"
          placeholder="Search games, consoles, accessories…"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={() => handleSearch()}
          autoFocus={!params.q && !params.all}
        />
        <Button
          variant="secondary"
          className="h-12 border border-input"
          onPress={() => {
            setStagedFilters(appliedFilters);
            filterSheetRef.current?.present();
          }}
        >
          <Icon as={SlidersHorizontal} size={16} className="text-accent-foreground" />
          <Text className="text-accent-foreground">
            {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
          </Text>
        </Button>
      </View>

      {/* Search button */}
      <Button size="lg" className="mb-3 h-12" onPress={() => handleSearch()} disabled={isSearching}>
        {isSearching ? (
          <ActivityIndicator size="small" color={THEME.primaryForeground} />
        ) : (
          <Text className="text-base font-bold">Search</Text>
        )}
      </Button>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <View className="mb-3 flex-row flex-wrap gap-2">
          {FILTER_KEYS.map((key) =>
            appliedFilters[key] ? (
              <Animated.View
                key={key}
                entering={FadeIn.duration(150)}
                exiting={FadeOut.duration(150)}
                layout={LinearTransition}
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-primary bg-accent"
                  onPress={() => removeFilter(key)}
                  aria-label={`Remove ${appliedFilters[key]} filter`}
                >
                  <Text className="text-accent-foreground">{appliedFilters[key]}</Text>
                  <Icon as={X} size={14} className="text-accent-foreground" />
                </Button>
              </Animated.View>
            ) : null,
          )}
        </View>
      )}

      {/* Offline notice: the query is paused and resumes automatically on reconnect */}
      {isOffline && (
        <Text variant="muted" className="mb-3 text-center">
          {items.length > 0
            ? "You're offline. Showing saved results."
            : "You're offline. Results will load when you reconnect."}
        </Text>
      )}

      {/* Results / Error / Empty state */}
      {error && items.length === 0 ? (
        <View className="mt-10 items-center">
          <Text className="text-center text-destructive">
            {error.message || 'Search failed. Please try again.'}
          </Text>
          <Button variant="secondary" className="mt-4 px-6" onPress={() => refetch()}>
            <Text className="font-semibold">Retry</Text>
          </Button>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onPress={() =>
                router.push({
                  pathname: '/item/[storeId]/[itemId]',
                  params: { storeId: item.storeId, itemId: item.id },
                })
              }
            />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          // Dim stale results while a new search loads in their place.
          className={isPlaceholderData ? 'opacity-50' : undefined}
          refreshControl={
            submitted ? (
              <RefreshControl
                refreshing={isPullRefreshing}
                onRefresh={handlePullRefresh}
                tintColor={THEME.primary}
              />
            ) : undefined
          }
          ListEmptyComponent={
            isLoading ? (
              <View>
                {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                  <ItemCardSkeleton key={i} />
                ))}
              </View>
            ) : (
              <Text variant="muted" className="mt-10 text-center">
                {submitted
                  ? 'No items found. Try adjusting your filters.'
                  : 'Search for games, consoles, and more.'}
              </Text>
            )
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator size="large" color={THEME.primary} className="my-4" />
            ) : error && items.length > 0 ? (
              <Button variant="ghost" className="my-4" onPress={() => fetchNextPage()}>
                <Text className="text-destructive">
                  Couldn&apos;t load more results. Tap to retry.
                </Text>
              </Button>
            ) : null
          }
        />
      )}

      <FilterSheet
        ref={filterSheetRef}
        values={stagedFilters}
        onChange={setStagedFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
    </View>
  );
}
