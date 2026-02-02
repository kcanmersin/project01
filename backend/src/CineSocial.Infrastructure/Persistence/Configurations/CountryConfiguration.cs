using CineSocial.Domain.Entities.Movie;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CineSocial.Infrastructure.Persistence.Configurations;

public class CountryConfiguration : IEntityTypeConfiguration<Country>
{
    public void Configure(EntityTypeBuilder<Country> builder)
    {
        builder.ToTable("Countries");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Iso31661)
            .IsRequired()
            .HasMaxLength(2);

        builder.HasIndex(c => c.Iso31661)
            .IsUnique();

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasMany(c => c.MovieCountries)
            .WithOne(mc => mc.Country)
            .HasForeignKey(mc => mc.CountryId);
    }
}
