using CineSocial.Application.Features.Search;
using Microsoft.AspNetCore.Mvc;

namespace CineSocial.Api.Controllers;

public class SearchController : BaseApiController
{
    /// <summary>
    /// Unified search across movies, people, and users
    /// </summary>
    /// <param name="q">Search query (minimum 2 characters)</param>
    /// <param name="type">Optional: filter by type (movies, people, users)</param>
    /// <param name="limit">Number of results per type (default 6, max 20)</param>
    /// <returns>Search results grouped by type</returns>
    [HttpGet]
    [ProducesResponseType(typeof(UnifiedSearchResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<UnifiedSearchResult>> Search(
        [FromQuery] string q,
        [FromQuery] SearchType? type = null,
        [FromQuery] int limit = 6)
    {
        var query = new UnifiedSearchQuery
        {
            Query = q,
            Type = type,
            Limit = limit
        };

        var result = await Mediator.Send(query);
        return HandleResult(result);
    }
}
