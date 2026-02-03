namespace CineSocial.Tests.Domain.Entities;

public class UserTests
{
    [Fact]
    public void User_ShouldInitializeWithDefaultValues()
    {
        // Act
        var user = new User();

        // Assert
        user.Email.Should().Be(string. Empty);
        user.Username.Should().Be(string.Empty);
        user.PasswordHash.Should().BeNull();
        user.Role.Should().Be(UserRole.User);
        user.LastLoginAt.Should().BeNull();
        user.IsEmailVerified.Should().BeFalse();
        user.EmailVerifiedAt.Should().BeNull();
        user.ProfileImageId.Should().BeNull();
        user.CoverImageId.Should().BeNull();
        user.ExternalLogins.Should().BeEmpty();
        user.VerificationTokens.Should().BeEmpty();
    }

    [Fact]
    public void User_ShouldSetPropertiesCorrectly()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var email = "test@example.com";
        var username = "testuser";
        var passwordHash = "hashed_password";
        var now = DateTime.UtcNow;
        var profileImageId = Guid.NewGuid();
        var coverImageId = Guid.NewGuid();

        // Act
        var user = new User
        {
            Id = userId,
            Email = email,
            Username = username,
            PasswordHash = passwordHash,
            Role = UserRole.Admin,
            LastLoginAt = now,
            IsEmailVerified = true,
            EmailVerifiedAt = now,
            ProfileImageId = profileImageId,
            CoverImageId = coverImageId,
            CreatedAt = now,
            UpdatedAt = now
        };

        // Assert
        user.Id.Should().Be(userId);
        user.Email.Should().Be(email);
        user.Username.Should().Be(username);
        user.PasswordHash.Should().Be(passwordHash);
        user.Role.Should().Be(UserRole.Admin);
        user.LastLoginAt.Should().Be(now);
        user.IsEmailVerified.Should().BeTrue();
        user.EmailVerifiedAt.Should().Be(now);
        user.ProfileImageId.Should().Be(profileImageId);
        user.CoverImageId.Should().Be(coverImageId);
        user.CreatedAt.Should().Be(now);
        user.UpdatedAt.Should().Be(now);
    }

    [Fact]
    public void User_ShouldAllowNullPasswordHashForExternalLogins()
    {
        // Act
        var user = new User
        {
            Email = "google@example.com",
            Username = "googleuser",
            PasswordHash = null  // Google login, no password
        };

        // Assert
        user.PasswordHash.Should().BeNull();
    }
}
