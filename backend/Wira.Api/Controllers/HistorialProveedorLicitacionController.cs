using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wira.Api.Data;
using Wira.Api.Models;
using Wira.Api.Services;
using System.ComponentModel.DataAnnotations;

namespace Wira.Api.Controllers
{
    [ApiController]
    [Route("api/historial-proveedor-licitacion")]
    public class HistorialProveedorLicitacionController : ControllerBase
    {
        private readonly WiraDbContext _context;
        private readonly ILogger<HistorialProveedorLicitacionController> _logger;
        private readonly INotificacionService _notificacionService;

        public HistorialProveedorLicitacionController(
            WiraDbContext context,
            ILogger<HistorialProveedorLicitacionController> logger,
            INotificacionService notificacionService)
        {
            _context = context;
            _logger = logger;
            _notificacionService = notificacionService;
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
                        h.FechaGanador,
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
                        h.FechaGanador,
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
                var proveedor = await _context.Empresas
                    .FirstOrDefaultAsync(p => p.EmpresaID == request.ProveedorID && p.TipoEmpresa == EmpresaTipos.Proveedor && p.Activo);
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
                    var esNuevoGanador = historialExistente.Ganador != true && request.Ganador == true;

                    historialExistente.Resultado = request.Resultado;
                    historialExistente.Ganador = request.Ganador;
                    historialExistente.Observaciones = request.Observaciones;
                    historialExistente.FechaParticipacion = DateTime.Now;

                    if (esNuevoGanador)
                    {
                        historialExistente.FechaGanador = DateTime.Now;
                    }
                    else if (request.Ganador != true)
                    {
                        historialExistente.FechaGanador = null;
                    }

                    await _context.SaveChangesAsync();

                    // Enviar notificación solo si se está marcando como ganador por primera vez
                    if (esNuevoGanador)
                    {
                        try
                        {
                            await _notificacionService.CrearNotificacionGanadorSeleccionado(
                                licitacion.LicitacionID,
                                licitacion.Titulo,
                                proveedor.EmpresaID,
                                proveedor.Nombre,
                                licitacion.MineraID
                            );
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error al enviar notificación de ganador seleccionado");
                            // No fallar la operación principal por error en notificación
                        }
                    }

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
                        historialExistente.FechaGanador,
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
                        FechaParticipacion = DateTime.Now,
                        FechaGanador = request.Ganador == true ? DateTime.Now : null
                    };

                    _context.HistorialProveedorLicitacion.Add(nuevoHistorial);
                    await _context.SaveChangesAsync();

                    // Enviar notificación si se está marcando como ganador
                    if (request.Ganador == true)
                    {
                        try
                        {
                            await _notificacionService.CrearNotificacionGanadorSeleccionado(
                                licitacion.LicitacionID,
                                licitacion.Titulo,
                                proveedor.EmpresaID,
                                proveedor.Nombre,
                                licitacion.MineraID
                            );
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error al enviar notificación de ganador seleccionado");
                            // No fallar la operación principal por error en notificación
                        }
                    }

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
                        nuevoHistorial.FechaGanador,
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
                        h.FechaGanador,
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
                        h.FechaGanador,
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

        [HttpGet("licitacion/{licitacionId}/ganador")]
        public async Task<ActionResult<object>> GetGanadorByLicitacion(int licitacionId)
        {
            try
            {
                var ganador = await _context.HistorialProveedorLicitacion
                    .Include(h => h.Proveedor)
                    .Include(h => h.Licitacion)
                    .Where(h => h.LicitacionID == licitacionId && h.Ganador == true)
                    .Select(h => new
                    {
                        h.HistorialID,
                        h.ProveedorID,
                        h.LicitacionID,
                        h.Resultado,
                        h.Ganador,
                        h.Observaciones,
                        h.FechaParticipacion,
                        h.FechaGanador,
                        ProveedorNombre = h.Proveedor.Nombre,
                        LicitacionTitulo = h.Licitacion.Titulo
                    })
                    .FirstOrDefaultAsync();

                if (ganador == null)
                {
                    return NotFound(new { message = "No se encontró un ganador para esta licitación" });
                }

                return Ok(ganador);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener ganador por licitación: {LicitacionId}", licitacionId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("licitacion/{licitacionId}/propuesta-ganadora")]
        public async Task<ActionResult<object>> GetPropuestaGanadoraByLicitacion(int licitacionId)
        {
            try
            {
                // Primero obtenemos el historial del ganador
                var historialGanador = await _context.HistorialProveedorLicitacion
                    .Where(h => h.LicitacionID == licitacionId && h.Ganador == true)
                    .FirstOrDefaultAsync();

                if (historialGanador == null)
                {
                    return NotFound(new { message = "No se encontró un ganador para esta licitación" });
                }

                // Luego obtenemos la propuesta completa del proveedor ganador
                var propuestaGanadora = await _context.Propuestas
                    .Include(p => p.Proveedor)
                    .Include(p => p.EstadoPropuesta)
                    .Include(p => p.Moneda)
                    .Include(p => p.RespuestasCriterios)
                        .ThenInclude(rc => rc.Criterio)
                    .Where(p => p.LicitacionID == licitacionId && p.ProveedorID == historialGanador.ProveedorID)
                    .Select(p => new
                    {
                        p.PropuestaID,
                        p.LicitacionID,
                        p.ProveedorID,
                        ProveedorNombre = p.Proveedor.Nombre,
                        p.FechaEnvio,
                        p.FechaEntrega,
                        p.PresupuestoOfrecido,
                        p.MonedaID,
                        MonedaCodigo = p.Moneda.Codigo,
                        MonedaNombre = p.Moneda.Nombre,
                        MonedaSimbolo = p.Moneda.Simbolo,
                        p.Descripcion,
                        p.CumpleRequisitos,
                        p.CalificacionFinal,
                        EstadoNombre = p.EstadoPropuesta.NombreEstado,
                        RespuestasCriterios = p.RespuestasCriterios.Select(rc => new
                        {
                            rc.RespuestaID,
                            rc.CriterioID,
                            CriterioNombre = rc.Criterio.Nombre,
                            CriterioDescripcion = rc.Criterio.Descripcion,
                            rc.ValorProveedor
                        }).ToList(),
                        // Información del historial
                        HistorialGanador = new
                        {
                            historialGanador.HistorialID,
                            historialGanador.Resultado,
                            historialGanador.Observaciones,
                            historialGanador.FechaParticipacion,
                            historialGanador.FechaGanador
                        }
                    })
                    .FirstOrDefaultAsync();

                if (propuestaGanadora == null)
                {
                    return NotFound(new { message = "No se encontró la propuesta del ganador" });
                }

                return Ok(propuestaGanadora);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener propuesta ganadora por licitación: {LicitacionId}", licitacionId);
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

        public bool? Ganador { get; set; } = null;

        public string? Observaciones { get; set; }
    }
}
