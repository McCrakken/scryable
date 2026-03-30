// apps/mobile/app/components/FilterSheet.tsx
import { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import type { Platform, Category, Condition } from '@scryable/shared';
import { PLATFORMS, CATEGORIES, CONDITIONS } from '@scryable/shared';
import { ui } from '@/lib/styles';

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
      onChange({ ...values, [key]: current === value ? undefined : value });
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#1a1a2e' }}
        handleIndicatorStyle={{ backgroundColor: '#4a4a6a', width: 40 }}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          {/* Header */}
          <View className={ui.sheetHeader}>
            <Text className={ui.sheetTitle}>Filters</Text>
            <TouchableOpacity onPress={onClear}>
              <Text className={ui.sheetClear}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {/* Platform */}
          <Text className={`${ui.label} mt-5 mb-2.5`}>Platform</Text>
          <View className="flex-row flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <TouchableOpacity
                key={p}
                className={values.platform === p ? ui.chipActive : ui.chip}
                onPress={() => toggle('platform', p, values.platform)}
                activeOpacity={0.7}
              >
                <Text className={values.platform === p ? ui.chipTextActive : ui.chipText}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category */}
          <Text className={`${ui.label} mt-5 mb-2.5`}>Category</Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                className={values.category === c ? ui.chipActive : ui.chip}
                onPress={() => toggle('category', c, values.category)}
                activeOpacity={0.7}
              >
                <Text className={values.category === c ? ui.chipTextActive : ui.chipText}>
                  {CATEGORY_LABELS[c]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Condition */}
          <Text className={`${ui.label} mt-5 mb-2.5`}>Condition</Text>
          <View className="flex-row flex-wrap gap-2">
            {CONDITIONS.map((c) => (
              <TouchableOpacity
                key={c}
                className={values.condition === c ? ui.chipActive : ui.chip}
                onPress={() => toggle('condition', c, values.condition)}
                activeOpacity={0.7}
              >
                <Text className={values.condition === c ? ui.chipTextActive : ui.chipText}>
                  {CONDITION_LABELS[c]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Apply */}
          <TouchableOpacity
            className={`${ui.btnPrimary} mt-8`}
            onPress={onApply}
            activeOpacity={0.8}
          >
            <Text className={ui.btnPrimaryText}>Apply Filters</Text>
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);
FilterSheet.displayName = 'FilterSheet';
