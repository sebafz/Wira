using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using Wira.Api.Data;
using Wira.Api.Models;

namespace Wira.Api.Tests.Helpers
{
    public static class TestDbContextHelper
    {
        public static WiraDbContext CreateInMemoryDbContext(string? databaseName = null)
        {
            var options = new DbContextOptionsBuilder<WiraDbContext>()
                .UseInMemoryDatabase(databaseName: databaseName ?? Guid.NewGuid().ToString())
                .Options;

            return new WiraDbContext(options);
        }

        public static async Task SeedTestDataAsync(WiraDbContext context)
        {
            // Limpiar datos existentes
            context.Usuarios.RemoveRange(context.Usuarios);
            context.Roles.RemoveRange(context.Roles);
            context.Mineras.RemoveRange(context.Mineras);
            context.Proveedores.RemoveRange(context.Proveedores);
            context.Rubros.RemoveRange(context.Rubros);
            context.Licitaciones.RemoveRange(context.Licitaciones);
            context.Propuestas.RemoveRange(context.Propuestas);
            await context.SaveChangesAsync();

            // Seed Roles
            var roles = new[]
            {
                new Rol { RolID = 1, NombreRol = "Admin" },
                new Rol { RolID = 2, NombreRol = "Minera" },
                new Rol { RolID = 3, NombreRol = "Proveedor" }
            };
            context.Roles.AddRange(roles);

            // Seed Rubros
            var rubros = new[]
            {
                new Rubro { RubroID = 1, Nombre = "Construcción" },
                new Rubro { RubroID = 2, Nombre = "Transporte" },
                new Rubro { RubroID = 3, Nombre = "Servicios" }
            };
            context.Rubros.AddRange(rubros);

            // Seed Mineras
            var mineras = new[]
            {
                new Minera 
                { 
                    MineraID = 1, 
                    Nombre = "Minera Test", 
                    CUIT = "20-12345678-9",
                    EmailContacto = "test@minera.com",
                    Activo = true
                }
            };
            context.Mineras.AddRange(mineras);

            // Seed Proveedores
            var proveedores = new[]
            {
                new Proveedor 
                { 
                    ProveedorID = 1, 
                    Nombre = "Proveedor Test", 
                    CUIT = "20-87654321-9",
                    RubroID = 1,
                    Activo = true
                }
            };
            context.Proveedores.AddRange(proveedores);

            // Seed Usuarios
            var usuarios = new[]
            {
                new Usuario 
                { 
                    UsuarioID = 1,
                    Nombre = "Admin Test",
                    Email = "admin@test.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Activo = true,
                    ValidadoEmail = true, // Usuarios verificados para tests
                    FechaRegistro = DateTime.UtcNow
                },
                new Usuario 
                { 
                    UsuarioID = 2,
                    Nombre = "Minera Test",
                    Email = "minera@test.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Activo = true,
                    ValidadoEmail = true, // Usuarios verificados para tests
                    MineraID = 1,
                    FechaRegistro = DateTime.UtcNow
                },
                new Usuario 
                { 
                    UsuarioID = 3,
                    Nombre = "Proveedor Test",
                    Email = "proveedor@test.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Activo = true,
                    ValidadoEmail = true, // Usuarios verificados para tests
                    ProveedorID = 1,
                    FechaRegistro = DateTime.UtcNow
                }
            };
            context.Usuarios.AddRange(usuarios);

            await context.SaveChangesAsync();

            // Seed UsuariosRoles
            var usuariosRoles = new[]
            {
                new UsuarioRol { UsuarioID = 1, RolID = 1 },
                new UsuarioRol { UsuarioID = 2, RolID = 2 },
                new UsuarioRol { UsuarioID = 3, RolID = 3 }
            };
            context.UsuariosRoles.AddRange(usuariosRoles);

            await context.SaveChangesAsync();
        }

        public static async Task<WiraDbContext> CreateSeededDbContextAsync(string? databaseName = null)
        {
            var context = CreateInMemoryDbContext(databaseName);
            await SeedTestDataAsync(context);
            return context;
        }
    }
}
