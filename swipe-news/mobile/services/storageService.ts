import AsyncStorage from '@react-native-async-storage/async-storage';
import { NewsItem } from '../constants/types';

const SAVED_KEY = 'saved_news';
const CATEGORIES_KEY = 'selected_categories';

// ── Saved news ──────────────────────────────────────────────────────────────

export async function getSavedNews(): Promise<NewsItem[]> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveNewsItem(item: NewsItem): Promise<void> {
  const current = await getSavedNews();
  if (current.find((n) => n.id === item.id)) return;
  await AsyncStorage.setItem(SAVED_KEY, JSON.stringify([item, ...current]));
}

export async function deleteSavedNews(id: string): Promise<void> {
  const current = await getSavedNews();
  const filtered = current.filter((n) => n.id !== id);
  await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(filtered));
}

// ── Category preferences ─────────────────────────────────────────────────────

export async function getSelectedCategories(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveSelectedCategories(categories: string[]): Promise<void> {
  await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}
