using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.User;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Auth.Commands.ChangePassword;

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Result<string>>
{
    private readonly DbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public ChangePasswordCommandHandler(
        DbContext context,
        IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<string>> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        // Validate new password
        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        {
            return Result<string>.BadRequest("Yeni şifre en az 6 karakter olmalıdır.");
        }

        // Find user
        var user = await _context.Set<User>()
            .FirstOrDefaultAsync(u => u.Id == request.UserId && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            return Result<string>.NotFound("Kullanıcı bulunamadı.");
        }

        // Check if user has a password (Google-only users)
        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            return Result<string>.BadRequest("Google ile giriş yapan kullanıcılar şifre değiştirme işlemi yapamaz. Önce bir şifre belirlemeniz gerekir.");
        }

        // Verify current password
        if (!_passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return Result<string>.BadRequest("Mevcut şifre yanlış.");
        }

        // Update password
        user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<string>.Success("Şifreniz başarıyla güncellendi.");
    }
}
