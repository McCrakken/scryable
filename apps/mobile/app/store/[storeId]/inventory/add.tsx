// apps/mobile/app/store/[storeId]/inventory/add.tsx
import { Stack, useLocalSearchParams } from 'expo-router';
import { AddInventoryScreen } from '@/features/inventory/components';

export default function AddInventoryRoute() {
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  return (
    <>
      <Stack.Screen options={{ title: 'Add Inventory' }} />
      <AddInventoryScreen storeId={storeId} />
    </>
  );
}
