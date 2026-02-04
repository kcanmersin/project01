using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Users.Queries.GetUserProfile;

public record GetUserProfileQuery(
    string Username,
    Guid? CurrentUserId
) : IRequest<Result<UserProfileDto>>;

public class GetUserProfileHandler : IRequestHandler<GetUserProfileQuery, Result<UserProfileDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUserProfileHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<UserProfileDto>> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .AsNoTracking()
            .Where(u => u.Username.ToLower() == request.Username.ToLower() && !u.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null)
            return Result<UserProfileDto>.NotFound("User not found");

        // Get follow stats
        var followersCount = await _context.UserFollows
            .AsNoTracking()
            .CountAsync(f => f.FollowingId == user.Id, cancellationToken);

        var followingCount = await _context.UserFollows
            .AsNoTracking()
            .CountAsync(f => f.FollowerId == user.Id, cancellationToken);

        var isFollowedByCurrentUser = false;
        var isOwnProfile = request.CurrentUserId.HasValue && request.CurrentUserId.Value == user.Id;

        if (request.CurrentUserId.HasValue && !isOwnProfile)
        {
            isFollowedByCurrentUser = await _context.UserFollows
                .AsNoTracking()
                .AnyAsync(f =>
                    f.FollowerId == request.CurrentUserId.Value &&
                    f.FollowingId == user.Id,
                    cancellationToken);
        }

        return Result<UserProfileDto>.Success(new UserProfileDto(
            user.Id,
            user.Username,
            user.ProfileImageId?.ToString(),
            user.CoverImageId?.ToString(),
            user.Bio,
            user.CreatedAt,
            isOwnProfile,
            followersCount,
            followingCount,
            isFollowedByCurrentUser
        ));
    }
}
