using CineSocial.Domain.Common;
using CineSocial.Domain.Enums;

namespace CineSocial.Domain.Entities.Social;

public class CommentReaction : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid CommentId { get; set; }

    /// <summary>
    /// Type of reaction (Upvote or Downvote)
    /// </summary>
    public ReactionType ReactionType { get; set; }

    // Navigation properties
    public User.User User { get; set; } = null!;
    public Comment Comment { get; set; } = null!;
}
