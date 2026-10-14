// apps/mobile/features/inventory/components/CameraCapture.tsx
import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import CameraIcon from 'lucide-react-native/icons/camera';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  onCapture: (photoUri: string) => void;
}

/** Full-screen camera with a shutter button. Handles the camera permission flow first. */
export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  // Permission status is still loading.
  if (!permission) {
    return <View className="flex-1 bg-background" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-8">
        <Icon as={CameraIcon} size={40} className="text-muted-foreground" />
        <Text variant="large" className="text-center">
          Camera access needed
        </Text>
        <Text variant="muted" className="text-center">
          Take a photo of the items you&apos;re adding and Scryable will identify them for you.
        </Text>
        {permission.canAskAgain ? (
          <Button onPress={requestPermission}>
            <Text>Allow camera access</Text>
          </Button>
        ) : (
          // The user declined permanently; only the system settings can re-enable it.
          <Button onPress={() => Linking.openSettings()}>
            <Text>Open Settings</Text>
          </Button>
        )}
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    setCaptureError(null);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      onCapture(photo.uri);
    } catch {
      setCaptureError("Couldn't take a photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
        onCameraReady={() => setIsReady(true)}
        onMountError={() => setCaptureError('The camera is unavailable on this device.')}
      />
      <View
        className="absolute inset-x-0 bottom-0 items-center bg-black/40 pt-4"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <Text className="mb-4 text-center text-white">
          {captureError ?? 'Fit every item you want to add in the frame'}
        </Text>
        <Pressable
          onPress={takePicture}
          disabled={!isReady || isCapturing}
          role="button"
          aria-label="Take photo"
          className={cn(
            'h-20 w-20 items-center justify-center rounded-full border-4 border-white active:opacity-70',
            (!isReady || isCapturing) && 'opacity-50',
          )}
        >
          {isCapturing ? (
            <ActivityIndicator color="white" />
          ) : (
            <View className="h-16 w-16 rounded-full bg-white" />
          )}
        </Pressable>
      </View>
    </View>
  );
}
