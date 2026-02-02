import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { type Movie } from '../../../services/tmdb';
import { MovieCard } from '../MovieCard/MovieCard';
import styles from './MovieRow.module.scss';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  loading?: boolean;
  showRank?: boolean;
  viewAllLink?: string;
}

export const MovieRow = ({
  title,
  movies,
  loading = false,
  showRank = false,
  viewAllLink
}: MovieRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <div className={styles.titleSkeleton} />
        </div>
        <div className={styles.skeletonRow}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.cardSkeleton} />
          ))}
        </div>
      </section>
    );
  }

  if (!movies.length) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.titleAccent} />
          {title}
        </h2>
        {viewAllLink && (
          <Link to={viewAllLink} className={styles.viewAll}>
            Tümünü Gör
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      <div className={styles.sliderWrapper}>
        {canScrollLeft && (
          <button
            className={`${styles.navButton} ${styles.navLeft}`}
            onClick={() => scroll('left')}
            aria-label="Sola kaydır"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}

        <div
          ref={scrollRef}
          className={styles.slider}
          onScroll={checkScroll}
        >
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              index={index}
              showRank={showRank}
            />
          ))}
        </div>

        {canScrollRight && (
          <button
            className={`${styles.navButton} ${styles.navRight}`}
            onClick={() => scroll('right')}
            aria-label="Sağa kaydır"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}

        {/* Fade edges */}
        <div className={`${styles.fade} ${styles.fadeLeft}`} />
        <div className={`${styles.fade} ${styles.fadeRight}`} />
      </div>
    </section>
  );
};
