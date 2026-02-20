import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { Colors } from '../constants/theme';

function AuthGuard({ hydrated }: { hydrated: boolean }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!hydrated) return;

    const inTabs = segments[0] === '(tabs)';

    if (!user && inTabs) {
      router.replace('/login');
    } else if (user && !inTabs) {
      router.replace('/(tabs)/');
    }
  }, [user, segments, hydrated]);

  return null;
}

export default function RootLayout() {
  const { hydrate } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    hydrate().finally(() => setHydrated(true));
  }, []);

  if (!hydrated) {
    return (
      <GestureHandlerRootView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthGuard hydrated={hydrated} />
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}
