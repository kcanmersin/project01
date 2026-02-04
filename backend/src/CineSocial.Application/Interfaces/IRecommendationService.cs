using CineSocial.Application.Features.Movies;

namespace CineSocial.Application.Interfaces;

public interface IRecommendationService
{
    Task<List<MovieDto>> GetMovieRecommendationsAsync(int tmdbId, int count = 10, CancellationToken cancellationToken = default);
}
