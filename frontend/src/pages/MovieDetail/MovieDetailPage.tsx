import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  moviesApi,
  ratingsApi,
  listsApi,
  commentsApi,
  aiApi,
  tokenStorage,
  type Movie,
  type MovieDetail,
  type UserRating,
  type MovieRatingStats,
  type SimpleList,
  type Comment as CommentType,
  type PagedResult,
} from '../../services/api';
import { getImageUrl, getBackdropUrl, getProfileUrl } from '../../services/tmdb';
import { Header } from '../../components/layout/Header/Header';
import { CommentSection } from '../../components/movie/CommentSection/CommentSection';
import { AddToListModal } from '../../components/movie/AddToListModal/AddToListModal';
import styles from './MovieDetailPage.module.scss';

export const MovieDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = tokenStorage.getUser();

  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [myRating, setMyRating] = useState<UserRating | null>(null);
  const [ratingStats, setRatingStats] = useState<MovieRatingStats | null>(null);
  const [userLists, setUserLists] = useState<SimpleList[]>([]);
  const [comments, setComments] = useState<PagedResult<CommentType> | null>(null);
  const [showListModal, setShowListModal] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Similar movies state
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  // New states for better UX
  const [ratingLoading, setRatingLoading] = useState(false);
  const [listActionLoading, setListActionLoading] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const userId = user?.id;

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch movie details
        const movieData = await moviesApi.getMovieDetail(id);
        setMovie(movieData);

        // Fetch rating stats
        const stats = await ratingsApi.getMovieRatingStats(id);
        setRatingStats(stats);

        // Fetch comments
        const commentsData = await commentsApi.getMovieComments(id, 1, 20);
        setComments(commentsData);

        // Fetch user-specific data if logged in
        if (userId) {
          const [userRating, lists] = await Promise.all([
            ratingsApi.getMyRating(id),
            listsApi.getMyListsForMovie(id),
          ]);
          setMyRating(userRating);
          setUserLists(lists);
        }

        // Fetch similar movies (non-blocking, after main content)
        if (movieData.tmdbId) {
          setSimilarLoading(true);
          const recommendations = await aiApi.getMovieRecommendations(movieData.tmdbId, 10);
          setSimilarMovies(recommendations);
          setSimilarLoading(false);
        }
      } catch (error) {
        console.error('Error fetching movie:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, userId]);

  // Auto-hide feedback after 3 seconds
  useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setActionFeedback({ type, message });
  };

  const handleRating = async (rating: number) => {
    if (!user || !id) {
      navigate('/login');
      return;
    }

    try {
      setRatingLoading(true);
      await ratingsApi.rateMovie(id, rating);
      setMyRating({ movieId: id, rating, review: null, createdAt: new Date().toISOString() });

      // Refresh stats
      const stats = await ratingsApi.getMovieRatingStats(id);
      setRatingStats(stats);
      showFeedback('success', `${rating} puan verildi!`);
    } catch (error) {
      console.error('Error rating movie:', error);
      showFeedback('error', 'Puan verilemedi');
    } finally {
      setRatingLoading(false);
    }
  };

  const handleToggleInList = async (listId: string, containsMovie: boolean) => {
    if (!id) return;

    try {
      setListActionLoading(listId);
      if (containsMovie) {
        await listsApi.removeMovieFromList(listId, id);
      } else {
        await listsApi.addMovieToList(listId, id);
      }

      // Refresh lists
      const lists = await listsApi.getMyListsForMovie(id);
      setUserLists(lists);

      const listName = userLists.find(l => l.id === listId)?.title || 'Liste';
      showFeedback('success', containsMovie ? `${listName}'den çıkarıldı` : `${listName}'e eklendi`);
    } catch (error) {
      console.error('Error updating list:', error);
      showFeedback('error', 'İşlem başarısız');
    } finally {
      setListActionLoading(null);
    }
  };

  const handleQuickListAction = async (listType: 'Watchlist' | 'Favorites') => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!id) return;

    const list = userLists.find(l => l.listType === listType);

    if (list) {
      await handleToggleInList(list.id, list.containsMovie);
    } else {
      // Lists should be loaded for logged-in users, show feedback
      showFeedback('error', 'Liste yüklenemedi, sayfayı yenileyin');
    }
  };

  const handleCommentAdded = (newComment: CommentType) => {
    if (!comments) return;
    setComments({
      ...comments,
      items: [newComment, ...comments.items],
      totalCount: comments.totalCount + 1,
    });
    showFeedback('success', 'Yorum eklendi!');
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}>
            <div className={styles.filmReel}>
              <div className={styles.reelHole}></div>
              <div className={styles.reelHole}></div>
              <div className={styles.reelHole}></div>
              <div className={styles.reelHole}></div>
            </div>
          </div>
          <p className={styles.loadingText}>Film yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.errorIcon}>🎬</div>
          <p className={styles.loadingText}>Film bulunamadı</p>
        </div>
      </div>
    );
  }

  const backdropUrl = getBackdropUrl(movie.backdropPath, 'original');
  const posterUrl = getImageUrl(movie.posterPath, 'w500');
  const year = movie.releaseDate?.split('T')[0]?.split('-')[0] || '';
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}sa ${movie.runtime % 60}dk` : null;

  const watchlist = userLists.find(l => l.listType === 'Watchlist');
  const favorites = userLists.find(l => l.listType === 'Favorites');
  const customLists = userLists.filter(l => l.listType === 'Custom');
  const isInWatchlist = watchlist?.containsMovie ?? false;
  const isInFavorites = favorites?.containsMovie ?? false;

  // Get director from crew
  const director = movie.crew?.find(c => c.job === 'Director');

  return (
    <div className={styles.page}>
      <Header />

      {/* Action Feedback Toast */}
      {actionFeedback && (
        <div className={`${styles.toast} ${styles[actionFeedback.type]}`}>
          {actionFeedback.type === 'success' ? '✓' : '✕'} {actionFeedback.message}
        </div>
      )}

      {/* Cinematic Backdrop */}
      <div className={styles.backdrop}>
        {backdropUrl && <img src={backdropUrl} alt="" aria-hidden="true" />}
        <div className={styles.backdropOverlay}></div>
        <div className={styles.backdropVignette}></div>
        <div className={styles.filmGrain}></div>
      </div>

      {/* Hero Content */}
      <div className={styles.heroContent}>
        {/* Poster Card */}
        <div className={styles.posterWrapper}>
          <div className={styles.posterCard}>
            {posterUrl ? (
              <img src={posterUrl} alt={movie.title} className={styles.posterImage} />
            ) : (
              <div className={styles.posterPlaceholder}>
                <span>🎬</span>
              </div>
            )}
            <div className={styles.posterGlow}></div>
          </div>

          {/* Quick Actions under poster */}
          <div className={styles.quickActions}>
            <button
              className={`${styles.quickActionBtn} ${isInWatchlist ? styles.active : ''}`}
              onClick={() => handleQuickListAction('Watchlist')}
              disabled={listActionLoading === watchlist?.id}
              title={isInWatchlist ? 'İzleme listesinden çıkar' : 'İzleme listesine ekle'}
            >
              {listActionLoading === watchlist?.id ? (
                <span className={styles.btnSpinner}></span>
              ) : (
                isInWatchlist ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12l2.5 2.5L16 9" fill="none" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v8M8 12h8" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                )
              )}
            </button>

            <button
              className={`${styles.quickActionBtn} ${styles.heart} ${isInFavorites ? styles.active : ''}`}
              onClick={() => handleQuickListAction('Favorites')}
              disabled={listActionLoading === favorites?.id}
              title={isInFavorites ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            >
              {listActionLoading === favorites?.id ? (
                <span className={styles.btnSpinner}></span>
              ) : (
                <svg viewBox="0 0 24 24" fill={isInFavorites ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              )}
            </button>

            <button
              className={styles.quickActionBtn}
              onClick={() => user ? setShowListModal(true) : navigate('/login')}
              title="Listeye ekle"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Movie Info */}
        <div className={styles.movieInfo}>
          {/* Title & Tagline */}
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>{movie.title}</h1>
            {movie.originalTitle && movie.originalTitle !== movie.title && (
              <p className={styles.originalTitle}>{movie.originalTitle}</p>
            )}
            {movie.tagline && <p className={styles.tagline}>"{movie.tagline}"</p>}
          </div>

          {/* Meta Info Bar */}
          <div className={styles.metaBar}>
            {year && <span className={styles.metaItem}>{year}</span>}
            {runtime && <span className={styles.metaItem}>{runtime}</span>}
            {director && (
              <span className={styles.metaItem}>
                <span className={styles.metaLabel}>Yönetmen:</span> {director.name}
              </span>
            )}
          </div>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className={styles.genres}>
              {movie.genres.map(genre => (
                <Link
                  key={genre.id}
                  to={`/discover?genre=${genre.id}`}
                  className={styles.genreTag}
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          )}

          {/* Rating Display */}
          <div className={styles.ratingDisplay}>
            <div className={styles.tmdbRating}>
              <div className={styles.ratingCircle}>
                <svg viewBox="0 0 36 36" className={styles.ratingRing}>
                  <path
                    className={styles.ratingBg}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={styles.ratingProgress}
                    strokeDasharray={`${(movie.voteAverage || 0) * 10}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={styles.ratingValue}>{movie.voteAverage?.toFixed(1) || '—'}</span>
              </div>
              <div className={styles.ratingLabel}>
                <span>TMDB</span>
                <span className={styles.voteCount}>{movie.voteCount?.toLocaleString() || 0} oy</span>
              </div>
            </div>

            {ratingStats && ratingStats.totalRatings > 0 && (
              <div className={styles.communityRating}>
                <div className={styles.ratingCircle}>
                  <svg viewBox="0 0 36 36" className={styles.ratingRing}>
                    <path
                      className={styles.ratingBg}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={`${styles.ratingProgress} ${styles.gold}`}
                      strokeDasharray={`${(ratingStats.averageRating || 0) * 10}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className={styles.ratingValue}>{ratingStats.averageRating?.toFixed(1) || '—'}</span>
                </div>
                <div className={styles.ratingLabel}>
                  <span>CineFeel</span>
                  <span className={styles.voteCount}>{ratingStats.totalRatings} değerlendirme</span>
                </div>
              </div>
            )}
          </div>

          {/* Overview */}
          {movie.overview && (
            <div className={styles.overview}>
              <p>{movie.overview}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* User Rating Section */}
        <section className={styles.userRatingSection}>
          <div className={styles.sectionHeader}>
            <h2>
              <span className={styles.sectionIcon}>★</span>
              {myRating ? 'Puanınız' : 'Bu filme puan verin'}
            </h2>
          </div>

          <div className={styles.ratingInteractive}>
            <div className={styles.starsContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
                <button
                  key={star}
                  className={`${styles.starBtn} ${star <= (hoverRating || (myRating?.rating ?? 0)) ? styles.filled : ''
                    } ${ratingLoading ? styles.loading : ''}`}
                  onMouseEnter={() => !ratingLoading && setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRating(star)}
                  disabled={ratingLoading}
                  aria-label={`${star} puan ver`}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
            </div>
            <div className={styles.ratingNumber}>
              {hoverRating > 0 ? (
                <span className={styles.previewRating}>{hoverRating}/10</span>
              ) : myRating ? (
                <span className={styles.currentRating}>{myRating.rating}/10</span>
              ) : (
                <span className={styles.noRating}>Henüz puanlamadınız</span>
              )}
            </div>
          </div>
        </section>

        {/* Cast Section */}
        {movie.cast && movie.cast.length > 0 && (
          <section className={styles.castSection}>
            <div className={styles.sectionHeader}>
              <h2>
                <span className={styles.sectionIcon}>🎭</span>
                Oyuncular
              </h2>
            </div>
            <div className={styles.castScroller}>
              {movie.cast.slice(0, 12).map((member, index) => (
                <Link
                  key={member.personId}
                  to={`/person/${member.personId}`}
                  className={styles.castCard}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={styles.castImageWrapper}>
                    {member.profilePath ? (
                      <img src={getProfileUrl(member.profilePath) || ''} alt={member.name} />
                    ) : (
                      <div className={styles.castPlaceholder}>
                        <span>👤</span>
                      </div>
                    )}
                    <div className={styles.castOverlay}></div>
                  </div>
                  <div className={styles.castInfo}>
                    <span className={styles.castName}>{member.name}</span>
                    <span className={styles.castCharacter}>{member.character}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Similar Movies Section */}
        {(similarMovies.length > 0 || similarLoading) && (
          <section className={styles.similarSection}>
            <div className={styles.sectionHeader}>
              <h2>
                <span className={styles.sectionIcon}>🎯</span>
                Benzer Filmler
              </h2>
            </div>
            {similarLoading ? (
              <div className={styles.similarLoading}>
                <div className={styles.loadingDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p>AI önerileri yükleniyor...</p>
              </div>
            ) : (
              <div className={styles.similarScroller}>
                {similarMovies.map((similarMovie, index) => (
                  <Link
                    key={similarMovie.id}
                    to={`/movie/${similarMovie.id}`}
                    className={styles.similarCard}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={styles.similarPosterWrapper}>
                      {similarMovie.posterPath ? (
                        <img
                          src={getImageUrl(similarMovie.posterPath, 'w185') || ''}
                          alt={similarMovie.title}
                          className={styles.similarPoster}
                        />
                      ) : (
                        <div className={styles.similarPlaceholder}>
                          <span>🎬</span>
                        </div>
                      )}
                      {similarMovie.voteAverage && (
                        <div className={styles.similarRating}>
                          <span>★</span> {similarMovie.voteAverage.toFixed(1)}
                        </div>
                      )}
                      <div className={styles.similarOverlay}></div>
                    </div>
                    <div className={styles.similarInfo}>
                      <span className={styles.similarTitle}>{similarMovie.title}</span>
                      {similarMovie.releaseDate && (
                        <span className={styles.similarYear}>
                          {similarMovie.releaseDate.split('-')[0]}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Comments Section */}
        <section className={styles.commentsSection}>
          <div className={styles.sectionHeader}>
            <h2>
              <span className={styles.sectionIcon}>💬</span>
              Yorumlar
              <span className={styles.commentCount}>({comments?.totalCount || 0})</span>
            </h2>
          </div>
          <CommentSection
            movieId={id!}
            comments={comments?.items || []}
            onCommentAdded={handleCommentAdded}
          />
        </section>
      </div>

      {/* Add to List Modal */}
      {showListModal && (
        <AddToListModal
          movieId={id!}
          lists={customLists}
          onClose={() => setShowListModal(false)}
          onToggle={handleToggleInList}
        />
      )}
    </div>
  );
};
