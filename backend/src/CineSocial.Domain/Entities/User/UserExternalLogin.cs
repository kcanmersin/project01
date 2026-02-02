using CineSocial.Domain.Common;

namespace CineSocial.Domain.Entities.User;

public class UserExternalLogin : BaseEntity
{
    public Guid UserId { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string ProviderUserId { get; set; } = string.Empty;
    public string? ProviderEmail { get; set; }
    public string? ProviderDisplayName { get; set; }
    public string? ProviderProfilePictureUrl { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? TokenExpiresAt { get; set; }

    public User User { get; set; } = null!;
}
