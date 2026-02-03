import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { type Movie } from '../../../services/api';
import { getBackdropUrl } from '../../../services/tmdb';
import styles from './HeroSection.module.scss';

interface HeroSectionProps {
  movies: Movie[];
  loading?: boolean;
}

export const HeroSection = ({ movies, loading = false }: HeroSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const featuredMovies = movies.slice(0, 5);
  const currentMovie = featuredMovies[currentIndex];

  useEffect(() => {
    if (featuredMovies.length <= 1) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
        setIsAnimating(false);
      }, 500);
    }, 8000);

    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  const goToSlide = (index: number) => {
    if (index === currentIndex || isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsAnimating(false);
    }, 300);
  };

  if (loading) {
    return (
      <section className={styles.hero}>
        <div className={styles.skeleton} />
      </section>
    );
  }

  if (!currentMovie) return null;

  const backdropUrl = getBackdropUrl(currentMovie.backdropPath, 'original');
  const year = currentMovie.releaseDate?.split('T')[0]?.split('-')[0] || '';

  return (
    <section className={styles.hero}>
      {/* Background */}
      <div className={`${styles.backdrop} ${isAnimating ? styles.fadeOut : ''}`}>
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt=""
            className={styles.backdropImage}
          />
        )}
        <div className={styles.backdropOverlay} />
      </div>

      {/* Content */}
      <div className={styles.container}>
        <div className={`${styles.content} ${isAnimating ? styles.fadeOut : ''}`}>
          <div className={styles.badge}>
            <span className={styles.badgeIcon}>★</span>
            <span>Bu Hafta Öne Çıkanlar</span>
          </div>

          <h1 className={styles.title}>{currentMovie.title}</h1>

          <div className={styles.meta}>
            <span className={styles.rating}>
              <span className={styles.star}>★</span>
              {(currentMovie.voteAverage ?? 0).toFixed(1)}
            </span>
            <span className={styles.separator}>•</span>
            <span className={styles.year}>{year}</span>
            <span className={styles.separator}>•</span>
            <span className={styles.votes}>
              {(currentMovie.voteCount ?? 0).toLocaleString()} değerlendirme
            </span>
          </div>

          <p className={styles.overview}>{currentMovie.overview}</p>

          <div className={styles.actions}>
            <Link to={`/movie/${currentMovie.id}`} className={styles.primaryButton}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              İzle
            </Link>

            <button className={styles.secondaryButton}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Listeme Ekle
            </button>

            <button className={styles.iconButton} title="Daha Fazla Bilgi">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </button>
          </div>
        </div>

        {/* Slide Indicators */}
        {featuredMovies.length > 1 && (
          <div className={styles.indicators}>
            {featuredMovies.map((movie, index) => (
              <button
                key={movie.id}
                className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`${movie.title} filmini göster`}
              >
                <span className={styles.indicatorProgress} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Gradient */}
      <div className={styles.bottomGradient} />
    </section>
  );
};
