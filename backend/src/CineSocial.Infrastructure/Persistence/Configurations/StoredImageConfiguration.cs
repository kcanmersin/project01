using CineSocial.Domain.Entities.Media;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CineSocial.Infrastructure.Persistence.Configurations;

public class StoredImageConfiguration : IEntityTypeConfiguration<StoredImage>
{
    public void Configure(EntityTypeBuilder<StoredImage> builder)
    {
        builder.ToTable("StoredImages");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.Bucket)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(i => i.FileName)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(i => i.ContentType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(i => i.Base64Data)
            .IsRequired();

        // Index for fast lookups by bucket and owner
        builder.HasIndex(i => new { i.Bucket, i.OwnerId });
    }
}
