using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Wira.Api.Controllers;
using Wira.Api.DTOs;
using Wira.Api.Services.Interfaces;
using Xunit;

namespace Wira.Api.Tests.Controllers
{
    public class AuthControllerTests : BaseTest
    {
        private readonly AuthController _controller;
        private readonly Mock<IAuthService> _mockAuthService;

        public AuthControllerTests()
        {
            _mockAuthService = new Mock<IAuthService>();
            _controller = new AuthController(_mockAuthService.Object, DbContext);
        }

        [Fact]
        public async Task Login_WithValidRequest_ShouldReturnOkResult()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                Email = "test@test.com",
                Password = "password123"
            };

            var authResponse = new AuthResponse
            {
                Success = true,
                Token = "valid-jwt-token",
                User = new UserInfo
                {
                    UsuarioID = 1,
                    Email = "test@test.com",
                    Nombre = "Test User"
                }
            };

            _mockAuthService
                .Setup(x => x.LoginAsync(It.IsAny<LoginRequest>()))
                .ReturnsAsync(authResponse);

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult!.Value.Should().BeEquivalentTo(authResponse);

            _mockAuthService.Verify(x => x.LoginAsync(loginRequest), Times.Once);
        }

        [Fact]
        public async Task Login_WithInvalidCredentials_ShouldReturnUnauthorized()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                Email = "test@test.com",
                Password = "wrongpassword"
            };

            var authResponse = new AuthResponse
            {
                Success = false,
                Message = "Email o contraseña incorrectos"
            };

            _mockAuthService
                .Setup(x => x.LoginAsync(It.IsAny<LoginRequest>()))
                .ReturnsAsync(authResponse);

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            result.Should().BeOfType<UnauthorizedObjectResult>();
            var unauthorizedResult = result as UnauthorizedObjectResult;
            unauthorizedResult!.Value.Should().BeEquivalentTo(authResponse);
        }

        [Fact]
        public async Task Login_WithInvalidModelState_ShouldReturnBadRequest()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                Email = "", // Email requerido
                Password = "password123"
            };

            _controller.ModelState.AddModelError("Email", "El email es requerido");

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();

            // Verificar que no se llamó al servicio
            _mockAuthService.Verify(x => x.LoginAsync(It.IsAny<LoginRequest>()), Times.Never);
        }

        [Fact]
        public async Task Register_WithValidRequest_ShouldReturnOkResult()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Nombre = "New User",
                Email = "newuser@test.com",
                Password = "password123",
                ConfirmPassword = "password123",
                TipoCuenta = "Minera"
            };

            var authResponse = new AuthResponse
            {
                Success = true,
                Message = "Usuario registrado exitosamente"
            };

            _mockAuthService
                .Setup(x => x.RegisterAsync(It.IsAny<RegisterRequest>()))
                .ReturnsAsync(authResponse);

            // Act
            var result = await _controller.Register(registerRequest);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult!.Value.Should().BeEquivalentTo(authResponse);

            _mockAuthService.Verify(x => x.RegisterAsync(registerRequest), Times.Once);
        }

        [Fact]
        public async Task Register_WithExistingEmail_ShouldReturnBadRequest()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Nombre = "New User",
                Email = "existing@test.com",
                Password = "password123",
                ConfirmPassword = "password123",
                TipoCuenta = "Minera"
            };

            var authResponse = new AuthResponse
            {
                Success = false,
                Message = "El email ya está registrado"
            };

            _mockAuthService
                .Setup(x => x.RegisterAsync(It.IsAny<RegisterRequest>()))
                .ReturnsAsync(authResponse);

            // Act
            var result = await _controller.Register(registerRequest);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
            var badRequestResult = result as BadRequestObjectResult;
            badRequestResult!.Value.Should().BeEquivalentTo(authResponse);
        }

        [Fact]
        public async Task Register_WithInvalidModelState_ShouldReturnBadRequest()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Nombre = "",
                Email = "test@test.com",
                Password = "password123",
                ConfirmPassword = "password123",
                TipoCuenta = "Minera"
            };

            _controller.ModelState.AddModelError("Nombre", "El nombre es requerido");

            // Act
            var result = await _controller.Register(registerRequest);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();

            // Verificar que no se llamó al servicio
            _mockAuthService.Verify(x => x.RegisterAsync(It.IsAny<RegisterRequest>()), Times.Never);
        }

        [Fact]
        public async Task ForgotPassword_WithValidEmail_ShouldReturnOkResult()
        {
            // Arrange
            var request = new ForgotPasswordRequest
            {
                Email = "test@test.com"
            };

            var authResponse = new AuthResponse
            {
                Success = true,
                Message = "Email de recuperación enviado"
            };

            _mockAuthService
                .Setup(x => x.ForgotPasswordAsync(It.IsAny<ForgotPasswordRequest>()))
                .ReturnsAsync(authResponse);

            // Act
            var result = await _controller.ForgotPassword(request);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult!.Value.Should().BeEquivalentTo(authResponse);

            _mockAuthService.Verify(x => x.ForgotPasswordAsync(request), Times.Once);
        }

        [Fact]
        public async Task ForgotPassword_WithInvalidEmail_ShouldReturnOk()
        {
            // Arrange
            var request = new ForgotPasswordRequest
            {
                Email = "nonexistent@test.com"
            };

            var authResponse = new AuthResponse
            {
                Success = true,
                Message = "Si el email existe, se ha enviado un enlace de recuperación"
            };

            _mockAuthService
                .Setup(x => x.ForgotPasswordAsync(It.IsAny<ForgotPasswordRequest>()))
                .ReturnsAsync(authResponse);

            // Act
            var result = await _controller.ForgotPassword(request);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult!.Value.Should().BeEquivalentTo(authResponse);
        }

        [Fact]
        public async Task ResetPassword_WithValidToken_ShouldReturnOkResult()
        {
            // Arrange
            var request = new ResetPasswordRequest
            {
                Token = "valid-reset-token",
                NewPassword = "newpassword123"
            };

            var authResponse = new AuthResponse
            {
                Success = true,
                Message = "Contraseña restablecida exitosamente"
            };

            _mockAuthService
                .Setup(x => x.ResetPasswordAsync(It.IsAny<ResetPasswordRequest>()))
                .ReturnsAsync(authResponse);

            // Act
            var result = await _controller.ResetPassword(request);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult!.Value.Should().BeEquivalentTo(authResponse);

            _mockAuthService.Verify(x => x.ResetPasswordAsync(request), Times.Once);
        }

        [Fact]
        public async Task ResetPassword_WithInvalidToken_ShouldReturnBadRequest()
        {
            // Arrange
            var request = new ResetPasswordRequest
            {
                Token = "invalid-token",
                NewPassword = "newpassword123"
            };

            var authResponse = new AuthResponse
            {
                Success = false,
                Message = "Token inválido o expirado"
            };

            _mockAuthService
                .Setup(x => x.ResetPasswordAsync(It.IsAny<ResetPasswordRequest>()))
                .ReturnsAsync(authResponse);

            // Act
            var result = await _controller.ResetPassword(request);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
            var badRequestResult = result as BadRequestObjectResult;
            badRequestResult!.Value.Should().BeEquivalentTo(authResponse);
        }

        [Fact]
        public async Task VerifyEmail_WithValidToken_ShouldReturnOkResult()
        {
            // Arrange
            var request = new VerifyEmailRequest
            {
                Email = "test@test.com",
                Code = "123456"
            };

            var authResponse = new AuthResponse
            {
                Success = true,
                Message = "Email verificado exitosamente"
            };

            _mockAuthService
                .Setup(x => x.VerifyEmailAsync(It.IsAny<VerifyEmailRequest>()))
                .ReturnsAsync(authResponse);

            // Act
            var result = await _controller.VerifyEmail(request);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult!.Value.Should().BeEquivalentTo(authResponse);

            _mockAuthService.Verify(x => x.VerifyEmailAsync(request), Times.Once);
        }

        [Fact]
        public async Task ResendVerificationEmail_WithValidEmail_ShouldReturnOkResult()
        {
            // Arrange
            var request = new ResendVerificationRequest
            {
                Email = "test@test.com"
            };

            var authResponse = new AuthResponse
            {
                Success = true,
                Message = "Email de verificación reenviado"
            };

            _mockAuthService
                .Setup(x => x.ResendVerificationEmailAsync(It.IsAny<string>()))
                .ReturnsAsync(authResponse);

            // Act
            var result = await _controller.ResendVerificationEmail(request);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult!.Value.Should().BeEquivalentTo(authResponse);

            _mockAuthService.Verify(x => x.ResendVerificationEmailAsync(request.Email), Times.Once);
        }
    }
}
