using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Images.Commands.UploadProfileImage;

public record UploadProfileImageCommand(
    Guid UserId,
    string FileName,
    string ContentType,
    byte[] FileData
) : IRequest<Result<ImageUploadResultDto>>;
