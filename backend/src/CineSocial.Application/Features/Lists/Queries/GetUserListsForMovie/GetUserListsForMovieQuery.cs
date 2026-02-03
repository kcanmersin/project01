using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Lists.Queries.GetUserListsForMovie;

/// <summary>
/// Gets user's lists with info about whether each list contains a specific movie.
/// Used for "Add to List" modal.
/// </summary>
public record GetUserListsForMovieQuery(
    Guid UserId,
    Guid MovieId
) : IRequest<Result<List<SimpleListDto>>>;

public class GetUserListsForMovieQueryHandler : IRequestHandler<GetUserListsForMovieQuery, Result<List<SimpleListDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetUserListsForMovieQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<SimpleListDto>>> Handle(GetUserListsForMovieQuery request, CancellationToken cancellationToken)
    {
        var listsWithMovieStatus = await _context.MovieLists
            .AsNoTracking()
            .Where(l => l.UserId == request.UserId)
            .OrderBy(l => l.ListType)
            .ThenByDescending(l => l.CreatedAt)
            .Select(l => new SimpleListDto(
                l.Id,
                l.Title,
                l.ListType.ToString(),
                l.MovieCount,
                l.Items.Any(i => i.MovieId == request.MovieId && !i.IsDeleted)
            ))
            .ToListAsync(cancellationToken);

        return Result<List<SimpleListDto>>.Success(listsWithMovieStatus);
    }
}
