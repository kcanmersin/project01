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
        var skip = (request.PageNumber - 1) * request.PageSize;
        var pageSize = request.PageSize;

        // Get total count for pagination
        var ratingsCountTask = _context.MovieRatings
            .AsNoTracking()
            .CountAsync(r => r.UserId == request.UserId && !r.IsDeleted, cancellationToken);

        var commentsCountTask = _context.Comments
            .AsNoTracking()
            .CountAsync(c => c.UserId == request.UserId && !c.IsDeleted && c.TargetType == Domain.Enums.CommentTargetType.Movie, cancellationToken);

        var ratingsCount = await ratingsCountTask;
        var commentsCount = await commentsCountTask;
        var totalCount = ratingsCount + commentsCount;

        // Use database-level UNION and pagination by combining both queries
        // Get ratings as user activity
        var ratingsQuery = _context.MovieRatings
            .AsNoTracking()
            .Where(r => r.UserId == request.UserId && !r.IsDeleted)
            .Select(r => new
            {
                Type = "rating",
                TargetId = r.MovieId,
                TargetTitle = r.Movie.Title,
                TargetPosterPath = r.Movie.PosterPath,
                Rating = (decimal?)r.Rating,
                Content = r.Review,
                CreatedAt = r.CreatedAt
            });

        // Get comments for movies
        var commentsQuery = _context.Comments
            .AsNoTracking()
            .Where(c => c.UserId == request.UserId && !c.IsDeleted && c.TargetType == Domain.Enums.CommentTargetType.Movie)
            .Join(
                _context.Movies,
                c => c.TargetId,
                m => m.Id,
                (c, m) => new
                {
                    Type = "comment",
                    TargetId = m.Id,
                    TargetTitle = m.Title,
                    TargetPosterPath = m.PosterPath,
                    Rating = (decimal?)null,
                    Content = c.Content.Length > 100 ? c.Content.Substring(0, 100) + "..." : c.Content,
                    CreatedAt = c.CreatedAt
                }
            );

        // Union both queries, order by date, and apply database-level pagination
        var pagedActivities = await ratingsQuery
            .Union(commentsQuery)
            .OrderByDescending(a => a.CreatedAt)
            .Skip(skip)
            .Take(pageSize)
            .Select(a => new UserActivityDto(
                a.Type,
                a.TargetId,
                a.TargetTitle,
                a.TargetPosterPath,
                a.Rating,
                a.Content,
                a.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return Result<PagedResult<UserActivityDto>>.Success(
            new PagedResult<UserActivityDto>(pagedActivities, totalCount, request.PageNumber, request.PageSize)
        );
    }
}
