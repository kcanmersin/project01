using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Ratings.Commands.DeleteRating;

public class DeleteRatingCommandHandler : IRequestHandler<DeleteRatingCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;

    public DeleteRatingCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteRatingCommand request, CancellationToken cancellationToken)
    {
        var rating = await _context.MovieRatings
            .FirstOrDefaultAsync(r => r.UserId == request.UserId && r.MovieId == request.MovieId, cancellationToken);

        if (rating == null)
        {
            return Result<bool>.NotFound("Rating not found");
        }

        // Soft delete
        rating.IsDeleted = true;
        rating.DeletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
