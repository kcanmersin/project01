namespace CineSocial.Application.Features.Movies;

public record MovieDetailDto(
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
    string? Tagline,
    string? Homepage,
    decimal? Budget,
    decimal? Revenue,
    string? ImdbId,
    List<GenreDto> Genres,
    List<CastMemberDto> Cast,
    List<CrewMemberDto> Crew
);

public record GenreDto(int Id, string Name);

public record CastMemberDto(
    Guid PersonId,
    string Name,
    string? Character,
    string? ProfilePath,
    int? CastOrder
);

public record CrewMemberDto(
    Guid PersonId,
    string Name,
    string? Job,
    string? Department,
    string? ProfilePath
);
