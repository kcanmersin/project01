using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.User;
using CineSocial.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Auth.Commands.GoogleLogin;

public class GoogleLoginCommandHandler : IRequestHandler<GoogleLoginCommand, Result<AuthResponseDto>>
{
    private readonly DbContext _context;
    private readonly IExternalAuthService _externalAuthService;
    private readonly IJwtTokenService _jwtTokenService;

    public GoogleLoginCommandHandler(
        DbContext context,
        IExternalAuthService externalAuthService,
        IJwtTokenService jwtTokenService)
    {
        _context = context;
        _externalAuthService = externalAuthService;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<Result<AuthResponseDto>> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken))
        {
            return Result<AuthResponseDto>.BadRequest("Google ID token gereklidir.");
        }

        var googleResult = await _externalAuthService.ValidateGoogleTokenAsync(request.IdToken, cancellationToken);

        if (!googleResult.IsValid)
        {
            return Result<AuthResponseDto>.BadRequest(googleResult.ErrorMessage ?? "Google token doğrulanamadı.");
        }

        if (string.IsNullOrWhiteSpace(googleResult.Email))
        {
            return Result<AuthResponseDto>.BadRequest("Google hesabından email alınamadı.");
        }

        var existingExternalLogin = await _context.Set<UserExternalLogin>()
            .Include(e => e.User)
            .FirstOrDefaultAsync(e =>
                e.Provider == "Google" &&
                e.ProviderUserId == googleResult.ProviderUserId &&
                !e.IsDeleted,
                cancellationToken);

        User user;

        if (existingExternalLogin != null)
        {
            user = existingExternalLogin.User;

            existingExternalLogin.ProviderEmail = googleResult.Email;
            existingExternalLogin.ProviderDisplayName = googleResult.DisplayName;
            existingExternalLogin.ProviderProfilePictureUrl = googleResult.ProfilePictureUrl;
            existingExternalLogin.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            var existingUser = await _context.Set<User>()
                .Include(u => u.ExternalLogins)
                .FirstOrDefaultAsync(u =>
                    u.Email.ToLower() == googleResult.Email.ToLower() &&
                    !u.IsDeleted,
                    cancellationToken);

            if (existingUser != null)
            {
                user = existingUser;

                if (!user.IsEmailVerified)
                {
                    user.IsEmailVerified = true;
                    user.EmailVerifiedAt = DateTime.UtcNow;
                }

                var externalLogin = new UserExternalLogin
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    Provider = "Google",
                    ProviderUserId = googleResult.ProviderUserId!,
                    ProviderEmail = googleResult.Email,
                    ProviderDisplayName = googleResult.DisplayName,
                    ProviderProfilePictureUrl = googleResult.ProfilePictureUrl,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };

                _context.Set<UserExternalLogin>().Add(externalLogin);
            }
            else
            {
                var username = await GenerateUniqueUsernameAsync(googleResult.DisplayName ?? "user", cancellationToken);

                user = new User
                {
                    Id = Guid.NewGuid(),
                    Email = googleResult.Email.ToLower().Trim(),
                    Username = username,
                    PasswordHash = null,
                    Role = UserRole.User,
                    IsEmailVerified = true,
                    EmailVerifiedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };

                _context.Set<User>().Add(user);

                var externalLogin = new UserExternalLogin
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    Provider = "Google",
                    ProviderUserId = googleResult.ProviderUserId!,
                    ProviderEmail = googleResult.Email,
                    ProviderDisplayName = googleResult.DisplayName,
                    ProviderProfilePictureUrl = googleResult.ProfilePictureUrl,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };

                _context.Set<UserExternalLogin>().Add(externalLogin);
            }
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

    private async Task<string> GenerateUniqueUsernameAsync(string baseName, CancellationToken cancellationToken)
    {
        var cleanName = new string(baseName.Where(c => char.IsLetterOrDigit(c)).ToArray()).ToLower();

        if (string.IsNullOrWhiteSpace(cleanName))
        {
            cleanName = "user";
        }

        if (cleanName.Length > 15)
        {
            cleanName = cleanName[..15];
        }

        var username = cleanName;
        var counter = 1;

        while (await _context.Set<User>().AnyAsync(u => u.Username.ToLower() == username && !u.IsDeleted, cancellationToken))
        {
            username = $"{cleanName}{counter}";
            counter++;
        }

        return username;
    }
}
