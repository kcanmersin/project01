using CineSocial.Application.Features.Users;
using CineSocial.Application.Features.Users.Queries.GetUserProfile;
using Microsoft.AspNetCore.Mvc;

namespace CineSocial.Api.Controllers;

[Route("api/users")]
public class UsersController : BaseApiController
{
    /// <summary>
    /// Get user profile by username
    /// </summary>
    [HttpGet("{username}")]
    public async Task<ActionResult<UserProfileDto>> GetUserProfile(string username)
    {
        var query = new GetUserProfileQuery(username, GetCurrentUserId());
        var result = await Mediator.Send(query);
        return HandleResult(result);
    }
}
