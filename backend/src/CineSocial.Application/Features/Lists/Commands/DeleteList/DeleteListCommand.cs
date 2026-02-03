using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Lists.Commands.DeleteList;

public record DeleteListCommand(
    Guid UserId,
    Guid ListId
) : IRequest<Result<bool>>;

public class DeleteListCommandHandler : IRequestHandler<DeleteListCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;

    public DeleteListCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteListCommand request, CancellationToken cancellationToken)
    {
        var list = await _context.MovieLists
            .FirstOrDefaultAsync(l => l.Id == request.ListId, cancellationToken);

        if (list == null)
        {
            return Result<bool>.NotFound("List not found");
        }

        if (list.UserId != request.UserId)
        {
            return Result<bool>.Forbidden("You can only delete your own lists");
        }

        // Cannot delete system lists (Watchlist, Favorites)
        if (list.ListType != ListType.Custom)
        {
            return Result<bool>.BadRequest("Cannot delete system lists");
        }

        // Soft delete
        list.IsDeleted = true;
        list.DeletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
