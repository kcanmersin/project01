namespace CineSocial.Application.Features.Users;

// User DTOs
public record UserProfileDto(
    Guid Id,
    string Username,
    string? ProfileImageId,
    string? CoverImageId,
    DateTime CreatedAt
);

public record UserSummaryDto(
    Guid Id,
    string Username,
    string? ProfileImageId
);
