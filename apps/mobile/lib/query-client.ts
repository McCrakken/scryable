// apps/mobile/lib/query-client.ts
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { QueryCache, QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import type { PersistQueryClientProviderProps } from '@tanstack/react-query-persist-client';
import { ApiError } from './api';

const ONE_DAY = 1000 * 60 * 60 * 24;
const MAX_RETRIES = 3;

/**
 * Network failures and 5xx responses are worth retrying; 4xx responses won't
 * change on a retry (and retrying a 429 only digs the rate-limit hole deeper).
 */
function shouldRetry(failureCount: number, error: Error) {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return error.status === 408 && failureCount < MAX_RETRIES;
  }
  return failureCount < MAX_RETRIES;
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    // Unified error reporting. Screens still render their own error states.
    onError: (error, query) => {
      if (__DEV__) {
        console.warn(`[query] ${JSON.stringify(query.queryKey)} failed:`, error.message);
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Must be at least the persister's maxAge, or restored entries are garbage collected.
      gcTime: ONE_DAY,
      retry: shouldRetry,
    },
  },
});

// Pause queries while offline and resume them on reconnect. A null
// `isConnected` means "unknown" (e.g. at startup), so only `false` counts as offline.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(state.isConnected !== false)),
);

// Refetch stale queries when the app returns to the foreground.
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (status) =>
    handleFocus(status === 'active'),
  );
  return () => subscription.remove();
});

// Offline cache: successful queries are written to AsyncStorage and restored on launch.
export const persistOptions: PersistQueryClientProviderProps['persistOptions'] = {
  persister: createAsyncStoragePersister({
    storage: AsyncStorage,
    key: 'scryable-query-cache',
  }),
  maxAge: ONE_DAY,
  // Drop the persisted cache whenever the app version changes, in case response shapes changed.
  buster: Constants.expoConfig?.version ?? '',
};
