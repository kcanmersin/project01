using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.Social;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Ratings.Commands.AddOrUpdateRating;

public class AddOrUpdateRatingCommandHandler : IRequestHandler<AddOrUpdateRatingCommand, Result<RatingDto>>
{
    private readonly IApplicationDbContext _context;

    public AddOrUpdateRatingCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<RatingDto>> Handle(AddOrUpdateRatingCommand request, CancellationToken cancellationToken)
    {
        // Validate rating range
        if (request.Rating < 0 || request.Rating > 10)
        {
            return Result<RatingDto>.BadRequest("Rating must be between 0 and 10");
        }

        // Check if movie exists
        var movieExists = await _context.Movies
            .AnyAsync(m => m.Id == request.MovieId && !m.IsDeleted, cancellationToken);

        if (!movieExists)
        {
            return Result<RatingDto>.NotFound("Movie not found");
        }

        // Check if user already rated this movie
        var existingRating = await _context.MovieRatings
            .FirstOrDefaultAsync(r => r.UserId == request.UserId && r.MovieId == request.MovieId, cancellationToken);

        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == request.UserId && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            return Result<RatingDto>.NotFound("User not found");
        }

        if (existingRating != null)
        {
            // Update existing rating
            existingRating.Rating = request.Rating;
            existingRating.Review = request.Review;
            existingRating.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            // Create new rating
            existingRating = new MovieRating
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                MovieId = request.MovieId,
                Rating = request.Rating,
                Review = request.Review,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            _context.MovieRatings.Add(existingRating);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result<RatingDto>.Success(new RatingDto(
            existingRating.Id,
            existingRating.UserId,
            user.Username,
            existingRating.MovieId,
            existingRating.Rating,
            existingRating.Review,
            existingRating.CreatedAt,
            existingRating.UpdatedAt
        ));
    }
}
