using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Lists.Commands.RemoveMovieFromList;

public record RemoveMovieFromListCommand(
    Guid UserId,
    Guid ListId,
    Guid MovieId
) : IRequest<Result<bool>>;

public class RemoveMovieFromListCommandHandler : IRequestHandler<RemoveMovieFromListCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;

    public RemoveMovieFromListCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(RemoveMovieFromListCommand request, CancellationToken cancellationToken)
    {
        var list = await _context.MovieLists
            .FirstOrDefaultAsync(l => l.Id == request.ListId, cancellationToken);

        if (list == null)
        {
            return Result<bool>.NotFound("List not found");
        }

        if (list.UserId != request.UserId)
        {
            return Result<bool>.Forbidden("You can only remove movies from your own lists");
        }

        var item = await _context.MovieListItems
            .FirstOrDefaultAsync(i => i.MovieListId == request.ListId && i.MovieId == request.MovieId, cancellationToken);

        if (item == null)
        {
            return Result<bool>.NotFound("Movie not found in this list");
        }

        // Soft delete
        item.IsDeleted = true;
        item.DeletedAt = DateTime.UtcNow;

        // Update movie count
        list.MovieCount = Math.Max(0, list.MovieCount - 1);
        list.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
