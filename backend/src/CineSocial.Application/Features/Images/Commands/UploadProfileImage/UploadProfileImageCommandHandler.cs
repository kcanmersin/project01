using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.Media;
using CineSocial.Domain.Entities.User;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Images.Commands.UploadProfileImage;

public class UploadProfileImageCommandHandler : IRequestHandler<UploadProfileImageCommand, Result<ImageUploadResultDto>>
{
    private readonly IImageStorageService _imageStorage;
    private readonly DbContext _context;

    public UploadProfileImageCommandHandler(IImageStorageService imageStorage, DbContext context)
    {
        _imageStorage = imageStorage;
        _context = context;
    }

    public async Task<Result<ImageUploadResultDto>> Handle(UploadProfileImageCommand request, CancellationToken cancellationToken)
    {
        if (request.FileData == null || request.FileData.Length == 0)
            return Result<ImageUploadResultDto>.BadRequest("No file uploaded");

        if (request.FileData.Length > 5 * 1024 * 1024)
            return Result<ImageUploadResultDto>.BadRequest("File size exceeds 5MB limit");

        try
        {
            var imageId = await _imageStorage.UploadAsync(
                ImageBuckets.UserProfile,
                request.UserId,
                request.FileName,
                request.ContentType,
                request.FileData
            );

            // Update user's profile image reference
            var user = await _context.Set<User>().FindAsync(new object[] { request.UserId }, cancellationToken);
            if (user != null)
            {
                user.ProfileImageId = imageId;
                await _context.SaveChangesAsync(cancellationToken);
            }

            return Result<ImageUploadResultDto>.Success(new ImageUploadResultDto(imageId, $"/api/images/{imageId}"));
        }
        catch (InvalidOperationException ex)
        {
            return Result<ImageUploadResultDto>.BadRequest(ex.Message);
        }
    }
}
