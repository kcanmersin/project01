using CineSocial.Domain.Entities.Movie;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CineSocial.Infrastructure.Persistence.Configurations;

public class MovieEntityConfiguration : IEntityTypeConfiguration<MovieEntity>
{
    public void Configure(EntityTypeBuilder<MovieEntity> builder)
    {
        builder.ToTable("Movies");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.TmdbId)
            .IsRequired();

        builder.HasIndex(m => m.TmdbId)
            .IsUnique();

        builder.Property(m => m.Title)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(m => m.OriginalTitle)
            .HasMaxLength(500);

        builder.Property(m => m.Overview)
            .HasMaxLength(2000);

        builder.Property(m => m.PosterPath)
            .HasMaxLength(500);

        builder.Property(m => m.BackdropPath)
            .HasMaxLength(500);

        builder.Property(m => m.ImdbId)
            .HasMaxLength(50);

        builder.Property(m => m.OriginalLanguage)
            .HasMaxLength(10);

        builder.Property(m => m.Status)
            .HasMaxLength(50);

        builder.Property(m => m.Tagline)
            .HasMaxLength(500);

        builder.Property(m => m.Homepage)
            .HasMaxLength(500);

        builder.HasMany(m => m.MovieGenres)
            .WithOne(mg => mg.Movie)
            .HasForeignKey(mg => mg.MovieId);

        builder.HasMany(m => m.MovieCasts)
            .WithOne(mc => mc.Movie)
            .HasForeignKey(mc => mc.MovieId);

        builder.HasMany(m => m.MovieCrews)
            .WithOne(mc => mc.Movie)
            .HasForeignKey(mc => mc.MovieId);

        builder.HasMany(m => m.MovieProductionCompanies)
            .WithOne(mpc => mpc.Movie)
            .HasForeignKey(mpc => mpc.MovieId);

        builder.HasMany(m => m.MovieCountries)
            .WithOne(mc => mc.Movie)
            .HasForeignKey(mc => mc.MovieId);

        builder.HasMany(m => m.MovieLanguages)
            .WithOne(ml => ml.Movie)
            .HasForeignKey(ml => ml.MovieId);

        builder.HasMany(m => m.MovieKeywords)
            .WithOne(mk => mk.Movie)
            .HasForeignKey(mk => mk.MovieId);

        builder.HasMany(m => m.MovieVideos)
            .WithOne(mv => mv.Movie)
            .HasForeignKey(mv => mv.MovieId);

        builder.HasMany(m => m.MovieImages)
            .WithOne(mi => mi.Movie)
            .HasForeignKey(mi => mi.MovieId);

        builder.HasMany(m => m.MovieCollections)
            .WithOne(mc => mc.Movie)
            .HasForeignKey(mc => mc.MovieId);
    }
}
