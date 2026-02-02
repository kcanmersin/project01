using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Auth.Commands.GoogleLogin;

public record GoogleLoginCommand(string IdToken) : IRequest<Result<AuthResponseDto>>;
