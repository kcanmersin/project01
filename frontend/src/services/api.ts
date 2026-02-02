const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    createdAt: string;
    profileImageId: string | null;
    coverImageId: string | null;
    isEmailVerified: boolean;
    hasGoogleLinked: boolean;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export const authApi = {
  async googleLogin(idToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Google login failed');
    }

    return response.json();
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  async register(email: string, username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  },
};

export const tokenStorage = {
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  },

  removeToken(): void {
    localStorage.removeItem('auth_token');
  },

  getUser(): AuthResponse['user'] | null {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  },

  setUser(user: AuthResponse['user']): void {
    localStorage.setItem('auth_user', JSON.stringify(user));
  },

  removeUser(): void {
    localStorage.removeItem('auth_user');
  },

  clear(): void {
    this.removeToken();
    this.removeUser();
  },
};
