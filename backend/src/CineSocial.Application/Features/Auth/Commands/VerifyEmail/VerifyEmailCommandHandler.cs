using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.User;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Auth.Commands.VerifyEmail;

public class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand, Result<AuthResponseDto>>
{
    private readonly DbContext _context;
    private readonly IEmailVerificationService _emailVerificationService;
    private readonly IJwtTokenService _jwtTokenService;

    public VerifyEmailCommandHandler(
        DbContext context,
        IEmailVerificationService emailVerificationService,
        IJwtTokenService jwtTokenService)
    {
        _context = context;
        _emailVerificationService = emailVerificationService;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<Result<AuthResponseDto>> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Token))
        {
            return Result<AuthResponseDto>.BadRequest("Doğrulama token'ı gereklidir.");
        }

        var userId = await _emailVerificationService.ConsumeTokenAsync(request.Token, cancellationToken);

        if (userId == null)
        {
            return Result<AuthResponseDto>.BadRequest("Geçersiz veya süresi dolmuş doğrulama linki.");
        }

        var user = await _context.Set<User>()
            .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            return Result<AuthResponseDto>.NotFound("Kullanıcı bulunamadı.");
        }

        if (user.IsEmailVerified)
        {
            return Result<AuthResponseDto>.BadRequest("Email zaten doğrulanmış.");
        }

        user.IsEmailVerified = true;
        user.EmailVerifiedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        var token = _jwtTokenService.GenerateToken(user);

        var hasGoogleLinked = await _context.Set<UserExternalLogin>()
            .AnyAsync(e => e.UserId == user.Id && e.Provider == "Google" && !e.IsDeleted, cancellationToken);

        var userDto = new UserDto(
            user.Id,
            user.Email,
            user.Username,
            user.Role.ToString(),
            user.CreatedAt,
            user.ProfileImageId,
            user.CoverImageId,
            user.IsEmailVerified,
            hasGoogleLinked
        );

        return Result<AuthResponseDto>.Success(new AuthResponseDto(token, userDto));
    }
}
