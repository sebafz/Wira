using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Wira.Api.DTOs;
using Wira.Api.Models;
using Wira.Api.Services;
using Wira.Api.Services.Interfaces;
using Xunit;

namespace Wira.Api.Tests.Services
{
    public class AuthServiceTests : BaseTest
    {
        private readonly AuthService _authService;
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly Mock<ILogger<AuthService>> _mockLogger;

        public AuthServiceTests()
        {
            _mockEmailService = new Mock<IEmailService>();
            _mockLogger = CreateMockLogger<AuthService>();

            _authService = new AuthService(
                DbContext,
                Configuration,
                _mockLogger.Object,
                _mockEmailService.Object
            );
        }

        [Fact]
        public async Task LoginAsync_WithValidCredentials_ShouldReturnSuccessResponse()
        {
            // Arrange
            await SeedTestDataAsync();
            var loginRequest = new LoginRequest
            {
                Email = "minera@test.com",
                Password = "password123"
            };

            // Act
            var result = await _authService.LoginAsync(loginRequest);

            // Assert
            result.Should().NotBeNull();
            result.Success.Should().BeTrue();
            result.Token.Should().NotBeNullOrEmpty();
            result.User.Should().NotBeNull();
            result.User.Email.Should().Be(loginRequest.Email);
        }

        [Fact]
        public async Task LoginAsync_WithInvalidEmail_ShouldReturnFailureResponse()
        {
            // Arrange
            await SeedTestDataAsync();
            var loginRequest = new LoginRequest
            {
                Email = "nonexistent@test.com",
                Password = "password123"
            };

            // Act
            var result = await _authService.LoginAsync(loginRequest);

            // Assert
            result.Should().NotBeNull();
            result.Success.Should().BeFalse();
            result.Message.Should().Be("Email o contraseña incorrectos");
            result.Token.Should().BeNullOrEmpty();
            result.User.Should().BeNull();
        }

        [Fact]
        public async Task LoginAsync_WithInvalidPassword_ShouldReturnFailureResponse()
        {
            // Arrange
            await SeedTestDataAsync();
            var loginRequest = new LoginRequest
            {
                Email = "minera@test.com",
                Password = "wrongpassword"
            };

            // Act
            var result = await _authService.LoginAsync(loginRequest);

            // Assert
            result.Should().NotBeNull();
            result.Success.Should().BeFalse();
            result.Message.Should().Be("Email o contraseña incorrectos");
            result.Token.Should().BeNullOrEmpty();
            result.User.Should().BeNull();
        }

        [Fact]
        public async Task LoginAsync_WithInactiveUser_ShouldReturnFailureResponse()
        {
            // Arrange
            await SeedTestDataAsync();

            // Desactivar usuario
            var user = DbContext.Usuarios.First(u => u.Email == "minera@test.com");
            user.Activo = false;
            await DbContext.SaveChangesAsync();

            var loginRequest = new LoginRequest
            {
                Email = "minera@test.com",
                Password = "password123"
            };

            // Act
            var result = await _authService.LoginAsync(loginRequest);

            // Assert
            result.Should().NotBeNull();
            result.Success.Should().BeFalse();
            result.Message.Should().Be("La cuenta está desactivada");
            result.Token.Should().BeNullOrEmpty();
            result.User.Should().BeNull();
        }

        [Theory]
        [InlineData("minera@test.com")]
        [InlineData("proveedor@test.com")]
        [InlineData("admin@test.com")]
        public async Task LoginAsync_WithDifferentUserTypes_ShouldIncludeCorrectUserInfo(string email)
        {
            // Arrange
            await SeedTestDataAsync();
            var loginRequest = new LoginRequest
            {
                Email = email,
                Password = "password123"
            };

            // Act
            var result = await _authService.LoginAsync(loginRequest);

            // Assert
            result.Should().NotBeNull();
            result.Success.Should().BeTrue();
            result.User.Should().NotBeNull();
            result.User.Email.Should().Be(email);

            if (email.Contains("minera"))
            {
                result.User.Minera.Should().NotBeNull();
                result.User.Proveedor.Should().BeNull();
            }
            else if (email.Contains("proveedor"))
            {
                result.User.Proveedor.Should().NotBeNull();
                result.User.Minera.Should().BeNull();
            }
            else if (email.Contains("admin"))
            {
                result.User.Minera.Should().BeNull();
                result.User.Proveedor.Should().BeNull();
            }
        }

        [Fact]
        public async Task RegisterAsync_WithValidMineraData_ShouldCreateUserAndMinera()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Nombre = "Nueva Minera",
                Email = "nueva@minera.com",
                Password = "newpassword123",
                ConfirmPassword = "newpassword123",
                DNI = "41000001",
                TipoCuenta = "Minera"
            };

            // Act
            var result = await _authService.RegisterAsync(registerRequest);

