using CineSocial.Domain.Entities.Movie;
using CineSocial.Domain.Entities.Media;
using CineSocial.Domain.Entities.Social;
using CineSocial.Domain.Entities.User;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Interfaces;

/// <summary>
/// Database context abstraction for Application layer handlers
/// </summary>
public interface IApplicationDbContext
{
    // User entities
    DbSet<User> Users { get; }

    // Movie entities
    DbSet<MovieEntity> Movies { get; }
    DbSet<Genre> Genres { get; }
    DbSet<MovieGenre> MovieGenres { get; }
    DbSet<MovieImage> MovieImages { get; }
    DbSet<MovieCast> MovieCasts { get; }
    DbSet<MovieCrew> MovieCrews { get; }
    DbSet<Person> People { get; }
    DbSet<Country> Countries { get; }
    DbSet<Language> Languages { get; }

    // Media entities
    DbSet<StoredImage> StoredImages { get; }

    // Social entities
    DbSet<MovieRating> MovieRatings { get; }
    DbSet<MovieList> MovieLists { get; }
    DbSet<MovieListItem> MovieListItems { get; }
    DbSet<Comment> Comments { get; }
    DbSet<CommentReaction> CommentReactions { get; }
    DbSet<ListFavorite> ListFavorites { get; }
    DbSet<UserFollow> UserFollows { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
