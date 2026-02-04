using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.User;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Auth.Commands.ResetPassword;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result<string>>
{
    private readonly DbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public ResetPasswordCommandHandler(
        DbContext context,
        IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<string>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        // Validate password
        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        {
            return Result<string>.BadRequest("Şifre en az 6 karakter olmalıdır.");
        }

        // Find valid token
        var resetToken = await _context.Set<PasswordResetToken>()
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => 
                t.Token == request.Token && 
                !t.IsUsed && 
                t.ExpiresAt > DateTime.UtcNow, 
                cancellationToken);

        if (resetToken == null)
        {
            return Result<string>.BadRequest("Geçersiz veya süresi dolmuş şifre sıfırlama linki.");
        }

        // Check if user exists and is not deleted
        if (resetToken.User == null || resetToken.User.IsDeleted)
        {
            return Result<string>.BadRequest("Geçersiz veya süresi dolmuş şifre sıfırlama linki.");
        }

        // Update password
        resetToken.User.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        resetToken.User.UpdatedAt = DateTime.UtcNow;

        // Mark token as used
        resetToken.IsUsed = true;
        resetToken.UsedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<string>.Success("Şifreniz başarıyla güncellendi. Şimdi giriş yapabilirsiniz.");
    }
}
