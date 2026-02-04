using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.Media;
using CineSocial.Domain.Entities.Movie;
using CineSocial.Domain.Entities.Social;
using CineSocial.Domain.Entities.User;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Infrastructure.Persistence;

public class CineSocialDbContext : DbContext, IApplicationDbContext
{
    public CineSocialDbContext(DbContextOptions<CineSocialDbContext> options) : base(options)
    {
    }

    // User Entities
    public DbSet<User> Users { get; set; }
    public DbSet<UserExternalLogin> UserExternalLogins { get; set; }
    public DbSet<EmailVerificationToken> EmailVerificationTokens { get; set; }
    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

    // Media Entities
    public DbSet<StoredImage> StoredImages { get; set; }

    // Movie Entities
    public DbSet<MovieEntity> Movies { get; set; }
    public DbSet<Collection> Collections { get; set; }
    public DbSet<Country> Countries { get; set; }
    public DbSet<Genre> Genres { get; set; }
    public DbSet<Keyword> Keywords { get; set; }
    public DbSet<Language> Languages { get; set; }
    public DbSet<MovieCast> MovieCasts { get; set; }
    public DbSet<MovieCollection> MovieCollections { get; set; }
    public DbSet<MovieCountry> MovieCountries { get; set; }
    public DbSet<MovieCrew> MovieCrews { get; set; }
    public DbSet<MovieGenre> MovieGenres { get; set; }
    public DbSet<MovieImage> MovieImages { get; set; }
    public DbSet<MovieKeyword> MovieKeywords { get; set; }
    public DbSet<MovieLanguage> MovieLanguages { get; set; }
    public DbSet<MovieProductionCompany> MovieProductionCompanies { get; set; }
    public DbSet<MovieVideo> MovieVideos { get; set; }
    public DbSet<Person> People { get; set; }
    public DbSet<ProductionCompany> ProductionCompanies { get; set; }

    // Social Entities
    public DbSet<MovieRating> MovieRatings { get; set; }
    public DbSet<MovieList> MovieLists { get; set; }
    public DbSet<MovieListItem> MovieListItems { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<CommentReaction> CommentReactions { get; set; }
    public DbSet<ListFavorite> ListFavorites { get; set; }
    public DbSet<UserFollow> UserFollows { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CineSocialDbContext).Assembly);
    }
}
