// apps/mobile/features/stores/components/StoreScreen.tsx
import { useState } from 'react';
import { FlatList, Linking, Platform, Pressable, RefreshControl, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import Globe from 'lucide-react-native/icons/globe';
import MapPin from 'lucide-react-native/icons/map-pin';
import Phone from 'lucide-react-native/icons/phone';
import type { Store } from '@scryable/shared';
import { ErrorState } from '@/components/ErrorState';
import { ItemCard, ItemCardSkeleton } from '@/components/ItemCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { ApiError } from '@/lib/api';
import { THEME } from '@/lib/theme';
import { useStore, useStoreItems } from '../api';

export function StoreScreen({ storeId }: { storeId: string }) {
  const router = useRouter();
  const store = useStore(storeId);
  const items = useStoreItems(storeId);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  if (store.isPending) {
    return <StoreSkeleton />;
  }

  if (!store.data) {
    const notFound = store.error instanceof ApiError && store.error.status === 404;
    return (
      <>
        <Stack.Screen options={{ title: 'Store' }} />
        <ErrorState
          title={notFound ? 'Store not found' : "Couldn't load this store"}
          message={notFound ? undefined : store.error?.message}
          onRetry={notFound ? undefined : () => store.refetch()}
        />
      </>
    );
  }

  const handlePullRefresh = async () => {
    setIsPullRefreshing(true);
    await Promise.all([store.refetch(), items.refetch()]);
    setIsPullRefreshing(false);
  };

  return (
    <>
      <Stack.Screen options={{ title: store.data.name }} />
      <FlatList
        className="flex-1 bg-background"
        contentContainerClassName="px-4 pb-10 pt-4"
        data={items.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={() =>
              router.push({
                pathname: '/item/[storeId]/[itemId]',
                params: { storeId: item.storeId, itemId: item.id },
              })
            }
          />
        )}
        ListHeaderComponent={<StoreHeader store={store.data} itemCount={items.data?.length} />}
        ListEmptyComponent={
          items.isPending ? (
            <View>
              <ItemCardSkeleton />
              <ItemCardSkeleton />
            </View>
          ) : items.error ? (
            <View className="items-center gap-3 py-6">
              <Text className="text-center text-destructive">
                Couldn&apos;t load this store&apos;s items.
              </Text>
              <Button variant="secondary" onPress={() => items.refetch()}>
                <Text>Try again</Text>
              </Button>
            </View>
          ) : (
            <Text variant="muted" className="py-6 text-center">
              Nothing for sale right now. Check back soon.
            </Text>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isPullRefreshing}
            onRefresh={handlePullRefresh}
            tintColor={THEME.primary}
          />
        }
      />
    </>
  );
}

function StoreHeader({ store, itemCount }: { store: Store; itemCount?: number }) {
  const fullAddress = `${store.address}, ${store.city}, ${store.state} ${store.zipCode}`;
  const mapsUrl = Platform.select({
    ios: `https://maps.apple.com/?q=${encodeURIComponent(fullAddress)}`,
    default: `geo:0,0?q=${encodeURIComponent(fullAddress)}`,
  });
  const websiteUrl =
    store.website && !/^https?:\/\//.test(store.website)
      ? `https://${store.website}`
      : store.website;

  return (
    <View className="mb-4 gap-4">
      <View className="gap-1.5">
        <Text variant="h3">{store.name}</Text>
        {store.description ? <Text variant="muted">{store.description}</Text> : null}
      </View>

      <Card className="gap-0 py-1">
        <ContactRow icon={MapPin} label={fullAddress} onPress={() => Linking.openURL(mapsUrl)} />
        {store.phone ? (
          <>
            <Separator />
            <ContactRow
              icon={Phone}
              label={store.phone}
              onPress={() => Linking.openURL(`tel:${store.phone}`)}
            />
          </>
        ) : null}
        {websiteUrl ? (
          <>
            <Separator />
            <ContactRow
              icon={Globe}
              label={store.website!}
              onPress={() => Linking.openURL(websiteUrl)}
            />
          </>
        ) : null}
      </Card>

      <Text variant="h4">{itemCount === undefined ? 'For sale' : `For sale (${itemCount})`}</Text>
    </View>
  );
}

function ContactRow({
  icon,
  label,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      role="link"
      className="flex-row items-center gap-3 px-4 py-3 active:opacity-70"
    >
      <Icon as={icon} size={18} className="text-accent-foreground" />
      <Text className="flex-1">{label}</Text>
    </Pressable>
  );
}

function StoreSkeleton() {
  return (
    <View className="flex-1 gap-4 bg-background px-4 pt-4">
      <Skeleton className="h-7 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-6 w-28" />
      <ItemCardSkeleton />
    </View>
  );
}
