using CineSocial.Application.Common;
using CineSocial.Application.Features.Movies;
using CineSocial.Application.Features.Movies.Queries.GetMovieById;
using CineSocial.Application.Features.Movies.Queries.GetMovieDetail;
using CineSocial.Application.Features.Movies.Queries.GetMovieImages;
using CineSocial.Application.Features.Movies.Queries.GetMovies;
using Microsoft.AspNetCore.Mvc;

namespace CineSocial.Api.Controllers;

public class MoviesController : BaseApiController
{
    /// <summary>
    /// Get paginated list of movies with optional search and filters
    /// </summary>
    /// <param name="query">Query parameters for pagination, search, and sorting</param>
    /// <returns>Paginated list of movies</returns>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<MovieDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<MovieDto>>> GetMovies([FromQuery] GetMoviesQuery query)
    {
        var result = await Mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get a movie by its ID (basic info)
    /// </summary>
    /// <param name="id">Movie ID</param>
    /// <returns>Movie basic details</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(MovieDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MovieDto>> GetMovie(Guid id)
    {
        var result = await Mediator.Send(new GetMovieByIdQuery(id));
        return HandleResult(result);
    }

    /// <summary>
    /// Get movie details with cast, crew, and genres
    /// </summary>
    /// <param name="id">Movie ID</param>
    /// <returns>Full movie details with related data</returns>
    [HttpGet("{id:guid}/detail")]
    [ProducesResponseType(typeof(MovieDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MovieDetailDto>> GetMovieDetail(Guid id)
    {
        var result = await Mediator.Send(new GetMovieDetailQuery(id));
        return HandleResult(result);
    }

    /// <summary>
    /// Get movie images grouped by type (posters, backdrops, logos)
    /// </summary>
    /// <param name="id">Movie ID</param>
    /// <returns>Movie images grouped by type</returns>
    [HttpGet("{id:guid}/images")]
    [ProducesResponseType(typeof(MovieImagesDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MovieImagesDto>> GetMovieImages(Guid id)
    {
        var result = await Mediator.Send(new GetMovieImagesQuery(id));
        return HandleResult(result);
    }
}
