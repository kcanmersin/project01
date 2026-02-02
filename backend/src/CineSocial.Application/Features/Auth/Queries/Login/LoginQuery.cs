using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Auth.Queries.Login;

public record LoginQuery(
    string EmailOrUsername,
    string Password
) : IRequest<Result<AuthResponseDto>>;
