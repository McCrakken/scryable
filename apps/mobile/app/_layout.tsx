// apps/mobile/app/_layout.tsx
import '../global.css';
import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalHost } from '@rn-primitives/portal';
import { QueryProvider } from '@/components/QueryProvider';
import { NAV_THEME } from '@/lib/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <QueryProvider>
        <ThemeProvider value={NAV_THEME}>
          {/* Modals mount in this provider's portal host, so it must sit inside every
              context their content needs (query client, navigation theme). */}
          <BottomSheetModalProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerTitleStyle: { fontWeight: 'bold' } }} />
            <PortalHost />
          </BottomSheetModalProvider>
        </ThemeProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
