using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Images.Queries.GetImageById;

public record GetImageByIdQuery(Guid ImageId) : IRequest<Result<ImageDataDto>>;
