using CineSocial.Domain.Entities.Social;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CineSocial.Infrastructure.Persistence.Configurations;

public class MovieListItemConfiguration : IEntityTypeConfiguration<MovieListItem>
{
    public void Configure(EntityTypeBuilder<MovieListItem> builder)
    {
        builder.ToTable("MovieListItems");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.Order)
            .IsRequired();

        builder.Property(i => i.Note)
            .HasMaxLength(500);

        // Unique constraint: one movie per list
        builder.HasIndex(i => new { i.MovieListId, i.MovieId })
            .IsUnique();

        // Index for ordering
        builder.HasIndex(i => new { i.MovieListId, i.Order });

        builder.HasIndex(i => i.MovieId);

        builder.HasOne(i => i.MovieList)
            .WithMany(l => l.Items)
            .HasForeignKey(i => i.MovieListId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(i => i.Movie)
            .WithMany()
            .HasForeignKey(i => i.MovieId)
            .OnDelete(DeleteBehavior.Cascade);

        // Global query filter for soft delete
        builder.HasQueryFilter(i => !i.IsDeleted);
    }
}
