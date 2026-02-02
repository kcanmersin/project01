using System.Security.Cryptography;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.User;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CineSocial.Infrastructure.Services;

public class EmailVerificationService : IEmailVerificationService
{
    private readonly DbContext _context;
    private readonly IConfiguration _configuration;

    public EmailVerificationService(DbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<string> GenerateVerificationTokenAsync(Guid userId, string email, CancellationToken cancellationToken = default)
    {
        var token = GenerateSecureToken();
        var expiryHours = int.Parse(_configuration["EMAIL_VERIFICATION_EXPIRY_HOURS"] ?? "24");

        var verificationToken = new EmailVerificationToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Token = token,
            Email = email.ToLower().Trim(),
            ExpiresAt = DateTime.UtcNow.AddHours(expiryHours),
            IsUsed = false,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        _context.Set<EmailVerificationToken>().Add(verificationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return token;
    }

    public async Task<bool> ValidateTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(token))
            return false;

        var verificationToken = await _context.Set<EmailVerificationToken>()
            .FirstOrDefaultAsync(t =>
                t.Token == token &&
                !t.IsUsed &&
                !t.IsDeleted &&
                t.ExpiresAt > DateTime.UtcNow,
                cancellationToken);

        return verificationToken != null;
    }

    public async Task<Guid?> ConsumeTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(token))
            return null;

        var verificationToken = await _context.Set<EmailVerificationToken>()
            .FirstOrDefaultAsync(t =>
                t.Token == token &&
                !t.IsUsed &&
                !t.IsDeleted &&
                t.ExpiresAt > DateTime.UtcNow,
                cancellationToken);

        if (verificationToken == null)
            return null;

        verificationToken.IsUsed = true;
        verificationToken.UsedAt = DateTime.UtcNow;
        verificationToken.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return verificationToken.UserId;
    }

    public async Task InvalidateTokensForUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var tokens = await _context.Set<EmailVerificationToken>()
            .Where(t => t.UserId == userId && !t.IsUsed && !t.IsDeleted)
            .ToListAsync(cancellationToken);

        foreach (var token in tokens)
        {
            token.IsDeleted = true;
            token.DeletedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    private static string GenerateSecureToken()
    {
        var randomBytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
    }
}
