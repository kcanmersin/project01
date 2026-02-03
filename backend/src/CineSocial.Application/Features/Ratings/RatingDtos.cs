namespace CineSocial.Application.Features.Ratings;

public record RatingDto(
    Guid Id,
    Guid UserId,
    string Username,
    Guid MovieId,
    decimal Rating,
    string? Review,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record MovieRatingStatsDto(
    Guid MovieId,
    decimal AverageRating,
    int TotalRatings,
    int[] RatingDistribution // Index 0-10 representing count for each rating
);

public record UserRatingDto(
    Guid MovieId,
    decimal Rating,
    string? Review,
    DateTime CreatedAt
);
