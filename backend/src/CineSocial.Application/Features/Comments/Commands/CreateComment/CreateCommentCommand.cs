using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.Social;
using CineSocial.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Comments.Commands.CreateComment;

public record CreateCommentCommand(
    Guid UserId,
    Guid TargetId,
    CommentTargetType TargetType,
    Guid? ParentCommentId,
    string Content
) : IRequest<Result<CommentDto>>;

public class CreateCommentCommandHandler : IRequestHandler<CreateCommentCommand, Result<CommentDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateCommentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CommentDto>> Handle(CreateCommentCommand request, CancellationToken cancellationToken)
    {
        // Validate content
        if (string.IsNullOrWhiteSpace(request.Content))
        {
            return Result<CommentDto>.BadRequest("Comment content is required");
        }

        if (request.Content.Length > 2000)
        {
            return Result<CommentDto>.BadRequest("Comment cannot exceed 2000 characters");
        }

        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == request.UserId && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            return Result<CommentDto>.NotFound("User not found");
        }

        // Validate target exists
        if (request.TargetType == CommentTargetType.Movie)
        {
            var movieExists = await _context.Movies
                .AnyAsync(m => m.Id == request.TargetId && !m.IsDeleted, cancellationToken);

            if (!movieExists)
            {
                return Result<CommentDto>.NotFound("Movie not found");
            }
        }

        // Validate parent comment if this is a reply
        if (request.ParentCommentId.HasValue)
        {
            var parentComment = await _context.Comments
                .FirstOrDefaultAsync(c => c.Id == request.ParentCommentId.Value, cancellationToken);

            if (parentComment == null)
            {
                return Result<CommentDto>.NotFound("Parent comment not found");
            }

            // Ensure reply is to same target
            if (parentComment.TargetId != request.TargetId || parentComment.TargetType != request.TargetType)
            {
                return Result<CommentDto>.BadRequest("Reply must be to the same target as parent comment");
            }

            // Increment parent's reply count
            parentComment.ReplyCount++;
        }

        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            TargetType = request.TargetType,
            TargetId = request.TargetId,
            ParentCommentId = request.ParentCommentId,
            Content = request.Content.Trim(),
            UpvoteCount = 0,
            DownvoteCount = 0,
            ReplyCount = 0,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<CommentDto>.Success(new CommentDto(
            comment.Id,
            comment.UserId,
            user.Username,
            user.ProfileImageId?.ToString(),
            comment.TargetType.ToString(),
            comment.TargetId,
            comment.ParentCommentId,
            comment.Content,
            comment.UpvoteCount,
            comment.DownvoteCount,
            comment.ReplyCount,
            null,
            comment.CreatedAt,
            comment.UpdatedAt,
            null
        ));
    }
}
