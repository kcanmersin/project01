using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.User;
using CineSocial.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CineSocial.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<AuthResponseDto>>
{
    private readonly DbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IEmailVerificationService _emailVerificationService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public RegisterCommandHandler(
        DbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService,
        IEmailVerificationService emailVerificationService,
        IEmailService emailService,
        IConfiguration configuration)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _emailVerificationService = emailVerificationService;
        _emailService = emailService;
        _configuration = configuration;
    }

    public async Task<Result<AuthResponseDto>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var emailExists = await _context.Set<User>()
            .AnyAsync(u => u.Email.ToLower() == request.Email.ToLower() && !u.IsDeleted, cancellationToken);

        if (emailExists)
        {
            return Result<AuthResponseDto>.BadRequest("Bu email adresi zaten kayıtlı.");
        }

        var usernameExists = await _context.Set<User>()
            .AnyAsync(u => u.Username.ToLower() == request.Username.ToLower() && !u.IsDeleted, cancellationToken);

        if (usernameExists)
        {
            return Result<AuthResponseDto>.BadRequest("Bu kullanıcı adı zaten alınmış.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email.ToLower().Trim(),
            Username = request.Username.Trim(),
            PasswordHash = _passwordHasher.Hash(request.Password),
            Role = UserRole.User,
            IsEmailVerified = false,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        _context.Set<User>().Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        var verificationToken = await _emailVerificationService.GenerateVerificationTokenAsync(
            user.Id,
            user.Email,
            cancellationToken);

        var frontendUrl = _configuration["FRONTEND_URL"] ?? "http://localhost:3000";
        var verificationLink = $"{frontendUrl}/verify-email?token={verificationToken}";

        await _emailService.SendEmailVerificationAsync(
            user.Email,
            user.Username,
            verificationLink,
            cancellationToken);

        var token = _jwtTokenService.GenerateToken(user);

        var userDto = new UserDto(
            user.Id,
            user.Email,
            user.Username,
            user.Role.ToString(),
            user.CreatedAt,
            user.ProfileImageId,
            user.CoverImageId,
            user.IsEmailVerified,
            false
        );

        return Result<AuthResponseDto>.Success(new AuthResponseDto(token, userDto));
    }
}
