import { useState } from 'react';
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
  const [localComments, setLocalComments] = useState(comments);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      const comment = await commentsApi.createComment(movieId, 1, newComment.trim());
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
      const reply = await commentsApi.createComment(movieId, 1, replyContent.trim(), parentId);

      // Update local state
      setLocalComments(prev =>
        prev.map(c =>
          c.id === parentId
            ? { ...c, replyCount: c.replyCount + 1, replies: [...(c.replies || []), reply] }
            : c
        )
      );

      setReplyingTo(null);
      setReplyContent('');
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (commentId: string, voteType: 'Upvote' | 'Downvote' | null, isReply = false, parentId?: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
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
                  replies: c.replies?.filter(r => r.id !== commentId),
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

  const renderComment = (comment: Comment, isReply = false, parentId?: string) => (
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
          className={`${styles.voteBtn} ${comment.currentUserVote === 'Upvote' ? styles.active : ''}`}
          onClick={() =>
            handleVote(
              comment.id,
              comment.currentUserVote === 'Upvote' ? null : 'Upvote',
              isReply,
              parentId
            )
          }
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
          </svg>
          {comment.upvoteCount}
        </button>

        <button
          className={`${styles.voteBtn} ${comment.currentUserVote === 'Downvote' ? styles.active : ''}`}
          onClick={() =>
            handleVote(
              comment.id,
              comment.currentUserVote === 'Downvote' ? null : 'Downvote',
              isReply,
              parentId
            )
          }
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" />
          </svg>
          {comment.downvoteCount}
        </button>

        {!isReply && (
          <button
            className={styles.replyBtn}
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            </svg>
            Yanıtla ({comment.replyCount})
          </button>
        )}
      </div>

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
              Yanıtla
            </button>
          </div>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className={styles.replies}>
          {comment.replies.map(reply => renderComment(reply, true, comment.id))}
        </div>
      )}
    </div>
  );

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
