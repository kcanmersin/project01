using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Users.Commands.UpdateProfile;

public record UpdateProfileCommand(
    Guid UserId,
    string? Bio
) : IRequest<Result<bool>>;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;

    public UpdateProfileCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId && !u.IsDeleted, cancellationToken);

        if (user == null)
            return Result<bool>.NotFound("User not found");

        user.Bio = request.Bio?.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
