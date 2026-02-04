namespace CineSocial.Application.Features.Users;

// User DTOs
public record UserProfileDto(
    Guid Id,
    string Username,
    string? ProfileImageId,
    string? CoverImageId,
    string? Bio,
    DateTime CreatedAt,
    bool IsOwnProfile,
    int FollowersCount,
    int FollowingCount,
    bool IsFollowedByCurrentUser
);

public record UserSummaryDto(
    Guid Id,
    string Username,
    string? ProfileImageId
);

public record UserActivityDto(
    string Type, // "rating", "comment", "list"
    Guid TargetId,
    string TargetTitle,
    string? TargetPosterPath,
    decimal? Rating,
    string? Content,
    DateTime CreatedAt
);
