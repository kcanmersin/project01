using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Images.Commands.DeleteCoverImage;

public record DeleteCoverImageCommand(Guid UserId) : IRequest<Result<DeleteImageResultDto>>;
