using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Images.Commands.UploadCoverImage;

public record UploadCoverImageCommand(
    Guid UserId,
    string FileName,
    string ContentType,
    byte[] FileData
) : IRequest<Result<ImageUploadResultDto>>;
