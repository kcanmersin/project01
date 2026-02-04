import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  moviesApi,
  type Movie,
  type PagedResult,
  type MoviesQueryParams,
} from '../../services/api';
import { getImageUrl } from '../../services/tmdb';
import { Header } from '../../components/layout/Header/Header';
import styles from './DiscoverPage.module.scss';

// Genre list
const GENRES = [
  { id: 28, name: 'Aksiyon' },
  { id: 12, name: 'Macera' },
  { id: 16, name: 'Animasyon' },
  { id: 35, name: 'Komedi' },
  { id: 80, name: 'Suç' },
  { id: 99, name: 'Belgesel' },
  { id: 18, name: 'Dram' },
  { id: 10751, name: 'Aile' },
  { id: 14, name: 'Fantastik' },
  { id: 36, name: 'Tarih' },
  { id: 27, name: 'Korku' },
  { id: 10402, name: 'Müzik' },
  { id: 9648, name: 'Gizem' },
  { id: 10749, name: 'Romantik' },
  { id: 878, name: 'Bilim Kurgu' },
  { id: 53, name: 'Gerilim' },
  { id: 10752, name: 'Savaş' },
  { id: 37, name: 'Western' },
];

const SORT_OPTIONS = [
  { value: 'Popularity', label: 'Popülerlik' },
  { value: 'VoteAverage', label: 'Puan' },
  { value: 'ReleaseDate', label: 'Yayın Tarihi' },
  { value: 'Title', label: 'İsim (A-Z)' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => currentYear - i);

interface Filters {
  searchTerm: string;
  genreIds: number[];
  minYear: number | null;
  maxYear: number | null;
  minRating: number;
  maxRating: number;
  sortBy: 'Popularity' | 'VoteAverage' | 'ReleaseDate' | 'Title';
  sortDescending: boolean;
}

const defaultFilters: Filters = {
  searchTerm: '',
  genreIds: [],
  minYear: null,
  maxYear: null,
  minRating: 0,
  maxRating: 10,
  sortBy: 'Popularity',
  sortDescending: true,
};

export const DiscoverPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [movies, setMovies] = useState<PagedResult<Movie> | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Initialize filters from URL params
  useEffect(() => {
    const genreParam = searchParams.get('genres');
    const initialFilters: Filters = {
      searchTerm: searchParams.get('q') || '',
      genreIds: genreParam ? genreParam.split(',').map(Number) : [],
      minYear: searchParams.get('minYear') ? Number(searchParams.get('minYear')) : null,
      maxYear: searchParams.get('maxYear') ? Number(searchParams.get('maxYear')) : null,
      minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : 0,
      maxRating: searchParams.get('maxRating') ? Number(searchParams.get('maxRating')) : 10,
      sortBy: (searchParams.get('sortBy') as Filters['sortBy']) || 'Popularity',
      sortDescending: searchParams.get('sortDesc') !== 'false',
    };
    setFilters(initialFilters);

    // Auto-search if there are params
    if (searchParams.toString()) {
      handleSearch(initialFilters, 1);
    }
  }, []);

  const handleSearch = async (searchFilters: Filters = filters, page: number = 1) => {
    setLoading(true);
    setHasSearched(true);

    try {
      const params: MoviesQueryParams = {
        page,
        pageSize: 24,
        sortBy: searchFilters.sortBy,
        sortDescending: searchFilters.sortDescending,
      };

      if (searchFilters.searchTerm) params.searchTerm = searchFilters.searchTerm;
      if (searchFilters.genreIds.length > 0) params.genreIds = searchFilters.genreIds;
      if (searchFilters.minYear) params.minYear = searchFilters.minYear;
      if (searchFilters.maxYear) params.maxYear = searchFilters.maxYear;
      if (searchFilters.minRating > 0) params.minRating = searchFilters.minRating;
      if (searchFilters.maxRating < 10) params.maxRating = searchFilters.maxRating;

      const result = await moviesApi.getMovies(params);
      setMovies(result);

      // Update URL
      const urlParams = new URLSearchParams();
      if (searchFilters.searchTerm) urlParams.set('q', searchFilters.searchTerm);
      if (searchFilters.genreIds.length > 0) urlParams.set('genres', searchFilters.genreIds.join(','));
      if (searchFilters.minYear) urlParams.set('minYear', searchFilters.minYear.toString());
      if (searchFilters.maxYear) urlParams.set('maxYear', searchFilters.maxYear.toString());
      if (searchFilters.minRating > 0) urlParams.set('minRating', searchFilters.minRating.toString());
      if (searchFilters.maxRating < 10) urlParams.set('maxRating', searchFilters.maxRating.toString());
      if (searchFilters.sortBy !== 'Popularity') urlParams.set('sortBy', searchFilters.sortBy);
      if (!searchFilters.sortDescending) urlParams.set('sortDesc', 'false');
      if (page > 1) urlParams.set('page', page.toString());

      setSearchParams(urlParams);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreToggle = (genreId: number) => {
    setFilters(prev => ({
      ...prev,
      genreIds: prev.genreIds.includes(genreId)
        ? prev.genreIds.filter(id => id !== genreId)
        : [...prev.genreIds, genreId],
    }));
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setMovies(null);
    setHasSearched(false);
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (page: number) => {
    handleSearch(filters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilterCount =
    (filters.searchTerm ? 1 : 0) +
    filters.genreIds.length +
    (filters.minYear ? 1 : 0) +
    (filters.maxYear ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.maxRating < 10 ? 1 : 0);

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Film Keşfet</h1>
          <p>Filtreleri kullanarak aradığın filmi bul</p>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          className={styles.filterToggle}
          onClick={() => setShowFilters(!showFilters)}
        >
          <span>Filtreler</span>
          {activeFilterCount > 0 && (
            <span className={styles.filterBadge}>{activeFilterCount}</span>
          )}
          <span className={styles.toggleIcon}>{showFilters ? '▲' : '▼'}</span>
        </button>

        <div className={styles.content}>
          {/* Filters Panel */}
          <aside className={`${styles.filters} ${showFilters ? styles.show : ''}`}>
            {/* Search */}
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Arama</label>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Film adı ara..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Genres */}
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Türler</label>
              <div className={styles.genreGrid}>
                {GENRES.map(genre => (
                  <button
                    key={genre.id}
                    className={`${styles.genreChip} ${
                      filters.genreIds.includes(genre.id) ? styles.active : ''
                    }`}
                    onClick={() => handleGenreToggle(genre.id)}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Year Range */}
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Yıl Aralığı</label>
              <div className={styles.rangeInputs}>
                <select
                  className={styles.select}
                  value={filters.minYear || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    minYear: e.target.value ? Number(e.target.value) : null,
                  }))}
                >
                  <option value="">En Eski</option>
                  {YEARS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <span className={styles.rangeSeparator}>—</span>
                <select
                  className={styles.select}
                  value={filters.maxYear || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    maxYear: e.target.value ? Number(e.target.value) : null,
                  }))}
                >
                  <option value="">En Yeni</option>
                  {YEARS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rating Range */}
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>
                Puan Aralığı
                <span className={styles.ratingValue}>
                  {filters.minRating} - {filters.maxRating}
                </span>
              </label>
              <div className={styles.ratingSliders}>
                <div className={styles.sliderGroup}>
                  <span>Min:</span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={filters.minRating}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      minRating: Number(e.target.value),
                    }))}
                    className={styles.slider}
                  />
                  <span>{filters.minRating}</span>
                </div>
                <div className={styles.sliderGroup}>
                  <span>Max:</span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={filters.maxRating}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      maxRating: Number(e.target.value),
                    }))}
                    className={styles.slider}
                  />
                  <span>{filters.maxRating}</span>
                </div>
              </div>
            </div>

            {/* Sort */}
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Sıralama</label>
              <div className={styles.sortControls}>
                <select
                  className={styles.select}
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    sortBy: e.target.value as Filters['sortBy'],
                  }))}
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  className={`${styles.orderBtn} ${filters.sortDescending ? styles.desc : ''}`}
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    sortDescending: !prev.sortDescending,
                  }))}
                  title={filters.sortDescending ? 'Azalan' : 'Artan'}
                >
                  {filters.sortDescending ? '↓' : '↑'}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.filterActions}>
              <button
                className={styles.searchBtn}
                onClick={() => handleSearch()}
                disabled={loading}
              >
                {loading ? 'Aranıyor...' : 'Ara'}
              </button>
              <button
                className={styles.resetBtn}
                onClick={handleReset}
              >
                Sıfırla
              </button>
            </div>
          </aside>

          {/* Results */}
          <div className={styles.results}>
            {loading && (
              <div className={styles.loading}>
                <div className={styles.spinner} />
                <p>Filmler aranıyor...</p>
              </div>
            )}

            {!loading && !hasSearched && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🎬</div>
                <h3>Filmleri Keşfet</h3>
                <p>Soldaki filtreleri kullanarak istediğin filmleri bul</p>
              </div>
            )}

            {!loading && hasSearched && movies && (
              <>
                <div className={styles.resultsHeader}>
                  <span className={styles.resultCount}>
                    {movies.totalCount} film bulundu
                  </span>
                </div>

                {movies.items.length > 0 ? (
                  <div className={styles.moviesGrid}>
                    {movies.items.map(movie => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                ) : (
                  <div className={styles.noResults}>
                    <p>Bu filtrelere uygun film bulunamadı.</p>
                    <button onClick={handleReset}>Filtreleri Temizle</button>
                  </div>
                )}

                {/* Pagination */}
                {movies.totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      disabled={!movies.hasPreviousPage}
                      onClick={() => handlePageChange(movies.pageNumber - 1)}
                    >
                      ← Önceki
                    </button>

                    <div className={styles.pageNumbers}>
                      {Array.from({ length: Math.min(5, movies.totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (movies.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (movies.pageNumber <= 3) {
                          pageNum = i + 1;
                        } else if (movies.pageNumber >= movies.totalPages - 2) {
                          pageNum = movies.totalPages - 4 + i;
                        } else {
                          pageNum = movies.pageNumber - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            className={`${styles.pageBtn} ${
                              pageNum === movies.pageNumber ? styles.active : ''
                            }`}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      disabled={!movies.hasNextPage}
                      onClick={() => handlePageChange(movies.pageNumber + 1)}
                    >
                      Sonraki →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Movie Card Component
const MovieCard = ({ movie }: { movie: Movie }) => {
  const posterUrl = getImageUrl(movie.posterPath, 'w342');
  const year = movie.releaseDate?.split('T')[0]?.split('-')[0];

  return (
    <Link to={`/movie/${movie.id}`} className={styles.movieCard}>
      <div className={styles.poster}>
        {posterUrl ? (
          <img src={posterUrl} alt={movie.title} loading="lazy" />
        ) : (
          <div className={styles.posterPlaceholder}>
            {movie.title.charAt(0)}
          </div>
        )}
        {movie.voteAverage && movie.voteAverage > 0 && (
          <span className={styles.rating}>★ {movie.voteAverage.toFixed(1)}</span>
        )}
      </div>
      <div className={styles.movieInfo}>
        <h4 className={styles.movieTitle}>{movie.title}</h4>
        {year && <span className={styles.year}>{year}</span>}
      </div>
    </Link>
  );
};
