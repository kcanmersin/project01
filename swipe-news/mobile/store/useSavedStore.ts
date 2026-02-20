import { create } from 'zustand';
import { NewsItem } from '../constants/types';
import {
  getSavedNews,
  saveNewsItem,
  deleteSavedNews,
} from '../services/storageService';

interface SavedState {
  items: NewsItem[];
  hydrate: () => Promise<void>;
  save: (item: NewsItem) => Promise<void>;
  remove: (id: string) => Promise<void>;
  isSaved: (id: string) => boolean;
}

export const useSavedStore = create<SavedState>((set, get) => ({
  items: [],

  hydrate: async () => {
    const items = await getSavedNews();
    set({ items });
  },

  save: async (item: NewsItem) => {
    await saveNewsItem(item);
    set((state) => ({
      items: state.items.find((n) => n.id === item.id)
        ? state.items
        : [item, ...state.items],
    }));
  },

  remove: async (id: string) => {
    await deleteSavedNews(id);
    set((state) => ({ items: state.items.filter((n) => n.id !== id) }));
  },

  isSaved: (id: string) => get().items.some((n) => n.id === id),
}));
