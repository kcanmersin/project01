using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Images.Queries.GetUserProfileImage;

public record GetUserProfileImageQuery(Guid UserId) : IRequest<Result<ImageDataDto>>;
