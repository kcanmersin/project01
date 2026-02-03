using CineSocial.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Tests.Helpers;

/// <summary>
/// Helper class to create in-memory database context for testing
/// </summary>
public class TestDbContextFactory
{
    public static DbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<DbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new TestDbContext(options);
        return context;
    }
}

/// <summary>
/// Test implementation of DbContext for in-memory testing
/// </summary>
public class TestDbContext : DbContext, IApplicationDbContext
{
    public TestDbContext(DbContextOptions<DbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<MovieEntity> Movies { get; set; } = null!;
    public DbSet<Genre> Genres { get; set; } = null!;
    public DbSet<MovieGenre> MovieGenres { get; set; } = null!;
    public DbSet<MovieImage> MovieImages { get; set; } = null!;
    public DbSet<MovieCast> MovieCasts { get; set; } = null!;
    public DbSet<MovieCrew> MovieCrews { get; set; } = null!;
    public DbSet<Person> People { get; set; } = null!;
    public DbSet<Country> Countries { get; set; } = null!;
    public DbSet<Language> Languages { get; set; } = null!;
    public DbSet<StoredImage> StoredImages { get; set; } = null!;
    public DbSet<MovieRating> MovieRatings { get; set; } = null!;
    public DbSet<MovieList> MovieLists { get; set; } = null!;
    public DbSet<MovieListItem> MovieListItems { get; set; } = null!;
    public DbSet<Comment> Comments { get; set; } = null!;
    public DbSet<CommentReaction> CommentReactions { get; set; } = null!;
    public DbSet<ListFavorite> ListFavorites { get; set; } = null!;
}
