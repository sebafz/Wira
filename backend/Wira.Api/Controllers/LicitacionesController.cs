using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wira.Api.Data;
using Wira.Api.Models;
using Wira.Api.DTOs;
using System.ComponentModel.DataAnnotations;

namespace Wira.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LicitacionesController : ControllerBase
    {
        private readonly WiraDbContext _context;
        private readonly ILogger<LicitacionesController> _logger;

        public LicitacionesController(WiraDbContext context, ILogger<LicitacionesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LicitacionDto>>> GetLicitaciones()
        {
            try
            {
                var licitaciones = await _context.Licitaciones
                    .Include(l => l.Minera)
                    .Include(l => l.Rubro)
                    .Include(l => l.EstadoLicitacion)
                    .Include(l => l.ArchivoAdjunto)
                    .Where(l => !l.Eliminado)
                    .Select(l => new LicitacionDto
                    {
                        LicitacionID = l.LicitacionID,
                        MineraID = l.MineraID,
                        RubroID = l.RubroID,
                        Titulo = l.Titulo,
                        Descripcion = l.Descripcion,
                        FechaInicio = l.FechaInicio,
                        FechaCierre = l.FechaCierre,
                        PresupuestoEstimado = l.PresupuestoEstimado,
                        Condiciones = l.Condiciones,
                        EstadoLicitacionID = l.EstadoLicitacionID,
                        ArchivoID = l.ArchivoID,
                        FechaCreacion = l.FechaCreacion,
                        MineraNombre = l.Minera.Nombre,
                        RubroNombre = l.Rubro.Nombre,
                        EstadoNombre = l.EstadoLicitacion.NombreEstado,
                        ArchivoNombre = l.ArchivoAdjunto != null ? l.ArchivoAdjunto.NombreArchivo : null
                    })
                    .ToListAsync();

                return Ok(licitaciones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener licitaciones");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LicitacionDto>> GetLicitacion(int id)
        {
            try
            {
                var licitacion = await _context.Licitaciones
                    .Include(l => l.Minera)
                    .Include(l => l.Rubro)
                    .Include(l => l.EstadoLicitacion)
                    .Include(l => l.ArchivoAdjunto)
                    .Include(l => l.CriteriosLicitacion)
                    .Where(l => l.LicitacionID == id && !l.Eliminado)
                    .Select(l => new LicitacionDto
                    {
                        LicitacionID = l.LicitacionID,
                        MineraID = l.MineraID,
                        RubroID = l.RubroID,
                        Titulo = l.Titulo,
                        Descripcion = l.Descripcion,
                        FechaInicio = l.FechaInicio,
                        FechaCierre = l.FechaCierre,
                        PresupuestoEstimado = l.PresupuestoEstimado,
                        Condiciones = l.Condiciones,
                        EstadoLicitacionID = l.EstadoLicitacionID,
                        ArchivoID = l.ArchivoID,
                        FechaCreacion = l.FechaCreacion,
                        MineraNombre = l.Minera.Nombre,
                        RubroNombre = l.Rubro.Nombre,
                        EstadoNombre = l.EstadoLicitacion.NombreEstado,
                        ArchivoNombre = l.ArchivoAdjunto != null ? l.ArchivoAdjunto.NombreArchivo : null,
                        Criterios = l.CriteriosLicitacion.Select(c => new CriterioLicitacionDto
                        {
                            CriterioID = c.CriterioID,
                            Nombre = c.Nombre,
                            Descripcion = c.Descripcion,
                            Peso = c.Peso,
                            ModoEvaluacion = c.ModoEvaluacion
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (licitacion == null)
                {
                    return NotFound();
                }

                return Ok(licitacion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener licitación con ID: {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpPost]
        public async Task<ActionResult<LicitacionDto>> CreateLicitacion(CreateLicitacionRequest request)
        {
            try
            {
                // Validar que la minera existe
                var minera = await _context.Mineras.FindAsync(request.MineraID);
                if (minera == null)
                {
                    return BadRequest("La minera especificada no existe.");
                }

                // Validar que el rubro existe
                var rubro = await _context.Rubros.FindAsync(request.RubroID);
                if (rubro == null)
                {
                    return BadRequest("El rubro especificado no existe.");
                }

                // Validar fechas
                if (request.FechaInicio >= request.FechaCierre)
                {
                    return BadRequest("La fecha de cierre debe ser posterior a la fecha de inicio.");
                }

                // Validar criterios
                if (request.Criterios == null || !request.Criterios.Any())
                {
                    return BadRequest("Debe especificar al menos un criterio de evaluación.");
                }

                var totalPeso = request.Criterios.Sum(c => c.Peso);
                if (Math.Abs(totalPeso - 100) > 0.01m)
                {
                    return BadRequest("El peso total de los criterios debe sumar exactamente 100%.");
                }

                // Obtener el estado inicial de licitación ("Publicada")
                var estadoInicial = await _context.EstadosLicitacion.FirstOrDefaultAsync(e => e.NombreEstado == "Publicada");
                if (estadoInicial == null)
                {
                    return BadRequest("No se encontró el estado inicial para la licitación.");
                }

                // Crear la licitación
                var licitacion = new Licitacion
                {
                    MineraID = request.MineraID,
                    RubroID = request.RubroID,
                    Titulo = request.Titulo,
                    Descripcion = request.Descripcion,
                    FechaInicio = request.FechaInicio,
                    FechaCierre = request.FechaCierre,
                    PresupuestoEstimado = request.PresupuestoEstimado,
                    Condiciones = request.Condiciones,
                    EstadoLicitacionID = estadoInicial.EstadoLicitacionID,
                    ArchivoID = request.ArchivoID,
                    FechaCreacion = DateTime.Now
                };

                _context.Licitaciones.Add(licitacion);
                await _context.SaveChangesAsync();

                // Crear los criterios de evaluación
                foreach (var criterioRequest in request.Criterios)
                {
                    var criterio = new CriterioLicitacion
                    {
                        LicitacionID = licitacion.LicitacionID,
                        Nombre = criterioRequest.Nombre,
                        Descripcion = criterioRequest.Descripcion,
                        Peso = criterioRequest.Peso,
                        ModoEvaluacion = criterioRequest.ModoEvaluacion
                    };

                    _context.CriteriosLicitacion.Add(criterio);
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Licitación creada exitosamente con ID: {licitacion.LicitacionID}");

                // Retornar la licitación creada
                return await GetLicitacion(licitacion.LicitacionID);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear licitación");
                return StatusCode(500, "Error interno del servidor al crear la licitación.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLicitacion(int id, UpdateLicitacionRequest request)
        {
            try
            {
                var licitacion = await _context.Licitaciones.FindAsync(id);
                if (licitacion == null || licitacion.Eliminado)
                {
                    return NotFound();
                }

                // Actualizar campos
                licitacion.Titulo = request.Titulo;
                licitacion.Descripcion = request.Descripcion;
                licitacion.FechaInicio = request.FechaInicio;
                licitacion.FechaCierre = request.FechaCierre;
                licitacion.PresupuestoEstimado = request.PresupuestoEstimado;
                licitacion.Condiciones = request.Condiciones;
                licitacion.ArchivoID = request.ArchivoID;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Licitación actualizada exitosamente con ID: {id}");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar licitación con ID: {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLicitacion(int id)
        {
            try
            {
                var licitacion = await _context.Licitaciones.FindAsync(id);
                if (licitacion == null || licitacion.Eliminado)
                {
                    return NotFound();
                }

                // Soft delete
                licitacion.Eliminado = true;
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Licitación eliminada (soft delete) con ID: {id}");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar licitación con ID: {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }

    public class CreateLicitacionRequest
    {
        [Required]
        public int MineraID { get; set; }

        [Required]
        public int RubroID { get; set; }

        [Required]
        [StringLength(255)]
        public string Titulo { get; set; } = string.Empty;

        public string? Descripcion { get; set; }

        [Required]
        public DateTime FechaInicio { get; set; }

        [Required]
        public DateTime FechaCierre { get; set; }

        public decimal? PresupuestoEstimado { get; set; }

        public string? Condiciones { get; set; }

        public int? ArchivoID { get; set; }

        [Required]
        public List<CreateCriterioRequest> Criterios { get; set; } = new List<CreateCriterioRequest>();
    }

    public class CreateCriterioRequest
    {
        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        public string? Descripcion { get; set; }

        [Required]
        [Range(0.1, 100)]
        public decimal Peso { get; set; }

        [Required]
        [StringLength(20)]
        public string ModoEvaluacion { get; set; } = string.Empty;
    }

    public class UpdateLicitacionRequest
    {
        [Required]
        [StringLength(255)]
        public string Titulo { get; set; } = string.Empty;

        public string? Descripcion { get; set; }

        [Required]
        public DateTime FechaInicio { get; set; }

        [Required]
        public DateTime FechaCierre { get; set; }

        public decimal? PresupuestoEstimado { get; set; }

        public string? Condiciones { get; set; }

        public int? ArchivoID { get; set; }
    }
}
