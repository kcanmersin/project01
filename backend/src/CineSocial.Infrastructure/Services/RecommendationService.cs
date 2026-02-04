using System.Net.Http.Json;
using System.Text.Json.Serialization;
using CineSocial.Application.Features.AI;
using CineSocial.Application.Features.Movies;
using CineSocial.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CineSocial.Infrastructure.Services;

public class RecommendationService : IRecommendationService
{
    private readonly HttpClient _httpClient;
    private readonly IApplicationDbContext _dbContext;
    private readonly ILogger<RecommendationService> _logger;

    public RecommendationService(HttpClient httpClient, IApplicationDbContext dbContext, ILogger<RecommendationService> logger)
    {
        _httpClient = httpClient;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<List<MovieDto>> GetMovieRecommendationsAsync(int tmdbId, int count = 10, CancellationToken cancellationToken = default)
    {
        try
        {
            var request = new RecommendationRequestDto
            {
                TmdbId = tmdbId,
                Count = count,
                PlotWeight = 0.7,
                StyleWeight = 0.3
            };

            var response = await _httpClient.PostAsJsonAsync("recommend/movie-to-movie", request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("AI service returned status {StatusCode} for tmdbId {TmdbId}", response.StatusCode, tmdbId);
                return new List<MovieDto>();
            }

            var recResponse = await response.Content.ReadFromJsonAsync<RecommendationResponseDto>(cancellationToken: cancellationToken);
            if (recResponse?.Recommendations is null || recResponse.Recommendations.Count == 0)
            {
                return new List<MovieDto>();
            }

            var recommendedIds = recResponse.Recommendations.Select(r => r.TmdbId).ToList();

            var movies = await _dbContext.Movies
                .AsNoTracking()
                .Where(m => !m.IsDeleted && recommendedIds.Contains(m.TmdbId))
                .Select(m => new MovieDto(
                    m.Id,
                    m.TmdbId,
                    m.Title,
                    m.OriginalTitle,
                    m.Overview,
                    m.ReleaseDate,
                    m.Runtime,
                    m.PosterPath,
                    m.BackdropPath,
                    m.VoteAverage,
                    m.VoteCount,
                    m.Popularity,
                    m.Status,
                    m.Tagline
                ))
                .ToListAsync(cancellationToken);

            var movieMap = new Dictionary<int, MovieDto>();
            foreach (var movie in movies)
            {
                movieMap.TryAdd(movie.TmdbId, movie);
            }

            var ordered = new List<MovieDto>(recommendedIds.Count);
            foreach (var id in recommendedIds)
            {
                if (movieMap.TryGetValue(id, out var movie))
                {
                    ordered.Add(movie);
                }
            }

            return ordered;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch AI recommendations for tmdbId {TmdbId}", tmdbId);
            return new List<MovieDto>();
        }
    }

    private sealed class RecommendationRequestDto
    {
        [JsonPropertyName("tmdb_id")]
        public int TmdbId { get; init; }

        [JsonPropertyName("count")]
        public int Count { get; init; }

        [JsonPropertyName("plot_weight")]
        public double PlotWeight { get; init; }

        [JsonPropertyName("style_weight")]
        public double StyleWeight { get; init; }
    }
}
