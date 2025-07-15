using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wira.Api.Data;
using Wira.Api.Models;
using System.ComponentModel.DataAnnotations;

namespace Wira.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProyectosMinerosController : ControllerBase
    {
        private readonly WiraDbContext _context;
        private readonly ILogger<ProyectosMinerosController> _logger;

        public ProyectosMinerosController(WiraDbContext context, ILogger<ProyectosMinerosController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetProyectosMineros()
        {
            try
            {
                var proyectos = await _context.ProyectosMineros
                    .Include(p => p.Minera)
                    .Where(p => p.Activo)
                    .Select(p => new
                    {
                        p.ProyectoMineroID,
                        p.MineraID,
                        p.Nombre,
                        p.Ubicacion,
                        p.Descripcion,
                        p.Activo,
                        MineraNombre = p.Minera.Nombre
                    })
                    .OrderBy(p => p.Nombre)
                    .ToListAsync();

                return Ok(proyectos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener los proyectos mineros");
                return StatusCode(500, new { message = "Error al obtener los proyectos mineros" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProyectoMinero(int id)
        {
            try
            {
                var proyecto = await _context.ProyectosMineros
                    .Include(p => p.Minera)
                    .Where(p => p.ProyectoMineroID == id && p.Activo)
                    .Select(p => new
                    {
                        p.ProyectoMineroID,
                        p.MineraID,
                        p.Nombre,
                        p.Ubicacion,
                        p.Descripcion,
                        p.Activo,
                        MineraNombre = p.Minera.Nombre
                    })
                    .FirstOrDefaultAsync();

                if (proyecto == null)
                {
                    return NotFound(new { message = "Proyecto minero no encontrado" });
                }

                return Ok(proyecto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el proyecto minero con ID: {ProyectoId}", id);
                return StatusCode(500, new { message = "Error al obtener el proyecto minero" });
            }
        }

        [HttpGet("minera/{mineraId}")]
        public async Task<IActionResult> GetProyectosByMinera(int mineraId)
        {
            try
            {
                var proyectos = await _context.ProyectosMineros
                    .Include(p => p.Minera)
                    .Where(p => p.MineraID == mineraId && p.Activo)
                    .Select(p => new
                    {
                        p.ProyectoMineroID,
                        p.MineraID,
                        p.Nombre,
                        p.Ubicacion,
                        p.Descripcion,
                        p.Activo,
                        MineraNombre = p.Minera.Nombre
                    })
                    .OrderBy(p => p.Nombre)
                    .ToListAsync();

                return Ok(proyectos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener los proyectos de la minera {MineraId}", mineraId);
                return StatusCode(500, new { message = "Error al obtener los proyectos de la minera" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateProyectoMinero([FromBody] CreateProyectoMineroDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Verificar que la minera existe
                var minera = await _context.Mineras.FindAsync(createDto.MineraID);
                if (minera == null || !minera.Activo)
                {
                    return BadRequest(new { message = "La minera especificada no existe o no está activa" });
                }

                var proyecto = new ProyectoMinero
                {
                    MineraID = createDto.MineraID,
                    Nombre = createDto.Nombre,
                    Ubicacion = createDto.Ubicacion,
                    Descripcion = createDto.Descripcion,
                    Activo = true
                };

                _context.ProyectosMineros.Add(proyecto);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Proyecto minero creado exitosamente con ID: {proyecto.ProyectoMineroID}");

                return CreatedAtAction(nameof(GetProyectoMinero), new { id = proyecto.ProyectoMineroID }, new
                {
                    message = "Proyecto minero creado exitosamente",
                    proyectoMineroId = proyecto.ProyectoMineroID
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el proyecto minero");
                return StatusCode(500, new { message = "Error al crear el proyecto minero" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProyectoMinero(int id, [FromBody] UpdateProyectoMineroDto updateDto)
        {
            try
            {
                var proyecto = await _context.ProyectosMineros.FindAsync(id);
                if (proyecto == null || !proyecto.Activo)
                {
                    return NotFound(new { message = "Proyecto minero no encontrado" });
                }

                proyecto.Nombre = updateDto.Nombre;
                proyecto.Ubicacion = updateDto.Ubicacion;
                proyecto.Descripcion = updateDto.Descripcion;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Proyecto minero actualizado exitosamente con ID: {id}");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar el proyecto minero con ID: {ProyectoId}", id);
                return StatusCode(500, new { message = "Error al actualizar el proyecto minero" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProyectoMinero(int id)
        {
            try
            {
                var proyecto = await _context.ProyectosMineros.FindAsync(id);
                if (proyecto == null || !proyecto.Activo)
                {
                    return NotFound(new { message = "Proyecto minero no encontrado" });
                }

                // Soft delete
                proyecto.Activo = false;
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Proyecto minero eliminado (soft delete) con ID: {id}");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar el proyecto minero con ID: {ProyectoId}", id);
                return StatusCode(500, new { message = "Error al eliminar el proyecto minero" });
            }
        }
    }

    public class CreateProyectoMineroDto
    {
        [Required]
        public int MineraID { get; set; }

        [Required]
        [StringLength(255)]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(255)]
        public string? Ubicacion { get; set; }

        public string? Descripcion { get; set; }
    }

    public class UpdateProyectoMineroDto
    {
        [Required]
        [StringLength(255)]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(255)]
        public string? Ubicacion { get; set; }

        public string? Descripcion { get; set; }
    }
}
