using CineSocial.Domain.Entities.Social;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CineSocial.Infrastructure.Persistence.Configurations;

public class MovieRatingConfiguration : IEntityTypeConfiguration<MovieRating>
{
    public void Configure(EntityTypeBuilder<MovieRating> builder)
    {
        builder.ToTable("MovieRatings");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Rating)
            .IsRequired()
            .HasPrecision(3, 1);

        builder.Property(r => r.Review)
            .HasMaxLength(2000);

        // Unique constraint: one rating per user per movie
        builder.HasIndex(r => new { r.UserId, r.MovieId })
            .IsUnique();

        builder.HasIndex(r => r.MovieId);

        // Compound index for UserId + IsDeleted + CreatedAt for optimized filtered queries
        builder.HasIndex(r => new { r.UserId, r.IsDeleted, r.CreatedAt })
            .HasDatabaseName("IX_MovieRatings_UserId_IsDeleted_CreatedAt");

        builder.HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.Movie)
            .WithMany()
            .HasForeignKey(r => r.MovieId)
            .OnDelete(DeleteBehavior.Cascade);

        // Global query filter for soft delete
        builder.HasQueryFilter(r => !r.IsDeleted);
    }
}
