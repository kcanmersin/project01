using CineSocial.Application.Common;
using CineSocial.Application.Features.Lists;
using CineSocial.Application.Features.Lists.Commands.AddMovieToList;
using CineSocial.Application.Features.Lists.Commands.CreateList;
using CineSocial.Application.Features.Lists.Commands.DeleteList;
using CineSocial.Application.Features.Lists.Commands.EnsureSystemLists;
using CineSocial.Application.Features.Lists.Commands.RemoveMovieFromList;
using CineSocial.Application.Features.Lists.Commands.ToggleListFavorite;
using CineSocial.Application.Features.Lists.Commands.UpdateList;
using CineSocial.Application.Features.Lists.Queries.GetListById;
using CineSocial.Application.Features.Lists.Queries.GetMyLists;
using CineSocial.Application.Features.Lists.Queries.GetUserListsForMovie;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSocial.Api.Controllers;

public class ListsController : BaseApiController
{
    /// <summary>
    /// Get current user's lists
    /// </summary>
    [HttpGet("my-lists")]
    [Authorize]
    public async Task<ActionResult<List<MovieListDto>>> GetMyLists()
    {
        var userId = GetCurrentUserIdRequired();

        // Ensure system lists exist
        await Mediator.Send(new EnsureSystemListsCommand(userId));

        var result = await Mediator.Send(new GetMyListsQuery(userId));
        return HandleResult(result);
    }

    /// <summary>
    /// Get user's lists with movie status (for "Add to List" modal)
    /// </summary>
    [HttpGet("my-lists/for-movie/{movieId:guid}")]
    [Authorize]
    public async Task<ActionResult<List<SimpleListDto>>> GetMyListsForMovie(Guid movieId)
    {
        var userId = GetCurrentUserIdRequired();

        // Ensure system lists exist
        await Mediator.Send(new EnsureSystemListsCommand(userId));

        var result = await Mediator.Send(new GetUserListsForMovieQuery(userId, movieId));
        return HandleResult(result);
    }

    /// <summary>
    /// Get a list by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MovieListDetailDto>> GetListById(Guid id)
    {
        var userId = GetCurrentUserId();
        var result = await Mediator.Send(new GetListByIdQuery(id, userId));
        return HandleResult(result);
    }

    /// <summary>
    /// Create a new custom list
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<MovieListDto>> CreateList([FromBody] CreateListRequest request)
    {
        var userId = GetCurrentUserIdRequired();
        var result = await Mediator.Send(new CreateListCommand(
            userId,
            request.Title,
            request.Description,
            request.IsPublic
        ));
        return HandleResult(result);
    }

    /// <summary>
    /// Update a list
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<MovieListDto>> UpdateList(Guid id, [FromBody] UpdateListRequest request)
    {
        var userId = GetCurrentUserIdRequired();
        var result = await Mediator.Send(new UpdateListCommand(
            userId,
            id,
            request.Title,
            request.Description,
            request.IsPublic
        ));
        return HandleResult(result);
    }

    /// <summary>
    /// Delete a custom list
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<ActionResult> DeleteList(Guid id)
    {
        var userId = GetCurrentUserIdRequired();
        var result = await Mediator.Send(new DeleteListCommand(userId, id));
        return HandleResult(result);
    }

    /// <summary>
    /// Add a movie to a list
    /// </summary>
    [HttpPost("{listId:guid}/movies")]
    [Authorize]
    public async Task<ActionResult> AddMovieToList(Guid listId, [FromBody] AddMovieRequest request)
    {
        var userId = GetCurrentUserIdRequired();
        var result = await Mediator.Send(new AddMovieToListCommand(
            userId,
            listId,
            request.MovieId,
            request.Note
        ));
        return HandleResult(result);
    }

    /// <summary>
    /// Remove a movie from a list
    /// </summary>
    [HttpDelete("{listId:guid}/movies/{movieId:guid}")]
    [Authorize]
    public async Task<ActionResult> RemoveMovieFromList(Guid listId, Guid movieId)
    {
        var userId = GetCurrentUserIdRequired();
        var result = await Mediator.Send(new RemoveMovieFromListCommand(userId, listId, movieId));
        return HandleResult(result);
    }

    /// <summary>
    /// Toggle favorite on a public list
    /// </summary>
    [HttpPost("{listId:guid}/favorite")]
    [Authorize]
    public async Task<ActionResult<bool>> ToggleFavorite(Guid listId)
    {
        var userId = GetCurrentUserIdRequired();
        var result = await Mediator.Send(new ToggleListFavoriteCommand(userId, listId));
        return HandleResult(result);
    }
}

public record CreateListRequest(string Title, string? Description, bool IsPublic);
public record UpdateListRequest(string Title, string? Description, bool IsPublic);
public record AddMovieRequest(Guid MovieId, string? Note);
