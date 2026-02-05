import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  searchApi,
  type SearchType,
  type MovieSearchResult,
  type PersonSearchResult,
  type UserSearchResult,
} from '../../services/api';
import { getImageUrl, getProfileUrl } from '../../services/tmdb';
import { Header } from '../../components/layout/Header/Header';
import styles from './SearchPage.module.scss';

type TabType = 'all' | SearchType;

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const typeParam = searchParams.get('type') as SearchType | null;

  const [activeTab, setActiveTab] = useState<TabType>(typeParam || 'all');
  const [movies, setMovies] = useState<MovieSearchResult[]>([]);
  const [people, setPeople] = useState<PersonSearchResult[]>([]);
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (!query || query.length < 2) return;

    const performSearch = async () => {
      setLoading(true);
      try {
        const searchType = activeTab === 'all' ? undefined : activeTab;
        const results = await searchApi.search(query, searchType, 20);
        setMovies(results.movies);
        setPeople(results.people);
        setUsers(results.users);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, activeTab]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams);
    if (tab === 'all') {
      newParams.delete('type');
    } else {
      newParams.set('type', tab);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const newParams = new URLSearchParams();
      newParams.set('q', searchInput.trim());
      if (activeTab !== 'all') {
        newParams.set('type', activeTab);
      }
      setSearchParams(newParams);
    }
  };

  const totalResults = movies.length + people.length + users.length;

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>
        {/* Search Header */}
        <div className={styles.searchHeader}>
          <h1 className={styles.title}>Arama Sonuçları</h1>
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Film, kişi veya kullanıcı ara..."
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          </form>
        </div>

        {/* Query Info */}
        {query && (
          <p className={styles.queryInfo}>
            "<span>{query}</span>" için {loading ? 'aranıyor...' : `${totalResults} sonuç bulundu`}
          </p>
        )}

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
            onClick={() => handleTabChange('all')}
          >
            Tümü
            {!loading && <span className={styles.tabCount}>{totalResults}</span>}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'movies' ? styles.active : ''}`}
            onClick={() => handleTabChange('movies')}
          >
            Filmler
            {!loading && <span className={styles.tabCount}>{movies.length}</span>}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'people' ? styles.active : ''}`}
            onClick={() => handleTabChange('people')}
          >
            Kişiler
            {!loading && <span className={styles.tabCount}>{people.length}</span>}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
            onClick={() => handleTabChange('users')}
          >
            Kullanıcılar
            {!loading && <span className={styles.tabCount}>{users.length}</span>}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <span>Aranıyor...</span>
          </div>
        )}

        {/* Results */}
        {!loading && (
          <div className={styles.results}>
            {/* Movies */}
            {movies.length > 0 && (activeTab === 'all' || activeTab === 'movies') && (
              <section className={styles.section}>
                {activeTab === 'all' && <h2 className={styles.sectionTitle}>Filmler</h2>}
                <div className={styles.movieGrid}>
                  {movies.map((movie) => (
                    <Link key={movie.id} to={`/movie/${movie.id}`} className={styles.movieCard}>
                      <div className={styles.moviePoster}>
                        {movie.posterPath ? (
                          <img src={getImageUrl(movie.posterPath, 'w342') || ''} alt={movie.title} />
                        ) : (
                          <div className={styles.noPoster}>🎬</div>
                        )}
                        {movie.voteAverage && (
                          <div className={styles.rating}>
                            <span>★</span> {movie.voteAverage.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <div className={styles.movieInfo}>
                        <h3 className={styles.movieTitle}>{movie.title}</h3>
                        <span className={styles.movieYear}>{movie.year || 'N/A'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* People */}
            {people.length > 0 && (activeTab === 'all' || activeTab === 'people') && (
              <section className={styles.section}>
                {activeTab === 'all' && <h2 className={styles.sectionTitle}>Kişiler</h2>}
                <div className={styles.peopleGrid}>
                  {people.map((person) => (
                    <Link key={person.id} to={`/person/${person.id}`} className={styles.personCard}>
                      <div className={styles.personAvatar}>
                        {person.profilePath ? (
                          <img src={getProfileUrl(person.profilePath) || ''} alt={person.name} />
                        ) : (
                          <div className={styles.noAvatar}>👤</div>
                        )}
                      </div>
                      <div className={styles.personInfo}>
                        <h3 className={styles.personName}>{person.name}</h3>
                        <span className={styles.personDepartment}>
                          {person.knownForDepartment || 'Oyuncu'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Users */}
            {users.length > 0 && (activeTab === 'all' || activeTab === 'users') && (
              <section className={styles.section}>
                {activeTab === 'all' && <h2 className={styles.sectionTitle}>Kullanıcılar</h2>}
                <div className={styles.usersGrid}>
                  {users.map((user) => (
                    <Link key={user.id} to={`/profile/${user.username}`} className={styles.userCard}>
                      <div className={styles.userAvatar}>
                        <span>{user.username.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className={styles.userInfo}>
                        <h3 className={styles.userName}>@{user.username}</h3>
                        {user.bio && (
                          <p className={styles.userBio}>
                            {user.bio.length > 80 ? user.bio.substring(0, 80) + '...' : user.bio}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* No Results */}
            {!loading && totalResults === 0 && query && (
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>🔍</div>
                <h3>Sonuç bulunamadı</h3>
                <p>"{query}" için herhangi bir sonuç bulunamadı. Farklı anahtar kelimeler deneyin.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
