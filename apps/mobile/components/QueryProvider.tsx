// apps/mobile/components/QueryProvider.tsx
import type { PropsWithChildren } from 'react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { persistOptions, queryClient } from '@/lib/query-client';

export function QueryProvider({ children }: PropsWithChildren) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
      // Replay any mutations that were queued while offline once the cache is restored.
      onSuccess={() => queryClient.resumePausedMutations()}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
