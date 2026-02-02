using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.Media;
using MediatR;

namespace CineSocial.Application.Features.Images.Queries.GetUserCoverImage;

public class GetUserCoverImageQueryHandler : IRequestHandler<GetUserCoverImageQuery, Result<ImageDataDto>>
{
    private readonly IImageStorageService _imageStorage;

    public GetUserCoverImageQueryHandler(IImageStorageService imageStorage)
    {
        _imageStorage = imageStorage;
    }

    public async Task<Result<ImageDataDto>> Handle(GetUserCoverImageQuery request, CancellationToken cancellationToken)
    {
        var image = await _imageStorage.GetByBucketAndOwnerAsync(ImageBuckets.UserCover, request.UserId);

        if (image == null)
            return Result<ImageDataDto>.NotFound("Cover image not found");

        return Result<ImageDataDto>.Success(new ImageDataDto(image.Data, image.ContentType));
    }
}
