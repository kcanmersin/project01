using CineSocial.Application.Features.Auth.Commands.Register;
using FluentValidation.TestHelper;

namespace CineSocial.Tests.Application.Features.Auth.Commands;

public class RegisterCommandValidatorTests
{
    private readonly RegisterCommandValidator _validator;

    public RegisterCommandValidatorTests()
    {
        _validator = new RegisterCommandValidator();
    }

    [Fact]
    public void Validate_ShouldPass_WhenAllFieldsAreValid()
    {
        // Arrange
        var command = new RegisterCommand(
            "test@example.com",
            "validuser",
            "password123"
        );

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Validate_ShouldFail_WhenEmailIsNullOrEmpty(string email)
    {
        // Arrange
        var command = new RegisterCommand(email, "validuser", "password123");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Email)
            .WithErrorMessage("Email is required");
    }

    [Theory]
    [InlineData("invalid-email")]
    [InlineData("missing-at-sign.com")]
    [InlineData("@no-local-part.com")]
    [InlineData("no-domain@")]
    public void Validate_ShouldFail_WhenEmailFormatIsInvalid(string email)
    {
        // Arrange
        var command = new RegisterCommand(email, "validuser", "password123");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Email)
            .WithErrorMessage("Invalid email format");
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Validate_ShouldFail_WhenUsernameIsNullOrEmpty(string username)
    {
        // Arrange
        var command = new RegisterCommand("test@example.com", username, "password123");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Username)
            .WithErrorMessage("Username is required");
    }

    [Theory]
    [InlineData("ab")]
    [InlineData("a")]
    public void Validate_ShouldFail_WhenUsernameTooShort(string username)
    {
        // Arrange
        var command = new RegisterCommand("test@example.com", username, "password123");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Username)
            .WithErrorMessage("Username must be at least 3 characters");
    }

    [Fact]
    public void Validate_ShouldFail_WhenUsernameTooLong()
    {
        // Arrange
        var longUsername = new string('a', 51);
        var command = new RegisterCommand("test@example.com", longUsername, "password123");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Username)
            .WithErrorMessage("Username must not exceed 50 characters");
    }

    [Theory]
    [InlineData("has spaces")]
    [InlineData("has-dash")]
    [InlineData("has.dot")]
    [InlineData("has@at")]
    [InlineData("спец_символы")]
    public void Validate_ShouldFail_WhenUsernameContainsInvalidCharacters(string username)
    {
        // Arrange
        var command = new RegisterCommand("test@example.com", username, "password123");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Username)
            .WithErrorMessage("Username can only contain letters, numbers and underscores");
    }

    [Theory]
    [InlineData("valid_user")]
    [InlineData("User123")]
    [InlineData("test_123")]
    [InlineData("___")]
    public void Validate_ShouldPass_WhenUsernameContainsOnlyValidCharacters(string username)
    {
        // Arrange
        var command = new RegisterCommand("test@example.com", username, "password123");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Username);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Validate_ShouldFail_WhenPasswordIsNullOrEmpty(string password)
    {
        // Arrange
        var command = new RegisterCommand("test@example.com", "validuser", password);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Password)
            .WithErrorMessage("Password is required");
    }

    [Theory]
    [InlineData("12345")]
    [InlineData("abc")]
    [InlineData("a")]
    public void Validate_ShouldFail_WhenPasswordTooShort(string password)
    {
        // Arrange
        var command = new RegisterCommand("test@example.com", "validuser", password);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Password)
            .WithErrorMessage("Password must be at least 6 characters");
    }

    [Theory]
    [InlineData("123456")]
    [InlineData("password")]
    [InlineData("verylongpassword")]
    public void Validate_ShouldPass_WhenPasswordMeetsMinimumLength(string password)
    {
        // Arrange
        var command = new RegisterCommand("test@example.com", "validuser", password);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Password);
    }
}
