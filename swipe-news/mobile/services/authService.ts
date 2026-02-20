import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface AuthUser {
  id: number;
  username: string;
  email: string | null;
  role: 'user' | 'admin' | 'superadmin';
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await axios.post<AuthResponse>(`${API_URL}/auth/login`, { username, password });
  await persistAuth(res.data);
  return res.data;
}

export async function register(
  username: string,
  password: string,
  email?: string
): Promise<AuthResponse> {
  const res = await axios.post<AuthResponse>(`${API_URL}/auth/register`, {
    username,
    password,
    email: email || undefined,
  });
  await persistAuth(res.data);
  return res.data;
}

async function persistAuth(data: AuthResponse): Promise<void> {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, data.access_token],
    [USER_KEY, JSON.stringify(data.user)],
  ]);
}

export async function loadStoredAuth(): Promise<{ token: string; user: AuthUser } | null> {
  try {
    const [[, token], [, userRaw]] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
    if (!token || !userRaw) return null;
    return { token, user: JSON.parse(userRaw) };
  } catch {
    return null;
  }
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const res = await axios.post<AuthResponse>(`${API_URL}/auth/google`, { id_token: idToken });
  await persistAuth(res.data);
  return res.data;
}

export async function logout(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}
