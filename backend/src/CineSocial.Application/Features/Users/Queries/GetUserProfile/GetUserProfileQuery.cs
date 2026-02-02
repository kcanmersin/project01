using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Users.Queries.GetUserProfile;

public record GetUserProfileQuery(
    string Username,
    Guid? CurrentUserId
) : IRequest<Result<UserProfileDto>>;

public class GetUserProfileHandler : IRequestHandler<GetUserProfileQuery, Result<UserProfileDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUserProfileHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<UserProfileDto>> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .AsNoTracking()
            .Where(u => u.Username.ToLower() == request.Username.ToLower() && !u.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null)
            return Result<UserProfileDto>.NotFound("User not found");

        return Result<UserProfileDto>.Success(new UserProfileDto(
            user.Id,
            user.Username,
            user.ProfileImageId?.ToString(),
            user.CoverImageId?.ToString(),
            user.CreatedAt
        ));
    }
}
