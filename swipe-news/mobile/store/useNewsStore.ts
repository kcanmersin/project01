import { create } from 'zustand';
import { NewsItem } from '../constants/types';
import { fetchNews } from '../services/rssService';
import {
  getSelectedCategories,
  saveSelectedCategories,
  getSelectedCountries,
  saveSelectedCountries,
} from '../services/storageService';
import { loadInterstitial, showInterstitialIfReady } from '../services/adService';

const AD_INTERVAL = 8;
const REFETCH_THRESHOLD = 5;

interface NewsState {
  items: NewsItem[];
  swipedIds: Set<string>;
  categories: string[];
  countries: string[];
  isLoading: boolean;
  isOffline: boolean;
  swipeCount: number;

  // Actions
  init: () => Promise<void>;
  fetchNews: () => Promise<void>;
  swipeLeft: (id: string) => void;
  swipeRight: (id: string) => void;
  setCategories: (cats: string[]) => void;
  setCountries: (countries: string[]) => void;
  getQueue: () => NewsItem[];
}

export const useNewsStore = create<NewsState>((set, get) => ({
  items: [],
  swipedIds: new Set(),
  categories: [],
  countries: [],
  isLoading: false,
  isOffline: false,
  swipeCount: 0,

  init: async () => {
    loadInterstitial();
    const [savedCats, savedCountries] = await Promise.all([
      getSelectedCategories(),
      getSelectedCountries(),
    ]);
    set({ categories: savedCats, countries: savedCountries });
    await get().fetchNews();
  },

  fetchNews: async () => {
    set({ isLoading: true });
    try {
      const { categories, countries, swipedIds } = get();
      const data = await fetchNews(categories, countries);
      // Daha önce görülmüş haberleri çıkart
      const fresh = data.filter((item) => !swipedIds.has(item.id));
      set({ items: fresh, isOffline: false });
    } catch {
      set({ isOffline: true });
    } finally {
      set({ isLoading: false });
    }
  },

  swipeLeft: (id: string) => {
    const { swipedIds, swipeCount, items } = get();
    const newSwiped = new Set(swipedIds).add(id);
    const newCount = swipeCount + 1;
    const remaining = items.filter((i) => !newSwiped.has(i.id));

    set({ swipedIds: newSwiped, swipeCount: newCount });

    // Reklam göster
    if (newCount % AD_INTERVAL === 0) {
      showInterstitialIfReady();
    }

    // Kuyruk azalınca yeniden yükle
    if (remaining.length <= REFETCH_THRESHOLD) {
      get().fetchNews();
    }
  },

  swipeRight: (id: string) => {
    get().swipeLeft(id); // aynı kuyruk mantığı
  },

  setCategories: async (cats: string[]) => {
    set({ categories: cats, items: [], swipedIds: new Set() });
    await saveSelectedCategories(cats);
    await get().fetchNews();
  },

  setCountries: async (countries: string[]) => {
    set({ countries, items: [], swipedIds: new Set() });
    await saveSelectedCountries(countries);
    await get().fetchNews();
  },

  getQueue: () => {
    const { items, swipedIds } = get();
    return items.filter((item) => !swipedIds.has(item.id));
  },
}));
