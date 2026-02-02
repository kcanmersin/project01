namespace CineSocial.Application.Interfaces;

public interface IEmailService
{
    Task SendEmailVerificationAsync(string toEmail, string username, string verificationLink, CancellationToken cancellationToken = default);
    Task SendWelcomeEmailAsync(string toEmail, string username, CancellationToken cancellationToken = default);
}
