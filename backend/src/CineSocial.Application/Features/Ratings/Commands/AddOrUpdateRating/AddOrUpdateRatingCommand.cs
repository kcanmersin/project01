using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Ratings.Commands.AddOrUpdateRating;

public record AddOrUpdateRatingCommand(
    Guid UserId,
    Guid MovieId,
    decimal Rating,
    string? Review
) : IRequest<Result<RatingDto>>;
