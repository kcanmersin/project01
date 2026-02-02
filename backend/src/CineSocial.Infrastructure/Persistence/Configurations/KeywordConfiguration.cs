using CineSocial.Domain.Entities.Movie;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CineSocial.Infrastructure.Persistence.Configurations;

public class KeywordConfiguration : IEntityTypeConfiguration<Keyword>
{
    public void Configure(EntityTypeBuilder<Keyword> builder)
    {
        builder.ToTable("Keywords");

        builder.HasKey(k => k.Id);

        builder.Property(k => k.TmdbId)
            .IsRequired();

        builder.HasIndex(k => k.TmdbId)
            .IsUnique();

        builder.Property(k => k.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasMany(k => k.MovieKeywords)
            .WithOne(mk => mk.Keyword)
            .HasForeignKey(mk => mk.KeywordId);
    }
}
