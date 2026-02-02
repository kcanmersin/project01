using CineSocial.Application.Common;
using CineSocial.Application.Features.People;
using CineSocial.Application.Features.People.Queries.GetPersonDetail;
using Microsoft.AspNetCore.Mvc;

namespace CineSocial.Api.Controllers;

public class PeopleController : BaseApiController
{
    /// <summary>
    /// Get person details with filmography
    /// </summary>
    /// <param name="id">Person ID</param>
    /// <returns>Person details with movies they appeared in</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(PersonDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PersonDetailDto>> GetPerson(Guid id)
    {
        var result = await Mediator.Send(new GetPersonDetailQuery(id));
        return HandleResult(result);
    }
}
