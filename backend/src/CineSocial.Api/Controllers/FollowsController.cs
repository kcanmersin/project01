using CineSocial.Application.Common;
using CineSocial.Application.Features.Follows;
using CineSocial.Application.Features.Follows.Commands.FollowUser;
using CineSocial.Application.Features.Follows.Commands.UnfollowUser;
using CineSocial.Application.Features.Follows.Queries.GetFollowers;
using CineSocial.Application.Features.Follows.Queries.GetFollowing;
using CineSocial.Application.Features.Follows.Queries.GetFollowStats;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSocial.Api.Controllers;

[Route("api/follows")]
public class FollowsController : BaseApiController
{
    /// <summary>
    /// Follow a user
    /// </summary>
    [Authorize]
    [HttpPost("{userId:guid}")]
    public async Task<ActionResult<bool>> FollowUser(Guid userId)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue)
            return Unauthorized();

        var command = new FollowUserCommand(currentUserId.Value, userId);
        var result = await Mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Unfollow a user
    /// </summary>
    [Authorize]
    [HttpDelete("{userId:guid}")]
    public async Task<ActionResult<bool>> UnfollowUser(Guid userId)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue)
            return Unauthorized();

        var command = new UnfollowUserCommand(currentUserId.Value, userId);
        var result = await Mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Get user's followers
    /// </summary>
    [HttpGet("{userId:guid}/followers")]
    public async Task<ActionResult<PagedResult<FollowUserDto>>> GetFollowers(
        Guid userId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetFollowersQuery(userId, page, pageSize);
        var result = await Mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get users that a user is following
    /// </summary>
    [HttpGet("{userId:guid}/following")]
    public async Task<ActionResult<PagedResult<FollowUserDto>>> GetFollowing(
        Guid userId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetFollowingQuery(userId, page, pageSize);
        var result = await Mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get follow stats for a user
    /// </summary>
    [HttpGet("{userId:guid}/stats")]
    public async Task<ActionResult<FollowStatsDto>> GetFollowStats(Guid userId)
    {
        var query = new GetFollowStatsQuery(userId, GetCurrentUserId());
        var result = await Mediator.Send(query);
        return HandleResult(result);
    }
}
