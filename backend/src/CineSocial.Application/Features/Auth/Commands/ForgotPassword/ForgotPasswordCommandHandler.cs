using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.User;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CineSocial.Application.Features.Auth.Commands.ForgotPassword;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, Result<string>>
{
    private readonly DbContext _context;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public ForgotPasswordCommandHandler(
        DbContext context,
        IEmailService emailService,
        IConfiguration configuration)
    {
        _context = context;
        _emailService = emailService;
        _configuration = configuration;
    }

    public async Task<Result<string>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.ToLower().Trim();

        // Find user by email
        var user = await _context.Set<User>()
            .FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted, cancellationToken);

        // Always return success to prevent email enumeration
        if (user == null)
        {
            return Result<string>.Success("Eğer bu email adresi sistemimizde kayıtlıysa, şifre sıfırlama linki gönderilecektir.");
        }

        // Check if user has a password (Google-only users can't reset)
        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            return Result<string>.Success("Eğer bu email adresi sistemimizde kayıtlıysa, şifre sıfırlama linki gönderilecektir.");
        }

        // Invalidate any existing tokens for this user
        var existingTokens = await _context.Set<PasswordResetToken>()
            .Where(t => t.UserId == user.Id && !t.IsUsed && t.ExpiresAt > DateTime.UtcNow)
            .ToListAsync(cancellationToken);

        foreach (var token in existingTokens)
        {
            token.IsUsed = true;
            token.UsedAt = DateTime.UtcNow;
        }

        // Generate new token
        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N"),
            Email = email,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<PasswordResetToken>().Add(resetToken);
        await _context.SaveChangesAsync(cancellationToken);

        // Send email
        var frontendUrl = _configuration["FRONTEND_URL"] ?? "http://localhost:3000";
        var resetLink = $"{frontendUrl}/reset-password?token={resetToken.Token}";

        await _emailService.SendPasswordResetAsync(
            user.Email,
            user.Username,
            resetLink,
            cancellationToken);

        return Result<string>.Success("Eğer bu email adresi sistemimizde kayıtlıysa, şifre sıfırlama linki gönderilecektir.");
    }
}
