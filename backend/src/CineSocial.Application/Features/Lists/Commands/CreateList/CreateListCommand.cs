using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.Social;
using CineSocial.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Lists.Commands.CreateList;

public record CreateListCommand(
    Guid UserId,
    string Title,
    string? Description,
    bool IsPublic
) : IRequest<Result<MovieListDto>>;

public class CreateListCommandHandler : IRequestHandler<CreateListCommand, Result<MovieListDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateListCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<MovieListDto>> Handle(CreateListCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == request.UserId && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            return Result<MovieListDto>.NotFound("User not found");
        }

        var list = new MovieList
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            ListType = ListType.Custom,
            IsPublic = request.IsPublic,
            MovieCount = 0,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        _context.MovieLists.Add(list);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<MovieListDto>.Success(new MovieListDto(
            list.Id,
            list.UserId,
            user.Username,
            list.Title,
            list.Description,
            list.CoverImageId,
            list.ListType.ToString(),
            list.IsPublic,
            list.MovieCount,
            0,
            false,
            list.CreatedAt,
            list.UpdatedAt
        ));
    }
}
