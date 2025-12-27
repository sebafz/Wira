using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Text.Json;
using Wira.Api.Data;
using Wira.Api.DTOs;
using Wira.Api.Models;

namespace Wira.Api.Tests.Integration
{
    public class SimpleAuthIntegrationTests : IClassFixture<TestWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly TestWebApplicationFactory _factory;

        public SimpleAuthIntegrationTests(TestWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
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
        public async Task Register_WithInvalidData_ShouldReturnBadRequest()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Nombre = "", // Nombre vacío
                Email = "invalid-email", // Email inválido
                Password = "123", // Password muy corto
                ConfirmPassword = "456", // No coincide
                DNI = "", // DNI inválido
                TipoCuenta = "InvalidType" // Tipo inválido
            };

            // Act
            var response = await PostAsJsonAsync("/api/auth/register", registerRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        private async Task<HttpResponseMessage> PostAsJsonAsync<T>(string requestUri, T data)
        {
            var json = JsonSerializer.Serialize(data);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            return await _client.PostAsync(requestUri, content);
        }
    }

    public class TestWebApplicationFactory : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureServices(services =>
            {
                // Remover todos los servicios relacionados con DbContext
                var dbContextDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<WiraDbContext>));
                if (dbContextDescriptor != null)
                {
                    services.Remove(dbContextDescriptor);
                }

                var dbContextInstanceDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(WiraDbContext));
                if (dbContextInstanceDescriptor != null)
                {
                    services.Remove(dbContextInstanceDescriptor);
                }

                // Remover otros descriptores de DbContext
                var descriptorsToRemove = services.Where(d =>
                    d.ServiceType.IsGenericType &&
                    d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>))
                    .ToList();

                foreach (var descriptor in descriptorsToRemove)
                {
                    services.Remove(descriptor);
                }

                // Agregar DbContext con InMemory database usando AddDbContext
                services.AddDbContext<WiraDbContext>(options =>
                {
                    options.UseInMemoryDatabase("TestDb");
                }, ServiceLifetime.Scoped);
            });
        }

        private static void SeedBasicData(WiraDbContext context)
        {
            // Agregar roles básicos
            var roles = new[]
            {
                new Rol { NombreRol = RoleNames.MineraAdministrador },
                new Rol { NombreRol = RoleNames.MineraUsuario },
                new Rol { NombreRol = RoleNames.ProveedorAdministrador },
                new Rol { NombreRol = RoleNames.ProveedorUsuario },
                new Rol { NombreRol = RoleNames.AdministradorSistema }
            };
            context.Roles.AddRange(roles);
            context.SaveChanges();
        }
    }
}
