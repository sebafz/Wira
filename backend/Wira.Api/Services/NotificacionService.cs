using Wira.Api.Data;
using Wira.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Wira.Api.Services
{
    public interface INotificacionService
    {
        Task CrearNotificacionLicitacionPublicada(int licitacionId, string tituloLicitacion, int mineraId);
        Task CrearNotificacionLicitacionCerrada(int licitacionId, string tituloLicitacion, int mineraId);
        Task CrearNotificacionLicitacionAdjudicada(int licitacionId, string tituloLicitacion, int mineraId);
        Task CrearNotificacionNuevaPropuesta(int licitacionId, string tituloLicitacion, int propuestaId, string nombreProveedor, int mineraId);
        Task CrearNotificacionPersonalizada(string titulo, string mensaje, string? tipo = null, string? entidadTipo = null, int? entidadId = null, List<int>? usuarioIds = null, List<int>? rolIds = null, List<int>? mineraIds = null);
        Task CrearNotificacionGanadorSeleccionado(int licitacionId, string tituloLicitacion, int proveedorGanadorId, string nombreProveedorGanador, int mineraId);
    }

    public class NotificacionService : INotificacionService
    {
        private readonly WiraDbContext _context;
        private readonly ILogger<NotificacionService> _logger;

        public NotificacionService(WiraDbContext context, ILogger<NotificacionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task CrearNotificacionLicitacionPublicada(int licitacionId, string tituloLicitacion, int mineraId)
        {
            var titulo = "Nueva licitación publicada";
            var mensaje = $"Se ha publicado una nueva licitación: {tituloLicitacion}";

            // Notificar a todos los proveedores
            var usuarioProveedorIds = await _context.Usuarios
                .Where(u => u.Empresa != null && u.Empresa.TipoEmpresa == EmpresaTipos.Proveedor)
                .Select(u => u.UsuarioID)
                .ToListAsync();

            await CrearNotificacionPersonalizada(
                titulo,
                mensaje,
                "APERTURA",
                "LICITACION",
                licitacionId,
                usuarioIds: usuarioProveedorIds
            );
        }

        public async Task CrearNotificacionLicitacionCerrada(int licitacionId, string tituloLicitacion, int mineraId)
        {
            var titulo = "Licitación cerrada";
            var mensaje = $"La licitación '{tituloLicitacion}' ha sido cerrada y está en evaluación";

            // Notificar a la minera propietaria
            await CrearNotificacionPersonalizada(
                titulo,
                mensaje,
                "CIERRE",
                "LICITACION",
                licitacionId,
                mineraIds: new List<int> { mineraId }
            );

            // Notificar a proveedores que enviaron propuestas
            var proveedorIds = await _context.Propuestas
                .Where(p => p.LicitacionID == licitacionId && !p.Eliminado)
                .Select(p => p.ProveedorID)
                .Distinct()
                .ToListAsync();

            var usuarioProveedorIds = await _context.Usuarios
                .Where(u =>
                    u.EmpresaID.HasValue &&
                    proveedorIds.Contains(u.EmpresaID.Value) &&
                    u.Empresa != null &&
                    u.Empresa.TipoEmpresa == EmpresaTipos.Proveedor)
                .Select(u => u.UsuarioID)
                .ToListAsync();

            if (usuarioProveedorIds.Any())
            {
                var mensajeProveedores = $"La licitación '{tituloLicitacion}' en la que participaste ha sido cerrada y está en evaluación";
                await CrearNotificacionPersonalizada(
                    titulo,
                    mensajeProveedores,
                    "CIERRE",
                    "LICITACION",
                    licitacionId,
                    usuarioIds: usuarioProveedorIds
                );
            }
        }

        public async Task CrearNotificacionLicitacionAdjudicada(int licitacionId, string tituloLicitacion, int mineraId)
        {
            var titulo = "Licitación adjudicada";
            var mensaje = $"La licitación '{tituloLicitacion}' ha sido adjudicada";

            // Notificar a la minera propietaria
            await CrearNotificacionPersonalizada(
                titulo,
                mensaje,
                "ADJUDICACION",
                "LICITACION",
                licitacionId,
                mineraIds: new List<int> { mineraId }
            );

            // Notificar a proveedores que enviaron propuestas
            var proveedorIds = await _context.Propuestas
                .Where(p => p.LicitacionID == licitacionId && !p.Eliminado)
                .Select(p => p.ProveedorID)
                .Distinct()
                .ToListAsync();

            var usuarioProveedorIds = await _context.Usuarios
                .Where(u =>
                    u.EmpresaID.HasValue &&
                    proveedorIds.Contains(u.EmpresaID.Value) &&
                    u.Empresa != null &&
                    u.Empresa.TipoEmpresa == EmpresaTipos.Proveedor)
                .Select(u => u.UsuarioID)
                .ToListAsync();

            if (usuarioProveedorIds.Any())
            {
                var mensajeProveedores = $"La licitación '{tituloLicitacion}' en la que participaste ha sido adjudicada";
                await CrearNotificacionPersonalizada(
                    titulo,
                    mensajeProveedores,
                    "ADJUDICACION",
                    "LICITACION",
                    licitacionId,
                    usuarioIds: usuarioProveedorIds
                );
            }
        }

        public async Task CrearNotificacionNuevaPropuesta(int licitacionId, string tituloLicitacion, int propuestaId, string nombreProveedor, int mineraId)
        {
            var titulo = "Nueva propuesta recibida";
            var mensaje = $"Se ha recibido una nueva propuesta de {nombreProveedor} para la licitación '{tituloLicitacion}'";

            // Notificar a la minera propietaria
            await CrearNotificacionPersonalizada(
                titulo,
                mensaje,
                "PROPUESTA",
                "PROPUESTA",
                propuestaId,
                mineraIds: new List<int> { mineraId }
            );
        }

        public async Task CrearNotificacionGanadorSeleccionado(int licitacionId, string tituloLicitacion, int proveedorGanadorId, string nombreProveedorGanador, int mineraId)
        {
            var titulo = "¡Felicitaciones! Ha ganado una licitación";
            var mensaje = $"Tu empresa ha sido seleccionada como ganadora de la licitación '{tituloLicitacion}'";

            // Notificar al proveedor ganador
            var usuarioGanadorIds = await _context.Usuarios
                .Where(u =>
                    u.EmpresaID == proveedorGanadorId &&
                    u.Empresa != null &&
                    u.Empresa.TipoEmpresa == EmpresaTipos.Proveedor)
                .Select(u => u.UsuarioID)
                .ToListAsync();

            if (usuarioGanadorIds.Any())
            {
                await CrearNotificacionPersonalizada(
                    titulo,
                    mensaje,
                    "GANADOR",
                    "LICITACION",
                    licitacionId,
                    usuarioIds: usuarioGanadorIds
                );
            }

            // Notificar a la minera propietaria
            var tituloMinera = "Ganador seleccionado";
            var mensajeMinera = $"Se ha seleccionado a {nombreProveedorGanador} como ganador de la licitación '{tituloLicitacion}'";

            await CrearNotificacionPersonalizada(
                tituloMinera,
                mensajeMinera,
                "GANADOR_SELECCIONADO",
                "LICITACION",
                licitacionId,
                mineraIds: new List<int> { mineraId }
            );

            // Notificar a los demás proveedores que participaron
            var otrosProveedorIds = await _context.Propuestas
                .Where(p => p.LicitacionID == licitacionId && p.ProveedorID != proveedorGanadorId && !p.Eliminado)
                .Select(p => p.ProveedorID)
                .Distinct()
                .ToListAsync();

            var usuariosOtrosProveedorIds = await _context.Usuarios
                .Where(u =>
                    u.EmpresaID.HasValue &&
                    otrosProveedorIds.Contains(u.EmpresaID.Value) &&
                    u.Empresa != null &&
                    u.Empresa.TipoEmpresa == EmpresaTipos.Proveedor)
                .Select(u => u.UsuarioID)
                .ToListAsync();

            if (usuariosOtrosProveedorIds.Any())
            {
                var tituloOtros = "Resultado de licitación";
                var mensajeOtros = $"La licitación '{tituloLicitacion}' en la que participaste ha sido adjudicada a {nombreProveedorGanador}";

                await CrearNotificacionPersonalizada(
                    tituloOtros,
                    mensajeOtros,
                    "RESULTADO_LICITACION",
                    "LICITACION",
                    licitacionId,
                    usuarioIds: usuariosOtrosProveedorIds
                );
            }
        }

        public async Task CrearNotificacionPersonalizada(string titulo, string mensaje, string? tipo = null, string? entidadTipo = null, int? entidadId = null, List<int>? usuarioIds = null, List<int>? rolIds = null, List<int>? mineraIds = null)
        {
            try
            {
                // Verificar si es un proveedor en memoria para evitar transacciones
                var isInMemory = _context.Database.ProviderName?.Contains("InMemory") == true;

                if (!isInMemory)
                {
                    using var transaction = await _context.Database.BeginTransactionAsync();
                    await ExecuteNotificationCreation(titulo, mensaje, tipo, entidadTipo, entidadId, usuarioIds, rolIds, mineraIds);
                    await transaction.CommitAsync();
                }
                else
                {
                    await ExecuteNotificationCreation(titulo, mensaje, tipo, entidadTipo, entidadId, usuarioIds, rolIds, mineraIds);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear notificación: {Titulo}", titulo);
                throw;
            }
        }

        private async Task ExecuteNotificationCreation(string titulo, string mensaje, string? tipo, string? entidadTipo, int? entidadId, List<int>? usuarioIds, List<int>? rolIds, List<int>? mineraIds)
        {
            // Crear la notificación
            var notificacion = new Notificacion
            {
                Titulo = titulo,
                Mensaje = mensaje,
                Tipo = tipo,
                EntidadTipo = entidadTipo,
                EntidadID = entidadId,
                FechaCreacion = DateTime.UtcNow
            };

            _context.Notificaciones.Add(notificacion);
            await _context.SaveChangesAsync();

            // Obtener los usuarios destinatarios
            var usuariosDestinatarios = new HashSet<int>();

            // Usuarios específicos
            if (usuarioIds != null && usuarioIds.Any())
            {
                foreach (var usuarioId in usuarioIds)
                {
                    usuariosDestinatarios.Add(usuarioId);
                }
            }

            // Usuarios por rol
            if (rolIds != null && rolIds.Any())
            {
                var usuariosPorRol = await _context.UsuariosRoles
                    .Where(ur => rolIds.Contains(ur.RolID))
                    .Select(ur => ur.UsuarioID)
                    .ToListAsync();

                foreach (var usuarioId in usuariosPorRol)
                {
                    usuariosDestinatarios.Add(usuarioId);
                }
            }

            // Usuarios por minera
            if (mineraIds != null && mineraIds.Any())
            {
                var usuariosPorMinera = await _context.Usuarios
                    .Where(u =>
                        u.EmpresaID.HasValue &&
                        mineraIds.Contains(u.EmpresaID.Value) &&
                        u.Empresa != null &&
                        u.Empresa.TipoEmpresa == EmpresaTipos.Minera)
                    .Select(u => u.UsuarioID)
                    .ToListAsync();

                foreach (var usuarioId in usuariosPorMinera)
                {
                    usuariosDestinatarios.Add(usuarioId);
                }
            }

            // Crear las relaciones NotificacionUsuario
            foreach (var usuarioId in usuariosDestinatarios)
            {
                var notificacionUsuario = new NotificacionUsuario
                {
                    NotificacionID = notificacion.NotificacionID,
                    UsuarioID = usuarioId,
                    Leido = false
                };

                _context.NotificacionesUsuarios.Add(notificacionUsuario);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Notificación creada: {Titulo} para {CantidadUsuarios} usuarios",
                titulo, usuariosDestinatarios.Count);
        }
    }
}
