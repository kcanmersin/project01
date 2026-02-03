using CineSocial.Domain.Common;
using CineSocial.Domain.Enums;

namespace CineSocial.Domain.Entities.Social;

public class Comment : BaseEntity
{
    public Guid UserId { get; set; }

    /// <summary>
    /// Type of target (Movie, etc.)
    /// </summary>
    public CommentTargetType TargetType { get; set; }

    /// <summary>
    /// ID of the target (MovieId, etc.)
    /// </summary>
    public Guid TargetId { get; set; }

    /// <summary>
    /// Parent comment ID for replies (null for root comments)
    /// </summary>
    public Guid? ParentCommentId { get; set; }

    /// <summary>
    /// Comment content (max 2000 chars)
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Denormalized upvote count
    /// </summary>
    public int UpvoteCount { get; set; }

    /// <summary>
    /// Denormalized downvote count
    /// </summary>
    public int DownvoteCount { get; set; }

    /// <summary>
    /// Denormalized reply count
    /// </summary>
    public int ReplyCount { get; set; }

    // Navigation properties
    public User.User User { get; set; } = null!;
    public Comment? ParentComment { get; set; }
    public ICollection<Comment> Replies { get; set; } = new List<Comment>();
    public ICollection<CommentReaction> Reactions { get; set; } = new List<CommentReaction>();
}
