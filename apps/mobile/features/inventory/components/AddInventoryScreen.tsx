// apps/mobile/features/inventory/components/AddInventoryScreen.tsx
import { useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import Camera from 'lucide-react-native/icons/camera';
import TriangleAlert from 'lucide-react-native/icons/triangle-alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useIdentifyItems } from '../api';
import { CameraCapture } from './CameraCapture';
import { IdentifiedItemCard } from './IdentifiedItemCard';
import { PhotoReview } from './PhotoReview';

/**
 * Inventory intake for store staff: take a photo → confirm it → AI image search identifies
 * the items in it. Reviewing, editing and submitting those items is the next step (SPECS §3.2).
 */
export function AddInventoryScreen({ storeId }: { storeId: string }) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const identify = useIdentifyItems(storeId);

  const startOver = () => {
    identify.reset();
    setIsConfirmed(false);
    setPhotoUri(null);
  };

  if (!photoUri) {
    return <CameraCapture onCapture={setPhotoUri} />;
  }

  if (!isConfirmed) {
    return (
      <PhotoReview
        photoUri={photoUri}
        onRetake={startOver}
        onConfirm={() => {
          setIsConfirmed(true);
          identify.mutate(photoUri);
        }}
      />
    );
  }

  const items = identify.data?.items ?? [];

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="px-4 pb-10 pt-4">
      {/* The photo being identified */}
      <View className="mb-4 flex-row items-center gap-3">
        <Image
          source={{ uri: photoUri }}
          className="h-20 w-20 rounded-md bg-muted"
          accessibilityLabel="Submitted photo"
        />
        <View className="flex-1">
          {identify.isPending ? (
            <>
              <Text variant="large">Identifying items…</Text>
              <Text variant="muted">
                {identify.isPaused
                  ? "You're offline. We'll send the photo when you reconnect."
                  : 'This usually takes a few seconds.'}
              </Text>
            </>
          ) : identify.isError ? (
            <Text variant="large">Identification failed</Text>
          ) : (
            <>
              <Text variant="large">
                {items.length === 1 ? 'Found 1 item' : `Found ${items.length} items`}
              </Text>
              <Text variant="muted">Check the details before adding them to inventory.</Text>
            </>
          )}
        </View>
      </View>

      {identify.isPending &&
        [0, 1].map((i) => (
          <Card key={i} className="mb-3 gap-3 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <View className="flex-row gap-2">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </View>
          </Card>
        ))}

      {identify.isError && (
        <View className="items-center gap-3 py-6">
          <Icon as={TriangleAlert} size={32} className="text-destructive" />
          <Text className="text-center text-destructive">
            {identify.error.message || "We couldn't identify the items in this photo."}
          </Text>
          <Button variant="secondary" onPress={() => identify.mutate(photoUri)}>
            <Text>Try again</Text>
          </Button>
        </View>
      )}

      {identify.isSuccess && items.length === 0 && (
        <Text variant="muted" className="py-6 text-center">
          No items were recognised. Try a closer photo with better lighting.
        </Text>
      )}

      {items.map((item, index) => (
        <IdentifiedItemCard key={`${item.title}-${index}`} item={item} />
      ))}

      {!identify.isPending && (
        <Button variant="outline" size="lg" className="mt-2" onPress={startOver}>
          <Icon as={Camera} size={16} />
          <Text>Take another photo</Text>
        </Button>
      )}
    </ScrollView>
  );
}
