using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Auth.Queries.GetCurrentUser;

public record GetCurrentUserQuery(Guid UserId) : IRequest<Result<UserDto>>;
