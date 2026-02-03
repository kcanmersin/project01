using CineSocial.Application.Features.Auth.Commands.Register;
using CineSocial.Application.Interfaces;
using CineSocial.Tests.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CineSocial.Tests.Application.Features.Auth.Commands;

public class RegisterCommandHandlerTests : IDisposable
{
    private readonly DbContext _context;
    private readonly Mock<IPasswordHasher> _mockPasswordHasher;
    private readonly Mock<IJwtTokenService> _mockJwtService;
    private readonly Mock<IEmailVerificationService> _mockEmailVerificationService;
    private readonly Mock<IEmailService> _mockEmailService;
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly RegisterCommandHandler _handler;

    public RegisterCommandHandlerTests()
    {
        _context = TestDbContextFactory.CreateInMemoryContext();
        _mockPasswordHasher = new Mock<IPasswordHasher>();
        _mockJwtService = new Mock<IJwtTokenService>();
        _mockEmailVerificationService = new Mock<IEmailVerificationService>();
        _mockEmailService = new Mock<IEmailService>();
        _mockConfiguration = new Mock<IConfiguration>();

        // Setup default configuration
        _mockConfiguration.Setup(c => c["FRONTEND_URL"]).Returns("http://localhost:3000");

        _handler = new RegisterCommandHandler(
            _context,
            _mockPasswordHasher.Object,
            _mockJwtService.Object,
            _mockEmailVerificationService.Object,
            _mockEmailService.Object,
            _mockConfiguration.Object
        );
    }

    [Fact]
    public async Task Handle_ShouldCreateUserSuccessfully_WhenDataIsValid()
    {
        // Arrange
        var command = new RegisterCommand("test@example.com", "testuser", "password123");
        var hashedPassword = "hashed_password";
        var verificationToken = "verification_token";
        var jwtToken = "jwt_token";

        _mockPasswordHasher.Setup(x => x.Hash(command.Password)).Returns(hashedPassword);
        _mockEmailVerificationService
            .Setup(x => x.GenerateVerificationTokenAsync(It.IsAny<Guid>(), command.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(verificationToken);
        _mockJwtService.Setup(x => x.GenerateToken(It.IsAny<User>())).Returns(jwtToken);
        _mockEmailService
            .Setup(x => x.SendEmailVerificationAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Token.Should().Be(jwtToken);
        result.Data.User.Email.Should().Be(command.Email.ToLower().Trim());
        result.Data.User.Username.Should().Be(command.Username.Trim());
        result.Data.User.IsEmailVerified.Should().BeFalse();

        // Verify user was added to database
        var users = await _context.Set<User>().ToListAsync();
        users.Should().HaveCount(1);
        users[0].Email.Should().Be(command.Email.ToLower().Trim());
        users[0].PasswordHash.Should().Be(hashedPassword);

        // Verify mocks were called
        _mockPasswordHasher.Verify(x => x.Hash(command.Password), Times.Once);
        _mockJwtService.Verify(x => x.GenerateToken(It.IsAny<User>()), Times.Once);
        _mockEmailVerificationService.Verify(
            x => x.GenerateVerificationTokenAsync(It.IsAny<Guid>(), command.Email, It.IsAny<CancellationToken>()),
            Times.Once
        );
        _mockEmailService.Verify(
            x => x.SendEmailVerificationAsync(
                command.Email.ToLower().Trim(),
                command.Username.Trim(),
                It.Is<string>(link => link.Contains(verificationToken)),
                It.IsAny<CancellationToken>()
            ),
            Times.Once
        );
    }

    [Fact]
    public async Task Handle_ShouldReturnFailure_WhenEmailAlreadyExists()
    {
        // Arrange
        var existingEmail = "existing@example.com";
        await _context.Set<User>().AddAsync(new User
        {
            Id = Guid.NewGuid(),
            Email = existingEmail,
            Username = "existinguser",
            PasswordHash = "hash",
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        });
        await _context.SaveChangesAsync();

        var command = new RegisterCommand(existingEmail.ToUpper(), "newuser", "password123");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("email");
        result.StatusCode.Should().Be(400);

        // Verify no new user was created
        var users = await _context.Set<User>().ToListAsync();
        users.Should().HaveCount(1);
    }

    [Fact]
    public async Task Handle_ShouldReturnFailure_WhenUsernameAlreadyExists()
    {
        // Arrange
        var existingUsername = "existinguser";
        await _context.Set<User>().AddAsync(new User
        {
            Id = Guid.NewGuid(),
            Email = "existing@example.com",
            Username = existingUsername,
            PasswordHash = "hash",
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        });
        await _context.SaveChangesAsync();

        var command = new RegisterCommand("new@example.com", existingUsername.ToUpper(), "password123");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("kullanıcı adı");
        result.StatusCode.Should().Be(400);

        // Verify no new user was created
        var users = await _context.Set<User>().ToListAsync();
        users.Should().HaveCount(1);
    }

    [Fact]
    public async Task Handle_ShouldIgnoreDeletedUsers_WhenCheckingDuplicates()
    {
        // Arrange
        var deletedEmail = "deleted@example.com";
        await _context.Set<User>().AddAsync(new User
        {
            Id = Guid.NewGuid(),
            Email = deletedEmail,
            Username = "deleteduser",
            PasswordHash = "hash",
            CreatedAt = DateTime.UtcNow,
            IsDeleted = true  // Deleted user
        });
        await _context.SaveChangesAsync();

        var command = new RegisterCommand(deletedEmail, "newuser", "password123");

        _mockPasswordHasher.Setup(x => x.Hash(It.IsAny<string>())).Returns("hashed");
        _mockEmailVerificationService
            .Setup(x => x.GenerateVerificationTokenAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("token");
        _mockJwtService.Setup(x => x.GenerateToken(It.IsAny<User>())).Returns("jwt");
        _mockEmailService
            .Setup(x => x.SendEmailVerificationAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue(); // Should allow registration with deleted user's email
        var users = await _context.Set<User>().Where(u => !u.IsDeleted).ToListAsync();
        users.Should().HaveCount(1);
        users[0].Email.Should().Be(deletedEmail.ToLower());
    }

    [Fact]
    public async Task Handle_ShouldTrimAndLowercaseEmail()
    {
        // Arrange
        var command = new RegisterCommand("  TEST@EXAMPLE.COM  ", "testuser", "password123");

        _mockPasswordHasher.Setup(x => x.Hash(It.IsAny<string>())).Returns("hashed");
        _mockEmailVerificationService
            .Setup(x => x.GenerateVerificationTokenAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("token");
        _mockJwtService.Setup(x => x.GenerateToken(It.IsAny<User>())).Returns("jwt");
        _mockEmailService
            .Setup(x => x.SendEmailVerificationAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var user = await _context.Set<User>().FirstAsync();
        user.Email.Should().Be("test@example.com");
    }

    [Fact]
    public async Task Handle_ShouldTrimUsername()
    {
        // Arrange
        var command = new RegisterCommand("test@example.com", "  testuser  ", "password123");

        _mockPasswordHasher.Setup(x => x.Hash(It.IsAny<string>())).Returns("hashed");
        _mockEmailVerificationService
            .Setup(x => x.GenerateVerificationTokenAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("token");
        _mockJwtService.Setup(x => x.GenerateToken(It.IsAny<User>())).Returns("jwt");
        _mockEmailService
            .Setup(x => x.SendEmailVerificationAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var user = await _context.Set<User>().FirstAsync();
        user.Username.Should().Be("testuser");
    }

    public void Dispose()
    {
        _context?.Dispose();
    }
}
