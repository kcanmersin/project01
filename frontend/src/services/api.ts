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
  tmdbId?: number;
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

  async forgotPassword(email: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send reset email');
    }

    return response.json();
  },

  async resetPassword(token: string, newPassword: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reset password');
    }

    return response.json();
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<string> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
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

// ============= RATING TYPES =============

export interface Rating {
  id: string;
  userId: string;
  username: string;
  movieId: string;
  rating: number;
  review: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface UserRating {
  movieId: string;
  rating: number;
  review: string | null;
  createdAt: string;
}

export interface MovieRatingStats {
  movieId: string;
  averageRating: number;
  totalRatings: number;
  ratingDistribution: number[];
}

// ============= LIST TYPES =============

export interface MovieList {
  id: string;
  userId: string;
  username: string;
  title: string;
  description: string | null;
  coverImageId: string | null;
  listType: 'Watchlist' | 'Favorites' | 'Custom';
  isPublic: boolean;
  movieCount: number;
  favoriteCount: number;
  isFavoritedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface MovieListItem {
  id: string;
  movieId: string;
  movieTitle: string;
  moviePosterPath: string | null;
  movieVoteAverage: number | null;
  movieReleaseDate: string | null;
  order: number;
  note: string | null;
  addedAt: string;
}

export interface MovieListDetail extends MovieList {
  isOwner: boolean;
  items: MovieListItem[];
}

export interface SimpleList {
  id: string;
  title: string;
  listType: string;
  movieCount: number;
  containsMovie: boolean;
}

// ============= COMMENT TYPES =============

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userProfileImageId: string | null;
  targetType: string;
  targetId: string;
  parentCommentId: string | null;
  content: string;
  upvoteCount: number;
  downvoteCount: number;
  replyCount: number;
  currentUserVote: 'Upvote' | 'Downvote' | null;
  createdAt: string;
  updatedAt: string | null;
  replies: Comment[] | null;
}

export interface CommentVoteResult {
  upvoteCount: number;
  downvoteCount: number;
  currentUserVote: string | null;
}

// ============= RATINGS API =============

export const ratingsApi = {
  async rateMovie(movieId: string, rating: number, review?: string): Promise<Rating> {
    const response = await fetch(`${API_BASE_URL}/api/ratings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ movieId, rating, review }),
    });

    if (!response.ok) {
      throw new Error('Failed to rate movie');
    }

    return response.json();
  },

  async deleteRating(movieId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/ratings/movies/${movieId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete rating');
    }
  },

  async getMyRating(movieId: string): Promise<UserRating | null> {
    const response = await fetch(`${API_BASE_URL}/api/ratings/movies/${movieId}/my-rating`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch rating');
    }

    return response.json();
  },

  async getMovieRatings(movieId: string, page: number = 1, pageSize: number = 20): Promise<PagedResult<Rating>> {
    const response = await fetch(
      `${API_BASE_URL}/api/ratings/movies/${movieId}?page=${page}&pageSize=${pageSize}`,
      { headers: getAuthHeaders() }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch ratings');
    }

    return response.json();
  },

  async getMovieRatingStats(movieId: string): Promise<MovieRatingStats> {
    const response = await fetch(`${API_BASE_URL}/api/ratings/movies/${movieId}/stats`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch rating stats');
    }

    return response.json();
  },
};

// ============= LISTS API =============

export const listsApi = {
  async getMyLists(): Promise<MovieList[]> {
    const response = await fetch(`${API_BASE_URL}/api/lists/my-lists`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch lists');
    }

    return response.json();
  },

  async getMyListsForMovie(movieId: string): Promise<SimpleList[]> {
    const response = await fetch(`${API_BASE_URL}/api/lists/my-lists/for-movie/${movieId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch lists');
    }

    return response.json();
  },

  async getListById(listId: string): Promise<MovieListDetail> {
    const response = await fetch(`${API_BASE_URL}/api/lists/${listId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch list');
    }

    return response.json();
  },

  async createList(title: string, description?: string, isPublic: boolean = false): Promise<MovieList> {
    const response = await fetch(`${API_BASE_URL}/api/lists`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, description, isPublic }),
    });

    if (!response.ok) {
      throw new Error('Failed to create list');
    }

    return response.json();
  },

  async updateList(listId: string, title: string, description?: string, isPublic: boolean = false): Promise<MovieList> {
    const response = await fetch(`${API_BASE_URL}/api/lists/${listId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, description, isPublic }),
    });

    if (!response.ok) {
      throw new Error('Failed to update list');
    }

    return response.json();
  },

