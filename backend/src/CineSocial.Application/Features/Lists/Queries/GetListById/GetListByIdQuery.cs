using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Lists.Queries.GetListById;

public record GetListByIdQuery(
    Guid ListId,
    Guid? CurrentUserId
) : IRequest<Result<MovieListDetailDto>>;

public class GetListByIdQueryHandler : IRequestHandler<GetListByIdQuery, Result<MovieListDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public GetListByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<MovieListDetailDto>> Handle(GetListByIdQuery request, CancellationToken cancellationToken)
    {
        var list = await _context.MovieLists
            .AsNoTracking()
            .Include(l => l.User)
            .FirstOrDefaultAsync(l => l.Id == request.ListId, cancellationToken);

        if (list == null)
        {
            return Result<MovieListDetailDto>.NotFound("List not found");
        }

        var isOwner = request.CurrentUserId.HasValue && list.UserId == request.CurrentUserId.Value;

        // Check access
        if (!list.IsPublic && !isOwner)
        {
            return Result<MovieListDetailDto>.Forbidden("This list is private");
        }

        var items = await _context.MovieListItems
            .AsNoTracking()
            .Where(i => i.MovieListId == request.ListId)
            .OrderBy(i => i.Order)
            .Join(
                _context.Movies.AsNoTracking(),
                i => i.MovieId,
                m => m.Id,
                (i, m) => new MovieListItemDto(
                    i.Id,
                    i.MovieId,
                    m.Title,
                    m.PosterPath,
                    m.VoteAverage,
                    m.ReleaseDate.HasValue ? m.ReleaseDate.Value.ToString("yyyy-MM-dd") : null,
                    i.Order,
                    i.Note,
                    i.CreatedAt
                ))
            .ToListAsync(cancellationToken);

        var favoriteCount = await _context.ListFavorites
            .CountAsync(f => f.MovieListId == request.ListId, cancellationToken);

        var isFavorited = request.CurrentUserId.HasValue && await _context.ListFavorites
            .AnyAsync(f => f.MovieListId == request.ListId && f.UserId == request.CurrentUserId.Value, cancellationToken);

        return Result<MovieListDetailDto>.Success(new MovieListDetailDto(
            list.Id,
            list.UserId,
            list.User.Username,
            list.Title,
            list.Description,
            list.CoverImageId,
            list.ListType.ToString(),
            list.IsPublic,
            list.MovieCount,
            favoriteCount,
            isFavorited,
            isOwner,
            list.CreatedAt,
            list.UpdatedAt,
            items
        ));
    }
}
