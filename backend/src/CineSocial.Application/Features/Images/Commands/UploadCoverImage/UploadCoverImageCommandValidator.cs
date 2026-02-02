using FluentValidation;

namespace CineSocial.Application.Features.Images.Commands.UploadCoverImage;

public class UploadCoverImageCommandValidator : AbstractValidator<UploadCoverImageCommand>
{
    private static readonly string[] AllowedContentTypes =
    {
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    };

    private const int MaxFileSizeInBytes = 10 * 1024 * 1024; // 10MB for cover images

    public UploadCoverImageCommandValidator()
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
