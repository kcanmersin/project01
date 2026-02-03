using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Ratings.Queries.GetMovieRatingStats;

public record GetMovieRatingStatsQuery(Guid MovieId) : IRequest<Result<MovieRatingStatsDto>>;

public class GetMovieRatingStatsQueryHandler : IRequestHandler<GetMovieRatingStatsQuery, Result<MovieRatingStatsDto>>
{
    private readonly IApplicationDbContext _context;

    public GetMovieRatingStatsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<MovieRatingStatsDto>> Handle(GetMovieRatingStatsQuery request, CancellationToken cancellationToken)
    {
        var ratings = await _context.MovieRatings
            .AsNoTracking()
            .Where(r => r.MovieId == request.MovieId)
            .Select(r => r.Rating)
            .ToListAsync(cancellationToken);

        if (!ratings.Any())
        {
            return Result<MovieRatingStatsDto>.Success(new MovieRatingStatsDto(
                request.MovieId,
                0,
                0,
                new int[11]
            ));
        }

        var averageRating = ratings.Average();
        var totalRatings = ratings.Count;

        // Distribution: count ratings for each integer value 0-10
        var distribution = new int[11];
        foreach (var rating in ratings)
        {
            var index = (int)Math.Round(rating);
            if (index >= 0 && index <= 10)
            {
                distribution[index]++;
            }
        }

        return Result<MovieRatingStatsDto>.Success(new MovieRatingStatsDto(
            request.MovieId,
            Math.Round(averageRating, 1),
            totalRatings,
            distribution
        ));
    }
}
