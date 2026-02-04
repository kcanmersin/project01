import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { commentsApi, tokenStorage, type Comment } from '../../../services/api';
import styles from './CommentSection.module.scss';

interface CommentSectionProps {
  movieId: string;
  comments: Comment[];
  onCommentAdded: (comment: Comment) => void;
}

export const CommentSection = ({ movieId, comments, onCommentAdded }: CommentSectionProps) => {
  const navigate = useNavigate();
  const user = tokenStorage.getUser();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [votingCommentId, setVotingCommentId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  // Sync with parent props when comments change
  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const refreshComments = async (): Promise<Comment[] | null> => {
    try {
      const commentsData = await commentsApi.getMovieComments(movieId, 1, 20);
      setLocalComments(commentsData.items);
      return commentsData.items;
    } catch (error) {
      console.error('Error refreshing comments:', error);
      return null;
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      const comment = await commentsApi.createComment(movieId, 'Movie', newComment.trim());

      // Update local state immediately AND notify parent
      setLocalComments(prev => [comment, ...prev]);
      onCommentAdded(comment);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!replyContent.trim() || submitting) return;

    try {
      setSubmitting(true);
      const reply = await commentsApi.createComment(movieId, 'Movie', replyContent.trim(), parentId);

      const addReply = (items: Comment[]): Comment[] =>
        items.map(item => {
          if (item.id === parentId) {
            return {
              ...item,
              replyCount: item.replyCount + 1,
              replies: [...(item.replies || []), reply],
            };
          }

          if (item.replies && item.replies.length > 0) {
            return { ...item, replies: addReply(item.replies) };
          }

          return item;
        });

      setLocalComments(prev => addReply(prev));

      setReplyingTo(null);
      setReplyContent('');
      setExpandedComments(prev => ({ ...prev, [parentId]: true }));
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (commentId: string, voteType: 'Upvote' | 'Downvote' | null, _isReply = false, _parentId?: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setVotingCommentId(commentId);
      const result = await commentsApi.voteComment(commentId, voteType);

      // Update local state
      const updateComment = (comment: Comment): Comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            upvoteCount: result.upvoteCount,
            downvoteCount: result.downvoteCount,
            currentUserVote: result.currentUserVote as 'Upvote' | 'Downvote' | null,
          };
        }
        if (comment.replies) {
          return { ...comment, replies: comment.replies.map(updateComment) };
        }
        return comment;
      };

      setLocalComments(prev => prev.map(updateComment));
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVotingCommentId(null);
    }
  };

  const handleDeleteComment = async (commentId: string, isReply = false, parentId?: string) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;

    try {
      await commentsApi.deleteComment(commentId);

      if (isReply && parentId) {
        setLocalComments(prev =>
          prev.map(c =>
            c.id === parentId
              ? {
                ...c,
                replyCount: Math.max(0, c.replyCount - 1),
                replies: (c.replies || []).filter(r => r.id !== commentId),
              }
              : c
          )
        );
      } else {
        setLocalComments(prev => prev.filter(c => c.id !== commentId));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const collectDescendantIds = (commentId: string, items: Comment[]): string[] => {
    const stack = [...items];
    const map = new Map<string, Comment>();
    while (stack.length) {
      const current = stack.pop()!;
      map.set(current.id, current);
      if (current.replies && current.replies.length > 0) {
        stack.push(...current.replies);
      }
    }

    const root = map.get(commentId);
    if (!root || !root.replies || root.replies.length === 0) return [];

    const ids: string[] = [];
    const queue = [...root.replies];
    while (queue.length) {
      const node = queue.shift()!;
      ids.push(node.id);
      if (node.replies && node.replies.length > 0) {
        queue.push(...node.replies);
      }
    }

    return ids;
  };

  const toggleReplies = async (commentId: string, defaultExpanded: boolean) => {
    const target = (function find(items: Comment[]): Comment | null {
      for (const item of items) {
        if (item.id === commentId) return item;
        if (item.replies) {
          const found = find(item.replies);
          if (found) return found;
        }
      }
      return null;
    })(localComments);

    let sourceItems = localComments;
    if (target && target.replyCount > 0 && (!target.replies || target.replies.length === 0))
    {
      const refreshed = await refreshComments();
      if (refreshed) {
        sourceItems = refreshed;
      }
    }

    setExpandedComments(prev => {
      const isCurrentlyExpanded = prev[commentId] ?? defaultExpanded;
      const isOpening = !isCurrentlyExpanded;
      if (!isOpening) return { ...prev, [commentId]: false };

      const descendantIds = collectDescendantIds(commentId, sourceItems);
      const next = { ...prev, [commentId]: true };
      descendantIds.forEach(id => {
        next[id] = true;
      });
      return next;
    });
  };

  const getIsExpanded = (comment: Comment, isReply: boolean) =>
    expandedComments[comment.id] ?? (isReply && comment.replyCount > 0);

  const renderComment = (comment: Comment, isReply = false, parentId?: string) => {
    const isExpanded = getIsExpanded(comment, isReply);

    return (
      <div key={comment.id} className={`${styles.comment} ${isReply ? styles.reply : ''}`}>
      <div className={styles.commentHeader}>
        <div className={styles.avatar}>
          {comment.username.charAt(0).toUpperCase()}
        </div>
        <div className={styles.commentInfo}>
          <span className={styles.username}>{comment.username}</span>
          <span className={styles.date}>
            {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
          </span>
        </div>
        {user?.id === comment.userId && (
          <button
            className={styles.deleteBtn}
            onClick={() => handleDeleteComment(comment.id, isReply, parentId)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        )}
      </div>

      <p className={styles.commentContent}>{comment.content}</p>

      <div className={styles.commentActions}>
        <button
          className={`${styles.voteBtn} ${comment.currentUserVote === 'Upvote' ? styles.active : ''} ${votingCommentId === comment.id ? styles.loading : ''}`}
          onClick={() =>
            handleVote(
              comment.id,
              comment.currentUserVote === 'Upvote' ? null : 'Upvote',
              isReply,
              parentId
            )
          }
          disabled={votingCommentId === comment.id}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
          </svg>
          {comment.upvoteCount}
        </button>

        <button
          className={`${styles.voteBtn} ${comment.currentUserVote === 'Downvote' ? styles.active : ''} ${votingCommentId === comment.id ? styles.loading : ''}`}
          onClick={() =>
            handleVote(
              comment.id,
              comment.currentUserVote === 'Downvote' ? null : 'Downvote',
              isReply,
              parentId
            )
          }
          disabled={votingCommentId === comment.id}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" />
          </svg>
          {comment.downvoteCount}
        </button>

        <button
          className={styles.replyBtn}
          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          </svg>
          Yanıtla ({comment.replyCount})
        </button>
      </div>

      {(comment.replies && comment.replies.length > 0) || comment.replyCount > 0 ? (
        <button
          className={styles.replyBtn}
          onClick={() => toggleReplies(comment.id, isReply && comment.replyCount > 0)}
        >
          {isExpanded ? 'Yanıtları gizle' : 'Yanıtları göster'} ({comment.replies?.length ?? comment.replyCount})
        </button>
      ) : null}

      {/* Reply Form */}
      {replyingTo === comment.id && (
        <div className={styles.replyForm}>
          <textarea
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            placeholder="Yanıtınızı yazın..."
            rows={2}
          />
          <div className={styles.replyFormActions}>
            <button onClick={() => setReplyingTo(null)}>İptal</button>
            <button
              className={styles.submitBtn}
              onClick={() => handleSubmitReply(comment.id)}
              disabled={submitting || !replyContent.trim()}
            >
              {submitting ? 'Gönderiliyor...' : 'Yanıtla'}
            </button>
          </div>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && isExpanded && (
        <div className={styles.replies}>
          {comment.replies.map(reply => renderComment(reply, true, comment.id))}
        </div>
      )}
    </div>
    );
  };

  return (
    <div className={styles.commentSection}>
      {/* New Comment Form */}
      <form className={styles.newCommentForm} onSubmit={handleSubmitComment}>
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder={user ? 'Yorum yazın...' : 'Yorum yapmak için giriş yapın'}
          rows={3}
          disabled={!user}
        />
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={submitting || !newComment.trim() || !user}
        >
          {submitting ? 'Gönderiliyor...' : 'Gönder'}
        </button>
      </form>

      {/* Comments List */}
      <div className={styles.commentsList}>
        {localComments.length === 0 ? (
          <p className={styles.noComments}>Henüz yorum yok. İlk yorumu siz yapın!</p>
        ) : (
          localComments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
};
