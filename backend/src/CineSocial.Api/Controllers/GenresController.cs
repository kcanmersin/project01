using CineSocial.Application.Features.Genres;
using CineSocial.Application.Features.Genres.Queries.GetGenres;
using Microsoft.AspNetCore.Mvc;

namespace CineSocial.Api.Controllers;

public class GenresController : BaseApiController
{
    /// <summary>
    /// Get all movie genres
    /// </summary>
    /// <returns>List of genres</returns>
    [HttpGet]
    [ProducesResponseType(typeof(List<GenreDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<GenreDto>>> GetGenres()
    {
        var result = await Mediator.Send(new GetGenresQuery());
        return HandleResult(result);
    }
}
