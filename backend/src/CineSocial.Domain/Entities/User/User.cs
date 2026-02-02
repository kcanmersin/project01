using CineSocial.Domain.Common;
using CineSocial.Domain.Enums;

namespace CineSocial.Domain.Entities.User;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
    public UserRole Role { get; set; } = UserRole.User;
    public DateTime? LastLoginAt { get; set; }

    public bool IsEmailVerified { get; set; }
    public DateTime? EmailVerifiedAt { get; set; }

    /// <summary>
    /// Profile image ID (stored in StoredImages table)
    /// </summary>
    public Guid? ProfileImageId { get; set; }

    /// <summary>
    /// Cover/banner image ID (stored in StoredImages table)
    /// </summary>
    public Guid? CoverImageId { get; set; }

    public ICollection<UserExternalLogin> ExternalLogins { get; set; } = new List<UserExternalLogin>();
    public ICollection<EmailVerificationToken> VerificationTokens { get; set; } = new List<EmailVerificationToken>();
}
