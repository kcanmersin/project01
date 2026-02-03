using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.Social;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Lists.Commands.AddMovieToList;

public record AddMovieToListCommand(
    Guid UserId,
    Guid ListId,
    Guid MovieId,
    string? Note
) : IRequest<Result<bool>>;

public class AddMovieToListCommandHandler : IRequestHandler<AddMovieToListCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;

    public AddMovieToListCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(AddMovieToListCommand request, CancellationToken cancellationToken)
    {
        var list = await _context.MovieLists
            .FirstOrDefaultAsync(l => l.Id == request.ListId, cancellationToken);

        if (list == null)
        {
            return Result<bool>.NotFound("List not found");
        }

        if (list.UserId != request.UserId)
        {
            return Result<bool>.Forbidden("You can only add movies to your own lists");
        }

        // Check if movie exists
        var movieExists = await _context.Movies
            .AnyAsync(m => m.Id == request.MovieId && !m.IsDeleted, cancellationToken);

        if (!movieExists)
        {
            return Result<bool>.NotFound("Movie not found");
        }

        // Check if movie already in list
        var alreadyInList = await _context.MovieListItems
            .AnyAsync(i => i.MovieListId == request.ListId && i.MovieId == request.MovieId, cancellationToken);

        if (alreadyInList)
        {
            return Result<bool>.BadRequest("Movie is already in this list");
        }

        // Get the next order number
        var maxOrder = await _context.MovieListItems
            .Where(i => i.MovieListId == request.ListId)
            .MaxAsync(i => (int?)i.Order, cancellationToken) ?? 0;

        var item = new MovieListItem
        {
            Id = Guid.NewGuid(),
            MovieListId = request.ListId,
            MovieId = request.MovieId,
            Order = maxOrder + 1,
            Note = request.Note?.Trim(),
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        _context.MovieListItems.Add(item);

        // Update movie count
        list.MovieCount++;
        list.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
