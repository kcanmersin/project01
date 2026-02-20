import { Tabs } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Colors } from '../../constants/theme';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.6 }}>
      {emoji}
    </Text>
  );
}

export default function TabsLayout() {
  return (
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
        name="index"
        options={{
          title: 'Haberler',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔥" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Kaydedilenler',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔖" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="filter"
        options={{
          title: 'Filtrele',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 64,
    paddingBottom: 8,
    paddingTop: 4,
    backgroundColor: Colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
});
