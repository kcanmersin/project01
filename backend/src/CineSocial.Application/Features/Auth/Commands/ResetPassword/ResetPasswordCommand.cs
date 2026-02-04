using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Auth.Commands.ResetPassword;

public record ResetPasswordCommand(
    string Token,
    string NewPassword
) : IRequest<Result<string>>;
