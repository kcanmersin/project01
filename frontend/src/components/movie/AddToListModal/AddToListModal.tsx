import { useState } from 'react';
import { listsApi, type SimpleList } from '../../../services/api';
import styles from './AddToListModal.module.scss';

interface AddToListModalProps {
  movieId: string;
  lists: SimpleList[];
  onClose: () => void;
  onToggle: (listId: string, containsMovie: boolean) => void;
}

export const AddToListModal = ({ movieId, lists, onClose, onToggle }: AddToListModalProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListPublic, setNewListPublic] = useState(false);
  const [creating, setCreating] = useState(false);
  const [localLists, setLocalLists] = useState(lists);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim() || creating) return;

    try {
      setCreating(true);
      const newList = await listsApi.createList(newListTitle.trim(), newListDescription.trim() || undefined, newListPublic);

      // Add movie to the new list
      await listsApi.addMovieToList(newList.id, movieId);

      // Update local state
      setLocalLists(prev => [...prev, {
        id: newList.id,
        title: newList.title,
        listType: newList.listType,
        movieCount: 1,
        containsMovie: true,
      }]);

      // Reset form
      setShowCreateForm(false);
      setNewListTitle('');
      setNewListDescription('');
      setNewListPublic(false);
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (list: SimpleList) => {
    onToggle(list.id, list.containsMovie);

    // Update local state optimistically
    setLocalLists(prev =>
      prev.map(l =>
        l.id === list.id
          ? { ...l, containsMovie: !l.containsMovie, movieCount: l.containsMovie ? l.movieCount - 1 : l.movieCount + 1 }
          : l
      )
    );
  };

  const getListIcon = (listType: string) => {
    switch (listType) {
      case 'Watchlist':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        );
      case 'Favorites':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        );
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Listeye Ekle</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {/* Lists */}
          <div className={styles.lists}>
            {localLists.map(list => (
              <button
                key={list.id}
                className={`${styles.listItem} ${list.containsMovie ? styles.active : ''}`}
                onClick={() => handleToggle(list)}
              >
                <span className={styles.listIcon}>{getListIcon(list.listType)}</span>
                <div className={styles.listInfo}>
                  <span className={styles.listTitle}>{list.title}</span>
                  <span className={styles.listCount}>{list.movieCount} film</span>
                </div>
                <span className={styles.checkbox}>
                  {list.containsMovie ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  ) : null}
                </span>
              </button>
            ))}
          </div>

          {/* Create New List */}
          {!showCreateForm ? (
            <button className={styles.createBtn} onClick={() => setShowCreateForm(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Yeni Liste Oluştur
            </button>
          ) : (
            <form className={styles.createForm} onSubmit={handleCreateList}>
              <input
                type="text"
                placeholder="Liste adı"
                value={newListTitle}
                onChange={e => setNewListTitle(e.target.value)}
                autoFocus
              />
              <textarea
                placeholder="Açıklama (isteğe bağlı)"
                value={newListDescription}
                onChange={e => setNewListDescription(e.target.value)}
                rows={2}
              />
              <label className={styles.publicToggle}>
                <input
                  type="checkbox"
                  checked={newListPublic}
                  onChange={e => setNewListPublic(e.target.checked)}
                />
                <span>Herkese açık liste</span>
              </label>
              <div className={styles.formActions}>
                <button type="button" onClick={() => setShowCreateForm(false)}>
                  İptal
                </button>
                <button type="submit" disabled={creating || !newListTitle.trim()}>
                  {creating ? 'Oluşturuluyor...' : 'Oluştur ve Ekle'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
