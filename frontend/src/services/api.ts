const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Movie types from backend
export interface Movie {
  id: string;
  tmdbId: number;
  title: string;
  originalTitle: string | null;
  overview: string | null;
  releaseDate: string | null;
  runtime: number | null;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number | null;
  voteCount: number | null;
  popularity: number | null;
  status: string | null;
  tagline: string | null;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetail extends Movie {
  homepage: string | null;
  budget: number | null;
  revenue: number | null;
  imdbId: string | null;
  genres: Genre[];
  cast: CastMember[];
  crew: CrewMember[];
}

export interface CastMember {
  personId: string;
  name: string;
  character: string | null;
  profilePath: string | null;
  castOrder: number | null;
}

export interface CrewMember {
  personId: string;
  name: string;
  job: string | null;
  department: string | null;
  profilePath: string | null;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface MoviesQueryParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: 'Title' | 'ReleaseDate' | 'VoteAverage' | 'Popularity';
  sortDescending?: boolean;
  genreIds?: number[];
  minRating?: number;
  maxRating?: number;
  minYear?: number;
  maxYear?: number;
}

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

// Helper to build query string
const buildQueryString = (params: MoviesQueryParams): string => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append('PageNumber', params.page.toString());
  if (params.pageSize) searchParams.append('PageSize', params.pageSize.toString());
  if (params.searchTerm) searchParams.append('SearchTerm', params.searchTerm);
  if (params.sortBy) searchParams.append('SortBy', params.sortBy);
  if (params.sortDescending !== undefined) searchParams.append('SortDescending', params.sortDescending.toString());
  if (params.genreIds?.length) {
    params.genreIds.forEach(id => searchParams.append('GenreIds', id.toString()));
  }
  if (params.minRating) searchParams.append('MinRating', params.minRating.toString());
  if (params.maxRating) searchParams.append('MaxRating', params.maxRating.toString());
  if (params.minYear) searchParams.append('MinYear', params.minYear.toString());
  if (params.maxYear) searchParams.append('MaxYear', params.maxYear.toString());

  return searchParams.toString();
};

// Get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = tokenStorage.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const moviesApi = {
  async getMovies(params: MoviesQueryParams = {}): Promise<PagedResult<Movie>> {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/api/movies?${queryString}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch movies');
    }

    return response.json();
  },

  async getPopular(page: number = 1, pageSize: number = 20): Promise<PagedResult<Movie>> {
    return this.getMovies({
      page,
      pageSize,
      sortBy: 'Popularity',
      sortDescending: true,
    });
  },

  async getTopRated(page: number = 1, pageSize: number = 20): Promise<PagedResult<Movie>> {
    return this.getMovies({
      page,
      pageSize,
      sortBy: 'VoteAverage',
      sortDescending: true,
      minRating: 7, // Only highly rated movies
    });
  },

  async getTrending(page: number = 1, pageSize: number = 20): Promise<PagedResult<Movie>> {
    // Trending = recent + popular
    const currentYear = new Date().getFullYear();
    return this.getMovies({
      page,
      pageSize,
      sortBy: 'Popularity',
      sortDescending: true,
      minYear: currentYear - 1,
    });
  },

  async getUpcoming(page: number = 1, pageSize: number = 20): Promise<PagedResult<Movie>> {
    // Upcoming = future releases sorted by date
    const currentYear = new Date().getFullYear();
    return this.getMovies({
      page,
      pageSize,
      sortBy: 'ReleaseDate',
      sortDescending: false,
      minYear: currentYear,
    });
  },

  async getNowPlaying(page: number = 1, pageSize: number = 20): Promise<PagedResult<Movie>> {
    // Now playing = recent releases
    const currentYear = new Date().getFullYear();
    return this.getMovies({
      page,
      pageSize,
      sortBy: 'ReleaseDate',
      sortDescending: true,
      minYear: currentYear,
    });
  },

  async getMovieById(id: string): Promise<Movie> {
    const response = await fetch(`${API_BASE_URL}/api/movies/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch movie');
    }

    return response.json();
  },

  async getMovieDetail(id: string): Promise<MovieDetail> {
    const response = await fetch(`${API_BASE_URL}/api/movies/${id}/detail`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch movie details');
    }

    return response.json();
  },

  async searchMovies(query: string, page: number = 1, pageSize: number = 20): Promise<PagedResult<Movie>> {
    return this.getMovies({
      page,
      pageSize,
      searchTerm: query,
      sortBy: 'Popularity',
      sortDescending: true,
    });
  },

  async getMoviesByGenre(genreId: number, page: number = 1, pageSize: number = 20): Promise<PagedResult<Movie>> {
    return this.getMovies({
      page,
      pageSize,
      genreIds: [genreId],
      sortBy: 'Popularity',
      sortDescending: true,
    });
  },
};
