using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Lists.Queries.GetMyLists;

public record GetMyListsQuery(Guid UserId) : IRequest<Result<List<MovieListDto>>>;

public class GetMyListsQueryHandler : IRequestHandler<GetMyListsQuery, Result<List<MovieListDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetMyListsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<MovieListDto>>> Handle(GetMyListsQuery request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == request.UserId && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            return Result<List<MovieListDto>>.NotFound("User not found");
        }

        var lists = await _context.MovieLists
            .AsNoTracking()
            .Where(l => l.UserId == request.UserId)
            .OrderBy(l => l.ListType)
            .ThenByDescending(l => l.CreatedAt)
            .Select(l => new MovieListDto(
                l.Id,
                l.UserId,
                user.Username,
                l.Title,
                l.Description,
                l.CoverImageId,
                l.ListType.ToString(),
                l.IsPublic,
                l.MovieCount,
                l.Favorites.Count(f => !f.IsDeleted),
                false, // Own lists can't be favorited
                l.CreatedAt,
                l.UpdatedAt
            ))
            .ToListAsync(cancellationToken);

        return Result<List<MovieListDto>>.Success(lists);
    }
}
