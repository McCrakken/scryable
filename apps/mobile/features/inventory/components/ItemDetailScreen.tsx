// apps/mobile/features/inventory/components/ItemDetailScreen.tsx
import { Image, Pressable, ScrollView, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import Hand from 'lucide-react-native/icons/hand';
import ImageOff from 'lucide-react-native/icons/image-off';
import StoreIcon from 'lucide-react-native/icons/store';
import { ErrorState } from '@/components/ErrorState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useStore } from '@/features/stores/api';
import { ApiError } from '@/lib/api';
import { CATEGORY_LABELS, CONDITION_LABELS } from '@/lib/labels';
import { useItem } from '../api';

interface ItemDetailScreenProps {
  storeId: string;
  itemId: string;
}

export function ItemDetailScreen({ storeId, itemId }: ItemDetailScreenProps) {
  const router = useRouter();
  const { data: item, error, isPending, refetch } = useItem(storeId, itemId);
  const { data: store } = useStore(storeId);

  if (isPending) {
    return <ItemDetailSkeleton />;
  }

  if (!item) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <>
        <Stack.Screen options={{ title: 'Item' }} />
        <ErrorState
          title={notFound ? 'Item not found' : "Couldn't load this item"}
          message={notFound ? 'It may have been removed from the store.' : error?.message}
          onRetry={notFound ? undefined : () => refetch()}
        />
      </>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-5 px-4 pb-10 pt-4">
      <Stack.Screen options={{ title: item.title }} />

      {/* Photos */}
      {item.imageUrls.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3"
        >
          {item.imageUrls.map((uri) => (
            <Image
              key={uri}
              source={{ uri }}
              resizeMode="cover"
              className="h-64 w-64 rounded-xl bg-muted"
              accessibilityLabel={item.title}
            />
          ))}
        </ScrollView>
      ) : (
        <View className="h-48 items-center justify-center rounded-xl bg-muted">
          <Icon as={ImageOff} size={40} className="text-muted-foreground" />
        </View>
      )}

      {/* Summary */}
      <View className="gap-3">
        <Text variant="h3">{item.title}</Text>
        <View className="flex-row flex-wrap gap-2">
          {item.isSold && (
            <Badge variant="destructive">
              <Text>Sold</Text>
            </Badge>
          )}
          {item.isPromoted && (
            <Badge>
              <Text>Featured</Text>
            </Badge>
          )}
          <Badge variant="secondary">
            <Text>{item.platform}</Text>
          </Badge>
          <Badge variant="secondary">
            <Text>{CATEGORY_LABELS[item.category]}</Text>
          </Badge>
          <Badge variant="secondary">
            <Text>{CONDITION_LABELS[item.condition]}</Text>
          </Badge>
        </View>
        <Text className="text-2xl font-bold text-success">${Number(item.price).toFixed(2)}</Text>
      </View>

      {item.description ? (
        <View className="gap-1.5">
          <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Description
          </Text>
          <Text>{item.description}</Text>
        </View>
      ) : null}

      {/* Seller */}
      <Pressable
        onPress={() => router.push({ pathname: '/store/[storeId]', params: { storeId } })}
        role="link"
        aria-label={store ? `View ${store.name}` : 'View store'}
        className="active:opacity-80"
      >
        <Card className="flex-row items-center gap-3 p-4">
          <Icon as={StoreIcon} size={20} className="text-accent-foreground" />
          <View className="flex-1">
            <Text variant="muted">Sold by</Text>
            <Text className="font-semibold">{store?.name ?? 'View store'}</Text>
            {store ? (
              <Text variant="muted">
                {store.city}, {store.state}
              </Text>
            ) : null}
          </View>
          <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
        </Card>
      </Pressable>

      {/* Hold requests aren't available in the API yet (SPECS §7, planned). */}
      {item.isSold ? (
        <Text variant="muted" className="text-center">
          This item has been sold.
        </Text>
      ) : (
        <View className="gap-2">
          <Button size="lg" disabled>
            <Icon as={Hand} size={16} />
            <Text className="text-base font-bold">Place hold</Text>
          </Button>
          <Text variant="muted" className="text-center">
            Reserving items for in-store pickup is coming soon.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function ItemDetailSkeleton() {
  return (
    <View className="flex-1 gap-5 bg-background px-4 pt-4">
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-7 w-3/4" />
      <View className="flex-row gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </View>
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-20 w-full" />
    </View>
  );
}
