using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.Social;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Lists.Commands.ToggleListFavorite;

public record ToggleListFavoriteCommand(
    Guid UserId,
    Guid ListId
) : IRequest<Result<bool>>; // Returns true if favorited, false if unfavorited

public class ToggleListFavoriteCommandHandler : IRequestHandler<ToggleListFavoriteCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;

    public ToggleListFavoriteCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(ToggleListFavoriteCommand request, CancellationToken cancellationToken)
    {
        var list = await _context.MovieLists
            .FirstOrDefaultAsync(l => l.Id == request.ListId, cancellationToken);

        if (list == null)
        {
            return Result<bool>.NotFound("List not found");
        }

        // Can't favorite own list
        if (list.UserId == request.UserId)
        {
            return Result<bool>.BadRequest("You cannot favorite your own list");
        }

        // Can't favorite private lists
        if (!list.IsPublic)
        {
            return Result<bool>.Forbidden("Cannot favorite a private list");
        }

        var existingFavorite = await _context.ListFavorites
            .FirstOrDefaultAsync(f => f.UserId == request.UserId && f.MovieListId == request.ListId, cancellationToken);

        if (existingFavorite != null)
        {
            // Unfavorite - soft delete
            existingFavorite.IsDeleted = true;
            existingFavorite.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(false);
        }
        else
        {
            // Favorite
            var favorite = new ListFavorite
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                MovieListId = request.ListId,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            _context.ListFavorites.Add(favorite);
            await _context.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
    }
}
