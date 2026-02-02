namespace CineSocial.Application.Interfaces;

public interface IEmailVerificationService
{
    Task<string> GenerateVerificationTokenAsync(Guid userId, string email, CancellationToken cancellationToken = default);
    Task<bool> ValidateTokenAsync(string token, CancellationToken cancellationToken = default);
    Task<Guid?> ConsumeTokenAsync(string token, CancellationToken cancellationToken = default);
    Task InvalidateTokensForUserAsync(Guid userId, CancellationToken cancellationToken = default);
}
