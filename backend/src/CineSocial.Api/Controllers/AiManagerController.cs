using CineSocial.Application.Features.Movies;
using CineSocial.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CineSocial.Api.Controllers;

public class AiManagerController : BaseApiController
{
    private readonly IRecommendationService _recommendationService;

    public AiManagerController(IRecommendationService recommendationService)
    {
        _recommendationService = recommendationService;
    }

    /// <summary>
    /// Get AI-based movie recommendations by TMDB id
    /// </summary>
    /// <param name="tmdbId">TMDB movie id</param>
    /// <param name="count">Number of recommendations</param>
    [HttpGet("movies/{tmdbId:int}/recommendations")]
    [ProducesResponseType(typeof(List<MovieDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<MovieDto>>> GetMovieRecommendations(int tmdbId, [FromQuery] int count = 10, CancellationToken cancellationToken = default)
    {
        var result = await _recommendationService.GetMovieRecommendationsAsync(tmdbId, count, cancellationToken);
        return Ok(result);
    }
}
