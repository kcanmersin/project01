using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CineSocial.Infrastructure.Services;
using Microsoft.Extensions.Configuration;

namespace CineSocial.Tests.Infrastructure.Services;

public class JwtTokenServiceTests
{
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly JwtTokenService _jwtTokenService;
    private const string TestSecret = "this_is_a_very_long_secret_key_for_testing_jwt_tokens_minimum_32_characters";

    public JwtTokenServiceTests()
    {
        _mockConfiguration = new Mock<IConfiguration>();
        
        // Setup default configuration
        _mockConfiguration.Setup(c => c["JWT_SECRET"]).Returns(TestSecret);
        _mockConfiguration.Setup(c => c["JWT_ISSUER"]).Returns("CineFeel");
        _mockConfiguration.Setup(c => c["JWT_AUDIENCE"]).Returns("CineFeel");
        _mockConfiguration.Setup(c => c["JWT_EXPIRES_HOURS"]).Returns("24");

        _jwtTokenService = new JwtTokenService(_mockConfiguration.Object);
    }

    [Fact]
    public void GenerateToken_ShouldReturnValidJwtToken()
    {
        // Arrange
        var user = CreateTestUser();

        // Act
        var token = _jwtTokenService.GenerateToken(user);

        // Assert
        token.Should().NotBeNullOrEmpty();
        
        // Verify it's a valid JWT format (3 parts separated by dots)
        var parts = token.Split('.');
        parts.Should().HaveCount(3);
    }

    [Fact]
    public void GenerateToken_ShouldIncludeUserIdClaim()
    {
        // Arrange
        var user = CreateTestUser();

        // Act
        var token = _jwtTokenService.GenerateToken(user);
        var claims = DecodeToken(token);

        // Assert
        claims.Should().Contain(c => c.Type == ClaimTypes.NameIdentifier && c.Value == user.Id.ToString());
        claims.Should().Contain(c => c.Type == "userId" && c.Value == user.Id.ToString());
    }

    [Fact]
    public void GenerateToken_ShouldIncludeEmailClaim()
    {
        // Arrange
        var user = CreateTestUser();

        // Act
        var token = _jwtTokenService.GenerateToken(user);
        var claims = DecodeToken(token);

        // Assert
        claims.Should().Contain(c => c.Type == ClaimTypes.Email && c.Value == user.Email);
    }

    [Fact]
    public void GenerateToken_ShouldIncludeUsernameClaim()
    {
        // Arrange
        var user = CreateTestUser();

        // Act
        var token = _jwtTokenService.GenerateToken(user);
        var claims = DecodeToken(token);

        // Assert
        claims.Should().Contain(c => c.Type == ClaimTypes.Name && c.Value == user.Username);
    }

    [Fact]
    public void GenerateToken_ShouldIncludeRoleClaim()
    {
        // Arrange
        var user = CreateTestUser();

        // Act
        var token = _jwtTokenService.GenerateToken(user);
        var claims = DecodeToken(token);

        // Assert
        claims.Should().Contain(c => c.Type == ClaimTypes.Role && c.Value == user.Role.ToString());
    }

    [Fact]
    public void GenerateToken_ShouldSetCorrectIssuer()
    {
        // Arrange
        var user = CreateTestUser();

        // Act
        var token = _jwtTokenService.GenerateToken(user);
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        // Assert
        jwtToken.Issuer.Should().Be("CineFeel");
    }

    [Fact]
    public void GenerateToken_ShouldSetCorrectAudience()
    {
        // Arrange
        var user = CreateTestUser();

        // Act
        var token = _jwtTokenService.GenerateToken(user);
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        // Assert
        jwtToken.Audiences.Should().Contain("CineFeel");
    }

    [Fact]
    public void GenerateToken_ShouldSetExpirationTime()
    {
        // Arrange
        var user = CreateTestUser();
        var beforeGeneration = DateTime.UtcNow;

        // Act
        var token = _jwtTokenService.GenerateToken(user);
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        // Assert
        jwtToken.ValidTo.Should().BeAfter(beforeGeneration);
        jwtToken.ValidTo.Should().BeCloseTo(beforeGeneration.AddHours(24), TimeSpan.FromMinutes(1));
    }

    [Fact]
    public void GenerateToken_ShouldUseCustomExpirationHours_WhenConfigured()
    {
        // Arrange
        _mockConfiguration.Setup(c => c["JWT_EXPIRES_HOURS"]).Returns("48");
        var service = new JwtTokenService(_mockConfiguration.Object);
        var user = CreateTestUser();
        var beforeGeneration = DateTime.UtcNow;

        // Act
        var token = service.GenerateToken(user);
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        // Assert
        jwtToken.ValidTo.Should().BeCloseTo(beforeGeneration.AddHours(48), TimeSpan.FromMinutes(1));
    }

    [Fact]
    public void GenerateToken_ShouldThrowException_WhenSecretNotConfigured()
    {
        // Arrange
        var mockConfig = new Mock<IConfiguration>();
        mockConfig.Setup(c => c["JWT_SECRET"]).Returns((string?)null);
        mockConfig.Setup(c => c["JWT_ISSUER"]).Returns("CineFeel");
        mockConfig.Setup(c => c["JWT_AUDIENCE"]).Returns("CineFeel");
        var service = new JwtTokenService(mockConfig.Object);
        var user = CreateTestUser();

        // Act & Assert
        var act = () => service.GenerateToken(user);
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*JWT_SECRET*");
    }

    [Fact]
    public void GenerateToken_ShouldUseDifferentValues_ForDifferentUsers()
    {
        // Arrange
        var user1 = CreateTestUser();
        var user2 = CreateTestUser();
        user2.Id = Guid.NewGuid();
        user2.Email = "different@example.com";

        // Act
        var token1 = _jwtTokenService.GenerateToken(user1);
        var token2 = _jwtTokenService.GenerateToken(user2);

        // Assert
        token1.Should().NotBe(token2);
        
        var claims1 = DecodeToken(token1);
        var claims2 = DecodeToken(token2);
        
        claims1.First(c => c.Type == ClaimTypes.Email).Value
            .Should().NotBe(claims2.First(c => c.Type == ClaimTypes.Email).Value);
    }

    private static User CreateTestUser()
    {
        return new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            Username = "testuser",
            Role = UserRole.User,
            CreatedAt = DateTime.UtcNow
        };
    }

    private static List<Claim> DecodeToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        return jwtToken.Claims.ToList();
    }
}
