namespace CineSocial.Application.Features.Movies;

public record MovieDto(
    Guid Id,
    int TmdbId,
    string Title,
    string? OriginalTitle,
    string? Overview,
    DateTime? ReleaseDate,
    int? Runtime,
    string? PosterPath,
    string? BackdropPath,
    double? VoteAverage,
    int? VoteCount,
    double? Popularity,
    string? Status,
    string? Tagline
);
