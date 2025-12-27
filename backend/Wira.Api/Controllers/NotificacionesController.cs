using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wira.Api.Data;
using Wira.Api.Models;
using System.ComponentModel.DataAnnotations;

namespace Wira.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificacionesController : ControllerBase
    {
        private readonly WiraDbContext _context;
        private readonly ILogger<NotificacionesController> _logger;

        public NotificacionesController(WiraDbContext context, ILogger<NotificacionesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/notificaciones/usuario/{usuarioId}
        [HttpGet("usuario/{usuarioId}")]
        public async Task<ActionResult<IEnumerable<NotificacionDto>>> GetNotificacionesUsuario(int usuarioId, [FromQuery] bool soloNoLeidas = false)
        {
            try
            {
                var query = _context.NotificacionesUsuarios
                    .Include(nu => nu.Notificacion)
                    .Where(nu => nu.UsuarioID == usuarioId);

                if (soloNoLeidas)
                {
                    query = query.Where(nu => !nu.Leido);
                }

                var notificaciones = await query
                    .OrderByDescending(nu => nu.Notificacion.FechaCreacion)
                    .Take(50) // Limitar a las últimas 50 notificaciones
                    .Select(nu => new NotificacionDto
                    {
                        NotificacionID = nu.NotificacionID,
                        Titulo = nu.Notificacion.Titulo,
                        Mensaje = nu.Notificacion.Mensaje,
                        FechaCreacion = nu.Notificacion.FechaCreacion,
                        Tipo = nu.Notificacion.Tipo,
                        EntidadTipo = nu.Notificacion.EntidadTipo,
                        EntidadID = nu.Notificacion.EntidadID,
                        Leido = nu.Leido,
                        FechaLeido = nu.FechaLeido
                    })
                    .ToListAsync();

                return Ok(notificaciones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener notificaciones del usuario {UsuarioId}", usuarioId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // GET: api/notificaciones/usuario/{usuarioId}/no-leidas/count
        [HttpGet("usuario/{usuarioId}/no-leidas/count")]
        public async Task<ActionResult<int>> GetConteoNotificacionesNoLeidas(int usuarioId)
        {
            try
            {
                var count = await _context.NotificacionesUsuarios
                    .Where(nu => nu.UsuarioID == usuarioId && !nu.Leido)
                    .CountAsync();

                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener conteo de notificaciones no leídas del usuario {UsuarioId}", usuarioId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // PUT: api/notificaciones/{notificacionId}/marcar-leida/{usuarioId}
        [HttpPut("{notificacionId}/marcar-leida/{usuarioId}")]
        public async Task<IActionResult> MarcarComoLeida(int notificacionId, int usuarioId)
        {
            try
            {
                var notificacionUsuario = await _context.NotificacionesUsuarios
                    .Where(nu => nu.NotificacionID == notificacionId && nu.UsuarioID == usuarioId)
                    .FirstOrDefaultAsync();

                if (notificacionUsuario == null)
                {
                    return NotFound(new { message = "Notificación no encontrada para el usuario" });
                }

                if (!notificacionUsuario.Leido)
                {
                    notificacionUsuario.Leido = true;
                    notificacionUsuario.FechaLeido = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

                return Ok(new { message = "Notificación marcada como leída" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al marcar notificación {NotificacionId} como leída para usuario {UsuarioId}", notificacionId, usuarioId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // PUT: api/notificaciones/usuario/{usuarioId}/marcar-todas-leidas
        [HttpPut("usuario/{usuarioId}/marcar-todas-leidas")]
        public async Task<IActionResult> MarcarTodasComoLeidas(int usuarioId)
        {
            try
            {
                var notificacionesNoLeidas = await _context.NotificacionesUsuarios
                    .Where(nu => nu.UsuarioID == usuarioId && !nu.Leido)
                    .ToListAsync();

                if (notificacionesNoLeidas.Any())
                {
                    foreach (var notificacion in notificacionesNoLeidas)
                    {
                        notificacion.Leido = true;
                        notificacion.FechaLeido = DateTime.UtcNow;
                    }

                    await _context.SaveChangesAsync();
                }

                return Ok(new { message = $"Se marcaron {notificacionesNoLeidas.Count} notificaciones como leídas" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al marcar todas las notificaciones como leídas para usuario {UsuarioId}", usuarioId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // POST: api/notificaciones/crear
        [HttpPost("crear")]
        public async Task<ActionResult<NotificacionDto>> CrearNotificacion(CrearNotificacionRequest request)
        {
            try
            {
                // Validar que al menos uno de los tipos de destinatarios esté especificado
                if (request.UsuarioIDs == null && request.RolIDs == null && request.MineraIDs == null)
                {
                    return BadRequest(new { message = "Debe especificar al menos un tipo de destinatario" });
                }

                using var transaction = await _context.Database.BeginTransactionAsync();

                // Crear la notificación
                var notificacion = new Notificacion
                {
                    Titulo = request.Titulo,
                    Mensaje = request.Mensaje,
                    Tipo = request.Tipo,
                    EntidadTipo = request.EntidadTipo,
                    EntidadID = request.EntidadID,
                    FechaCreacion = DateTime.UtcNow
                };

                _context.Notificaciones.Add(notificacion);
                await _context.SaveChangesAsync();

                // Obtener los usuarios destinatarios
                var usuariosDestinatarios = new HashSet<int>();

                // Usuarios específicos
                if (request.UsuarioIDs != null && request.UsuarioIDs.Any())
                {
                    foreach (var usuarioId in request.UsuarioIDs)
                    {
                        usuariosDestinatarios.Add(usuarioId);
                    }
                }

                // Usuarios por rol
                if (request.RolIDs != null && request.RolIDs.Any())
                {
                    var usuariosPorRol = await _context.UsuariosRoles
                        .Where(ur => request.RolIDs.Contains(ur.RolID))
                        .Select(ur => ur.UsuarioID)
                        .ToListAsync();

                    foreach (var usuarioId in usuariosPorRol)
                    {
                        usuariosDestinatarios.Add(usuarioId);
                    }
                }

                // Usuarios por minera
                if (request.MineraIDs != null && request.MineraIDs.Any())
                {
                    var usuariosPorMinera = await _context.Usuarios
                        .Where(u =>
                            u.EmpresaID.HasValue &&
                            request.MineraIDs.Contains(u.EmpresaID.Value) &&
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
                await transaction.CommitAsync();

                _logger.LogInformation("Notificación creada con ID: {NotificacionId} para {CantidadUsuarios} usuarios",
                    notificacion.NotificacionID, usuariosDestinatarios.Count);

                var notificacionDto = new NotificacionDto
                {
                    NotificacionID = notificacion.NotificacionID,
                    Titulo = notificacion.Titulo,
                    Mensaje = notificacion.Mensaje,
                    FechaCreacion = notificacion.FechaCreacion,
                    Tipo = notificacion.Tipo,
                    EntidadTipo = notificacion.EntidadTipo,
                    EntidadID = notificacion.EntidadID,
                    Leido = false,
                    FechaLeido = null
                };

                return Ok(notificacionDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear notificación");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // DELETE: api/notificaciones/{notificacionId}/usuario/{usuarioId}
        [HttpDelete("{notificacionId}/usuario/{usuarioId}")]
        public async Task<IActionResult> EliminarNotificacionUsuario(int notificacionId, int usuarioId)
        {
            try
            {
                var notificacionUsuario = await _context.NotificacionesUsuarios
                    .Where(nu => nu.NotificacionID == notificacionId && nu.UsuarioID == usuarioId)
                    .FirstOrDefaultAsync();

                if (notificacionUsuario == null)
                {
                    return NotFound(new { message = "Notificación no encontrada para el usuario" });
                }

                _context.NotificacionesUsuarios.Remove(notificacionUsuario);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Notificación eliminada para el usuario" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar notificación {NotificacionId} para usuario {UsuarioId}", notificacionId, usuarioId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }

    // DTOs
    public class NotificacionDto
    {
        public int NotificacionID { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Mensaje { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
        public string? Tipo { get; set; }
        public string? EntidadTipo { get; set; }
        public int? EntidadID { get; set; }
        public bool Leido { get; set; }
        public DateTime? FechaLeido { get; set; }
    }

    public class CrearNotificacionRequest
    {
        [Required]
        [StringLength(255)]
        public string Titulo { get; set; } = string.Empty;

        [Required]
        public string Mensaje { get; set; } = string.Empty;

        [StringLength(50)]
        public string? Tipo { get; set; }

        [StringLength(50)]
        public string? EntidadTipo { get; set; }

        public int? EntidadID { get; set; }

        public List<int>? UsuarioIDs { get; set; }
        public List<int>? RolIDs { get; set; }
        public List<int>? MineraIDs { get; set; }
    }
}
