using CineSocial.Domain.Enums;

namespace CineSocial.Application.Features.Comments;

public record CommentDto(
    Guid Id,
    Guid UserId,
    string Username,
    string? UserProfileImageId,
    string TargetType,
    Guid TargetId,
    Guid? ParentCommentId,
    string Content,
    int UpvoteCount,
    int DownvoteCount,
    int ReplyCount,
    string? CurrentUserVote, // "Upvote", "Downvote", or null
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    List<CommentDto>? Replies
);

public record CreateCommentDto(
    Guid TargetId,
    CommentTargetType TargetType,
    Guid? ParentCommentId,
    string Content
);
