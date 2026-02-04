using CineSocial.Application.Common;
using CineSocial.Application.Features.Lists;
using CineSocial.Application.Features.Users;
using CineSocial.Application.Features.Users.Commands.UpdateProfile;
using CineSocial.Application.Features.Users.Queries.GetUserActivity;
using CineSocial.Application.Features.Users.Queries.GetUserProfile;
using CineSocial.Application.Features.Users.Queries.GetUserPublicLists;
using CineSocial.Application.Features.Users.Queries.GetUserStats;
using ListType = CineSocial.Domain.Enums.ListType;
using Microsoft.AspNetCore.Authorization;
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

    /// <summary>
    /// Get user stats by user ID
    /// </summary>
    [HttpGet("{userId:guid}/stats")]
    public async Task<ActionResult<UserStatsDto>> GetUserStats(Guid userId)
    {
        var query = new GetUserStatsQuery(userId);
        var result = await Mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get user activity (recent ratings and comments)
    /// </summary>
    [HttpGet("{userId:guid}/activity")]
    public async Task<ActionResult<PagedResult<UserActivityDto>>> GetUserActivity(
        Guid userId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetUserActivityQuery(userId, page, pageSize);
        var result = await Mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get user's public lists (or all lists if viewing own profile)
    /// </summary>
    [HttpGet("{userId:guid}/lists")]
    public async Task<ActionResult<List<MovieListDto>>> GetUserLists(
        Guid userId,
        [FromQuery] string? listType = null)
    {
        ListType? type = null;
        if (!string.IsNullOrEmpty(listType) && Enum.TryParse<ListType>(listType, true, out var parsed))
        {
            type = parsed;
        }

        var query = new GetUserPublicListsQuery(userId, GetCurrentUserId(), type);
        var result = await Mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Update current user's profile
    /// </summary>
    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<bool>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized();

        var command = new UpdateProfileCommand(userId.Value, request.Bio);
        var result = await Mediator.Send(command);
        return HandleResult(result);
    }
}

public record UpdateProfileRequest(string? Bio);
