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
                new Rol { Nombre = RoleNames.MineraAdministrador, Descripcion = "Minera administrador" },
                new Rol { Nombre = RoleNames.MineraUsuario, Descripcion = "Minera usuario" },
                new Rol { Nombre = RoleNames.ProveedorAdministrador, Descripcion = "Proveedor administrador" },
                new Rol { Nombre = RoleNames.ProveedorUsuario, Descripcion = "Proveedor usuario" },
                new Rol { Nombre = RoleNames.AdministradorSistema, Descripcion = "Administrador del sistema" }
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

            // Agregar empresas mineras de ejemplo
            var mineras = new[]
            {
                new Empresa { Nombre = "Borax Argentina", RazonSocial = "Borax Argentina SA", CUIT = "30-12345678-9", EmailContacto = "contacto@borax.com", Telefono = "+54 9 11 4000 0001", TipoEmpresa = EmpresaTipos.Minera, Activo = true, FechaAlta = DateTime.Now },
                new Empresa { Nombre = "Bajo de la Alumbrera", RazonSocial = "Bajo de la Alumbrera SA", CUIT = "30-87654321-2", EmailContacto = "info@bajoalumbrera.com", Telefono = "+54 9 11 4000 0002", TipoEmpresa = EmpresaTipos.Minera, Activo = true, FechaAlta = DateTime.Now },
                new Empresa { Nombre = "Cauchari-Olaroz", RazonSocial = "Cauchari-Olaroz SA", CUIT = "30-11223344-5", EmailContacto = "admin@cauchari-olaroz.com", Telefono = "+54 9 11 4000 0003", TipoEmpresa = EmpresaTipos.Minera, Activo = true, FechaAlta = DateTime.Now }
            };

            await context.Empresas.AddRangeAsync(mineras);

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
                new Empresa { Nombre = "Transportes del Norte", RazonSocial = "Transportes del Norte SA", CUIT = "30-55667788-1", RubroID = rubroTransporte.RubroID, TipoEmpresa = EmpresaTipos.Proveedor, Activo = true, Telefono = "+54 9 381 200 0001", FechaAlta = DateTime.Now },
                new Empresa { Nombre = "Equipos Mineros", RazonSocial = "Equipos Mineros SRL", CUIT = "30-99887766-4", RubroID = rubroEquipos.RubroID, TipoEmpresa = EmpresaTipos.Proveedor, Activo = true, Telefono = "+54 9 381 200 0002", FechaAlta = DateTime.Now },
                new Empresa { Nombre = "Servicios Técnicos Unidos", RazonSocial = "Servicios Técnicos Unidos SA", CUIT = "30-44556677-7", RubroID = rubroMantenimiento.RubroID, TipoEmpresa = EmpresaTipos.Proveedor, Activo = true, Telefono = "+54 9 381 200 0003", FechaAlta = DateTime.Now },
                new Empresa { Nombre = "Químicos Industriales", RazonSocial = "Químicos Industriales SA", CUIT = "30-33445566-9", RubroID = rubroQuimicos.RubroID, TipoEmpresa = EmpresaTipos.Proveedor, Activo = true, Telefono = "+54 9 381 200 0004", FechaAlta = DateTime.Now }
            };

            await context.Empresas.AddRangeAsync(proveedores);

            // Guardar cambios para obtener IDs de mineras y proveedores
            await context.SaveChangesAsync();

            // Obtener roles
            var rolMineraUsuario = await context.Roles.FirstAsync(r => r.Nombre == RoleNames.MineraUsuario);
            var rolProveedorUsuario = await context.Roles.FirstAsync(r => r.Nombre == RoleNames.ProveedorUsuario);
            var rolMineraAdministrador = await context.Roles.FirstAsync(r => r.Nombre == RoleNames.MineraAdministrador);
            var rolProveedorAdministrador = await context.Roles.FirstAsync(r => r.Nombre == RoleNames.ProveedorAdministrador);
            var rolAdministradorSistema = await context.Roles.FirstAsync(r => r.Nombre == RoleNames.AdministradorSistema);

            // Obtener primera minera y proveedor para asignar a usuarios
            var primeraMinera = await context.Empresas.FirstAsync(e => e.TipoEmpresa == EmpresaTipos.Minera);
            var primerProveedor = await context.Empresas.FirstAsync(e => e.TipoEmpresa == EmpresaTipos.Proveedor);

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
                    Apellido = "Demo",
                    DNI = "20000001",
                    Telefono = "+54 9 11 4000 1001",
                    Activo = true,
                    ValidadoEmail = true,
                    FechaBaja = null,
                    EmpresaID = primeraMinera.EmpresaID,
                    FechaRegistro = DateTime.Now
                },
                new Usuario
                {
                    Email = "proveedor@gmail.com",
                    PasswordHash = passwordHash,
                    Nombre = "Usuario Proveedor",
                    Apellido = "Demo",
                    DNI = "20000002",
                    Telefono = "+54 9 11 4000 2001",
                    Activo = true,
                    ValidadoEmail = true,
                    FechaBaja = null,
                    EmpresaID = primerProveedor.EmpresaID,
                    FechaRegistro = DateTime.Now
                },
                new Usuario
                {
                    Email = "admin@gmail.com",
                    PasswordHash = passwordHash,
                    Nombre = "Admin",
                    Apellido = "Principal",
                    DNI = "20000000",
                    Telefono = "+54 9 11 4000 0000",
                    Activo = true,
                    ValidadoEmail = true,
                    FechaBaja = null,
                    EmpresaID = null,
                    FechaRegistro = DateTime.Now
                },
                new Usuario
                {
                    Email = "mineraadmin@gmail.com",
                    PasswordHash = passwordHash,
                    Nombre = "Admin Minera",
                    Apellido = "Demo",
                    DNI = "20000003",
                    Telefono = "+54 9 11 4000 1002",
                    Activo = true,
                    ValidadoEmail = true,
                    FechaBaja = null,
                    EmpresaID = primeraMinera.EmpresaID,
                    FechaRegistro = DateTime.Now
                },
                new Usuario
                {
                    Email = "proveedoradmin@gmail.com",
                    PasswordHash = passwordHash,
                    Nombre = "Admin Proveedor",
                    Apellido = "Demo",
                    DNI = "20000004",
                    Telefono = "+54 9 11 4000 2002",
                    Activo = true,
                    ValidadoEmail = true,
                    FechaBaja = null,
                    EmpresaID = primerProveedor.EmpresaID,
                    FechaRegistro = DateTime.Now
                }
            };

            await context.Usuarios.AddRangeAsync(usuarios);
            await context.SaveChangesAsync();

            // Obtener IDs de usuarios recién creados
            var usuarioMinera = await context.Usuarios.FirstAsync(u => u.Email == "minera@gmail.com");
            var usuarioProveedor = await context.Usuarios.FirstAsync(u => u.Email == "proveedor@gmail.com");
            var usuarioAdminSistema = await context.Usuarios.FirstAsync(u => u.Email == "admin@gmail.com");
            var usuarioMineraAdmin = await context.Usuarios.FirstAsync(u => u.Email == "mineraadmin@gmail.com");
            var usuarioProveedorAdmin = await context.Usuarios.FirstAsync(u => u.Email == "proveedoradmin@gmail.com");

            // Asignar roles a usuarios
            var usuarioRoles = new[]
            {
                new UsuarioRol { UsuarioID = usuarioMinera.UsuarioID, RolID = rolMineraUsuario.RolID },
                new UsuarioRol { UsuarioID = usuarioProveedor.UsuarioID, RolID = rolProveedorUsuario.RolID },
                new UsuarioRol { UsuarioID = usuarioAdminSistema.UsuarioID, RolID = rolAdministradorSistema.RolID },
                new UsuarioRol { UsuarioID = usuarioMineraAdmin.UsuarioID, RolID = rolMineraAdministrador.RolID },
                new UsuarioRol { UsuarioID = usuarioProveedorAdmin.UsuarioID, RolID = rolProveedorAdministrador.RolID }
            };

            await context.UsuariosRoles.AddRangeAsync(usuarioRoles);

            // Agregar proyectos mineros de ejemplo para Borax Argentina
            var boraxMinera = await context.Empresas.FirstAsync(m => m.Nombre == "Borax Argentina" && m.TipoEmpresa == EmpresaTipos.Minera);

            var proyectosMineros = new[]
            {
                new ProyectoMinero
                {
                    MineraID = boraxMinera.EmpresaID,
                    Nombre = "Extracción Tinkal",
                    Ubicacion = "Salar del Hombre Muerto, Catamarca",
                    Descripcion = "Proyecto de extracción de boratos en la cuenca de Tincalayu, fase de expansión de operaciones existentes con nuevas tecnologías de extracción sostenible.",
                    Activo = true
                },
                new ProyectoMinero
                {
                    MineraID = boraxMinera.EmpresaID,
                    Nombre = "Planta de Refinado Norte",
                    Ubicacion = "Campo Quijano, Salta",
                    Descripcion = "Construcción de nueva planta de refinado de ácido bórico con tecnología de última generación para incrementar la capacidad de procesamiento.",
                    Activo = true
                },
                new ProyectoMinero
                {
                    MineraID = boraxMinera.EmpresaID,
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
