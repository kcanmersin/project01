using CineSocial.Application.Interfaces;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CineSocial.Infrastructure.Services;

public class GoogleAuthService : IExternalAuthService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<GoogleAuthService> _logger;

    public GoogleAuthService(IConfiguration configuration, ILogger<GoogleAuthService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<ExternalAuthResult> ValidateGoogleTokenAsync(string idToken, CancellationToken cancellationToken = default)
    {
        try
        {
            var clientId = _configuration["GOOGLE_CLIENT_ID"];

            if (string.IsNullOrWhiteSpace(clientId))
            {
                _logger.LogError("GOOGLE_CLIENT_ID is not configured");
                return new ExternalAuthResult(false, null, null, null, null, "Google yapılandırması eksik.");
            }

            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { clientId }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

            if (payload == null)
            {
                return new ExternalAuthResult(false, null, null, null, null, "Google token doğrulanamadı.");
            }

            return new ExternalAuthResult(
                true,
                payload.Subject,
                payload.Email,
                payload.Name,
                payload.Picture,
                null
            );
        }
        catch (InvalidJwtException ex)
        {
            _logger.LogWarning(ex, "Invalid Google JWT token");
            return new ExternalAuthResult(false, null, null, null, null, "Geçersiz Google token.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating Google token");
            return new ExternalAuthResult(false, null, null, null, null, "Google token doğrulanırken hata oluştu.");
        }
    }
}
