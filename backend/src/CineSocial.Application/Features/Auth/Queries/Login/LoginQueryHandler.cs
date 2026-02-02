using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.User;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Auth.Queries.Login;

public class LoginQueryHandler : IRequestHandler<LoginQuery, Result<AuthResponseDto>>
{
    private readonly DbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;

    public LoginQueryHandler(
        DbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<Result<AuthResponseDto>> Handle(LoginQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.EmailOrUsername))
        {
            return Result<AuthResponseDto>.BadRequest("Email veya kullanıcı adı gereklidir.");
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return Result<AuthResponseDto>.BadRequest("Şifre gereklidir.");
        }

        var searchTerm = request.EmailOrUsername.ToLower().Trim();
        var user = await _context.Set<User>()
            .FirstOrDefaultAsync(u =>
                (u.Email.ToLower() == searchTerm || u.Username.ToLower() == searchTerm)
                && !u.IsDeleted,
                cancellationToken);

        if (user is null)
        {
            return Result<AuthResponseDto>.BadRequest("Geçersiz email/kullanıcı adı veya şifre.");
        }

        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            return Result<AuthResponseDto>.BadRequest("Bu hesap Google ile oluşturulmuş. Lütfen Google ile giriş yapın.");
        }

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return Result<AuthResponseDto>.BadRequest("Geçersiz email/kullanıcı adı veya şifre.");
        }

        if (!user.IsEmailVerified)
        {
            return Result<AuthResponseDto>.Failure("Email adresinizi doğrulamanız gerekiyor. Lütfen email kutunuzu kontrol edin.", 403);
        }

        user.LastLoginAt = DateTime.UtcNow;
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
