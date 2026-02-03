using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Comments.Queries.GetMovieComments;

public record GetMovieCommentsQuery(
    Guid MovieId,
    Guid? CurrentUserId,
    int Page = 1,
    int PageSize = 20
) : IRequest<Result<PagedResult<CommentDto>>>;

public class GetMovieCommentsQueryHandler : IRequestHandler<GetMovieCommentsQuery, Result<PagedResult<CommentDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetMovieCommentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<CommentDto>>> Handle(GetMovieCommentsQuery request, CancellationToken cancellationToken)
    {
        // Get root comments (no parent)
        var query = _context.Comments
            .AsNoTracking()
            .Where(c => c.TargetId == request.MovieId
                && c.TargetType == CommentTargetType.Movie
                && c.ParentCommentId == null)
            .OrderByDescending(c => c.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        var rootComments = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var rootCommentIds = rootComments.Select(c => c.Id).ToList();

        // Get all replies for these root comments
        var replies = await _context.Comments
            .AsNoTracking()
            .Where(c => c.ParentCommentId != null && rootCommentIds.Contains(c.ParentCommentId.Value))
            .OrderBy(c => c.CreatedAt)
            .ToListAsync(cancellationToken);

        // Get all user IDs
        var allComments = rootComments.Concat(replies).ToList();
        var userIds = allComments.Select(c => c.UserId).Distinct().ToList();

        // Get users
        var users = await _context.Users
            .AsNoTracking()
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, cancellationToken);

        // Get current user's votes
        var userVotes = new Dictionary<Guid, string>();
        if (request.CurrentUserId.HasValue)
        {
            var commentIds = allComments.Select(c => c.Id).ToList();
            userVotes = await _context.CommentReactions
                .AsNoTracking()
                .Where(r => r.UserId == request.CurrentUserId.Value && commentIds.Contains(r.CommentId))
                .ToDictionaryAsync(r => r.CommentId, r => r.ReactionType.ToString(), cancellationToken);
        }

        // Build DTOs
        var replyDtos = replies
            .GroupBy(r => r.ParentCommentId!.Value)
            .ToDictionary(
                g => g.Key,
                g => g.Select(r => BuildCommentDto(r, users, userVotes)).ToList()
            );

        var commentDtos = rootComments
            .Select(c => BuildCommentDto(c, users, userVotes, replyDtos.GetValueOrDefault(c.Id)))
            .ToList();

        return Result<PagedResult<CommentDto>>.Success(
            PagedResult<CommentDto>.Create(commentDtos, totalCount, request.Page, request.PageSize)
        );
    }

    private static CommentDto BuildCommentDto(
        Domain.Entities.Social.Comment comment,
        Dictionary<Guid, Domain.Entities.User.User> users,
        Dictionary<Guid, string> userVotes,
        List<CommentDto>? replies = null)
    {
        var user = users.GetValueOrDefault(comment.UserId);
        userVotes.TryGetValue(comment.Id, out var currentUserVote);

        return new CommentDto(
            comment.Id,
            comment.UserId,
            user?.Username ?? "Unknown",
            user?.ProfileImageId?.ToString(),
            comment.TargetType.ToString(),
            comment.TargetId,
            comment.ParentCommentId,
            comment.Content,
            comment.UpvoteCount,
            comment.DownvoteCount,
            comment.ReplyCount,
            currentUserVote,
            comment.CreatedAt,
            comment.UpdatedAt,
            replies
        );
    }
}
