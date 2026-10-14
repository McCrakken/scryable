// apps/mobile/components/ErrorState.tsx
import { View } from 'react-native';
import TriangleAlert from 'lucide-react-native/icons/triangle-alert';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

interface ErrorStateProps {
  title: string;
  message?: string;
  /** Omit for errors a retry can't fix (e.g. 404). */
  onRetry?: () => void;
}

/** Full-screen error with an optional retry, for screens whose primary query failed. */
export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background px-8">
      <Icon as={TriangleAlert} size={32} className="text-destructive" />
      <Text variant="large" className="text-center">
        {title}
      </Text>
      {message ? (
        <Text variant="muted" className="text-center">
          {message}
        </Text>
      ) : null}
      {onRetry ? (
        <Button variant="secondary" onPress={onRetry}>
          <Text>Try again</Text>
        </Button>
      ) : null}
    </View>
  );
}
