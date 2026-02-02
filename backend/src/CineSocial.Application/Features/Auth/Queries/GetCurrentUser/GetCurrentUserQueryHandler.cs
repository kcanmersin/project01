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
            .Select(u => new UserDto(
                u.Id,
                u.Email,
                u.Username,
                u.Role.ToString(),
                u.CreatedAt,
                u.ProfileImageId,
                u.CoverImageId
            ))
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null)
            return Result<UserDto>.Failure("User not found", 401);

        return Result<UserDto>.Success(user);
    }
}
