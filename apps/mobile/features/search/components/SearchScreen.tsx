// apps/mobile/features/search/components/SearchScreen.tsx
import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import BottomSheet from '@gorhom/bottom-sheet';
import type { InventoryItem, SearchParams } from '@scryable/shared';
import { searchItems } from '@/lib/api';
import { FilterSheet, type FilterValues } from './FilterSheet';
import { ui } from '@/lib/styles';

export function SearchScreen() {
  const router = useRouter();
  const filterSheetRef = useRef<BottomSheet>(null);

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [stagedFilters, setStagedFilters] = useState<FilterValues>({});
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({});

  const fetchItems = useCallback(
    async (pageNum: number, filters: FilterValues, append = false) => {
      setLoading(true);
      setError(null);
      try {
        const params: SearchParams = {
          page: pageNum,
          limit: 20,
          ...(query ? { query } : {}),
          ...(filters.platform ? { platform: filters.platform } : {}),
          ...(filters.category ? { category: filters.category } : {}),
          ...(filters.condition ? { condition: filters.condition } : {}),
        };
        const result = await searchItems(params);
        setItems((prev) => (append ? [...prev, ...result.data] : result.data));
        setTotalPages(result.totalPages);
        setHasSearched(true);
      } catch (err) {
        console.error('Search failed:', err);
        setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [query],
  );

  const handleSearch = (filters: FilterValues = appliedFilters) => {
    setPage(1);
    fetchItems(1, filters);
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
    if (page < totalPages && !loading) {
      const next = page + 1;
      setPage(next);
      fetchItems(next, appliedFilters, true);
    }
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
        className={`${ui.btnPrimary} mb-3 ${loading ? ui.btnPrimaryDisabled : ''}`}
        onPress={() => handleSearch()}
        disabled={loading}
        activeOpacity={0.7}
      >
        {loading && !items.length ? (
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

      {/* Results / Error / Empty state */}
      {error ? (
        <View className="items-center mt-10">
          <Text className={ui.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => handleSearch()}
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
          ListEmptyComponent={
            !loading ? (
              <Text className={`${ui.faint} mt-10`}>
                {hasSearched
                  ? 'No items found. Try adjusting your filters.'
                  : 'Search for games, consoles, and more.'}
              </Text>
            ) : null
          }
          ListFooterComponent={
            loading && items.length > 0 ? (
              <ActivityIndicator size="large" color="#7c3aed" className="my-4" />
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
