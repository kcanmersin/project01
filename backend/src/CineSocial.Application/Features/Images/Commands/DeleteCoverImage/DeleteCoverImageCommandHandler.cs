using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.Media;
using CineSocial.Domain.Entities.User;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Images.Commands.DeleteCoverImage;

public class DeleteCoverImageCommandHandler : IRequestHandler<DeleteCoverImageCommand, Result<DeleteImageResultDto>>
{
    private readonly IImageStorageService _imageStorage;
    private readonly DbContext _context;

    public DeleteCoverImageCommandHandler(IImageStorageService imageStorage, DbContext context)
    {
        _imageStorage = imageStorage;
        _context = context;
    }

    public async Task<Result<DeleteImageResultDto>> Handle(DeleteCoverImageCommand request, CancellationToken cancellationToken)
    {
        var deletedCount = await _imageStorage.DeleteByBucketAndOwnerAsync(ImageBuckets.UserCover, request.UserId);
        
        var user = await _context.Set<User>().FindAsync(new object[] { request.UserId }, cancellationToken);
        if (user != null)
        {
            user.CoverImageId = null;
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Result<DeleteImageResultDto>.Success(new DeleteImageResultDto(deletedCount > 0));
    }
}
