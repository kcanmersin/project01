using CineSocial.Application.Features.Auth.Queries.Login;
using FluentValidation.TestHelper;

namespace CineSocial.Tests.Application.Features.Auth.Queries;

public class LoginQueryValidatorTests
{
    private readonly LoginQueryValidator _validator;

    public LoginQueryValidatorTests()
    {
        _validator = new LoginQueryValidator();
    }

    [Fact]
    public void Validate_ShouldPass_WhenAllFieldsAreValid()
    {
        // Arrange
        var query = new LoginQuery("test@example.com", "password123");

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Validate_ShouldFail_WhenEmailIsNullOrEmpty(string emailOrUsername)
    {
        // Arrange
        var query = new LoginQuery(emailOrUsername, "password123");

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.EmailOrUsername);
            .WithErrorMessage("Email is required");
    }

    [Theory]
    [InlineData("invalid-email")]
    [InlineData("missing-at-sign.com")]
    public void Validate_ShouldFail_WhenEmailFormatIsInvalid(string emailOrUsername)
    {
        // Arrange
        var query = new LoginQuery(emailOrUsername, "password123");

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.EmailOrUsername);
            .WithErrorMessage("Invalid email format");
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Validate_ShouldFail_WhenPasswordIsNullOrEmpty(string password)
    {
        // Arrange
        var query = new LoginQuery("test@example.com", password);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Password)
            .WithErrorMessage("Password is required");
    }
}
