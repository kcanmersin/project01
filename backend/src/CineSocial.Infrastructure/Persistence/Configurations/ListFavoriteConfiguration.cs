using CineSocial.Domain.Entities.Social;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CineSocial.Infrastructure.Persistence.Configurations;

public class ListFavoriteConfiguration : IEntityTypeConfiguration<ListFavorite>
{
    public void Configure(EntityTypeBuilder<ListFavorite> builder)
    {
        builder.ToTable("ListFavorites");

        builder.HasKey(f => f.Id);

        // Unique constraint: one favorite per user per list
        builder.HasIndex(f => new { f.UserId, f.MovieListId })
            .IsUnique();

        builder.HasIndex(f => f.MovieListId);

        builder.HasOne(f => f.User)
            .WithMany()
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(f => f.MovieList)
            .WithMany(l => l.Favorites)
            .HasForeignKey(f => f.MovieListId)
            .OnDelete(DeleteBehavior.Cascade);

        // Global query filter for soft delete
        builder.HasQueryFilter(f => !f.IsDeleted);
    }
}
