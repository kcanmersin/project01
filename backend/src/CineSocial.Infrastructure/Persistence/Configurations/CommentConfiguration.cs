using CineSocial.Domain.Entities.Social;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CineSocial.Infrastructure.Persistence.Configurations;

public class CommentConfiguration : IEntityTypeConfiguration<Comment>
{
    public void Configure(EntityTypeBuilder<Comment> builder)
    {
        builder.ToTable("Comments");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.TargetType)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(c => c.TargetId)
            .IsRequired();

        builder.Property(c => c.Content)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(c => c.UpvoteCount)
            .HasDefaultValue(0);

        builder.Property(c => c.DownvoteCount)
            .HasDefaultValue(0);

        builder.Property(c => c.ReplyCount)
            .HasDefaultValue(0);

        builder.HasIndex(c => new { c.TargetType, c.TargetId });
        builder.HasIndex(c => c.UserId);
        builder.HasIndex(c => c.ParentCommentId);

        // Compound index for UserId + IsDeleted + CreatedAt for optimized activity queries
        builder.HasIndex(c => new { c.UserId, c.IsDeleted, c.CreatedAt })
            .HasDatabaseName("IX_Comments_UserId_IsDeleted_CreatedAt");

        builder.HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Self-referencing relationship for replies
        builder.HasOne(c => c.ParentComment)
            .WithMany(c => c.Replies)
            .HasForeignKey(c => c.ParentCommentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.Reactions)
            .WithOne(r => r.Comment)
            .HasForeignKey(r => r.CommentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Global query filter for soft delete
        builder.HasQueryFilter(c => !c.IsDeleted);
    }
}
