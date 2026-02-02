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
            return Result<AuthResponseDto>.BadRequest("Email or username is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return Result<AuthResponseDto>.BadRequest("Password is required.");
        }

        // Find user by email or username
        var searchTerm = request.EmailOrUsername.ToLower().Trim();
        var user = await _context.Set<User>()
            .FirstOrDefaultAsync(u => 
                (u.Email.ToLower() == searchTerm || u.Username.ToLower() == searchTerm) 
                && !u.IsDeleted, 
                cancellationToken);

        if (user is null)
        {
            return Result<AuthResponseDto>.BadRequest("Invalid email/username or password.");
        }

        // Verify password
        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return Result<AuthResponseDto>.BadRequest("Invalid email/username or password.");
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        // Generate token
        var token = _jwtTokenService.GenerateToken(user);

        var userDto = new UserDto(
            user.Id,
            user.Email,
            user.Username,
            user.Role.ToString(),
            user.CreatedAt,
            user.ProfileImageId,
            user.CoverImageId
        );

        return Result<AuthResponseDto>.Success(new AuthResponseDto(token, userDto));
    }
}
