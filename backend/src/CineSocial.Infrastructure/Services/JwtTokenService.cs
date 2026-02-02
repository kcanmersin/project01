using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.User;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace CineSocial.Infrastructure.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user)
    {
        var secret = _configuration["JWT_SECRET"] ?? throw new InvalidOperationException("JWT_SECRET not configured");
        var issuer = _configuration["JWT_ISSUER"] ?? "CineFeel";
        var audience = _configuration["JWT_AUDIENCE"] ?? "CineFeel";
        var expiresHours = int.Parse(_configuration["JWT_EXPIRES_HOURS"] ?? "24");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Role, user.Role.ToString()),
            new("userId", user.Id.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiresHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
