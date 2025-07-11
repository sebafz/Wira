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

            // Guardar cambios
            await context.SaveChangesAsync();
        }
    }
}
