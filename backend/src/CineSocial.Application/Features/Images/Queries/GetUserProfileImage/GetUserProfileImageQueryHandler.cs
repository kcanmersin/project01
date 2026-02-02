using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.Media;
using MediatR;

namespace CineSocial.Application.Features.Images.Queries.GetUserProfileImage;

public class GetUserProfileImageQueryHandler : IRequestHandler<GetUserProfileImageQuery, Result<ImageDataDto>>
{
    private readonly IImageStorageService _imageStorage;

    public GetUserProfileImageQueryHandler(IImageStorageService imageStorage)
    {
        _imageStorage = imageStorage;
    }

    public async Task<Result<ImageDataDto>> Handle(GetUserProfileImageQuery request, CancellationToken cancellationToken)
    {
        var image = await _imageStorage.GetByBucketAndOwnerAsync(ImageBuckets.UserProfile, request.UserId);

        if (image == null)
            return Result<ImageDataDto>.NotFound("Profile image not found");

        return Result<ImageDataDto>.Success(new ImageDataDto(image.Data, image.ContentType));
    }
}
