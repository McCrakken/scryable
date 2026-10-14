// apps/mobile/app/_layout.tsx
import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryProvider } from '@/components/QueryProvider';

export default function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <QueryProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#1a1a2e' },
            headerTintColor: '#e0e0e0',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
