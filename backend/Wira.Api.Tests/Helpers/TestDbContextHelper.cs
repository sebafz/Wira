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
            context.RespuestasCriteriosLicitacion.RemoveRange(context.RespuestasCriteriosLicitacion);
            context.ArchivosAdjuntos.RemoveRange(context.ArchivosAdjuntos);
            context.Propuestas.RemoveRange(context.Propuestas);
            context.Licitaciones.RemoveRange(context.Licitaciones);
            context.CriteriosOpcion.RemoveRange(context.CriteriosOpcion);
            context.CriteriosLicitacion.RemoveRange(context.CriteriosLicitacion);
            context.ProyectosMineros.RemoveRange(context.ProyectosMineros);
            context.Auditoria.RemoveRange(context.Auditoria);
            context.HistorialProveedorLicitacion.RemoveRange(context.HistorialProveedorLicitacion);
            context.NotificacionesUsuarios.RemoveRange(context.NotificacionesUsuarios);
            context.Notificaciones.RemoveRange(context.Notificaciones);
            context.CalificacionesPostLicitacion.RemoveRange(context.CalificacionesPostLicitacion);
            context.Usuarios.RemoveRange(context.Usuarios);
            context.UsuariosRoles.RemoveRange(context.UsuariosRoles);
            context.Roles.RemoveRange(context.Roles);
            context.Monedas.RemoveRange(context.Monedas);
            context.Empresas.RemoveRange(context.Empresas);
            context.Rubros.RemoveRange(context.Rubros);
            await context.SaveChangesAsync();

            var monedas = new[]
            {
                new Moneda { MonedaID = 1, Codigo = "ARS", Nombre = "Peso argentino", Simbolo = "$", Activo = true },
                new Moneda { MonedaID = 2, Codigo = "USD", Nombre = "Dólar estadounidense", Simbolo = "US$", Activo = true }
            };
            context.Monedas.AddRange(monedas);

            // Seed Roles
            var roles = new[]
            {
                new Rol { RolID = 1, Nombre = RoleNames.AdministradorSistema, Descripcion = "Administrador del sistema" },
                new Rol { RolID = 2, Nombre = RoleNames.MineraAdministrador, Descripcion = "Minera administrador" },
                new Rol { RolID = 3, Nombre = RoleNames.MineraUsuario, Descripcion = "Minera usuario" },
                new Rol { RolID = 4, Nombre = RoleNames.ProveedorAdministrador, Descripcion = "Proveedor administrador" },
                new Rol { RolID = 5, Nombre = RoleNames.ProveedorUsuario, Descripcion = "Proveedor usuario" }
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

            // Seed Empresas
            var empresas = new[]
            {
                new Empresa
                {
                    EmpresaID = 1,
                    Nombre = "Minera Test",
                    RazonSocial = "Minera Test SA",
                    CUIT = "20-12345678-9",
                    EmailContacto = "test@minera.com",
                    Telefono = "+54 9 11 4000 0006",
                    TipoEmpresa = EmpresaTipos.Minera,
                    Activo = true
                },
                new Empresa
                {
                    EmpresaID = 2,
                    Nombre = "Proveedor Test",
                    RazonSocial = "Proveedor Test SRL",
                    CUIT = "20-87654321-9",
                    RubroID = 1,
                    Telefono = "+54 9 381 200 0005",
                    TipoEmpresa = EmpresaTipos.Proveedor,
                    Activo = true
                }
            };
            context.Empresas.AddRange(empresas);

            // Seed Usuarios
            var usuarios = new[]
            {
                new Usuario
                {
                    UsuarioID = 1,
                    Nombre = "Admin Test",
                    Apellido = "Principal",
                    Email = "admin@test.com",
                    DNI = "30000001",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Activo = true,
                    ValidadoEmail = true, // Usuarios verificados para tests
                    Telefono = "+54 9 11 4000 0010",
                    FechaBaja = null,
                    FechaRegistro = DateTime.UtcNow
                },
                new Usuario
                {
                    UsuarioID = 2,
                    Nombre = "Minera Test",
                    Apellido = "User",
                    Email = "minera@test.com",
                    DNI = "30000002",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Activo = true,
                    ValidadoEmail = true, // Usuarios verificados para tests
                    Telefono = "+54 9 11 4000 0011",
                    FechaBaja = null,
                    EmpresaID = 1,
                    FechaRegistro = DateTime.UtcNow
                },
                new Usuario
                {
                    UsuarioID = 3,
                    Nombre = "Proveedor Test",
                    Apellido = "User",
                    Email = "proveedor@test.com",
                    DNI = "30000003",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Activo = true,
                    ValidadoEmail = true, // Usuarios verificados para tests
                    Telefono = "+54 9 11 4000 0012",
                    FechaBaja = null,
                    EmpresaID = 2,
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
                new UsuarioRol { UsuarioID = 3, RolID = 5 }
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
