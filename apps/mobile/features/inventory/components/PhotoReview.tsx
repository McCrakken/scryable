// apps/mobile/features/inventory/components/PhotoReview.tsx
import { Image, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Check from 'lucide-react-native/icons/check';
import RotateCcw from 'lucide-react-native/icons/rotate-ccw';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

interface PhotoReviewProps {
  photoUri: string;
  onRetake: () => void;
  onConfirm: () => void;
}

/** Lets staff check the photo is sharp and complete before it's sent for identification. */
export function PhotoReview({ photoUri, onRetake, onConfirm }: PhotoReviewProps) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-black">
      <Image
        source={{ uri: photoUri }}
        resizeMode="contain"
        className="flex-1"
        accessibilityLabel="Captured photo"
      />
      <View className="gap-3 bg-background px-4 pt-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <Text variant="muted" className="text-center">
          Is every item visible and in focus?
        </Text>
        <View className="flex-row gap-3">
          <Button variant="outline" size="lg" className="flex-1" onPress={onRetake}>
            <Icon as={RotateCcw} size={16} />
            <Text>Retake</Text>
          </Button>
          <Button size="lg" className="flex-1" onPress={onConfirm}>
            <Icon as={Check} size={16} />
            <Text>Use photo</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
