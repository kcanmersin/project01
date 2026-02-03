using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Comments.Commands.DeleteComment;

public record DeleteCommentCommand(
    Guid UserId,
    Guid CommentId
) : IRequest<Result<bool>>;

public class DeleteCommentCommandHandler : IRequestHandler<DeleteCommentCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;

    public DeleteCommentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteCommentCommand request, CancellationToken cancellationToken)
    {
        var comment = await _context.Comments
            .FirstOrDefaultAsync(c => c.Id == request.CommentId, cancellationToken);

        if (comment == null)
        {
            return Result<bool>.NotFound("Comment not found");
        }

        if (comment.UserId != request.UserId)
        {
            return Result<bool>.Forbidden("You can only delete your own comments");
        }

        // Soft delete
        comment.IsDeleted = true;
        comment.DeletedAt = DateTime.UtcNow;

        // Decrement parent's reply count if this is a reply
        if (comment.ParentCommentId.HasValue)
        {
            var parentComment = await _context.Comments
                .FirstOrDefaultAsync(c => c.Id == comment.ParentCommentId.Value, cancellationToken);

            if (parentComment != null)
            {
                parentComment.ReplyCount = Math.Max(0, parentComment.ReplyCount - 1);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
