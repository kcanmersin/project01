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
  countries: string[];
}

async function readCache(categories: string[], countries: string[]): Promise<NewsItem[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    const sameCategories =
      JSON.stringify([...(entry.categories ?? [])].sort()) ===
      JSON.stringify([...categories].sort());
    const sameCountries =
      JSON.stringify([...(entry.countries ?? [])].sort()) ===
      JSON.stringify([...countries].sort());
    if (!sameCategories || !sameCountries) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

async function writeCache(data: NewsItem[], categories: string[], countries: string[]): Promise<void> {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now(), categories, countries };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // ignore storage errors
  }
}

export async function fetchNews(categories: string[], countries: string[]): Promise<NewsItem[]> {
  try {
    const params: Record<string, string> = {};
    if (categories.length) params.categories = categories.join(',');
    if (countries.length)  params.countries  = countries.join(',');
    const res = await axios.get<{ items: NewsItem[] }>(`${API_URL}/feed`, { params, timeout: 15000 });
    const items = res.data.items;
    await writeCache(items, categories, countries);
    return items;
  } catch {
    // Network hatası: cache'e düş
    const cached = await readCache(categories, countries);
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
