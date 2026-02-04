import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  usersApi,
  followsApi,
  listsApi,
  tokenStorage,
  type UserProfile,
  type UserStats,
  type UserActivity,
  type MovieList,
  type FollowUser,
  type PagedResult,
} from '../../services/api';
import { getImageUrl } from '../../services/tmdb';
import { Header } from '../../components/layout/Header/Header';
import { FollowersModal } from '../../components/profile/FollowersModal';
import { StatsTab } from '../../components/profile/StatsTab';
import styles from './ProfilePage.module.scss';

type TabType = 'overview' | 'favorites' | 'watchlist' | 'lists' | 'stats';

export const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const currentUser = tokenStorage.getUser();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [favorites, setFavorites] = useState<MovieList | null>(null);
  const [watchlist, setWatchlist] = useState<MovieList | null>(null);
  const [lists, setLists] = useState<MovieList[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [followersModal, setFollowersModal] = useState<'followers' | 'following' | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const profileId = profile?.id;

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileData = await usersApi.getUserProfile(username);
        setProfile(profileData);
        setIsFollowing(profileData.isFollowedByCurrentUser);

        // Fetch additional data
        const [statsData, activityData, userLists] = await Promise.all([
          usersApi.getUserStats(profileData.id),
          usersApi.getUserActivity(profileData.id, 1, 10),
          usersApi.getUserLists(profileData.id),
        ]);

        setStats(statsData);
        setActivities(activityData.items);
        setLists(userLists.filter(l => l.listType === 'Custom'));
        setFavorites(userLists.find(l => l.listType === 'Favorites') || null);
        setWatchlist(userLists.find(l => l.listType === 'Watchlist') || null);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleFollow = async () => {
    if (!profile || !currentUser) {
      navigate('/login');
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followsApi.unfollowUser(profile.id);
        setIsFollowing(false);
        setProfile(prev => prev ? { ...prev, followersCount: prev.followersCount - 1 } : null);
      } else {
        await followsApi.followUser(profile.id);
        setIsFollowing(true);
        setProfile(prev => prev ? { ...prev, followersCount: prev.followersCount + 1 } : null);
      }
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
    });
  };

  const formatWatchTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) {
      return `${days} gün ${hours % 24} saat`;
    }
    return `${hours} saat`;
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

  if (!profile) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.notFound}>
          <h2>Kullanıcı bulunamadı</h2>
          <p>Bu kullanıcı adına sahip bir hesap bulunamadı.</p>
          <button onClick={() => navigate('/')}>Ana Sayfaya Dön</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />

      {/* Cover Image */}
      <div className={styles.coverSection}>
        {profile.coverImageId ? (
          <img
            src={`/api/images/${profile.coverImageId}`}
            alt="Cover"
            className={styles.coverImage}
          />
        ) : (
          <div className={styles.coverPlaceholder} />
        )}
        <div className={styles.coverOverlay} />
      </div>

      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.profileInfo}>
          <div className={styles.avatar}>
            {profile.profileImageId ? (
              <img
                src={`/api/images/${profile.profileImageId}`}
                alt={profile.username}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className={styles.userInfo}>
            <h1 className={styles.username}>{profile.username}</h1>
            {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
            <p className={styles.joinDate}>
              {formatDate(profile.createdAt)} tarihinden beri üye
            </p>

            <div className={styles.followStats}>
              <button
                className={styles.followStat}
                onClick={() => setFollowersModal('followers')}
              >
                <strong>{profile.followersCount}</strong>
                <span>Takipçi</span>
              </button>
              <button
                className={styles.followStat}
                onClick={() => setFollowersModal('following')}
              >
                <strong>{profile.followingCount}</strong>
                <span>Takip</span>
              </button>
            </div>
          </div>

          <div className={styles.profileActions}>
            {profile.isOwnProfile ? (
              <button className={styles.editButton}>
                Profili Düzenle
              </button>
            ) : (
              <button
                className={`${styles.followButton} ${isFollowing ? styles.following : ''}`}
                onClick={handleFollow}
                disabled={followLoading}
              >
                {followLoading ? '...' : isFollowing ? 'Takibi Bırak' : 'Takip Et'}
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className={styles.quickStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.totalMoviesWatched}</span>
              <span className={styles.statLabel}>Film</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{formatWatchTime(stats.totalWatchTimeMinutes)}</span>
              <span className={styles.statLabel}>İzleme Süresi</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.averageRating.toFixed(1)}</span>
              <span className={styles.statLabel}>Ort. Puan</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.totalLists}</span>
              <span className={styles.statLabel}>Liste</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Genel Bakış
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'favorites' ? styles.active : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            Favoriler
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'watchlist' ? styles.active : ''}`}
            onClick={() => setActiveTab('watchlist')}
          >
            İzlenecekler
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'lists' ? styles.active : ''}`}
            onClick={() => setActiveTab('lists')}
          >
            Listeler
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'stats' ? styles.active : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            İstatistikler
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <main className={styles.content}>
        {activeTab === 'overview' && (
          <div className={styles.overviewTab}>
            {/* Recent Activity */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Son Aktiviteler</h2>
              {activities.length > 0 ? (
                <div className={styles.activityList}>
                  {activities.map((activity, index) => (
                    <Link
                      key={index}
                      to={`/movie/${activity.targetId}`}
                      className={styles.activityItem}
                    >
                      {activity.targetPosterPath && (
                        <img
                          src={getImageUrl(activity.targetPosterPath, 'w92')}
                          alt={activity.targetTitle}
                          className={styles.activityPoster}
                        />
                      )}
                      <div className={styles.activityInfo}>
                        <span className={styles.activityTitle}>{activity.targetTitle}</span>
                        {activity.type === 'rating' && activity.rating && (
                          <span className={styles.activityRating}>
                            ★ {activity.rating.toFixed(1)}
                          </span>
                        )}
                        {activity.type === 'comment' && activity.content && (
                          <span className={styles.activityComment}>{activity.content}</span>
                        )}
                        <span className={styles.activityDate}>
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyState}>Henüz aktivite yok.</p>
              )}
            </section>

            {/* Top Genres */}
            {stats && stats.topGenres.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Favori Türler</h2>
                <div className={styles.genresList}>
                  {stats.topGenres.slice(0, 5).map(genre => (
                    <div key={genre.genreId} className={styles.genreItem}>
                      <span className={styles.genreName}>{genre.genreName}</span>
                      <div className={styles.genreBar}>
                        <div
                          className={styles.genreProgress}
                          style={{ width: `${genre.percentage}%` }}
                        />
                      </div>
                      <span className={styles.genreCount}>{genre.count} film</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className={styles.listTab}>
            {favorites ? (
              <ListContent listId={favorites.id} />
            ) : (
              <p className={styles.emptyState}>Favori listesi bulunamadı.</p>
            )}
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div className={styles.listTab}>
            {watchlist ? (
              <ListContent listId={watchlist.id} />
            ) : (
              <p className={styles.emptyState}>İzlenecekler listesi bulunamadı.</p>
            )}
          </div>
        )}

        {activeTab === 'lists' && (
          <div className={styles.listsTab}>
            {lists.length > 0 ? (
              <div className={styles.listsGrid}>
                {lists.map(list => (
                  <Link key={list.id} to={`/list/${list.id}`} className={styles.listCard}>
                    <div className={styles.listCardContent}>
                      <h3>{list.title}</h3>
                      {list.description && <p>{list.description}</p>}
                      <span className={styles.listMeta}>
                        {list.movieCount} film • {list.isPublic ? 'Herkese Açık' : 'Özel'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>Henüz liste oluşturulmamış.</p>
            )}
          </div>
        )}

        {activeTab === 'stats' && stats && (
          <StatsTab stats={stats} />
        )}
      </main>

      {/* Followers Modal */}
      {followersModal && profileId && (
        <FollowersModal
          userId={profileId}
          type={followersModal}
          onClose={() => setFollowersModal(null)}
        />
      )}
    </div>
  );
};

// List Content Component
const ListContent = ({ listId }: { listId: string }) => {
  const [list, setList] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const data = await listsApi.getListById(listId);
        setList(data);
      } catch (error) {
        console.error('Error fetching list:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [listId]);

  if (loading) {
    return <div className={styles.loading}>Yükleniyor...</div>;
  }

  if (!list || !list.items?.length) {
    return <p className={styles.emptyState}>Bu listede henüz film yok.</p>;
  }

  return (
    <div className={styles.moviesGrid}>
      {list.items.map((item: any) => (
        <Link key={item.id} to={`/movie/${item.movieId}`} className={styles.movieCard}>
          {item.moviePosterPath ? (
            <img
              src={getImageUrl(item.moviePosterPath, 'w185')}
              alt={item.movieTitle}
            />
          ) : (
            <div className={styles.posterPlaceholder}>
              {item.movieTitle.charAt(0)}
            </div>
          )}
          <div className={styles.movieInfo}>
            <span className={styles.movieTitle}>{item.movieTitle}</span>
            {item.movieVoteAverage && (
              <span className={styles.movieRating}>★ {item.movieVoteAverage.toFixed(1)}</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};
