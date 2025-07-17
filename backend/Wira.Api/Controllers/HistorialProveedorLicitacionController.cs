using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wira.Api.Data;
using Wira.Api.Models;
using System.ComponentModel.DataAnnotations;

namespace Wira.Api.Controllers
{
    [ApiController]
    [Route("api/historial-proveedor-licitacion")]
    public class HistorialProveedorLicitacionController : ControllerBase
    {
        private readonly WiraDbContext _context;
        private readonly ILogger<HistorialProveedorLicitacionController> _logger;

        public HistorialProveedorLicitacionController(WiraDbContext context, ILogger<HistorialProveedorLicitacionController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetHistorial()
        {
            try
            {
                var historial = await _context.HistorialProveedorLicitacion
                    .Include(h => h.Proveedor)
                    .Include(h => h.Licitacion)
                    .Select(h => new
                    {
                        h.HistorialID,
                        h.ProveedorID,
                        h.LicitacionID,
                        h.Resultado,
                        h.Ganador,
                        h.Observaciones,
                        h.FechaParticipacion,
                        ProveedorNombre = h.Proveedor.Nombre,
                        LicitacionTitulo = h.Licitacion.Titulo
                    })
                    .OrderByDescending(h => h.FechaParticipacion)
                    .ToListAsync();

                return Ok(historial);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener historial de proveedores");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetHistorialById(int id)
        {
            try
            {
                var historial = await _context.HistorialProveedorLicitacion
                    .Include(h => h.Proveedor)
                    .Include(h => h.Licitacion)
                    .Where(h => h.HistorialID == id)
                    .Select(h => new
                    {
                        h.HistorialID,
                        h.ProveedorID,
                        h.LicitacionID,
                        h.Resultado,
                        h.Ganador,
                        h.Observaciones,
                        h.FechaParticipacion,
                        ProveedorNombre = h.Proveedor.Nombre,
                        LicitacionTitulo = h.Licitacion.Titulo
                    })
                    .FirstOrDefaultAsync();

                if (historial == null)
                {
                    return NotFound(new { message = "Historial no encontrado" });
                }

                return Ok(historial);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener historial por ID: {HistorialId}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPost]
        public async Task<ActionResult<object>> CreateHistorial(CreateHistorialRequest request)
        {
            try
            {
                // Validar que el proveedor existe
                var proveedor = await _context.Proveedores.FindAsync(request.ProveedorID);
                if (proveedor == null)
                {
                    return BadRequest(new { message = "El proveedor especificado no existe" });
                }

                // Validar que la licitación existe
                var licitacion = await _context.Licitaciones.FindAsync(request.LicitacionID);
                if (licitacion == null)
                {
                    return BadRequest(new { message = "La licitación especificada no existe" });
                }

                // Verificar si ya existe un historial para este proveedor y licitación
                var historialExistente = await _context.HistorialProveedorLicitacion
                    .Where(h => h.ProveedorID == request.ProveedorID && h.LicitacionID == request.LicitacionID)
                    .FirstOrDefaultAsync();

                if (historialExistente != null)
                {
                    // Actualizar el historial existente
                    historialExistente.Resultado = request.Resultado;
                    historialExistente.Ganador = request.Ganador;
                    historialExistente.Observaciones = request.Observaciones;
                    historialExistente.FechaParticipacion = DateTime.Now;

                    await _context.SaveChangesAsync();

                    _logger.LogInformation($"Historial actualizado para Proveedor ID: {request.ProveedorID}, Licitación ID: {request.LicitacionID}");

                    return Ok(new
                    {
                        historialExistente.HistorialID,
                        historialExistente.ProveedorID,
                        historialExistente.LicitacionID,
                        historialExistente.Resultado,
                        historialExistente.Ganador,
                        historialExistente.Observaciones,
                        historialExistente.FechaParticipacion,
                        message = "Historial actualizado exitosamente"
                    });
                }
                else
                {
                    // Crear nuevo historial
                    var nuevoHistorial = new HistorialProveedorLicitacion
                    {
                        ProveedorID = request.ProveedorID,
                        LicitacionID = request.LicitacionID,
                        Resultado = request.Resultado,
                        Ganador = request.Ganador,
                        Observaciones = request.Observaciones,
                        FechaParticipacion = DateTime.Now
                    };

                    _context.HistorialProveedorLicitacion.Add(nuevoHistorial);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation($"Historial creado para Proveedor ID: {request.ProveedorID}, Licitación ID: {request.LicitacionID}");

                    return CreatedAtAction(nameof(GetHistorialById), new { id = nuevoHistorial.HistorialID }, new
                    {
                        nuevoHistorial.HistorialID,
                        nuevoHistorial.ProveedorID,
                        nuevoHistorial.LicitacionID,
                        nuevoHistorial.Resultado,
                        nuevoHistorial.Ganador,
                        nuevoHistorial.Observaciones,
                        nuevoHistorial.FechaParticipacion,
                        message = "Historial creado exitosamente"
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear/actualizar historial");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("proveedor/{proveedorId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetHistorialByProveedor(int proveedorId)
        {
            try
            {
                var historial = await _context.HistorialProveedorLicitacion
                    .Include(h => h.Licitacion)
                    .Where(h => h.ProveedorID == proveedorId)
                    .Select(h => new
                    {
                        h.HistorialID,
                        h.ProveedorID,
                        h.LicitacionID,
                        h.Resultado,
                        h.Ganador,
                        h.Observaciones,
                        h.FechaParticipacion,
                        LicitacionTitulo = h.Licitacion.Titulo
                    })
                    .OrderByDescending(h => h.FechaParticipacion)
                    .ToListAsync();

                return Ok(historial);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener historial por proveedor: {ProveedorId}", proveedorId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("licitacion/{licitacionId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetHistorialByLicitacion(int licitacionId)
        {
            try
            {
                var historial = await _context.HistorialProveedorLicitacion
                    .Include(h => h.Proveedor)
                    .Where(h => h.LicitacionID == licitacionId)
                    .Select(h => new
                    {
                        h.HistorialID,
                        h.ProveedorID,
                        h.LicitacionID,
                        h.Resultado,
                        h.Ganador,
                        h.Observaciones,
                        h.FechaParticipacion,
                        ProveedorNombre = h.Proveedor.Nombre
                    })
                    .OrderByDescending(h => h.FechaParticipacion)
                    .ToListAsync();

                return Ok(historial);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener historial por licitación: {LicitacionId}", licitacionId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }

    public class CreateHistorialRequest
    {
        [Required]
        public int ProveedorID { get; set; }

        [Required]
        public int LicitacionID { get; set; }

        [StringLength(100)]
        public string? Resultado { get; set; }

        public bool Ganador { get; set; } = false;

        public string? Observaciones { get; set; }
    }
}
