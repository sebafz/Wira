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
            var proveedorIds = await _context.Usuarios
                .Where(u => u.ProveedorID.HasValue)
                .Select(u => u.UsuarioID)
                .ToListAsync();

            await CrearNotificacionPersonalizada(
                titulo, 
                mensaje, 
                "APERTURA", 
                "LICITACION", 
                licitacionId, 
                usuarioIds: proveedorIds
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
                .Where(u => u.ProveedorID.HasValue && proveedorIds.Contains(u.ProveedorID.Value))
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
                .Where(u => u.ProveedorID.HasValue && proveedorIds.Contains(u.ProveedorID.Value))
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

        public async Task CrearNotificacionPersonalizada(string titulo, string mensaje, string? tipo = null, string? entidadTipo = null, int? entidadId = null, List<int>? usuarioIds = null, List<int>? rolIds = null, List<int>? mineraIds = null)
        {
            try
            {
                using var transaction = await _context.Database.BeginTransactionAsync();

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
                        .Where(u => u.MineraID.HasValue && mineraIds.Contains(u.MineraID.Value))
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
                await transaction.CommitAsync();

                _logger.LogInformation("Notificación creada: {Titulo} para {CantidadUsuarios} usuarios", 
                    titulo, usuariosDestinatarios.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear notificación: {Titulo}", titulo);
                throw;
            }
        }
    }
}
