// apps/mobile/components/FilterSheet.tsx
import { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import type { Platform, Category, Condition } from '@scryable/shared';
import { PLATFORMS, CATEGORIES, CONDITIONS } from '@scryable/shared';

export interface FilterValues {
  platform?: Platform;
  category?: Category;
  condition?: Condition;
}

interface FilterSheetProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onApply: () => void;
  onClear: () => void;
}

// Human-readable labels for enum values
const CONDITION_LABELS: Record<Condition, string> = {
  sealed: 'Sealed',
  cib: 'Complete in Box',
  loose: 'Loose',
  fair: 'Fair',
  poor: 'Poor',
};

const CATEGORY_LABELS: Record<Category, string> = {
  game: 'Game',
  console: 'Console',
  accessory: 'Accessory',
  'strategy-guide': 'Strategy Guide',
  merchandise: 'Merchandise',
  other: 'Other',
};

export const FilterSheet = forwardRef<BottomSheet, FilterSheetProps>(
  ({ values, onChange, onApply, onClear }, ref) => {
    const snapPoints = useMemo(() => ['60%', '90%'], []);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      ),
      [],
    );

    const toggle = <T,>(key: keyof FilterValues, value: T, current: T | undefined) => {
      onChange({
        ...values,
        [key]: current === value ? undefined : value,
      });
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClear}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {/* Platform */}
          <Text style={styles.sectionLabel}>Platform</Text>
          <View style={styles.chipGrid}>
            {PLATFORMS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.chip, values.platform === p && styles.chipActive]}
                onPress={() => toggle('platform', p, values.platform)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, values.platform === p && styles.chipTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category */}
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.chipGrid}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, values.category === c && styles.chipActive]}
                onPress={() => toggle('category', c, values.category)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, values.category === c && styles.chipTextActive]}>
                  {CATEGORY_LABELS[c]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Condition */}
          <Text style={styles.sectionLabel}>Condition</Text>
          <View style={styles.chipGrid}>
            {CONDITIONS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, values.condition === c && styles.chipActive]}
                onPress={() => toggle('condition', c, values.condition)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, values.condition === c && styles.chipTextActive]}>
                  {CONDITION_LABELS[c]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Apply button */}
          <TouchableOpacity style={styles.applyButton} onPress={onApply} activeOpacity={0.8}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);
FilterSheet.displayName = 'FilterSheet';

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#1a1a2e',
  },
  handleIndicator: {
    backgroundColor: '#4a4a6a',
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    color: '#e0e0e0',
    fontSize: 20,
    fontWeight: '700',
  },
  clearText: {
    color: '#a78bfa',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionLabel: {
    color: '#a0a0c0',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 10,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#2a2a4a',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#3a3a5a',
  },
  chipActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#9d5ef5',
  },
  chipText: {
    color: '#c0c0e0',
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  applyButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
