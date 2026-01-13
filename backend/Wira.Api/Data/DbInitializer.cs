using System;
using System.Collections.Generic;
using System.Linq;
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

            if (!await context.Monedas.AnyAsync())
            {
                var monedas = new[]
                {
                    new Moneda { Codigo = "ARS", Nombre = "Peso argentino", Simbolo = "$", Activo = true },
                    new Moneda { Codigo = "USD", Nombre = "Dólar estadounidense", Simbolo = "US$", Activo = true }
                };

                await context.Monedas.AddRangeAsync(monedas);
                await context.SaveChangesAsync();
            }

            // Verificar si ya hay datos
            if (await context.Roles.AnyAsync())
            {
                return; // La base de datos ya está inicializada
            }

            // Agregar roles iniciales
            var roles = new[]
            {
                new Rol { Nombre = RoleNames.MineraAdministrador, Descripcion = "Minera - Administrador" },
                new Rol { Nombre = RoleNames.MineraUsuario, Descripcion = "Minera - Usuario" },
                new Rol { Nombre = RoleNames.ProveedorAdministrador, Descripcion = "Proveedor - Administrador" },
                new Rol { Nombre = RoleNames.ProveedorUsuario, Descripcion = "Proveedor - Usuario" },
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
                new Rubro { Nombre = "Construcción e infraestructura", Activo = true },
                new Rubro { Nombre = "Transporte y logística", Activo = true },
                new Rubro { Nombre = "Equipos y maquinarias", Activo = true },
                new Rubro { Nombre = "Servicios profesionales", Activo = true },
                new Rubro { Nombre = "Suministros y materiales", Activo = true },
                new Rubro { Nombre = "Mantenimiento y reparaciones", Activo = true },
                new Rubro { Nombre = "Seguridad industrial", Activo = true },
                new Rubro { Nombre = "Medio ambiente y sustentabilidad", Activo = true },
                new Rubro { Nombre = "Reactivos químicos", Activo = true },
                new Rubro { Nombre = "Tecnología y software", Activo = true }
            };

            await context.Rubros.AddRangeAsync(rubros);

            // Agregar empresas mineras de ejemplo
            var mineras = new[]
            {
                new Empresa { Nombre = "Borax Argentina", RazonSocial = "Borax Argentina SA", CUIT = "30-12345678-9", EmailContacto = "contacto@borax.com", Telefono = "+54 9 387 3644 2301", TipoEmpresa = EmpresaTipos.Minera, Activo = true, FechaAlta = DateTime.UtcNow },
                new Empresa { Nombre = "Mansfield", RazonSocial = "Mansfield Minera SA", CUIT = "30-87654321-2", EmailContacto = "info@mansfield.com", Telefono = "+54 9 387 4001 0002", TipoEmpresa = EmpresaTipos.Minera, Activo = true, FechaAlta = DateTime.UtcNow },
                new Empresa { Nombre = "Posco", RazonSocial = "Posco Argentina SAU", CUIT = "30-11223344-5", EmailContacto = "contacto@posco.com", Telefono = "+54 9 387 4109 8553", TipoEmpresa = EmpresaTipos.Minera, Activo = true, FechaAlta = DateTime.UtcNow },
                new Empresa { Nombre = "Río Tinto", RazonSocial = "Río Tinto Argentina SAU", CUIT = "30-87659939-5", EmailContacto = "info@riotinto.com", Telefono = "+54 9 387 8799 2341", TipoEmpresa = EmpresaTipos.Minera, Activo = true, FechaAlta = DateTime.UtcNow },
                new Empresa { Nombre = "Exar", RazonSocial = "Exar S.A.", CUIT = "30-55664433-7", EmailContacto = "contacto@exar.com", Telefono = "+54 9 388 67823 5500", TipoEmpresa = EmpresaTipos.Minera, Activo = true, FechaAlta = DateTime.UtcNow }
            };

            await context.Empresas.AddRangeAsync(mineras);

            // Guardar cambios intermedios para obtener IDs
            await context.SaveChangesAsync();

            // Obtener IDs de rubros para asignar a proveedores
            var rubroTransporte = await context.Rubros.FirstAsync(r => r.Nombre == "Transporte y logística");
            var rubroEquipos = await context.Rubros.FirstAsync(r => r.Nombre == "Equipos y maquinarias");
            var rubroMantenimiento = await context.Rubros.FirstAsync(r => r.Nombre == "Mantenimiento y reparaciones");
            var rubroQuimicos = await context.Rubros.FirstAsync(r => r.Nombre == "Reactivos químicos");

            // Agregar proveedores de ejemplo con rubros asignados
            var proveedores = new[]
            {
                new Empresa { Nombre = "Transportes del Norte", RazonSocial = "Transportes del Norte SA", CUIT = "30-55667788-1", RubroID = rubroTransporte.RubroID, TipoEmpresa = EmpresaTipos.Proveedor, Activo = true, Telefono = "+54 9 387 200 0001", FechaAlta = DateTime.UtcNow },
                new Empresa { Nombre = "Equipos Mineros", RazonSocial = "Equipos Mineros SRL", CUIT = "30-99887766-4", RubroID = rubroEquipos.RubroID, TipoEmpresa = EmpresaTipos.Proveedor, Activo = true, Telefono = "+54 9 381 200 0002", FechaAlta = DateTime.UtcNow },
                new Empresa { Nombre = "Servicios Técnicos TekSla", RazonSocial = "Servicios Técnicos TekSla SA", CUIT = "30-44556677-7", RubroID = rubroMantenimiento.RubroID, TipoEmpresa = EmpresaTipos.Proveedor, Activo = true, Telefono = "+54 9 387 200 0003", FechaAlta = DateTime.UtcNow },
                new Empresa { Nombre = "Químicos Industriales", RazonSocial = "Químicos Industriales SA", CUIT = "30-33445566-9", RubroID = rubroQuimicos.RubroID, TipoEmpresa = EmpresaTipos.Proveedor, Activo = true, Telefono = "+54 9 387 200 0004", FechaAlta = DateTime.UtcNow },
                new Empresa { Nombre = "Servicios Puna SRL", RazonSocial = "Servicios Puna SRL", CUIT = "30-66778899-0", RubroID = rubroTransporte.RubroID, TipoEmpresa = EmpresaTipos.Proveedor, Activo = true, Telefono = "+54 9 388 200 0100", FechaAlta = DateTime.UtcNow }
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

            // Obtener empresas específicas para asignar a usuarios
            var mineraBorax = await context.Empresas.FirstAsync(e => e.Nombre == "Borax Argentina" && e.TipoEmpresa == EmpresaTipos.Minera);
            var mineraMansfield = await context.Empresas.FirstAsync(e => e.Nombre == "Mansfield" && e.TipoEmpresa == EmpresaTipos.Minera);
            var mineraPosco = await context.Empresas.FirstAsync(e => e.Nombre == "Posco" && e.TipoEmpresa == EmpresaTipos.Minera);
            var mineraRioTinto = await context.Empresas.FirstAsync(e => e.Nombre == "Río Tinto" && e.TipoEmpresa == EmpresaTipos.Minera);
            var mineraExar = await context.Empresas.FirstAsync(e => e.Nombre == "Exar" && e.TipoEmpresa == EmpresaTipos.Minera);
            var proveedorTransporte = await context.Empresas.FirstAsync(e => e.Nombre == "Transportes del Norte" && e.TipoEmpresa == EmpresaTipos.Proveedor);
            var proveedorEquipos = await context.Empresas.FirstAsync(e => e.Nombre == "Equipos Mineros" && e.TipoEmpresa == EmpresaTipos.Proveedor);
            var proveedorServiciosNorte = await context.Empresas.FirstAsync(e => e.Nombre == "Servicios Norte SRL" && e.TipoEmpresa == EmpresaTipos.Proveedor);

            // Hash de la contraseña "123456"
            string passwordHash = BCrypt.Net.BCrypt.HashPassword("123456");

            // Agregar usuarios de ejemplo
            var usuarios = new[]
            {
                new Usuario
                {
                    Email = "minera@borax.com",
                    PasswordHash = passwordHash,
                    Nombre = "Valeria",
                    Apellido = "Giménez",
                    DNI = "27841365",
                    Telefono = "+54 9 387 440 1020",
                    Activo = true,
                    ValidadoEmail = true,
                    FechaBaja = null,
                    EmpresaID = mineraBorax.EmpresaID,
                    FechaRegistro = DateTime.UtcNow,
                    EstadoAprobacion = AprobacionEstados.Aprobado,
                    FechaAprobacion = DateTime.UtcNow
                },
                new Usuario
                {
                    Email = "mineraadmin@borax.com",
                    PasswordHash = passwordHash,
                    Nombre = "Lucas",
                    Apellido = "Mansilla",
                    DNI = "24450982",
                    Telefono = "+54 9 387 480 3010",
                    Activo = true,
                    ValidadoEmail = true,
                    FechaBaja = null,
                    EmpresaID = mineraBorax.EmpresaID,
                    FechaRegistro = DateTime.UtcNow,
                    EstadoAprobacion = AprobacionEstados.Aprobado,
                    FechaAprobacion = DateTime.UtcNow
                },
                new Usuario
                {
                    Email = "admin@wira.com",
                    PasswordHash = passwordHash,
                    Nombre = "Martina",
                    Apellido = "Roldán",
                    DNI = "20998800",
                    Telefono = "+54 9 11 5200 8800",
                    Activo = true,
                    ValidadoEmail = true,
                    FechaBaja = null,
                    EmpresaID = null,
                    FechaRegistro = DateTime.UtcNow,
                    EstadoAprobacion = AprobacionEstados.Aprobado,
                    FechaAprobacion = DateTime.UtcNow
                },
                new Usuario
                {
                    Email = "proveedor@equiposmineros.com",
                    PasswordHash = passwordHash,
                    Nombre = "Jorge",
                    Apellido = "Figueroa",
                    DNI = "23876154",
                    Telefono = "+54 9 381 240 2005",
                    Activo = true,
                    ValidadoEmail = true,
                    FechaBaja = null,
                    EmpresaID = proveedorEquipos.EmpresaID,
                    FechaRegistro = DateTime.UtcNow,
                    EstadoAprobacion = AprobacionEstados.Aprobado,
                    FechaAprobacion = DateTime.UtcNow
                },
                new Usuario
                {
                    Email = "sofimont@equiposmineros.com",
                    PasswordHash = passwordHash,
                    Nombre = "Sofía",
                    Apellido = "Montenegro",
                    DNI = "26654012",
                    Telefono = "+54 9 387 245 3302",
                    Activo = true,
                    ValidadoEmail = true,
                    FechaBaja = null,
                    EmpresaID = proveedorEquipos.EmpresaID,
                    FechaRegistro = DateTime.UtcNow,
                    EstadoAprobacion = AprobacionEstados.Aprobado,
                    FechaAprobacion = DateTime.UtcNow
                }
                ,
                new Usuario
                {
                    Email = "fernandoruiz@exar.com",
                    PasswordHash = passwordHash,
                    Nombre = "Fernando",
                    Apellido = "Ruiz",
                    DNI = "29233455",
                    Telefono = "+54 9 387 600 1122",
                    Activo = true,
                    ValidadoEmail = true,
                    FechaBaja = null,
                    EmpresaID = mineraExar.EmpresaID,
                    FechaRegistro = DateTime.UtcNow,
                    EstadoAprobacion = AprobacionEstados.Aprobado,
                    FechaAprobacion = DateTime.UtcNow
                },
                new Usuario
                {
                    Email = "contacto@serviciosnorte.com",
                    PasswordHash = passwordHash,
                    Nombre = "Mariana",
                    Apellido = "Salas",
                    DNI = "28111222",
                    Telefono = "+54 9 381 600 2200",
                    Activo = true,
                    ValidadoEmail = true,
                    FechaBaja = null,
                    EmpresaID = proveedorServiciosNorte.EmpresaID,
                    FechaRegistro = DateTime.UtcNow,
                    EstadoAprobacion = AprobacionEstados.Aprobado,
                    FechaAprobacion = DateTime.UtcNow
                }
            };

            await context.Usuarios.AddRangeAsync(usuarios);
            await context.SaveChangesAsync();

            // Obtener IDs de usuarios recién creados
            var usuarioOperacionesBorax = await context.Usuarios.FirstAsync(u => u.Email == "minera@borax.com");
            var usuarioAdminBorax = await context.Usuarios.FirstAsync(u => u.Email == "mineraadmin@borax.com");
            var usuarioAdminSistema = await context.Usuarios.FirstAsync(u => u.Email == "admin@wira.com");
            var usuarioEquipos = await context.Usuarios.FirstAsync(u => u.Email == "proveedor@equiposmineros.com");
            var usuarioAdminEquipos = await context.Usuarios.FirstAsync(u => u.Email == "proveedoradmin@equiposmineros.com");
            var usuarioAndes = await context.Usuarios.FirstAsync(u => u.Email == "contacto@exar.com");
            var usuarioServiciosNorte = await context.Usuarios.FirstAsync(u => u.Email == "contacto@serviciosnorte.com");
            // Asignar roles a usuarios
            var usuarioRoles = new[]
            {
                new UsuarioRol { UsuarioID = usuarioOperacionesBorax.UsuarioID, RolID = rolMineraUsuario.RolID },
                new UsuarioRol { UsuarioID = usuarioAdminBorax.UsuarioID, RolID = rolMineraAdministrador.RolID },
                new UsuarioRol { UsuarioID = usuarioEquipos.UsuarioID, RolID = rolProveedorUsuario.RolID },
                new UsuarioRol { UsuarioID = usuarioAdminEquipos.UsuarioID, RolID = rolProveedorAdministrador.RolID },
                new UsuarioRol { UsuarioID = usuarioAdminSistema.UsuarioID, RolID = rolAdministradorSistema.RolID },
                new UsuarioRol { UsuarioID = usuarioAndes.UsuarioID, RolID = rolMineraUsuario.RolID },
                new UsuarioRol { UsuarioID = usuarioServiciosNorte.UsuarioID, RolID = rolProveedorUsuario.RolID }
            };

            await context.UsuariosRoles.AddRangeAsync(usuarioRoles);

            // Agregar proyectos mineros de ejemplo para Borax Argentina
            var proyectosMineros = new[]
            {
                new ProyectoMinero
                {
                    MineraID = mineraBorax.EmpresaID,
                    Nombre = "Extracción Tinkal",
                    Ubicacion = "Salar del Hombre Muerto, Catamarca",
                    Descripcion = "Proyecto de extracción de boratos en la cuenca de Tincalayu, fase de expansión de operaciones existentes con nuevas tecnologías de extracción sostenible.",
                    FechaInicio = DateTime.UtcNow.AddMonths(-18),
                    Activo = true
                },
                new ProyectoMinero
                {
                    MineraID = mineraBorax.EmpresaID,
                    Nombre = "Planta de Refinado Norte",
                    Ubicacion = "Campo Quijano, Salta",
                    Descripcion = "Construcción de nueva planta de refinado de ácido bórico con tecnología de última generación para incrementar la capacidad de procesamiento.",
                    FechaInicio = DateTime.UtcNow.AddMonths(-12),
                    Activo = true
                },
                new ProyectoMinero
                {
                    MineraID = mineraBorax.EmpresaID,
                    Nombre = "Modernización Infraestructura",
                    Ubicacion = "Tincalayu, Catamarca",
                    Descripcion = "Actualización integral de sistemas de transporte interno, modernización de equipos de extracción y mejora de la infraestructura logística.",
                    FechaInicio = DateTime.UtcNow.AddMonths(-9),
                    Activo = true
                }
                ,
                new ProyectoMinero
                {
                    MineraID = mineraMansfield.EmpresaID,
                    Nombre = "Expansión Pozo Norte",
                    Ubicacion = "Departamento La Poma, Salta",
                    Descripcion = "Ampliación y equipamiento del pozo norte para aumentar la capacidad de extracción, incluyendo instalación de plantas de bombeo y optimización de drenaje.",
                    FechaInicio = DateTime.UtcNow.AddMonths(-10),
                    Activo = true
                },
                new ProyectoMinero
                {
                    MineraID = mineraPosco.EmpresaID,
                    Nombre = "Ensayo Piloto de Lixiviación",
                    Ubicacion = "Provincia de San Juan",
                    Descripcion = "Proyecto piloto para evaluar técnicas de lixiviación en baja huella ambiental aplicadas a minerales secundarios. Incluye monitoreo ambiental y modelado hidrológico.",
                    FechaInicio = DateTime.UtcNow.AddMonths(-6),
                    Activo = true
                },
                new ProyectoMinero
                {
                    MineraID = mineraRioTinto.EmpresaID,
                    Nombre = "Rehabilitación y Cierre Ambiental",
                    Ubicacion = "Provincia de Neuquén",
                    Descripcion = "Plan integral de cierre y rehabilitación de frentes mineros, con revegetación, control de escorrentías y seguimiento de parámetros ambientales a 5 años.",
                    FechaInicio = DateTime.UtcNow.AddMonths(-3),
                    Activo = true
                }
            };

            await context.ProyectosMineros.AddRangeAsync(proyectosMineros);

            // Guardar cambios
            await context.SaveChangesAsync();

            // --- Seed: Licitaciones y criterios para Borax Argentina ---
            // Obtener estados, moneda y rubro
            var estadoBorrador = await context.EstadosLicitacion.FirstAsync(e => e.NombreEstado == "Borrador");
            var estadoPublicada = await context.EstadosLicitacion.FirstAsync(e => e.NombreEstado == "Publicada");
            var estadoEnEvaluacion = await context.EstadosLicitacion.FirstAsync(e => e.NombreEstado == "En Evaluación");
            var estadoAdjudicada = await context.EstadosLicitacion.FirstAsync(e => e.NombreEstado == "Adjudicada");
            var estadoCancelada = await context.EstadosLicitacion.FirstAsync(e => e.NombreEstado == "Cancelada");
            var estadoCerrada = await context.EstadosLicitacion.FirstAsync(e => e.NombreEstado == "Cerrada");

            var monedaARS = await context.Monedas.FirstAsync(m => m.Codigo == "ARS");
            var monedaUSD = await context.Monedas.FirstAsync(m => m.Codigo == "USD");

            var rubroQuimicosDb = await context.Rubros.FirstAsync(r => r.Nombre == "Reactivos químicos");

            // Proyecto asociado (usar el primero de Borax si existe)
            var proyectoBorax = await context.ProyectosMineros.FirstOrDefaultAsync(p => p.MineraID == mineraBorax.EmpresaID);

            var licitaciones = new[]
            {
                new Licitacion
                {
                    MineraID = mineraBorax.EmpresaID,
                    RubroID = rubroQuimicosDb.RubroID,
                    MonedaID = monedaARS.MonedaID,
                    Titulo = "Suministro de Borato Concentrado - Lote A",
                    Descripcion = "Compra de borato concentrado grado industrial. Entrega parcial en planta durante 3 meses.",
                    FechaInicio = DateTime.UtcNow.AddDays(-14),
                    FechaCierre = DateTime.UtcNow.AddDays(16),
                    PresupuestoEstimado = 750000m,
                    Condiciones = "Entrega CIF planta; garantía de 90 días; pago 30 días tras recepción.",
                    EstadoLicitacionID = estadoPublicada.EstadoLicitacionID,
                    ProyectoMineroID = proyectoBorax?.ProyectoMineroID
                },
                new Licitacion
                {
                    MineraID = mineraBorax.EmpresaID,
                    RubroID = rubroQuimicosDb.RubroID,
                    MonedaID = monedaUSD.MonedaID,
                    Titulo = "Suministro de Borato - Contrato Marco",
                    Descripcion = "Contrato marco por suministro anual con entregas programadas.",
                    FechaInicio = DateTime.UtcNow.AddDays(-30),
                    FechaCierre = DateTime.UtcNow.AddDays(60),
                    PresupuestoEstimado = 2500000m,
                    Condiciones = "Pagos trimestrales; seguimiento de calidad por laboratorio externo.",
                    EstadoLicitacionID = estadoEnEvaluacion.EstadoLicitacionID,
                    ProyectoMineroID = proyectoBorax?.ProyectoMineroID
                },
                new Licitacion
                {
                    MineraID = mineraBorax.EmpresaID,
                    RubroID = rubroQuimicosDb.RubroID,
                    MonedaID = monedaARS.MonedaID,
                    Titulo = "Transporte y Logística Boratos - Ruta Norte",
                    Descripcion = "Servicio de transporte terrestre desde mina a puerto de exportación.",
                    FechaInicio = DateTime.UtcNow.AddDays(-60),
                    FechaCierre = DateTime.UtcNow.AddDays(-15),
                    PresupuestoEstimado = 420000m,
                    Condiciones = "Camiones propios; seguro de carga obligatorio.",
                    EstadoLicitacionID = estadoAdjudicada.EstadoLicitacionID,
                    ProyectoMineroID = proyectoBorax?.ProyectoMineroID
                },
                new Licitacion
                {
                    MineraID = mineraBorax.EmpresaID,
                    RubroID = rubroQuimicosDb.RubroID,
                    MonedaID = monedaARS.MonedaID,
                    Titulo = "Servicio de Mantenimiento Planta Refinado",
                    Descripcion = "Contratación de servicio integral de mantenimiento predictivo y correctivo.",
                    FechaInicio = DateTime.UtcNow.AddDays(-7),
                    FechaCierre = DateTime.UtcNow.AddDays(21),
                    PresupuestoEstimado = 120000m,
                    Condiciones = "Equipo certificado; cronograma de trabajo aprobado por la minera.",
                    EstadoLicitacionID = estadoEnEvaluacion.EstadoLicitacionID,
                    ProyectoMineroID = proyectoBorax?.ProyectoMineroID
                },
                new Licitacion
                {
                    MineraID = mineraBorax.EmpresaID,
                    RubroID = rubroQuimicosDb.RubroID,
                    MonedaID = monedaUSD.MonedaID,
                    Titulo = "Estudio de Impacto Ambiental - Ampliación Planta",
                    Descripcion = "Consultoría para estudio de impacto ambiental previo a ampliación de capacidad.",
                    FechaInicio = DateTime.UtcNow.AddDays(-120),
                    FechaCierre = DateTime.UtcNow.AddDays(-90),
                    PresupuestoEstimado = 60000m,
                    Condiciones = "Informe final y mitigaciones obligatorias; equipo multidisciplinario.",
                    EstadoLicitacionID = estadoCancelada.EstadoLicitacionID,
                    ProyectoMineroID = proyectoBorax?.ProyectoMineroID
                },
                new Licitacion
                {
                    MineraID = mineraBorax.EmpresaID,
                    RubroID = rubroQuimicosDb.RubroID,
                    MonedaID = monedaARS.MonedaID,
                    Titulo = "Servicios de Gestión Ambiental Post-Cierre",
                    Descripcion = "Plan de manejo ambiental y monitoreo post-cierre para frentes desocupados.",
                    FechaInicio = DateTime.UtcNow.AddDays(-400),
                    FechaCierre = DateTime.UtcNow.AddDays(-300),
                    PresupuestoEstimado = 90000m,
                    Condiciones = "Periodo de seguimiento 3 años; entregables trimestrales.",
                    EstadoLicitacionID = estadoCerrada.EstadoLicitacionID,
                    ProyectoMineroID = proyectoBorax?.ProyectoMineroID
                }
            };

            await context.Licitaciones.AddRangeAsync(licitaciones);
            await context.SaveChangesAsync();

            // Crear criterios para cada licitación (ejemplos representativos)
            // Obtener licitaciones insertadas
            var licPublicada = await context.Licitaciones.FirstAsync(l => l.Titulo.Contains("Lote A"));
            var licEnEvaluacion = await context.Licitaciones.FirstAsync(l => l.Titulo.Contains("Contrato Marco"));
            var licAdjudicada = await context.Licitaciones.FirstAsync(l => l.Titulo.Contains("Transporte"));
            var licBorrador = await context.Licitaciones.FirstAsync(l => l.Titulo.Contains("Mantenimiento Planta"));
            var licCancelada = await context.Licitaciones.FirstAsync(l => l.Titulo.Contains("Impacto Ambiental"));
            var licCerrada = await context.Licitaciones.FirstAsync(l => l.Titulo.Contains("Post-Cierre"));

            var criterios = new List<CriterioLicitacion>();

            // Criterios para Lote A (publicada)
            criterios.Add(new CriterioLicitacion
            {
                LicitacionID = licPublicada.LicitacionID,
                Nombre = "Precio por tonelada",
                Descripcion = "Precio ofertado por tonelada de borato.",
                Peso = 50m,
                Tipo = TipoCriterio.Numerico,
                EsPuntuable = true,
                MayorMejor = false,
                ValorMinimo = 0m,
                ValorMaximo = 100000m
            });

            criterios.Add(new CriterioLicitacion
            {
                LicitacionID = licPublicada.LicitacionID,
                Nombre = "Plazo de entrega promedio (días)",
                Descripcion = "Tiempo estimado promedio de entrega desde orden.",
                Peso = 20m,
                Tipo = TipoCriterio.Numerico,
                EsPuntuable = true,
                MayorMejor = false,
                ValorMinimo = 1m,
                ValorMaximo = 180m
            });

            criterios.Add(new CriterioLicitacion
            {
                LicitacionID = licPublicada.LicitacionID,
                Nombre = "Certificaciones de calidad",
                Descripcion = "Presentar certificaciones ISO 9001 o equivalentes.",
                Peso = 15m,
                Tipo = TipoCriterio.Booleano,
                EsPuntuable = true,
                ValorRequeridoBooleano = true
            });

            criterios.Add(new CriterioLicitacion
            {
                LicitacionID = licPublicada.LicitacionID,
                Nombre = "Evaluación técnica",
                Descripcion = "Análisis cualitativo de la propuesta técnica.",
                Peso = 15m,
                Tipo = TipoCriterio.Escala,
                EsPuntuable = true
            });

            // Criterios para Contrato Marco (en evaluación)
            criterios.Add(new CriterioLicitacion
            {
                LicitacionID = licEnEvaluacion.LicitacionID,
                Nombre = "Oferta económica anual (USD)",
                Descripcion = "Valor total anual estimado en USD.",
                Peso = 60m,
                Tipo = TipoCriterio.Numerico,
                EsPuntuable = true,
                MayorMejor = false
            });

            criterios.Add(new CriterioLicitacion
            {
                LicitacionID = licEnEvaluacion.LicitacionID,
                Nombre = "Capacidad de suministro (t/mes)",
                Descripcion = "Capacidad máxima mensual ofrecida.",
                Peso = 25m,
                Tipo = TipoCriterio.Numerico,
                EsPuntuable = true,
                MayorMejor = true
            });

            criterios.Add(new CriterioLicitacion
            {
                LicitacionID = licEnEvaluacion.LicitacionID,
                Nombre = "Experiencia en contratos marco",
                Descripcion = "Años de experiencia manejando contratos marco similares.",
                Peso = 15m,
                Tipo = TipoCriterio.Numerico,
                EsPuntuable = true,
                MayorMejor = true
            });

            // Criterios para Transporte (adjudicada)
            criterios.Add(new CriterioLicitacion
            {
                LicitacionID = licAdjudicada.LicitacionID,
                Nombre = "Costo por viaje",
                Descripcion = "Costo promedio por viaje completo.",
                Peso = 50m,
                Tipo = TipoCriterio.Numerico,
                EsPuntuable = true,
                MayorMejor = false
            });

            criterios.Add(new CriterioLicitacion
            {
                LicitacionID = licAdjudicada.LicitacionID,
                Nombre = "Flota disponible",
                Descripcion = "Cantidad de camiones dedicados al servicio.",
                Peso = 30m,
                Tipo = TipoCriterio.Numerico,
                EsPuntuable = true,
                MayorMejor = true
            });

            criterios.Add(new CriterioLicitacion
            {
                LicitacionID = licAdjudicada.LicitacionID,
                Nombre = "Seguros y cumplimiento legal",
                Descripcion = "Certificados de seguro y cumplimiento normativo.",
                Peso = 20m,
                Tipo = TipoCriterio.Booleano,
                EsPuntuable = true,
                ValorRequeridoBooleano = true
            });

            // Criterios para Mantenimiento (borrador)
            criterios.Add(new CriterioLicitacion
            {
                LicitacionID = licBorrador.LicitacionID,
                Nombre = "Plan de trabajo propuesto",
                Descripcion = "Descripción del plan de mantenimiento.",
                Peso = 50m,
                Tipo = TipoCriterio.Descriptivo,
                EsPuntuable = false
            });

            criterios.Add(new CriterioLicitacion
            {
                LicitacionID = licBorrador.LicitacionID,
                Nombre = "Certificaciones del personal",
                Descripcion = "Certificados y habilitaciones del equipo técnico.",
                Peso = 50m,
                Tipo = TipoCriterio.Booleano,
                EsPuntuable = true,
                ValorRequeridoBooleano = true
            });

            // Criterios para Impacto Ambiental (cancelada) y Post-Cierre (cerrada)
            criterios.Add(new CriterioLicitacion
            {
                LicitacionID = licCancelada.LicitacionID,
                Nombre = "Metodología propuesta",
                Descripcion = "Rigor metodológico y plan de muestreo.",
                Peso = 70m,
                Tipo = TipoCriterio.Descriptivo,
                EsPuntuable = false
            });

            criterios.Add(new CriterioLicitacion
            {
                LicitacionID = licCerrada.LicitacionID,
                Nombre = "Equipo y experiencia",
                Descripcion = "Experiencia en programas post-cierre similares.",
                Peso = 100m,
                Tipo = TipoCriterio.Numerico,
                EsPuntuable = true,
                MayorMejor = true
            });

            await context.CriteriosLicitacion.AddRangeAsync(criterios);
            await context.SaveChangesAsync();

            // Crear opciones para criterios de escala (solo el criterio de evaluación técnica)
            var criterioEscala = await context.CriteriosLicitacion.FirstAsync(c => c.LicitacionID == licPublicada.LicitacionID && c.Tipo == TipoCriterio.Escala);

            var opcionesEscala = new[]
            {
                new CriterioOpcion { CriterioID = criterioEscala.CriterioID, Valor = "Excelente", Descripcion = "Propuesta técnica sobresaliente", Puntaje = 100m, Orden = 1 },
                new CriterioOpcion { CriterioID = criterioEscala.CriterioID, Valor = "Bueno", Descripcion = "Propuesta técnica adecuada", Puntaje = 75m, Orden = 2 },
                new CriterioOpcion { CriterioID = criterioEscala.CriterioID, Valor = "Regular", Descripcion = "Propuesta técnica con observaciones", Puntaje = 50m, Orden = 3 },
                new CriterioOpcion { CriterioID = criterioEscala.CriterioID, Valor = "Insuficiente", Descripcion = "Propuesta técnica deficiente", Puntaje = 0m, Orden = 4 }
            };

            await context.CriteriosOpciones.AddRangeAsync(opcionesEscala);
            await context.SaveChangesAsync();

            // --- Crear propuestas por licitación y respuestas a criterios ---
            var proveedorTekSla = await context.Empresas.FirstAsync(e => e.Nombre == "Servicios Técnicos TekSla");
            var proveedorQuimicos = await context.Empresas.FirstAsync(e => e.Nombre == "Químicos Industriales");

            var estadoPropEnviada = await context.EstadosPropuesta.FirstAsync(e => e.NombreEstado == "Enviada");
            var estadoPropEnRevision = await context.EstadosPropuesta.FirstAsync(e => e.NombreEstado == "En Revisión");
            var estadoPropAdjudicada = await context.EstadosPropuesta.FirstAsync(e => e.NombreEstado == "Adjudicada");

            var propuestas = new List<Propuesta>
            {
                // Lote A (publicada) - Borax + Químicos Industriales
                new Propuesta { LicitacionID = licPublicada.LicitacionID, ProveedorID = mineraBorax.EmpresaID, PresupuestoOfrecido = 720000m, MonedaID = monedaARS.MonedaID, EstadoPropuestaID = estadoPropEnviada.EstadoPropuestaID, Descripcion = "Oferta preferencial de Borax (internal)." },
                new Propuesta { LicitacionID = licPublicada.LicitacionID, ProveedorID = proveedorQuimicos.EmpresaID, PresupuestoOfrecido = 760000m, MonedaID = monedaARS.MonedaID, EstadoPropuestaID = estadoPropEnviada.EstadoPropuestaID, Descripcion = "Oferta desde Químicos Industriales." },

                // Contrato Marco (en evaluación) - Borax + Equipos Mineros
                new Propuesta { LicitacionID = licEnEvaluacion.LicitacionID, ProveedorID = mineraBorax.EmpresaID, PresupuestoOfrecido = 2400000m, MonedaID = monedaUSD.MonedaID, EstadoPropuestaID = estadoPropEnRevision.EstadoPropuestaID, Descripcion = "Propuesta marco con capacidad de suministro anual." },
                new Propuesta { LicitacionID = licEnEvaluacion.LicitacionID, ProveedorID = proveedorEquipos.EmpresaID, PresupuestoOfrecido = 2550000m, MonedaID = monedaUSD.MonedaID, EstadoPropuestaID = estadoPropEnRevision.EstadoPropuestaID, Descripcion = "Propuesta alternativa desde Equipos Mineros." },

                // Transporte (adjudicada) - Transportes del Norte (adjudicada) + Borax
                new Propuesta { LicitacionID = licAdjudicada.LicitacionID, ProveedorID = proveedorTransporte.EmpresaID, PresupuestoOfrecido = 400000m, MonedaID = monedaARS.MonedaID, EstadoPropuestaID = estadoPropAdjudicada.EstadoPropuestaID, Descripcion = "Oferta servicio transporte - adjudicada." },
                new Propuesta { LicitacionID = licAdjudicada.LicitacionID, ProveedorID = mineraBorax.EmpresaID, PresupuestoOfrecido = 420000m, MonedaID = monedaARS.MonedaID, EstadoPropuestaID = estadoPropEnviada.EstadoPropuestaID, Descripcion = "Propuesta interna de Borax (registro de prueba)." },

                // Mantenimiento (en evaluación) - TekSla + Borax
                new Propuesta { LicitacionID = licBorrador.LicitacionID, ProveedorID = proveedorTekSla.EmpresaID, PresupuestoOfrecido = 115000m, MonedaID = monedaARS.MonedaID, EstadoPropuestaID = estadoPropEnviada.EstadoPropuestaID, Descripcion = "Propuesta mantenimiento por TekSla." },
                new Propuesta { LicitacionID = licBorrador.LicitacionID, ProveedorID = mineraBorax.EmpresaID, PresupuestoOfrecido = 120000m, MonedaID = monedaARS.MonedaID, EstadoPropuestaID = estadoPropEnviada.EstadoPropuestaID, Descripcion = "Propuesta interna de Borax (control de calidad)." },

                // Impacto Ambiental (cancelada) - TekSla
                new Propuesta { LicitacionID = licCancelada.LicitacionID, ProveedorID = proveedorTekSla.EmpresaID, PresupuestoOfrecido = 58000m, MonedaID = monedaUSD.MonedaID, EstadoPropuestaID = estadoPropEnviada.EstadoPropuestaID, Descripcion = "Estudio completo con mitigaciones." },

                // Post-Cierre (cerrada) - Borax (por registro histórico)
                new Propuesta { LicitacionID = licCerrada.LicitacionID, ProveedorID = mineraBorax.EmpresaID, PresupuestoOfrecido = 88000m, MonedaID = monedaARS.MonedaID, EstadoPropuestaID = estadoPropEnviada.EstadoPropuestaID, Descripcion = "Propuesta histórica (registro)." }
            };

            await context.Propuestas.AddRangeAsync(propuestas);
            await context.SaveChangesAsync();

            // Crear respuestas por criterio para cada propuesta asegurando cobertura completa
            var propuestasConLicitacion = await context.Propuestas
                .Include(p => p.Licitacion)
                .ToListAsync();

            var todosLosCriterios = await context.CriteriosLicitacion.ToListAsync();
            var criteriosPorLicitacion = todosLosCriterios
                .GroupBy(c => c.LicitacionID)
                .ToDictionary(g => g.Key, g => g.ToList());

            var opcionesPorCriterio = (await context.CriteriosOpciones.ToListAsync())
                .GroupBy(o => o.CriterioID)
                .ToDictionary(g => g.Key, g => g.OrderBy(o => o.Orden).ToList());

            var respuestasExistentes = (await context.RespuestasCriteriosLicitacion
                    .Select(r => new { r.PropuestaID, r.CriterioID })
                    .ToListAsync())
                .Select(rc => $"{rc.PropuestaID}:{rc.CriterioID}")
                .ToHashSet();

            RespuestaCriterioLicitacion CrearRespuesta(Propuesta propuesta, CriterioLicitacion criterio, bool esProveedorInterno)
            {
                var respuesta = new RespuestaCriterioLicitacion
                {
                    PropuestaID = propuesta.PropuestaID,
                    CriterioID = criterio.CriterioID
                };

                var nombre = (criterio.Nombre ?? string.Empty).ToLowerInvariant();

                switch (criterio.Tipo)
                {
                    case TipoCriterio.Numerico:
                        if (nombre.Contains("precio") || nombre.Contains("oferta"))
                        {
                            respuesta.ValorNumerico = propuesta.PresupuestoOfrecido;
                        }
                        else if (nombre.Contains("plazo"))
                        {
                            respuesta.ValorNumerico = esProveedorInterno ? 30m : 45m;
                        }
                        else if (nombre.Contains("capacidad") || nombre.Contains("flota"))
                        {
                            respuesta.ValorNumerico = esProveedorInterno ? 500m : 150m;
                        }
                        else if (nombre.Contains("experiencia"))
                        {
                            respuesta.ValorNumerico = esProveedorInterno ? 8m : 2m;
                        }
                        else
                        {
                            respuesta.ValorNumerico = esProveedorInterno ? 5m : 3m;
                        }
                        break;
                    case TipoCriterio.Booleano:
                        respuesta.ValorBooleano = criterio.ValorRequeridoBooleano ?? esProveedorInterno;
                        break;
                    case TipoCriterio.Descriptivo:
                        respuesta.ValorProveedor = esProveedorInterno
                            ? "Plan detallado con cronograma y recursos asignados."
                            : "Propuesta técnica con alcance y entregables.";
                        break;
                    case TipoCriterio.Escala:
                        if (opcionesPorCriterio.TryGetValue(criterio.CriterioID, out var opciones) && opciones.Count > 0)
                        {
                            var opcion = opciones.FirstOrDefault(o => string.Equals(o.Valor, esProveedorInterno ? "Excelente" : "Bueno", StringComparison.OrdinalIgnoreCase))
                                         ?? opciones.OrderByDescending(o => o.Puntaje).First();
                            respuesta.CriterioOpcionID = opcion.OpcionID;
                        }
                        break;
                }

                return respuesta;
            }

            var respuestas = new List<RespuestaCriterioLicitacion>();

            foreach (var propuesta in propuestasConLicitacion)
            {
                if (!criteriosPorLicitacion.TryGetValue(propuesta.LicitacionID, out var criteriosParaLicitacion))
                {
                    continue;
                }

                var esProveedorInterno = propuesta.Licitacion != null && propuesta.ProveedorID == propuesta.Licitacion.MineraID;

                foreach (var criterio in criteriosParaLicitacion)
                {
                    var key = $"{propuesta.PropuestaID}:{criterio.CriterioID}";
                    if (respuestasExistentes.Contains(key))
                    {
                        continue;
                    }

                    respuestas.Add(CrearRespuesta(propuesta, criterio, esProveedorInterno));
                }
            }

            if (respuestas.Count > 0)
            {
                await context.RespuestasCriteriosLicitacion.AddRangeAsync(respuestas);
                await context.SaveChangesAsync();
            }

            // --- Calificaciones post-licitación para propuestas adjudicadas ---
            var propuestasAdjudicadas = await context.Propuestas.Where(p => p.EstadoPropuestaID == estadoPropAdjudicada.EstadoPropuestaID).ToListAsync();

            var calificaciones = new List<CalificacionPostLicitacion>();

            foreach (var p in propuestasAdjudicadas)
            {
                // Valores representativos según proveedor
                int puntualidad = 4;
                int calidad = 4;
                int comunicacion = 4;
                string comentario = "Servicio conforme dentro de los parámetros acordados.";

                if (p.ProveedorID == proveedorTransporte.EmpresaID)
                {
                    puntualidad = 5;
                    calidad = 4;
                    comunicacion = 5;
                    comentario = "Entrega puntual y comunicación fluida. Cumplió condiciones de seguro.";
                }
                else if (p.ProveedorID == mineraBorax.EmpresaID)
                {
                    puntualidad = 4;
                    calidad = 4;
                    comunicacion = 4;
                    comentario = "Propuesta interna registrada; desempeño adecuado para pruebas.";
                }

                calificaciones.Add(new CalificacionPostLicitacion
                {
                    ProveedorID = p.ProveedorID,
                    LicitacionID = p.LicitacionID,
                    Puntualidad = puntualidad,
                    Calidad = calidad,
                    Comunicacion = comunicacion,
                    Comentarios = comentario,
                    FechaCalificacion = DateTime.UtcNow
                });
            }

            if (calificaciones.Count > 0)
            {
                await context.CalificacionesPostLicitacion.AddRangeAsync(calificaciones);
                await context.SaveChangesAsync();
            }
        }
    }
}
