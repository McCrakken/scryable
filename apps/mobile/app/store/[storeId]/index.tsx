// apps/mobile/app/store/[storeId]/index.tsx
import { useLocalSearchParams } from 'expo-router';
import { StoreScreen } from '@/features/stores/components';

export default function StoreRoute() {
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  return <StoreScreen storeId={storeId} />;
}
