using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Auth.Commands.ResendVerification;

public record ResendVerificationCommand(string Email) : IRequest<Result>;
