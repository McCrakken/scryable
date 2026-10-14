// apps/mobile/components/ItemCard.tsx
import { Pressable, View } from 'react-native';
import type { InventoryItem } from '@scryable/shared';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';

interface ItemCardProps {
  item: InventoryItem;
  onPress: () => void;
}

export function ItemCard({ item, onPress }: ItemCardProps) {
  return (
    <Pressable onPress={onPress} className="mb-3 active:opacity-80" role="button">
      <Card className="gap-2 p-4">
        <Text variant="large">{item.title}</Text>
        <View className="flex-row flex-wrap gap-2">
          <Badge variant="secondary">
            <Text>{item.platform}</Text>
          </Badge>
          <Badge variant="secondary">
            <Text>{item.condition}</Text>
          </Badge>
          <Badge variant="secondary">
            <Text>{item.category}</Text>
          </Badge>
        </View>
        <Text className="text-lg font-bold text-success">${Number(item.price).toFixed(2)}</Text>
      </Card>
    </Pressable>
  );
}

/** Placeholder with the same footprint as ItemCard, shown while the first page loads. */
export function ItemCardSkeleton() {
  return (
    <Card className="mb-3 gap-3 p-4">
      <Skeleton className="h-5 w-3/4" />
      <View className="flex-row gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </View>
      <Skeleton className="h-5 w-20" />
    </Card>
  );
}
