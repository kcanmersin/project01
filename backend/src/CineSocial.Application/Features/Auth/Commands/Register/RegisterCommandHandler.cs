using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.Social;
using CineSocial.Domain.Entities.User;
using CineSocial.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<AuthResponseDto>>
{
    private readonly DbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;

    public RegisterCommandHandler(
        DbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<Result<AuthResponseDto>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        // Check if email already exists
        var emailExists = await _context.Set<User>()
            .AnyAsync(u => u.Email.ToLower() == request.Email.ToLower() && !u.IsDeleted, cancellationToken);

        if (emailExists)
        {
            return Result<AuthResponseDto>.BadRequest("Email is already registered.");
        }

        // Check if username already exists
        var usernameExists = await _context.Set<User>()
            .AnyAsync(u => u.Username.ToLower() == request.Username.ToLower() && !u.IsDeleted, cancellationToken);

        if (usernameExists)
        {
            return Result<AuthResponseDto>.BadRequest("Username is already taken.");
        }

        // Create user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email.ToLower().Trim(),
            Username = request.Username.Trim(),
            PasswordHash = _passwordHasher.Hash(request.Password),
            Role = UserRole.User,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        _context.Set<User>().Add(user);

        // Create default movie lists (Watchlist and Favorites)
        var watchlist = new MovieList
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Title = "Watchlist",
            Description = "Movies I want to watch",
            ListType = MovieListType.Watchlist,
            IsPublic = false,
            MovieCount = 0,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        var favorites = new MovieList
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Title = "Favorites",
            Description = "My favorite movies",
            ListType = MovieListType.Favorites,
            IsPublic = false,
            MovieCount = 0,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        _context.Set<MovieList>().Add(watchlist);
        _context.Set<MovieList>().Add(favorites);

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
