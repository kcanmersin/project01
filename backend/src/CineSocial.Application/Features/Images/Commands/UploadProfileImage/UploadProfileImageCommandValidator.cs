using FluentValidation;

namespace CineSocial.Application.Features.Images.Commands.UploadProfileImage;

public class UploadProfileImageCommandValidator : AbstractValidator<UploadProfileImageCommand>
{
    private static readonly string[] AllowedContentTypes =
    {
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    };

    private const int MaxFileSizeInBytes = 5 * 1024 * 1024; // 5MB

    public UploadProfileImageCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.FileName)
            .NotEmpty().WithMessage("File name is required");

        RuleFor(x => x.ContentType)
            .NotEmpty().WithMessage("Content type is required")
            .Must(ct => AllowedContentTypes.Contains(ct.ToLower()))
            .WithMessage("Invalid image format. Allowed formats: JPEG, PNG, GIF, WebP");

        RuleFor(x => x.FileData)
            .NotEmpty().WithMessage("No file uploaded")
            .Must(data => data != null && data.Length > 0)
            .WithMessage("File is empty")
            .Must(data => data == null || data.Length <= MaxFileSizeInBytes)
            .WithMessage($"File size must not exceed {MaxFileSizeInBytes / 1024 / 1024}MB");
    }
}
