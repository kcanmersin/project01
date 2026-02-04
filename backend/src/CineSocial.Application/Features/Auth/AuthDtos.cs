namespace CineSocial.Application.Features.Auth;

public record UserDto(
    Guid Id,
    string Email,
    string Username,
    string Role,
    DateTime CreatedAt,
    Guid? ProfileImageId,
    Guid? CoverImageId,
    bool IsEmailVerified,
    bool HasGoogleLinked
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

public record GoogleLoginRequest(
    string IdToken
);

public record VerifyEmailRequest(
    string Token
);

public record ResendVerificationRequest(
    string Email
);

public record EmailVerificationStatusDto(
    bool IsEmailVerified,
    DateTime? EmailVerifiedAt,
    bool HasPassword,
    bool HasGoogleLinked
);

public record ForgotPasswordRequest(
    string Email
);

public record ResetPasswordRequest(
    string Token,
    string NewPassword
);

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword
);
