import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { NewsItem } from '../constants/types';
import { getCategoryById } from '../constants/categories';
import { Colors, Typography, Spacing, Radius, Shadow } from '../constants/theme';
import { fetchOgImage } from '../services/ogImageService';
import { COUNTRY_LANG_MAP } from '../services/translateService';
import TranslateModal from './TranslateModal';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const CARD_WIDTH = SCREEN_WIDTH - Spacing.md * 2;
export const CARD_HEIGHT = SCREEN_HEIGHT * 0.68;

interface Props {
  item: NewsItem;
  swipeDirectionX?: Animated.AnimatedInterpolation<string | number>;
  isTop?: boolean;
}

export default function NewsCard({ item, swipeDirectionX, isTop = false }: Props) {
  const [resolvedImage, setResolvedImage] = useState<string | null>(item.image_url);
  const [translateVisible, setTranslateVisible] = useState(false);
  const [translateText, setTranslateText] = useState('');
  const category = getCategoryById(item.category);
  const sourceLang = COUNTRY_LANG_MAP[item.country?.toUpperCase()] ?? 'en';

  useEffect(() => {
    if (!item.image_url && isTop) {
      fetchOgImage(item.url).then((url) => {
        if (url) setResolvedImage(url);
      });
    }
  }, [item.id, isTop]);

  const leftOpacity = swipeDirectionX
    ? swipeDirectionX.interpolate({
        inputRange: [-SCREEN_WIDTH * 0.25, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      })
    : new Animated.Value(0);

  const rightOpacity = swipeDirectionX
    ? swipeDirectionX.interpolate({
        inputRange: [0, SCREEN_WIDTH * 0.25],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      })
    : new Animated.Value(0);

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
    <View style={styles.card}>
      {/* Görsel alanı */}
      <View style={styles.imageContainer}>
        {resolvedImage ? (
          <Image
            source={{ uri: resolvedImage }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <LinearGradient
            colors={category?.gradient ?? ['#888', '#555']}
            style={styles.gradientFallback}
          >
            <Text style={styles.categoryIcon}>{category?.icon ?? '📰'}</Text>
          </LinearGradient>
        )}

        {/* Swipe overlay: Sol = ✗ */}
        <Animated.View style={[styles.overlay, styles.overlayLeft, { opacity: leftOpacity }]}>
          <Text style={styles.overlayText}>✗</Text>
        </Animated.View>

        {/* Swipe overlay: Sağ = ♥ */}
        <Animated.View style={[styles.overlay, styles.overlayRight, { opacity: rightOpacity }]}>
          <Text style={styles.overlayText}>♥</Text>
        </Animated.View>
      </View>

      {/* İçerik alanı */}
      <View style={styles.content}>
        <Pressable
          onLongPress={() => {
            setTranslateText(item.title);
            setTranslateVisible(true);
          }}
        >
          <Text style={styles.title} numberOfLines={3}>
            {item.title}
          </Text>
        </Pressable>
        {item.summary ? (
          <Pressable
            onLongPress={() => {
              setTranslateText(item.summary);
              setTranslateVisible(true);
            }}
          >
            <Text style={styles.summary} numberOfLines={2}>
              {item.summary}
            </Text>
          </Pressable>
        ) : null}

        <View style={styles.meta}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category?.label ?? item.category}</Text>
          </View>
          <Text style={styles.metaText}>
            {item.source} • {timeAgo}
          </Text>
        </View>
      </View>
      <TranslateModal
        visible={translateVisible}
        text={translateText}
        sourceLang={sourceLang}
        onClose={() => setTranslateVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    overflow: 'hidden',
    ...Shadow.card,
  },
  imageContainer: {
    width: '100%',
    height: '50%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 64,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.card,
  },
  overlayLeft: {
    backgroundColor: Colors.overlay.left,
  },
  overlayRight: {
    backgroundColor: Colors.overlay.right,
  },
  overlayText: {
    fontSize: 72,
    color: '#fff',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  title: {
    ...Typography.title,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  summary: {
    ...Typography.summary,
    color: Colors.textSecondary,
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  categoryBadge: {
    backgroundColor: Colors.primary + '20',
    borderRadius: Radius.chip,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  categoryText: {
    ...Typography.meta,
    color: Colors.primary,
    fontWeight: '600',
  },
  metaText: {
    ...Typography.meta,
    color: Colors.textMuted,
  },
});
