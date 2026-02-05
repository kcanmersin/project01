import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  tokenStorage,
  searchApi,
  type SearchType,
  type MovieSearchResult,
  type PersonSearchResult,
  type UserSearchResult,
} from '../../../services/api';
import { getImageUrl, getProfileUrl } from '../../../services/tmdb';
import styles from './Header.module.scss';

type SearchTab = 'all' | SearchType;

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = tokenStorage.getUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [movieResults, setMovieResults] = useState<MovieSearchResult[]>([]);
  const [peopleResults, setPeopleResults] = useState<PersonSearchResult[]>([]);
  const [userResults, setUserResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.length < 2) {
        setMovieResults([]);
        setPeopleResults([]);
        setUserResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const searchType = activeTab === 'all' ? undefined : activeTab;
        const results = await searchApi.search(searchQuery, searchType, 6);
        setMovieResults(results.movies);
        setPeopleResults(results.people);
        setUserResults(results.users);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, activeTab]);

  const handleLogout = () => {
    tokenStorage.clear();
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const typeParam = activeTab === 'all' ? '' : `&type=${activeTab}`;
      navigate(`/search?q=${encodeURIComponent(searchQuery)}${typeParam}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleResultClick = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const hasResults = movieResults.length > 0 || peopleResults.length > 0 || userResults.length > 0;

  const navItems = [
    { label: 'Ana Sayfa', path: '/' },
    { label: 'Keşfet', path: '/discover' },
    { label: 'Filmler', path: '/movies' },
    { label: 'Kategoriler', path: '/genres' },
    { label: 'Listelerim', path: '/my-lists' },
  ];

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>▶</span>
          <span className={styles.logoText}>CineFeel</span>
        </Link>

        {/* Navigation */}
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navLink} ${location.pathname === item.path ? styles.active : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className={styles.rightSection}>
          {/* Search */}
          <div className={styles.searchWrapper} ref={searchRef}>
            <button
              className={styles.searchTrigger}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Ara"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>

            {isSearchOpen && (
              <div className={styles.searchDropdown}>
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    placeholder="Film, kişi veya kullanıcı ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                    autoFocus
                  />
                </form>

                {/* Search Tabs */}
                <div className={styles.searchTabs}>
                  <button
                    className={`${styles.searchTab} ${activeTab === 'all' ? styles.active : ''}`}
                    onClick={() => setActiveTab('all')}
                  >
                    Tümü
                  </button>
                  <button
                    className={`${styles.searchTab} ${activeTab === 'movies' ? styles.active : ''}`}
                    onClick={() => setActiveTab('movies')}
                  >
                    Filmler
                  </button>
                  <button
                    className={`${styles.searchTab} ${activeTab === 'people' ? styles.active : ''}`}
                    onClick={() => setActiveTab('people')}
                  >
                    Kişiler
                  </button>
                  <button
                    className={`${styles.searchTab} ${activeTab === 'users' ? styles.active : ''}`}
                    onClick={() => setActiveTab('users')}
                  >
                    Kullanıcılar
                  </button>
                </div>

                {/* Loading State */}
                {isSearching && searchQuery.length >= 2 && (
                  <div className={styles.searchLoading}>
                    <div className={styles.loadingSpinner}></div>
                    <span>Aranıyor...</span>
                  </div>
                )}

                {/* Search Results */}
                {!isSearching && hasResults && (
                  <div className={styles.searchResults}>
                    {/* Movies */}
                    {movieResults.length > 0 && (activeTab === 'all' || activeTab === 'movies') && (
                      <div className={styles.resultSection}>
                        {activeTab === 'all' && <div className={styles.resultSectionTitle}>Filmler</div>}
                        {movieResults.map((movie) => (
                          <Link
                            key={movie.id}
                            to={`/movie/${movie.id}`}
                            className={styles.searchResult}
                            onClick={handleResultClick}
                          >
                            <div className={styles.searchResultPoster}>
                              {movie.posterPath ? (
                                <img src={getImageUrl(movie.posterPath, 'w92') || ''} alt={movie.title} />
                              ) : (
                                <div className={styles.noPoster}>🎬</div>
                              )}
                            </div>
                            <div className={styles.searchResultInfo}>
                              <span className={styles.searchResultTitle}>{movie.title}</span>
                              <span className={styles.searchResultMeta}>{movie.year || 'N/A'}</span>
                            </div>
                            {movie.voteAverage && (
                              <div className={styles.searchResultRating}>
                                <span>★</span> {movie.voteAverage.toFixed(1)}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* People */}
                    {peopleResults.length > 0 && (activeTab === 'all' || activeTab === 'people') && (
                      <div className={styles.resultSection}>
                        {activeTab === 'all' && <div className={styles.resultSectionTitle}>Kişiler</div>}
                        {peopleResults.map((person) => (
                          <Link
                            key={person.id}
                            to={`/person/${person.id}`}
                            className={styles.searchResult}
                            onClick={handleResultClick}
                          >
                            <div className={styles.searchResultAvatar}>
                              {person.profilePath ? (
                                <img src={getProfileUrl(person.profilePath) || ''} alt={person.name} />
                              ) : (
                                <div className={styles.noAvatar}>👤</div>
                              )}
                            </div>
                            <div className={styles.searchResultInfo}>
                              <span className={styles.searchResultTitle}>{person.name}</span>
                              <span className={styles.searchResultMeta}>
                                {person.knownForDepartment || 'Oyuncu'}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Users */}
                    {userResults.length > 0 && (activeTab === 'all' || activeTab === 'users') && (
                      <div className={styles.resultSection}>
                        {activeTab === 'all' && <div className={styles.resultSectionTitle}>Kullanıcılar</div>}
                        {userResults.map((u) => (
                          <Link
                            key={u.id}
                            to={`/profile/${u.username}`}
                            className={styles.searchResult}
                            onClick={handleResultClick}
                          >
                            <div className={styles.searchResultAvatar}>
                              <div className={styles.userInitial}>
                                {u.username.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className={styles.searchResultInfo}>
                              <span className={styles.searchResultTitle}>@{u.username}</span>
                              {u.bio && (
                                <span className={styles.searchResultMeta}>
                                  {u.bio.length > 40 ? u.bio.substring(0, 40) + '...' : u.bio}
                                </span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* View All Link */}
                    {searchQuery.length >= 2 && (
                      <Link
                        to={`/search?q=${encodeURIComponent(searchQuery)}${activeTab !== 'all' ? `&type=${activeTab}` : ''}`}
                        className={styles.viewAllLink}
                        onClick={handleResultClick}
                      >
                        Tüm sonuçları gör →
                      </Link>
                    )}
                  </div>
                )}

                {/* No Results */}
                {!isSearching && searchQuery.length >= 2 && !hasResults && (
                  <div className={styles.noResults}>
                    <span>Sonuç bulunamadı</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile */}
          {user ? (
            <div className={styles.profileWrapper} ref={profileRef}>
              <button
                className={styles.profileTrigger}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className={styles.avatar}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </button>

              {isProfileOpen && (
                <div className={styles.profileDropdown}>
                  <div className={styles.profileInfo}>
                    <div className={styles.avatarLarge}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.profileDetails}>
                      <span className={styles.profileName}>{user.username}</span>
                      <span className={styles.profileEmail}>{user.email}</span>
                    </div>
                  </div>

                  <div className={styles.profileDivider} />

                  <Link to={`/profile/${user.username}`} className={styles.profileMenuItem} onClick={() => setIsProfileOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Profil
                  </Link>

                  <Link to="/settings" className={styles.profileMenuItem} onClick={() => setIsProfileOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Ayarlar
                  </Link>

                  <div className={styles.profileDivider} />

                  <button onClick={handleLogout} className={styles.logoutButton}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={styles.loginButton}>
              Giriş Yap
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
