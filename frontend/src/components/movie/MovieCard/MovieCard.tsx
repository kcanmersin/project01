import { useState } from 'react';
import { Link } from 'react-router-dom';
import { type Movie, getImageUrl } from '../../../services/tmdb';
import styles from './MovieCard.module.scss';

interface MovieCardProps {
  movie: Movie;
  index?: number;
  size?: 'sm' | 'md' | 'lg';
  showRank?: boolean;
}

export const MovieCard = ({ movie, index = 0, size = 'md', showRank = false }: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const posterUrl = getImageUrl(movie.poster_path, size === 'lg' ? 'w500' : 'w300');
  const year = movie.release_date?.split('-')[0] || '';
  const rating = movie.vote_average.toFixed(1);

  return (
    <Link
      to={`/movie/${movie.id}`}
      className={`${styles.card} ${styles[size]}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {showRank && (
        <div className={styles.rank}>
          <span className={styles.rankNumber}>{index + 1}</span>
        </div>
      )}

      <div className={styles.posterWrapper}>
        {!imageLoaded && !imageError && (
          <div className={styles.skeleton} />
        )}

        {posterUrl && !imageError ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className={`${styles.poster} ${imageLoaded ? styles.loaded : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className={styles.noPoster}>
            <span className={styles.noPosterIcon}>🎬</span>
            <span className={styles.noPosterText}>{movie.title}</span>
          </div>
        )}

        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <div className={styles.rating}>
              <span className={styles.star}>★</span>
              <span className={styles.ratingValue}>{rating}</span>
            </div>

            <div className={styles.playButton}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>

            <div className={styles.actions}>
              <button className={styles.actionButton} title="Listeye Ekle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              <button className={styles.actionButton} title="Beğen">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Glow effect on hover */}
        <div className={styles.glow} />
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{movie.title}</h3>
        <span className={styles.year}>{year}</span>
      </div>
    </Link>
  );
};
