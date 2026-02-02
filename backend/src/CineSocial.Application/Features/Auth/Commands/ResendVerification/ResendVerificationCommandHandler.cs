using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.User;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CineSocial.Application.Features.Auth.Commands.ResendVerification;

public class ResendVerificationCommandHandler : IRequestHandler<ResendVerificationCommand, Result>
{
    private readonly DbContext _context;
    private readonly IEmailVerificationService _emailVerificationService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public ResendVerificationCommandHandler(
        DbContext context,
        IEmailVerificationService emailVerificationService,
        IEmailService emailService,
        IConfiguration configuration)
    {
        _context = context;
        _emailVerificationService = emailVerificationService;
        _emailService = emailService;
        _configuration = configuration;
    }

    public async Task<Result> Handle(ResendVerificationCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return Result.BadRequest("Email adresi gereklidir.");
        }

        var user = await _context.Set<User>()
            .FirstOrDefaultAsync(u =>
                u.Email.ToLower() == request.Email.ToLower().Trim() &&
                !u.IsDeleted,
                cancellationToken);

        if (user == null)
        {
            return Result.Success();
        }

        if (user.IsEmailVerified)
        {
            return Result.Success();
        }

        await _emailVerificationService.InvalidateTokensForUserAsync(user.Id, cancellationToken);

        var token = await _emailVerificationService.GenerateVerificationTokenAsync(user.Id, user.Email, cancellationToken);

        var frontendUrl = _configuration["FRONTEND_URL"] ?? "http://localhost:3000";
        var verificationLink = $"{frontendUrl}/verify-email?token={token}";

        await _emailService.SendEmailVerificationAsync(user.Email, user.Username, verificationLink, cancellationToken);

        return Result.Success();
    }
}
