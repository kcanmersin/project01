import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { NewsItem } from '../constants/types';
import { getCategoryById } from '../constants/categories';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Props {
  item: NewsItem;
}

export default function NewsListItem({ item }: Props) {
  const category = getCategoryById(item.category);

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(item.published_at), {
        addSuffix: true,
        locale: tr,
      });
    } catch {
      return '';
    }
  })();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => WebBrowser.openBrowserAsync(item.url)}
      activeOpacity={0.75}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnail}>
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.thumbnailImg}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.thumbnailImg, styles.thumbnailFallback]}>
            <Text style={styles.fallbackIcon}>{category?.icon ?? '📰'}</Text>
          </View>
        )}
      </View>

      {/* Text */}
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.meta}>
          {item.source} • {timeAgo}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    borderRadius: Radius.small,
    overflow: 'hidden',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: Radius.small,
    overflow: 'hidden',
    marginRight: Spacing.sm,
    flexShrink: 0,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  thumbnailFallback: {
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackIcon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...Typography.summary,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  meta: {
    ...Typography.meta,
    color: Colors.textMuted,
  },
});
