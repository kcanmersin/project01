namespace CineSocial.Application.Features.Follows;

public record FollowUserDto(
    Guid Id,
    string Username,
    string? ProfileImageId,
    DateTime FollowedAt
);

public record FollowStatsDto(
    int FollowersCount,
    int FollowingCount,
    bool IsFollowedByCurrentUser
);
