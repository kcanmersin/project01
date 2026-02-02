using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Auth.Commands.Register;

public record RegisterCommand(
    string Email,
    string Username,
    string Password
) : IRequest<Result<AuthResponseDto>>;
