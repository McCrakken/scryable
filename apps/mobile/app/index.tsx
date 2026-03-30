// apps/mobile/app/index.tsx
import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import BottomSheet from '@gorhom/bottom-sheet';
import type { InventoryItem, SearchParams, Platform, Category, Condition } from '@scryable/shared';
import { searchItems } from '@/lib/api';
import { FilterSheet, type FilterValues } from './components/FilterSheet';

export default function SearchScreen() {
  const router = useRouter();
  const filterSheetRef = useRef<BottomSheet>(null);

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  // Staged filters are what's shown in the sheet (uncommitted)
  const [stagedFilters, setStagedFilters] = useState<FilterValues>({});
  // Applied filters are what's actually used in search
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
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '/item/[storeId]/[itemId]',
          params: { storeId: item.storeId, itemId: item.id },
        })
      }
    >
      <Text style={styles.itemTitle}>{item.title}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.tag}>{item.platform}</Text>
        <Text style={styles.tag}>{item.condition}</Text>
        <Text style={styles.tag}>{item.category}</Text>
      </View>
      <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search bar + Filter button */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search games, consoles, accessories…"
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={() => handleSearch()}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            setStagedFilters(appliedFilters);
            filterSheetRef.current?.expand();
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.filterButtonText}>
            {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search button */}
      <TouchableOpacity
        style={[styles.searchButton, loading && styles.searchButtonDisabled]}
        onPress={() => handleSearch()}
        disabled={loading}
        activeOpacity={0.7}
      >
        {loading && !items.length ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.searchButtonText}>Search</Text>
        )}
      </TouchableOpacity>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <View style={styles.activeFilterRow}>
          {appliedFilters.platform && (
            <TouchableOpacity
              style={styles.activeChip}
              onPress={() => removeFilter('platform')}
            >
              <Text style={styles.activeChipText}>{appliedFilters.platform} ✕</Text>
            </TouchableOpacity>
          )}
          {appliedFilters.category && (
            <TouchableOpacity
              style={styles.activeChip}
              onPress={() => removeFilter('category')}
            >
              <Text style={styles.activeChipText}>{appliedFilters.category} ✕</Text>
            </TouchableOpacity>
          )}
          {appliedFilters.condition && (
            <TouchableOpacity
              style={styles.activeChip}
              onPress={() => removeFilter('condition')}
            >
              <Text style={styles.activeChipText}>{appliedFilters.condition} ✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Results / Error / Empty state */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => handleSearch()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
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
              <Text style={styles.emptyText}>
                {hasSearched
                  ? 'No items found. Try adjusting your filters.'
                  : 'Search for games, consoles, and more.'}
              </Text>
            ) : null
          }
          ListFooterComponent={
            loading && items.length > 0 ? (
              <ActivityIndicator size="large" color="#7c3aed" style={styles.listFooter} />
            ) : null
          }
        />
      )}

      {/* Filter bottom sheet — rendered last so it overlays content */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23', padding: 16 },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    color: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  filterButton: {
    backgroundColor: '#2a2a4a',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a5a',
  },
  filterButtonText: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  activeFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  activeChip: {
    backgroundColor: '#3d1f7a',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#7c3aed',
  },
  activeChipText: {
    color: '#c4a6fa',
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  itemTitle: { color: '#e0e0e0', fontSize: 17, fontWeight: '600', marginBottom: 6 },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  tag: {
    backgroundColor: '#2a2a4a',
    color: '#a78bfa',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 12,
    overflow: 'hidden',
  },
  price: { color: '#34d399', fontSize: 18, fontWeight: '700' },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 40, fontSize: 15 },
  errorContainer: { alignItems: 'center', marginTop: 40 },
  errorText: { color: '#ef4444', fontSize: 15, textAlign: 'center', marginBottom: 16 },
  retryButton: {
    backgroundColor: '#2a2a4a',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: { color: '#e0e0e0', fontSize: 14, fontWeight: '600' },
  listFooter: { marginVertical: 16 },
});
