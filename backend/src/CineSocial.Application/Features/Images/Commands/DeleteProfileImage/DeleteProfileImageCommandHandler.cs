using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.Media;
using CineSocial.Domain.Entities.User;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Images.Commands.DeleteProfileImage;

public class DeleteProfileImageCommandHandler : IRequestHandler<DeleteProfileImageCommand, Result<DeleteImageResultDto>>
{
    private readonly IImageStorageService _imageStorage;
    private readonly DbContext _context;

    public DeleteProfileImageCommandHandler(IImageStorageService imageStorage, DbContext context)
    {
        _imageStorage = imageStorage;
        _context = context;
    }

    public async Task<Result<DeleteImageResultDto>> Handle(DeleteProfileImageCommand request, CancellationToken cancellationToken)
    {
        var deletedCount = await _imageStorage.DeleteByBucketAndOwnerAsync(ImageBuckets.UserProfile, request.UserId);
        
        var user = await _context.Set<User>().FindAsync(new object[] { request.UserId }, cancellationToken);
        if (user != null)
        {
            user.ProfileImageId = null;
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Result<DeleteImageResultDto>.Success(new DeleteImageResultDto(deletedCount > 0));
    }
}
