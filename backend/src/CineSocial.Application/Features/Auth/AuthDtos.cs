using CineSocial.Domain.Enums;

namespace CineSocial.Application.Features.Auth;

public record UserDto(
    Guid Id,
    string Email,
    string Username,
    string Role,
    DateTime CreatedAt,
    Guid? ProfileImageId,
    Guid? CoverImageId
);

public record AuthResponseDto(
    string Token,
    UserDto User
);

public record RegisterRequest(
    string Email,
    string Username,
    string Password
);

public record LoginRequest(
    string EmailOrUsername,
    string Password
);
