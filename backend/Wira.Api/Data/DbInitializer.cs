using Microsoft.EntityFrameworkCore;
using Wira.Api.Models;

namespace Wira.Api.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(WiraDbContext context)
        {
            // Solo verificar conectividad, no crear la base de datos
            var canConnect = await context.Database.CanConnectAsync();
            if (!canConnect)
            {
                throw new InvalidOperationException("No se puede conectar a la base de datos");
            }

            // Verificar si ya hay datos
            if (await context.Roles.AnyAsync())
            {
                return; // La base de datos ya está inicializada
            }

            // Agregar roles iniciales
            var roles = new[]
            {
                new Rol { NombreRol = "Minera" },
                new Rol { NombreRol = "Proveedor" },
                new Rol { NombreRol = "Administrador" }
            };

            await context.Roles.AddRangeAsync(roles);

            // Agregar estados de licitación iniciales
            var estadosLicitacion = new[]
            {
                new EstadoLicitacion { NombreEstado = "Borrador" },
                new EstadoLicitacion { NombreEstado = "Publicada" },
                new EstadoLicitacion { NombreEstado = "En Evaluación" },
                new EstadoLicitacion { NombreEstado = "Adjudicada" },
                new EstadoLicitacion { NombreEstado = "Cancelada" },
                new EstadoLicitacion { NombreEstado = "Cerrada" }
            };

            await context.EstadosLicitacion.AddRangeAsync(estadosLicitacion);

            // Agregar estados de propuesta iniciales
            var estadosPropuesta = new[]
            {
                new EstadoPropuesta { NombreEstado = "Enviada" },
                new EstadoPropuesta { NombreEstado = "En Revisión" },
                new EstadoPropuesta { NombreEstado = "Aprobada" },
                new EstadoPropuesta { NombreEstado = "Rechazada" },
                new EstadoPropuesta { NombreEstado = "Adjudicada" }
            };

            await context.EstadosPropuesta.AddRangeAsync(estadosPropuesta);

            // Agregar mineras de ejemplo
            var mineras = new[]
            {
                new Minera { Nombre = "Borax Argentina", CUIT = "30-12345678-9", EmailContacto = "contacto@borax.com", Activo = true },
                new Minera { Nombre = "Bajo de la Alumbrera", CUIT = "30-87654321-2", EmailContacto = "info@bajoalumbrera.com", Activo = true },
                new Minera { Nombre = "Cauchari-Olaroz", CUIT = "30-11223344-5", EmailContacto = "admin@cauchari-olaroz.com", Activo = true }
            };

            await context.Mineras.AddRangeAsync(mineras);

            // Agregar proveedores de ejemplo
            var proveedores = new[]
            {
                new Proveedor { Nombre = "Transportes del Norte SA", CUIT = "30-55667788-1", Especialidad = "Transporte y Logística", Activo = true },
                new Proveedor { Nombre = "Equipos Mineros SRL", CUIT = "30-99887766-4", Especialidad = "Equipamiento Industrial", Activo = true },
                new Proveedor { Nombre = "Servicios Técnicos Unidos", CUIT = "30-44556677-7", Especialidad = "Mantenimiento y Reparaciones", Activo = true },
                new Proveedor { Nombre = "Químicos Industriales SA", CUIT = "30-33445566-9", Especialidad = "Reactivos Químicos", Activo = true }
            };

            await context.Proveedores.AddRangeAsync(proveedores);

            // Guardar cambios
            await context.SaveChangesAsync();
        }
    }
}
