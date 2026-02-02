using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Auth.Commands.VerifyEmail;

public record VerifyEmailCommand(string Token) : IRequest<Result<AuthResponseDto>>;
