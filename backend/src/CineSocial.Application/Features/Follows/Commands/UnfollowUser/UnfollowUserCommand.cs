using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Follows.Commands.UnfollowUser;

public record UnfollowUserCommand(
    Guid FollowerId,
    Guid FollowingId
) : IRequest<Result<bool>>;

public class UnfollowUserCommandHandler : IRequestHandler<UnfollowUserCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;

    public UnfollowUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(UnfollowUserCommand request, CancellationToken cancellationToken)
    {
        var follow = await _context.UserFollows
            .FirstOrDefaultAsync(f =>
                f.FollowerId == request.FollowerId &&
                f.FollowingId == request.FollowingId,
                cancellationToken);

        if (follow == null)
            return Result<bool>.Success(true); // Already not following

        // Soft delete
        follow.IsDeleted = true;
        follow.DeletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
