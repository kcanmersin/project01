import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  listsApi,
  tokenStorage,
  type MovieListDetail,
  type MovieListItem,
} from '../../services/api';
import { getImageUrl } from '../../services/tmdb';
import { Header } from '../../components/layout/Header/Header';
import styles from './ListDetailPage.module.scss';

export const ListDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = tokenStorage.getUser();

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<MovieListDetail | null>(null);
  const [sortBy, setSortBy] = useState<'added' | 'title' | 'rating' | 'year'>('added');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!id) return;

    const fetchList = async () => {
      try {
        setLoading(true);
        const data = await listsApi.getListById(id);
        setList(data);
      } catch (error) {
        console.error('Error fetching list:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [id]);

  const handleRemoveMovie = async (movieId: string) => {
    if (!id || !list) return;

    try {
      await listsApi.removeMovieFromList(id, movieId);
      setList({
        ...list,
        items: list.items.filter(item => item.movieId !== movieId),
        movieCount: list.movieCount - 1,
      });
    } catch (error) {
      console.error('Error removing movie:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!id || !list) return;

    try {
      await listsApi.toggleListFavorite(id);
      setList({
        ...list,
        isFavoritedByCurrentUser: !list.isFavoritedByCurrentUser,
        favoriteCount: list.isFavoritedByCurrentUser
          ? list.favoriteCount - 1
          : list.favoriteCount + 1,
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const getSortedItems = () => {
    if (!list) return [];

    const items = [...list.items];

    items.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'added':
          comparison = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
          break;
        case 'title':
          comparison = a.movieTitle.localeCompare(b.movieTitle, 'tr');
          break;
        case 'rating':
          comparison = (a.movieVoteAverage || 0) - (b.movieVoteAverage || 0);
          break;
        case 'year':
          const yearA = a.movieReleaseDate ? new Date(a.movieReleaseDate).getFullYear() : 0;
          const yearB = b.movieReleaseDate ? new Date(b.movieReleaseDate).getFullYear() : 0;
          comparison = yearA - yearB;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return items;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getListTypeLabel = (listType: string) => {
    switch (listType) {
      case 'Watchlist': return 'İzlenecekler';
      case 'Favorites': return 'Favoriler';
      default: return 'Özel Liste';
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.notFound}>
          <h2>Liste bulunamadı</h2>
          <p>Bu liste silinmiş veya gizli olabilir.</p>
          <Link to="/">Ana Sayfaya Dön</Link>
        </div>
      </div>
    );
  }

  const sortedItems = getSortedItems();

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        {/* List Header */}
        <div className={styles.listHeader}>
          <div className={styles.listInfo}>
            <span className={styles.listType}>{getListTypeLabel(list.listType)}</span>
            <h1 className={styles.title}>{list.title}</h1>
            {list.description && (
              <p className={styles.description}>{list.description}</p>
            )}

            <div className={styles.meta}>
              <Link to={`/profile/${list.username}`} className={styles.owner}>
                <span className={styles.ownerAvatar}>
                  {list.username.charAt(0).toUpperCase()}
                </span>
                <span>{list.username}</span>
              </Link>
              <span className={styles.divider}>•</span>
              <span>{list.movieCount} film</span>
              <span className={styles.divider}>•</span>
              <span>{list.isPublic ? 'Herkese Açık' : 'Özel'}</span>
            </div>

            <div className={styles.actions}>
              {!list.isOwner && user && (
                <button
                  className={`${styles.actionBtn} ${list.isFavoritedByCurrentUser ? styles.active : ''}`}
                  onClick={handleToggleFavorite}
                >
                  <svg viewBox="0 0 24 24" fill={list.isFavoritedByCurrentUser ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {list.isFavoritedByCurrentUser ? 'Beğenildi' : 'Beğen'}
                  {list.favoriteCount > 0 && <span>({list.favoriteCount})</span>}
                </button>
              )}

              {list.isOwner && list.listType === 'Custom' && (
                <button
                  className={styles.editBtn}
                  onClick={() => {/* TODO: Edit modal */}}
                >
                  Düzenle
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        {list.items.length > 0 && (
          <div className={styles.controls}>
            <div className={styles.sortGroup}>
              <label>Sırala:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={styles.select}
              >
                <option value="added">Eklenme Tarihi</option>
                <option value="title">İsim</option>
                <option value="rating">Puan</option>
                <option value="year">Yıl</option>
              </select>
              <button
                className={styles.orderBtn}
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                title={sortOrder === 'asc' ? 'Artan' : 'Azalan'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            <span className={styles.count}>
              {list.items.length} film
            </span>
          </div>
        )}

        {/* Movies Grid */}
        {sortedItems.length > 0 ? (
          <div className={styles.moviesGrid}>
            {sortedItems.map((item, index) => (
              <MovieCard
                key={item.id}
                item={item}
                index={index + 1}
                isOwner={list.isOwner}
                onRemove={() => handleRemoveMovie(item.movieId)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🎬</div>
            <h3>Bu liste boş</h3>
            <p>Henüz bu listeye film eklenmemiş.</p>
            {list.isOwner && (
              <Link to="/" className={styles.browseLink}>
                Film Keşfet
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// Movie Card Component
const MovieCard = ({
  item,
  index,
  isOwner,
  onRemove,
}: {
  item: MovieListItem;
  index: number;
  isOwner: boolean;
  onRemove: () => void;
}) => {
  const posterUrl = getImageUrl(item.moviePosterPath, 'w342');
  const year = item.movieReleaseDate?.split('T')[0]?.split('-')[0];

  return (
    <div className={styles.movieCard}>
      <Link to={`/movie/${item.movieId}`} className={styles.movieLink}>
        <div className={styles.poster}>
          <span className={styles.rank}>{index}</span>
          {posterUrl ? (
            <img src={posterUrl} alt={item.movieTitle} />
          ) : (
            <div className={styles.posterPlaceholder}>
              {item.movieTitle.charAt(0)}
            </div>
          )}
          {item.movieVoteAverage && (
            <span className={styles.rating}>★ {item.movieVoteAverage.toFixed(1)}</span>
          )}
        </div>
        <div className={styles.movieInfo}>
          <h4 className={styles.movieTitle}>{item.movieTitle}</h4>
          {year && <span className={styles.year}>{year}</span>}
          {item.note && <p className={styles.note}>{item.note}</p>}
        </div>
      </Link>

      {isOwner && (
        <button
          className={styles.removeBtn}
          onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}
          title="Listeden Kaldır"
        >
          ✕
        </button>
      )}
    </div>
  );
};
