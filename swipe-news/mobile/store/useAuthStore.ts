import { create } from 'zustand';
import {
  AuthUser,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  loadStoredAuth,
} from '../services/authService';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  hydrate: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  hydrate: async () => {
    const stored = await loadStoredAuth();
    if (stored) {
      set({ user: stored.user, token: stored.token });
    }
  },

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiLogin(username, password);
      set({ user: data.user, token: data.access_token, isLoading: false });
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ?? 'Giriş başarısız, tekrar deneyin';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  register: async (username, password, email) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiRegister(username, password, email);
      set({ user: data.user, token: data.access_token, isLoading: false });
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ?? 'Kayıt başarısız, tekrar deneyin';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  logout: async () => {
    await apiLogout();
    set({ user: null, token: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
