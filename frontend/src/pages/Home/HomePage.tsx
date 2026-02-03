import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStorage, moviesApi, type Movie, type Genre } from '../../services/api';
import { Header } from '../../components/layout/Header/Header';
import { HeroSection } from '../../components/movie/HeroSection/HeroSection';
import { MovieRow } from '../../components/movie/MovieRow/MovieRow';
import styles from './HomePage.module.scss';

// Hardcoded genres until backend provides /api/genres endpoint
const GENRES: Genre[] = [
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

export const HomePage = () => {
  const navigate = useNavigate();
  const user = tokenStorage.getUser();

  const [loading, setLoading] = useState(true);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [genres] = useState<Genre[]>(GENRES);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [
          trendingData,
          popularData,
          topRatedData,
          upcomingData,
          nowPlayingData,
        ] = await Promise.all([
          moviesApi.getTrending(1, 20),
          moviesApi.getPopular(1, 20),
          moviesApi.getTopRated(1, 20),
          moviesApi.getUpcoming(1, 20),
          moviesApi.getNowPlaying(1, 20),
        ]);

        setTrending(trendingData.items);
        setPopular(popularData.items);
        setTopRated(topRatedData.items);
        setUpcoming(upcomingData.items);
        setNowPlaying(nowPlayingData.items);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <HeroSection movies={trending} loading={loading} />

        <div className={styles.content}>
          <MovieRow
            title="Popüler Filmler"
            movies={popular}
            loading={loading}
            viewAllLink="/movies/popular"
          />

          <MovieRow
            title="Şu An Vizyonda"
            movies={nowPlaying}
            loading={loading}
            viewAllLink="/movies/now-playing"
          />

          <MovieRow
            title="En Çok Beğenilenler"
            movies={topRated}
            loading={loading}
            showRank
            viewAllLink="/movies/top-rated"
          />

          <MovieRow
            title="Yakında Gelecekler"
            movies={upcoming}
            loading={loading}
            viewAllLink="/movies/upcoming"
          />

          <MovieRow
            title="Bu Hafta Trend"
            movies={trending}
            loading={loading}
            viewAllLink="/movies/trending"
          />
        </div>

        {/* Genre Quick Links */}
        {genres.length > 0 && (
          <section className={styles.genresSection}>
            <h2 className={styles.genresTitle}>
              <span className={styles.titleAccent} />
              Kategorilere Göz At
            </h2>
            <div className={styles.genresGrid}>
              {genres.slice(0, 12).map((genre, index) => (
                <button
                  key={genre.id}
                  className={styles.genreChip}
                  onClick={() => navigate(`/genre/${genre.id}`)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <span className={styles.logoIcon}>▶</span>
            <span className={styles.logoText}>CineFeel</span>
          </div>
          <p className={styles.footerText}>
            Film verileri TMDB tarafından sağlanmaktadır.
          </p>
          <div className={styles.footerLinks}>
            <a href="#">Hakkında</a>
            <a href="#">Gizlilik</a>
            <a href="#">Kullanım Koşulları</a>
            <a href="#">İletişim</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
