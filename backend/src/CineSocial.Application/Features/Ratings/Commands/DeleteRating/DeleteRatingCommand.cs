using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Ratings.Commands.DeleteRating;

public record DeleteRatingCommand(
    Guid UserId,
    Guid MovieId
) : IRequest<Result<bool>>;