  async deleteList(listId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/lists/${listId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete list');
    }
  },

  async addMovieToList(listId: string, movieId: string, note?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/lists/${listId}/movies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ movieId, note }),
    });

    if (!response.ok) {
      throw new Error('Failed to add movie to list');
    }
  },

  async removeMovieFromList(listId: string, movieId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/lists/${listId}/movies/${movieId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to remove movie from list');
    }
  },

  async toggleListFavorite(listId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/api/lists/${listId}/favorite`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle favorite');
    }

    return response.json();
  },
};

// ============= COMMENTS API =============

export const commentsApi = {
  async getMovieComments(movieId: string, page: number = 1, pageSize: number = 20): Promise<PagedResult<Comment>> {
    const response = await fetch(
      `${API_BASE_URL}/api/comments/movies/${movieId}?page=${page}&pageSize=${pageSize}`,
      { headers: getAuthHeaders() }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }

    return response.json();
  },

  async createComment(
    targetId: string,
    targetType: 'Movie',
    content: string,
    parentCommentId?: string
  ): Promise<Comment> {
    const response = await fetch(`${API_BASE_URL}/api/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ targetId, targetType, content, parentCommentId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create comment');
    }

    return response.json();
  },

  async deleteComment(commentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }
  },

  async voteComment(commentId: string, voteType: 'Upvote' | 'Downvote' | null): Promise<CommentVoteResult> {
    const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}/vote`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ voteType }),
    });

    if (!response.ok) {
      throw new Error('Failed to vote on comment');
    }

    return response.json();
  },
};

// ============= USER PROFILE TYPES =============

export interface UserProfile {
  id: string;
  username: string;
  profileImageId: string | null;
  coverImageId: string | null;
  bio: string | null;
  createdAt: string;
  isOwnProfile: boolean;
  followersCount: number;
  followingCount: number;
  isFollowedByCurrentUser: boolean;
}

export interface UserStats {
  totalMoviesWatched: number;
  totalWatchTimeMinutes: number;
  averageRating: number;
  totalRatings: number;
  totalComments: number;
  totalLists: number;
  topGenres: GenreStat[];
  ratingDistribution: number[];
  yearlyStats: YearlyStat[];
}

export interface GenreStat {
  genreId: number;
  genreName: string;
  count: number;
  percentage: number;
}

export interface YearlyStat {
  year: number;
  moviesWatched: number;
  averageRating: number;
}

export interface UserActivity {
  type: 'rating' | 'comment' | 'list';
  targetId: string;
  targetTitle: string;
  targetPosterPath: string | null;
  rating: number | null;
  content: string | null;
  createdAt: string;
}

export interface FollowUser {
  id: string;
  username: string;
  profileImageId: string | null;
  followedAt: string;
}

// ============= USERS API =============

export const usersApi = {
  async getUserProfile(username: string): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/api/users/${username}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return response.json();
  },

  async getUserStats(userId: string): Promise<UserStats> {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/stats`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user stats');
    }

    return response.json();
  },

  async getUserActivity(userId: string, page: number = 1, pageSize: number = 20): Promise<PagedResult<UserActivity>> {
    const response = await fetch(
      `${API_BASE_URL}/api/users/${userId}/activity?page=${page}&pageSize=${pageSize}`,
      { headers: getAuthHeaders() }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user activity');
    }

    return response.json();
  },

  async getUserLists(userId: string, listType?: string): Promise<MovieList[]> {
    const params = listType ? `?listType=${listType}` : '';
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/lists${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user lists');
    }

    return response.json();
  },

  async updateProfile(bio: string | null): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ bio }),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return response.json();
  },
};

// ============= FOLLOWS API =============

