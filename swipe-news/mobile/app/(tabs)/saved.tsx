import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useSavedStore } from '../../store/useSavedStore';
import { NewsItem } from '../../constants/types';
import NewsListItem from '../../components/NewsListItem';
import AdBanner from '../../components/AdBanner';
import { Colors, Spacing, Typography } from '../../constants/theme';

function RightAction({ prog, drag }: { prog: SharedValue<number>; drag: SharedValue<number> }) {
  const styleAnimation = useAnimatedStyle(() => ({
    transform: [{ translateX: drag.value + 80 }],
  }));
  return (
    <Reanimated.View style={[styles.deleteAction, styleAnimation]}>
      <Text style={styles.deleteText}>Sil</Text>
    </Reanimated.View>
  );
}

export default function SavedScreen() {
  const { items, remove } = useSavedStore();

  const renderItem = useCallback(
    ({ item }: { item: NewsItem }) => (
      <ReanimatedSwipeable
        friction={2}
        rightThreshold={40}
        renderRightActions={(prog, drag) => <RightAction prog={prog} drag={drag} />}
        onSwipeableOpen={() => remove(item.id)}
      >
        <NewsListItem item={item} />
      </ReanimatedSwipeable>
    ),
    [remove]
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Kaydedilenler</Text>
            <Text style={styles.headerSub}>Sağa kaydırdığınız haberler</Text>
          </View>
          {items.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{items.length}</Text>
            </View>
          )}
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔖</Text>
            <Text style={styles.emptyTitle}>Henüz haber kaydetmediniz</Text>
            <Text style={styles.emptySubtitle}>
              Ana ekranda sağa kaydırarak haberleri kaydedin
            </Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListFooterComponent={<AdBanner />}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  countBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  countText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  list: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.lg,
  },
  deleteAction: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: Spacing.xs,
    borderRadius: 8,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...Typography.summary,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
