using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Users.Queries.GetUserStats;

public record GetUserStatsQuery(
    Guid UserId
) : IRequest<Result<UserStatsDto>>;

public record UserStatsDto(
    int TotalMoviesWatched,
    int TotalWatchTimeMinutes,
    decimal AverageRating,
    int TotalRatings,
    int TotalComments,
    int TotalLists,
    List<GenreStatDto> TopGenres,
    List<int> RatingDistribution, // Index 0 = rating 1, Index 9 = rating 10
    List<YearlyStatDto> YearlyStats
);

public record GenreStatDto(
    int GenreId,
    string GenreName,
    int Count,
    decimal Percentage
);

public record YearlyStatDto(
    int Year,
    int MoviesWatched,
    decimal AverageRating
);

public class GetUserStatsQueryHandler : IRequestHandler<GetUserStatsQuery, Result<UserStatsDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUserStatsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<UserStatsDto>> Handle(GetUserStatsQuery request, CancellationToken cancellationToken)
    {
        // Check user exists
        var userExists = await _context.Users
            .AsNoTracking()
            .AnyAsync(u => u.Id == request.UserId && !u.IsDeleted, cancellationToken);

        if (!userExists)
            return Result<UserStatsDto>.NotFound("User not found");

        // Get aggregated rating stats from database (avoid loading all ratings into memory)
        var ratingStats = await _context.MovieRatings
            .AsNoTracking()
            .Where(r => r.UserId == request.UserId && !r.IsDeleted)
            .GroupBy(r => 1) // Group all into one
            .Select(g => new
            {
                TotalMovies = g.Count(),
                TotalWatchTime = g.Sum(r => r.Movie.Runtime ?? 0),
                AverageRating = g.Average(r => r.Rating),
                TotalRatings = g.Count()
            })
            .FirstOrDefaultAsync(cancellationToken);

        var totalMoviesWatched = ratingStats?.TotalMovies ?? 0;
        var totalWatchTimeMinutes = ratingStats?.TotalWatchTime ?? 0;
        var averageRating = ratingStats?.AverageRating ?? 0;
        var totalRatings = ratingStats?.TotalRatings ?? 0;

        // Get rating distribution from database
        var ratingDistributionData = await _context.MovieRatings
            .AsNoTracking()
            .Where(r => r.UserId == request.UserId && !r.IsDeleted)
            .GroupBy(r => (int)Math.Floor(r.Rating))
            .Select(g => new { RatingFloor = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var ratingDistribution = new List<int>(new int[10]);
        foreach (var item in ratingDistributionData)
        {
            var index = Math.Max(0, Math.Min(9, item.RatingFloor - 1));
            ratingDistribution[index] = item.Count;
        }

        // Run remaining counts in parallel
        var totalCommentsTask = _context.Comments
            .AsNoTracking()
            .CountAsync(c => c.UserId == request.UserId && !c.IsDeleted, cancellationToken);

        var totalListsTask = _context.MovieLists
            .AsNoTracking()
            .CountAsync(l => l.UserId == request.UserId && !l.IsDeleted, cancellationToken);

        // Get top genres using database aggregation
        var topGenresTask = _context.MovieRatings
            .AsNoTracking()
            .Where(r => r.UserId == request.UserId && !r.IsDeleted)
            .Join(_context.MovieGenres, r => r.MovieId, mg => mg.MovieId, (r, mg) => mg)
            .GroupBy(mg => new { mg.GenreId, mg.Genre.Name })
            .Select(g => new GenreStatDto(
                g.Key.GenreId,
                g.Key.Name,
                g.Count(),
                0 // Percentage will be calculated after
            ))
            .OrderByDescending(g => g.Count)
            .Take(10)
            .ToListAsync(cancellationToken);

        // Get yearly stats from database
        var yearlyStatsTask = _context.MovieRatings
            .AsNoTracking()
            .Where(r => r.UserId == request.UserId && !r.IsDeleted)
            .GroupBy(r => r.CreatedAt.Year)
            .Select(g => new YearlyStatDto(
                g.Key,
                g.Count(),
                Math.Round(g.Average(r => r.Rating), 1)
            ))
            .OrderByDescending(y => y.Year)
            .Take(5)
            .ToListAsync(cancellationToken);

        // Await all parallel tasks
        await Task.WhenAll(totalCommentsTask, totalListsTask, topGenresTask, yearlyStatsTask);

        var totalComments = await totalCommentsTask;
        var totalLists = await totalListsTask;
        var topGenresRaw = await topGenresTask;
        var yearlyStats = await yearlyStatsTask;

        // Calculate percentages for genres
        var topGenres = topGenresRaw.Select(g => new GenreStatDto(
            g.GenreId,
            g.GenreName,
            g.Count,
            totalMoviesWatched > 0 ? Math.Round((decimal)g.Count / totalMoviesWatched * 100, 1) : 0
        )).ToList();

        return Result<UserStatsDto>.Success(new UserStatsDto(
            totalMoviesWatched,
            totalWatchTimeMinutes,
            Math.Round(averageRating, 1),
            totalRatings,
            totalComments,
            totalLists,
            topGenres,
            ratingDistribution,
            yearlyStats
        ));
    }
}
