namespace CineSocial.Application.Features.People;

public record PersonDetailDto(
    Guid Id,
    int TmdbId,
    string Name,
    string? Biography,
    DateTime? Birthday,
    DateTime? Deathday,
    string? PlaceOfBirth,
    string? ProfilePath,
    double? Popularity,
    int? Gender,
    string? KnownForDepartment,
    string? ImdbId,
    int Age,
    List<PersonMovieDto> MoviesAsCast,
    List<PersonCrewMovieDto> MoviesAsCrew
);

public record PersonMovieDto(
    Guid MovieId,
    int TmdbId,
    string Title,
    string? PosterPath,
    DateTime? ReleaseDate,
    double? VoteAverage,
    string? Character,
    int? CastOrder
);

public record PersonCrewMovieDto(
    Guid MovieId,
    int TmdbId,
    string Title,
    string? PosterPath,
    DateTime? ReleaseDate,
    double? VoteAverage,
    string? Job,
    string? Department
);
