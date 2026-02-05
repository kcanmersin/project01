using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Search;

public class UnifiedSearchQuery : IRequest<Result<UnifiedSearchResult>>
{
    public string Query { get; set; } = string.Empty;
    public int Limit { get; set; } = 6;
    public SearchType? Type { get; set; } // null = search all types
}

public enum SearchType
{
    Movies,
    People,
    Users
}

public class UnifiedSearchResult
{
    public List<MovieSearchResult> Movies { get; set; } = new();
    public List<PersonSearchResult> People { get; set; } = new();
    public List<UserSearchResult> Users { get; set; } = new();
}

public record MovieSearchResult(
    Guid Id,
    int TmdbId,
    string Title,
    string? PosterPath,
    int? Year,
    double? VoteAverage
);

public record PersonSearchResult(
    Guid Id,
    int TmdbId,
    string Name,
    string? ProfilePath,
    string? KnownForDepartment
);

public record UserSearchResult(
    Guid Id,
    string Username,
    Guid? ProfileImageId,
    string? Bio
);
