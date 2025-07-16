using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wira.Api.Data;
using Wira.Api.Models;

namespace Wira.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropuestasController : ControllerBase
    {
        private readonly WiraDbContext _context;
        private readonly ILogger<PropuestasController> _logger;

        public PropuestasController(WiraDbContext context, ILogger<PropuestasController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetPropuestas()
        {
            try
            {
                var propuestas = await _context.Propuestas
                    .Where(p => !p.Eliminado)
                    .Include(p => p.Licitacion)
                        .ThenInclude(l => l.Minera)
                    .Include(p => p.Proveedor)
                    .Include(p => p.EstadoPropuesta)
                    .Select(p => new
                    {
                        p.PropuestaID,
                        p.LicitacionID,
                        p.ProveedorID,
                        p.FechaEnvio,
                        p.EstadoPropuestaID,
                        p.Descripcion,
                        p.PresupuestoOfrecido,
                        p.FechaEntrega,
                        p.CumpleRequisitos,
                        p.CalificacionFinal,
                        EstadoNombre = p.EstadoPropuesta.NombreEstado,
                        LicitacionTitulo = p.Licitacion.Titulo,
                        MineraNombre = p.Licitacion.Minera.Nombre,
                        ProveedorNombre = p.Proveedor.Nombre,
                        // Obtener archivos adjuntos de la tabla ArchivosAdjuntos
                        ArchivosAdjuntos = _context.ArchivosAdjuntos
                            .Where(a => a.EntidadTipo == "PROPUESTA" && a.EntidadID == p.PropuestaID)
                            .Select(a => new { a.ArchivoID, a.NombreArchivo, a.RutaArchivo })
                            .ToList()
                    })
                    .OrderByDescending(p => p.FechaEnvio)
                    .ToListAsync();

                return Ok(propuestas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener las propuestas");
                return StatusCode(500, new { message = "Error al obtener las propuestas" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPropuesta(int id)
        {
            try
            {
                var propuesta = await _context.Propuestas
                    .Where(p => p.PropuestaID == id && !p.Eliminado)
                    .Include(p => p.Licitacion)
                        .ThenInclude(l => l.Minera)
                    .Include(p => p.Proveedor)
                    .Include(p => p.EstadoPropuesta)
                    .FirstOrDefaultAsync();

                if (propuesta == null)
                {
                    return NotFound(new { message = "Propuesta no encontrada" });
                }

                // Obtener archivos adjuntos de la tabla ArchivosAdjuntos
                var archivosAdjuntos = await _context.ArchivosAdjuntos
                    .Where(a => a.EntidadTipo == "PROPUESTA" && a.EntidadID == id)
                    .Select(a => new { a.ArchivoID, a.NombreArchivo, a.RutaArchivo })
                    .ToListAsync();

                // Obtener respuestas a criterios de evaluación
                _logger.LogInformation("Buscando respuestas a criterios para PropuestaID: {PropuestaId}", id);
                var respuestasCriterios = await _context.RespuestasCriteriosLicitacion
                    .Where(r => r.PropuestaID == id)
                    .Include(r => r.Criterio)
                    .Select(r => new
                    {
                        r.RespuestaID,
                        r.CriterioID,
                        r.ValorProveedor,
                        CriterioNombre = r.Criterio.Nombre,
                        CriterioDescripcion = r.Criterio.Descripcion,
                        CriterioPeso = r.Criterio.Peso,
                        CriterioModoEvaluacion = r.Criterio.ModoEvaluacion
                    })
                    .ToListAsync();

                _logger.LogInformation("Encontradas {Count} respuestas a criterios para PropuestaID: {PropuestaId}", respuestasCriterios.Count, id);
                
                if (respuestasCriterios.Any())
                {
                    foreach (var respuesta in respuestasCriterios)
                    {
                        _logger.LogInformation("Respuesta: CriterioID={CriterioID}, ValorProveedor={ValorProveedor}, Nombre={Nombre}", 
                            respuesta.CriterioID, respuesta.ValorProveedor, respuesta.CriterioNombre);
                    }
                }

                var result = new
                {
                    propuesta.PropuestaID,
                    propuesta.LicitacionID,
                    propuesta.ProveedorID,
                    propuesta.FechaEnvio,
                    propuesta.EstadoPropuestaID,
                    propuesta.Descripcion,
                    propuesta.PresupuestoOfrecido,
                    propuesta.FechaEntrega,
                    propuesta.CumpleRequisitos,
                    propuesta.CalificacionFinal,
                    EstadoNombre = propuesta.EstadoPropuesta.NombreEstado,
                    LicitacionTitulo = propuesta.Licitacion.Titulo,
                    MineraNombre = propuesta.Licitacion.Minera.Nombre,
                    ProveedorNombre = propuesta.Proveedor.Nombre,
                    ArchivosAdjuntos = archivosAdjuntos,
                    RespuestasCriterios = respuestasCriterios
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la propuesta con ID {PropuestaId}", id);
                return StatusCode(500, new { message = "Error al obtener la propuesta" });
            }
        }

        [HttpGet("proveedor/{proveedorId}")]
        public async Task<IActionResult> GetPropuestasByProveedor(int proveedorId)
        {
            try
            {
                var propuestas = await _context.Propuestas
                    .Where(p => p.ProveedorID == proveedorId && !p.Eliminado)
                    .Include(p => p.Licitacion)
                        .ThenInclude(l => l.Minera)
                    .Include(p => p.EstadoPropuesta)
                    .Select(p => new
                    {
                        p.PropuestaID,
                        p.LicitacionID,
                        p.ProveedorID,
                        p.FechaEnvio,
                        p.EstadoPropuestaID,
                        p.Descripcion,
                        p.PresupuestoOfrecido,
                        p.FechaEntrega,
                        p.CumpleRequisitos,
                        p.CalificacionFinal,
                        EstadoNombre = p.EstadoPropuesta.NombreEstado,
                        LicitacionTitulo = p.Licitacion.Titulo,
                        MineraNombre = p.Licitacion.Minera.Nombre,
                        // Obtener archivos adjuntos de la tabla ArchivosAdjuntos
                        ArchivosAdjuntos = _context.ArchivosAdjuntos
                            .Where(a => a.EntidadTipo == "PROPUESTA" && a.EntidadID == p.PropuestaID)
                            .Select(a => new { a.ArchivoID, a.NombreArchivo, a.RutaArchivo })
                            .ToList()
                    })
                    .OrderByDescending(p => p.FechaEnvio)
                    .ToListAsync();

                return Ok(propuestas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener las propuestas del proveedor {ProveedorId}", proveedorId);
                return StatusCode(500, new { message = "Error al obtener las propuestas del proveedor" });
            }
        }

        [HttpGet("licitacion/{licitacionId}")]
        public async Task<IActionResult> GetPropuestasByLicitacion(int licitacionId)
        {
            try
            {
                var propuestas = await _context.Propuestas
                    .Where(p => p.LicitacionID == licitacionId && !p.Eliminado)
                    .Include(p => p.Proveedor)
                    .Include(p => p.EstadoPropuesta)
                    .Select(p => new
                    {
                        p.PropuestaID,
                        p.LicitacionID,
                        p.ProveedorID,
                        p.FechaEnvio,
                        p.EstadoPropuestaID,
                        p.Descripcion,
                        p.PresupuestoOfrecido,
                        p.FechaEntrega,
                        p.CumpleRequisitos,
                        p.CalificacionFinal,
                        EstadoNombre = p.EstadoPropuesta.NombreEstado,
                        ProveedorNombre = p.Proveedor.Nombre,
                        // Obtener archivos adjuntos de la tabla ArchivosAdjuntos
                        ArchivosAdjuntos = _context.ArchivosAdjuntos
                            .Where(a => a.EntidadTipo == "PROPUESTA" && a.EntidadID == p.PropuestaID)
                            .Select(a => new { a.ArchivoID, a.NombreArchivo, a.RutaArchivo })
                            .ToList()
                    })
                    .OrderByDescending(p => p.FechaEnvio)
                    .ToListAsync();

                return Ok(propuestas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener las propuestas de la licitación {LicitacionId}", licitacionId);
                return StatusCode(500, new { message = "Error al obtener las propuestas de la licitación" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreatePropuesta([FromBody] CreatePropuestaDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Verificar que la licitación existe y está activa
                var licitacion = await _context.Licitaciones
                    .FirstOrDefaultAsync(l => l.LicitacionID == createDto.LicitacionID && !l.Eliminado);

                if (licitacion == null)
                {
                    return BadRequest(new { message = "La licitación no existe o no está disponible" });
                }

                // Verificar que el proveedor existe
                var proveedor = await _context.Proveedores
                    .FirstOrDefaultAsync(p => p.ProveedorID == createDto.ProveedorID && p.Activo);

                if (proveedor == null)
                {
                    return BadRequest(new { message = "El proveedor no existe o no está activo" });
                }

                // Verificar que el proveedor no haya enviado ya una propuesta para esta licitación
                var propuestaExistente = await _context.Propuestas
                    .AnyAsync(p => p.LicitacionID == createDto.LicitacionID && 
                                   p.ProveedorID == createDto.ProveedorID && 
                                   !p.Eliminado);

                if (propuestaExistente)
                {
                    return BadRequest(new { message = "Ya has enviado una propuesta para esta licitación" });
                }

                var propuesta = new Propuesta
                {
                    LicitacionID = createDto.LicitacionID,
                    ProveedorID = createDto.ProveedorID,
                    FechaEnvio = DateTime.Now,
                    EstadoPropuestaID = 1, // Estado inicial - "Enviada"
                    Descripcion = createDto.Descripcion,
                    PresupuestoOfrecido = createDto.PresupuestoOfrecido,
                    FechaEntrega = createDto.FechaEntrega,
                    CumpleRequisitos = createDto.CumpleRequisitos ?? true
                };

                _context.Propuestas.Add(propuesta);
                await _context.SaveChangesAsync();

                // Guardar respuestas a los criterios si existen
                if (createDto.RespuestasCriterios != null && createDto.RespuestasCriterios.Any())
                {
                    var respuestasCriterios = createDto.RespuestasCriterios
                        .Where(r => !string.IsNullOrWhiteSpace(r.ValorProveedor))
                        .Select(r => new RespuestaCriterioLicitacion
                        {
                            PropuestaID = propuesta.PropuestaID,
                            CriterioID = r.CriterioID,
                            ValorProveedor = r.ValorProveedor
                        })
                        .ToList();

                    if (respuestasCriterios.Any())
                    {
                        _context.RespuestasCriteriosLicitacion.AddRange(respuestasCriterios);
                        await _context.SaveChangesAsync();
                    }
                }

                return CreatedAtAction(nameof(GetPropuesta), new { id = propuesta.PropuestaID }, new 
                { 
                    message = "Propuesta creada exitosamente", 
                    propuestaId = propuesta.PropuestaID,
                    propuestaID = propuesta.PropuestaID,
                    PropuestaID = propuesta.PropuestaID
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear la propuesta");
                return StatusCode(500, new { message = "Error al crear la propuesta" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePropuesta(int id, [FromBody] UpdatePropuestaDto updateDto)
        {
            try
            {
                var propuesta = await _context.Propuestas
                    .FirstOrDefaultAsync(p => p.PropuestaID == id && !p.Eliminado);

                if (propuesta == null)
                {
                    return NotFound(new { message = "Propuesta no encontrada" });
                }

                if (updateDto.EstadoPropuestaID.HasValue)
                {
                    propuesta.EstadoPropuestaID = updateDto.EstadoPropuestaID.Value;
                }

                if (!string.IsNullOrEmpty(updateDto.Descripcion))
                {
                    propuesta.Descripcion = updateDto.Descripcion;
                }

                if (updateDto.PresupuestoOfrecido.HasValue)
                {
                    propuesta.PresupuestoOfrecido = updateDto.PresupuestoOfrecido.Value;
                }

                if (updateDto.FechaEntrega.HasValue)
                {
                    propuesta.FechaEntrega = updateDto.FechaEntrega.Value;
                }

                if (updateDto.CumpleRequisitos.HasValue)
                {
                    propuesta.CumpleRequisitos = updateDto.CumpleRequisitos.Value;
                }

                if (updateDto.CalificacionFinal.HasValue)
                {
                    propuesta.CalificacionFinal = updateDto.CalificacionFinal.Value;
                }

                // Actualizar respuestas a criterios si se proporcionan
                if (updateDto.RespuestasCriterios != null)
                {
                    // Eliminar respuestas existentes
                    var respuestasExistentes = await _context.RespuestasCriteriosLicitacion
                        .Where(r => r.PropuestaID == id)
                        .ToListAsync();

                    if (respuestasExistentes.Any())
                    {
                        _context.RespuestasCriteriosLicitacion.RemoveRange(respuestasExistentes);
                    }

                    // Agregar nuevas respuestas
                    var nuevasRespuestas = updateDto.RespuestasCriterios
                        .Where(r => !string.IsNullOrWhiteSpace(r.ValorProveedor))
                        .Select(r => new RespuestaCriterioLicitacion
                        {
                            PropuestaID = id,
                            CriterioID = r.CriterioID,
                            ValorProveedor = r.ValorProveedor
                        })
                        .ToList();

                    if (nuevasRespuestas.Any())
                    {
                        _context.RespuestasCriteriosLicitacion.AddRange(nuevasRespuestas);
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Propuesta actualizada exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar la propuesta con ID {PropuestaId}", id);
                return StatusCode(500, new { message = "Error al actualizar la propuesta" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePropuesta(int id)
        {
            try
            {
                var propuesta = await _context.Propuestas
                    .FirstOrDefaultAsync(p => p.PropuestaID == id && !p.Eliminado);

                if (propuesta == null)
                {
                    return NotFound(new { message = "Propuesta no encontrada" });
                }

                propuesta.Eliminado = true;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Propuesta eliminada exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar la propuesta con ID {PropuestaId}", id);
                return StatusCode(500, new { message = "Error al eliminar la propuesta" });
            }
        }
    }

    public class CreatePropuestaDto
    {
        public int LicitacionID { get; set; }
        public int ProveedorID { get; set; }
        public string? Descripcion { get; set; }
        public decimal PresupuestoOfrecido { get; set; }
        public DateTime? FechaEntrega { get; set; }
        public bool? CumpleRequisitos { get; set; } = true;
        public List<RespuestaCriterioDto>? RespuestasCriterios { get; set; }
    }

    public class RespuestaCriterioDto
    {
        public int CriterioID { get; set; }
        public string? ValorProveedor { get; set; }
    }

    public class UpdatePropuestaDto
    {
        public int? EstadoPropuestaID { get; set; }
        public string? Descripcion { get; set; }
        public decimal? PresupuestoOfrecido { get; set; }
        public DateTime? FechaEntrega { get; set; }
        public bool? CumpleRequisitos { get; set; }
        public decimal? CalificacionFinal { get; set; }
        public List<RespuestaCriterioDto>? RespuestasCriterios { get; set; }
    }
}
