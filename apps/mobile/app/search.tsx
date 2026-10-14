// apps/mobile/app/search.tsx
import { Stack } from 'expo-router';
import { SearchScreen } from '@/features/search/components';

export default function SearchRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Search' }} />
      <SearchScreen />
    </>
  );
}
