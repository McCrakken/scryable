// apps/mobile/features/inventory/components/IdentifiedItemCard.tsx
import { View } from 'react-native';
import type { IdentifiedItem } from '@scryable/shared';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { CATEGORY_LABELS, CONDITION_LABELS } from '@/lib/labels';

export function IdentifiedItemCard({ item }: { item: IdentifiedItem }) {
  return (
    <Card className="mb-3 gap-2 p-4">
      <Text variant="large">{item.title}</Text>
      {item.description ? <Text variant="muted">{item.description}</Text> : null}
      <View className="flex-row flex-wrap gap-2">
        <Badge variant="secondary">
          <Text>{item.platform}</Text>
        </Badge>
        <Badge variant="secondary">
          <Text>{CATEGORY_LABELS[item.category]}</Text>
        </Badge>
        <Badge variant="secondary">
          <Text>{CONDITION_LABELS[item.condition]}</Text>
        </Badge>
      </View>
      <Text className="text-lg font-bold text-success">${Number(item.price).toFixed(2)}</Text>
    </Card>
  );
}
