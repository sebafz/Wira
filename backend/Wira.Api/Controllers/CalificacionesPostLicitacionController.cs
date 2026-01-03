using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wira.Api.Data;
using Wira.Api.DTOs;
using Wira.Api.Models;

namespace Wira.Api.Controllers
{
    [ApiController]
    [Route("api/calificaciones-postlicitacion")]
    public class CalificacionesPostLicitacionController : ControllerBase
    {
        private readonly WiraDbContext _context;
        private readonly ILogger<CalificacionesPostLicitacionController> _logger;

        public CalificacionesPostLicitacionController(
            WiraDbContext context,
            ILogger<CalificacionesPostLicitacionController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost]
        public async Task<ActionResult<object>> RegistrarCalificacion(RegistrarCalificacionPostLicitacionRequest request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var licitacion = await _context.Licitaciones
                    .AsNoTracking()
                    .FirstOrDefaultAsync(l => l.LicitacionID == request.LicitacionID);

                if (licitacion == null)
                {
                    return NotFound(new { message = "La licitacion especificada no existe" });
                }

                var proveedor = await _context.Empresas
                    .AsNoTracking()
                    .FirstOrDefaultAsync(e => e.EmpresaID == request.ProveedorID);

                if (proveedor == null)
                {
                    return NotFound(new { message = "El proveedor especificado no existe" });
                }

                var existing = await _context.CalificacionesPostLicitacion
                    .FirstOrDefaultAsync(c => c.LicitacionID == request.LicitacionID && c.ProveedorID == request.ProveedorID);

                CalificacionPostLicitacion entity;
                if (existing == null)
                {
                    entity = new CalificacionPostLicitacion
                    {
                        LicitacionID = request.LicitacionID,
                        ProveedorID = request.ProveedorID,
                        Puntualidad = request.Puntualidad,
                        Calidad = request.Calidad,
                        Comunicacion = request.Comunicacion,
                        Comentarios = string.IsNullOrWhiteSpace(request.Comentarios)
                            ? null
                            : request.Comentarios.Trim(),
                        FechaCalificacion = DateTime.UtcNow
                    };

                    _context.CalificacionesPostLicitacion.Add(entity);
                }
                else
                {
                    existing.Puntualidad = request.Puntualidad;
                    existing.Calidad = request.Calidad;
                    existing.Comunicacion = request.Comunicacion;
                    existing.Comentarios = string.IsNullOrWhiteSpace(request.Comentarios)
                        ? null
                        : request.Comentarios.Trim();
                    existing.FechaCalificacion = DateTime.UtcNow;

                    entity = existing;
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    entity.CalificacionID,
                    entity.LicitacionID,
                    entity.ProveedorID,
                    entity.Puntualidad,
                    entity.Calidad,
                    entity.Comunicacion,
                    entity.Comentarios,
                    entity.FechaCalificacion
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al registrar calificacion post licitacion");
                return StatusCode(500, new { message = "No pudimos registrar la calificacion" });
            }
        }
    }
}
