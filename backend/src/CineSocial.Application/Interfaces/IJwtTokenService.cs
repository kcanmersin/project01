using CineSocial.Domain.Entities.User;

namespace CineSocial.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
}
