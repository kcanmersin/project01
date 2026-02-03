import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  moviesApi,
  ratingsApi,
  listsApi,
  commentsApi,
  tokenStorage,
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
        if (user) {
          const [userRating, lists] = await Promise.all([
            ratingsApi.getMyRating(id),
            listsApi.getMyListsForMovie(id),
          ]);
          setMyRating(userRating);
          setUserLists(lists);
        }
      } catch (error) {
        console.error('Error fetching movie:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleRating = async (rating: number) => {
    if (!user || !id) {
      navigate('/login');
      return;
    }

    try {
      await ratingsApi.rateMovie(id, rating);
      setMyRating({ movieId: id, rating, review: null, createdAt: new Date().toISOString() });

      // Refresh stats
      const stats = await ratingsApi.getMovieRatingStats(id);
      setRatingStats(stats);
    } catch (error) {
      console.error('Error rating movie:', error);
    }
  };

  const handleToggleInList = async (listId: string, containsMovie: boolean) => {
    if (!id) return;

    try {
      if (containsMovie) {
        await listsApi.removeMovieFromList(listId, id);
      } else {
        await listsApi.addMovieToList(listId, id);
      }

      // Refresh lists
      const lists = await listsApi.getMyListsForMovie(id);
      setUserLists(lists);
    } catch (error) {
      console.error('Error updating list:', error);
    }
  };

  const handleCommentAdded = (newComment: CommentType) => {
    if (!comments) return;
    setComments({
      ...comments,
      items: [newComment, ...comments.items],
      totalCount: comments.totalCount + 1,
    });
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.loading}>Film bulunamadı</div>
      </div>
    );
  }

  const backdropUrl = getBackdropUrl(movie.backdropPath, 'original');
  const posterUrl = getImageUrl(movie.posterPath, 'w500');
  const year = movie.releaseDate?.split('T')[0]?.split('-')[0] || '';
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}sa ${movie.runtime % 60}dk` : null;

  const watchlist = userLists.find(l => l.listType === 'Watchlist');
  const favorites = userLists.find(l => l.listType === 'Favorites');

  return (
    <div className={styles.page}>
      <Header />

      {/* Backdrop */}
      <div className={styles.backdrop}>
        {backdropUrl && <img src={backdropUrl} alt={movie.title} />}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Main Info */}
        <div className={styles.mainInfo}>
          <div className={styles.poster}>
            {posterUrl ? (
              <img src={posterUrl} alt={movie.title} />
            ) : (
              <div className={styles.placeholder}>🎬</div>
            )}
          </div>

          <div className={styles.details}>
            <h1 className={styles.title}>{movie.title}</h1>

            {movie.tagline && <p className={styles.tagline}>"{movie.tagline}"</p>}

            <div className={styles.meta}>
              {year && <span className={styles.metaItem}>{year}</span>}
              {runtime && <span className={styles.metaItem}>{runtime}</span>}
              {movie.voteAverage && (
                <span className={`${styles.metaItem} ${styles.rating}`}>
                  <span className={styles.star}>★</span>
                  {movie.voteAverage.toFixed(1)}
                </span>
              )}
            </div>

            {movie.genres && movie.genres.length > 0 && (
              <div className={styles.genres}>
                {movie.genres.map(genre => (
                  <span key={genre.id} className={styles.genre}>
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {movie.overview && <p className={styles.overview}>{movie.overview}</p>}

            {/* Action Buttons */}
            <div className={styles.actions}>
              <button
                className={`${styles.actionBtn} ${styles.secondary} ${watchlist?.containsMovie ? styles.active : ''}`}
                onClick={() => watchlist && handleToggleInList(watchlist.id, watchlist.containsMovie)}
                disabled={!user}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8v8M8 12h8" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                {watchlist?.containsMovie ? 'İzleme Listesinde' : 'İzleme Listesine Ekle'}
              </button>

              <button
                className={`${styles.actionBtn} ${styles.secondary} ${favorites?.containsMovie ? styles.active : ''}`}
                onClick={() => favorites && handleToggleInList(favorites.id, favorites.containsMovie)}
                disabled={!user}
              >
                <svg viewBox="0 0 24 24" fill={favorites?.containsMovie ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {favorites?.containsMovie ? 'Favorilerde' : 'Favorilere Ekle'}
              </button>

              <button
                className={`${styles.actionBtn} ${styles.secondary}`}
                onClick={() => user ? setShowListModal(true) : navigate('/login')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Listeye Ekle
              </button>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className={styles.sections}>
          {/* Rating Section */}
          <section className={`${styles.section} ${styles.ratingSection}`}>
            <div className={styles.ratingHeader}>
              <div className={styles.avgRating}>
                <span className={styles.avgRatingValue}>
                  {ratingStats?.averageRating?.toFixed(1) || '—'}
                </span>
                <div className={styles.avgRatingInfo}>
                  <span className={styles.stars}>★★★★★</span>
                  <span className={styles.count}>
                    {ratingStats?.totalRatings || 0} değerlendirme
                  </span>
                </div>
              </div>

              <div className={styles.userRating}>
                <span className={styles.userRatingLabel}>
                  {myRating ? 'Puanınız' : 'Puan verin'}
                </span>
                <div className={styles.ratingStars}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
                    <span
                      key={star}
                      className={`${styles.ratingStar} ${
                        star <= (hoverRating || (myRating?.rating ?? 0)) ? styles.filled : ''
                      }`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Cast Section */}
          {movie.cast && movie.cast.length > 0 && (
            <section className={styles.section}>
              <h2>Oyuncular</h2>
              <div className={styles.cast}>
                {movie.cast.slice(0, 10).map(member => (
                  <div key={member.personId} className={styles.castCard}>
                    <div className={styles.castImage}>
                      {member.profilePath ? (
                        <img src={getProfileUrl(member.profilePath) || ''} alt={member.name} />
                      ) : (
                        <div className={styles.placeholder}>👤</div>
                      )}
                    </div>
                    <div className={styles.castName}>{member.name}</div>
                    <div className={styles.castCharacter}>{member.character}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Comments Section */}
          <section className={styles.section}>
            <h2>Yorumlar ({comments?.totalCount || 0})</h2>
            <CommentSection
              movieId={id!}
              comments={comments?.items || []}
              onCommentAdded={handleCommentAdded}
            />
          </section>
        </div>
      </div>

      {/* Add to List Modal */}
      {showListModal && (
        <AddToListModal
          movieId={id!}
          lists={userLists}
          onClose={() => setShowListModal(false)}
          onToggle={handleToggleInList}
        />
      )}
    </div>
  );
};
