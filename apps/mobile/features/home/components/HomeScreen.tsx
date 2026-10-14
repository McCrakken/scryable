// apps/mobile/features/home/components/HomeScreen.tsx
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import PackagePlus from 'lucide-react-native/icons/package-plus';
import SearchIcon from 'lucide-react-native/icons/search';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useStores } from '@/features/stores/api';
import { cn } from '@/lib/utils';

export function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [storeId, setStoreId] = useState<string | undefined>();
  const stores = useStores();

  const selectedStore = stores.data?.find((store) => store.id === storeId);

  const search = () => {
    const q = query.trim();
    router.push({ pathname: '/search', params: q ? { q } : { all: '1' } });
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-8 px-4 pb-10 pt-8"
      keyboardShouldPersistTaps="handled"
    >
      {/* Search: the main entry point of the app */}
      <View className="gap-4">
        <View className="gap-1">
          <Text className="text-3xl font-extrabold tracking-tight">Find your next retro game</Text>
          <Text variant="muted" className="text-base">
            Search games, consoles, and accessories in stock at local stores.
          </Text>
        </View>
        <View className="flex-row gap-2.5">
          <Input
            className="h-14 flex-1 text-lg"
            placeholder="Search for a game or console…"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={search}
            aria-label="Search inventory"
          />
          <Button className="h-14 w-14" onPress={search} aria-label="Search">
            <Icon as={SearchIcon} size={22} />
          </Button>
        </View>
        <Button
          variant="link"
          className="self-start px-0"
          onPress={() => router.push({ pathname: '/search', params: { all: '1' } })}
        >
          <Text className="text-accent-foreground">Browse all inventory</Text>
        </Button>
      </View>

      <Separator />

      {/* Store tools */}
      <View className="gap-3">
        <View className="gap-1">
          <Text variant="h4">Manage Inventory</Text>
          <Text variant="muted">For store owners and staff.</Text>
        </View>

        <Card className="gap-4 p-4">
          {/* Until sign-in exists the app can't tell which stores you manage, so pick one. */}
          <View className="gap-2">
            <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Store
            </Text>
            <Select
              value={
                selectedStore ? { value: selectedStore.id, label: selectedStore.name } : undefined
              }
              onValueChange={(option) => setStoreId(option?.value)}
              disabled={!stores.data?.length}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    stores.isPending
                      ? 'Loading stores…'
                      : stores.isError
                        ? "Couldn't load stores"
                        : stores.data?.length
                          ? 'Choose your store'
                          : 'No stores yet'
                  }
                />
              </SelectTrigger>
              <SelectContent
                insets={{ top: insets.top, bottom: insets.bottom, left: 16, right: 16 }}
              >
                <SelectGroup>
                  {stores.data?.map((store) => (
                    <SelectItem key={store.id} value={store.id} label={store.name} />
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {stores.isError && (
              <Button variant="link" className="self-start px-0" onPress={() => stores.refetch()}>
                <Text className="text-accent-foreground">Try again</Text>
              </Button>
            )}
          </View>

          <Separator />

          <Pressable
            disabled={!storeId}
            onPress={() =>
              storeId &&
              router.push({ pathname: '/store/[storeId]/inventory/add', params: { storeId } })
            }
            role="button"
            aria-label="Add Inventory"
            className={cn(
              'flex-row items-center gap-3 active:opacity-70',
              !storeId && 'opacity-50',
            )}
          >
            <View className="h-11 w-11 items-center justify-center rounded-lg bg-accent">
              <Icon as={PackagePlus} size={22} className="text-accent-foreground" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold">Add Inventory</Text>
              <Text variant="muted">
                {storeId ? 'Photograph items and let AI identify them.' : 'Choose a store first.'}
              </Text>
            </View>
            <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
          </Pressable>
        </Card>
      </View>
    </ScrollView>
  );
}
