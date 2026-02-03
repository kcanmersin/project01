using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Ratings.Queries.GetMyRating;

public record GetMyRatingQuery(
    Guid UserId,
    Guid MovieId
) : IRequest<Result<UserRatingDto?>>;

public class GetMyRatingQueryHandler : IRequestHandler<GetMyRatingQuery, Result<UserRatingDto?>>
{
    private readonly IApplicationDbContext _context;

    public GetMyRatingQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<UserRatingDto?>> Handle(GetMyRatingQuery request, CancellationToken cancellationToken)
    {
        var rating = await _context.MovieRatings
            .AsNoTracking()
            .Where(r => r.UserId == request.UserId && r.MovieId == request.MovieId)
            .Select(r => new UserRatingDto(
                r.MovieId,
                r.Rating,
                r.Review,
                r.CreatedAt
            ))
            .FirstOrDefaultAsync(cancellationToken);

        return Result<UserRatingDto?>.Success(rating);
    }
}
