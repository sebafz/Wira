using FluentAssertions;
using System.Net;
using System.Text.Json;
using Wira.Api.DTOs;

namespace Wira.Api.Tests.Integration
{
    public class AuthIntegrationTests : IntegrationTestBase
    {
        [Fact]
        public async Task Login_WithValidCredentials_ShouldReturnTokenAndUserInfo()
        {
            // Arrange
            await SeedTestDataAsync();
            
            var loginRequest = new LoginRequest
            {
                Email = "admin@test.com",
                Password = "password123"
            };

            // Act
            var response = await PostAsJsonAsync("/api/auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            var loginResponse = JsonSerializer.Deserialize<AuthResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            loginResponse.Should().NotBeNull();
            loginResponse!.Success.Should().BeTrue();
            loginResponse.Token.Should().NotBeNullOrEmpty();
            loginResponse.User.Should().NotBeNull();
            loginResponse.User.Email.Should().Be("admin@test.com");
            loginResponse.User.Nombre.Should().Be("Admin Test");
        }

        [Fact]
        public async Task Login_WithInvalidCredentials_ShouldReturnUnauthorized()
        {
            // Arrange
            await SeedTestDataAsync();
            
            var loginRequest = new LoginRequest
            {
                Email = "admin@test.com",
                Password = "wrongpassword"
            };

            // Act
            var response = await PostAsJsonAsync("/api/auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task Login_WithNonExistentUser_ShouldReturnUnauthorized()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                Email = "nonexistent@test.com",
                Password = "password123"
            };

            // Act
            var response = await PostAsJsonAsync("/api/auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task Register_WithValidMineraData_ShouldCreateUserAndReturnSuccess()
        {
            // Arrange
            await SeedTestDataAsync();
            
            var registerRequest = new RegisterRequest
            {
                Nombre = "Nueva Minera Test",
                Email = "nuevaminera@test.com",
                Password = "password123",
                ConfirmPassword = "password123",
                TipoCuenta = "Minera"
            };

            // Act
            var response = await PostAsJsonAsync("/api/auth/register", registerRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            var registerResponse = JsonSerializer.Deserialize<AuthResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            registerResponse.Should().NotBeNull();
            registerResponse!.Success.Should().BeTrue();
            registerResponse.Message.Should().Contain("registrado exitosamente");
        }

        [Fact]
        public async Task Register_WithValidProveedorData_ShouldCreateUserAndReturnSuccess()
        {
            // Arrange
            await SeedTestDataAsync();
            
            var registerRequest = new RegisterRequest
            {
                Nombre = "Nuevo Proveedor Test",
                Email = "nuevoproveedor@test.com",
                Password = "password123",
                ConfirmPassword = "password123",
                TipoCuenta = "Proveedor"
            };

            // Act
            var response = await PostAsJsonAsync("/api/auth/register", registerRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            var registerResponse = JsonSerializer.Deserialize<AuthResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            registerResponse.Should().NotBeNull();
            registerResponse!.Success.Should().BeTrue();
            registerResponse.Message.Should().Contain("registrado exitosamente");
        }

        [Fact]
        public async Task Register_WithExistingEmail_ShouldReturnBadRequest()
        {
            // Arrange
            await SeedTestDataAsync();
            
            var registerRequest = new RegisterRequest
            {
                Nombre = "Usuario Duplicado",
                Email = "admin@test.com", // Email que ya existe
                Password = "password123",
                ConfirmPassword = "password123",
                TipoCuenta = "Minera"
            };

            // Act
            var response = await PostAsJsonAsync("/api/auth/register", registerRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Register_WithInvalidData_ShouldReturnBadRequest()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Nombre = "", // Nombre vacío
                Email = "invalid-email", // Email inválido
                Password = "123", // Password muy corto
                ConfirmPassword = "456", // No coincide
                TipoCuenta = "InvalidType" // Tipo inválido
            };

            // Act
            var response = await PostAsJsonAsync("/api/auth/register", registerRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task EndToEnd_RegisterLoginAndAccessProtectedEndpoint_ShouldWork()
        {
            // Arrange
            await SeedTestDataAsync();
            
            // Register a new user
            var registerRequest = new RegisterRequest
            {
                Nombre = "Test Integration User",
                Email = "integration@test.com",
                Password = "password123",
                ConfirmPassword = "password123",
                TipoCuenta = "Minera"
            };

            // Act 1 - Register
            var registerResponse = await PostAsJsonAsync("/api/auth/register", registerRequest);
            registerResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // Validate the user's email to allow login
            await ValidateUserEmailAsync("integration@test.com");

            // Act 2 - Login with the newly created user
            var loginRequest = new LoginRequest
            {
                Email = "integration@test.com",
                Password = "password123"
            };

            var loginResponse = await PostAsJsonAsync("/api/auth/login", loginRequest);
            loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var loginContent = await loginResponse.Content.ReadAsStringAsync();
            var loginResult = JsonSerializer.Deserialize<AuthResponse>(loginContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            loginResult.Should().NotBeNull();
            loginResult!.Token.Should().NotBeNullOrEmpty();

            // Act 3 - Access a protected endpoint with the token
            SetAuthorizationHeader(loginResult.Token);
            var protectedResponse = await Client.GetAsync("/api/auth/me");

            // Assert
            protectedResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // Cleanup
            ClearAuthorizationHeader();
        }

        [Fact]
        public async Task AccessProtectedEndpoint_WithoutToken_ShouldReturnUnauthorized()
        {
            // Arrange
            await SeedTestDataAsync();
            
            // Act
            var response = await Client.GetAsync("/api/auth/me");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task AccessProtectedEndpoint_WithInvalidToken_ShouldReturnUnauthorized()
        {
            // Arrange
            await SeedTestDataAsync();
            SetAuthorizationHeader("invalid-token");

            // Act
            var response = await Client.GetAsync("/api/auth/me");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // Cleanup
            ClearAuthorizationHeader();
        }
    }
}
