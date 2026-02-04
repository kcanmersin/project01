import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { peopleApi, type PersonDetail, type PersonMovie, type PersonCrewMovie } from '../../services/api';
import { getImageUrl, getProfileUrl } from '../../services/tmdb';
import { Header } from '../../components/layout/Header/Header';
import styles from './PersonPage.module.scss';

type TabType = 'movies' | 'crew' | 'about';

export const PersonPage = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState<PersonDetail | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('movies');

  useEffect(() => {
    if (!id) return;

    const fetchPerson = async () => {
      try {
        setLoading(true);
        const data = await peopleApi.getPersonDetail(id);
        setPerson(data);
      } catch (error) {
        console.error('Error fetching person:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerson();
  }, [id]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getGenderText = (gender: number | null) => {
    switch (gender) {
      case 1: return 'Kadın';
      case 2: return 'Erkek';
      default: return null;
    }
  };

  const groupCrewByDepartment = (movies: PersonCrewMovie[]) => {
    const grouped: Record<string, PersonCrewMovie[]> = {};
    movies.forEach(movie => {
      const dept = movie.department || 'Diğer';
      if (!grouped[dept]) grouped[dept] = [];
      grouped[dept].push(movie);
    });
    return grouped;
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

  if (!person) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.notFound}>
          <h2>Kişi bulunamadı</h2>
          <Link to="/">Ana Sayfaya Dön</Link>
        </div>
      </div>
    );
  }

  const profileUrl = getProfileUrl(person.profilePath, 'h632');
  const sortedCastMovies = [...person.moviesAsCast].sort((a, b) => {
    const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
    const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
    return dateB - dateA;
  });

  const sortedCrewMovies = [...person.moviesAsCrew].sort((a, b) => {
    const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
    const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
    return dateB - dateA;
  });

  const crewByDepartment = groupCrewByDepartment(sortedCrewMovies);

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        {/* Profile Header */}
        <div className={styles.profileHeader}>
          <div className={styles.profileImage}>
            {profileUrl ? (
              <img src={profileUrl} alt={person.name} />
            ) : (
              <div className={styles.placeholder}>
                {person.name.charAt(0)}
              </div>
            )}
          </div>

          <div className={styles.profileInfo}>
            <h1 className={styles.name}>{person.name}</h1>

            {person.knownForDepartment && (
              <span className={styles.department}>{person.knownForDepartment}</span>
            )}

            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{person.moviesAsCast.length}</span>
                <span className={styles.statLabel}>Film (Oyuncu)</span>
              </div>
              {person.moviesAsCrew.length > 0 && (
                <div className={styles.stat}>
                  <span className={styles.statValue}>{person.moviesAsCrew.length}</span>
                  <span className={styles.statLabel}>Film (Ekip)</span>
                </div>
              )}
              {person.age > 0 && (
                <div className={styles.stat}>
                  <span className={styles.statValue}>{person.age}</span>
                  <span className={styles.statLabel}>Yaş</span>
                </div>
              )}
            </div>

            <div className={styles.quickInfo}>
              {person.birthday && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Doğum</span>
                  <span className={styles.infoValue}>{formatDate(person.birthday)}</span>
                </div>
              )}
              {person.deathday && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Ölüm</span>
                  <span className={styles.infoValue}>{formatDate(person.deathday)}</span>
                </div>
              )}
              {person.placeOfBirth && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Doğum Yeri</span>
                  <span className={styles.infoValue}>{person.placeOfBirth}</span>
                </div>
              )}
              {getGenderText(person.gender) && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Cinsiyet</span>
                  <span className={styles.infoValue}>{getGenderText(person.gender)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'movies' ? styles.active : ''}`}
            onClick={() => setActiveTab('movies')}
          >
            Filmografi ({person.moviesAsCast.length})
          </button>
          {person.moviesAsCrew.length > 0 && (
            <button
              className={`${styles.tab} ${activeTab === 'crew' ? styles.active : ''}`}
              onClick={() => setActiveTab('crew')}
            >
              Ekip Olarak ({person.moviesAsCrew.length})
            </button>
          )}
          <button
            className={`${styles.tab} ${activeTab === 'about' ? styles.active : ''}`}
            onClick={() => setActiveTab('about')}
          >
            Hakkında
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.content}>
          {activeTab === 'movies' && (
            <div className={styles.filmography}>
              {sortedCastMovies.length > 0 ? (
                <div className={styles.moviesGrid}>
                  {sortedCastMovies.map(movie => (
                    <MovieCard key={`${movie.movieId}-${movie.character}`} movie={movie} />
                  ))}
                </div>
              ) : (
                <p className={styles.empty}>Filmografi bilgisi bulunamadı.</p>
              )}
            </div>
          )}

          {activeTab === 'crew' && (
            <div className={styles.crewSection}>
              {Object.entries(crewByDepartment).map(([department, movies]) => (
                <div key={department} className={styles.departmentSection}>
                  <h3 className={styles.departmentTitle}>{department}</h3>
                  <div className={styles.moviesGrid}>
                    {movies.map(movie => (
                      <CrewMovieCard key={`${movie.movieId}-${movie.job}`} movie={movie} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'about' && (
            <div className={styles.about}>
              {person.biography ? (
                <div className={styles.biography}>
                  <h3>Biyografi</h3>
                  <p>{person.biography}</p>
                </div>
              ) : (
                <p className={styles.empty}>Biyografi bilgisi bulunamadı.</p>
              )}

              <div className={styles.externalLinks}>
                {person.imdbId && (
                  <a
                    href={`https://www.imdb.com/name/${person.imdbId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.externalLink}
                  >
                    IMDb'de Görüntüle
                  </a>
                )}
                {person.tmdbId && (
                  <a
                    href={`https://www.themoviedb.org/person/${person.tmdbId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.externalLink}
                  >
                    TMDB'de Görüntüle
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Movie Card Component
const MovieCard = ({ movie }: { movie: PersonMovie }) => {
  const posterUrl = getImageUrl(movie.posterPath, 'w185');
  const year = movie.releaseDate?.split('T')[0]?.split('-')[0];

  return (
    <Link to={`/movie/${movie.movieId}`} className={styles.movieCard}>
      <div className={styles.poster}>
        {posterUrl ? (
          <img src={posterUrl} alt={movie.title} />
        ) : (
          <div className={styles.posterPlaceholder}>
            {movie.title.charAt(0)}
          </div>
        )}
        {movie.voteAverage && (
          <span className={styles.rating}>★ {movie.voteAverage.toFixed(1)}</span>
        )}
      </div>
      <div className={styles.movieInfo}>
        <h4 className={styles.movieTitle}>{movie.title}</h4>
        {movie.character && (
          <p className={styles.character}>{movie.character}</p>
        )}
        {year && <span className={styles.year}>{year}</span>}
      </div>
    </Link>
  );
};

// Crew Movie Card Component
const CrewMovieCard = ({ movie }: { movie: PersonCrewMovie }) => {
  const posterUrl = getImageUrl(movie.posterPath, 'w185');
  const year = movie.releaseDate?.split('T')[0]?.split('-')[0];

  return (
    <Link to={`/movie/${movie.movieId}`} className={styles.movieCard}>
      <div className={styles.poster}>
        {posterUrl ? (
          <img src={posterUrl} alt={movie.title} />
        ) : (
          <div className={styles.posterPlaceholder}>
            {movie.title.charAt(0)}
          </div>
        )}
        {movie.voteAverage && (
          <span className={styles.rating}>★ {movie.voteAverage.toFixed(1)}</span>
        )}
      </div>
      <div className={styles.movieInfo}>
        <h4 className={styles.movieTitle}>{movie.title}</h4>
        {movie.job && (
          <p className={styles.character}>{movie.job}</p>
        )}
        {year && <span className={styles.year}>{year}</span>}
      </div>
    </Link>
  );
};
