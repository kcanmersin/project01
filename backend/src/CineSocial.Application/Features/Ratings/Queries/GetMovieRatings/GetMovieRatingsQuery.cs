using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Ratings.Queries.GetMovieRatings;

public record GetMovieRatingsQuery(
    Guid MovieId,
    int Page = 1,
    int PageSize = 20
) : IRequest<Result<PagedResult<RatingDto>>>;

public class GetMovieRatingsQueryHandler : IRequestHandler<GetMovieRatingsQuery, Result<PagedResult<RatingDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetMovieRatingsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<RatingDto>>> Handle(GetMovieRatingsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.MovieRatings
            .AsNoTracking()
            .Where(r => r.MovieId == request.MovieId)
            .OrderByDescending(r => r.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        var ratings = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Join(
                _context.Users.AsNoTracking(),
                r => r.UserId,
                u => u.Id,
                (r, u) => new RatingDto(
                    r.Id,
                    r.UserId,
                    u.Username,
                    r.MovieId,
                    r.Rating,
                    r.Review,
                    r.CreatedAt,
                    r.UpdatedAt
                ))
            .ToListAsync(cancellationToken);

        return Result<PagedResult<RatingDto>>.Success(
            PagedResult<RatingDto>.Create(ratings, totalCount, request.Page, request.PageSize)
        );
    }
}
