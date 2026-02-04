using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Follows.Queries.GetFollowing;

public record GetFollowingQuery(
    Guid UserId,
    int PageNumber = 1,
    int PageSize = 20
) : IRequest<Result<PagedResult<FollowUserDto>>>;

public class GetFollowingQueryHandler : IRequestHandler<GetFollowingQuery, Result<PagedResult<FollowUserDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetFollowingQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<FollowUserDto>>> Handle(GetFollowingQuery request, CancellationToken cancellationToken)
    {
        var query = _context.UserFollows
            .AsNoTracking()
            .Where(f => f.FollowerId == request.UserId)
            .OrderByDescending(f => f.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        var following = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(f => new FollowUserDto(
                f.Following.Id,
                f.Following.Username,
                f.Following.ProfileImageId.HasValue ? f.Following.ProfileImageId.ToString() : null,
                f.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return Result<PagedResult<FollowUserDto>>.Success(
            new PagedResult<FollowUserDto>(following, totalCount, request.PageNumber, request.PageSize)
        );
    }
}
