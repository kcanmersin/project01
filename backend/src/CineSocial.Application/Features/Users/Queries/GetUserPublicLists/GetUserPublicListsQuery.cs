using CineSocial.Application.Common;
using CineSocial.Application.Features.Lists;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Users.Queries.GetUserPublicLists;

public record GetUserPublicListsQuery(
    Guid UserId,
    Guid? CurrentUserId,
    ListType? ListType = null
) : IRequest<Result<List<MovieListDto>>>;

public class GetUserPublicListsQueryHandler : IRequestHandler<GetUserPublicListsQuery, Result<List<MovieListDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetUserPublicListsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<MovieListDto>>> Handle(GetUserPublicListsQuery request, CancellationToken cancellationToken)
    {
        var isOwner = request.CurrentUserId.HasValue && request.CurrentUserId.Value == request.UserId;

        var query = _context.MovieLists
            .AsNoTracking()
            .Where(l => l.UserId == request.UserId && !l.IsDeleted);

        // If not owner, only show public lists
        if (!isOwner)
        {
            query = query.Where(l => l.IsPublic);
        }

        // Filter by list type if specified
        if (request.ListType.HasValue)
        {
            query = query.Where(l => l.ListType == request.ListType.Value);
        }

        var lists = await query
            .OrderByDescending(l => l.UpdatedAt ?? l.CreatedAt)
            .Select(l => new MovieListDto(
                l.Id,
                l.UserId,
                l.User.Username,
                l.Title,
                l.Description,
                l.CoverImageId,
                l.ListType.ToString(),
                l.IsPublic,
                l.MovieCount,
                l.Favorites.Count(f => !f.IsDeleted),
                request.CurrentUserId.HasValue && l.Favorites.Any(f => f.UserId == request.CurrentUserId.Value && !f.IsDeleted),
                l.CreatedAt,
                l.UpdatedAt
            ))
            .ToListAsync(cancellationToken);

        return Result<List<MovieListDto>>.Success(lists);
    }
}
