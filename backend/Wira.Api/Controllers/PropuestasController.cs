using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using Wira.Api.Data;
using Wira.Api.Models;
using Wira.Api.Services;
using Wira.Api.Services.Interfaces;

namespace Wira.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropuestasController : ControllerBase
    {
        private readonly WiraDbContext _context;
        private readonly ILogger<PropuestasController> _logger;
        private readonly INotificacionService _notificacionService;
        private readonly IPropuestaEvaluacionService _evaluacionService;

        public PropuestasController(
            WiraDbContext context,
            ILogger<PropuestasController> logger,
            INotificacionService notificacionService,
            IPropuestaEvaluacionService evaluacionService)
        {
            _context = context;
            _logger = logger;
            _notificacionService = notificacionService;
            _evaluacionService = evaluacionService;
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
                    .Include(p => p.Licitacion)
                        .ThenInclude(l => l.EstadoLicitacion)
                    .Include(p => p.Proveedor)
                    .Include(p => p.EstadoPropuesta)
                    .Include(p => p.Moneda)
                    .Include(p => p.ArchivosAdjuntos)
                    .Select(p => new
                    {
                        p.PropuestaID,
                        p.LicitacionID,
                        p.ProveedorID,
                        p.MonedaID,
                        p.FechaEnvio,
                        p.EstadoPropuestaID,
                        p.Descripcion,
                        p.PresupuestoOfrecido,
                        p.FechaEntrega,
                        p.CumpleRequisitos,
                        p.CalificacionFinal,
                        MonedaCodigo = p.Moneda.Codigo,
                        MonedaNombre = p.Moneda.Nombre,
                        MonedaSimbolo = p.Moneda.Simbolo,
                        EstadoNombre = p.EstadoPropuesta.NombreEstado,
                        LicitacionTitulo = p.Licitacion.Titulo,
                        MineraNombre = p.Licitacion.Minera.Nombre,
                        LicitacionEstadoNombre = p.Licitacion.EstadoLicitacion.NombreEstado,
                        LicitacionEliminada = p.Licitacion.Eliminado,
                        ProveedorNombre = p.Proveedor.Nombre,
                        ArchivosAdjuntos = p.ArchivosAdjuntos
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
                    .Include(p => p.Licitacion)
                        .ThenInclude(l => l.EstadoLicitacion)
                    .Include(p => p.Licitacion)
                        .ThenInclude(l => l.CriteriosLicitacion)
                            .ThenInclude(c => c.Opciones)
                    .Include(p => p.Proveedor)
                    .Include(p => p.EstadoPropuesta)
                    .Include(p => p.Moneda)
                    .Include(p => p.ArchivosAdjuntos)
                    .Include(p => p.RespuestasCriterios)
                        .ThenInclude(r => r.Criterio)
                    .Include(p => p.RespuestasCriterios)
                        .ThenInclude(r => r.OpcionSeleccionada)
                    .FirstOrDefaultAsync();

                if (propuesta == null)
                {
                    return NotFound(new { message = "Propuesta no encontrada" });
                }

                var criterios = propuesta.Licitacion?.CriteriosLicitacion?.ToList() ?? new List<CriterioLicitacion>();
                var stats = _evaluacionService.ConstruirEstadisticasNumericas(new[] { propuesta });
                var evaluacion = _evaluacionService.CalcularPuntaje(propuesta, criterios, stats);

                var respuestasCriterios = (propuesta.RespuestasCriterios ?? new List<RespuestaCriterioLicitacion>())
                    .Select(r => new
                    {
                        r.RespuestaID,
                        r.CriterioID,
                        r.ValorProveedor,
                        CriterioNombre = r.Criterio?.Nombre,
                        CriterioDescripcion = r.Criterio?.Descripcion,
                        CriterioPeso = r.Criterio?.Peso,
                        CriterioMayorMejor = r.Criterio?.MayorMejor
                    })
                    .ToList();

                var licitacion = propuesta.Licitacion;
                var minera = licitacion?.Minera;
                var moneda = propuesta.Moneda;
                var estadoPropuesta = propuesta.EstadoPropuesta;
                var proveedor = propuesta.Proveedor;
                var archivosAdjuntos = propuesta.ArchivosAdjuntos ?? new List<ArchivoAdjunto>();

                var result = new
                {
                    propuesta.PropuestaID,
                    propuesta.LicitacionID,
                    propuesta.ProveedorID,
                    propuesta.MonedaID,
                    propuesta.FechaEnvio,
                    propuesta.EstadoPropuestaID,
                    propuesta.Descripcion,
                    propuesta.PresupuestoOfrecido,
                    propuesta.FechaEntrega,
                    propuesta.CumpleRequisitos,
                    propuesta.CalificacionFinal,
                    MonedaCodigo = moneda?.Codigo,
                    MonedaNombre = moneda?.Nombre,
                    MonedaSimbolo = moneda?.Simbolo,
                    EstadoNombre = estadoPropuesta?.NombreEstado,
                    LicitacionTitulo = licitacion?.Titulo,
                    MineraNombre = minera?.Nombre,
                    LicitacionEstadoNombre = licitacion?.EstadoLicitacion?.NombreEstado,
                    LicitacionEliminada = licitacion?.Eliminado,
                    ProveedorNombre = proveedor?.Nombre,
                    ArchivosAdjuntos = archivosAdjuntos
                        .Select(a => new { a.ArchivoID, a.NombreArchivo, a.RutaArchivo })
                        .ToList(),
                    RespuestasCriterios = respuestasCriterios,
                    ScoreCalculado = evaluacion.PuntajeNormalizado,
                    PuntajesPorCriterio = evaluacion.PuntajesPorCriterio,
                    DescalificadaPorExcluyentes = evaluacion.ExcluidaPorCriterios,
                    CriteriosExcluyentesFallidos = evaluacion.CriteriosExcluyentesFallidos
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
                    .Include(p => p.Licitacion)
                        .ThenInclude(l => l.EstadoLicitacion)
                    .Include(p => p.EstadoPropuesta)
                    .Include(p => p.Moneda)
                    .Include(p => p.ArchivosAdjuntos)
                    .Select(p => new
                    {
                        p.PropuestaID,
                        p.LicitacionID,
                        p.ProveedorID,
                        p.MonedaID,
                        p.FechaEnvio,
                        p.EstadoPropuestaID,
                        p.Descripcion,
                        p.PresupuestoOfrecido,
                        p.FechaEntrega,
                        p.CumpleRequisitos,
                        p.CalificacionFinal,
                        MonedaCodigo = p.Moneda.Codigo,
                        MonedaNombre = p.Moneda.Nombre,
                        MonedaSimbolo = p.Moneda.Simbolo,
                        EstadoNombre = p.EstadoPropuesta.NombreEstado,
                        LicitacionTitulo = p.Licitacion.Titulo,
                        LicitacionEstadoNombre = p.Licitacion.EstadoLicitacion.NombreEstado,
                        LicitacionEliminada = p.Licitacion.Eliminado,
                        MineraNombre = p.Licitacion.Minera.Nombre,
                        ArchivosAdjuntos = p.ArchivosAdjuntos
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
                var licitacion = await _context.Licitaciones
                    .Where(l => l.LicitacionID == licitacionId && !l.Eliminado)
                    .Include(l => l.CriteriosLicitacion)
                        .ThenInclude(c => c.Opciones)
                    .FirstOrDefaultAsync();

                if (licitacion == null)
                {
                    return NotFound(new { message = "Licitación no encontrada" });
                }

                var criterios = licitacion.CriteriosLicitacion?.ToList() ?? new List<CriterioLicitacion>();

                var propuestas = await _context.Propuestas
                    .Where(p => p.LicitacionID == licitacionId && !p.Eliminado)
                    .Include(p => p.Proveedor)
                    .Include(p => p.EstadoPropuesta)
                    .Include(p => p.Moneda)
                    .Include(p => p.ArchivosAdjuntos)
                    .Include(p => p.RespuestasCriterios)
                        .ThenInclude(r => r.OpcionSeleccionada)
                    .ToListAsync();

                var numericStats = _evaluacionService.ConstruirEstadisticasNumericas(propuestas);

                var result = propuestas
                    .Select(p =>
                    {
                        var evaluacion = _evaluacionService.CalcularPuntaje(p, criterios, numericStats);
                        return new
                        {
                            p.PropuestaID,
                            p.LicitacionID,
                            p.ProveedorID,
                            p.MonedaID,
                            p.FechaEnvio,
                            p.EstadoPropuestaID,
                            p.Descripcion,
                            p.PresupuestoOfrecido,
                            p.FechaEntrega,
                            p.CumpleRequisitos,
                            p.CalificacionFinal,
                            MonedaCodigo = p.Moneda.Codigo,
                            MonedaNombre = p.Moneda.Nombre,
                            MonedaSimbolo = p.Moneda.Simbolo,
                            EstadoNombre = p.EstadoPropuesta.NombreEstado,
                            ProveedorNombre = p.Proveedor.Nombre,
                            ArchivosAdjuntos = p.ArchivosAdjuntos
                                .Select(a => new { a.ArchivoID, a.NombreArchivo, a.RutaArchivo })
                                .ToList(),
                            ScoreCalculado = evaluacion.PuntajeNormalizado,
                            PuntajesPorCriterio = evaluacion.PuntajesPorCriterio,
                            DescalificadaPorExcluyentes = evaluacion.ExcluidaPorCriterios,
                            CriteriosExcluyentesFallidos = evaluacion.CriteriosExcluyentesFallidos
                        };
                    })
                    .OrderByDescending(p => p.FechaEnvio)
                    .ToList();

                return Ok(result);
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

                var moneda = await _context.Monedas
                    .FirstOrDefaultAsync(m => m.MonedaID == createDto.MonedaID && m.Activo);

                if (moneda == null)
                {
                    return BadRequest(new { message = "La moneda seleccionada no existe o está inactiva" });
                }

                // Verificar que el proveedor existe
                var proveedor = await _context.Empresas
                    .FirstOrDefaultAsync(p => p.EmpresaID == createDto.ProveedorID && p.TipoEmpresa == EmpresaTipos.Proveedor && p.Activo);

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
                    FechaEnvio = DateTime.UtcNow,
                    EstadoPropuestaID = 1, // Estado inicial - "Enviada"
                    Descripcion = createDto.Descripcion,
                    PresupuestoOfrecido = createDto.PresupuestoOfrecido,
                    MonedaID = createDto.MonedaID,
                    FechaEntrega = createDto.FechaEntrega,
                    CumpleRequisitos = createDto.CumpleRequisitos ?? true
                };

                _context.Propuestas.Add(propuesta);
                await _context.SaveChangesAsync();

                // Guardar respuestas a los criterios si existen
                if (createDto.RespuestasCriterios != null && createDto.RespuestasCriterios.Any())
                {
                    var criterioIds = createDto.RespuestasCriterios.Select(r => r.CriterioID).Distinct().ToList();
                    var criteriosMap = await _context.CriteriosLicitacion
                        .Where(c => criterioIds.Contains(c.CriterioID))
                        .ToDictionaryAsync(c => c.CriterioID);

                    var respuestas = new List<RespuestaCriterioLicitacion>();

                    foreach (var rDto in createDto.RespuestasCriterios)
                    {
                        criteriosMap.TryGetValue(rDto.CriterioID, out var criterio);

                        var respuesta = new RespuestaCriterioLicitacion
                        {
                            PropuestaID = propuesta.PropuestaID,
                            CriterioID = rDto.CriterioID
                        };

                        var valor = rDto.ValorProveedor?.Trim();

                        if (criterio == null)
                        {
                            respuesta.ValorProveedor = valor;
                            respuestas.Add(respuesta);
                            continue;
                        }

                        switch (criterio.Tipo)
                        {
                            case TipoCriterio.Numerico:
                                if (!string.IsNullOrWhiteSpace(valor))
                                {
                                    if (decimal.TryParse(valor, System.Globalization.NumberStyles.Number, System.Globalization.CultureInfo.InvariantCulture, out var parsedInvariant))
                                    {
                                        respuesta.ValorNumerico = parsedInvariant;
                                    }
                                    else if (decimal.TryParse(valor, System.Globalization.NumberStyles.Number, new System.Globalization.CultureInfo("es-AR"), out var parsedEs))
                                    {
                                        respuesta.ValorNumerico = parsedEs;
                                    }
                                    else
                                    {
                                        respuesta.ValorProveedor = valor;
                                    }
                                }
                                break;

                            case TipoCriterio.Booleano:
                                if (!string.IsNullOrWhiteSpace(valor))
                                {
                                    var normalized = valor.ToLowerInvariant();
                                    if (normalized == "true" || normalized == "1" || normalized == "si" || normalized == "sí") respuesta.ValorBooleano = true;
                                    else if (normalized == "false" || normalized == "0" || normalized == "no") respuesta.ValorBooleano = false;
                                    else respuesta.ValorProveedor = valor;
                                }
                                break;

                            case TipoCriterio.Escala:
                                if (!string.IsNullOrWhiteSpace(valor) && int.TryParse(valor, out var opcionId))
                                {
                                    var opcion = criterio.Opciones?.FirstOrDefault(o => o.OpcionID == opcionId);
                                    if (opcion != null)
                                    {
                                        respuesta.CriterioOpcionID = opcionId;
                                    }
                                    else
                                    {
                                        respuesta.ValorProveedor = valor;
                                    }
                                }
                                else
                                {
                                    if (!string.IsNullOrWhiteSpace(valor) && criterio.Opciones != null)
                                    {
                                        var match = criterio.Opciones.FirstOrDefault(o => string.Equals(o.Valor, valor, System.StringComparison.OrdinalIgnoreCase) || string.Equals(o.Descripcion, valor, System.StringComparison.OrdinalIgnoreCase));
                                        if (match != null)
                                        {
                                            respuesta.CriterioOpcionID = match.OpcionID;
                                        }
                                        else
                                        {
                                            respuesta.ValorProveedor = valor;
                                        }
                                    }
                                }
                                break;

                            default:
                                respuesta.ValorProveedor = valor;
                                break;
                        }

                        respuestas.Add(respuesta);
                    }

                    if (respuestas.Any())
                    {
                        _context.RespuestasCriteriosLicitacion.AddRange(respuestas);
                        await _context.SaveChangesAsync();
                    }
                }

                // Crear notificación para la minera
                try
                {
                    await _notificacionService.CrearNotificacionNuevaPropuesta(
                        propuesta.LicitacionID,
                        licitacion.Titulo,
                        propuesta.PropuestaID,
                        proveedor.Nombre,
                        licitacion.MineraID
                    );
                }
                catch (Exception notifEx)
                {
                    _logger.LogError(notifEx, "Error al enviar notificación, pero propuesta creada exitosamente");
                    // No fallar la operación principal por error en notificación
                }

                var response = new
                {
                    message = "Propuesta creada exitosamente",
                    PropuestaID = propuesta.PropuestaID
                };

                var location = Url.Action(nameof(GetPropuesta), new { id = propuesta.PropuestaID });
                return Created(location ?? $"/api/propuestas/{propuesta.PropuestaID}", response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear la propuesta");
                return StatusCode(500, new
                {
                    message = "Error al crear la propuesta",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message
                });
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

                if (updateDto.MonedaID.HasValue)
                {
                    var moneda = await _context.Monedas
                        .FirstOrDefaultAsync(m => m.MonedaID == updateDto.MonedaID.Value && m.Activo);

                    if (moneda == null)
                    {
                        return BadRequest(new { message = "La moneda seleccionada no existe o está inactiva" });
                    }

                    propuesta.MonedaID = updateDto.MonedaID.Value;
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

                    // Cargar criterios involucrados para conocer su tipo
                    var criterioIds = updateDto.RespuestasCriterios.Select(r => r.CriterioID).Distinct().ToList();
                    var criteriosMap = await _context.CriteriosLicitacion
                        .Where(c => criterioIds.Contains(c.CriterioID))
                        .ToDictionaryAsync(c => c.CriterioID);

                    var nuevasRespuestas = new List<RespuestaCriterioLicitacion>();

                    foreach (var rDto in updateDto.RespuestasCriterios)
                    {
                        criteriosMap.TryGetValue(rDto.CriterioID, out var criterio);

                        // Normalizar según tipo de criterio
                        var respuesta = new RespuestaCriterioLicitacion
                        {
                            PropuestaID = id,
                            CriterioID = rDto.CriterioID
                        };

                        var valor = rDto.ValorProveedor?.Trim();

                        if (criterio == null)
                        {
                            // Si no encontramos el criterio, guardar como texto por compatibilidad
                            respuesta.ValorProveedor = valor;
                            nuevasRespuestas.Add(respuesta);
                            continue;
                        }

                        switch (criterio.Tipo)
                        {
                            case TipoCriterio.Numerico:
                                // Intentar parsear número (acepta formatos locales)
                                if (!string.IsNullOrWhiteSpace(valor))
                                {
                                    if (decimal.TryParse(valor, System.Globalization.NumberStyles.Number, System.Globalization.CultureInfo.InvariantCulture, out var parsedInvariant))
                                    {
                                        respuesta.ValorNumerico = parsedInvariant;
                                    }
                                    else if (decimal.TryParse(valor, System.Globalization.NumberStyles.Number, new System.Globalization.CultureInfo("es-AR"), out var parsedEs))
                                    {
                                        respuesta.ValorNumerico = parsedEs;
                                    }
                                    else
                                    {
                                        // Fallback: no parseable numeric -> guardar en ValorProveedor para historial
                                        respuesta.ValorProveedor = valor;
                                    }
                                }
                                break;

                            case TipoCriterio.Booleano:
                                if (!string.IsNullOrWhiteSpace(valor))
                                {
                                    var normalized = valor.ToLowerInvariant();
                                    if (normalized == "true" || normalized == "1" || normalized == "si" || normalized == "sí") respuesta.ValorBooleano = true;
                                    else if (normalized == "false" || normalized == "0" || normalized == "no") respuesta.ValorBooleano = false;
                                    else respuesta.ValorProveedor = valor; // non-parseable -> keep raw
                                }
                                break;

                            case TipoCriterio.Escala:
                                // Si se envió un id de opción (número) en el texto, intentar parsearlo
                                if (!string.IsNullOrWhiteSpace(valor) && int.TryParse(valor, out var opcionId))
                                {
                                    // Verificar que la opción pertenezca al criterio
                                    var opcion = criterio.Opciones?.FirstOrDefault(o => o.OpcionID == opcionId);
                                    if (opcion != null)
                                    {
                                        respuesta.CriterioOpcionID = opcionId;
                                    }
                                    else
                                    {
                                        respuesta.ValorProveedor = valor;
                                    }
                                }
                                else
                                {
                                    // Buscar por texto en opciones
                                    if (!string.IsNullOrWhiteSpace(valor) && criterio.Opciones != null)
                                    {
                                        var match = criterio.Opciones.FirstOrDefault(o => string.Equals(o.Valor, valor, System.StringComparison.OrdinalIgnoreCase) || string.Equals(o.Descripcion, valor, System.StringComparison.OrdinalIgnoreCase));
                                        if (match != null)
                                        {
                                            respuesta.CriterioOpcionID = match.OpcionID;
                                        }
                                        else
                                        {
                                            respuesta.ValorProveedor = valor;
                                        }
                                    }
                                }
                                break;

                            default:
                                // Descriptivo u otros: guardar texto
                                respuesta.ValorProveedor = valor;
                                break;
                        }

                        nuevasRespuestas.Add(respuesta);
                    }

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
        [Required]
        public int MonedaID { get; set; }
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
        public int? MonedaID { get; set; }
        public DateTime? FechaEntrega { get; set; }
        public bool? CumpleRequisitos { get; set; }
        public decimal? CalificacionFinal { get; set; }
        public List<RespuestaCriterioDto>? RespuestasCriterios { get; set; }
    }
}
