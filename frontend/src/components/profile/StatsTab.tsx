import { type UserStats } from '../../services/api';
import styles from './StatsTab.module.scss';

interface StatsTabProps {
  stats: UserStats;
}

export const StatsTab = ({ stats }: StatsTabProps) => {
  const formatWatchTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (days > 0) {
      return { value: days, unit: 'gün', subValue: `${remainingHours} saat` };
    }
    return { value: hours, unit: 'saat', subValue: `${minutes % 60} dakika` };
  };

  const watchTime = formatWatchTime(stats.totalWatchTimeMinutes);
  const maxRatingCount = Math.max(...stats.ratingDistribution, 1);

  return (
    <div className={styles.statsTab}>
      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>🎬</div>
          <div className={styles.cardValue}>{stats.totalMoviesWatched}</div>
          <div className={styles.cardLabel}>Film İzlendi</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>⏱️</div>
          <div className={styles.cardValue}>
            {watchTime.value}
            <span className={styles.cardUnit}>{watchTime.unit}</span>
          </div>
          <div className={styles.cardLabel}>{watchTime.subValue}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>⭐</div>
          <div className={styles.cardValue}>{stats.averageRating.toFixed(1)}</div>
          <div className={styles.cardLabel}>Ortalama Puan</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>💬</div>
          <div className={styles.cardValue}>{stats.totalComments}</div>
          <div className={styles.cardLabel}>Yorum</div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        {/* Rating Distribution */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Puan Dağılımı</h3>
          <div className={styles.ratingChart}>
            {stats.ratingDistribution.map((count, index) => (
              <div key={index} className={styles.ratingBar}>
                <span className={styles.ratingLabel}>{index + 1}</span>
                <div className={styles.barContainer}>
                  <div
                    className={styles.bar}
                    style={{
                      width: `${(count / maxRatingCount) * 100}%`,
                      background: getRatingColor(index + 1),
                    }}
                  />
                </div>
                <span className={styles.ratingCount}>{count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Top Genres */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>En Çok İzlenen Türler</h3>
          <div className={styles.genresChart}>
            {stats.topGenres.slice(0, 8).map((genre, index) => (
              <div key={genre.genreId} className={styles.genreItem}>
                <div className={styles.genreRank}>#{index + 1}</div>
                <div className={styles.genreInfo}>
                  <span className={styles.genreName}>{genre.genreName}</span>
                  <div className={styles.genreBarContainer}>
                    <div
                      className={styles.genreBar}
                      style={{
                        width: `${genre.percentage}%`,
                        background: getGenreColor(index),
                      }}
                    />
                  </div>
                </div>
                <div className={styles.genreStats}>
                  <span className={styles.genreCount}>{genre.count}</span>
                  <span className={styles.genrePercentage}>{genre.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Yearly Activity */}
        {stats.yearlyStats.length > 0 && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Yıllık Aktivite</h3>
            <div className={styles.yearlyChart}>
              {stats.yearlyStats.map(year => (
                <div key={year.year} className={styles.yearItem}>
                  <div className={styles.yearLabel}>{year.year}</div>
                  <div className={styles.yearStats}>
                    <div className={styles.yearMovies}>
                      <span className={styles.yearValue}>{year.moviesWatched}</span>
                      <span className={styles.yearUnit}>film</span>
                    </div>
                    <div className={styles.yearRating}>
                      <span className={styles.yearValue}>⭐ {year.averageRating}</span>
                    </div>
                  </div>
                  <div className={styles.yearBarContainer}>
                    <div
                      className={styles.yearBar}
                      style={{
                        width: `${(year.moviesWatched / Math.max(...stats.yearlyStats.map(y => y.moviesWatched))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Genre Pie Chart (Visual representation) */}
        {stats.topGenres.length > 0 && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Tür Dağılımı</h3>
            <div className={styles.pieChartContainer}>
              <div className={styles.pieChart}>
                {createPieSlices(stats.topGenres.slice(0, 6))}
              </div>
              <div className={styles.pieLegend}>
                {stats.topGenres.slice(0, 6).map((genre, index) => (
                  <div key={genre.genreId} className={styles.legendItem}>
                    <span
                      className={styles.legendColor}
                      style={{ background: getGenreColor(index) }}
                    />
                    <span className={styles.legendName}>{genre.genreName}</span>
                    <span className={styles.legendValue}>{genre.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

// Helper functions
const getRatingColor = (rating: number) => {
  if (rating <= 3) return '#e50914';
  if (rating <= 5) return '#ff6b6b';
  if (rating <= 7) return '#ffc107';
  if (rating <= 9) return '#4caf50';
  return '#00e676';
};

const getGenreColor = (index: number) => {
  const colors = [
    '#e50914',
    '#ff6b6b',
    '#ffc107',
    '#4caf50',
    '#2196f3',
    '#9c27b0',
    '#ff9800',
    '#00bcd4',
  ];
  return colors[index % colors.length];
};

const createPieSlices = (genres: { genreId: number; percentage: number }[]) => {
  let cumulativePercentage = 0;
  const total = genres.reduce((sum, g) => sum + g.percentage, 0);

  return (
    <svg viewBox="0 0 100 100" className={styles.pieSvg}>
      {genres.map((genre, index) => {
        const normalizedPercentage = (genre.percentage / total) * 100;
        const startAngle = (cumulativePercentage / 100) * 360;
        const endAngle = ((cumulativePercentage + normalizedPercentage) / 100) * 360;
        cumulativePercentage += normalizedPercentage;

        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);

        const x1 = 50 + 40 * Math.cos(startRad);
        const y1 = 50 + 40 * Math.sin(startRad);
        const x2 = 50 + 40 * Math.cos(endRad);
        const y2 = 50 + 40 * Math.sin(endRad);

        const largeArcFlag = normalizedPercentage > 50 ? 1 : 0;

        const pathData = [
          `M 50 50`,
          `L ${x1} ${y1}`,
          `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          `Z`,
        ].join(' ');

        return (
          <path
            key={genre.genreId}
            d={pathData}
            fill={getGenreColor(index)}
            stroke="#1a1a2e"
            strokeWidth="1"
          />
        );
      })}
      <circle cx="50" cy="50" r="20" fill="#1a1a2e" />
    </svg>
  );
};
