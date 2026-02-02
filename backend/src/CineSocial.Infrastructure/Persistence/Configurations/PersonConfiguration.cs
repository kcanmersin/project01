using CineSocial.Domain.Entities.Movie;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CineSocial.Infrastructure.Persistence.Configurations;

public class PersonConfiguration : IEntityTypeConfiguration<Person>
{
    public void Configure(EntityTypeBuilder<Person> builder)
    {
        builder.ToTable("People");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.TmdbId)
            .IsRequired();

        builder.HasIndex(p => p.TmdbId)
            .IsUnique();

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.ProfilePath)
            .HasMaxLength(500);

        builder.Property(p => p.Biography)
            .HasMaxLength(5000);

        builder.Property(p => p.PlaceOfBirth)
            .HasMaxLength(200);

        builder.Property(p => p.KnownForDepartment)
            .HasMaxLength(100);

        builder.Property(p => p.ImdbId)
            .HasMaxLength(50);

        builder.HasMany(p => p.MovieCasts)
            .WithOne(mc => mc.Person)
            .HasForeignKey(mc => mc.PersonId);

        builder.HasMany(p => p.MovieCrews)
            .WithOne(mc => mc.Person)
            .HasForeignKey(mc => mc.PersonId);
    }
}
