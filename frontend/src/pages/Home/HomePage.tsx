import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStorage } from '../../services/api';
import { tmdbApi, type Movie, type Genre } from '../../services/tmdb';
import { Header } from '../../components/layout/Header/Header';
import { HeroSection } from '../../components/movie/HeroSection/HeroSection';
import { MovieRow } from '../../components/movie/MovieRow/MovieRow';
import styles from './HomePage.module.scss';

export const HomePage = () => {
  const navigate = useNavigate();
  const user = tokenStorage.getUser();

  const [loading, setLoading] = useState(true);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

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
          genresData
        ] = await Promise.all([
          tmdbApi.getTrending('week'),
          tmdbApi.getPopular(),
          tmdbApi.getTopRated(),
          tmdbApi.getUpcoming(),
          tmdbApi.getNowPlaying(),
          tmdbApi.getGenres()
        ]);

        setTrending(trendingData);
        setPopular(popularData.results);
        setTopRated(topRatedData.results);
        setUpcoming(upcomingData.results);
        setNowPlaying(nowPlayingData.results);
        setGenres(genresData);
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