            // Assert
            result.Should().NotBeNull();
            result.Success.Should().BeTrue();
            result.Message.Should().Contain("registrado exitosamente");

            // Verificar que se creó el usuario
            var createdUser = DbContext.Usuarios.FirstOrDefault(u => u.Email == registerRequest.Email);
            createdUser.Should().NotBeNull();
            createdUser!.Nombre.Should().Be(registerRequest.Nombre);
        }

        [Fact]
        public async Task RegisterAsync_WithValidProveedorData_ShouldCreateUserAndProveedor()
        {
            // Arrange
            await SeedTestDataAsync(); // Para tener rubros disponibles

            var registerRequest = new RegisterRequest
            {
                Nombre = "Nuevo Proveedor",
                Email = "nuevo@proveedor.com",
                Password = "newpassword123",
                ConfirmPassword = "newpassword123",
                DNI = "41000002",
                TipoCuenta = "Proveedor"
            };

            // Act
            var result = await _authService.RegisterAsync(registerRequest);

            // Assert
            result.Should().NotBeNull();
            result.Success.Should().BeTrue();
            result.Message.Should().Contain("registrado exitosamente");

            // Verificar que se creó el usuario
            var createdUser = DbContext.Usuarios.FirstOrDefault(u => u.Email == registerRequest.Email);
            createdUser.Should().NotBeNull();
            createdUser!.Nombre.Should().Be(registerRequest.Nombre);
        }

        [Fact]
        public async Task RegisterAsync_WithExistingEmail_ShouldReturnFailureResponse()
        {
            // Arrange
            await SeedTestDataAsync();

            var registerRequest = new RegisterRequest
            {
                Nombre = "Test User",
                Email = "minera@test.com", // Email ya existe
                Password = "password123",
                ConfirmPassword = "password123",
                DNI = "41000003",
                TipoCuenta = "Minera"
            };

            // Act
            var result = await _authService.RegisterAsync(registerRequest);

            // Assert
            result.Should().NotBeNull();
            result.Success.Should().BeFalse();
            result.Message.Should().Contain("ya está registrado");
        }

        [Fact]
        public void GenerateJwtToken_WithValidUser_ShouldReturnValidToken()
        {
            // Arrange
            var user = new UserInfo
            {
                UsuarioID = 1,
                Nombre = "Test User",
                Email = "test@test.com",
                Roles = new List<string> { RoleNames.MineraUsuario }
            };

            // Act
            var token = _authService.GenerateJwtToken(user);

            // Assert
            token.Should().NotBeNullOrEmpty();
            token.Split('.').Should().HaveCount(3); // JWT tiene 3 partes separadas por puntos
        }

        [Fact]
        public void GenerateEmailVerificationToken_ShouldReturnSixDigitToken()
        {
            // Act
            var token = _authService.GenerateEmailVerificationToken();

            // Assert
            token.Should().NotBeNullOrEmpty();
            token.Should().HaveLength(6);
            token.Should().MatchRegex(@"^\d{6}$"); // 6 dígitos
        }

        [Fact]
        public void GeneratePasswordResetToken_ShouldReturnNonEmptyToken()
        {
            // Act
            var token = _authService.GeneratePasswordResetToken();

            // Assert
            token.Should().NotBeNullOrEmpty();
            token.Length.Should().BeGreaterThan(10);
        }

        [Fact]
        public async Task ForgotPasswordAsync_WithValidEmail_ShouldSendEmailAndReturnSuccess()
        {
            // Arrange
            await SeedTestDataAsync();
            var request = new ForgotPasswordRequest
            {
                Email = "minera@test.com"
            };

            _mockEmailService
                .Setup(x => x.SendPasswordResetEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _authService.ForgotPasswordAsync(request);

            // Assert
            result.Should().NotBeNull();
            result.Success.Should().BeTrue();
            result.Message.Should().Contain("enviado");

            // Verificar que se llamó al servicio de email
            _mockEmailService.Verify(
                x => x.SendPasswordResetEmailAsync(
                    It.Is<string>(email => email == request.Email),
                    It.IsAny<string>(),
                    It.IsAny<string>()),
                Times.Once);
        }

        [Fact]
        public async Task ForgotPasswordAsync_WithInvalidEmail_ShouldReturnSuccessForSecurity()
        {
            // Arrange
            await SeedTestDataAsync();
            var request = new ForgotPasswordRequest
            {
                Email = "nonexistent@test.com"
            };

            // Act
            var result = await _authService.ForgotPasswordAsync(request);

            // Assert
            result.Should().NotBeNull();
            result.Success.Should().BeTrue(); // Por seguridad, siempre retorna true
            result.Message.Should().Contain("enlace de recuperación");

            // Verificar que NO se llamó al servicio de email (porque el usuario no existe)
            _mockEmailService.Verify(
                x => x.SendPasswordResetEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()),
                Times.Never);
        }
    }
}
