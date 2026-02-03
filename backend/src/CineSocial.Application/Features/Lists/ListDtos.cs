using CineSocial.Domain.Enums;

namespace CineSocial.Application.Features.Lists;

public record MovieListDto(
    Guid Id,
    Guid UserId,
    string Username,
    string Title,
    string? Description,
    Guid? CoverImageId,
    string ListType,
    bool IsPublic,
    int MovieCount,
    int FavoriteCount,
    bool IsFavoritedByCurrentUser,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record MovieListItemDto(
    Guid Id,
    Guid MovieId,
    string MovieTitle,
    string? MoviePosterPath,
    decimal? MovieVoteAverage,
    string? MovieReleaseDate,
    int Order,
    string? Note,
    DateTime AddedAt
);

public record MovieListDetailDto(
    Guid Id,
    Guid UserId,
    string Username,
    string Title,
    string? Description,
    Guid? CoverImageId,
    string ListType,
    bool IsPublic,
    int MovieCount,
    int FavoriteCount,
    bool IsFavoritedByCurrentUser,
    bool IsOwner,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    List<MovieListItemDto> Items
);

public record SimpleListDto(
    Guid Id,
    string Title,
    string ListType,
    int MovieCount,
    bool ContainsMovie
);
