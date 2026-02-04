using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.Social;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Follows.Commands.FollowUser;

public record FollowUserCommand(
    Guid FollowerId,
    Guid FollowingId
) : IRequest<Result<bool>>;

public class FollowUserCommandHandler : IRequestHandler<FollowUserCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;

    public FollowUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(FollowUserCommand request, CancellationToken cancellationToken)
    {
        // Can't follow yourself
        if (request.FollowerId == request.FollowingId)
            return Result<bool>.Failure("You cannot follow yourself");

        // Check if user to follow exists
        var userToFollow = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == request.FollowingId && !u.IsDeleted, cancellationToken);

        if (userToFollow == null)
            return Result<bool>.NotFound("User not found");

        // Check if already following
        var existingFollow = await _context.UserFollows
            .FirstOrDefaultAsync(f =>
                f.FollowerId == request.FollowerId &&
                f.FollowingId == request.FollowingId,
                cancellationToken);

        if (existingFollow != null)
            return Result<bool>.Success(true); // Already following

        var follow = new UserFollow
        {
            Id = Guid.NewGuid(),
            FollowerId = request.FollowerId,
            FollowingId = request.FollowingId,
            CreatedAt = DateTime.UtcNow
        };

        _context.UserFollows.Add(follow);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
