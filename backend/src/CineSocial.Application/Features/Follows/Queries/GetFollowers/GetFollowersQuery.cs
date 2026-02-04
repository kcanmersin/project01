using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Follows.Queries.GetFollowers;

public record GetFollowersQuery(
    Guid UserId,
    int PageNumber = 1,
    int PageSize = 20
) : IRequest<Result<PagedResult<FollowUserDto>>>;

public class GetFollowersQueryHandler : IRequestHandler<GetFollowersQuery, Result<PagedResult<FollowUserDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetFollowersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<FollowUserDto>>> Handle(GetFollowersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.UserFollows
            .AsNoTracking()
            .Where(f => f.FollowingId == request.UserId)
            .OrderByDescending(f => f.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        var followers = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(f => new FollowUserDto(
                f.Follower.Id,
                f.Follower.Username,
                f.Follower.ProfileImageId.HasValue ? f.Follower.ProfileImageId.ToString() : null,
                f.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return Result<PagedResult<FollowUserDto>>.Success(
            new PagedResult<FollowUserDto>(followers, totalCount, request.PageNumber, request.PageSize)
        );
    }
}
