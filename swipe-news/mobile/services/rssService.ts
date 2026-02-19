import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NewsItem } from '../constants/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';
const CACHE_KEY = 'rss_cache';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 dakika

interface CacheEntry {
  data: NewsItem[];
  timestamp: number;
  categories: string[];
}

async function readCache(categories: string[]): Promise<NewsItem[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    const sameCategories =
      JSON.stringify([...entry.categories].sort()) ===
      JSON.stringify([...categories].sort());
    if (!sameCategories) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

async function writeCache(data: NewsItem[], categories: string[]): Promise<void> {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now(), categories };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // ignore storage errors
  }
}

export async function fetchNews(categories: string[]): Promise<NewsItem[]> {
  try {
    const params = categories.length ? { categories: categories.join(',') } : {};
    const res = await axios.get<{ items: NewsItem[] }>(`${API_URL}/feed`, { params, timeout: 15000 });
    const items = res.data.items;
    await writeCache(items, categories);
    return items;
  } catch {
    // Network hatası: cache'e düş
    const cached = await readCache(categories);
    if (cached) return cached;
    // En son herhangi bir cache
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) {
        const entry: CacheEntry = JSON.parse(raw);
        return entry.data;
      }
    } catch {
      // ignore
    }
    return [];
  }
}
