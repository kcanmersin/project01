using CineSocial.Application.Common;
using CineSocial.Application.Features.Comments;
using CineSocial.Application.Features.Comments.Commands.CreateComment;
using CineSocial.Application.Features.Comments.Commands.DeleteComment;
using CineSocial.Application.Features.Comments.Commands.VoteComment;
using CineSocial.Application.Features.Comments.Queries.GetMovieComments;
using CineSocial.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSocial.Api.Controllers;

public class CommentsController : BaseApiController
{
    /// <summary>
    /// Get comments for a movie
    /// </summary>
    [HttpGet("movies/{movieId:guid}")]
    public async Task<ActionResult<PagedResult<CommentDto>>> GetMovieComments(
        Guid movieId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = GetCurrentUserId();
        var result = await Mediator.Send(new GetMovieCommentsQuery(movieId, userId, page, pageSize));
        return HandleResult(result);
    }

    /// <summary>
    /// Create a comment on a movie
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<CommentDto>> CreateComment([FromBody] CreateCommentRequest request)
    {
        var userId = GetCurrentUserIdRequired();
        var result = await Mediator.Send(new CreateCommentCommand(
            userId,
            request.TargetId,
            request.TargetType,
            request.ParentCommentId,
            request.Content
        ));
        return HandleResult(result);
    }

    /// <summary>
    /// Delete a comment
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<ActionResult> DeleteComment(Guid id)
    {
        var userId = GetCurrentUserIdRequired();
        var result = await Mediator.Send(new DeleteCommentCommand(userId, id));
        return HandleResult(result);
    }

    /// <summary>
    /// Vote on a comment (upvote/downvote)
    /// </summary>
    [HttpPost("{id:guid}/vote")]
    [Authorize]
    public async Task<ActionResult<CommentVoteResultDto>> VoteComment(Guid id, [FromBody] VoteRequest request)
    {
        var userId = GetCurrentUserIdRequired();
        var result = await Mediator.Send(new VoteCommentCommand(userId, id, request.VoteType));
        return HandleResult(result);
    }
}

public record CreateCommentRequest(
    Guid TargetId,
    CommentTargetType TargetType,
    Guid? ParentCommentId,
    string Content
);

public record VoteRequest(ReactionType? VoteType);
