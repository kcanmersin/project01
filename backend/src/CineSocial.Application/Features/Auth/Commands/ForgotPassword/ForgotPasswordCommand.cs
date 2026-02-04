using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Auth.Commands.ForgotPassword;

public record ForgotPasswordCommand(
    string Email
) : IRequest<Result<string>>;
