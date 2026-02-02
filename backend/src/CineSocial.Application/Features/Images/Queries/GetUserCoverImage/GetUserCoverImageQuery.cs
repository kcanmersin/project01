using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Images.Queries.GetUserCoverImage;

public record GetUserCoverImageQuery(Guid UserId) : IRequest<Result<ImageDataDto>>;
