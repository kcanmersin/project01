using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CineSocial.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    private ISender? _mediator;
    protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

    protected Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("userId")?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    protected Guid GetCurrentUserIdRequired()
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated");
        }
        return userId.Value;
    }

    protected ActionResult HandleResult<T>(CineSocial.Application.Common.Result<T> result)
    {
        if (result.IsSuccess)
        {
            return result.StatusCode switch
            {
                201 => CreatedAtAction(null, result.Data),
                204 => NoContent(),
                _ => Ok(result.Data)
            };
        }

        return result.StatusCode switch
        {
            400 => BadRequest(new ProblemDetails
            {
                Status = 400,
                Title = "Bad Request",
                Detail = result.Error
            }),
            404 => NotFound(new ProblemDetails
            {
                Status = 404,
                Title = "Not Found",
                Detail = result.Error
            }),
            _ => StatusCode(result.StatusCode, new ProblemDetails
            {
                Status = result.StatusCode,
                Title = "Error",
                Detail = result.Error
            })
        };
    }

    protected ActionResult HandleResult(CineSocial.Application.Common.Result result)
    {
        if (result.IsSuccess)
        {
            return result.StatusCode switch
            {
                204 => NoContent(),
                _ => Ok()
            };
        }

        return result.StatusCode switch
        {
            400 => BadRequest(new ProblemDetails
            {
                Status = 400,
                Title = "Bad Request",
                Detail = result.Error
            }),
            404 => NotFound(new ProblemDetails
            {
                Status = 404,
                Title = "Not Found",
                Detail = result.Error
            }),
            _ => StatusCode(result.StatusCode, new ProblemDetails
            {
                Status = result.StatusCode,
                Title = "Error",
                Detail = result.Error
            })
        };
    }
}
