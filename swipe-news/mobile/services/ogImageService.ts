import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';
const CACHE_PREFIX = 'ogimg:';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 saat

interface CacheEntry {
  url: string | null;
  timestamp: number;
}

export async function fetchOgImage(articleUrl: string): Promise<string | null> {
  const cacheKey = CACHE_PREFIX + articleUrl;

  try {
    const raw = await AsyncStorage.getItem(cacheKey);
    if (raw) {
      const entry: CacheEntry = JSON.parse(raw);
      if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
        return entry.url;
      }
    }
  } catch {
    // ignore
  }

  try {
    const res = await axios.get<{ image_url: string | null }>(`${API_URL}/ogimage`, {
      params: { url: articleUrl },
      timeout: 6000,
    });
    const imageUrl = res.data.image_url ?? null;
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({ url: imageUrl, timestamp: Date.now() })
    );
    return imageUrl;
  } catch {
    return null;
  }
}
