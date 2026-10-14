// apps/mobile/features/search/components/SearchScreen.tsx
import { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import BottomSheet from '@gorhom/bottom-sheet';
import { hashKey } from '@tanstack/react-query';
import type { InventoryItem } from '@scryable/shared';
import { ui } from '@/lib/styles';
import { useSearchItems, type SearchFilters } from '../api';
import { FilterSheet, type FilterValues } from './FilterSheet';

function toSearchFilters(query: string, filters: FilterValues): SearchFilters {
  const trimmed = query.trim();
  return { ...(trimmed ? { query: trimmed } : {}), ...filters };
}

export function SearchScreen() {
  const router = useRouter();
  const filterSheetRef = useRef<BottomSheet>(null);

  const [query, setQuery] = useState('');
  const [stagedFilters, setStagedFilters] = useState<FilterValues>({});
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({});
  // The search that was actually submitted; null until the first search so nothing is fetched up front.
  const [submitted, setSubmitted] = useState<SearchFilters | null>(null);
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
    filterSheetRef.current?.close();
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

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <TouchableOpacity
      className={ui.card}
      onPress={() =>
        router.push({
          pathname: '/item/[storeId]/[itemId]',
          params: { storeId: item.storeId, itemId: item.id },
        })
      }
    >
      <Text className={ui.subheading + ' mb-1.5'}>{item.title}</Text>
      <View className="flex-row gap-2 mb-2">
        <Text className={ui.tag}>{item.platform}</Text>
        <Text className={ui.tag}>{item.condition}</Text>
        <Text className={ui.tag}>{item.category}</Text>
      </View>
      <Text className={ui.price}>${Number(item.price).toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View className={ui.screen + ' pt-4'}>
      {/* Search bar + Filters button */}
      <View className="flex-row gap-2.5 mb-2.5">
        <TextInput
          className={ui.input}
          placeholder="Search games, consoles, accessories…"
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={() => handleSearch()}
        />
        <TouchableOpacity
          className={ui.btnSecondary}
          onPress={() => {
            setStagedFilters(appliedFilters);
            filterSheetRef.current?.expand();
          }}
          activeOpacity={0.7}
        >
          <Text className={ui.btnSecondaryText}>
            {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search button */}
      <TouchableOpacity
        className={`${ui.btnPrimary} mb-3 ${isSearching ? ui.btnPrimaryDisabled : ''}`}
        onPress={() => handleSearch()}
        disabled={isSearching}
        activeOpacity={0.7}
      >
        {isSearching ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className={ui.btnPrimaryText}>Search</Text>
        )}
      </TouchableOpacity>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <View className="flex-row flex-wrap gap-2 mb-3">
          {appliedFilters.platform && (
            <TouchableOpacity className={ui.activeChip} onPress={() => removeFilter('platform')}>
              <Text className={ui.activeChipText}>{appliedFilters.platform} ✕</Text>
            </TouchableOpacity>
          )}
          {appliedFilters.category && (
            <TouchableOpacity className={ui.activeChip} onPress={() => removeFilter('category')}>
              <Text className={ui.activeChipText}>{appliedFilters.category} ✕</Text>
            </TouchableOpacity>
          )}
          {appliedFilters.condition && (
            <TouchableOpacity className={ui.activeChip} onPress={() => removeFilter('condition')}>
              <Text className={ui.activeChipText}>{appliedFilters.condition} ✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Offline notice: the query is paused and resumes automatically on reconnect */}
      {isOffline && (
        <Text className={`${ui.muted} text-center mb-3`}>
          {items.length > 0
            ? "You're offline. Showing saved results."
            : "You're offline. Results will load when you reconnect."}
        </Text>
      )}

      {/* Results / Error / Empty state */}
      {error && items.length === 0 ? (
        <View className="items-center mt-10">
          <Text className={ui.errorText}>{error.message || 'Search failed. Please try again.'}</Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-bg-elevated px-6 py-2.5 rounded-lg mt-4"
          >
            <Text className="text-text-primary text-sm font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          // Dim stale results while a new search loads in their place.
          className={isPlaceholderData ? 'opacity-50' : undefined}
          refreshControl={
            submitted ? (
              <RefreshControl
                refreshing={isPullRefreshing}
                onRefresh={handlePullRefresh}
                tintColor="#7c3aed"
              />
            ) : undefined
          }
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator size="large" color="#7c3aed" className="mt-10" />
            ) : (
              <Text className={`${ui.faint} mt-10`}>
                {submitted
                  ? 'No items found. Try adjusting your filters.'
                  : 'Search for games, consoles, and more.'}
              </Text>
            )
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator size="large" color="#7c3aed" className="my-4" />
            ) : error && items.length > 0 ? (
              <TouchableOpacity onPress={() => fetchNextPage()} className="items-center my-4">
                <Text className={ui.errorText}>Couldn&apos;t load more results. Tap to retry.</Text>
              </TouchableOpacity>
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
