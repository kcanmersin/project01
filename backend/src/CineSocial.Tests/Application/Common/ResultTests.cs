namespace CineSocial.Tests.Application.Common;

public class ResultTests
{
    [Fact]
    public void Success_ShouldCreateSuccessResultWithData()
    {
        // Arrange
        var testData = "test data";

        // Act
        var result = Result<string>.Success(testData);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().Be(testData);
        result.Error.Should().BeNull();
        result.StatusCode.Should().Be(200);
    }

    [Fact]
    public void Created_ShouldCreateSuccessResultWith201Status()
    {
        // Arrange
        var testData = 42;

        // Act
        var result = Result<int>.Created(testData);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().Be(testData);
        result.Error.Should().BeNull();
        result.StatusCode.Should().Be(201);
    }

    [Fact]
    public void Failure_ShouldCreateFailureResultWithDefaultStatus400()
    {
        // Arrange
        var errorMessage = "Operation failed";

        // Act
        var result = Result<string>.Failure(errorMessage);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Data.Should().BeNull();
        result.Error.Should().Be(errorMessage);
        result.StatusCode.Should().Be(400);
    }

    [Fact]
    public void Failure_ShouldCreateFailureResultWithCustomStatusCode()
    {
        // Arrange
        var errorMessage = "Server error";
        var statusCode = 503;

        // Act
        var result = Result<string>.Failure(errorMessage, statusCode);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Data.Should().BeNull();
        result.Error.Should().Be(errorMessage);
        result.StatusCode.Should().Be(statusCode);
    }

    [Fact]
    public void NotFound_ShouldCreateNotFoundResultWithDefaultMessage()
    {
        // Act
        var result = Result<string>.NotFound();

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Data.Should().BeNull();
        result.Error.Should().Be("Resource not found");
        result.StatusCode.Should().Be(404);
    }

    [Fact]
    public void NotFound_ShouldCreateNotFoundResultWithCustomMessage()
    {
        // Arrange
        var errorMessage = "User not found";

        // Act
        var result = Result<string>.NotFound(errorMessage);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Data.Should().BeNull();
        result.Error.Should().Be(errorMessage);
        result.StatusCode.Should().Be(404);
    }

    [Fact]
    public void BadRequest_ShouldCreateBadRequestResult()
    {
        // Arrange
        var errorMessage = "Invalid input";

        // Act
        var result = Result<string>.BadRequest(errorMessage);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Data.Should().BeNull();
        result.Error.Should().Be(errorMessage);
        result.StatusCode.Should().Be(400);
    }

    [Fact]
    public void ServerError_ShouldCreateServerErrorResultWithDefaultMessage()
    {
        // Act
        var result = Result<string>.ServerError();

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Data.Should().BeNull();
        result.Error.Should().Be("An unexpected error occurred");
        result.StatusCode.Should().Be(500);
    }

    [Fact]
    public void ServerError_ShouldCreateServerErrorResultWithCustomMessage()
    {
        // Arrange
        var errorMessage = "Database connection failed";

        // Act
        var result = Result<string>.ServerError(errorMessage);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Data.Should().BeNull();
        result.Error.Should().Be(errorMessage);
        result.StatusCode.Should().Be(500);
    }

    [Fact]
    public void Forbidden_ShouldCreateForbiddenResultWithDefaultMessage()
    {
        // Act
        var result = Result<string>.Forbidden();

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Data.Should().BeNull();
        result.Error.Should().Be("Access forbidden");
        result.StatusCode.Should().Be(403);
    }

    [Fact]
    public void Forbidden_ShouldCreateForbiddenResultWithCustomMessage()
    {
        // Arrange
        var errorMessage = "You don't have permission";

        // Act
        var result = Result<string>.Forbidden(errorMessage);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Data.Should().BeNull();
        result.Error.Should().Be(errorMessage);
        result.StatusCode.Should().Be(403);
    }

    // Non-generic Result tests
    [Fact]
    public void NonGenericSuccess_ShouldCreateSuccessResult()
    {
        // Act
        var result = Result.Success();

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Error.Should().BeNull();
        result.StatusCode.Should().Be(200);
    }

    [Fact]
    public void NoContent_ShouldCreateNoContentResult()
    {
        // Act
        var result = Result.NoContent();

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Error.Should().BeNull();
        result.StatusCode.Should().Be(204);
    }

    [Fact]
    public void NonGenericFailure_ShouldCreateFailureResult()
    {
        // Arrange
        var errorMessage = "Failed";

        // Act
        var result = Result.Failure(errorMessage);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be(errorMessage);
        result.StatusCode.Should().Be(400);
    }

    [Fact]
    public void NonGenericNotFound_ShouldCreateNotFoundResult()
    {
        // Act
        var result = Result.NotFound();

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Resource not found");
        result.StatusCode.Should().Be(404);
    }

    [Fact]
    public void NonGenericBadRequest_ShouldCreateBadRequestResult()
    {
        // Arrange
        var errorMessage = "Bad input";

        // Act
        var result = Result.BadRequest(errorMessage);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be(errorMessage);
        result.StatusCode.Should().Be(400);
    }

    [Fact]
    public void NonGenericForbidden_ShouldCreateForbiddenResult()
    {
        // Arrange
        var errorMessage = "Forbidden action";

        // Act
        var result = Result.Forbidden(errorMessage);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be(errorMessage);
        result.StatusCode.Should().Be(403);
    }
}
