using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Images.Commands.DeleteProfileImage;

public record DeleteProfileImageCommand(Guid UserId) : IRequest<Result<DeleteImageResultDto>>;
