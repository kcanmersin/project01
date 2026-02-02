using CineSocial.Domain.Entities.User;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CineSocial.Infrastructure.Persistence.Configurations;

public class UserExternalLoginConfiguration : IEntityTypeConfiguration<UserExternalLogin>
{
    public void Configure(EntityTypeBuilder<UserExternalLogin> builder)
    {
        builder.ToTable("UserExternalLogins");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Provider)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.ProviderUserId)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.ProviderEmail)
            .HasMaxLength(256);

        builder.Property(x => x.ProviderDisplayName)
            .HasMaxLength(256);

        builder.Property(x => x.ProviderProfilePictureUrl)
            .HasMaxLength(1024);

        builder.Property(x => x.RefreshToken)
            .HasMaxLength(2048);

        builder.HasIndex(x => new { x.UserId, x.Provider }).IsUnique();

        builder.HasIndex(x => new { x.Provider, x.ProviderUserId }).IsUnique();
    }
}
