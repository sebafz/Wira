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

            // Agregar rubros iniciales
            var rubros = new[]
            {
                new Rubro { Nombre = "Construcción e Infraestructura", Activo = true },
                new Rubro { Nombre = "Transporte y Logística", Activo = true },
                new Rubro { Nombre = "Equipos y Maquinarias", Activo = true },
                new Rubro { Nombre = "Servicios Profesionales", Activo = true },
                new Rubro { Nombre = "Suministros y Materiales", Activo = true },
                new Rubro { Nombre = "Mantenimiento y Reparaciones", Activo = true },
                new Rubro { Nombre = "Seguridad Industrial", Activo = true },
                new Rubro { Nombre = "Medio Ambiente y Sustentabilidad", Activo = true },
                new Rubro { Nombre = "Reactivos Químicos", Activo = true },
                new Rubro { Nombre = "Tecnología y Software", Activo = true }
            };

            await context.Rubros.AddRangeAsync(rubros);

            // Agregar mineras de ejemplo
            var mineras = new[]
            {
                new Minera { Nombre = "Borax Argentina", CUIT = "30-12345678-9", EmailContacto = "contacto@borax.com", Activo = true },
                new Minera { Nombre = "Bajo de la Alumbrera", CUIT = "30-87654321-2", EmailContacto = "info@bajoalumbrera.com", Activo = true },
                new Minera { Nombre = "Cauchari-Olaroz", CUIT = "30-11223344-5", EmailContacto = "admin@cauchari-olaroz.com", Activo = true }
            };

            await context.Mineras.AddRangeAsync(mineras);

            // Guardar cambios intermedios para obtener IDs
            await context.SaveChangesAsync();

            // Obtener IDs de rubros para asignar a proveedores
            var rubroTransporte = await context.Rubros.FirstAsync(r => r.Nombre == "Transporte y Logística");
            var rubroEquipos = await context.Rubros.FirstAsync(r => r.Nombre == "Equipos y Maquinarias");
            var rubroMantenimiento = await context.Rubros.FirstAsync(r => r.Nombre == "Mantenimiento y Reparaciones");
            var rubroQuimicos = await context.Rubros.FirstAsync(r => r.Nombre == "Reactivos Químicos");

            // Agregar proveedores de ejemplo con rubros asignados
            var proveedores = new[]
            {
                new Proveedor { Nombre = "Transportes del Norte SA", CUIT = "30-55667788-1", RubroID = rubroTransporte.RubroID, Activo = true },
                new Proveedor { Nombre = "Equipos Mineros SRL", CUIT = "30-99887766-4", RubroID = rubroEquipos.RubroID, Activo = true },
                new Proveedor { Nombre = "Servicios Técnicos Unidos", CUIT = "30-44556677-7", RubroID = rubroMantenimiento.RubroID, Activo = true },
                new Proveedor { Nombre = "Químicos Industriales SA", CUIT = "30-33445566-9", RubroID = rubroQuimicos.RubroID, Activo = true }
            };

            await context.Proveedores.AddRangeAsync(proveedores);

            // Guardar cambios para obtener IDs de mineras y proveedores
            await context.SaveChangesAsync();

            // Obtener roles
            var rolMinera = await context.Roles.FirstAsync(r => r.NombreRol == "Minera");
            var rolProveedor = await context.Roles.FirstAsync(r => r.NombreRol == "Proveedor");

            // Obtener primera minera y proveedor para asignar a usuarios
            var primeraMinera = await context.Mineras.FirstAsync();
            var primerProveedor = await context.Proveedores.FirstAsync();

            // Hash de la contraseña "123456"
            string passwordHash = BCrypt.Net.BCrypt.HashPassword("123456");

            // Agregar usuarios de ejemplo
            var usuarios = new[]
            {
                new Usuario 
                { 
                    Email = "minera@gmail.com", 
                    PasswordHash = passwordHash,
                    Nombre = "Usuario Minera", 
                    Activo = true, 
                    ValidadoEmail = true,
                    MineraID = primeraMinera.MineraID,
                    FechaRegistro = DateTime.Now
                },
                new Usuario 
                { 
                    Email = "proveedor@gmail.com", 
                    PasswordHash = passwordHash,
                    Nombre = "Usuario Proveedor", 
                    Activo = true, 
                    ValidadoEmail = true,
                    ProveedorID = primerProveedor.ProveedorID,
                    FechaRegistro = DateTime.Now
                }
            };

            await context.Usuarios.AddRangeAsync(usuarios);
            await context.SaveChangesAsync();

            // Obtener IDs de usuarios recién creados
            var usuarioMinera = await context.Usuarios.FirstAsync(u => u.Email == "minera@gmail.com");
            var usuarioProveedor = await context.Usuarios.FirstAsync(u => u.Email == "proveedor@gmail.com");

            // Asignar roles a usuarios
            var usuarioRoles = new[]
            {
                new UsuarioRol { UsuarioID = usuarioMinera.UsuarioID, RolID = rolMinera.RolID },
                new UsuarioRol { UsuarioID = usuarioProveedor.UsuarioID, RolID = rolProveedor.RolID }
            };

            await context.UsuariosRoles.AddRangeAsync(usuarioRoles);

            // Agregar proyectos mineros de ejemplo para Borax Argentina
            var boraxMinera = await context.Mineras.FirstAsync(m => m.Nombre == "Borax Argentina");

            var proyectosMineros = new[]
            {
                new ProyectoMinero 
                { 
                    MineraID = boraxMinera.MineraID,
                    Nombre = "Extracción Tinkal",
                    Ubicacion = "Salar del Hombre Muerto, Catamarca",
                    Descripcion = "Proyecto de extracción de boratos en la cuenca de Tincalayu, fase de expansión de operaciones existentes con nuevas tecnologías de extracción sostenible.",
                    Activo = true
                },
                new ProyectoMinero 
                { 
                    MineraID = boraxMinera.MineraID,
                    Nombre = "Planta de Refinado Norte",
                    Ubicacion = "Campo Quijano, Salta",
                    Descripcion = "Construcción de nueva planta de refinado de ácido bórico con tecnología de última generación para incrementar la capacidad de procesamiento.",
                    Activo = true
                },
                new ProyectoMinero 
                { 
                    MineraID = boraxMinera.MineraID,
                    Nombre = "Modernización Infraestructura",
                    Ubicacion = "Tincalayu, Catamarca",
                    Descripcion = "Actualización integral de sistemas de transporte interno, modernización de equipos de extracción y mejora de la infraestructura logística.",
                    Activo = true
                }
            };

            await context.ProyectosMineros.AddRangeAsync(proyectosMineros);

            // Guardar cambios
            await context.SaveChangesAsync();
        }
    }
}
