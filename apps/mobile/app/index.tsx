// apps/mobile/app/index.tsx
import { Stack } from 'expo-router';
import { HomeScreen } from '@/features/home/components';

export default function HomeRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Scryable' }} />
      <HomeScreen />
    </>
  );
}
