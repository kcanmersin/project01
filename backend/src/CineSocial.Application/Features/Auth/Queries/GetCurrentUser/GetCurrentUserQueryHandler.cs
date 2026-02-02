using CineSocial.Application.Common;
using CineSocial.Domain.Entities.User;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Auth.Queries.GetCurrentUser;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, Result<UserDto>>
{
    private readonly DbContext _context;

    public GetCurrentUserQueryHandler(DbContext context)
    {
        _context = context;
    }

    public async Task<Result<UserDto>> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var user = await _context.Set<User>()
            .AsNoTracking()
            .Where(u => u.Id == request.UserId && !u.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null)
            return Result<UserDto>.Failure("Kullanıcı bulunamadı", 401);

        var hasGoogleLinked = await _context.Set<UserExternalLogin>()
            .AnyAsync(e => e.UserId == user.Id && e.Provider == "Google" && !e.IsDeleted, cancellationToken);

        var userDto = new UserDto(
            user.Id,
            user.Email,
            user.Username,
            user.Role.ToString(),
            user.CreatedAt,
            user.ProfileImageId,
            user.CoverImageId,
            user.IsEmailVerified,
            hasGoogleLinked
        );

        return Result<UserDto>.Success(userDto);
    }
}
