// apps/mobile/features/search/components/FilterSheet.tsx
import { forwardRef, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import type { Platform, Category, Condition } from '@scryable/shared';
import { PLATFORMS, CATEGORIES, CONDITIONS } from '@scryable/shared';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CATEGORY_LABELS, CONDITION_LABELS } from '@/lib/labels';
import { useThemeColors } from '@/lib/theme';

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

interface FilterGroupProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  getLabel?: (option: T) => string;
}

/** Single-select chip group; tapping the selected chip clears it. */
function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  getLabel = (option) => option,
}: FilterGroupProps<T>) {
  return (
    <View className="mt-5">
      <Text className="mb-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <ToggleGroup
        type="single"
        variant="outline"
        value={value}
        onValueChange={(next) => onChange(next as T | undefined)}
        className="flex-wrap gap-2"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option}
            value={option}
            aria-label={getLabel(option)}
            className="rounded-full border px-4"
          >
            <Text>{getLabel(option)}</Text>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </View>
  );
}

export const FilterSheet = forwardRef<BottomSheetModal, FilterSheetProps>(
  ({ values, onChange, onApply, onClear }, ref) => {
    const theme = useThemeColors();
    const snapPoints = useMemo(() => ['60%', '90%'], []);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        // Keep the fixed 60% / 90% detents instead of v5's content-height snap point.
        enableDynamicSizing={false}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.card }}
        handleIndicatorStyle={{ backgroundColor: theme.input, width: 40 }}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          {/* Header */}
          <View className="flex-row items-center justify-between py-4">
            <Text variant="h4">Filters</Text>
            <Button variant="link" onPress={onClear} className="px-0">
              <Text className="text-base text-accent-foreground">Clear All</Text>
            </Button>
          </View>

          <FilterGroup
            label="Platform"
            options={PLATFORMS}
            value={values.platform}
            onChange={(platform) => onChange({ ...values, platform })}
          />
          <FilterGroup
            label="Category"
            options={CATEGORIES}
            value={values.category}
            onChange={(category) => onChange({ ...values, category })}
            getLabel={(c) => CATEGORY_LABELS[c]}
          />
          <FilterGroup
            label="Condition"
            options={CONDITIONS}
            value={values.condition}
            onChange={(condition) => onChange({ ...values, condition })}
            getLabel={(c) => CONDITION_LABELS[c]}
          />

          <Button size="lg" onPress={onApply} className="mt-8">
            <Text className="text-base font-bold">Apply Filters</Text>
          </Button>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);
FilterSheet.displayName = 'FilterSheet';
