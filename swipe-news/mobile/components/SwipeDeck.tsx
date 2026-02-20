import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import * as WebBrowser from 'expo-web-browser';
import { NewsItem } from '../constants/types';
import NewsCard, { CARD_WIDTH, CARD_HEIGHT } from './NewsCard';
import { Colors, Spacing } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface Props {
  items: NewsItem[];
  onSwipeLeft: (item: NewsItem) => void;
  onSwipeRight: (item: NewsItem) => void;
  onEmpty: () => void;
}

export default function SwipeDeck({ items, onSwipeLeft, onSwipeRight, onEmpty }: Props) {
  const swiperRef = useRef<Swiper<NewsItem>>(null);

  const handleSwipedLeft = useCallback(
    (index: number) => {
      if (items[index]) onSwipeLeft(items[index]);
    },
    [items, onSwipeLeft]
  );

  const handleSwipedRight = useCallback(
    (index: number) => {
      if (items[index]) onSwipeRight(items[index]);
    },
    [items, onSwipeRight]
  );

  const handleTapCard = useCallback(
    async (index: number) => {
      const item = items[index];
      if (item?.url) {
        await WebBrowser.openBrowserAsync(item.url);
      }
    },
    [items]
  );

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Swiper
        ref={swiperRef}
        cards={items}
        renderCard={(item, index) =>
          item ? (
            <NewsCard
              key={item.id}
              item={item}
              isTop={index === 0}
            />
          ) : null
        }
        onSwipedLeft={handleSwipedLeft}
        onSwipedRight={handleSwipedRight}
        onTapCard={handleTapCard}
        onSwipedAll={onEmpty}
        cardIndex={0}
        backgroundColor="transparent"
        stackSize={3}
        stackSeparation={12}
        stackScale={4}
        disableTopSwipe
        disableBottomSwipe
        horizontalThreshold={SWIPE_THRESHOLD}
        animateCardOpacity
        swipeAnimationDuration={250}
        cardVerticalMargin={0}
        cardHorizontalMargin={Spacing.md}
        overlayLabels={{
          left: {
            title: '✗',
            style: {
              label: {
                color: '#fff',
                fontSize: 48,
                fontWeight: '700',
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                marginTop: 20,
                marginLeft: -20,
              },
            },
          },
          right: {
            title: '♥',
            style: {
              label: {
                color: '#fff',
                fontSize: 48,
                fontWeight: '700',
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                marginTop: 20,
                marginLeft: 20,
              },
            },
          },
        }}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
