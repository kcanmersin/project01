using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.Social;
using CineSocial.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Lists.Commands.EnsureSystemLists;

/// <summary>
/// Ensures that the user has Watchlist and Favorites system lists.
/// Creates them if they don't exist.
/// </summary>
public record EnsureSystemListsCommand(Guid UserId) : IRequest<Result<bool>>;

public class EnsureSystemListsCommandHandler : IRequestHandler<EnsureSystemListsCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;

    public EnsureSystemListsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(EnsureSystemListsCommand request, CancellationToken cancellationToken)
    {
        var userExists = await _context.Users
            .AnyAsync(u => u.Id == request.UserId && !u.IsDeleted, cancellationToken);

        if (!userExists)
        {
            return Result<bool>.NotFound("User not found");
        }

        var existingLists = await _context.MovieLists
            .Where(l => l.UserId == request.UserId && (l.ListType == ListType.Watchlist || l.ListType == ListType.Favorites))
            .Select(l => l.ListType)
            .ToListAsync(cancellationToken);

        var listsToCreate = new List<MovieList>();

        if (!existingLists.Contains(ListType.Watchlist))
        {
            listsToCreate.Add(new MovieList
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                Title = "İzleme Listesi",
                Description = "İzlemek istediğim filmler",
                ListType = ListType.Watchlist,
                IsPublic = false,
                MovieCount = 0,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            });
        }

        if (!existingLists.Contains(ListType.Favorites))
        {
            listsToCreate.Add(new MovieList
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                Title = "Favorilerim",
                Description = "En sevdiğim filmler",
                ListType = ListType.Favorites,
                IsPublic = true,
                MovieCount = 0,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            });
        }

        if (listsToCreate.Any())
        {
            _context.MovieLists.AddRange(listsToCreate);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Result<bool>.Success(true);
    }
}
