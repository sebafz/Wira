using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Wira.Api.Data;
using Wira.Api.Models;

namespace Wira.Api.Tests.Integration
{
    public class IntegrationTestBase : IClassFixture<CustomWebApplicationFactory>
    {
        protected readonly HttpClient Client;
        protected readonly CustomWebApplicationFactory Factory;

        protected IntegrationTestBase()
        {
            Factory = new CustomWebApplicationFactory();
            Client = Factory.CreateClient();
        }

        protected async Task SeedTestDataAsync()
        {
            await Factory.SeedDataAsync();
        }

        protected async Task ValidateUserEmailAsync(string email)
        {
            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<WiraDbContext>();
            
            var user = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == email);
            if (user != null)
            {
                user.ValidadoEmail = true;
                await context.SaveChangesAsync();
            }
        }

        protected async Task<HttpResponseMessage> PostAsJsonAsync<T>(string requestUri, T data)
        {
            var json = System.Text.Json.JsonSerializer.Serialize(data);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            return await Client.PostAsync(requestUri, content);
        }

        protected async Task<HttpResponseMessage> PutAsJsonAsync<T>(string requestUri, T data)
        {
            var json = System.Text.Json.JsonSerializer.Serialize(data);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            return await Client.PutAsync(requestUri, content);
        }

        protected void SetAuthorizationHeader(string token)
        {
            Client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        }

        protected void ClearAuthorizationHeader()
        {
            Client.DefaultRequestHeaders.Authorization = null;
        }

        public void Dispose()
        {
            Client?.Dispose();
            Factory?.Dispose();
        }
    }

    public class CustomWebApplicationFactory : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");
            
            builder.ConfigureServices(services =>
            {
                // Remover TODOS los descriptores relacionados con Entity Framework
                var descriptorsToRemove = services.Where(d =>
                    d.ServiceType == typeof(WiraDbContext) ||
                    d.ServiceType == typeof(DbContextOptions<WiraDbContext>) ||
                    d.ServiceType == typeof(DbContextOptions) ||
                    d.ServiceType.Name.Contains("DbContext") ||
                    d.ImplementationType?.Name.Contains("SqlServer") == true ||
                    d.ServiceType.FullName?.Contains("SqlServer") == true ||
                    (d.ServiceType.IsGenericType && d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>))
                ).ToList();

                foreach (var descriptor in descriptorsToRemove)
                {
                    services.Remove(descriptor);
                }

                // Registrar un nuevo DbContext con InMemory
                services.AddDbContext<WiraDbContext>(options =>
                {
                    options.UseInMemoryDatabase("TestDb");
                });
            });
        }

        public async Task SeedDataAsync()
        {
            using var scope = Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<WiraDbContext>();
            
            try
            {
                // No llamar EnsureCreated ya que puede causar conflictos
                await SeedTestDataAsync(context);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error seeding test data: {ex.Message}");
                throw;
            }
        }

        private static async Task SeedTestDataAsync(WiraDbContext context)
        {
            // Verificar si ya hay datos para evitar duplicados
            if (await context.Usuarios.AnyAsync())
            {
                return;
            }

            // Add test roles
            var adminRole = new Rol { NombreRol = "Admin" };
            var mineraRole = new Rol { NombreRol = "Minera" };
            var proveedorRole = new Rol { NombreRol = "Proveedor" };
            
            context.Roles.AddRange(adminRole, mineraRole, proveedorRole);

            // Add test rubro
            var testRubro = new Rubro 
            { 
                Nombre = "Test Rubro",
                Activo = true
            };
            context.Rubros.Add(testRubro);

            // Add test minera
            var testMinera = new Minera
            {
                Nombre = "Test Minera",
                CUIT = "20-12345678-9",
                EmailContacto = "minera@test.com",
                Activo = true
            };
            context.Mineras.Add(testMinera);

            // Add test proveedor
            var testProveedor = new Proveedor
            {
                Nombre = "Test Proveedor",
                CUIT = "20-98765432-1",
                Activo = true,
                Rubro = testRubro
            };
            context.Proveedores.Add(testProveedor);

            await context.SaveChangesAsync();

            // Add test user
            var testUser = new Usuario
            {
                Email = "admin@test.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                Nombre = "Admin Test",
                ValidadoEmail = true,
                FechaRegistro = DateTime.UtcNow,
                Activo = true,
                Minera = testMinera
            };
            
            context.Usuarios.Add(testUser);
            await context.SaveChangesAsync();

            // Add user role
            var userRole = new UsuarioRol
            {
                UsuarioID = testUser.UsuarioID,
                RolID = adminRole.RolID
            };
            
            context.UsuariosRoles.Add(userRole);
            await context.SaveChangesAsync();
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                // Clean up resources
            }
            base.Dispose(disposing);
        }
    }
}
