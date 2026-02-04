using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Follows.Queries.GetFollowStats;

public record GetFollowStatsQuery(
    Guid UserId,
    Guid? CurrentUserId
) : IRequest<Result<FollowStatsDto>>;

public class GetFollowStatsQueryHandler : IRequestHandler<GetFollowStatsQuery, Result<FollowStatsDto>>
{
    private readonly IApplicationDbContext _context;

    public GetFollowStatsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<FollowStatsDto>> Handle(GetFollowStatsQuery request, CancellationToken cancellationToken)
    {
        var followersCount = await _context.UserFollows
            .AsNoTracking()
            .CountAsync(f => f.FollowingId == request.UserId, cancellationToken);

        var followingCount = await _context.UserFollows
            .AsNoTracking()
            .CountAsync(f => f.FollowerId == request.UserId, cancellationToken);

        var isFollowedByCurrentUser = false;
        if (request.CurrentUserId.HasValue && request.CurrentUserId.Value != request.UserId)
        {
            isFollowedByCurrentUser = await _context.UserFollows
                .AsNoTracking()
                .AnyAsync(f =>
                    f.FollowerId == request.CurrentUserId.Value &&
                    f.FollowingId == request.UserId,
                    cancellationToken);
        }

        return Result<FollowStatsDto>.Success(new FollowStatsDto(
            followersCount,
            followingCount,
            isFollowedByCurrentUser
        ));
    }
}
