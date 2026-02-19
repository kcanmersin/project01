import { Tabs } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Text } from 'react-native';
import { Colors } from '../constants/theme';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.6 }}>
      {emoji}
    </Text>
  );
}

export default function RootLayout() {
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
