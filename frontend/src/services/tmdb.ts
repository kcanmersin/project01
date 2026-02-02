const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
}

export interface MovieDetails extends Movie {
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
  budget: number;
  revenue: number;
  status: string;
  production_companies: { id: number; name: string; logo_path: string | null }[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

const headers = {
  Authorization: `Bearer ${ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
};

export const getImageUrl = (path: string | null, size: 'w200' | 'w300' | 'w400' | 'w500' | 'w780' | 'original' = 'w500') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const tmdbApi = {
  async getTrending(timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> {
    const response = await fetch(`${TMDB_BASE_URL}/trending/movie/${timeWindow}?language=tr-TR`, { headers });
    const data: MovieResponse = await response.json();
    return data.results;
  },

  async getPopular(page: number = 1): Promise<MovieResponse> {
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?language=tr-TR&page=${page}`, { headers });
    return response.json();
  },

  async getTopRated(page: number = 1): Promise<MovieResponse> {
    const response = await fetch(`${TMDB_BASE_URL}/movie/top_rated?language=tr-TR&page=${page}`, { headers });
    return response.json();
  },

  async getUpcoming(page: number = 1): Promise<MovieResponse> {
    const response = await fetch(`${TMDB_BASE_URL}/movie/upcoming?language=tr-TR&page=${page}`, { headers });
    return response.json();
  },

  async getNowPlaying(page: number = 1): Promise<MovieResponse> {
    const response = await fetch(`${TMDB_BASE_URL}/movie/now_playing?language=tr-TR&page=${page}`, { headers });
    return response.json();
  },

  async getMovieDetails(id: number): Promise<MovieDetails> {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${id}?language=tr-TR`, { headers });
    return response.json();
  },

  async getGenres(): Promise<Genre[]> {
    const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list?language=tr-TR`, { headers });
    const data = await response.json();
    return data.genres;
  },

  async getMoviesByGenre(genreId: number, page: number = 1): Promise<MovieResponse> {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?language=tr-TR&with_genres=${genreId}&page=${page}&sort_by=popularity.desc`,
      { headers }
    );
    return response.json();
  },

  async searchMovies(query: string, page: number = 1): Promise<MovieResponse> {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?language=tr-TR&query=${encodeURIComponent(query)}&page=${page}`,
      { headers }
    );
    return response.json();
  },

  async getSimilarMovies(id: number): Promise<Movie[]> {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${id}/similar?language=tr-TR`, { headers });
    const data: MovieResponse = await response.json();
    return data.results;
  },

  async getMovieCredits(id: number): Promise<{ cast: any[]; crew: any[] }> {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${id}/credits?language=tr-TR`, { headers });
    return response.json();
  },

  async getMovieVideos(id: number): Promise<{ results: any[] }> {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${id}/videos?language=tr-TR`, { headers });
    return response.json();
  },
};
