using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Lists.Commands.UpdateList;

public record UpdateListCommand(
    Guid UserId,
    Guid ListId,
    string Title,
    string? Description,
    bool IsPublic
) : IRequest<Result<MovieListDto>>;

public class UpdateListCommandHandler : IRequestHandler<UpdateListCommand, Result<MovieListDto>>
{
    private readonly IApplicationDbContext _context;

    public UpdateListCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<MovieListDto>> Handle(UpdateListCommand request, CancellationToken cancellationToken)
    {
        var list = await _context.MovieLists
            .Include(l => l.User)
            .FirstOrDefaultAsync(l => l.Id == request.ListId, cancellationToken);

        if (list == null)
        {
            return Result<MovieListDto>.NotFound("List not found");
        }

        if (list.UserId != request.UserId)
        {
            return Result<MovieListDto>.Forbidden("You can only update your own lists");
        }

        list.Title = request.Title.Trim();
        list.Description = request.Description?.Trim();
        list.IsPublic = request.IsPublic;
        list.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        var favoriteCount = await _context.ListFavorites
            .CountAsync(f => f.MovieListId == list.Id, cancellationToken);

        return Result<MovieListDto>.Success(new MovieListDto(
            list.Id,
            list.UserId,
            list.User.Username,
            list.Title,
            list.Description,
            list.CoverImageId,
            list.ListType.ToString(),
            list.IsPublic,
            list.MovieCount,
            favoriteCount,
            false,
            list.CreatedAt,
            list.UpdatedAt
        ));
    }
}
