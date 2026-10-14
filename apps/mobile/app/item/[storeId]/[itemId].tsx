// apps/mobile/app/item/[storeId]/[itemId].tsx
import { useLocalSearchParams } from 'expo-router';
import { ItemDetailScreen } from '@/features/inventory/components';

export default function ItemRoute() {
  const { storeId, itemId } = useLocalSearchParams<{ storeId: string; itemId: string }>();
  return <ItemDetailScreen storeId={storeId} itemId={itemId} />;
}
