import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { followsApi, type FollowUser, type PagedResult } from '../../services/api';
import styles from './FollowersModal.module.scss';

interface FollowersModalProps {
  userId: string;
  type: 'followers' | 'following';
  onClose: () => void;
}

export const FollowersModal = ({ userId, type, onClose }: FollowersModalProps) => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data: PagedResult<FollowUser> = type === 'followers'
          ? await followsApi.getFollowers(userId, 1, 20)
          : await followsApi.getFollowing(userId, 1, 20);

        setUsers(data.items);
        setHasMore(data.hasNextPage);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userId, type]);

  const loadMore = async () => {
    try {
      const nextPage = page + 1;
      const data: PagedResult<FollowUser> = type === 'followers'
        ? await followsApi.getFollowers(userId, nextPage, 20)
        : await followsApi.getFollowing(userId, nextPage, 20);

      setUsers(prev => [...prev, ...data.items]);
      setPage(nextPage);
      setHasMore(data.hasNextPage);
    } catch (error) {
      console.error('Error loading more users:', error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{type === 'followers' ? 'Takipçiler' : 'Takip Edilenler'}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
            </div>
          ) : users.length === 0 ? (
            <div className={styles.empty}>
              {type === 'followers'
                ? 'Henüz takipçi yok.'
                : 'Henüz kimse takip edilmiyor.'}
            </div>
          ) : (
            <>
              <ul className={styles.userList}>
                {users.map(user => (
                  <li key={user.id}>
                    <Link
                      to={`/profile/${user.username}`}
                      className={styles.userItem}
                      onClick={onClose}
                    >
                      <div className={styles.avatar}>
                        {user.profileImageId ? (
                          <img
                            src={`/api/images/${user.profileImageId}`}
                            alt={user.username}
                          />
                        ) : (
                          <span>{user.username.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className={styles.userInfo}>
                        <span className={styles.username}>{user.username}</span>
                        <span className={styles.followDate}>
                          {new Date(user.followedAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              {hasMore && (
                <button className={styles.loadMore} onClick={loadMore}>
                  Daha Fazla Yükle
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
