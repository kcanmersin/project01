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
        var allComments = await _context.Comments
            .AsNoTracking()
            .Where(c => c.TargetId == request.MovieId && c.TargetType == CommentTargetType.Movie)
            .ToListAsync(cancellationToken);

        var rootComments = allComments
            .Where(c => c.ParentCommentId == null)
            .OrderByDescending(c => c.CreatedAt)
            .ToList();

        var totalCount = rootComments.Count;

        var pagedRoots = rootComments
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var repliesByParent = allComments
            .Where(c => c.ParentCommentId != null)
            .GroupBy(c => c.ParentCommentId!.Value)
            .ToDictionary(g => g.Key, g => g.OrderBy(c => c.CreatedAt).ToList());

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

        var commentDtos = pagedRoots
            .Select(c => BuildCommentDto(c, users, userVotes, repliesByParent))
            .ToList();

        return Result<PagedResult<CommentDto>>.Success(
            PagedResult<CommentDto>.Create(commentDtos, totalCount, request.Page, request.PageSize)
        );
    }

    private static CommentDto BuildCommentDto(
        Domain.Entities.Social.Comment comment,
        Dictionary<Guid, Domain.Entities.User.User> users,
        Dictionary<Guid, string> userVotes,
        Dictionary<Guid, List<Domain.Entities.Social.Comment>> repliesByParent)
    {
        var user = users.GetValueOrDefault(comment.UserId);
        userVotes.TryGetValue(comment.Id, out var currentUserVote);

        List<CommentDto>? replies = null;
        if (repliesByParent.TryGetValue(comment.Id, out var replyEntities))
        {
            replies = replyEntities
                .Select(r => BuildCommentDto(r, users, userVotes, repliesByParent))
                .ToList();
        }

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
