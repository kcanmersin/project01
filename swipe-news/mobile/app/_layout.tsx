import { useEffect } from 'react';
import { Tabs, router, Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Text } from 'react-native';
import { Colors } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.6 }}>
      {emoji}
    </Text>
  );
}

export default function RootLayout() {
  const { user, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate().then(() => {
      // After hydration, redirect based on auth state
    });
  }, []);

  // Redirect to login if not authenticated (after hydration)
  useEffect(() => {
    const authStore = useAuthStore.getState();
    if (!authStore.user) {
      router.replace('/login');
    }
  }, [user]);

  if (!user) {
    // Show nothing while redirecting — login screen handles itself
    return (
      <GestureHandlerRootView style={styles.root}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
        </Stack>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: Colors.tabBarActive,
          tabBarInactiveTintColor: Colors.tabBarInactive,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="(tabs)/index"
          options={{
            title: 'Haberler',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🔥" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="(tabs)/saved"
          options={{
            title: 'Kaydedilenler',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🔖" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="(tabs)/filter"
          options={{
            title: 'Filtrele',
            tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
          }}
        />
        {/* Auth screens hidden from tab bar */}
        <Tabs.Screen name="login" options={{ href: null }} />
        <Tabs.Screen name="register" options={{ href: null }} />
      </Tabs>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tabBar: {
    height: 64,
    paddingBottom: 8,
    paddingTop: 4,
    backgroundColor: Colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
});
