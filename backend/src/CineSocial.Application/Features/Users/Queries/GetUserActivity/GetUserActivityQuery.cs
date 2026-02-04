using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Users.Queries.GetUserActivity;

public record GetUserActivityQuery(
    Guid UserId,
    int PageNumber = 1,
    int PageSize = 20
) : IRequest<Result<PagedResult<UserActivityDto>>>;

public class GetUserActivityQueryHandler : IRequestHandler<GetUserActivityQuery, Result<PagedResult<UserActivityDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetUserActivityQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<UserActivityDto>>> Handle(GetUserActivityQuery request, CancellationToken cancellationToken)
    {
        // Get ratings
        var ratings = await _context.MovieRatings
            .AsNoTracking()
            .Where(r => r.UserId == request.UserId && !r.IsDeleted)
            .OrderByDescending(r => r.CreatedAt)
            .Take(50)
            .Select(r => new UserActivityDto(
                "rating",
                r.MovieId,
                r.Movie.Title,
                r.Movie.PosterPath,
                r.Rating,
                r.Review,
                r.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        // Get comments
        var comments = await _context.Comments
            .AsNoTracking()
            .Where(c => c.UserId == request.UserId && !c.IsDeleted && c.TargetType == Domain.Enums.CommentTargetType.Movie)
            .OrderByDescending(c => c.CreatedAt)
            .Take(50)
            .Join(
                _context.Movies,
                c => c.TargetId,
                m => m.Id,
                (c, m) => new UserActivityDto(
                    "comment",
                    m.Id,
                    m.Title,
                    m.PosterPath,
                    null,
                    c.Content.Length > 100 ? c.Content.Substring(0, 100) + "..." : c.Content,
                    c.CreatedAt
                )
            )
            .ToListAsync(cancellationToken);

        // Combine and sort
        var allActivities = ratings
            .Concat(comments)
            .OrderByDescending(a => a.CreatedAt)
            .ToList();

        var totalCount = allActivities.Count;
        var pagedActivities = allActivities
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        return Result<PagedResult<UserActivityDto>>.Success(
            new PagedResult<UserActivityDto>(pagedActivities, totalCount, request.PageNumber, request.PageSize)
        );
    }
}
