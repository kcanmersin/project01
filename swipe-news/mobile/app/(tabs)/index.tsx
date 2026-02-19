import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useNewsStore } from '../../store/useNewsStore';
import { useSavedStore } from '../../store/useSavedStore';
import { useAuthStore } from '../../store/useAuthStore';
import { NewsItem } from '../../constants/types';
import SwipeDeck from '../../components/SwipeDeck';
import { Colors, Spacing, Typography } from '../../constants/theme';

export default function HomeScreen() {
  const { init, getQueue, swipeLeft, swipeRight, isLoading, isOffline, fetchNews } =
    useNewsStore();
  const { save, hydrate } = useSavedStore();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  useEffect(() => {
    hydrate();
    init();
  }, []);

  const queue = getQueue();

  const handleSwipeLeft = useCallback(
    (item: NewsItem) => {
      swipeLeft(item.id);
    },
    [swipeLeft]
  );

  const handleSwipeRight = useCallback(
    (item: NewsItem) => {
      swipeRight(item.id);
      save(item);
    },
    [swipeRight, save]
  );

  const handleEmpty = useCallback(() => {
    fetchNews();
  }, [fetchNews]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>SwipeNews</Text>
        <View style={styles.headerRight}>
          {user && (
            <View style={[styles.roleBadge, { backgroundColor: roleColor(user.role) }]}>
              <Text style={styles.roleText}>{user.role}</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/filter')}
            style={styles.filterBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.filterIcon}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.filterBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.filterIcon}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Offline banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Çevrimdışı mod — önbellek gösteriliyor</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.deckContainer}>
        {isLoading && queue.length === 0 ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : queue.length === 0 ? (
          <EmptyState onRefresh={fetchNews} />
        ) : (
          <SwipeDeck
            items={queue}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onEmpty={handleEmpty}
          />
        )}
      </View>

      {/* Swipe hints */}
      {queue.length > 0 && (
        <View style={styles.hints}>
          <Text style={styles.hintText}>← atla</Text>
          <Text style={styles.hintCenter}>↑ aç</Text>
          <Text style={styles.hintText}>kaydet →</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function roleColor(role: string) {
  if (role === 'superadmin') return '#9C27B0';
  if (role === 'admin') return '#FF9800';
  return '#4CAF50';
}

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🎉</Text>
      <Text style={styles.emptyTitle}>Tüm haberleri gördünüz!</Text>
      <Text style={styles.emptySubtitle}>Yeni haberler için yenileyin</Text>
      <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
        <Text style={styles.refreshText}>Yenile</Text>
      </TouchableOpacity>
    </View>
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
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  roleBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },
  filterBtn: {
    padding: Spacing.xs,
  },
  filterIcon: {
    fontSize: 22,
  },
  offlineBanner: {
    backgroundColor: '#FFA726',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  offlineText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deckContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.md,
  },
  hints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  hintText: {
    ...Typography.meta,
    color: Colors.textMuted,
  },
  hintCenter: {
    ...Typography.meta,
    color: Colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.summary,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  refreshBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: 24,
    minHeight: 44,
    justifyContent: 'center',
  },
  refreshText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
