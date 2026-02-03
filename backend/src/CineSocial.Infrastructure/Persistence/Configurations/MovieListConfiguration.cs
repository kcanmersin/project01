using CineSocial.Domain.Entities.Social;
using CineSocial.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CineSocial.Infrastructure.Persistence.Configurations;

public class MovieListConfiguration : IEntityTypeConfiguration<MovieList>
{
    public void Configure(EntityTypeBuilder<MovieList> builder)
    {
        builder.ToTable("MovieLists");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.Title)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(l => l.Description)
            .HasMaxLength(500);

        builder.Property(l => l.ListType)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(l => l.IsPublic)
            .HasDefaultValue(false);

        builder.Property(l => l.MovieCount)
            .HasDefaultValue(0);

        builder.HasIndex(l => l.UserId);

        // Unique constraint for system lists (Watchlist, Favorites) per user
        builder.HasIndex(l => new { l.UserId, l.ListType })
            .IsUnique()
            .HasFilter("\"ListType\" IN ('Watchlist', 'Favorites')");

        builder.HasOne(l => l.User)
            .WithMany()
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(l => l.Items)
            .WithOne(i => i.MovieList)
            .HasForeignKey(i => i.MovieListId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(l => l.Favorites)
            .WithOne(f => f.MovieList)
            .HasForeignKey(f => f.MovieListId)
            .OnDelete(DeleteBehavior.Cascade);

        // Global query filter for soft delete
        builder.HasQueryFilter(l => !l.IsDeleted);
    }
}
