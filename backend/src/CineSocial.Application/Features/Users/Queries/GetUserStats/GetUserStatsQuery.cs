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

        // Get all user ratings with movie data
        var userRatings = await _context.MovieRatings
            .AsNoTracking()
            .Where(r => r.UserId == request.UserId && !r.IsDeleted)
            .Include(r => r.Movie)
            .ToListAsync(cancellationToken);

        var totalMoviesWatched = userRatings.Count;
        var totalWatchTimeMinutes = userRatings.Sum(r => r.Movie.Runtime ?? 0);
        var averageRating = userRatings.Any() ? userRatings.Average(r => r.Rating) : 0;
        var totalRatings = userRatings.Count;

        // Total comments
        var totalComments = await _context.Comments
            .AsNoTracking()
            .CountAsync(c => c.UserId == request.UserId && !c.IsDeleted, cancellationToken);

        // Total lists
        var totalLists = await _context.MovieLists
            .AsNoTracking()
            .CountAsync(l => l.UserId == request.UserId && !l.IsDeleted, cancellationToken);

        // Rating distribution (1-10)
        var ratingDistribution = new List<int>(new int[10]);
        foreach (var rating in userRatings)
        {
            var index = Math.Max(0, Math.Min(9, (int)Math.Floor(rating.Rating) - 1));
            ratingDistribution[index]++;
        }

        // Top genres - get movie genres for rated movies
        var ratedMovieIds = userRatings.Select(r => r.MovieId).ToList();
        var movieGenres = await _context.MovieGenres
            .AsNoTracking()
            .Where(mg => ratedMovieIds.Contains(mg.MovieId))
            .Include(mg => mg.Genre)
            .ToListAsync(cancellationToken);

        var topGenres = movieGenres
            .GroupBy(mg => new { mg.GenreId, mg.Genre.Name })
            .Select(g => new GenreStatDto(
                g.Key.GenreId,
                g.Key.Name,
                g.Count(),
                totalMoviesWatched > 0 ? Math.Round((decimal)g.Count() / totalMoviesWatched * 100, 1) : 0
            ))
            .OrderByDescending(g => g.Count)
            .Take(10)
            .ToList();

        // Yearly stats
        var yearlyStats = userRatings
            .GroupBy(r => r.CreatedAt.Year)
            .Select(g => new YearlyStatDto(
                g.Key,
                g.Count(),
                Math.Round(g.Average(r => r.Rating), 1)
            ))
            .OrderByDescending(y => y.Year)
            .Take(5)
            .ToList();

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
