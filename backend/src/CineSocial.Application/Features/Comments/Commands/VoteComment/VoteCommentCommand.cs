using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.Social;
using CineSocial.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Comments.Commands.VoteComment;

public record VoteCommentCommand(
    Guid UserId,
    Guid CommentId,
    ReactionType? VoteType // null to remove vote
) : IRequest<Result<CommentVoteResultDto>>;

public record CommentVoteResultDto(
    int UpvoteCount,
    int DownvoteCount,
    string? CurrentUserVote
);

public class VoteCommentCommandHandler : IRequestHandler<VoteCommentCommand, Result<CommentVoteResultDto>>
{
    private readonly IApplicationDbContext _context;

    public VoteCommentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CommentVoteResultDto>> Handle(VoteCommentCommand request, CancellationToken cancellationToken)
    {
        var comment = await _context.Comments
            .FirstOrDefaultAsync(c => c.Id == request.CommentId, cancellationToken);

        if (comment == null)
        {
            return Result<CommentVoteResultDto>.NotFound("Comment not found");
        }

        var existingReaction = await _context.CommentReactions
            .FirstOrDefaultAsync(r => r.UserId == request.UserId && r.CommentId == request.CommentId, cancellationToken);

        if (request.VoteType == null)
        {
            // Remove vote
            if (existingReaction != null)
            {
                // Adjust counts
                if (existingReaction.ReactionType == ReactionType.Upvote)
                    comment.UpvoteCount = Math.Max(0, comment.UpvoteCount - 1);
                else
                    comment.DownvoteCount = Math.Max(0, comment.DownvoteCount - 1);

                existingReaction.IsDeleted = true;
                existingReaction.DeletedAt = DateTime.UtcNow;
            }
        }
        else
        {
            if (existingReaction != null)
            {
                // Change vote
                if (existingReaction.ReactionType != request.VoteType.Value)
                {
                    // Adjust counts
                    if (existingReaction.ReactionType == ReactionType.Upvote)
                    {
                        comment.UpvoteCount = Math.Max(0, comment.UpvoteCount - 1);
                        comment.DownvoteCount++;
                    }
                    else
                    {
                        comment.DownvoteCount = Math.Max(0, comment.DownvoteCount - 1);
                        comment.UpvoteCount++;
                    }

                    existingReaction.ReactionType = request.VoteType.Value;
                    existingReaction.UpdatedAt = DateTime.UtcNow;
                }
                // Same vote type - do nothing
            }
            else
            {
                // New vote
                var reaction = new CommentReaction
                {
                    Id = Guid.NewGuid(),
                    UserId = request.UserId,
                    CommentId = request.CommentId,
                    ReactionType = request.VoteType.Value,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };

                _context.CommentReactions.Add(reaction);

                if (request.VoteType.Value == ReactionType.Upvote)
                    comment.UpvoteCount++;
                else
                    comment.DownvoteCount++;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Get current user's vote
        var currentVote = await _context.CommentReactions
            .Where(r => r.UserId == request.UserId && r.CommentId == request.CommentId)
            .Select(r => r.ReactionType.ToString())
            .FirstOrDefaultAsync(cancellationToken);

        return Result<CommentVoteResultDto>.Success(new CommentVoteResultDto(
            comment.UpvoteCount,
            comment.DownvoteCount,
            currentVote
        ));
    }
}
