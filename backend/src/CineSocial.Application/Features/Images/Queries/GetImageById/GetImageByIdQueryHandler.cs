using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using MediatR;

namespace CineSocial.Application.Features.Images.Queries.GetImageById;

public class GetImageByIdQueryHandler : IRequestHandler<GetImageByIdQuery, Result<ImageDataDto>>
{
    private readonly IImageStorageService _imageStorage;

    public GetImageByIdQueryHandler(IImageStorageService imageStorage)
    {
        _imageStorage = imageStorage;
    }

    public async Task<Result<ImageDataDto>> Handle(GetImageByIdQuery request, CancellationToken cancellationToken)
    {
        var image = await _imageStorage.GetByIdAsync(request.ImageId);

        if (image == null)
            return Result<ImageDataDto>.NotFound("Image not found");

        return Result<ImageDataDto>.Success(new ImageDataDto(image.Data, image.ContentType));
    }
}
