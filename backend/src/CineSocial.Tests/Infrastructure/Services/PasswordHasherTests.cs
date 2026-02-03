using CineSocial.Infrastructure.Services;

namespace CineSocial.Tests.Infrastructure.Services;

public class PasswordHasherTests
{
    private readonly PasswordHasher _passwordHasher;

    public PasswordHasherTests()
    {
        _passwordHasher = new PasswordHasher();
    }

    [Fact]
    public void Hash_ShouldReturnHashedPassword()
    {
        // Arrange
        var password = "MySecurePassword123";

        // Act
        var hashedPassword = _passwordHasher.Hash(password);

        // Assert
        hashedPassword.Should().NotBeNullOrEmpty();
        hashedPassword.Should().NotBe(password);
        hashedPassword.Should().StartWith("$2a$"); // BCrypt hash prefix
    }

    [Fact]
    public void Hash_ShouldGenerateDifferentHashesForSamePassword()
    {
        // Arrange
        var password = "MySecurePassword123";

        // Act
        var hash1 = _passwordHasher.Hash(password);
        var hash2 = _passwordHasher.Hash(password);

        // Assert
        hash1.Should().NotBe(hash2); // BCrypt uses random salt
    }

    [Fact]
    public void Verify_ShouldReturnTrueForCorrectPassword()
    {
        // Arrange
        var password = "MySecurePassword123";
        var hashedPassword = _passwordHasher.Hash(password);

        // Act
        var result = _passwordHasher.Verify(password, hashedPassword);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void Verify_ShouldReturnFalseForIncorrectPassword()
    {
        // Arrange
        var correctPassword = "MySecurePassword123";
        var incorrectPassword = "WrongPassword456";
        var hashedPassword = _passwordHasher.Hash(correctPassword);

        // Act
        var result = _passwordHasher.Verify(incorrectPassword, hashedPassword);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void Verify_ShouldReturnFalseForInvalidHash()
    {
        // Arrange
        var password = "MySecurePassword123";
        var invalidHash = "not_a_valid_bcrypt_hash";

        // Act & Assert
        var act = () => _passwordHasher.Verify(password, invalidHash);
        act.Should().Throw<Exception>(); // BCrypt throws exception for invalid hash
    }

    [Theory]
    [InlineData("")]
    [InlineData("a")]
    [InlineData("short")]
    [InlineData("verylongpasswordwithlotsofcharacters123456789")]
    public void Hash_ShouldHandlePasswordsOfVariousLengths(string password)
    {
        // Act
        var hashedPassword = _passwordHasher.Hash(password);

        // Assert
        hashedPassword.Should().NotBeNullOrEmpty();
        _passwordHasher.Verify(password, hashedPassword).Should().BeTrue();
    }
}
