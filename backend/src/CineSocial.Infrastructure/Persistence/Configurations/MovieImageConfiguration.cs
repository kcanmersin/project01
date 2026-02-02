using CineSocial.Domain.Entities.Movie;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CineSocial.Infrastructure.Persistence.Configurations;

public class MovieImageConfiguration : IEntityTypeConfiguration<MovieImage>
{
    public void Configure(EntityTypeBuilder<MovieImage> builder)
    {
        builder.ToTable("MovieImages");

        builder.HasKey(mi => mi.Id);

        builder.Property(mi => mi.FilePath)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(mi => mi.ImageType)
            .HasMaxLength(50);

        builder.Property(mi => mi.Language)
            .HasMaxLength(10);

        builder.HasOne(mi => mi.Movie)
            .WithMany(m => m.MovieImages)
            .HasForeignKey(mi => mi.MovieId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(mi => new { mi.MovieId, mi.ImageType });
    }
}