export const followsApi = {
  async followUser(userId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/api/follows/${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to follow user');
    }

    return response.json();
  },

  async unfollowUser(userId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/api/follows/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to unfollow user');
    }

    return response.json();
  },

  async getFollowers(userId: string, page: number = 1, pageSize: number = 20): Promise<PagedResult<FollowUser>> {
    const response = await fetch(
      `${API_BASE_URL}/api/follows/${userId}/followers?page=${page}&pageSize=${pageSize}`,
      { headers: getAuthHeaders() }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch followers');
    }

    return response.json();
  },

  async getFollowing(userId: string, page: number = 1, pageSize: number = 20): Promise<PagedResult<FollowUser>> {
    const response = await fetch(
      `${API_BASE_URL}/api/follows/${userId}/following?page=${page}&pageSize=${pageSize}`,
      { headers: getAuthHeaders() }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch following');
    }

    return response.json();
  },
};

// ============= PERSON TYPES =============

export interface PersonDetail {
  id: string;
  tmdbId: number;
  name: string;
  biography: string | null;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  profilePath: string | null;
  popularity: number | null;
  gender: number | null;
  knownForDepartment: string | null;
  imdbId: string | null;
  age: number;
  moviesAsCast: PersonMovie[];
  moviesAsCrew: PersonCrewMovie[];
}

export interface PersonMovie {
  movieId: string;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
  character: string | null;
  castOrder: number | null;
}

export interface PersonCrewMovie {
  movieId: string;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
  job: string | null;
  department: string | null;
}

// ============= PEOPLE API =============

export const peopleApi = {
  async getPersonDetail(personId: string): Promise<PersonDetail> {
    const response = await fetch(`${API_BASE_URL}/api/people/${personId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch person details');
    }

    return response.json();
  },
};

// ============= GENRES API =============

export const genresApi = {
  async getGenres(): Promise<Genre[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/genres`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        return [];
      }

      return response.json();
    } catch {
      return [];
    }
  },
};

// ============= AI RECOMMENDATIONS API =============

export const aiApi = {
  async getMovieRecommendations(tmdbId: number, count: number = 10): Promise<Movie[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/aimanager/movies/${tmdbId}/recommendations?count=${count}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        return [];
      }

      return response.json();
    } catch {
      // AI service might be unavailable, return empty array
      return [];
    }
  },
};

// ============= UNIFIED SEARCH API =============

export type SearchType = 'movies' | 'people' | 'users';

export interface MovieSearchResult {
  id: string;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  year: number | null;
  voteAverage: number | null;
}

export interface PersonSearchResult {
  id: string;
  tmdbId: number;
  name: string;
  profilePath: string | null;
  knownForDepartment: string | null;
}

export interface UserSearchResult {
  id: string;
  username: string;
  profileImageId: string | null;
  bio: string | null;
}

export interface UnifiedSearchResult {
  movies: MovieSearchResult[];
  people: PersonSearchResult[];
  users: UserSearchResult[];
}

export const searchApi = {
  async search(
    query: string,
    type?: SearchType,
    limit: number = 6
  ): Promise<UnifiedSearchResult> {
    try {
      const params = new URLSearchParams({ q: query, limit: limit.toString() });
      if (type) {
        // Convert to backend enum format
        const typeMap: Record<SearchType, string> = {
          movies: '0',
          people: '1',
          users: '2',
        };
        params.set('type', typeMap[type]);
      }

      const response = await fetch(`${API_BASE_URL}/api/search?${params}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        return { movies: [], people: [], users: [] };
      }

      return response.json();
    } catch {
      return { movies: [], people: [], users: [] };
    }
  },

  async searchMovies(query: string, limit: number = 6): Promise<MovieSearchResult[]> {
    const result = await this.search(query, 'movies', limit);
    return result.movies;
  },

  async searchPeople(query: string, limit: number = 6): Promise<PersonSearchResult[]> {
    const result = await this.search(query, 'people', limit);
    return result.people;
  },

  async searchUsers(query: string, limit: number = 6): Promise<UserSearchResult[]> {
    const result = await this.search(query, 'users', limit);
    return result.users;
  },
};
