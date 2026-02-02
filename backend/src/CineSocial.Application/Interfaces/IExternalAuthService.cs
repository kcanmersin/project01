namespace CineSocial.Application.Interfaces;

public record ExternalAuthResult(
    bool IsValid,
    string? ProviderUserId,
    string? Email,
    string? DisplayName,
    string? ProfilePictureUrl,
    string? ErrorMessage
);

public interface IExternalAuthService
{
    Task<ExternalAuthResult> ValidateGoogleTokenAsync(string idToken, CancellationToken cancellationToken = default);
}
